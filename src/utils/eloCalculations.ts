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
export const RATING_DIFFERENCE_CAP = 400;

/**
 * FIDE PD table: expected score of the higher-rated player for a rating
 * difference D, as `[upper bound of the D band, PD in hundredths]`. The
 * lower-rated player expects 100 − PD. Differences above the last band (735)
 * give 100. Integer hundredths keep the results exact.
 *
 * Source: FIDE Rating Regulations, §8.1.2 —
 * https://handbook.fide.com/chapter/B022024
 */
const FIDE_PD_TABLE: readonly (readonly [maxDifference: number, pd: number])[] = [
  [3, 50], [10, 51], [17, 52], [25, 53], [32, 54], [39, 55], [46, 56], [53, 57], [61, 58], [68, 59],
  [76, 60], [83, 61], [91, 62], [98, 63], [106, 64], [113, 65], [121, 66], [129, 67], [137, 68], [145, 69],
  [153, 70], [162, 71], [170, 72], [179, 73], [188, 74], [197, 75], [206, 76], [215, 77], [225, 78], [235, 79],
  [245, 80], [256, 81], [267, 82], [278, 83], [290, 84], [302, 85], [315, 86], [328, 87], [344, 88], [357, 89],
  [374, 90], [391, 91], [411, 92], [432, 93], [456, 94], [484, 95], [517, 96], [559, 97], [619, 98], [735, 99],
];

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
export function calculateExpectedScore(
  playerRating: number,
  opponentRating: number,
  options: ExpectedScoreOptions = {}
): number {
  const { capped = true } = options;
  let difference = Math.round(Math.abs(playerRating - opponentRating));
  if (capped) difference = Math.min(difference, RATING_DIFFERENCE_CAP);

  const band = FIDE_PD_TABLE.find(([maxDifference]) => difference <= maxDifference);
  const higher = band ? band[1] : 100;
  return (playerRating >= opponentRating ? higher : 100 - higher) / 100;
}

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
export function calculateRatingChange(
  playerRating: number,
  opponentRating: number,
  actualScore: number,
  kFactor: number,
  options: ExpectedScoreOptions = {}
): number {
  const expectedScore = calculateExpectedScore(playerRating, opponentRating, options);
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
