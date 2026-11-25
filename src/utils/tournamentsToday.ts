import { TournamentService } from '../services/tournaments';
import type { ApiResponse, TournamentDto } from '../types';
import { getTournamentPlayDays, type GroupToday } from './tournamentPlayDays';

export interface TournamentsTodayOptions {
  /** Limit to one district (and its clubs), as on the underlying endpoints. */
  districtId?: number;
  /** The service to call, e.g. one constructed with a proxy base URL. Defaults to `new TournamentService()`. */
  service?: TournamentService;
}

/** A tournament from {@link getTournamentsToday}, with the groups played today. */
export type TournamentToday = TournamentDto & {
  groupsToday: GroupToday[];
  /** Set when today is only the tournament's start or end, not a day of play (see {@link getTournamentPlayDays}). */
  marker?: 'starts' | 'ends';
};

/** Local calendar date as `YYYY-MM-DD`. */
function toLocalIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Tournaments played today (local date), plus long tournaments and Grand Prix
 * series that start or end today.
 *
 * This is the SSF coming list (`searchComingTournaments`, every tournament ending
 * today or later) filtered by {@link getTournamentPlayDays} for today, so it
 * agrees with that function for any day a calendar shows. See it for the rules.
 *
 * Each tournament carries `groupsToday`, the groups played today (with today's
 * rounds, or no rounds when they matched on their dates alone), and `marker` when
 * today is only its start or end. `groupsToday` can be empty.
 *
 * The result keeps the coming list's order. If the search fails, its error is
 * returned.
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

  const today = toLocalIsoDate(new Date());

  const coming = await service.searchComingTournaments(districtId);
  if (coming.status !== 200 || !coming.data) {
    return { status: coming.status, error: coming.error ?? 'Failed to fetch tournaments' };
  }

  const data: TournamentToday[] = [];
  for (const t of coming.data) {
    const playDay = getTournamentPlayDays(t).find(d => d.date === today);
    if (!playDay) continue;
    data.push({
      ...t,
      groupsToday: playDay.groups,
      ...(playDay.marker ? { marker: playDay.marker } : {}),
    });
  }

  return { status: 200, data };
}
