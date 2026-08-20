import {
  getResultDisplayString,
  isCountableResult,
  isTouristBye,
  isWalkoverResultCode
} from "./chunk-6U6BXSQJ.mjs";

// src/constants.ts
var API_VERSION = "v1";
var API_VERSION_DEV = "v1";
var SSF_PROD_API_URL = `https://member.schack.se/public/api/${API_VERSION}`;
var SSF_DEV_API_URL = `https://halvarsson.no-ip.com/webapp/memdb/public/api/${API_VERSION_DEV}`;
var CURRENT_API_URL = SSF_PROD_API_URL;
var CHESSTOOLS_API_URL = "https://api.chesstools.org";
var DEFAULT_TIMEOUT = 1e4;

// src/config.ts
var config = {
  baseUrl: SSF_PROD_API_URL,
  timeoutMs: DEFAULT_TIMEOUT
};
function configure(options) {
  Object.assign(config, options);
}
function getConfig() {
  return config;
}

// src/services/base.ts
var BaseApiService = class {
  constructor(baseUrl, defaultHeaders, timeoutMs) {
    this.baseUrl = baseUrl ?? getConfig().baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders
    };
    this.timeoutMs = timeoutMs;
  }
  async request(endpoint, options = {}, reqOptions = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const timeoutMs = reqOptions.timeoutMs ?? this.timeoutMs ?? getConfig().timeoutMs;
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    const config2 = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      ...options,
      signal: controller.signal
    };
    try {
      let response;
      try {
        response = await fetch(url, config2);
      } catch (error) {
        if (timedOut) {
          return {
            error: `Request timed out after ${timeoutMs}ms`,
            status: 408,
            message: "Error"
          };
        }
        return {
          error: error instanceof Error ? error.message : "Network error",
          status: 0,
          message: "Error"
        };
      }
      if (!response.ok) {
        let errorMessage = response.statusText || `HTTP ${response.status}`;
        try {
          const body = await response.json();
          if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
            errorMessage = body.message;
          } else if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
            errorMessage = body.error;
          }
        } catch {
        }
        return {
          error: errorMessage,
          status: response.status,
          message: "Error"
        };
      }
      try {
        const data = await response.json();
        return {
          data,
          status: response.status,
          message: "Success"
        };
      } catch (error) {
        if (timedOut) {
          return {
            error: `Request timed out after ${timeoutMs}ms`,
            status: 408,
            message: "Error"
          };
        }
        return {
          error: error instanceof Error ? error.message : "Failed to parse response",
          status: 0,
          message: "Error"
        };
      }
    } finally {
      clearTimeout(timer);
    }
  }
  async get(endpoint, reqOptions) {
    return this.request(endpoint, { method: "GET" }, reqOptions);
  }
  async post(endpoint, body, reqOptions) {
    return this.request(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : void 0
    }, reqOptions);
  }
  async put(endpoint, body, reqOptions) {
    return this.request(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : void 0
    }, reqOptions);
  }
  async delete(endpoint, reqOptions) {
    return this.request(endpoint, { method: "DELETE" }, reqOptions);
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
function deduplicateIds(ids) {
  return Array.from(new Set(ids));
}
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// src/services/players.ts
var PlayerService = class extends BaseApiService {
  constructor(baseUrl, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  // Player API methods
  /**
   * Get player information by SSF ID and date
   * @param playerId - The Swedish Chess Federation player ID (number)
   * @param date - Optional date (defaults to current date)
   * @param options - Per-request options (e.g. timeoutMs)
   *
   * @returns Player information
   */
  async getPlayerInfo(playerId, date, options) {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/${playerId}/date/${targetDate}`;
    return this.get(endpoint, options);
  }
  /**
   * Get player information by FIDE ID and date
   * @param fideId - The FIDE player ID (number)
   * @param date - Optional date (defaults to current date)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Player information
   */
  async getPlayerByFIDEId(fideId, date, options) {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/fideid/${fideId}/date/${targetDate}`;
    return this.get(endpoint, options);
  }
  /**
   * Search for players by first name and last name
   * @param fornamn - The first name (Swedish: fornamn)
   * @param efternamn - The last name (Swedish: efternamn)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of matching players
   */
  async searchPlayer(fornamn, efternamn, options) {
    const endpoint = `/player/fornamn/${encodeURIComponent(fornamn)}/efternamn/${encodeURIComponent(efternamn)}`;
    return this.get(endpoint, options);
  }
  /**
   * Fetch player information for multiple players in a single API call
   *
   * @param members - Array of { id, date } objects
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of player information
   */
  async getPlayerList(members, options) {
    return this.post("/player/list/", members, options);
  }
  /**
   * Fetch player information for multiple player IDs in batches
   *
   * Uses individual GET requests per player ID, which is slower than
   * {@link getPlayerList} but tolerant of invalid/missing IDs — a single
   * bad ID won't fail the entire batch. Prefer {@link getPlayerList} when
   * you know all IDs are valid.
   *
   * @param playerIds - Array of player IDs to fetch (duplicates allowed, order preserved)
   * @param date - Optional date filter (defaults to current date)
   * @param options - Batch processing options
   * @returns Array of results matching input order - each item contains either data or error
   */
  async getPlayerInfoBatch(playerIds, date, options = {}) {
    const { concurrency = 10, timeoutMs } = options;
    const chunks = chunkArray(playerIds, concurrency);
    const results = [];
    for (const chunk of chunks) {
      const responses = await Promise.allSettled(
        chunk.map((id) => this.getPlayerInfo(id, date, { timeoutMs }))
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
   * - Fetches all months in the range via a single POST to /player/list/
   * - Results are ordered latest first (matching the request order)
   * - **Smart stopping**: Iterates results and stops at the first month with no ratings
   *   (elo and lask are null/0), so months before the player was rated are excluded
   * - Only returns months where the player has at least one rating value
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
  async getPlayerEloHistory(playerId, startMonth, endMonth, options) {
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
      const members = dates.map((d) => ({
        id: playerId,
        date: this.formatDateToString(d)
      }));
      const response = await this.getPlayerList(members, options);
      if (response.error || !response.data) {
        return {
          status: response.status,
          error: response.error || "Failed to fetch rating history"
        };
      }
      const ratingHistory = [];
      for (const player of response.data) {
        const elo = player.elo;
        const lask = player.lask;
        const hasAnyRating = elo?.rating || elo?.rapidRating || elo?.blitzRating || lask?.rating;
        if (hasAnyRating) {
          ratingHistory.push({ elo, lask });
        } else {
          break;
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

// src/utils/resultFormatting.ts
var BYE_ID = -100;
function getOpponentKind(id) {
  if (id === BYE_ID) return "bye";
  if (id < 0) return "walkover";
  return "paired";
}
function isWalkoverResult(result) {
  return isWalkoverResultCode(result);
}
function isWalkover(homeId, awayId, result) {
  return getOpponentKind(homeId) === "walkover" || getOpponentKind(awayId) === "walkover" || result !== void 0 && isWalkoverResult(result);
}
function formatGameResult(result, whiteId, blackId) {
  const displayString = getResultDisplayString(result);
  if (isWalkoverResultCode(result) || isTouristBye(result)) {
    return displayString;
  }
  const hasWalkoverPlayer = whiteId !== void 0 && getOpponentKind(whiteId) === "walkover" || blackId !== void 0 && getOpponentKind(blackId) === "walkover";
  if (hasWalkoverPlayer && isCountableResult(result)) {
    return `${displayString} w.o`;
  }
  return displayString;
}
function formatMatchResult(homeResult, awayResult, homeId, awayId) {
  if (homeResult === void 0 || awayResult === void 0) {
    return "-";
  }
  const hasWalkover = homeId !== void 0 && getOpponentKind(homeId) === "walkover" || awayId !== void 0 && getOpponentKind(awayId) === "walkover";
  const resultStr = `${homeResult} - ${awayResult}`;
  return hasWalkover ? `${resultStr} w.o` : resultStr;
}

// src/utils/tournamentGroupUtils.ts
function findGroupInClasses(classes, groupId) {
  for (const tournamentClass of classes) {
    const group = tournamentClass.groups?.find((g) => g.id === groupId);
    if (group) {
      return { group, parentClass: tournamentClass };
    }
    if (tournamentClass.subClasses && tournamentClass.subClasses.length > 0) {
      const foundInSubclass = findGroupInClasses(tournamentClass.subClasses, groupId);
      if (foundInSubclass) {
        return foundInSubclass;
      }
    }
  }
  return null;
}
function findTournamentGroup(tournament, groupId) {
  if (!tournament.rootClasses || tournament.rootClasses.length === 0) {
    return null;
  }
  const result = findGroupInClasses(tournament.rootClasses, groupId);
  if (!result) {
    return null;
  }
  const hasMultipleClasses = tournament.rootClasses.length > 1 || tournament.rootClasses.some(
    (rootClass) => rootClass.subClasses && rootClass.subClasses.length > 0
  );
  return {
    group: result.group,
    parentClass: result.parentClass,
    hasMultipleClasses
  };
}
function getGroupName(tournament, groupId) {
  const result = findTournamentGroup(tournament, groupId);
  return result?.group.name || "";
}

export {
  API_VERSION,
  API_VERSION_DEV,
  SSF_PROD_API_URL,
  SSF_DEV_API_URL,
  CURRENT_API_URL,
  CHESSTOOLS_API_URL,
  DEFAULT_TIMEOUT,
  configure,
  getConfig,
  BaseApiService,
  deduplicateIds,
  chunkArray,
  PlayerService,
  getOpponentKind,
  isWalkoverResult,
  isWalkover,
  formatGameResult,
  formatMatchResult,
  findTournamentGroup,
  getGroupName
};
