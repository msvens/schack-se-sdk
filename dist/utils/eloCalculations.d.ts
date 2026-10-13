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
 * Matches the PERF column on member.schack.se / resultat.schack.se:
 * Performance = ⌊average opponent rating⌋ + dp(p), with dp looked up in FIDE's
 * table ({@link FIDE_DP_TABLE}) and p = score / games rounded half-up to two
 * decimals. ±800 at 100% / 0% comes from the table.
 *
 * The table is FIDE's; the rounding of p and the truncation of the average are
 * not FIDE-specified — they are what the official site does, verified exactly
 * against its published values (__tests__/fixtures/official-performance.json).
 *
 * Callers pass rated games only: unrated opponents are left out, not counted
 * as zero. The score is 1 / ½ / 0 per game even in 3/2/1 point-system groups.
 *
 * @param opponentRatings - Ratings of the rated opponents, one per game
 * @param score - Total score against them (wins + 0.5 × draws)
 * @returns Performance rating, or 0 when there are no rated games
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