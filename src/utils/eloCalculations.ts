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
export const RATING_DIFFERENCE_CAP = 400;

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
export function calculateExpectedScore(playerRating: number, opponentRating: number): number {
  // Apply FIDE's 400-point rule: cap rating difference at +/-400
  let ratingDiff = opponentRating - playerRating;
  if (ratingDiff > RATING_DIFFERENCE_CAP) {
    ratingDiff = RATING_DIFFERENCE_CAP;
  } else if (ratingDiff < -RATING_DIFFERENCE_CAP) {
    ratingDiff = -RATING_DIFFERENCE_CAP;
  }

  return 1 / (1 + Math.pow(10, ratingDiff / 400));
}

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
export function calculateRatingChange(
  playerRating: number,
  opponentRating: number,
  actualScore: number,
  kFactor: number
): number {
  const expectedScore = calculateExpectedScore(playerRating, opponentRating);
  const ratingChange = kFactor * (actualScore - expectedScore);
  return Math.round(ratingChange * 10) / 10; // Round to 1 decimal place
}

/**
 * FIDE dp table: rating difference for a fractional score p, for p = 0.50 … 1.00
 * in steps of 0.01 (index = percent − 50). Below 50%, dp(p) = −dp(1 − p).
 *
 * Source: FIDE Rating Regulations, §8.1.1 —
 * https://handbook.fide.com/chapter/B022024
 */
const FIDE_DP_TABLE = [
  0, 7, 14, 21, 29, 36, 43, 50, 57, 65,            // .50 – .59
  72, 80, 87, 95, 102, 110, 117, 125, 133, 141,    // .60 – .69
  149, 158, 166, 175, 184, 193, 202, 211, 220, 230, // .70 – .79
  240, 251, 262, 273, 284, 296, 309, 322, 336, 351, // .80 – .89
  366, 383, 401, 422, 444, 470, 501, 538, 589, 677, // .90 – .99
  800,                                               // 1.00
] as const;

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
export function calculatePerformanceRating(
  opponentRatings: number[],
  score: number
): number {
  const games = opponentRatings.length;
  if (games === 0) {
    return 0;
  }

  const averageOpponentRating = Math.floor(
    opponentRatings.reduce((sum, rating) => sum + rating, 0) / games
  );

  // p as a whole percent, rounded half-up. Working in percent rather than
  // rounding p to two decimals keeps .5 cases exact: 100 × 5 / 8 is exactly
  // 62.5, whereas 0.625 rounded to two decimals can come out as 0.62.
  const percent = Math.min(100, Math.max(0, Math.floor((100 * score) / games + 0.5)));

  const dp = percent >= 50 ? FIDE_DP_TABLE[percent - 50] : -FIDE_DP_TABLE[50 - percent];
  return averageOpponentRating + dp;
}

/**
 * Calculate total rating change and performance rating for a tournament
 *
 * @param matches - Array of match results
 * @returns Object containing total rating change and performance rating
 */
export interface MatchResult {
  opponentRating: number | null;
  actualScore: number; // 1.0 = win, 0.5 = draw, 0.0 = loss
}

export interface TournamentRatingStats {
  totalChange: number;
  performanceRating: number;
  gamesWithRatedOpponents: number;
}

export function calculateTournamentStats(
  matches: MatchResult[],
  playerRating: number,
  kFactor: number
): TournamentRatingStats {
  let totalChange = 0;
  const ratedOpponentRatings: number[] = [];
  let totalScore = 0;

  for (const match of matches) {
    // Only include matches where opponent has a valid rating (not null, undefined, 0, or NaN)
    if (match.opponentRating && match.opponentRating > 0) {
      // Calculate rating change for this match
      const change = calculateRatingChange(
        playerRating,
        match.opponentRating,
        match.actualScore,
        kFactor
      );
      totalChange += change;

      // Track for performance rating calculation
      ratedOpponentRatings.push(match.opponentRating);
      totalScore += match.actualScore;
    }
  }

  const performanceRating = calculatePerformanceRating(ratedOpponentRatings, totalScore);

  return {
    totalChange: Math.round(totalChange * 10) / 10, // Round to 1 decimal
    performanceRating,
    gamesWithRatedOpponents: ratedOpponentRatings.length
  };
}
