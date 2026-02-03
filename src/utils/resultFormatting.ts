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
 * Check if a player ID represents a walkover (missing player)
 * Negative IDs indicate walkovers: -1 is standard, but other negative values
 * like -200 are also used in some tournaments
 */
export function isWalkoverPlayer(playerId: number): boolean {
  return playerId < 0;
}

/**
 * Check if a club/organization ID represents a walkover (missing team)
 * Negative IDs like -100 indicate walkovers
 */
export function isWalkoverClub(clubId: number): boolean {
  return clubId < 0;
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
 * Check if a match has walkover conditions
 * @param homeId Home player/team ID
 * @param awayId Away player/team ID
 * @param result Game result (optional, for team tournaments)
 * @returns true if either player is missing or result indicates W.O
 */
export function isWalkover(homeId: number, awayId: number, result?: number): boolean {
  return isWalkoverPlayer(homeId) || isWalkoverPlayer(awayId) || (result !== undefined && isWalkoverResult(result));
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

  // Check if walkover is indicated by player IDs (negative IDs)
  const hasWalkoverPlayer = (whiteId !== undefined && isWalkoverPlayer(whiteId)) ||
                            (blackId !== undefined && isWalkoverPlayer(blackId));

  // If we detected walkover via player IDs and result is countable, append w.o
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

  const hasWalkover = (homeId !== undefined && isWalkoverPlayer(homeId)) ||
                      (awayId !== undefined && isWalkoverPlayer(awayId));

  const resultStr = `${homeResult} - ${awayResult}`;
  return hasWalkover ? `${resultStr} w.o` : resultStr;
}
