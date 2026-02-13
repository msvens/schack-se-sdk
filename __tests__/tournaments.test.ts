/**
 * Integration tests for Tournament Structure API service
 * Tests real API calls with known data points
 */

import { TournamentService } from '../src/index';
import { CURRENT_TEST_API_URL } from '../src/constants';
import {
  TEST_TOURNAMENT_ID,
  TEST_TOURNAMENT_GROUP_ID,
  TEST_TOURNAMENT_CLASS_ID,
  TEST_SEARCH_TERM,
  EXPECTED_TOURNAMENT_NAME
} from './test-data';


describe('Tournament Service Integration Tests', () => {
  let tournamentService: TournamentService;

  beforeEach(() => {
    tournamentService = new TournamentService(CURRENT_TEST_API_URL);
  });

  describe('Tournament Structure API', () => {
    test('should fetch tournament by ID', async () => {
        const response = await tournamentService.getTournament(TEST_TOURNAMENT_ID);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data?.id).toBe(TEST_TOURNAMENT_ID);
        expect(response.data?.name).toBe(EXPECTED_TOURNAMENT_NAME);
    }, 10000);

    test('should fetch tournament by group ID', async () => {
        const response = await tournamentService.getTournamentFromGroup(TEST_TOURNAMENT_GROUP_ID);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data?.id).toBe(TEST_TOURNAMENT_ID);

    }, 10000);

    test('should fetch tournament by class ID', async () => {
      const response = await tournamentService.getTournamentFromClass(TEST_TOURNAMENT_CLASS_ID);
      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe(TEST_TOURNAMENT_ID);
    }, 10000);
  });

  describe('Tournament Search API', () => {
    test('should search tournaments by name', async () => {
      const response = await tournamentService.searchGroups(TEST_SEARCH_TERM);
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data?.length).toBeGreaterThan(0);
      expect(response.data?.[0].name).toBe("SM-gruppen");
    }, 10000);

    test('should fetch upcoming tournaments', async () => {
      const response = await tournamentService.searchComingTournaments();
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      // May return empty array if no upcoming tournaments, that's valid
      expect(Array.isArray(response.data)).toBe(true);
    }, 10000);

    test('should search recently updated tournaments', async () => {
      // Search for tournaments updated in the last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await tournamentService.searchUpdatedTournaments(
        startDate.toISOString(),
        endDate.toISOString()
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    }, 10000);
  });
});
