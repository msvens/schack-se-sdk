import { type RoundDto, type TournamentClassGroupDto, type TournamentDto } from '../types';
/** A tournament longer than this many days gets start/end markers instead of filling its range. */
export declare const LONG_TOURNAMENT_DAYS = 7;
/** A group played on a day. */
export interface GroupToday {
    group: TournamentClassGroupDto;
    /** The group's rounds dated that day. Empty means the group matched on its dates alone. */
    rounds: RoundDto[];
}
/** One day of a tournament, from {@link getTournamentPlayDays}. */
export interface TournamentPlayDay {
    /** `YYYY-MM-DD`. */
    date: string;
    /**
     * The groups played that day. For a marker, the groups whose range covers it, with
     * no rounds; always empty for a Grand Prix series.
     */
    groups: GroupToday[];
    /**
     * Set when the day is only the tournament's start or end, not a day of play: the
     * start or end of a long tournament with no round that day, or of a Grand Prix series.
     */
    marker?: 'starts' | 'ends';
}
/**
 * The days a tournament is played, with the groups played on each, plus start and
 * end markers. Pure: no date input, no service call. {@link getTournamentsToday}
 * is the coming list filtered by this function for today, so the two always agree.
 *
 * The tournament's `start`–`end` range is the hard limit: nothing outside it is
 * returned, and a tournament with a missing or reversed range returns no days. A
 * group's own range narrows that, unless it is missing, reversed or outside the
 * tournament's range, when the tournament range applies.
 *
 * Play days:
 * - Each day a group has a round dated within its range. Rounds outside it are
 *   ignored (often a placeholder schedule from when the tournament was created,
 *   or a typo).
 * - Each day of a group with no usable round dates, when its range is at most
 *   {@link LONG_TOURNAMENT_DAYS} days.
 * - Every day of a tournament of at most {@link LONG_TOURNAMENT_DAYS} days, since
 *   organizers often date only some rounds of a weekend event. A day with no
 *   dated round lists the groups whose range covers it.
 *
 * A day lists the groups with a round dated that day, plus any group without
 * usable round dates whose (short) range covers it; a league thus lists only the
 * divisions playing that day.
 *
 * Markers: the start and end days of a tournament longer than
 * {@link LONG_TOURNAMENT_DAYS} days that aren't play days get a `starts` or `ends`
 * marker, so a season-long league shows when it begins and finishes even if its
 * first or last round is on another day. A Grand Prix series (type 7) is never
 * played (its round dates don't reflect play; the games are in the stage
 * tournaments) and only gets markers. A one-day series gets `starts` only.
 *
 * Limits: round and group dates are set by organizers, so wrong dates inside both
 * ranges are reported as played, and a group with a valid but wrong range hides
 * its real round days.
 *
 * @returns The days in date order.
 *
 * @example
 * for (const { date, groups, marker } of getTournamentPlayDays(tournament)) { ... }
 */
export declare function getTournamentPlayDays(tournament: TournamentDto): TournamentPlayDay[];
//# sourceMappingURL=tournamentPlayDays.d.ts.map