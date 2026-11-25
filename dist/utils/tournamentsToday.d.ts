import { TournamentService } from '../services/tournaments';
import type { ApiResponse, TournamentDto } from '../types';
import { type GroupToday } from './tournamentPlayDays';
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
export declare function getTournamentsToday(options?: TournamentsTodayOptions): Promise<ApiResponse<TournamentToday[]>>;
//# sourceMappingURL=tournamentsToday.d.ts.map