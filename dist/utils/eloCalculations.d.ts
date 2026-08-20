/**
 * ELO rating calculation utilities based on FIDE formulas
 *
 * These are approximations used for display purposes only.
 * Official ratings are calculated by FIDE monthly.
 */
/**
 * Maximum rating difference used in expected score calculation.
 * FIDE's "400-point rule": rating differences greater than 400 are treated as exactly 400.
 * This caps expected scores between 8% and 92%.
 *
 * Note: FIDE dropped this rule for players 2650+ in October 2025, but it still applies
 * to most players and is used by SSF.
 */
export declare const RATING_DIFFERENCE_CAP = 400;
/**
 * Calculate expected score for a player against an opponent
 *
 * Implements FIDE's 400-point rule: rating differences greater than 400
 * are treated as exactly 400 for calculation purposes. This ensures
 * expected scores are capped between 8% and 92%.
 *
 * @param playerRating - Player's current rating
 * @param opponentRating - Opponent's current rating
 * @returns Expected score (0.0 to 1.0, capped at 0.08-0.92 due to 400-point rule)
 *
 * Formula: E = 1 / (1 + 10^((OpponentRating - PlayerRating) / 400))
 * With rating difference capped at +/-400
 */
export declare function calculateExpectedScore(playerRating: number, opponentRating: number): number;
/**
 * Calculate rating change for a single game
 *
 * @param playerRating - Player's current rating
 * @param opponentRating - Opponent's current rating
 * @param actualScore - Actual game result (1.0 = win, 0.5 = draw, 0.0 = loss)
 * @param kFactor - K-factor for rating calculation (typically 40 for juniors, 20 for adults, 10 for 2400+)
 * @returns Rating change (can be positive or negative)
 *
 * Formula: dR = K x (ActualScore - ExpectedScore)
 */
export declare function calculateRatingChange(playerRating: number, opponentRating: number, actualScore: number, kFactor: number): number;
/**
 * Calculate performance rating for a tournament
 *
 * Uses the inverse ELO formula to calculate performance rating.
 *
 * @param opponentRatings - Array of opponent ratings
 * @param score - Total score (wins + 0.5 x draws)
 * @returns Performance rating
 *
 * Formula: Performance = Average opponent rating + d
 * where d = -400 x log10((1/p) - 1) and p is the score percentage
 *
 * Special cases:
 * - 100% score: Use average opponent rating + 800
 * - 0% score: Use average opponent rating - 800
 */
export declare function calculatePerformanceRating(opponentRatings: number[], score: number): number;
/**
 * Calculate total rating change and performance rating for a tournament
 *
 * @param matches - Array of match results
 * @returns Object containing total rating change and performance rating
 */
export interface MatchResult {
    opponentRating: number | null;
    actualScore: number;
}
export interface TournamentRatingStats {
    totalChange: number;
    performanceRating: number;
    gamesWithRatedOpponents: number;
}
export declare function calculateTournamentStats(matches: MatchResult[], playerRating: number, kFactor: number): TournamentRatingStats;
//# sourceMappingURL=eloCalculations.d.ts.map