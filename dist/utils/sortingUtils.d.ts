/**
 * Utility functions for sorting tournament and player data
 */
import type { TournamentEndResultDto, TournamentDto } from '../types';
/**
 * Sort TournamentEndResultDto array by placement (best first)
 * @param results - Array of tournament end results
 * @returns Sorted array with best placements first
 */
export declare function sortTournamentEndResultsByPlace(results: TournamentEndResultDto[]): TournamentEndResultDto[];
/**
 * Sort TournamentDto array by end date (latest first)
 * @param tournaments - Array of tournaments
 * @returns Sorted array with most recent tournaments first
 */
export declare function sortTournamentsByDate(tournaments: TournamentDto[]): TournamentDto[];
//# sourceMappingURL=sortingUtils.d.ts.map