/**
 * Rating-related types for the Swedish Chess Federation API
 */

import { PlayerInfoDto } from "./player";

/**
 * Rating type constants for API queries
 * Used in rating list endpoints
 */
export enum RatingType {
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
export enum MemberCategory {
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
export enum PlayerCategory {
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
export type RatingListResponse = PlayerInfoDto[];
