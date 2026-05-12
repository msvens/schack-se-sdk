/**
 * Integration tests for Tournament Structure API service
 * Tests real API calls with known data points
 */

import {
  TournamentService,
  TournamentType,
  TeamTournamentPlayerListType,
  isTeamTournament,
  isTeamPairing,
  isSchackfyran,
  isLooseTeamTournament,
} from '../src/index';
import { CURRENT_TEST_API_URL } from '../src/constants';
import {
  TEST_TOURNAMENT_ID,
  TEST_TOURNAMENT_GROUP_ID,
  TEST_TOURNAMENT_CLASS_ID,
  TEST_SEARCH_TERM,
  EXPECTED_TOURNAMENT_NAME,
  TEST_SCHACKFYRAN_TOURNAMENT_ID,
  TEST_SKOLLAGS_TEAM_TOURNAMENT_ID,
  TEST_SKOL_SM_INDIVIDUAL_TOURNAMENT_ID,
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

  /**
   * Empirical reality checks: assert that real tournaments on schack.se are
   * configured the way we documented them, AND that the SDK's predicates
   * classify them correctly. If schack.se changes a tournament's type or
   * player-list type, these will fail and signal that the docs/predicates
   * need a revisit.
   */
  describe('Tournament type classification (empirical reality check)', () => {
    test('Schackfyran tournament is type=SCHACKFYRAN, TEAM_TEAMS, team-identity but individual pairing', async () => {
      const response = await tournamentService.getTournament(TEST_SCHACKFYRAN_TOURNAMENT_ID);
      expect(response.status).toBe(200);
      const t = response.data!;
      expect(t.type).toBe(TournamentType.SCHACKFYRAN);
      expect(t.teamtournamentPlayerListType).toBe(TeamTournamentPlayerListType.TEAM_TEAMS);
      expect(isTeamTournament(t.type)).toBe(true);
      expect(isTeamPairing(t.type)).toBe(false);
      expect(isSchackfyran(t.type)).toBe(true);
      expect(isLooseTeamTournament(t.teamtournamentPlayerListType)).toBe(true);
    }, 10000);

    test('real team Skol-SM is type=ALLSVENSKAN with TEAM_TEAMS (not type=SCHOOL_SM)', async () => {
      const response = await tournamentService.getTournament(TEST_SKOLLAGS_TEAM_TOURNAMENT_ID);
      expect(response.status).toBe(200);
      const t = response.data!;
      expect(t.type).toBe(TournamentType.ALLSVENSKAN);
      expect(t.teamtournamentPlayerListType).toBe(TeamTournamentPlayerListType.TEAM_TEAMS);
      expect(isTeamTournament(t.type)).toBe(true);
      expect(isTeamPairing(t.type)).toBe(true);
      expect(isLooseTeamTournament(t.teamtournamentPlayerListType)).toBe(true);
    }, 10000);

    test('SCHOOL_SM (5) is used in practice for an individual tournament, not a team one', async () => {
      const response = await tournamentService.getTournament(TEST_SKOL_SM_INDIVIDUAL_TOURNAMENT_ID);
      expect(response.status).toBe(200);
      const t = response.data!;
      expect(t.type).toBe(TournamentType.SCHOOL_SM);
      expect(t.teamtournamentPlayerListType).toBe(-1);
      expect(isTeamTournament(t.type)).toBe(false);
      expect(isTeamPairing(t.type)).toBe(false);
      expect(isLooseTeamTournament(t.teamtournamentPlayerListType)).toBe(false);
    }, 10000);
  });
});
