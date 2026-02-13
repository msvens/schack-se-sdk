// src/constants.ts
var API_VERSION = "v1";
var API_VERSION_DEV = "v1";
var SSF_PROD_API_URL = `https://member.schack.se/public/api/${API_VERSION}`;
var SSF_DEV_API_URL = `https://halvarsson.no-ip.com/webapp/memdb/public/api/${API_VERSION_DEV}`;
var CURRENT_API_URL = SSF_PROD_API_URL;
var DEFAULT_TIMEOUT = 1e4;

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

export {
  API_VERSION,
  API_VERSION_DEV,
  SSF_PROD_API_URL,
  SSF_DEV_API_URL,
  CURRENT_API_URL,
  DEFAULT_TIMEOUT,
  BaseApiService,
  deduplicateIds,
  chunkArray,
  PlayerService
};
