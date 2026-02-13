"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/services/index.ts
var services_exports = {};
__export(services_exports, {
  BaseApiService: () => BaseApiService,
  OrganizationService: () => OrganizationService,
  PlayerService: () => PlayerService,
  RatingsService: () => RatingsService,
  RegistrationService: () => RegistrationService,
  ResultsService: () => ResultsService,
  TournamentService: () => TournamentService
});
module.exports = __toCommonJS(services_exports);

// src/constants.ts
var API_VERSION = "v1";
var API_VERSION_DEV = "v1";
var SSF_PROD_API_URL = `https://member.schack.se/public/api/${API_VERSION}`;
var SSF_DEV_API_URL = `https://halvarsson.no-ip.com/webapp/memdb/public/api/${API_VERSION_DEV}`;
var CURRENT_API_URL = SSF_PROD_API_URL;

// src/services/base.ts
var BaseApiService = class {
  constructor(baseUrl = CURRENT_API_URL, defaultHeaders) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders
    };
  }
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config = {
        headers: {
          ...this.defaultHeaders,
          ...options.headers
        },
        ...options
      };
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return {
        data,
        status: response.status,
        message: "Success"
      };
    } catch (error) {
      const apiError = {
        message: error instanceof Error ? error.message : "Unknown error occurred",
        status: 500
      };
      return {
        error: apiError.message,
        status: apiError.status,
        message: "Error"
      };
    }
  }
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : void 0
    });
  }
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : void 0
    });
  }
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  formatDateToString(date) {
    return this.formatDate(date);
  }
  getCurrentDate() {
    return this.formatDate(/* @__PURE__ */ new Date());
  }
};

// src/utils/batchUtils.ts
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// src/services/players.ts
var PlayerService = class extends BaseApiService {
  constructor(baseUrl) {
    super(baseUrl);
  }
  // Player API methods
  /**
   * Get player information by SSF ID and date
   * @param playerId - The Swedish Chess Federation player ID (number)
   * @param date - Optional date (defaults to current date)
   *
   * @returns Player information
   */
  async getPlayerInfo(playerId, date) {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/${playerId}/date/${targetDate}`;
    return this.get(endpoint);
  }
  /**
   * Get player information by FIDE ID and date
   * @param fideId - The FIDE player ID (number)
   * @param date - Optional date (defaults to current date)
   * @returns Player information
   */
  async getPlayerByFIDEId(fideId, date) {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/fideid/${fideId}/date/${targetDate}`;
    return this.get(endpoint);
  }
  /**
   * Search for players by first name and last name
   * @param fornamn - The first name (Swedish: fornamn)
   * @param efternamn - The last name (Swedish: efternamn)
   * @returns Array of matching players
   */
  async searchPlayer(fornamn, efternamn) {
    const endpoint = `/player/fornamn/${encodeURIComponent(fornamn)}/efternamn/${encodeURIComponent(efternamn)}`;
    return this.get(endpoint);
  }
  /**
   * Fetch player information for multiple player IDs in batches
   *
   * @param playerIds - Array of player IDs to fetch (duplicates allowed, order preserved)
   * @param date - Optional date filter (defaults to current date)
   * @param options - Batch processing options
   * @returns Array of results matching input order - each item contains either data or error
   *
   * @remarks
   * - **Preserves input order** - results[i] corresponds to playerIds[i]
   * - **Allows duplicates** - each ID is fetched separately (caller controls deduplication)
   * - Processes requests in batches to avoid overwhelming the API
   * - Use concurrency: Infinity for maximum parallelism
   *
   * @example
   * ```typescript
   * const results = await playerService.getPlayerInfoBatch([1, 2, 2, 3]);
   * results.forEach((result, i) => {
   *   if (result.data) {
   *     console.log(`Player ${playerIds[i]}:`, result.data);
   *   } else {
   *     console.error(`Player ${playerIds[i]} failed:`, result.error);
   *   }
   * });
   * ```
   */
  async getPlayerInfoBatch(playerIds, date, options = {}) {
    const { concurrency = 10 } = options;
    const chunks = chunkArray(playerIds, concurrency);
    const results = [];
    for (const chunk of chunks) {
      const responses = await Promise.allSettled(
        chunk.map((id) => this.getPlayerInfo(id, date))
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
   * Fetch player rating history for a date range
   *
   * @param playerId - The Swedish Chess Federation player ID
   * @param startMonth - Start month in YYYY-MM format (default: 12 months ago)
   * @param endMonth - End month in YYYY-MM format (default: current month)
   * @returns Array of rating history sorted by date (latest first)
   *
   * @remarks
   * - Fetches player ratings for each month in the range
   * - Processes in batches of 12 months for efficiency
   * - **Smart stopping**: Stops when encountering a month with no ratings (all rating fields are null/0)
   * - Also stops if API call fails (player doesn't exist at that date)
   * - Returns only months where the player has rating data
   *
   * @example
   * ```typescript
   * // Get last 12 months of rating history
   * const history = await playerService.getPlayerEloHistory(12345);
   *
   * // Get specific range
   * const history = await playerService.getPlayerEloHistory(12345, '2024-01', '2025-06');
   * ```
   */
  async getPlayerEloHistory(playerId, startMonth, endMonth) {
    try {
      const today = /* @__PURE__ */ new Date();
      const end = endMonth ? new Date(parseInt(endMonth.split("-")[0]), parseInt(endMonth.split("-")[1]) - 1, 1) : new Date(today.getFullYear(), today.getMonth(), 1);
      const start = startMonth ? new Date(parseInt(startMonth.split("-")[0]), parseInt(startMonth.split("-")[1]) - 1, 1) : new Date(today.getFullYear(), today.getMonth() - 11, 1);
      const dates = [];
      const current = new Date(end.getFullYear(), end.getMonth(), 1);
      while (current >= start) {
        dates.push(new Date(current.getFullYear(), current.getMonth(), 1));
        current.setMonth(current.getMonth() - 1);
      }
      const chunks = chunkArray(dates, 12);
      const ratingHistory = [];
      let shouldStop = false;
      for (const chunk of chunks) {
        if (shouldStop) break;
        const responses = await Promise.allSettled(
          chunk.map((date) => this.getPlayerInfo(playerId, date))
        );
        for (const response of responses) {
          if (response.status === "fulfilled" && response.value.status === 200 && response.value.data) {
            const player = response.value.data;
            const elo = player.elo;
            const lask = player.lask;
            const hasAnyRating = elo?.rating || elo?.rapidRating || elo?.blitzRating || lask?.rating;
            if (hasAnyRating) {
              ratingHistory.push({
                elo,
                lask
              });
            } else {
              shouldStop = true;
              break;
            }
          } else {
            shouldStop = true;
            break;
          }
        }
      }
      return {
        status: 200,
        data: ratingHistory
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Failed to fetch rating history"
      };
    }
  }
};

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseApiService,
  OrganizationService,
  PlayerService,
  RatingsService,
  RegistrationService,
  ResultsService,
  TournamentService
});
