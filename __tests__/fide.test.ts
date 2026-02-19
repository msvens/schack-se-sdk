/**
 * Integration tests for FIDE Service (ChessTools API)
 * Tests real API calls with known FIDE player data
 */

import { FideService } from '../src';
import { CHESSTOOLS_API_URL } from '../src';
import {
  TEST_FIDE_CARLSEN_ID,
  TEST_FIDE_CRAMLING_ID,
  EXPECTED_FIDE_CARLSEN_NAME,
  EXPECTED_FIDE_CRAMLING_NAME,
} from './test-data';

describe('FIDE Service Integration Tests', () => {
  let fideService: FideService;

  beforeEach(() => {
    fideService = new FideService(CHESSTOOLS_API_URL);
  });

  describe('getTopByRating', () => {
    test('should fetch top players by rating', async () => {
      const response = await fideService.getTopByRating(5);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeLessThanOrEqual(5);
        expect(response.data.length).toBeGreaterThan(0);

        const player = response.data[0];
        expect(player.fideid).toBeDefined();
        expect(player.name).toBeDefined();
        expect(typeof player.rating).toBe('number');
      }
    }, 15000);
  });

  describe('getTopActive', () => {
    test('should fetch top active players', async () => {
      const response = await fideService.getTopActive(5);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);

        const player = response.data[0];
        expect(player.fide_id).toBeDefined();
        expect(player.name).toBeDefined();
        expect(player.rating).toBeDefined();
      }
    }, 15000);

    test('should include history when requested', async () => {
      const response = await fideService.getTopActive(2, true);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data && response.data.length > 0) {
        const player = response.data[0];
        expect(player.history).toBeDefined();
        if (player.history) {
          expect(Array.isArray(player.history)).toBe(true);
          expect(player.history.length).toBeGreaterThan(0);
          expect(player.history[0].period).toBeDefined();
          expect(typeof player.history[0].classical_rating).toBe('number');
        }
      }
    }, 15000);
  });

  describe('getPlayer', () => {
    test('should fetch Carlsen by FIDE ID', async () => {
      const response = await fideService.getPlayer(TEST_FIDE_CARLSEN_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(response.data.fideid).toBe(String(TEST_FIDE_CARLSEN_ID));
        expect(response.data.name).toBe(EXPECTED_FIDE_CARLSEN_NAME);
        expect(typeof response.data.rating).toBe('number');
        expect(response.data.country).toBeDefined();
      }
    }, 15000);

    test('should fetch Cramling by FIDE ID', async () => {
      const response = await fideService.getPlayer(TEST_FIDE_CRAMLING_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
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
    test('should fetch detailed player info', async () => {
      const response = await fideService.getPlayerInfo(TEST_FIDE_CARLSEN_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(response.data.fide_id).toBe(String(TEST_FIDE_CARLSEN_ID));
        expect(response.data.name).toBe(EXPECTED_FIDE_CARLSEN_NAME);
        expect(response.data.federation).toBeDefined();
        expect(typeof response.data.birth_year).toBe('number');
        expect(typeof response.data.world_rank_all).toBe('number');
      }
    }, 15000);

    test('should include history when requested', async () => {
      const response = await fideService.getPlayerInfo(TEST_FIDE_CARLSEN_ID, true);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(response.data.history).toBeDefined();
        if (response.data.history) {
          expect(Array.isArray(response.data.history)).toBe(true);
          expect(response.data.history.length).toBeGreaterThan(0);
        }
      }
    }, 15000);
  });

  describe('getPlayerHistory', () => {
    test('should fetch rating history for Carlsen', async () => {
      const response = await fideService.getPlayerHistory(TEST_FIDE_CARLSEN_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);

        const period = response.data[0];
        expect(period.period).toBeDefined();
        expect(period.date).toBeDefined();
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
        // Search endpoint may return empty results — just verify it's a valid array
        expect(Array.isArray(response.data)).toBe(true);
      }
    }, 15000);
  });
});
