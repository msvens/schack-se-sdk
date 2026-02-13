import { P as PlayerInfoDto } from './results-BROCPBpO.js';

/**
 * Rating-related types for the Swedish Chess Federation API
 */

/**
 * Rating type constants for API queries
 * Used in rating list endpoints
 */
declare enum RatingType {
    /** Standard games (classical time control) */
    STANDARD = 1,
    /** Rapid games */
    RAPID = 6,
    /** Blitz games */
    BLITZ = 7
}
/**
 * Member category constants for API queries
 * Used to filter rating lists by member category
 */
declare enum MemberCategory {
    /** All members */
    ALL = 0,
    /** Juniors */
    JUNIORS = 1,
    /** Cadets */
    CADETS = 2,
    /** Veterans */
    VETERANS = 4,
    /** Women */
    WOMEN = 5,
    /** Minors */
    MINORS = 6,
    /** Kids (Knattar) */
    KIDS = 7,
    /** Youth2Chess - Elementary School (Lagstadiet) */
    Y2C_ELEMENTARY = 10,
    /** Youth2Chess - Grade 5 (Femman) */
    Y2C_GRADE5 = 11,
    /** Youth2Chess - Grade 6 (Sexan) */
    Y2C_GRADE6 = 12,
    /** Youth2Chess - Middle School (Hogstadiet) */
    Y2C_MIDDLE_SCHOOL = 13
}
/**
 * Player category constants (alias for MemberCategory)
 * Maintained for backward compatibility
 */
declare enum PlayerCategory {
    /** All members */
    ALL = 0,
    /** Juniors */
    JUNIORS = 1,
    /** Cadets */
    CADETS = 2,
    /** Veterans */
    VETERANS = 4,
    /** Women */
    WOMEN = 5,
    /** Minors */
    MINORS = 6,
    /** Kids (Knattar) */
    KIDS = 7,
    /** Youth2Chess - Elementary School (Lagstadiet) */
    Y2C_ELEMENTARY = 10,
    /** Youth2Chess - Grade 5 (Femman) */
    Y2C_GRADE5 = 11,
    /** Youth2Chess - Grade 6 (Sexan) */
    Y2C_GRADE6 = 12,
    /** Youth2Chess - Middle School (Hogstadiet) */
    Y2C_MIDDLE_SCHOOL = 13
}
/**
 * Type alias for rating list responses
 * Rating lists return arrays of PlayerInfoDto
 */
type RatingListResponse = PlayerInfoDto[];

/**
 * Registration-related types for the Swedish Chess Federation API
 */

/**
 * Team registration information for a tournament and club
 */
interface TeamRegistrationDto {
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
interface TeamRegistrationPlayerDto {
    /** Registration date */
    registered: string;
    /** Available date */
    available: string;
    /** Swedish citizenship status */
    swedishCitizen: boolean;
    /** Complete player information */
    playerInfoDto: PlayerInfoDto;
}

export { MemberCategory as M, PlayerCategory as P, type RatingListResponse as R, type TeamRegistrationDto as T, type TeamRegistrationPlayerDto as a, RatingType as b };
