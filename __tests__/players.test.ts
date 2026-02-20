/**
 * Integration tests for Player API service
 * Tests real API calls with known data points
 */

import { PlayerService } from '../src/services/players';
import { PlayerInfoDto, MemberDateDto } from '../src/types';
import { SSF_PROD_API_URL } from '../src/constants';
import {
  TEST_PLAYER_ID,
  TEST_PLAYER_DATE,
  TEST_PLAYER_FIDE_ID,
  EXPECTED_PLAYER_FIRST_NAME,
  EXPECTED_PLAYER_LAST_NAME,
  EXPECTED_CLUB_NAME
} from './test-data';

describe('Player Service Integration Tests', () => {
  let playerService: PlayerService;

  beforeEach(() => {
    playerService = new PlayerService(SSF_PROD_API_URL);
  });

  describe('Player Information API', () => {
    test('should fetch player info with current date', async () => {
      const response = await playerService.getPlayerInfo(TEST_PLAYER_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const player: PlayerInfoDto = response.data;
        expect(player.id).toBe(TEST_PLAYER_ID);
        expect(player.firstName).toBe(EXPECTED_PLAYER_FIRST_NAME);
        expect(player.lastName).toBe(EXPECTED_PLAYER_LAST_NAME);
        expect(player.club).toBe(EXPECTED_CLUB_NAME);
        expect(typeof player.elo.rating).toBe('number');
        expect(player.lask).toBeDefined(); // Now returns MemberLASKRatingDTO, not null
      }
    }, 10000); // 10 second timeout for API calls

    test('should fetch player info with specific date', async () => {
      const response = await playerService.getPlayerInfo(TEST_PLAYER_ID, TEST_PLAYER_DATE);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const player: PlayerInfoDto = response.data;
        expect(player.id).toBe(TEST_PLAYER_ID);
        expect(player.firstName).toBe(EXPECTED_PLAYER_FIRST_NAME);
        expect(player.lastName).toBe(EXPECTED_PLAYER_LAST_NAME);
        expect(player.club).toBe(EXPECTED_CLUB_NAME);
        // For historical dates, elo might be null
        if (player.elo) {
          expect(typeof player.elo.rating).toBe('number');
        }
        expect(player.lask).toBeDefined(); // Now returns MemberLASKRatingDTO, not null
      }
    }, 10000);

    test('should get player info by FIDE ID', async () => {
      const response = await playerService.getPlayerByFIDEId(TEST_PLAYER_FIDE_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const player: PlayerInfoDto = response.data;
        expect(player.id).toBe(TEST_PLAYER_ID);
        expect(player.firstName).toBe(EXPECTED_PLAYER_FIRST_NAME);
        expect(player.lastName).toBe(EXPECTED_PLAYER_LAST_NAME);
        expect(player.club).toBe(EXPECTED_CLUB_NAME);
        expect(typeof player.elo.rating).toBe('number');
        expect(player.lask).toBeDefined(); // Now returns MemberLASKRatingDTO, not null
      }
    }, 10000);

    test('should get player info by FIDE ID with specific date', async () => {
      const response = await playerService.getPlayerByFIDEId(TEST_PLAYER_FIDE_ID, TEST_PLAYER_DATE);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const player: PlayerInfoDto = response.data;
        expect(player.id).toBe(TEST_PLAYER_ID);
        expect(player.firstName).toBe(EXPECTED_PLAYER_FIRST_NAME);
        expect(player.lastName).toBe(EXPECTED_PLAYER_LAST_NAME);
        expect(player.club).toBe(EXPECTED_CLUB_NAME);
        // For historical dates, elo might be null
        if (player.elo) {
          expect(typeof player.elo.rating).toBe('number');
        }
        expect(player.lask).toBeDefined(); // Now returns MemberLASKRatingDTO, not null
      }
    }, 10000);

    test('should handle invalid player ID gracefully', async () => {
      const response = await playerService.getPlayerInfo(999999);

      // API might return 404 or empty data - we should handle both
      expect(response.status).toBeGreaterThanOrEqual(200);
    }, 10000);
  });

  describe('Player Search API', () => {
    test('should search player by name', async () => {
      const response = await playerService.searchPlayer(
        EXPECTED_PLAYER_FIRST_NAME,
        EXPECTED_PLAYER_LAST_NAME
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data && response.data.length > 0) {
        // Should find our test player
        const foundPlayer = response.data.find(p => p.id === TEST_PLAYER_ID);
        expect(foundPlayer).toBeDefined();
      }
    }, 10000);

    test('should handle search with no results', async () => {
      const response = await playerService.searchPlayer('Xyzzy', 'Nonexistent');

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      // May return empty array
      expect(Array.isArray(response.data)).toBe(true);
    }, 10000);
  });

  describe('Player List API', () => {
    test('should fetch multiple players and dates in a single call', async () => {
      const members: MemberDateDto[] = [
        { id: TEST_PLAYER_ID, date: '2025-06-01' },
        { id: 464113, date: '2025-06-01' },
        { id: TEST_PLAYER_ID, date: '2025-12-01' },
        { id: 464113, date: '2025-12-01' }
      ];
      const response = await playerService.getPlayerList(members);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data) {
        expect(response.data.length).toBe(4);

        // Verify player identities and that elo dates match requested dates
        const [olle1, lukas1, olle2, lukas2] = response.data;

        expect(olle1.id).toBe(TEST_PLAYER_ID);
        expect(olle1.firstName).toBe(EXPECTED_PLAYER_FIRST_NAME);
        expect(olle1.elo.date).toBe('2025-06-01');
        expect(olle1.elo.rating).toBe(1649);

        expect(lukas1.id).toBe(464113);
        expect(lukas1.firstName).toBe('Lukas');
        expect(lukas1.lastName).toBe('Willstedt');
        expect(lukas1.elo.date).toBe('2025-06-01');
        expect(lukas1.elo.rating).toBe(2055);

        expect(olle2.id).toBe(TEST_PLAYER_ID);
        expect(olle2.elo.date).toBe('2025-12-01');

        expect(lukas2.id).toBe(464113);
        expect(lukas2.elo.date).toBe('2025-12-01');
      }
    }, 10000);
  });

  describe('Player Rating History API', () => {
    test('should fetch player ELO history', async () => {
      const response = await playerService.getPlayerEloHistory(TEST_PLAYER_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data && response.data.length > 0) {
        // Each history entry should have elo and lask rating info
        const entry = response.data[0];
        expect(entry.elo).toBeDefined();
        expect(entry.lask).toBeDefined();
      }
    }, 15000); // Longer timeout as this makes multiple API calls

    test('should fetch player ELO history with custom date range and correct order', async () => {
      const response = await playerService.getPlayerEloHistory(TEST_PLAYER_ID, '2025-06', '2026-01');

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data) {
        expect(response.data.length).toBe(8); // 8 months inclusive

        // Verify dates are returned latest first
        const expectedDates = [
          '2026-01-01', '2025-12-01', '2025-11-01', '2025-10-01',
          '2025-09-01', '2025-08-01', '2025-07-01', '2025-06-01'
        ];
        const actualDates = response.data.map(entry => entry.elo.date);
        expect(actualDates).toEqual(expectedDates);

        // Verify specific known ratings
        expect(response.data[0].elo.rating).toBe(1582); // 2026-01
        expect(response.data[7].elo.rating).toBe(1649); // 2025-06
      }
    }, 15000);
  });

  describe('Date Formatting', () => {
    test('should format dates correctly for API calls', () => {
      const testDate = new Date('2024-03-15T10:30:00Z');
      const formatted = playerService['formatDateToString'](testDate);

      expect(formatted).toBe('2024-03-15');
    });

    test('should handle current date formatting', () => {
      const currentFormatted = playerService['getCurrentDate']();

      // Should match YYYY-MM-DD format
      expect(currentFormatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Create a service with invalid base URL to test error handling
      const invalidService = new (class extends PlayerService {
        constructor() {
          super();
          this['baseUrl'] = 'https://invalid-url-that-does-not-exist.com/api';
        }
      })();

      const response = await invalidService.getPlayerInfo(TEST_PLAYER_ID);

      expect(response.error).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(400);
    }, 10000);
  });
});
