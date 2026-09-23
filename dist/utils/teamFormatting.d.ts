/**
 * Utility functions for formatting team names in team tournaments
 */
import type { TeamTournamentEndResultDto } from '../types/results';
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
export declare function getTeamRowName(row: Pick<TeamTournamentEndResultDto, 'club' | 'team'>): string | null;
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
export declare function createStandingsTeamNameFormatter(rows: ReadonlyArray<Pick<TeamTournamentEndResultDto, 'contenderId' | 'teamNumber' | 'club' | 'team'>>): (contenderId: number, teamNumber: number) => string | null;
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