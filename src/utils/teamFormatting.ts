/**
 * Utility functions for formatting team names in team tournaments
 */

import type { TeamTournamentEndResultDto } from '../types/results';

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
export function formatTeamName(
  clubName: string,
  teamNumber: number,
  clubTeamCount: number
): string {
  if (teamNumber > 1 || clubTeamCount > 1) {
    return `${clubName} ${toRomanNumeral(teamNumber)}`;
  }
  return clubName;
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
 * The display name carried by a team standings row, whichever field holds it.
 *
 * A row identifies its contender through exactly one of two fields: `club` for
 * ordinary club-based team tournaments, or `team` for "loosely-coupled"
 * (`TEAM_TEAMS`) ones such as real team Skol-SM, where a team is a school
 * rather than a club. This reads whichever is set so callers don't have to
 * branch.
 *
 * Returns the bare name with no team numeral — use
 * {@link createStandingsTeamNameFormatter} when you want "SK Rockaden III".
 *
 * @param row - A team standings row (anything carrying `club` and `team`)
 * @returns The club or team name, or `null` if the row carries neither
 * @example
 * ```ts
 * const { data } = await results.getTeamTournamentResults(18228);
 * data?.map(getTeamRowName); // ["Bilingual Montessori School of Lund", ...]
 * ```
 */
export function getTeamRowName(
  row: Pick<TeamTournamentEndResultDto, 'club' | 'team'>
): string | null {
  return row.team?.name ?? row.club?.name ?? null;
}

/**
 * Build a team-name formatter from the standings rows themselves.
 *
 * Unlike {@link createTeamNameFormatter}, this needs no external club-name
 * lookup: the names already travel on the rows (in `club` or `team`). It
 * applies the same Roman-numeral rule via {@link formatTeamName}, so a club
 * fielding several teams renders as "SK Rockaden II" while a lone team renders
 * bare.
 *
 * This also solves naming for **team round results**, which carry only
 * `homeId`/`awayId` and no names at all — those ids are the standings rows'
 * `contenderId`, so the same formatter names both sides of a match. Unknown
 * ids yield `null`, which covers the `-100` bye sentinel.
 *
 * Loose-team rows need no special handling: they carry `teamNumber: -1` and
 * each team is its own `contenderId`, so the count is 1 and the name renders
 * bare.
 *
 * @param rows - Team standings rows from `getTeamTournamentResults`
 * @returns `(contenderId, teamNumber) => string | null`
 * @example
 * ```ts
 * const table = await results.getTeamTournamentResults(groupId);
 * const teamName = createStandingsTeamNameFormatter(table.data ?? []);
 *
 * const rounds = await results.getTeamRoundResults(groupId);
 * for (const m of rounds.data ?? []) {
 *   console.log(teamName(m.homeId, m.homeTeamNumber), 'vs',
 *               teamName(m.awayId, m.awayTeamNumber));
 * }
 * ```
 */
export function createStandingsTeamNameFormatter(
  rows: ReadonlyArray<Pick<TeamTournamentEndResultDto, 'contenderId' | 'teamNumber' | 'club' | 'team'>>
): (contenderId: number, teamNumber: number) => string | null {
  const teamCounts = countTeamsByClub([...rows]);
  const names = new Map<number, string>();
  for (const row of rows) {
    const name = getTeamRowName(row);
    if (name !== null && !names.has(row.contenderId)) names.set(row.contenderId, name);
  }

  return (contenderId: number, teamNumber: number): string | null => {
    const name = names.get(contenderId);
    if (name === undefined) return null;
    return formatTeamName(name, teamNumber, teamCounts.get(contenderId) ?? 1);
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
