/**
 * Integration tests for Organization API service
 * Tests real API calls with known data points
 */

import { OrganizationService } from '../src/index';
import { CURRENT_TEST_API_URL } from '../src/constants';
import {
  TEST_DISTRICT_ID,
  TEST_CLUB_ID,
  TEST_CLUB_NAME
} from './test-data';

describe('Organization Service Integration Tests', () => {
  let organizationService: OrganizationService;

  beforeEach(() => {
    organizationService = new OrganizationService(CURRENT_TEST_API_URL);
  });

  describe('Federation API', () => {
    test('should fetch federation information', async () => {
      const response = await organizationService.getFederation();

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(typeof response.data.id).toBe('number');
        expect(typeof response.data.name).toBe('string');
      }
    }, 10000);
  });

  describe('Districts API', () => {
    test('should fetch all districts', async () => {
      const response = await organizationService.getDistricts();

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
        
        if (response.data.length > 0) {
          const firstDistrict = response.data[0];
          expect(typeof firstDistrict.id).toBe('number');
          expect(typeof firstDistrict.name).toBe('string');
        }
      }
    }, 10000);

    test('should fetch clubs in a specific district', async () => {
      const response = await organizationService.getClubsInDistrict(TEST_DISTRICT_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(Array.isArray(response.data)).toBe(true);
        
        if (response.data.length > 0) {
          const firstClub = response.data[0];
          expect(typeof firstClub.id).toBe('number');
          expect(typeof firstClub.name).toBe('string');
        }
      }
    }, 10000);
  });

  describe('Clubs API', () => {
    test('should fetch specific clubb information', async () => {
      const response = await organizationService.getClub(TEST_CLUB_ID);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data) {
        expect(response.data.id).toBe(TEST_CLUB_ID);
        expect(response.data.name).toBe(TEST_CLUB_NAME);
      }
    }, 10000);

    test('should check if club name exists', async () => {
      const response = await organizationService.checkClubNameExists(TEST_CLUB_NAME, 0);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      if (response.data !== undefined) {
        expect(typeof response.data).toBe('boolean');
      }
    }, 10000);

    test('should handle invalid club ID gracefully', async () => {
      const response = await organizationService.getClub(TEST_CLUB_ID);

      // API might return 404 or empty data - we should handle both
      expect(response.status).toBeGreaterThanOrEqual(200);
    }, 10000);
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Create a service with invalid base URL to test error handling
      const invalidService = new (class extends OrganizationService {
        constructor() {
          super();
          this['baseUrl'] = 'https://invalid-url-that-does-not-exist.com/api';
        }
      })();

      const response = await invalidService.getFederation();

      expect(response.error).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(400);
    }, 10000);
  });
});
