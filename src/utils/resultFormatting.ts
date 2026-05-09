/**
 * Utility functions for formatting tournament results
 */

import {
  isWalkoverResultCode,
  isTouristBye,
  isCountableResult,
  getResultDisplayString
} from './gameResults';

/**
 * What an opponent ID slot represents in a round.
 *
 * - `paired`: a real opponent (positive ID).
 * - `bye`: no opponent assigned for this round (frirond / free round, e.g. odd
 *   number of participants). Encoded as `-100`. A bye is NOT a walkover —
 *   no game was scheduled.
 * - `walkover`: an opponent was scheduled but did not show. Encoded as a
 *   negative ID other than `-100` (typically `-1`, sometimes `-200`).
 */
export type OpponentKind = 'paired' | 'bye' | 'walkover';

/** ID used by the API to indicate "no opponent" / bye / frirond. */
const BYE_ID = -100;

/**
 * Classify an opponent ID (player or club/team) into its slot kind.
 *
 * @param id Opponent ID from a round result (homeId / awayId / whiteId / blackId).
 * @returns The kind of slot this ID represents.
 *
 * @example
 * getOpponentKind(12345)  // 'paired'
 * getOpponentKind(-100)   // 'bye'
 * getOpponentKind(-1)     // 'walkover'
 * getOpponentKind(-200)   // 'walkover'
 */
export function getOpponentKind(id: number): OpponentKind {
  if (id === BYE_ID) return 'bye';
  if (id < 0) return 'walkover';
  return 'paired';
}

/**
 * Check if a game result indicates a walkover
 * Supports all point systems: DEFAULT, SCHACK4AN, POINT310
 * @param result Game result value
 * @returns true if result indicates W.O (walkover)
 */
export function isWalkoverResult(result: number): boolean {
  return isWalkoverResultCode(result);
}

/**
 * Check if a match has walkover conditions.
 *
 * Returns `true` only for actual walkovers — a bye (id `-100`) is NOT a
 * walkover and will return `false`.
 *
 * @param homeId Home player/team ID
 * @param awayId Away player/team ID
 * @param result Game result (optional, for team tournaments)
 * @returns true if either side is a walkover or the result code indicates W.O
 */
export function isWalkover(homeId: number, awayId: number, result?: number): boolean {
  return getOpponentKind(homeId) === 'walkover'
    || getOpponentKind(awayId) === 'walkover'
    || (result !== undefined && isWalkoverResult(result));
}

/**
 * Format a game result from white's perspective
 * Supports all point systems: DEFAULT, SCHACK4AN, POINT310
 * Used in team tournaments where games have result field
 *
 * @param result Game result code
 * @param whiteId White player ID (optional, to check for W.O)
 * @param blackId Black player ID (optional, to check for W.O)
 * @returns Formatted result string
 */
export function formatGameResult(result: number, whiteId?: number, blackId?: number): string {
  // Get the base display string from centralized utility
  const displayString = getResultDisplayString(result);

  // If result code already indicates walkover or tourist bye, return as-is
  if (isWalkoverResultCode(result) || isTouristBye(result)) {
    return displayString;
  }

  // Walkover detection by ID — bye (-100) must not trigger "w.o"
  const hasWalkoverPlayer = (whiteId !== undefined && getOpponentKind(whiteId) === 'walkover')
    || (blackId !== undefined && getOpponentKind(blackId) === 'walkover');

  if (hasWalkoverPlayer && isCountableResult(result)) {
    return `${displayString} w.o`;
  }

  return displayString;
}

/**
 * Format a match result from home team's perspective
 * Used in individual tournaments where results have homeResult/awayResult
 * @param homeResult Home player/team result
 * @param awayResult Away player/team result
 * @param homeId Home player/team ID (optional, to check for W.O)
 * @param awayId Away player/team ID (optional, to check for W.O)
 * @returns Formatted result string
 */
export function formatMatchResult(
  homeResult: number | undefined,
  awayResult: number | undefined,
  homeId?: number,
  awayId?: number
): string {
  if (homeResult === undefined || awayResult === undefined) {
    return '-';
  }

  const hasWalkover = (homeId !== undefined && getOpponentKind(homeId) === 'walkover')
    || (awayId !== undefined && getOpponentKind(awayId) === 'walkover');

  const resultStr = `${homeResult} - ${awayResult}`;
  return hasWalkover ? `${resultStr} w.o` : resultStr;
}