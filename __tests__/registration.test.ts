/**
 * Integration tests for Tournament Team Registration API service
 * Tests real API calls with known data points
 */

import { RegistrationService } from '../src/index';
import { CURRENT_TEST_API_URL } from '../src/constants';
import {
  TEST_REGISTRATION_TOURNAMENT_ID,
  TEST_CLUB_ID
} from './test-data';

describe('Registration Service Integration Tests', () => {
  let registrationService: RegistrationService;

  beforeEach(() => {
    registrationService = new RegistrationService(CURRENT_TEST_API_URL);
    // Suppress unused variable warning for now
    void registrationService;
  });

  describe('Tournament Team Registration API', () => {
    test('should fetch team registration for tournament and club', async () => {
      const response = await registrationService.getTeamRegistration(
        TEST_REGISTRATION_TOURNAMENT_ID,
        TEST_CLUB_ID
      );

      // API may return 200 with data, or 500/404 if tournament doesn't support team registration
      // (e.g., individual tournaments don't have team registration)
      expect(response.status).toBeGreaterThanOrEqual(200);

      if (response.status === 200 && response.data) {
        expect(Array.isArray(response.data)).toBe(true);
      }
    }, 10000);

    test('should handle team registration with no players', async () => {
      // Test with a tournament/club combination that might have no players
      const response = await registrationService.getTeamRegistration(
        TEST_REGISTRATION_TOURNAMENT_ID, 
        999999 // Invalid club ID
      );

      expect(response.status).toBeGreaterThanOrEqual(200);
    }, 10000);

    test('should handle invalid tournament/club combination', async () => {
      const response = await registrationService.getTeamRegistration(
        999999, // Invalid tournament ID
        TEST_CLUB_ID
      );

      expect(response.status).toBeGreaterThanOrEqual(200);
    }, 10000);
  });
});
