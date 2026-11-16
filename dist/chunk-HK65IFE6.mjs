import {
  BaseApiService,
  CHESSTOOLS_API_URL,
  MFIDE_API_URL
} from "./chunk-RTAMAEQL.mjs";

// src/services/organizations.ts
var OrganizationService = class extends BaseApiService {
  constructor(baseUrl, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  // Organization API methods
  /**
   * Get Swedish Chess Federation information
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Federation information
   */
  async getFederation(options) {
    const endpoint = "/organisation/federation";
    return this.get(endpoint, options);
  }
  /**
   * Get all districts information
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of all districts
   */
  async getDistricts(options) {
    const endpoint = "/organisation/districts";
    return this.get(endpoint, options);
  }
  /**
   * Get clubs in a specific district
   * @param districtId - District ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of clubs in the district
   */
  async getClubsInDistrict(districtId, options) {
    const endpoint = `/organisation/district/clubs/${districtId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get specific club information
   * @param clubId - Club ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Club information
   */
  async getClub(clubId, options) {
    const endpoint = `/organisation/club/${clubId}`;
    return this.get(endpoint, options);
  }
  /**
   * Check if a club name already exists (excluding a specific club ID)
   * @param name - Club name to check
   * @param id - Club ID to exclude from the check
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Boolean indicating if the name exists
   */
  async checkClubNameExists(name, id, options) {
    const endpoint = `/organisation/club/exists/${encodeURIComponent(name)}/${id}`;
    return this.get(endpoint, options);
  }
};

// src/services/ratings.ts
var RatingsService = class extends BaseApiService {
  constructor(baseUrl, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  // Rating List API methods
  /**
   * Get Swedish Chess Federation rating list
   * @param ratingDate - Date for the rating list
   * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
   * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the federation rating list
   */
  async getFederationRatingList(ratingDate, ratingType, category, options) {
    const formattedDate = this.formatDateToString(ratingDate);
    const endpoint = `/ratinglist/federation/date/${formattedDate}/ratingtype/${ratingType}/category/${category}`;
    return this.get(endpoint, options);
  }
  /**
   * Get district rating list
   * @param districtId - District ID
   * @param ratingDate - Date for the rating list
   * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
   * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the district rating list
   */
  async getDistrictRatingList(districtId, ratingDate, ratingType, category, options) {
    const formattedDate = this.formatDateToString(ratingDate);
    const endpoint = `/ratinglist/district/${districtId}/date/${formattedDate}/ratingtype/${ratingType}/category/${category}`;
    return this.get(endpoint, options);
  }
  /**
   * Get club rating list
   * @param clubId - Club ID
   * @param ratingDate - Date for the rating list
   * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
   * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the club rating list
   */
  async getClubRatingList(clubId, ratingDate, ratingType, category, options) {
    const formattedDate = this.formatDateToString(ratingDate);
    const endpoint = `/ratinglist/club/${clubId}/date/${formattedDate}/ratingtype/${ratingType}/category/${category}`;
    return this.get(endpoint, options);
  }
  /**
   * Helper method to get current federation rating list with sensible defaults
   * @param ratingType - Type of rating (defaults to Standard)
   * @param category - Player category (defaults to All)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the current federation rating list
   */
  async getCurrentFederationRatingList(ratingType = 1 /* STANDARD */, category = 0 /* ALL */, options) {
    const currentDate = /* @__PURE__ */ new Date();
    return this.getFederationRatingList(currentDate, ratingType, category, options);
  }
  /**
   * Helper method to get current club rating list with sensible defaults
   * @param clubId - Club ID
   * @param ratingType - Type of rating (defaults to Standard)
   * @param category - Player category (defaults to All)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the current club rating list
   */
  async getCurrentClubRatingList(clubId, ratingType = 1 /* STANDARD */, category = 0 /* ALL */, options) {
    const currentDate = /* @__PURE__ */ new Date();
    return this.getClubRatingList(clubId, currentDate, ratingType, category, options);
  }
};

// src/services/registration.ts
var RegistrationService = class extends BaseApiService {
  constructor(baseUrl, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  // Tournament Team Registration API method
  /**
   * Get registered players for a tournament team from a specific club
   * @param tournamentId - Tournament ID
   * @param clubId - Club ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Team registration information with list of registered players
   */
  async getTeamRegistration(tournamentId, clubId, options) {
    const endpoint = `/tournamentteamregistration/tournament/${tournamentId}/club/${clubId}`;
    return this.get(endpoint, options);
  }
};

// src/services/fide.ts
var FideService = class extends BaseApiService {
  constructor(baseUrl = CHESSTOOLS_API_URL, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  /**
   * Get top players by classical rating
   * @param limit - Number of players to return (default: 100)
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getTopByRating(limit, options) {
    const params = limit !== void 0 ? `?limit=${limit}` : "";
    return this.get(`/fide/top_by_rating${params}`, options);
  }
  /**
   * Get top active players
   * @param limit - Number of players to return
   * @param history - Include rating history
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getTopActive(limit, history, options) {
    const params = new URLSearchParams();
    if (limit !== void 0) params.set("limit", String(limit));
    if (history !== void 0) params.set("history", String(history));
    const qs = params.toString();
    return this.get(`/fide/top_active/${qs ? `?${qs}` : ""}`, options);
  }
  /**
   * Get a single player by FIDE ID
   * @param fideId - The FIDE player ID
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getPlayer(fideId, options) {
    return this.get(`/fide/${fideId}`, options);
  }
  /**
   * Get detailed player info
   * @param fideId - The FIDE player ID
   * @param history - Include rating history
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getPlayerInfo(fideId, history, options) {
    const params = new URLSearchParams();
    params.set("fide_id", String(fideId));
    if (history !== void 0) params.set("history", String(history));
    return this.get(`/fide/player_info/?${params.toString()}`, options);
  }
  /**
   * Get full rating history for a player
   * @param fideId - The FIDE player ID
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getPlayerHistory(fideId, options) {
    return this.get(`/fide/player_history/?fide_id=${fideId}`, options);
  }
  /**
   * Search for FIDE-rated players by name.
   *
   * @param query - Search string (name or partial name)
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async searchPlayers(query, options) {
    const params = new URLSearchParams();
    params.set("query", query);
    params.set("list_type", "fide");
    return this.get(`/ratinglist/search?${params.toString()}`, options);
  }
};

// src/services/mfide.ts
var MfideService = class extends BaseApiService {
  /**
   * @param baseUrl - mfide's `/api` root (default {@link MFIDE_API_URL}), or a
   *   proxy path that maps to it
   * @param apiKey - Sent as `X-API-Key`. Server-side only: never put a key in
   *   browser code; let a proxy add it instead.
   * @param timeoutMs - Per-service request timeout
   */
  constructor(baseUrl = MFIDE_API_URL, apiKey, timeoutMs) {
    super(baseUrl, apiKey ? { "X-API-Key": apiKey } : void 0, timeoutMs);
  }
  async getEnveloped(endpoint, options) {
    const response = await this.get(endpoint, options);
    const body = response.data;
    if (!body) return { error: response.error, status: response.status, message: response.message };
    if (body.error) return { error: body.error.message, status: body.error.code, message: "Error" };
    return { data: body.data, status: response.status, message: "Success" };
  }
  /** Service status and data freshness (no key needed). */
  async getHealth(options) {
    return this.getEnveloped("/health", options);
  }
  /** The calling key's name and rate limit; a quick "is my key valid". */
  async getKey(options) {
    return this.getEnveloped("/key", options);
  }
  /**
   * Find players by name (words in any order), best match first. A query of
   * digits only looks up that FIDE id (0 or 1 result).
   *
   * @param query - Name words; max 5 words / 100 chars, at least one word of 2+ letters
   */
  async searchPlayers(query, params = {}, options) {
    const qs = new URLSearchParams({ q: query });
    if (params.match) qs.set("match", params.match);
    if (params.country) qs.set("country", params.country);
    if (params.limit !== void 0) qs.set("limit", String(params.limit));
    return this.getEnveloped(`/v1/players/search?${qs}`, options);
  }
  /** One player with the current month's ratings; 404 for unknown or removed players. */
  async getPlayer(fideId, options) {
    return this.getEnveloped(`/v1/players/${fideId}`, options);
  }
  /**
   * A player's monthly ratings, oldest first (up to 60 months).
   *
   * @param type - Only that type, and only months the player was rated in it
   */
  async getPlayerHistory(fideId, type, options) {
    const qs = type ? `?type=${type}` : "";
    return this.getEnveloped(`/v1/players/${fideId}/history${qs}`, options);
  }
  /** A current top list in FIDE's order (active in the type, rating, games, name). */
  async getTop(params = {}, options) {
    const qs = new URLSearchParams();
    if (params.type) qs.set("type", params.type);
    if (params.list) qs.set("list", params.list);
    if (params.country) qs.set("country", params.country);
    if (params.limit !== void 0) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return this.getEnveloped(`/v1/top${query ? `?${query}` : ""}`, options);
  }
};

export {
  OrganizationService,
  RatingsService,
  RegistrationService,
  FideService,
  MfideService
};
