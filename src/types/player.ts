/**
 * Player-related types for the Swedish Chess Federation API
 */

/**
 * FIDE rating information for a member
 */
export interface MemberFIDERatingDTO {
    /** Standard FIDE rating */
    rating: number;
    /** FIDE title */
    title: string;
    /** Rating date */
    date: string;
    /** K-factor for standard rating */
    k: number;
    /** Rapid FIDE rating */
    rapidRating: number;
    /** K-factor for rapid rating */
    rapidk: number;
    /** Blitz FIDE rating */
    blitzRating: number;
    /** K-factor for blitz rating */
    blitzK: number;
}

/**
 * LASK (Swedish national rating) information for a member
 */
export interface MemberLASKRatingDTO {
    /** LASK rating value */
    rating: number;
    /** Rating date */
    date: string;
}

/**
 * Player rating history point containing FIDE and LASK ratings for a specific date
 */
export interface PlayerRatingHistory {
    /** FIDE rating information */
    elo: MemberFIDERatingDTO;
    /** LASK rating information */
    lask: MemberLASKRatingDTO;
}

/**
 * Complete player information including ratings and club affiliation
 */
export interface PlayerInfoDto {
    /** Player ID */
    id: number;
    /** First name */
    firstName: string;
    /** Last name */
    lastName: string;
    /** Date of birth */
    birthdate: string;
    /** Sex (1=Male, 2=Female, etc.) */
    sex: number;
    /** FIDE ID */
    fideid: number;
    /** Country code */
    country: string;
    /** Club name */
    club: string;
    /** Club ID */
    clubId: number;
    /** FIDE rating information */
    elo: MemberFIDERatingDTO;
    /** LASK rating information */
    lask: MemberLASKRatingDTO;
}

/**
 * Rating data point for chart display
 * Contains optional ratings for each time control type
 */
export interface RatingDataPoint {
    /** Date in YYYY-MM format */
    date: string;
    /** Standard (classical) rating */
    standard?: number;
    /** Rapid rating */
    rapid?: number;
    /** Blitz rating */
    blitz?: number;
    /** LASK (Swedish national) rating */
    lask?: number;
}
