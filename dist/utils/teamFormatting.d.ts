/**
 * Utility functions for formatting team names in team tournaments
 */
/**
 * Convert a number to Roman numerals
 * Supports numbers 1-20 which covers typical team counts
 */
export declare function toRomanNumeral(num: number): string;
/**
 * Count how many teams each club has in the results
 * @param results - Array of objects with contenderId and teamNumber
 * @returns Map of contenderId to count of teams
 */
export declare function countTeamsByClub<T extends {
    contenderId: number;
    teamNumber: number;
}>(results: T[]): Map<number, number>;
/**
 * Format a team name with its Roman numeral suffix.
 *
 * The numeral is shown when either the team's own number identifies it
 * (`teamNumber > 1` — e.g. "Helsingborg SA III", part of the team's
 * cross-division identity regardless of how many of the club's teams play in
 * this group) OR the club fields several teams in this group and they must be
 * told apart (`clubTeamCount > 1`). Only a lone first team (`teamNumber === 1`,
 * single team in the group) renders as the bare club name.
 *
 * @param clubName - The base club name
 * @param teamNumber - The team number (1, 2, 3, etc.)
 * @param clubTeamCount - How many teams this club has in this group
 * @returns Formatted team name (e.g., "SK Rockaden" or "SK Rockaden III")
 */
export declare function formatTeamName(clubName: string, teamNumber: number, clubTeamCount: number): string;
/**
 * Create a team name formatter function based on results data
 * This pre-computes which clubs have multiple teams for efficient lookups
 *
 * @param results - Array of results with contenderId and teamNumber
 * @param getClubName - Function to get club name from ID
 * @returns A function that formats team names appropriately
 */
export declare function createTeamNameFormatter<T extends {
    contenderId: number;
    teamNumber: number;
}>(results: T[], getClubName: (clubId: number) => string): (clubId: number, teamNumber: number) => string;
/**
 * Count how many teams each club has in round results
 * Round results have homeId/awayId and homeTeamNumber/awayTeamNumber
 * @param roundResults - Array of round result objects
 * @returns Map of clubId to count of teams
 */
export declare function countTeamsFromRoundResults<T extends {
    homeId: number;
    awayId: number;
    homeTeamNumber: number;
    awayTeamNumber: number;
}>(roundResults: T[]): Map<number, number>;
/**
 * Create a team name formatter function based on round results data
 * For use with TeamRoundResults component
 *
 * @param roundResults - Array of round results with homeId/awayId and team numbers
 * @param getClubName - Function to get club name from ID
 * @returns A function that formats team names appropriately
 */
export declare function createRoundResultsTeamNameFormatter<T extends {
    homeId: number;
    awayId: number;
    homeTeamNumber: number;
    awayTeamNumber: number;
}>(roundResults: T[], getClubName: (clubId: number) => string): (clubId: number, teamNumber: number) => string;
//# sourceMappingURL=teamFormatting.d.ts.map