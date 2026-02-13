/**
 * Utility functions for handling chess ratings based on tournament types
 */

import { MemberFIDERatingDTO } from '../types';
import { RatingAlgorithm } from '../types/ratingAlgorithm';

/**
 * Round rating type constants (from RoundDto.rated field)
 * These map to the API values for per-round rating types
 */
export const RoundRatedType = {
  UNRATED: 0,
  STANDARD: 1,
  RAPID: 2,
  BLITZ: 3,
} as const;

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
export function parseTimeControl(thinkingTime: string | null | undefined): 'standard' | 'rapid' | 'blitz' {
  if (!thinkingTime) {
    return 'standard'; // Default to standard if no time control specified
  }

  // Extract all numbers before "min" in the string
  // Handles formats like "10 min", "90+15 min", "3 min"
  const minutesMatch = thinkingTime.match(/(\d+)(?:\+(\d+))?\s*min/i);

  if (!minutesMatch) {
    return 'standard'; // Can't parse, assume standard
  }

  // Calculate total base time in minutes
  const baseMinutes = parseInt(minutesMatch[1], 10);
  const additionalMinutes = minutesMatch[2] ? parseInt(minutesMatch[2], 10) : 0;
  const totalMinutes = baseMinutes + additionalMinutes;

  // Apply FIDE time control classification
  if (totalMinutes < 10) {
    return 'blitz';
  } else if (totalMinutes <= 60) {
    return 'rapid';
  } else {
    return 'standard';
  }
}

/**
 * Type of rating used
 */
export type RatingType = 'standard' | 'rapid' | 'blitz' | 'lask';

/**
 * Result of getting a player's rating for a tournament
 */
export interface PlayerRating {
  /** The rating value, or null if no rating available */
  rating: number | null;
  /** Whether this is a fallback to standard rating (marked with *) */
  isFallback: boolean;
  /** The type of rating that was used */
  ratingType: RatingType | null;
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
export function getPlayerRatingForTournament(
  elo: MemberFIDERatingDTO | null | undefined,
  thinkingTime: string | null | undefined
): PlayerRating {
  if (!elo) {
    return { rating: null, isFallback: false, ratingType: null };
  }

  const timeControl = parseTimeControl(thinkingTime);

  switch (timeControl) {
    case 'standard':
      // Standard tournament: only show standard rating
      return {
        rating: elo.rating || null,
        isFallback: false,
        ratingType: elo.rating ? 'standard' : null
      };

    case 'rapid':
      // Rapid tournament: prefer rapid, fallback to standard
      if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: false, ratingType: 'rapid' };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true, ratingType: 'standard' };
      }
      return { rating: null, isFallback: false, ratingType: null };

    case 'blitz':
      // Blitz tournament: prefer blitz, fallback to standard
      if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: false, ratingType: 'blitz' };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true, ratingType: 'standard' };
      }
      return { rating: null, isFallback: false, ratingType: null };
  }
}

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
export function formatPlayerRating(
  elo: MemberFIDERatingDTO | null | undefined,
  thinkingTime: string | null | undefined
): string {
  const { rating, isFallback } = getPlayerRatingForTournament(elo, thinkingTime);

  if (rating === null) {
    return '-';
  }

  // Option 2: Clean display for matching rating type, suffix " S" for standard fallback
  return `${rating}${isFallback ? ' S' : ''}`;
}

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
export function formatRatingWithType(
  rating: number | null,
  ratingType: RatingType | null,
  language: 'sv' | 'en' = 'sv'
): string {
  if (rating === null) {
    return '-';
  }

  // Determine suffix based on rating type and language
  let suffix = '';
  if (ratingType) {
    switch (ratingType) {
      case 'standard':
        // No suffix for standard
        suffix = '';
        break;
      case 'rapid':
        // S (Snabb) in Swedish, R (Rapid) in English
        suffix = language === 'sv' ? ' S' : ' R';
        break;
      case 'blitz':
        // B (Blixt/Blitz) in both languages
        suffix = ' B';
        break;
      case 'lask':
        // L for LASK in both languages
        suffix = ' L';
        break;
    }
  }

  return `${rating}${suffix}`;
}

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
export function isJuniorPlayer(birthdate: string | null | undefined, gameDate?: Date | number): boolean {
  if (!birthdate) return false;

  try {
    const birth = new Date(birthdate);
    if (isNaN(birth.getTime())) return false;

    // Determine the year of the game (or current year if not provided)
    const gameYear = gameDate
      ? (typeof gameDate === 'number' ? new Date(gameDate).getFullYear() : gameDate.getFullYear())
      : new Date().getFullYear();

    // Player's age at the END of the game year (Dec 31)
    const ageAtEndOfYear = gameYear - birth.getFullYear();

    // Junior = turning 18 or younger in the game year
    // FIDE: "until the end of the year of their 18th birthday"
    // So if you turn 18 in 2025, K=40 applies through all of 2025
    return ageAtEndOfYear <= 18;
  } catch {
    return false;
  }
}

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
export function getKFactorForRating(
  ratingType: RatingType | null,
  playerRating: number | null,
  playerElo?: MemberFIDERatingDTO | null,
  birthdate?: string | null,
  gameDate?: Date | number
): number {
  // If no rating or rating type, default to standard K=20
  if (!ratingType || !playerRating) {
    return 20;
  }

  // Check for junior K-factor: K=40 for under-18 players with rating <2300
  if (birthdate && playerRating < 2300 && isJuniorPlayer(birthdate, gameDate)) {
    return 40;
  }

  // Apply FIDE K-factor rules based on rating type
  switch (ratingType) {
    case 'rapid':
    case 'blitz':
      // For rapid/blitz, calculate K based on the rapid/blitz rating
      // DO NOT use stored K-factor (that's for standard games)
      // K=20 for <2400, K=10 for 2400+
      return playerRating >= 2400 ? 10 : 20;

    case 'standard':
    case 'lask':
      // For standard games, use stored K-factor if available
      // (This already accounts for junior status from SSF data)
      if (playerElo?.k) {
        return playerElo.k;
      }
      // Otherwise use K=20 for <2400, K=10 for 2400+
      return playerRating >= 2400 ? 10 : 20;

    default:
      return 20;
  }
}

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
export function getPlayerRatingByAlgorithm(
  elo: MemberFIDERatingDTO | null | undefined,
  rankingAlgorithm: number | null | undefined
): PlayerRating {
  if (!elo) {
    return { rating: null, isFallback: false, ratingType: null };
  }

  if (!rankingAlgorithm) {
    // Fallback to standard if no algorithm specified
    return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? 'standard' : null };
  }

  switch (rankingAlgorithm) {
    case RatingAlgorithm.STANDARD_ELO:
      // Standard ELO only
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? 'standard' : null };

    case RatingAlgorithm.RAPID_ELO:
      // Rapid ELO only
      return { rating: elo.rapidRating || null, isFallback: false, ratingType: elo.rapidRating ? 'rapid' : null };

    case RatingAlgorithm.BLITZ_ELO:
      // Blitz ELO only
      return { rating: elo.blitzRating || null, isFallback: false, ratingType: elo.blitzRating ? 'blitz' : null };

    case RatingAlgorithm.IF_ELO_THEN_ELO_OTHERWISE_LASK:
      // Use standard ELO if available, otherwise LASK
      // Note: LASK ratings not available through elo parameter, only returns standard ELO
      if (elo.rating) {
        return { rating: elo.rating, isFallback: false, ratingType: 'standard' };
      }
      return { rating: null, isFallback: false, ratingType: null };

    case RatingAlgorithm.LASK:
      // LASK rating only
      // Note: LASK ratings not available through elo parameter (requires separate lask object)
      return { rating: null, isFallback: false, ratingType: null };

    case RatingAlgorithm.MAX_ELO_LASK:
      // Maximum of ELO and LASK
      // Note: LASK ratings not available through elo parameter, only returns standard ELO
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? 'standard' : null };

    case RatingAlgorithm.BLITZ_STANDARD_RAPID_ELO:
      // Priority: Blitz > Standard > Rapid
      if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: false, ratingType: 'blitz' };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true, ratingType: 'standard' };
      } else if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: true, ratingType: 'rapid' };
      }
      return { rating: null, isFallback: false, ratingType: null };

    case RatingAlgorithm.STANDARD_RAPID_BLITZ_ELO:
      // Priority: Standard > Rapid > Blitz
      if (elo.rating) {
        return { rating: elo.rating, isFallback: false, ratingType: 'standard' };
      } else if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: true, ratingType: 'rapid' };
      } else if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: true, ratingType: 'blitz' };
      }
      return { rating: null, isFallback: false, ratingType: null };

    case RatingAlgorithm.RAPID_STANDARD_BLITZ_ELO:
      // Priority: Rapid > Standard > Blitz
      if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: false, ratingType: 'rapid' };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true, ratingType: 'standard' };
      } else if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: true, ratingType: 'blitz' };
      }
      return { rating: null, isFallback: false, ratingType: null };

    case RatingAlgorithm.NO_RATING:
      // No rating calculation
      return { rating: null, isFallback: false, ratingType: null };

    default:
      // Unknown algorithm, fall back to standard
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? 'standard' : null };
  }
}

/**
 * Convert round.rated value to RatingType
 * Returns null for unrated rounds (no ELO calculation should happen)
 *
 * @param rated - The RoundDto.rated field value (0/1/2/3)
 * @returns The corresponding RatingType, or null for unrated rounds
 */
export function getRatingTypeFromRoundRated(rated: number | undefined): RatingType | null {
  switch (rated) {
    case RoundRatedType.STANDARD: return 'standard';
    case RoundRatedType.RAPID: return 'rapid';
    case RoundRatedType.BLITZ: return 'blitz';
    case RoundRatedType.UNRATED:
    default:
      return null; // Unrated or unknown
  }
}

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
export function getPlayerRatingByRoundType(
  elo: MemberFIDERatingDTO | null | undefined,
  roundRatedType: number | undefined
): PlayerRating {
  const ratingType = getRatingTypeFromRoundRated(roundRatedType);

  if (!elo || !ratingType) {
    return { rating: null, isFallback: false, ratingType: null };
  }

  switch (ratingType) {
    case 'standard':
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? 'standard' : null };
    case 'rapid':
      return { rating: elo.rapidRating || null, isFallback: false, ratingType: elo.rapidRating ? 'rapid' : null };
    case 'blitz':
      return { rating: elo.blitzRating || null, isFallback: false, ratingType: elo.blitzRating ? 'blitz' : null };
    default:
      return { rating: null, isFallback: false, ratingType: null };
  }
}

/**
 * Get the primary rating type for a ranking algorithm (no fallback chain).
 * E.g. RAPID_STANDARD_BLITZ_ELO → 'rapid', BLITZ_ELO → 'blitz'.
 */
export function getPrimaryRatingType(rankingAlgorithm: number | null | undefined): RatingType | null {
  switch (rankingAlgorithm) {
    case RatingAlgorithm.STANDARD_ELO:
    case RatingAlgorithm.IF_ELO_THEN_ELO_OTHERWISE_LASK:
    case RatingAlgorithm.MAX_ELO_LASK:
    case RatingAlgorithm.STANDARD_RAPID_BLITZ_ELO:
      return 'standard';
    case RatingAlgorithm.RAPID_ELO:
    case RatingAlgorithm.RAPID_STANDARD_BLITZ_ELO:
      return 'rapid';
    case RatingAlgorithm.BLITZ_ELO:
    case RatingAlgorithm.BLITZ_STANDARD_RAPID_ELO:
      return 'blitz';
    case RatingAlgorithm.LASK:
      return 'lask';
    case RatingAlgorithm.NO_RATING:
    default:
      return null;
  }
}

/**
 * Strict rating lookup — returns only the primary rating type for the algorithm.
 * If the player doesn't have that rating, returns null (no fallback).
 * Use for display contexts like H2H where fallback would be misleading.
 */
export function getPlayerRatingStrict(
  elo: MemberFIDERatingDTO | null | undefined,
  rankingAlgorithm: number | null | undefined
): PlayerRating {
  if (!elo) return { rating: null, isFallback: false, ratingType: null };

  const ratingType = getPrimaryRatingType(rankingAlgorithm);
  if (!ratingType) return { rating: null, isFallback: false, ratingType: null };

  switch (ratingType) {
    case 'standard':
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? 'standard' : null };
    case 'rapid':
      return { rating: elo.rapidRating || null, isFallback: false, ratingType: elo.rapidRating ? 'rapid' : null };
    case 'blitz':
      return { rating: elo.blitzRating || null, isFallback: false, ratingType: elo.blitzRating ? 'blitz' : null };
    default:
      return { rating: null, isFallback: false, ratingType: null };
  }
}

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
export function formatPlayerName(
  firstName: string,
  lastName: string,
  title?: string | null
): string {
  const fullName = `${firstName} ${lastName}`;
  if (title && title.trim()) {
    return `${title} ${fullName}`;
  }
  return fullName;
}
