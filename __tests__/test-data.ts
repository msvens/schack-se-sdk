import { PlayerCategory, RatingType } from "../src/types";

/**
 * Centralized test data for API integration tests
 * Contains real IDs and test constants for the Swedish Chess Federation API
 *
 * NOTE: These IDs point to real data in the SSF API. If tests fail,
 * the data may have changed or been removed.
 */

// =============================================================================
// Tournament test data
// =============================================================================
export const TEST_TOURNAMENT_ID = 5650; // SS 4 Springare JGP 2025
export const TEST_TOURNAMENT_GROUP_ID = 16046; // SS 4 Springare JGP 2025, grupp C
export const TEST_TOURNAMENT_CLASS_ID = 6451; // SS 4 Springare JGP 2025 class
export const TEST_SEARCH_TERM = 'Stockholm';

// =============================================================================
// Player test data
// =============================================================================
export const TEST_PLAYER_ID = 642062; // Olle Svensson
export const TEST_PLAYER_FIDE_ID = 1786741; // Olle Svensson
export const TEST_PLAYER_DATE = new Date('2024-01-01');

// =============================================================================
// Organization test data
// =============================================================================
export const TEST_DISTRICT_ID = 1; // Stockholms Schackförbund
export const TEST_CLUB_ID = 38464; // SK Rockaden Sthlm
export const TEST_CLUB_NAME = 'SK Rockaden Sthlm';

// =============================================================================
// Rating test data
// =============================================================================
export const TEST_RATING_TYPE = RatingType.STANDARD;
export const TEST_RATING_CATEGORY = PlayerCategory.JUNIORS;
export const TEST_RATING_DATE = new Date('2024-01-01');

// =============================================================================
// Registration test data
// =============================================================================
export const TEST_REGISTRATION_TOURNAMENT_ID = 5650;

// =============================================================================
// Results test data
// =============================================================================
export const TEST_RESULTS_GROUP_ID = 15816; // Individual tournament group
export const TEST_RESULTS_MEMBER_ID = 642062; // Player with tournament history
export const TEST_RESULTS_TEAM_GROUP_ID = 15667; // Skollags SM 2025 (team tournament)

// =============================================================================
// Expected values for assertions
// =============================================================================
export const EXPECTED_TOURNAMENT_NAME = 'SS 4 Springare JGP 2025';
export const EXPECTED_PLAYER_FIRST_NAME = 'Olle';
export const EXPECTED_PLAYER_LAST_NAME = 'Svensson';
export const EXPECTED_CLUB_NAME = 'SK Rockaden Sthlm';
