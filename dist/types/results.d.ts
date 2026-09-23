/**
 * Results-related types for the Swedish Chess Federation API
 */
import { PlayerInfoDto } from './player';
import { ClubDTO } from './organization';
/**
 * Individual game information
 */
export interface GameDto {
    /** Game ID */
    id: number;
    /** Tournament result ID */
    tournamentResultID: number;
    /** Table number */
    tableNr: number;
    /** White player ID */
    whiteId: number;
    /** Black player ID */
    blackId: number;
    /** Game result (0=loss, 0.5=draw, 1=win from white's perspective) */
    result: number;
    /** PGN notation of the game */
    pgn: string;
    /** Group ID */
    groupiD: number;
}
/**
 * Round result information for tournaments
 */
export interface TournamentRoundResultDto {
    /** Round result ID */
    id: number;
    /** Group ID */
    groupdId: number;
    /** Round number */
    roundNr: number;
    /** Board number */
    board: number;
    /** Home player/team ID */
    homeId: number;
    /** Home team number */
    homeTeamNumber: number;
    /** Away player/team ID */
    awayId: number;
    /** Away team number */
    awayTeamNumber: number;
    /** Home result points */
    homeResult: number;
    /** Away result points */
    awayResult: number;
    /** Match date */
    date: string;
    /** Whether result is finalized */
    finalized: boolean;
    /** Publisher ID */
    publisher: number;
    /** Publish date */
    publishDate: string;
    /** Published note */
    publishedNote: string;
    /** Individual games in this round */
    games: GameDto[];
}
/**
 * Final tournament result for individual players
 */
export interface TournamentEndResultDto {
    /** Total points earned */
    points: number;
    /** Secondary points (tie-break) */
    secPoints: number;
    /** Final placement, or {@link NO_PLACE} when the tournament has no results yet */
    place: number;
    /** Contender ID */
    contenderId: number;
    /** Team number */
    teamNumber: number;
    /** Number of won games */
    wonGames: number;
    /** Number of drawn games */
    drawGames: number;
    /** Number of lost games */
    lostGames: number;
    /** Group ID */
    groupId: number;
    /** Player information */
    playerInfo: PlayerInfoDto;
}
/**
 * Sentinel `place` value meaning "no placement yet".
 *
 * SSF returns `1000` for every player in a group that has not produced any
 * results, alongside `points: 0`. It is a placeholder, not a ranking — sorting
 * by `place` before play starts yields the API's arbitrary row order, which is
 * why a not-yet-started group looks unsorted.
 *
 * Observed as all-or-nothing: groups that are in progress or finished carry real
 * places (1..n) with no `1000` mixed in.
 */
export declare const NO_PLACE = 1000;
/**
 * True when a result carries no real placement (see {@link NO_PLACE}).
 *
 * @param result - A tournament end result, or a raw `place` value
 * @example
 * ```ts
 * const label = isUnplaced(row) ? '-' : String(row.place);
 * ```
 */
export declare function isUnplaced(result: Pick<TournamentEndResultDto, 'place'> | number | null | undefined): boolean;
/**
 * True when a group has produced standings, i.e. at least one real placement.
 *
 * Use this to decide whether placement order is meaningful. When it is `false`,
 * the tournament has not started and callers typically fall back to seeding
 * order — descending by the rating matching the tournament's time control, via
 * `getPlayerRatingForTournament(playerInfo.elo, tournament.thinkingTime)`, which
 * is the order schack.se itself shows before play begins.
 *
 * @param results - Tournament end results for one group
 * @example
 * ```ts
 * const rows = hasStandings(results)
 *   ? sortTournamentEndResultsByPlace(results)
 *   : seedByRating(results, tournament.thinkingTime);
 * ```
 */
export declare function hasStandings(results: ReadonlyArray<Pick<TournamentEndResultDto, 'place'>> | null | undefined): boolean;
/**
 * A team in a "loosely-coupled" team tournament — a team that is its own
 * entity rather than a club, e.g. a school in a real Skol-SM event.
 *
 * The loose-team counterpart to {@link ClubDTO}: where a club-based team
 * tournament identifies a contender by its club, a `TEAM_TEAMS` tournament
 * identifies it by this. `id` is the same value as the standings row's
 * `contenderId`, so it is also the id that team round results use for
 * `homeId` / `awayId`.
 */
export interface TeamDTO {
    /** Team ID — equal to the standings row's `contenderId`. */
    id: number;
    /** Team name, e.g. "Bilingual Montessori School of Lund". */
    name: string;
}
/**
 * Final tournament result for team tournaments
 */
export interface TeamTournamentEndResultDto {
    /** Total points earned */
    points: number;
    /** Secondary points (tie-break) */
    secPoints: number;
    /** Final placement */
    place: number;
    /** Contender ID */
    contenderId: number;
    /** Team number */
    teamNumber: number;
    /** Number of won games */
    wonGames: number;
    /** Number of drawn games */
    drawGames: number;
    /** Number of lost games */
    lostGames: number;
    /**
     * Club information for the team.
     *
     * `null` for "loosely-coupled" team tournaments where teams are not bound
     * to a single club — i.e. tournaments whose `teamtournamentPlayerListType`
     * is `TEAM_TEAMS` (3), such as real team Skol-SM. Those rows carry
     * {@link TeamTournamentEndResultDto.team} instead. For ordinary club-based
     * team tournaments (`REGISTRATION_TEAMS` / `RATINGLIST_TEAMS`) this is
     * always present.
     *
     * See `TeamTournamentPlayerListType` and `isLooseTeamTournament()` in
     * `../types/tournament` for detecting this case from a TournamentDto.
     */
    club: ClubDTO | null;
    /**
     * Team information for a loosely-coupled (`TEAM_TEAMS`) team tournament.
     *
     * Mutually exclusive with {@link TeamTournamentEndResultDto.club}: exactly
     * one of the two is populated. Club-based team tournaments set `club` and
     * leave this `null`; loose-team tournaments do the reverse.
     *
     * Note that loose-team rows carry `teamNumber: -1` rather than `1..n` —
     * each team is its own entity, so there is no "club's second team" to
     * number. Use `getTeamRowName()` / `createStandingsTeamNameFormatter()`
     * from `../utils/teamFormatting` to get a display name without having to
     * branch on which field is set.
     */
    team: TeamDTO | null;
}
//# sourceMappingURL=results.d.ts.map