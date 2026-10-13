/**
 * Unit tests for ELO calculation utilities
 * Verifies formulas against known FIDE values
 */

import {
  calculateExpectedScore,
  calculateRatingChange,
  calculatePerformanceRating,
  calculateTournamentStats
} from '../../src/utils/eloCalculations';

describe('eloCalculations', () => {
  describe('calculateExpectedScore', () => {
    it('should return 0.5 for equal ratings', () => {
      expect(calculateExpectedScore(1500, 1500)).toBe(0.5);
      expect(calculateExpectedScore(2000, 2000)).toBe(0.5);
    });

    it('should return higher score for stronger player', () => {
      const expected = calculateExpectedScore(1600, 1500);
      expect(expected).toBeGreaterThan(0.5);
      expect(expected).toBeLessThan(1);
    });

    it('should return lower score for weaker player', () => {
      const expected = calculateExpectedScore(1400, 1500);
      expect(expected).toBeLessThan(0.5);
      expect(expected).toBeGreaterThan(0);
    });

    it('should match FIDE expected score for 400 point difference', () => {
      // 400 points higher should give ~0.909 expected score
      const expected = calculateExpectedScore(1900, 1500);
      expect(expected).toBeCloseTo(0.909, 2);
    });

    it('should match FIDE expected score for 200 point difference', () => {
      // 200 points higher should give ~0.76 expected score
      const expected = calculateExpectedScore(1700, 1500);
      expect(expected).toBeCloseTo(0.76, 2);
    });

    it('should be symmetric (sum to 1)', () => {
      const playerA = 1700;
      const playerB = 1500;
      const expectedA = calculateExpectedScore(playerA, playerB);
      const expectedB = calculateExpectedScore(playerB, playerA);
      expect(expectedA + expectedB).toBeCloseTo(1, 10);
    });

    it('should cap rating difference at 400 points (FIDE 400-point rule)', () => {
      // 500 points difference should be treated as 400
      const expected500 = calculateExpectedScore(2000, 1500);
      const expected400 = calculateExpectedScore(1900, 1500);
      expect(expected500).toBe(expected400);

      // 600 points should also be capped to 400
      const expected600 = calculateExpectedScore(2100, 1500);
      expect(expected600).toBe(expected400);
    });

    it('should cap expected score at ~92% for large positive difference', () => {
      // Any difference >= 400 should give ~0.909 (capped)
      const expected = calculateExpectedScore(2500, 1500); // 1000 point diff
      expect(expected).toBeCloseTo(0.909, 2);
    });

    it('should cap expected score at ~8% for large negative difference', () => {
      // Any difference >= 400 against you should give ~0.091 (capped)
      const expected = calculateExpectedScore(1500, 2500); // -1000 point diff
      expect(expected).toBeCloseTo(0.091, 2);
    });
  });

  describe('calculateRatingChange', () => {
    it('should return positive change for win against equal opponent', () => {
      const change = calculateRatingChange(1500, 1500, 1.0, 20);
      expect(change).toBe(10); // K * (1 - 0.5) = 20 * 0.5 = 10
    });

    it('should return negative change for loss against equal opponent', () => {
      const change = calculateRatingChange(1500, 1500, 0.0, 20);
      expect(change).toBe(-10); // K * (0 - 0.5) = 20 * -0.5 = -10
    });

    it('should return zero change for draw against equal opponent', () => {
      const change = calculateRatingChange(1500, 1500, 0.5, 20);
      expect(change).toBe(0); // K * (0.5 - 0.5) = 0
    });

    it('should return smaller positive change for win against weaker opponent', () => {
      const changeVsEqual = calculateRatingChange(1500, 1500, 1.0, 20);
      const changeVsWeaker = calculateRatingChange(1500, 1300, 1.0, 20);
      expect(changeVsWeaker).toBeLessThan(changeVsEqual);
      expect(changeVsWeaker).toBeGreaterThan(0);
    });

    it('should return larger positive change for win against stronger opponent', () => {
      const changeVsEqual = calculateRatingChange(1500, 1500, 1.0, 20);
      const changeVsStronger = calculateRatingChange(1500, 1700, 1.0, 20);
      expect(changeVsStronger).toBeGreaterThan(changeVsEqual);
    });

    it('should scale with K-factor', () => {
      const changeK20 = calculateRatingChange(1500, 1500, 1.0, 20);
      const changeK40 = calculateRatingChange(1500, 1500, 1.0, 40);
      expect(changeK40).toBe(changeK20 * 2);
    });

    it('should round to one decimal place', () => {
      const change = calculateRatingChange(1520, 1480, 0.5, 20);
      // Expected score ~0.56, so change = 20 * (0.5 - 0.56) = -1.2
      // Use Math.abs to handle -0 vs 0 comparison
      expect(Math.abs(change * 10 % 1)).toBe(0); // Verify no more than 1 decimal
    });
  });

  describe('calculatePerformanceRating', () => {
    it('should return 0 for empty opponent array', () => {
      expect(calculatePerformanceRating([], 0)).toBe(0);
    });

    it('should return avgOpp + 800 for 100% score', () => {
      const opponents = [1500, 1600, 1700];
      const avgOpp = 1600;
      const perf = calculatePerformanceRating(opponents, 3); // 3/3 = 100%
      expect(perf).toBe(avgOpp + 800);
    });

    it('should return avgOpp - 800 for 0% score', () => {
      const opponents = [1500, 1600, 1700];
      const avgOpp = 1600;
      const perf = calculatePerformanceRating(opponents, 0); // 0/3 = 0%
      expect(perf).toBe(avgOpp - 800);
    });

    it('should return average opponent rating for 50% score', () => {
      const opponents = [1500, 1600, 1700];
      const avgOpp = 1600;
      const perf = calculatePerformanceRating(opponents, 1.5); // 1.5/3 = 50%
      expect(perf).toBe(avgOpp);
    });

    it('should return higher rating for higher score percentage', () => {
      const opponents = [1500, 1500, 1500, 1500];
      const perf60 = calculatePerformanceRating(opponents, 2.4); // 60%
      const perf70 = calculatePerformanceRating(opponents, 2.8); // 70%
      expect(perf70).toBeGreaterThan(perf60);
    });

    it('should return integer (rounded) value', () => {
      const opponents = [1500, 1600, 1700, 1800];
      const perf = calculatePerformanceRating(opponents, 2.5);
      expect(Number.isInteger(perf)).toBe(true);
    });

    describe('FIDE dp table (Rating Regulations §8.1.1)', () => {
      // With 100 opponents rated 2000, score s gives p = s/100 exactly: perf − 2000 = dp(p).
      const dp = (percent: number) => calculatePerformanceRating(Array(100).fill(2000), percent) - 2000;

      it('uses the handbook values', () => {
        expect(dp(99)).toBe(677);
        expect(dp(85)).toBe(296);
        expect(dp(67)).toBe(125);
        expect(dp(57)).toBe(50);
        expect(dp(51)).toBe(7);
        expect(dp(50)).toBe(0);
      });

      it('is strictly increasing and antisymmetric around 50%', () => {
        for (let p = 1; p <= 100; p++) expect(dp(p)).toBeGreaterThan(dp(p - 1));
        for (let p = 0; p <= 100; p++) expect(dp(100 - p) + dp(p)).toBe(0);
      });
    });

    describe('rounding, as on member.schack.se', () => {
      const flat = (games: number) => Array(games).fill(2000);

      it('rounds p half-up to whole percent before the lookup', () => {
        expect(calculatePerformanceRating(flat(8), 5)).toBe(2000 + 95);   // .625 → .63
        expect(calculatePerformanceRating(flat(8), 3)).toBe(2000 - 87);   // .375 → .38
        expect(calculatePerformanceRating(flat(8), 7)).toBe(2000 + 336);  // .875 → .88
        expect(calculatePerformanceRating(flat(8), 1)).toBe(2000 - 322);  // .125 → .13
        expect(calculatePerformanceRating(flat(3), 2)).toBe(2000 + 125);  // .667 → .67
        expect(calculatePerformanceRating(flat(3), 1)).toBe(2000 - 125);  // .333 → .33
      });

      it('truncates the average opponent rating', () => {
        // Alvar Stål, Skol-SM 2026 D 13 år: average 1638.86, 4/7 (.57 → +50); official 1688
        expect(calculatePerformanceRating([1458, 1804, 1828, 1555, 1527, 1790, 1510], 4)).toBe(1688);
        // Viet An Phan, LASK Open 2026: average 1501.67, 2/3 (.67 → +125); official 1626
        expect(calculatePerformanceRating([1421, 1603, 1481], 2)).toBe(1626);
      });
    });
  });

  describe('calculateTournamentStats', () => {
    it('should handle empty matches array', () => {
      const stats = calculateTournamentStats([], 1500, 20);
      expect(stats.totalChange).toBe(0);
      expect(stats.performanceRating).toBe(0);
      expect(stats.gamesWithRatedOpponents).toBe(0);
    });

    it('should calculate correct stats for mixed results', () => {
      const matches = [
        { opponentRating: 1500, actualScore: 1.0 },   // Win
        { opponentRating: 1500, actualScore: 0.5 },   // Draw
        { opponentRating: 1500, actualScore: 0.0 },   // Loss
      ];
      const stats = calculateTournamentStats(matches, 1500, 20);

      // Total change should be approximately 0 (win + draw + loss against equal)
      // Win: +10, Draw: 0, Loss: -10
      expect(stats.totalChange).toBeCloseTo(0, 1);
      expect(stats.gamesWithRatedOpponents).toBe(3);
      // Performance rating for 1.5/3 (50%) against 1500 avg should be ~1500
      expect(stats.performanceRating).toBe(1500);
    });

    it('should skip matches with null opponent rating', () => {
      const matches = [
        { opponentRating: 1500, actualScore: 1.0 },
        { opponentRating: null, actualScore: 1.0 },  // Should be skipped
        { opponentRating: 1500, actualScore: 1.0 },
      ];
      const stats = calculateTournamentStats(matches, 1500, 20);

      expect(stats.gamesWithRatedOpponents).toBe(2);
    });

    it('should skip matches with zero opponent rating', () => {
      const matches = [
        { opponentRating: 1500, actualScore: 1.0 },
        { opponentRating: 0, actualScore: 1.0 },  // Should be skipped
      ];
      const stats = calculateTournamentStats(matches, 1500, 20);

      expect(stats.gamesWithRatedOpponents).toBe(1);
    });

    it('should calculate correct total change for all wins', () => {
      const matches = [
        { opponentRating: 1500, actualScore: 1.0 },
        { opponentRating: 1500, actualScore: 1.0 },
      ];
      const stats = calculateTournamentStats(matches, 1500, 20);

      // Each win against equal: +10
      expect(stats.totalChange).toBe(20);
    });

    it('should use provided K-factor', () => {
      const matches = [{ opponentRating: 1500, actualScore: 1.0 }];

      const statsK20 = calculateTournamentStats(matches, 1500, 20);
      const statsK40 = calculateTournamentStats(matches, 1500, 40);

      expect(statsK40.totalChange).toBe(statsK20.totalChange * 2);
    });
  });
});
