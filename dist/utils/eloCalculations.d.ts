/**
 * ELO rating calculation utilities based on FIDE's rating regulations
 *
 * Expected score and performance use FIDE's lookup tables (§8.1.2 and §8.1.1).
 * Used for display; official ratings are calculated by FIDE monthly.
 */
/**
 * Maximum rating difference used in expected score calculation.
 * FIDE's "400-point rule": rating differences greater than 400 are treated as exactly 400.
 * With FIDE's table this caps expected scores between 0.08 and 0.92. It is the
 * default in {@link calculateExpectedScore} / {@link calculateRatingChange};
 * pass `{ capped: false }` to opt out.
 *
 * Note: FIDE dropped this rule for players 2650+ in October 2025, but it still applies
 * to most players and is used by SSF.
 */
export declare const RATING_DIFFERENCE_CAP = 400;
/** Options for {@link calculateExpectedScore} and {@link calculateRatingChange}. */
export interface ExpectedScoreOptions {
    /**
     * Apply FIDE's 400-point rule (default `true`): a larger rating difference
     * counts as 400. `false` uses the actual difference across the whole table —
     * e.g. for a "what if there were no cap" calculator.
     */
    capped?: boolean;
}
/**
 * Calculate expected score for a player against an opponent
 *
 * Looks up FIDE's table (Rating Regulations §8.1.2) — what FIDE uses for
 * rating changes — rather than the logistic approximation
 * `1 / (1 + 10^(D/400))`, which differs by up to about half a percentage point.
 *
 * By default applies FIDE's 400-point rule ({@link RATING_DIFFERENCE_CAP}), so
 * results lie between 0.08 and 0.92. With `{ capped: false }` the whole table
 * applies: 0.00 to 1.00 (above a difference of 735 the table gives 1.0 / 0.0).
 *
 * @param playerRating - Player's current rating
 * @param opponentRating - Opponent's current rating
 * @param options - `capped` (default `true`)
 * @returns Expected score, in hundredths (e.g. 0.64)
 */
export declare function calculateExpectedScore(playerRating: number, opponentRating: number, options?: ExpectedScoreOptions): number;
/**
 * Calculate rating change for a single game
 *
 * @param playerRating - Player's current rating
 * @param opponentRating - Opponent's current rating
 * @param actualScore - Actual game result (1.0 = win, 0.5 = draw, 0.0 = loss)
 * @param kFactor - K-factor for rating calculation (typically 40 for juniors, 20 for adults, 10 for 2400+)
 * @param options - `capped` (default `true`), passed to {@link calculateExpectedScore}
 * @returns Rating change, rounded to 0.1 (can be positive or negative)
 *
 * Formula: dR = K x (ActualScore - ExpectedScore), with the expected score from FIDE's table
 */
export declare function calculateRatingChange(playerRating: number, opponentRating: number, actualScore: number, kFactor: number, options?: ExpectedScoreOptions): number;
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