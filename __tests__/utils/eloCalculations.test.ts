/**
 * Unit tests for ELO calculation utilities
 */

import {
  calculateExpectedScore,
  calculateRatingChange,
  calculatePerformanceRating,
  calculateTournamentStats,
  RATING_DIFFERENCE_CAP
} from '../../src/utils/eloCalculations';

describe('ELO Calculation Utilities', () => {
  describe('calculateExpectedScore', () => {
    test('equal ratings should give 0.5 expected score', () => {
      const expected = calculateExpectedScore(1500, 1500);
      expect(expected).toBeCloseTo(0.5, 4);
    });

    test('higher rated player should have higher expected score', () => {
      const expected = calculateExpectedScore(1600, 1400);
      expect(expected).toBeGreaterThan(0.5);
      expect(expected).toBeCloseTo(0.76, 2); // ~76% expected
    });

    test('lower rated player should have lower expected score', () => {
      const expected = calculateExpectedScore(1400, 1600);
      expect(expected).toBeLessThan(0.5);
      expect(expected).toBeCloseTo(0.24, 2); // ~24% expected
    });

    test('should cap at 400 rating difference (92% max)', () => {
      // 500 point difference should be capped at 400
      const expected = calculateExpectedScore(2000, 1500);
      const expectedCapped = calculateExpectedScore(1900, 1500);
      expect(expected).toBeCloseTo(expectedCapped, 4);
      // 400 point advantage gives ~91% expected score
      expect(expected).toBeGreaterThan(0.9);
    });

    test('should cap at -400 rating difference (8% min)', () => {
      // 500 point difference should be capped at 400
      const expected = calculateExpectedScore(1500, 2000);
      const expectedCapped = calculateExpectedScore(1500, 1900);
      expect(expected).toBeCloseTo(expectedCapped, 4);
      // 400 point disadvantage gives ~9% expected score
      expect(expected).toBeLessThan(0.1);
    });
  });

  describe('calculateRatingChange', () => {
    test('win against equal opponent with K=20 should gain ~10 points', () => {
      const change = calculateRatingChange(1500, 1500, 1.0, 20);
      expect(change).toBeCloseTo(10, 0);
    });

    test('loss against equal opponent with K=20 should lose ~10 points', () => {
      const change = calculateRatingChange(1500, 1500, 0.0, 20);
      expect(change).toBeCloseTo(-10, 0);
    });

    test('draw against equal opponent should give 0 change', () => {
      const change = calculateRatingChange(1500, 1500, 0.5, 20);
      expect(change).toBeCloseTo(0, 1);
    });

    test('win against higher rated should give more points', () => {
      const changeVsEqual = calculateRatingChange(1500, 1500, 1.0, 20);
      const changeVsHigher = calculateRatingChange(1500, 1700, 1.0, 20);
      expect(changeVsHigher).toBeGreaterThan(changeVsEqual);
    });

    test('win against lower rated should give fewer points', () => {
      const changeVsEqual = calculateRatingChange(1500, 1500, 1.0, 20);
      const changeVsLower = calculateRatingChange(1500, 1300, 1.0, 20);
      expect(changeVsLower).toBeLessThan(changeVsEqual);
    });

    test('K=40 should give double the change of K=20', () => {
      const changeK20 = calculateRatingChange(1500, 1600, 1.0, 20);
      const changeK40 = calculateRatingChange(1500, 1600, 1.0, 40);
      expect(changeK40).toBeCloseTo(changeK20 * 2, 1);
    });
  });

  describe('calculatePerformanceRating', () => {
    test('50% score should equal average opponent rating', () => {
      const opponents = [1500, 1600, 1400];
      const score = 1.5; // 50%
      const performance = calculatePerformanceRating(opponents, score);
      expect(performance).toBeCloseTo(1500, -1); // Average is 1500
    });

    test('100% score should add 800 to average', () => {
      const opponents = [1500, 1600, 1400];
      const score = 3.0; // 100%
      const performance = calculatePerformanceRating(opponents, score);
      expect(performance).toBe(2300); // 1500 + 800
    });

    test('0% score should subtract 800 from average', () => {
      const opponents = [1500, 1600, 1400];
      const score = 0.0; // 0%
      const performance = calculatePerformanceRating(opponents, score);
      expect(performance).toBe(700); // 1500 - 800
    });

    test('empty opponents should return 0', () => {
      const performance = calculatePerformanceRating([], 0);
      expect(performance).toBe(0);
    });

    test('75% score should give higher than average', () => {
      const opponents = [1500, 1500, 1500, 1500];
      const score = 3.0; // 75%
      const performance = calculatePerformanceRating(opponents, score);
      expect(performance).toBeGreaterThan(1500);
    });
  });

  describe('calculateTournamentStats', () => {
    test('should calculate correct total change', () => {
      const matches = [
        { opponentRating: 1500, actualScore: 1.0 },
        { opponentRating: 1500, actualScore: 0.5 },
        { opponentRating: 1500, actualScore: 0.0 },
      ];
      const stats = calculateTournamentStats(matches, 1500, 20);

      // Win +10, Draw 0, Loss -10 = 0 total
      expect(stats.totalChange).toBeCloseTo(0, 1);
      expect(stats.gamesWithRatedOpponents).toBe(3);
    });

    test('should ignore opponents with null ratings', () => {
      const matches = [
        { opponentRating: 1500, actualScore: 1.0 },
        { opponentRating: null, actualScore: 1.0 },
        { opponentRating: 0, actualScore: 1.0 },
      ];
      const stats = calculateTournamentStats(matches, 1500, 20);

      expect(stats.gamesWithRatedOpponents).toBe(1);
    });

    test('should calculate performance rating', () => {
      const matches = [
        { opponentRating: 1500, actualScore: 1.0 },
        { opponentRating: 1600, actualScore: 1.0 },
        { opponentRating: 1400, actualScore: 1.0 },
      ];
      const stats = calculateTournamentStats(matches, 1500, 20);

      // 100% score = average + 800 = 1500 + 800 = 2300
      expect(stats.performanceRating).toBe(2300);
    });
  });

  describe('RATING_DIFFERENCE_CAP', () => {
    test('should be 400 per FIDE rules', () => {
      expect(RATING_DIFFERENCE_CAP).toBe(400);
    });
  });
});
