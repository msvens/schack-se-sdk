/**
 * Integration tests for Rating Lists API service
 * Tests real API calls with known data points
 */

import { RatingsService } from '../src/index';
import { RatingType, PlayerCategory } from '../src/types';
import { CURRENT_TEST_API_URL } from '../src/constants';
import {
  TEST_RATING_TYPE,
  TEST_RATING_CATEGORY,
  TEST_RATING_DATE,
  TEST_DISTRICT_ID,
  TEST_CLUB_ID
} from './test-data';

describe('Ratings Service Integration Tests', () => {
  let ratingsService: RatingsService;

  beforeEach(() => {
    ratingsService = new RatingsService(CURRENT_TEST_API_URL);
    // Suppress unused variable warning for now
    void ratingsService;
  });

  describe('Federation Rating Lists API', () => {
    test('should fetch federation rating list', async () => {
      const response = await ratingsService.getFederationRatingList(
        TEST_RATING_DATE,
        TEST_RATING_TYPE, 
        TEST_RATING_CATEGORY, 
        
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
        
        if (response.data.length > 0) {
          const firstPlayer = response.data[0];
          expect(typeof firstPlayer.id).toBe('number');
          expect(typeof firstPlayer.firstName).toBe('string');
          expect(typeof firstPlayer.lastName).toBe('string');
          expect(firstPlayer.elo).toBeDefined();
          expect(firstPlayer.lask).toBeDefined();
        }
      }
    }, 30000);

  });

  describe('District Rating Lists API', () => {
    test('should fetch district rating list', async () => {
      const response = await ratingsService.getDistrictRatingList(
        TEST_DISTRICT_ID,
        TEST_RATING_DATE,
        TEST_RATING_TYPE, 
        TEST_RATING_CATEGORY
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
      }
    }, 10000);
  });

  describe('Club Rating Lists API', () => {
    test('should fetch club rating list', async () => {
      const response = await ratingsService.getClubRatingList(
        TEST_CLUB_ID,
        TEST_RATING_DATE,
        TEST_RATING_TYPE, 
        TEST_RATING_CATEGORY, 
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
      }
    }, 10000);

    test('should fetch current club rating list', async () => {
      const response = await ratingsService.getCurrentClubRatingList(
        TEST_CLUB_ID,
        TEST_RATING_TYPE, 
        TEST_RATING_CATEGORY
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
      }
    }, 10000);
  });

  describe('Rating Types and Categories', () => {
    test('should handle different rating types', () => {
      expect(RatingType.STANDARD).toBe(1);
      expect(RatingType.RAPID).toBe(6);
      expect(RatingType.BLITZ).toBe(7);
    });

    test('should handle different player categories', () => {
      expect(PlayerCategory.ALL).toBe(0);
      expect(PlayerCategory.JUNIORS).toBe(1);
      expect(PlayerCategory.WOMEN).toBe(5);
    });
  });
});
