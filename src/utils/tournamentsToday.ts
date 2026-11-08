import { TournamentService } from '../services/tournaments';
import type { ApiResponse, TournamentClassDto, TournamentClassGroupDto, TournamentDto } from '../types';

/**
 * How far back the results-updated search looks for tournaments that end today.
 * Three days covers a Friday–Sunday event with no results yet on Sunday. The
 * server's search gets slow with longer windows (about 0.5 s for 3 days, 2 s for
 * 14), and the coming list supplies everything that doesn't end today.
 */
const UPDATED_LOOKBACK_DAYS = 3;

export interface TournamentsTodayOptions {
  /** Limit to one district (and its clubs), as on the underlying endpoints. */
  districtId?: number;
  /** The service to call, e.g. one constructed with a proxy base URL. Defaults to `new TournamentService()`. */
  service?: TournamentService;
}

/** Local calendar date as `YYYY-MM-DD`. */
function toLocalIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function allGroups(classes: TournamentClassDto[] | undefined): TournamentClassGroupDto[] {
  return (classes ?? []).flatMap(c => [...(c.groups ?? []), ...allGroups(c.subClasses)]);
}

/**
 * Tournaments played today (local date).
 *
 * A tournament counts if it starts or ends today, or if today is within its
 * range and any of its groups has a round dated today. Short events count by their dates alone, since their round
 * dates aren't always filled in for every day; a season-long KM counts only on
 * days it has a round.
 *
 * The SSF coming list (`searchComingTournaments`) only returns tournaments that
 * end *after* today, so a tournament disappears from it on its last day, and a
 * one-day tournament is never listed on the day it is played. This helper
 * therefore searches both the coming list and tournaments with results updated
 * in the last {@link UPDATED_LOOKBACK_DAYS} days. Only the tournaments ending
 * today are missing from the coming list; merge by id to add them to a calendar.
 *
 * Limits:
 * - A tournament that ends today and has had no results entered in the last
 *   {@link UPDATED_LOOKBACK_DAYS} days is in neither list, so it can't be found.
 * - Round dates are set by organizers. A long tournament whose round dates are
 *   wrong or are a placeholder schedule is reported on those dates (round dates
 *   outside the tournament's own range are ignored).
 *
 * The result is deduplicated by id and keeps the coming list's order, followed
 * by those found only in the results list. If either search fails, its error is
 * returned rather than a partial list.
 *
 * @example
 * const playing = await getTournamentsToday();
 * // One district, behind a proxy:
 * const local = await getTournamentsToday({ districtId: 9, service: new TournamentService('/api/chess/v1') });
 */
export async function getTournamentsToday(
  options: TournamentsTodayOptions = {}
): Promise<ApiResponse<TournamentDto[]>> {
  const { districtId } = options;
  const service = options.service ?? new TournamentService();

  const now = new Date();
  const today = toLocalIsoDate(now);
  const from = new Date(now);
  from.setDate(from.getDate() - UPDATED_LOOKBACK_DAYS);

  const responses = await Promise.all([
    service.searchComingTournaments(districtId),
    service.searchUpdatedTournaments(`${toLocalIsoDate(from)}T00:00:00`, `${today}T23:59:59`, districtId),
  ]);
  const failed = responses.find(r => r.status !== 200 || !r.data);
  if (failed) {
    return { status: failed.status, error: failed.error ?? 'Failed to fetch tournaments' };
  }

  const playedToday = (t: TournamentDto) => {
    const start = t.start?.slice(0, 10);
    const end = t.end?.slice(0, 10);
    // Only within the tournament's own range: some round dates are a placeholder
    // schedule that starts when the tournament was created.
    if (!start || !end || start > today || end < today) return false;
    if (start === today || end === today) return true;
    return allGroups(t.rootClasses).some(g =>
      (g.tournamentRounds ?? []).some(r => r.roundDate?.slice(0, 10) === today)
    );
  };
  const seen = new Set<number>();
  const data = responses
    .flatMap(r => r.data!)
    .filter(t => playedToday(t) && !seen.has(t.id) && (seen.add(t.id), true));

  return { status: 200, data };
}
