/**
 * Player-related types for the Swedish Chess Federation API
 */

/**
 * Request DTO for the batch player list endpoint (POST /player/list/)
 */
export interface MemberDateDto {
  /** Player ID */
  id: number;
  /** Date in YYYY-MM-DD format */
  date: string;
}

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
    /**
     * SSF sex code (verified against live data):
     * - `0`  male — but also the value consumers get when fabricating a
     *        placeholder player, so `sex === 0` is not a reliable male marker.
     * - `1`  female (girls-only groups are uniformly `1`).
     * - `2`  unrecorded — the field was never filled in (common in bulk
     *        school-club registrations); a gender mix, **not** a third category.
     * - `-1` not a real member (synthetic walkover/"Frirond" row, id `-100`).
     *
     * `2` must not be treated as female. Prefer {@link isFemale} over comparing
     * this field directly.
     */
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
