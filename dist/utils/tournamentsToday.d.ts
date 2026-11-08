import { TournamentService } from '../services/tournaments';
import type { ApiResponse, TournamentDto } from '../types';
export interface TournamentsTodayOptions {
    /** Limit to one district (and its clubs), as on the underlying endpoints. */
    districtId?: number;
    /** The service to call, e.g. one constructed with a proxy base URL. Defaults to `new TournamentService()`. */
    service?: TournamentService;
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
 * - A tournament that ends today and has no results entered yet is in neither
 *   list, so it can't be found.
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
export declare function getTournamentsToday(options?: TournamentsTodayOptions): Promise<ApiResponse<TournamentDto[]>>;
//# sourceMappingURL=tournamentsToday.d.ts.map