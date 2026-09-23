/**
 * Derive a trustworthy tournament/group lifecycle status.
 *
 * The schack.se API used to expose a `TournamentDto.state` field, but
 * organizers frequently left it stale — events that finished months ago were
 * still marked `REGISTRATION` — and SSF dropped it entirely in September 2026.
 * These helpers derive status primarily from dates (and round-results
 * existence), treating `state` only as a weak hint when a caller still holds
 * an older cached payload that carries one.
 */
import type { TournamentDto, TournamentStatus, TournamentStatusSource } from '../types/tournament';
/**
 * Derive the lifecycle status of a tournament or group.
 *
 * This is the only reliable way to get a status: SSF no longer returns
 * `TournamentDto.state`, and while it did, organizers frequently left it stale
 * (e.g. finished events still marked `REGISTRATION`).
 *
 * Pass the raw objects you already hold:
 * - a bare `TournamentDto` (the common list case), or
 * - a `{ tournament?, group?, roundResults? }` bag — provide a `tournament`
 *   and/or a `group`, and add `roundResults` if you've already fetched them.
 *
 * Derivation is date-first: a past end date means `finished` regardless of
 * `state`; a non-empty `roundResults` array proves the event has started;
 * `state` is consulted only as a weak in-window hint or when no dates exist.
 * Group dates take precedence over tournament dates.
 *
 * @param source - A `TournamentDto` or a {@link TournamentStatusSource} bag.
 * @param now - Reference "now" (injectable for tests/SSR). Defaults to `new Date()`.
 * @returns The derived {@link TournamentStatus}; `'unknown'` if nothing usable was supplied.
 *
 * @example
 * // List item — just pass the tournament:
 * getTournamentStatus(tournament);
 *
 * @example
 * // Group detail — pass the group, the tournament (for its dates), and the
 * // results you already fetched:
 * getTournamentStatus({ tournament, group, roundResults });
 */
export declare function getTournamentStatus(source: TournamentDto | TournamentStatusSource, now?: Date): TournamentStatus;
/** True if the tournament/group has not started yet. See {@link getTournamentStatus}. */
export declare function isUpcoming(source: TournamentDto | TournamentStatusSource, now?: Date): boolean;
/** True if the tournament/group has started but not finished. See {@link getTournamentStatus}. */
export declare function isOngoing(source: TournamentDto | TournamentStatusSource, now?: Date): boolean;
/** True if the tournament/group is past its end date. See {@link getTournamentStatus}. */
export declare function isFinished(source: TournamentDto | TournamentStatusSource, now?: Date): boolean;
//# sourceMappingURL=tournamentStatus.d.ts.map