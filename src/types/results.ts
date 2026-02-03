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
    /** Group ID */
    groupId: number;
    /** Player information */
    playerInfo: PlayerInfoDto;
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
    /** Club information */
    club: ClubDTO;
}
