import { TournamentService } from '../services/tournaments';
import type {
  ApiResponse,
  RoundDto,
  TournamentClassDto,
  TournamentClassGroupDto,
  TournamentDto,
} from '../types';

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

/** A group played today, from {@link getTournamentsToday}. */
export interface GroupToday {
  group: TournamentClassGroupDto;
  /** The group's rounds dated today. Empty means the group matched on its dates alone. */
  rounds: RoundDto[];
}

/** A tournament from {@link getTournamentsToday}, with the groups played today. */
export type TournamentToday = TournamentDto & { groupsToday: GroupToday[] };

/** Local calendar date as `YYYY-MM-DD`. */
function toLocalIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function allGroups(classes: TournamentClassDto[] | undefined): TournamentClassGroupDto[] {
  return (classes ?? []).flatMap(c => [...(c.groups ?? []), ...allGroups(c.subClasses)]);
}

const day = (d: string | null | undefined) => d?.slice(0, 10);

/** True when the group's range covers `today`, or the range is broken (end before start). */
function groupRangeAllows(g: TournamentClassGroupDto, today: string): boolean {
  const start = day(g.start);
  const end = day(g.end);
  if (!start || !end || start > end) return true;
  return start <= today && today <= end;
}

/**
 * The groups of `t` played today, for a tournament whose range already covers today:
 * 1. groups with a round dated today, within the group's range (a broken range
 *    defers to the tournament range); else
 * 2. groups whose own valid range covers today, with no rounds (short events often
 *    have no round dates filled in); else
 * 3. none.
 * Step 2 only applies when step 1 finds nothing, so a league lists only the
 * divisions with a round today.
 */
function groupsPlayedToday(t: TournamentDto, today: string): GroupToday[] {
  const groups = allGroups(t.rootClasses);

  const withRounds = groups
    .filter(g => groupRangeAllows(g, today))
    .map(group => ({
      group,
      rounds: (group.tournamentRounds ?? []).filter(r => day(r.roundDate) === today),
    }))
    .filter(g => g.rounds.length > 0);
  if (withRounds.length > 0) return withRounds;

  return groups
    .filter(g => {
      const start = day(g.start);
      const end = day(g.end);
      return !!start && !!end && start <= today && today <= end;
    })
    .map(group => ({ group, rounds: [] }));
}

/**
 * Tournaments played today (local date).
 *
 * Today must be within the tournament's `start`–`end` range. Then it counts if
 * it starts or ends today, or if a group has a round dated today and today is
 * also within that group's range (a group whose range ends before it starts is
 * checked against the tournament range only). Short events count by their dates
 * alone, since their round dates aren't always filled in for every day; a
 * season-long KM counts only on days it has a round.
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
 * - Round and group dates are set by organizers. Round dates outside the
 *   tournament's or the group's range are ignored, but wrong dates inside both
 *   are reported as played, and a group with a valid but wrong range hides its
 *   real round days.
 *
 * Each tournament carries `groupsToday`: the groups with a round dated today (with
 * those rounds); if none, the groups whose own range covers today (no rounds); if
 * none either, an empty list. A league thus lists only the divisions playing today.
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
): Promise<ApiResponse<TournamentToday[]>> {
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

  const seen = new Set<number>();
  const data: TournamentToday[] = [];
  for (const t of responses.flatMap(r => r.data!)) {
    if (seen.has(t.id)) continue;
    const start = day(t.start);
    const end = day(t.end);
    // Only within the tournament's own range: some round dates are a placeholder
    // schedule that starts when the tournament was created.
    if (!start || !end || start > today || end < today) continue;
    const groupsToday = groupsPlayedToday(t, today);
    const playedToday =
      start === today || end === today || groupsToday.some(g => g.rounds.length > 0);
    if (!playedToday) continue;
    seen.add(t.id);
    data.push({ ...t, groupsToday });
  }

  return { status: 200, data };
}
