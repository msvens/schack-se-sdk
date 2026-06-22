/**
 * Derive a trustworthy tournament/group lifecycle status.
 *
 * The schack.se API exposes a `TournamentDto.state` field, but organizers
 * frequently leave it stale — events that finished months ago are still
 * marked `REGISTRATION`. These helpers derive status primarily from dates
 * (and round-results existence), treating `state` only as a weak hint.
 */

import { TournamentState } from '../types/tournament';
import type {
  TournamentDto,
  TournamentStatus,
  TournamentStatusSource,
} from '../types/tournament';
import { parseLocalDate } from './dateUtils';

/**
 * Private normalized shape the core derivation operates on. Not exported —
 * callers pass raw DTOs via {@link TournamentStatusSource} instead.
 */
interface NormalizedStatusInput {
  start?: string | null;
  end?: string | null;
  state?: number | null;
  hasRoundResults?: boolean;
}

/**
 * Core derivation. Date-first: a past end date means `finished` regardless of
 * the (unreliable) `state` field; round results prove the event has started.
 */
function deriveStatus(input: NormalizedStatusInput, now: Date): TournamentStatus {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const toMs = (d?: string | null): number | null => {
    if (!d) return null;
    const parsed = parseLocalDate(d).getTime();
    return Number.isNaN(parsed) ? null : parsed;
  };
  const startMs = toMs(input.start);
  const endMs = toMs(input.end);

  // Results exist → it has started; finished only once past the end date.
  if (input.hasRoundResults) {
    return endMs !== null && todayMs > endMs ? 'finished' : 'ongoing';
  }
  // Past the end date → finished, regardless of the (unreliable) state field.
  if (endMs !== null && todayMs > endMs) return 'finished';
  // Before the start date → upcoming.
  if (startMs !== null && todayMs < startMs) return 'upcoming';
  // Inside the date window: honour an explicit registration state if present.
  if (input.state === TournamentState.REGISTRATION) return 'upcoming';
  if (startMs !== null || endMs !== null) return 'ongoing';
  // No dates at all: fall back to the raw state, else unknown.
  if (input.state === TournamentState.STARTED) return 'ongoing';
  if (input.state === TournamentState.FINISHED) return 'finished';
  return 'unknown';
}

/**
 * Normalize the public input (a bare `TournamentDto`, or a
 * {@link TournamentStatusSource} bag) into the private primitive shape.
 *
 * Group dates take precedence over tournament dates; `state` comes from the
 * tournament (a group DTO has none); "has results" is derived from a non-empty
 * `roundResults` array.
 */
function normalize(source: TournamentDto | TournamentStatusSource): NormalizedStatusInput {
  const isBag =
    source != null &&
    ('tournament' in source || 'group' in source || 'roundResults' in source);
  const bag = isBag
    ? (source as TournamentStatusSource)
    : { tournament: source as TournamentDto };

  const { tournament, group, roundResults } = bag;
  return {
    start: group?.start ?? tournament?.start,
    end: group?.end ?? tournament?.end,
    state: tournament?.state,
    hasRoundResults: (roundResults?.length ?? 0) > 0,
  };
}

/**
 * Derive the lifecycle status of a tournament or group.
 *
 * Prefer this over the raw `TournamentDto.state` field, which organizers
 * frequently leave stale (e.g. finished events still marked `REGISTRATION`).
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
 * // Group detail — pass the group, the tournament (for state), and the
 * // results you already fetched:
 * getTournamentStatus({ tournament, group, roundResults });
 */
export function getTournamentStatus(
  source: TournamentDto | TournamentStatusSource,
  now: Date = new Date()
): TournamentStatus {
  return deriveStatus(normalize(source), now);
}

/** True if the tournament/group has not started yet. See {@link getTournamentStatus}. */
export function isUpcoming(
  source: TournamentDto | TournamentStatusSource,
  now?: Date
): boolean {
  return getTournamentStatus(source, now) === 'upcoming';
}

/** True if the tournament/group has started but not finished. See {@link getTournamentStatus}. */
export function isOngoing(
  source: TournamentDto | TournamentStatusSource,
  now?: Date
): boolean {
  return getTournamentStatus(source, now) === 'ongoing';
}

/** True if the tournament/group is past its end date. See {@link getTournamentStatus}. */
export function isFinished(
  source: TournamentDto | TournamentStatusSource,
  now?: Date
): boolean {
  return getTournamentStatus(source, now) === 'finished';
}
