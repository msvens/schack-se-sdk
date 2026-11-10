import { TournamentService } from '../services/tournaments';
import type { ApiResponse, RoundDto, TournamentClassGroupDto, TournamentDto } from '../types';
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
export type TournamentToday = TournamentDto & {
    groupsToday: GroupToday[];
};
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
 * - Grand Prix series (type 7) are returned like any other tournament, but they
 *   have no results and their round dates don't reflect play; the real games are
 *   in the stage tournaments. Filter with `isGrandPrix` if they shouldn't show.
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
export declare function getTournamentsToday(options?: TournamentsTodayOptions): Promise<ApiResponse<TournamentToday[]>>;
//# sourceMappingURL=tournamentsToday.d.ts.map