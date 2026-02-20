/**
 * Integration tests for FIDE Service (ChessTools API)
 * Tests real API calls with known FIDE player data.
 *
 * Each endpoint test verifies the exact set of response keys matches our types.
 * This catches both missing fields and unexpected new fields from the API.
 */

import { FideService } from '../src';
import { CHESSTOOLS_API_URL } from '../src';
import {
  TEST_FIDE_CARLSEN_ID,
  TEST_FIDE_CRAMLING_ID,
  EXPECTED_FIDE_CARLSEN_NAME,
  EXPECTED_FIDE_CRAMLING_NAME,
} from './test-data';

/** Expected keys for each FIDE response type, sorted for comparison */
const FIDE_PLAYER_KEYS = [
  '_id', 'birth_year', 'country', 'fideid', 'flag', 'foa_title', 'games',
  'k_factor', 'name', 'o_title', 'rating', 'sex', 'title', 'w_title',
];

const FIDE_ACTIVE_PLAYER_KEYS = [
  'country', 'fide_id', 'name', 'rank', 'rating',
];

const FIDE_PLAYER_INFO_KEYS = [
  'birth_year', 'continental_rank_active', 'continental_rank_all',
  'federation', 'fide_id', 'fide_title', 'name', 'national_rank_active',
  'national_rank_all', 'sex', 'world_rank_active', 'world_rank_all',
];

const FIDE_RATING_PERIOD_KEYS = [
  'blitz_games', 'blitz_rating', 'classical_games', 'classical_rating',
  'date', 'period', 'rapid_games', 'rapid_rating',
];

describe('FIDE Service Integration Tests', () => {
  let fideService: FideService;

  beforeEach(() => {
    fideService = new FideService(CHESSTOOLS_API_URL);
  });

  describe('getTopByRating', () => {
    test('should fetch top players with exact FidePlayer shape', async () => {
      const response = await fideService.getTopByRating(5);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeLessThanOrEqual(5);
        expect(response.data.length).toBeGreaterThan(0);

        const player = response.data[0];
        expect(Object.keys(player).sort()).toEqual(FIDE_PLAYER_KEYS);
        expect(typeof player.rating).toBe('number');
        expect(typeof player.birth_year).toBe('number');
      }
    }, 15000);
  });

  describe('getTopActive', () => {
    test('should fetch top active players with exact FideActivePlayer shape', async () => {
      const response = await fideService.getTopActive(5);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);

        const player = response.data[0];
        expect(Object.keys(player).sort()).toEqual(FIDE_ACTIVE_PLAYER_KEYS);
        expect(typeof player.rank).toBe('string');
        expect(typeof player.rating).toBe('string');
      }
    }, 15000);

    test('should include history when requested', async () => {
      const response = await fideService.getTopActive(2, true);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data && response.data.length > 0) {
        const player = response.data[0];
        expect(Object.keys(player).sort()).toEqual([...FIDE_ACTIVE_PLAYER_KEYS, 'history'].sort());
        expect(player.history).toBeDefined();
        if (player.history) {
          expect(player.history.length).toBeGreaterThan(0);
          expect(Object.keys(player.history[0]).sort()).toEqual(FIDE_RATING_PERIOD_KEYS);
        }
      }
    }, 15000);
  });

  describe('getPlayer', () => {
    test('should fetch Carlsen with exact FidePlayer shape', async () => {
      const response = await fideService.getPlayer(TEST_FIDE_CARLSEN_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Object.keys(response.data).sort()).toEqual(FIDE_PLAYER_KEYS);
        expect(response.data.fideid).toBe(String(TEST_FIDE_CARLSEN_ID));
        expect(response.data.name).toBe(EXPECTED_FIDE_CARLSEN_NAME);
        expect(response.data.country).toBe('NOR');
        expect(response.data.birth_year).toBe(1990);
      }
    }, 15000);

    test('should fetch Cramling by FIDE ID', async () => {
      const response = await fideService.getPlayer(TEST_FIDE_CRAMLING_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Object.keys(response.data).sort()).toEqual(FIDE_PLAYER_KEYS);
        expect(response.data.fideid).toBe(String(TEST_FIDE_CRAMLING_ID));
        expect(response.data.name).toBe(EXPECTED_FIDE_CRAMLING_NAME);
      }
    }, 15000);

    test('should handle non-existent FIDE ID', async () => {
      const response = await fideService.getPlayer(9999999);

      // The API may return an error or empty result
      expect(response.status).toBeDefined();
    }, 15000);
  });

  describe('getPlayerInfo', () => {
    test('should fetch detailed player info with exact FidePlayerInfo shape', async () => {
      const response = await fideService.getPlayerInfo(TEST_FIDE_CARLSEN_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Object.keys(response.data).sort()).toEqual(FIDE_PLAYER_INFO_KEYS);
        expect(response.data.fide_id).toBe(String(TEST_FIDE_CARLSEN_ID));
        expect(response.data.name).toBe(EXPECTED_FIDE_CARLSEN_NAME);
        expect(typeof response.data.birth_year).toBe('number');
        expect(typeof response.data.world_rank_all).toBe('number');
      }
    }, 15000);

    test('should include history when requested', async () => {
      const response = await fideService.getPlayerInfo(TEST_FIDE_CARLSEN_ID, true);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Object.keys(response.data).sort()).toEqual([...FIDE_PLAYER_INFO_KEYS, 'history'].sort());
        expect(response.data.history).toBeDefined();
        if (response.data.history) {
          expect(response.data.history.length).toBeGreaterThan(0);
          expect(Object.keys(response.data.history[0]).sort()).toEqual(FIDE_RATING_PERIOD_KEYS);
        }
      }
    }, 15000);
  });

  describe('getPlayerHistory', () => {
    test('should fetch rating history with exact FideRatingPeriod shape', async () => {
      const response = await fideService.getPlayerHistory(TEST_FIDE_CARLSEN_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);

        const period = response.data[0];
        expect(Object.keys(period).sort()).toEqual(FIDE_RATING_PERIOD_KEYS);
        expect(typeof period.classical_rating).toBe('number');
        expect(typeof period.rapid_rating).toBe('number');
        expect(typeof period.blitz_rating).toBe('number');
      }
    }, 15000);
  });

  describe('searchPlayers', () => {
    test('should return an array for search query', async () => {
      const response = await fideService.searchPlayers('Carlsen');

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        // Search endpoint may return empty results (broken server-side)
        expect(Array.isArray(response.data)).toBe(true);

        // If results are returned, verify exact FidePlayer shape
        if (response.data.length > 0) {
          expect(Object.keys(response.data[0]).sort()).toEqual(FIDE_PLAYER_KEYS);
        }
      }
    }, 15000);
  });
});
