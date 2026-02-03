/**
 * Utility functions for formatting team names in team tournaments
 */

/**
 * Convert a number to Roman numerals
 * Supports numbers 1-20 which covers typical team counts
 */
export function toRomanNumeral(num: number): string {
  if (num <= 0 || num > 20) {
    return num.toString(); // Fallback for edge cases
  }

  const romanNumerals: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
  ];

  let result = '';
  let remaining = num;

  for (const [value, numeral] of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result;
}

/**
 * Count how many teams each club has in the results
 * @param results - Array of objects with contenderId and teamNumber
 * @returns Map of contenderId to count of teams
 */
export function countTeamsByClub<T extends { contenderId: number; teamNumber: number }>(
  results: T[]
): Map<number, number> {
  const teamCounts = new Map<number, Set<number>>();

  results.forEach(result => {
    const existing = teamCounts.get(result.contenderId) || new Set<number>();
    existing.add(result.teamNumber);
    teamCounts.set(result.contenderId, existing);
  });

  // Convert Set sizes to counts
  const counts = new Map<number, number>();
  teamCounts.forEach((teamNumbers, clubId) => {
    counts.set(clubId, teamNumbers.size);
  });

  return counts;
}

/**
 * Format a team name with Roman numeral suffix if the club has multiple teams
 * @param clubName - The base club name
 * @param teamNumber - The team number (1, 2, 3, etc.)
 * @param clubTeamCount - How many teams this club has in the tournament
 * @returns Formatted team name (e.g., "SK Rockaden" or "SK Rockaden II")
 */
export function formatTeamName(
  clubName: string,
  teamNumber: number,
  clubTeamCount: number
): string {
  // If club only has one team, don't show team number
  if (clubTeamCount <= 1) {
    return clubName;
  }

  // Append Roman numeral for multi-team clubs
  return `${clubName} ${toRomanNumeral(teamNumber)}`;
}

/**
 * Create a team name formatter function based on results data
 * This pre-computes which clubs have multiple teams for efficient lookups
 *
 * @param results - Array of results with contenderId and teamNumber
 * @param getClubName - Function to get club name from ID
 * @returns A function that formats team names appropriately
 */
export function createTeamNameFormatter<T extends { contenderId: number; teamNumber: number }>(
  results: T[],
  getClubName: (clubId: number) => string
): (clubId: number, teamNumber: number) => string {
  const teamCounts = countTeamsByClub(results);

  return (clubId: number, teamNumber: number): string => {
    const clubName = getClubName(clubId);
    const teamCount = teamCounts.get(clubId) || 1;
    return formatTeamName(clubName, teamNumber, teamCount);
  };
}

/**
 * Count how many teams each club has in round results
 * Round results have homeId/awayId and homeTeamNumber/awayTeamNumber
 * @param roundResults - Array of round result objects
 * @returns Map of clubId to count of teams
 */
export function countTeamsFromRoundResults<T extends {
  homeId: number;
  awayId: number;
  homeTeamNumber: number;
  awayTeamNumber: number;
}>(roundResults: T[]): Map<number, number> {
  const teamCounts = new Map<number, Set<number>>();

  roundResults.forEach(result => {
    // Count home team
    const homeExisting = teamCounts.get(result.homeId) || new Set<number>();
    homeExisting.add(result.homeTeamNumber);
    teamCounts.set(result.homeId, homeExisting);

    // Count away team
    const awayExisting = teamCounts.get(result.awayId) || new Set<number>();
    awayExisting.add(result.awayTeamNumber);
    teamCounts.set(result.awayId, awayExisting);
  });

  // Convert Set sizes to counts
  const counts = new Map<number, number>();
  teamCounts.forEach((teamNumbers, clubId) => {
    counts.set(clubId, teamNumbers.size);
  });

  return counts;
}

/**
 * Create a team name formatter function based on round results data
 * For use with TeamRoundResults component
 *
 * @param roundResults - Array of round results with homeId/awayId and team numbers
 * @param getClubName - Function to get club name from ID
 * @returns A function that formats team names appropriately
 */
export function createRoundResultsTeamNameFormatter<T extends {
  homeId: number;
  awayId: number;
  homeTeamNumber: number;
  awayTeamNumber: number;
}>(
  roundResults: T[],
  getClubName: (clubId: number) => string
): (clubId: number, teamNumber: number) => string {
  const teamCounts = countTeamsFromRoundResults(roundResults);

  return (clubId: number, teamNumber: number): string => {
    const clubName = getClubName(clubId);
    const teamCount = teamCounts.get(clubId) || 1;
    return formatTeamName(clubName, teamNumber, teamCount);
  };
}
