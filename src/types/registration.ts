/**
 * Registration-related types for the Swedish Chess Federation API
 */

import { PlayerInfoDto } from './player';

/**
 * Team registration information for a tournament and club
 */
export interface TeamRegistrationDto {
    /** Tournament ID */
    tournamentid: number;
    /** Club ID */
    clubid: number;
    /** List of registered players */
    players: TeamRegistrationPlayerDto[];
}

/**
 * Individual player registration information for team tournaments
 */
export interface TeamRegistrationPlayerDto {
    /** Registration date */
    registered: string;
    /** Available date */
    available: string;
    /** Swedish citizenship status */
    swedishCitizen: boolean;
    /** Complete player information */
    playerInfoDto: PlayerInfoDto;
}
