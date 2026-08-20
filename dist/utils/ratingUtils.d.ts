/**
 * Utility functions for handling chess ratings based on tournament types
 */
import { MemberFIDERatingDTO } from '../types';
/**
 * Round rating type constants (from RoundDto.rated field)
 * These map to the API values for per-round rating types
 */
export declare const RoundRatedType: {
    readonly UNRATED: 0;
    readonly STANDARD: 1;
    readonly RAPID: 2;
    readonly BLITZ: 3;
};
export type RoundRatedTypeValue = typeof RoundRatedType[keyof typeof RoundRatedType];
/**
 * Parse thinkingTime string to determine tournament time control type
 *
 * Examples:
 * - "10 min + 5 sek/drag" -> Rapid (10 min)
 * - "3 min + 2 sek/drag" -> Blitz (3 min)
 * - "90+15 min +30 sek/drag" -> Standard (105 min)
 *
 * FIDE time control rules:
 * - Blitz: < 10 minutes
 * - Rapid: 10-60 minutes
 * - Standard: > 60 minutes or unspecified
 */
export declare function parseTimeControl(thinkingTime: string | null | undefined): 'standard' | 'rapid' | 'blitz';
/**
 * Type of rating used
 */
export type TimeControlType = 'standard' | 'rapid' | 'blitz' | 'lask';
/**
 * Result of getting a player's rating for a tournament
 */
export interface PlayerRating {
    /** The rating value, or null if no rating available */
    rating: number | null;
    /** Whether this is a fallback to standard rating (marked with *) */
    isFallback: boolean;
    /** The type of rating that was used */
    ratingType: TimeControlType | null;
}
/**
 * Get the appropriate FIDE rating for a player based on tournament time control
 *
 * Logic:
 * - Standard tournament: Show standard rating, or null if not available
 * - Rapid tournament: Show rapid rating, or standard rating (marked as fallback), or null
 * - Blitz tournament: Show blitz rating, or standard rating (marked as fallback), or null
 *
 * @param elo - Player's FIDE rating information
 * @param thinkingTime - Tournament thinkingTime string (e.g., "10 min + 5 sek/drag")
 * @returns Object with rating value and fallback flag
 *
 * @example
 * ```ts
 * const { rating, isFallback } = getPlayerRatingForTournament(player.elo, "10 min + 5 sek/drag");
 * const displayRating = rating ? `${rating}${isFallback ? '*' : ''}` : '-';
 * ```
 */
export declare function getPlayerRatingForTournament(elo: MemberFIDERatingDTO | null | undefined, thinkingTime: string | null | undefined): PlayerRating;
/**
 * Format a player's rating for display based on tournament time control
 *
 * @param elo - Player's FIDE rating information
 * @param thinkingTime - Tournament thinkingTime string (e.g., "10 min + 5 sek/drag")
 * @returns Formatted rating string (e.g., "2100", "1950 S", "-")
 *
 * @example
 * ```ts
 * const displayRating = formatPlayerRating(player.elo, "10 min + 5 sek/drag");
 * // Returns: "1416" (rapid rating for rapid tournament)
 * // or "1950 S" (standard rating as fallback if no rapid rating)
 * // or "-" (no rating available)
 * ```
 */
export declare function formatPlayerRating(elo: MemberFIDERatingDTO | null | undefined, thinkingTime: string | null | undefined): string;
/**
 * Format a player's rating with language-sensitive suffix based on rating type
 *
 * Always shows rating type suffix for clarity:
 * - Standard: no suffix
 * - Rapid: " S" (Swedish - Snabb) / " R" (English - Rapid)
 * - Blitz: " B" (both languages - Blixt/Blitz)
 * - LASK: " L" (both languages)
 *
 * @param rating - The rating value
 * @param ratingType - The type of rating ('standard' | 'rapid' | 'blitz' | 'lask')
 * @param language - Language for suffix ('sv' | 'en')
 * @returns Formatted rating string with appropriate suffix
 *
 * @example
 * ```ts
 * formatRatingWithType(1638, 'rapid', 'sv') // "1638 S"
 * formatRatingWithType(1638, 'rapid', 'en') // "1638 R"
 * formatRatingWithType(1638, 'standard', 'sv') // "1638"
 * formatRatingWithType(1638, 'blitz', 'en') // "1638 B"
 * ```
 */
export declare function formatRatingWithType(rating: number | null, ratingType: TimeControlType | null, language?: 'sv' | 'en'): string;
/**
 * Check if a player qualifies as a junior for K-factor purposes
 * FIDE rule: K=40 until the end of the year of their 18th birthday
 *
 * This means if you turn 18 in 2025, K=40 applies through all of 2025.
 * Only in 2026 would you lose the junior K-factor bonus.
 *
 * @param birthdate - Player's birth date string
 * @param gameDate - Date of the game (used to determine the year)
 * @returns true if the player is a junior (turning 18 or younger in the game year)
 */
export declare function isJuniorPlayer(birthdate: string | null | undefined, gameDate?: Date | number): boolean;
/**
 * Extract the birth year from an SSF birthdate string.
 *
 * The year is taken from the first four characters (SSF sends `"2014"` or
 * `"2014-05-01"`), deliberately NOT via `new Date(birthdate).getFullYear()`,
 * which shifts a year-only value to the previous year in negative-UTC timezones.
 *
 * @param birthdate - SSF birthdate string (year, or `YYYY-MM-DD`)
 * @returns The birth year, or `null` if there is no parseable year
 */
export declare function birthYearOf(birthdate: string | null | undefined): number | null;
/**
 * A player's "chess age" for a tournament: `tournamentYear - birthYear`.
 *
 * This is the age convention used throughout SSF (age bands, senior/veteran
 * prizes, junior classification) — the age you reach by the end of the
 * tournament's calendar year, not the exact age on a given day. The birth year
 * is parsed by {@link birthYearOf}.
 *
 * @param birthdate - SSF birthdate string (year, or `YYYY-MM-DD`)
 * @param tournamentYear - Calendar year the tournament is played in
 * @returns The chess age, or `null` if the birthdate has no parseable year
 */
export declare function chessAge(birthdate: string | null | undefined, tournamentYear: number): number | null;
/**
 * Get the appropriate K-factor for ELO calculations based on rating type
 *
 * FIDE K-factor rules (same for standard, rapid, and blitz):
 * - K=40 for new players (<30 games) - we can't detect this without game count
 * - K=40 for juniors (under 18 by end of year) with rating <2300
 * - K=20 as long as rating remains under 2400
 * - K=10 once published rating has reached 2400
 *
 * IMPORTANT: The stored K-factor (playerElo.k) is for STANDARD games only.
 * For rapid/blitz, we must calculate K based on the rapid/blitz rating being used,
 * not the stored standard K-factor.
 *
 * @param ratingType - The type of rating being used
 * @param playerRating - The player's rating value (should be the rating for this game type)
 * @param playerElo - Optional player ELO data (contains k-factor for standard games)
 * @param birthdate - Optional player birth date for junior K-factor calculation
 * @param gameDate - Optional game date for junior calculation (defaults to current date)
 * @returns K-factor to use for calculations
 */
export declare function getKFactorForRating(ratingType: TimeControlType | null, playerRating: number | null, playerElo?: MemberFIDERatingDTO | null, birthdate?: string | null, gameDate?: Date | number): number;
/**
 * Get the appropriate rating for a player based on the tournament's ranking algorithm
 *
 * This uses the group-level rankingAlgorithm field which explicitly specifies
 * which rating system to use and in what priority order.
 *
 * @param elo - Player's FIDE rating information
 * @param rankingAlgorithm - The ranking algorithm from TournamentClassGroupDto
 * @returns Object with rating value and fallback flag
 */
export declare function getPlayerRatingByAlgorithm(elo: MemberFIDERatingDTO | null | undefined, rankingAlgorithm: number | null | undefined): PlayerRating;
/**
 * Convert round.rated value to TimeControlType
 * Returns null for unrated rounds (no ELO calculation should happen)
 *
 * @param rated - The RoundDto.rated field value (0/1/2/3)
 * @returns The corresponding TimeControlType, or null for unrated rounds
 */
export declare function getRatingTypeFromRoundRated(rated: number | undefined): TimeControlType | null;
/**
 * Get player rating for a specific round's rating type
 * Uses round.rated to determine which rating to use
 *
 * Unlike getPlayerRatingByAlgorithm, this function uses strict rating matching:
 * - If a round is Rapid but player has no Rapid rating, returns null (no fallback)
 * - This ensures accurate ELO calculations for tournaments with mixed round types
 *
 * @param elo - Player's FIDE rating information
 * @param roundRatedType - The RoundDto.rated field value (0/1/2/3)
 * @returns Object with rating value and rating type
 */
export declare function getPlayerRatingByRoundType(elo: MemberFIDERatingDTO | null | undefined, roundRatedType: number | undefined): PlayerRating;
/**
 * Get the primary rating type for a ranking algorithm (no fallback chain).
 * E.g. RAPID_STANDARD_BLITZ_ELO → 'rapid', BLITZ_ELO → 'blitz'.
 */
export declare function getPrimaryRatingType(rankingAlgorithm: number | null | undefined): TimeControlType | null;
/**
 * Strict rating lookup — returns only the primary rating type for the algorithm.
 * If the player doesn't have that rating, returns null (no fallback).
 * Use for display contexts like H2H where fallback would be misleading.
 */
export declare function getPlayerRatingStrict(elo: MemberFIDERatingDTO | null | undefined, rankingAlgorithm: number | null | undefined): PlayerRating;
/**
 * Format a player's name with their FIDE title if they have one
 *
 * @param firstName - Player's first name
 * @param lastName - Player's last name
 * @param title - Player's FIDE title (e.g., "GM", "IM", "FM", "WGM", "WIM", "WFM", "CM", "WCM")
 * @returns Formatted name string (e.g., "GM Magnus Carlsen" or "Magnus Carlsen")
 *
 * @example
 * ```ts
 * formatPlayerName("Magnus", "Carlsen", "GM")  // "GM Magnus Carlsen"
 * formatPlayerName("Anna", "Svensson", "")     // "Anna Svensson"
 * formatPlayerName("Erik", "Lindberg")         // "Erik Lindberg"
 * ```
 */
export declare function formatPlayerName(firstName: string, lastName: string, title?: string | null): string;
/**
 * SSF `sex` codes (see the `sex` field on `PlayerInfoDto`). Verified against
 * live data for `MALE`/`FEMALE`; `UNRECORDED`/`NON_MEMBER` are inferred from
 * sampling and pending confirmation from schack.se.
 */
export declare const Sex: {
    /**
     * Male — but also the value you get from a fabricated/placeholder player, so
     * reading `sex === 0` from arbitrary data does not prove male (there is
     * deliberately no `isMale`; this constant is for constructing/labelling).
     */
    readonly MALE: 0;
    /** Female. Girls-only groups are uniformly this value. */
    readonly FEMALE: 1;
    /**
     * Unrecorded — the field was never filled in (common in bulk school-club
     * registrations); a gender mix, **not** female. Meaning inferred, to be
     * confirmed with schack.se.
     */
    readonly UNRECORDED: 2;
    /**
     * Not a real member — synthetic walkover/"Frirond" row (member id `-100`).
     * Meaning inferred, to be confirmed with schack.se.
     */
    readonly NON_MEMBER: -1;
};
export type SexType = typeof Sex[keyof typeof Sex];
/**
 * Whether a player is female, i.e. `sex === 1` exactly.
 *
 * Strict by design: `2` ({@link Sex.UNRECORDED}) is a gender mix and must never
 * be read as female, and `0` ({@link Sex.MALE}) doubles as the placeholder
 * default consumers use when fabricating a player — so there is deliberately no
 * `isMale` counterpart (`sex === 0` does not prove male). Null/undefined players
 * or an unset `sex` return `false`.
 */
export declare function isFemale(player: {
    sex?: number | null;
} | null | undefined): boolean;
//# sourceMappingURL=ratingUtils.d.ts.map