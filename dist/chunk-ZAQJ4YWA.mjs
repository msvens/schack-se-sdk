import {
  BaseApiService,
  chunkArray
} from "./chunk-HKROUMYP.mjs";

// src/services/organizations.ts
var OrganizationService = class extends BaseApiService {
  constructor(baseUrl) {
    super(baseUrl);
  }
  // Organization API methods
  /**
   * Get Swedish Chess Federation information
   * @returns Federation information
   */
  async getFederation() {
    const endpoint = "/organisation/federation";
    return this.get(endpoint);
  }
  /**
   * Get all districts information
   * @returns Array of all districts
   */
  async getDistricts() {
    const endpoint = "/organisation/districts";
    return this.get(endpoint);
  }
  /**
   * Get clubs in a specific district
   * @param districtId - District ID
   * @returns Array of clubs in the district
   */
  async getClubsInDistrict(districtId) {
    const endpoint = `/organisation/district/clubs/${districtId}`;
    return this.get(endpoint);
  }
  /**
   * Get specific club information
   * @param clubId - Club ID
   * @returns Club information
   */
  async getClub(clubId) {
    const endpoint = `/organisation/club/${clubId}`;
    return this.get(endpoint);
  }
  /**
   * Check if a club name already exists (excluding a specific club ID)
   * @param name - Club name to check
   * @param id - Club ID to exclude from the check
   * @returns Boolean indicating if the name exists
   */
  async checkClubNameExists(name, id) {
    const endpoint = `/organisation/club/exists/${encodeURIComponent(name)}/${id}`;
    return this.get(endpoint);
  }
};

// src/services/tournaments.ts
var TournamentService = class extends BaseApiService {
  constructor(baseUrl) {
    super(baseUrl);
  }
  // Tournament Structure API methods
  /**
   * Get detailed tournament information by tournament ID
   * @param tournamentId - Tournament ID
   * @returns Comprehensive tournament information including classes and groups
   */
  async getTournament(tournamentId) {
    const endpoint = `/tournament/tournament/id/${tournamentId}`;
    return this.get(endpoint);
  }
  /**
   * Get tournament information by group ID
   * @param groupId - Tournament group ID
   * @returns Tournament information for the tournament containing this group
   */
  async getTournamentFromGroup(groupId) {
    const endpoint = `/tournament/group/id/${groupId}`;
    return this.get(endpoint);
  }
  /**
   * Get tournament information by class/division ID
   * @param classId - Tournament class ID
   * @returns Tournament information for the tournament containing this class
   */
  async getTournamentFromClass(classId) {
    const endpoint = `/tournament/class/id/${classId}`;
    return this.get(endpoint);
  }
  /**
   * Search for tournament groups by name or location
   * @param searchWord - Search term for tournament/group name or location
   * @returns Array of matching tournament groups with basic information
   */
  async searchGroups(searchWord) {
    const endpoint = `/tournament/group/search/${encodeURIComponent(searchWord)}`;
    return this.get(endpoint);
  }
  /**
   * Get upcoming tournaments
   * @param districtId - Optional district ID to filter by district and club tournaments
   * @returns Array of upcoming tournaments
   */
  async searchComingTournaments(districtId) {
    const endpoint = districtId !== void 0 ? `/tournament/group/coming/${districtId}` : "/tournament/group/coming";
    return this.get(endpoint);
  }
  /**
   * Search for tournaments with results updated within a date range
   * Returns complete tournament objects (not just groups).
   * @param startDate - Start date in ISO format (YYYY-MM-DDTHH:mm:ss)
   * @param endDate - End date in ISO format (YYYY-MM-DDTHH:mm:ss)
   * @param districtId - Optional district ID to filter by district and club tournaments
   * @returns Array of tournaments with results updated within the date range
   * @example
   * // Find tournaments with updated results in December 2024
   * searchUpdatedTournamentsByTournament('2024-12-01T00:00:00', '2024-12-31T23:59:59')
   */
  async searchUpdatedTournaments(startDate, endDate, districtId) {
    const endpoint = districtId !== void 0 ? `/tournament/tournament/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}` : `/tournament/tournament/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;
    return this.get(endpoint);
  }
  /**
   * Search for tournament groups with results updated within a date range
   * @deprecated Use searchUpdatedTournamentsByTournament() instead - returns full TournamentDto[] instead of group summaries
   * @param startDate - Start date in ISO format (YYYY-MM-DDTHH:mm:ss)
   * @param endDate - End date in ISO format (YYYY-MM-DDTHH:mm:ss)
   * @param districtId - Optional district ID to filter by district and club tournaments
   * @returns Array of tournament groups that started within the date range
   * @example
   * // Find tournaments that started in December 2024 (may still be running)
   * searchUpdatedTournaments('2024-12-01T00:00:00', '2024-12-31T23:59:59')
   */
  async searchUpdatedGroups(startDate, endDate, districtId) {
    const endpoint = districtId !== void 0 ? `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}` : `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;
    return this.get(endpoint);
  }
  /**
   * Fetch tournament information for multiple tournament IDs in batches
   *
   * @param tournamentIds - Array of tournament IDs to fetch (duplicates allowed, order preserved)
   * @param options - Batch processing options
   * @returns Array of results matching input order - each item contains either data or error
   *
   * @remarks
   * - **Preserves input order** - results[i] corresponds to tournamentIds[i]
   * - **Allows duplicates** - each ID is fetched separately (caller controls deduplication)
   * - Processes requests in batches to avoid overwhelming the API
   * - Use concurrency: Infinity for maximum parallelism
   *
   * @example
   * ```typescript
   * const results = await tournamentService.getTournamentBatch([1, 2, 2, 3]);
   * results.forEach((result, i) => {
   *   if (result.data) {
   *     console.log(`Tournament ${tournamentIds[i]}:`, result.data);
   *   } else {
   *     console.error(`Tournament ${tournamentIds[i]} failed:`, result.error);
   *   }
   * });
   * ```
   */
  async getTournamentBatch(tournamentIds, options = {}) {
    const { concurrency = 10 } = options;
    const chunks = chunkArray(tournamentIds, concurrency);
    const results = [];
    for (const chunk of chunks) {
      const responses = await Promise.allSettled(
        chunk.map((id) => this.getTournament(id))
      );
      responses.forEach((response) => {
        if (response.status === "fulfilled" && response.value.data) {
          results.push({ data: response.value.data, error: null });
        } else if (response.status === "fulfilled" && response.value.error) {
          results.push({ data: null, error: response.value.error });
        } else if (response.status === "rejected") {
          results.push({
            data: null,
            error: response.reason?.message || "Unknown error"
          });
        }
      });
    }
    return results;
  }
  /**
   * Fetch tournament information for multiple group IDs in batches
   * Note: This fetches the tournament that contains each group
   *
   * @param groupIds - Array of group IDs to fetch tournaments for (duplicates allowed, order preserved)
   * @param options - Batch processing options
   * @returns Array of results matching input order - each item contains either data or error
   *
   * @remarks
   * - **Preserves input order** - results[i] corresponds to groupIds[i]
   * - **Allows duplicates** - each ID is fetched separately (caller controls deduplication)
   * - Processes requests in batches to avoid overwhelming the API
   * - Use concurrency: Infinity for maximum parallelism
   *
   * @example
   * ```typescript
   * const results = await tournamentService.getTournamentFromGroupBatch([1, 2, 2, 3]);
   * results.forEach((result, i) => {
   *   if (result.data) {
   *     console.log(`Group ${groupIds[i]} tournament:`, result.data);
   *   } else {
   *     console.error(`Group ${groupIds[i]} failed:`, result.error);
   *   }
   * });
   * ```
   */
  async getTournamentFromGroupBatch(groupIds, options = {}) {
    const { concurrency = 10 } = options;
    const chunks = chunkArray(groupIds, concurrency);
    const results = [];
    for (const chunk of chunks) {
      const responses = await Promise.allSettled(
        chunk.map((id) => this.getTournamentFromGroup(id))
      );
      responses.forEach((response) => {
        if (response.status === "fulfilled" && response.value.data) {
          results.push({ data: response.value.data, error: null });
        } else if (response.status === "fulfilled" && response.value.error) {
          results.push({ data: null, error: response.value.error });
        } else if (response.status === "rejected") {
          results.push({
            data: null,
            error: response.reason?.message || "Unknown error"
          });
        }
      });
    }
    return results;
  }
};

// src/services/results.ts
var ResultsService = class extends BaseApiService {
  constructor(baseUrl) {
    super(baseUrl);
  }
  // Tournament Results API methods
  /**
   * Get individual tournament results by group ID
   * @param groupId - Tournament group ID (e.g., 15816)
   * @returns Tournament results with player standings
   */
  async getTournamentResults(groupId) {
    const endpoint = `/tournamentresults/table/id/${groupId}`;
    return this.get(endpoint);
  }
  /**
   * Get tournament round results by group ID
   * @param groupId - Tournament group ID (e.g., 15816)
   * @returns Tournament round results with individual games
   */
  async getTournamentRoundResults(groupId) {
    const endpoint = `/tournamentresults/roundresults/id/${groupId}`;
    return this.get(endpoint);
  }
  /**
   * Get team tournament results by group ID
   * @param groupId - Tournament group ID
   * @returns Team tournament results with club standings
   */
  async getTeamTournamentResults(groupId) {
    const endpoint = `/tournamentresults/team/table/id/${groupId}`;
    return this.get(endpoint);
  }
  /**
   * Get team tournament round results by group ID
   * @param groupId - Tournament group ID
   * @returns Team tournament round results
   */
  async getTeamRoundResults(groupId) {
    const endpoint = `/tournamentresults/team/roundresults/id/${groupId}`;
    return this.get(endpoint);
  }
  /**
   * Get individual tournament results for a specific member
   * @param memberId - Member ID
   * @returns Array of tournament results for the member
   */
  async getMemberTournamentResults(memberId) {
    const endpoint = `/tournamentresults/table/memberid/${memberId}`;
    return this.get(endpoint);
  }
  /**
   * Get team tournament round results for a specific member
   * @param groupId - Tournament group ID
   * @param memberId - Member ID
   * @returns Team tournament round results for the specific member
   */
  async getTeamMemberRoundResults(groupId, memberId) {
    const endpoint = `/tournamentresults/team/roundresults/id/${groupId}/memberid/${memberId}`;
    return this.get(endpoint);
  }
  /**
   * Get all games played by a member
   * Returns all games (individual and team tournaments) for the specified member.
   * Useful for player profiles showing complete game history.
   * @param memberId - Member ID
   * @returns Array of all games played by the member
   */
  async getMemberGames(memberId) {
    const endpoint = `/tournamentresults/game/memberid/${memberId}`;
    return this.get(endpoint);
  }
};

// src/services/ratings.ts
var RatingsService = class extends BaseApiService {
  constructor(baseUrl) {
    super(baseUrl);
  }
  // Rating List API methods
  /**
   * Get Swedish Chess Federation rating list
   * @param ratingDate - Date for the rating list
   * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
   * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
   * @returns Array of players in the federation rating list
   */
  async getFederationRatingList(ratingDate, ratingType, category) {
    const formattedDate = this.formatDateToString(ratingDate);
    const endpoint = `/ratinglist/federation/date/${formattedDate}/ratingtype/${ratingType}/category/${category}`;
    return this.get(endpoint);
  }
  /**
   * Get district rating list
   * @param districtId - District ID
   * @param ratingDate - Date for the rating list
   * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
   * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
   * @returns Array of players in the district rating list
   */
  async getDistrictRatingList(districtId, ratingDate, ratingType, category) {
    const formattedDate = this.formatDateToString(ratingDate);
    const endpoint = `/ratinglist/district/${districtId}/date/${formattedDate}/ratingtype/${ratingType}/category/${category}`;
    return this.get(endpoint);
  }
  /**
   * Get club rating list
   * @param clubId - Club ID
   * @param ratingDate - Date for the rating list
   * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
   * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
   * @returns Array of players in the club rating list
   */
  async getClubRatingList(clubId, ratingDate, ratingType, category) {
    const formattedDate = this.formatDateToString(ratingDate);
    const endpoint = `/ratinglist/club/${clubId}/date/${formattedDate}/ratingtype/${ratingType}/category/${category}`;
    return this.get(endpoint);
  }
  /**
   * Helper method to get current federation rating list with sensible defaults
   * @param ratingType - Type of rating (defaults to Standard)
   * @param category - Player category (defaults to All)
   * @returns Array of players in the current federation rating list
   */
  async getCurrentFederationRatingList(ratingType = 1 /* STANDARD */, category = 0 /* ALL */) {
    const currentDate = /* @__PURE__ */ new Date();
    return this.getFederationRatingList(currentDate, ratingType, category);
  }
  /**
   * Helper method to get current club rating list with sensible defaults
   * @param clubId - Club ID
   * @param ratingType - Type of rating (defaults to Standard)
   * @param category - Player category (defaults to All)
   * @returns Array of players in the current club rating list
   */
  async getCurrentClubRatingList(clubId, ratingType = 1 /* STANDARD */, category = 0 /* ALL */) {
    const currentDate = /* @__PURE__ */ new Date();
    return this.getClubRatingList(clubId, currentDate, ratingType, category);
  }
};

// src/services/registration.ts
var RegistrationService = class extends BaseApiService {
  constructor(baseUrl) {
    super(baseUrl);
  }
  // Tournament Team Registration API method
  /**
   * Get registered players for a tournament team from a specific club
   * @param tournamentId - Tournament ID
   * @param clubId - Club ID
   * @returns Team registration information with list of registered players
   */
  async getTeamRegistration(tournamentId, clubId) {
    const endpoint = `/tournamentteamregistration/tournament/${tournamentId}/club/${clubId}`;
    return this.get(endpoint);
  }
};

export {
  OrganizationService,
  TournamentService,
  ResultsService,
  RatingsService,
  RegistrationService
};
