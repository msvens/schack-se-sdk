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
var MFIDE_API_URL = "https://mfide.mellowtech.org/api";
var DEFAULT_TIMEOUT = 1e4;
var SEARCH_GROUPS_MAX_RESULTS = 100;

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
          } else if (typeof body?.error?.message === "string") {
            errorMessage = body.error.message;
          }
        } catch {
        }
        return {
          error: errorMessage,
          status: response.status,
          message: "Error"
        };
      }
      if (response.status === 204) {
        return { status: 204, message: "Success" };
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
function notifyItem(onItem, result, index) {
  if (!onItem) return;
  try {
    onItem(result, index);
  } catch {
  }
}
var MISSING_STATUSES = /* @__PURE__ */ new Set([204, 404]);
function toBatchItem(settled) {
  if (settled.status === "rejected") {
    return { data: null, error: settled.reason?.message || "Unknown error", status: 0 };
  }
  const { data, error, status } = settled.value;
  if (data !== void 0 && data !== null) return { data, error: null, status };
  if (MISSING_STATUSES.has(status)) return { data: null, error: null, status };
  return { data: null, error: error || "No data", status };
}
var BULK_CHUNK = 1e3;
var RETRY_CHUNK = 25;
var RETRY_PARALLEL = 4;
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
  async getPlayerInfoBatch(input, dateOrOptions, maybeOptions) {
    if (input.length === 0) return [];
    let requests;
    let options;
    if (typeof input[0] === "number") {
      const date = dateOrOptions instanceof Date ? this.formatDateToString(dateOrOptions) : this.getCurrentDate();
      requests = input.map((id) => ({ id, date }));
      options = (dateOrOptions instanceof Date ? maybeOptions : dateOrOptions) ?? {};
    } else {
      requests = input;
      options = dateOrOptions ?? {};
    }
    const results = new Array(requests.length);
    const keyOf = (r) => `${r.id}@${r.date}`;
    const unique = /* @__PURE__ */ new Map();
    const indicesByKey = /* @__PURE__ */ new Map();
    requests.forEach((r, index) => {
      if (r.id <= 0) {
        results[index] = { data: null, error: "Invalid player id", status: 0 };
        notifyItem(options.onItem, results[index], index);
        return;
      }
      const key = keyOf(r);
      if (!unique.has(key)) unique.set(key, r);
      indicesByKey.set(key, [...indicesByKey.get(key) ?? [], index]);
    });
    const settle = (pair, result) => {
      for (const index of indicesByKey.get(keyOf(pair)) ?? []) {
        results[index] = result;
        notifyItem(options.onItem, result, index);
      }
    };
    for (const chunk of chunkArray([...unique.values()], BULK_CHUNK)) {
      await this.fetchPlayerChunk(chunk, options, settle);
    }
    return results;
  }
  /**
   * Bulk-fetch one chunk, settling each pair: one POST; on failure, retry POSTs of
   * {@link RETRY_CHUNK} pairs ({@link RETRY_PARALLEL} at a time); then one GET
   * per pair of every retry chunk that still failed, `concurrency` at a time.
   */
  async fetchPlayerChunk(chunk, options, settle) {
    const { timeoutMs, concurrency = 10 } = options;
    if (chunk.length > 1 && await this.postPlayerChunk(chunk, timeoutMs, settle)) return;
    let failed = chunk;
    if (chunk.length > RETRY_CHUNK) {
      failed = [];
      for (const group of chunkArray(chunkArray(chunk, RETRY_CHUNK), RETRY_PARALLEL)) {
        const done = await Promise.all(group.map((sub) => this.postPlayerChunk(sub, timeoutMs, settle)));
        group.forEach((sub, i) => {
          if (!done[i]) failed.push(...sub);
        });
      }
    }
    for (const batch of chunkArray(failed, concurrency)) {
      const settled = await Promise.allSettled(
        batch.map((r) => this.get(`/player/${r.id}/date/${r.date}`, { timeoutMs }))
      );
      settled.forEach((s, i) => settle(batch[i], toBatchItem(s)));
    }
  }
  /**
   * One `/player/list/` POST for `chunk`. Returns true when its pairs are settled:
   * either answered (found) or, on a network failure (status 0), marked as errors —
   * single GETs would fail the same way. Returns false when the chunk should be
   * retried smaller / per pair (HTTP 500 from an unknown id, a timeout, an
   * answer that doesn't line up with the request).
   */
  async postPlayerChunk(chunk, timeoutMs, settle) {
    const response = await this.getPlayerList(chunk, { timeoutMs });
    const answer = response.data;
    if (response.status === 200 && Array.isArray(answer) && answer.length === chunk.length && answer.every((player, i) => player?.id === chunk[i].id)) {
      chunk.forEach((r, i) => settle(r, { data: answer[i], error: null, status: 200 }));
      return true;
    }
    if (response.status === 0) {
      const error = response.error || "Network error";
      for (const r of chunk) settle(r, { data: null, error, status: 0 });
      return true;
    }
    return false;
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

// src/services/tournaments.ts
function toSearchGroupsWord(searchWord) {
  const word = searchWord.trim().replace(/[/\\;]/g, "_");
  return word === "" || /^\.+$/.test(word) ? null : word;
}
var TournamentService = class extends BaseApiService {
  constructor(baseUrl, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  // Tournament Structure API methods
  /**
   * Get detailed tournament information by tournament ID
   * @param tournamentId - Tournament ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Comprehensive tournament information including classes and groups
   */
  async getTournament(tournamentId, options) {
    const endpoint = `/tournament/tournament/id/${tournamentId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get tournament information by group ID
   * @param groupId - Tournament group ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Tournament information for the tournament containing this group
   */
  async getTournamentFromGroup(groupId, options) {
    const endpoint = `/tournament/group/id/${groupId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get tournament information by class/division ID
   * @param classId - Tournament class ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Tournament information for the tournament containing this class
   */
  async getTournamentFromClass(classId, options) {
    const endpoint = `/tournament/class/id/${classId}`;
    return this.get(endpoint, options);
  }
  /**
   * Search for tournament groups by name or location
   *
   * Server-side behaviour (observed, not documented by SSF):
   * - Matches the *start* of the tournament name, the group name or the
   *   tournament's city. Case-insensitive but accent-sensitive ("Orebro" does
   *   not find "Örebro").
   * - `%` (any run of characters) and `_` (any single character) are SQL LIKE
   *   wildcards, so `%svenskan` matches anywhere in a name.
   * - Returns at most {@link SEARCH_GROUPS_MAX_RESULTS} (100) groups, oldest
   *   tournaments first. There is no parameter to raise the cap or change the
   *   order; a result of exactly 100 was most likely cut off, so ask the user to
   *   narrow the search (a season, e.g. "Allsvenskan 2026", reaches newer events).
   * - `latestUpdatedGame` is currently always null.
   *
   * The word goes in the URL path, where the server rejects some characters. The
   * SDK therefore trims the word and replaces `/`, `\` and `;` with the `_`
   * wildcard, so "Allsvenskan 2026/27" finds that season's groups (it also
   * matches "2026-27"). An empty word, or one of only dots, returns an empty
   * list without a request.
   *
   * @param searchWord - Search term for tournament/group name or location
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of matching tournament groups with basic information
   */
  async searchGroups(searchWord, options) {
    const word = toSearchGroupsWord(searchWord);
    if (word === null) {
      return { data: [], status: 200, message: "Success" };
    }
    const endpoint = `/tournament/group/search/${encodeURIComponent(word)}`;
    return this.get(endpoint, options);
  }
  /**
   * Get upcoming tournaments
   * @param districtId - Optional district ID to filter by district and club tournaments
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of upcoming tournaments
   */
  async searchComingTournaments(districtId, options) {
    const endpoint = districtId !== void 0 ? `/tournament/group/coming/${districtId}` : "/tournament/group/coming";
    return this.get(endpoint, options);
  }
  /**
   * Search for tournaments with results updated within a date range
   * Returns complete tournament objects (not just groups).
   * @param startDate - Start date in ISO format (YYYY-MM-DDTHH:mm:ss)
   * @param endDate - End date in ISO format (YYYY-MM-DDTHH:mm:ss)
   * @param districtId - Optional district ID to filter by district and club tournaments
   * @returns Array of tournaments whose results were updated within the date range
   * @example
   * // Find tournaments whose results were updated in December 2024
   * searchUpdatedTournaments('2024-12-01T00:00:00', '2024-12-31T23:59:59')
   *
   * @remarks
   * The date range matches when results were last updated, not when the tournament
   * was played. In practice the two track closely, but long-running events (a
   * season-long KM) surface in any window their results happen to be touched.
   * The endpoint may also return the same tournament more than once — dedupe by id.
   */
  async searchUpdatedTournaments(startDate, endDate, districtId, options) {
    const endpoint = districtId !== void 0 ? `/tournament/tournament/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}` : `/tournament/tournament/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;
    return this.get(endpoint, options);
  }
  /**
   * Search for tournament groups with results updated within a date range
   * @deprecated Use searchUpdatedTournaments() instead - returns full TournamentDto[] instead of group summaries
   * @param startDate - Start date in ISO format (YYYY-MM-DDTHH:mm:ss)
   * @param endDate - End date in ISO format (YYYY-MM-DDTHH:mm:ss)
   * @param districtId - Optional district ID to filter by district and club tournaments
   * @returns Array of tournament groups whose results were updated within the date range
   * @example
   * // Find groups whose results were updated in December 2024
   * searchUpdatedGroups('2024-12-01T00:00:00', '2024-12-31T23:59:59')
   */
  async searchUpdatedGroups(startDate, endDate, districtId, options) {
    const endpoint = districtId !== void 0 ? `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}` : `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;
    return this.get(endpoint, options);
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
    const { concurrency = 10, timeoutMs } = options;
    const chunks = chunkArray(tournamentIds, concurrency);
    const results = [];
    for (const chunk of chunks) {
      const responses = await Promise.allSettled(
        chunk.map((id) => this.getTournament(id, { timeoutMs }))
      );
      responses.forEach((response) => {
        const result = toBatchItem(response);
        results.push(result);
        notifyItem(options.onItem, result, results.length - 1);
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
    const { concurrency = 10, timeoutMs } = options;
    const chunks = chunkArray(groupIds, concurrency);
    const results = [];
    for (const chunk of chunks) {
      const responses = await Promise.allSettled(
        chunk.map((id) => this.getTournamentFromGroup(id, { timeoutMs }))
      );
      responses.forEach((response) => {
        const result = toBatchItem(response);
        results.push(result);
        notifyItem(options.onItem, result, results.length - 1);
      });
    }
    return results;
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
  MFIDE_API_URL,
  DEFAULT_TIMEOUT,
  SEARCH_GROUPS_MAX_RESULTS,
  configure,
  getConfig,
  BaseApiService,
  deduplicateIds,
  chunkArray,
  PlayerService,
  TournamentService,
  getOpponentKind,
  isWalkoverResult,
  isWalkover,
  formatGameResult,
  formatMatchResult,
  findTournamentGroup,
  getGroupName
};
