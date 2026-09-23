/**
 * Integration tests for Tournament Results API service
 * Tests real API calls with known data points
 */

import { ResultsService } from '../src/index';
import { TeamTournamentEndResultDto, TournamentEndResultDto, TournamentRoundResultDto } from '../src/types';
import { CURRENT_TEST_API_URL } from '../src/constants';
import {
  TEST_RESULTS_GROUP_ID,
  TEST_RESULTS_TEAM_GROUP_ID,
  TEST_LOOSE_TEAM_GROUP_ID,
  TEST_RESULTS_MEMBER_ID
} from './test-data';
import { ssfUnreachable } from './helpers/liveProbe';

// Skip the live suite when member.schack.se is unreachable so an outage yellows
// the run instead of failing it; a contract drift (host up, shape changed) still
// fails. See __tests__/helpers/liveProbe.ts.
const SSF_DOWN = await ssfUnreachable();

describe.skipIf(SSF_DOWN)('Results Service Integration Tests', () => {
  let resultsService: ResultsService;

  beforeEach(() => {
    resultsService = new ResultsService(CURRENT_TEST_API_URL);
  });

  describe('Tournament Results API', () => {
    test('should fetch tournament results', async () => {
      const response = await resultsService.getTournamentResults(TEST_RESULTS_GROUP_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const results: TournamentEndResultDto[] = response.data;
        expect(Array.isArray(results)).toBe(true);

        if (results.length > 0) {
          const firstResult: TournamentEndResultDto = results[0];
          expect(typeof firstResult.points).toBe('number');
          expect(typeof firstResult.place).toBe('number');
          expect(firstResult.playerInfo).toBeDefined();
          expect(typeof firstResult.playerInfo.id).toBe('number');
          expect(typeof firstResult.playerInfo.firstName).toBe('string');
        }
      }
    }, 10000);

    test('should fetch team tournament results', async () => {
      const response = await resultsService.getTeamTournamentResults(TEST_RESULTS_TEAM_GROUP_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const results: TeamTournamentEndResultDto[] = response.data;
        expect(Array.isArray(results)).toBe(true);

        if (results.length > 0) {
          const firstResult: TeamTournamentEndResultDto = results[0];
          expect(typeof firstResult.points).toBe('number');
          expect(typeof firstResult.place).toBe('number');
          expect(typeof firstResult.teamNumber).toBe('number');
        }
      }
    }, 10000);

    // Contract guard for the TeamDTO rollout (SSF, September 2026). A team
    // standings row identifies its contender through exactly one of `club` or
    // `team`; these two tests pin both halves, so a regression on either side
    // — loose names disappearing again, or both fields starting to populate —
    // fails here rather than silently rendering wrong names downstream.
    test('loose (TEAM_TEAMS) rows carry team names and no club', async () => {
      const response = await resultsService.getTeamTournamentResults(TEST_LOOSE_TEAM_GROUP_ID);

      expect(response.status).toBe(200);
      const results = response.data as TeamTournamentEndResultDto[];
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      for (const row of results) {
        expect(row.club).toBeNull();
        expect(row.team).not.toBeNull();
        expect(typeof row.team!.name).toBe('string');
        expect(row.team!.name.trim().length).toBeGreaterThan(0);
        // The team id is the row's contenderId — this is what lets the
        // standings formatter name team round results, which carry only ids.
        expect(row.team!.id).toBe(row.contenderId);
      }
    }, 10000);

    test('club-based team rows carry a club and no team', async () => {
      const response = await resultsService.getTeamTournamentResults(TEST_RESULTS_TEAM_GROUP_ID);

      expect(response.status).toBe(200);
      const results = response.data as TeamTournamentEndResultDto[];
      expect(results.length).toBeGreaterThan(0);

      for (const row of results) {
        expect(row.team).toBeNull();
        expect(row.club).not.toBeNull();
      }
    }, 10000);

    test('should fetch member tournament results', async () => {
      const response = await resultsService.getMemberTournamentResults(TEST_RESULTS_MEMBER_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const results: TournamentEndResultDto[] = response.data;
        expect(Array.isArray(results)).toBe(true);

        if (results.length > 0) {
          const firstResult: TournamentEndResultDto = results[0];
          expect(typeof firstResult.points).toBe('number');
          expect(typeof firstResult.place).toBe('number');
          // playerInfo might be null for some results
          if (firstResult.playerInfo) {
            expect(typeof firstResult.playerInfo.id).toBe('number');
            expect(typeof firstResult.playerInfo.firstName).toBe('string');
          }
        }
      }
    }, 10000);
  });

  describe('Tournament Round Results API', () => {
    test('should fetch tournament round results', async () => {
      const response = await resultsService.getTournamentRoundResults(TEST_RESULTS_GROUP_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const roundResults: TournamentRoundResultDto[] = response.data;
        expect(Array.isArray(roundResults)).toBe(true);

        if (roundResults.length > 0) {
          const firstRound: TournamentRoundResultDto = roundResults[0];
          expect(typeof firstRound.id).toBe('number');
          expect(typeof firstRound.roundNr).toBe('number');
          expect(typeof firstRound.finalized).toBe('boolean');
          expect(Array.isArray(firstRound.games)).toBe(true);
        }
      }
    }, 10000);

    test('should fetch team round results', async () => {
      const response = await resultsService.getTeamRoundResults(TEST_RESULTS_TEAM_GROUP_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const roundResults: TournamentRoundResultDto[] = response.data;
        expect(Array.isArray(roundResults)).toBe(true);

        if (roundResults.length > 0) {
          const firstRound: TournamentRoundResultDto = roundResults[0];
          expect(typeof firstRound.id).toBe('number');
          expect(typeof firstRound.roundNr).toBe('number');
          expect(typeof firstRound.finalized).toBe('boolean');
          expect(Array.isArray(firstRound.games)).toBe(true);
        }
      }
    }, 10000);

    test('should fetch team member round results', async () => {
      const response = await resultsService.getTeamMemberRoundResults(TEST_RESULTS_TEAM_GROUP_ID, TEST_RESULTS_MEMBER_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        const roundResults: TournamentRoundResultDto[] = response.data;
        expect(Array.isArray(roundResults)).toBe(true);

        if (roundResults.length > 0) {
          const firstRound: TournamentRoundResultDto = roundResults[0];
          expect(typeof firstRound.id).toBe('number');
          expect(typeof firstRound.roundNr).toBe('number');
          expect(typeof firstRound.finalized).toBe('boolean');
          expect(Array.isArray(firstRound.games)).toBe(true);
        }
      }
    }, 10000);
  });

  describe('Member Games API', () => {
    test('should fetch all games for a member', async () => {
      const response = await resultsService.getMemberGames(TEST_RESULTS_MEMBER_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);

        if (response.data.length > 0) {
          const game = response.data[0];
          // Games should have basic game info
          expect(game.groupiD).toBeDefined();
          expect(game.result).toBeDefined();
        }
      }
    }, 10000);
  });
});
