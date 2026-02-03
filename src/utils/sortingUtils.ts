/**
 * Utility functions for sorting tournament and player data
 */

import type { TournamentEndResultDto, TournamentDto } from '../types';

/**
 * Sort TournamentEndResultDto array by placement (best first)
 * @param results - Array of tournament end results
 * @returns Sorted array with best placements first
 */
export function sortTournamentEndResultsByPlace(
  results: TournamentEndResultDto[]
): TournamentEndResultDto[] {
  return [...results].sort((a, b) => {
    // Sort ascending (place 1 first, 2 second, etc.)
    return a.place - b.place;
  });
}

/**
 * Sort TournamentDto array by end date (latest first)
 * @param tournaments - Array of tournaments
 * @returns Sorted array with most recent tournaments first
 */
export function sortTournamentsByDate(
  tournaments: TournamentDto[]
): TournamentDto[] {
  return [...tournaments].sort((a, b) => {
    const dateA = new Date(a.end);
    const dateB = new Date(b.end);

    // Sort descending (latest first)
    return dateB.getTime() - dateA.getTime();
  });
}
