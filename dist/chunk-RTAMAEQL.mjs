import {
  PairingSystem,
  TiebreakSystem,
  calculatePoints,
  getResultDisplayString,
  isCountableResult,
  isTeamPairing,
  isTouristBye,
  isWalkoverResultCode
} from "./chunk-L5CACHWV.mjs";

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
   * Get upcoming tournaments: those whose end date is today or later, including
   * ones that have already started. For those played today, see
   * `getTournamentsToday`. Grand Prix series (type 7) are included; they
   * have no results of their own, see `isGrandPrix`.
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

// src/utils/tiebreaks.ts
function buchholz(opponentScores) {
  return opponentScores.reduce((sum, s) => sum + s, 0);
}
function buchholzCut1(opponentScores) {
  if (opponentScores.length === 0) return 0;
  const min = Math.min(...opponentScores);
  return buchholz(opponentScores) - min;
}
var FIELD_SCALE = [0.01, 1e-4, 1e-6, 1e-8];
function pack(base, fields) {
  return fields.reduce((acc, f, i) => acc + f * FIELD_SCALE[i], base);
}
function computeSsfSecPoints(tiebreakSystem, ctx) {
  switch (tiebreakSystem) {
    case TiebreakSystem.SSF_BUCHHOLZ: {
      const values = ctx.opponentScores.map((s, i) => s + 0.5 * (ctx.opponentAbsentRounds[i] ?? 0));
      for (let i = 0; i < ctx.unplayedWon + ctx.absentRounds; i++) values.push(ctx.ownScore);
      for (let i = 0; i < ctx.unplayedLost; i++) values.push(0);
      const base = values.length >= 2 ? buchholzCut1(values) : buchholz(values);
      return pack(base, [ctx.wins, ctx.gamesWithBlack]);
    }
    default:
      return null;
  }
}
function isSsfSecPointsSupported(tiebreakSystem) {
  return tiebreakSystem === TiebreakSystem.SSF_BUCHHOLZ;
}
var REPRODUCED_SYSTEMS = /* @__PURE__ */ new Set([TiebreakSystem.SSF_BUCHHOLZ]);
var CONFIRMED_SYSTEMS = /* @__PURE__ */ new Set();
function secondaryBasis(opts) {
  if (opts.mode === "team") return "exact";
  const sys = opts.tiebreakSystem;
  if (sys !== void 0 && CONFIRMED_SYSTEMS.has(sys) && !opts.hasUnhandledUnplayed) {
    return "official";
  }
  if (sys !== void 0 && REPRODUCED_SYSTEMS.has(sys)) return "reproduced";
  return "indicative";
}
function isEstimated(basis) {
  return basis === "reproduced" || basis === "indicative";
}
function orderingMatchesOfficial(orderedKeys, officialPlace) {
  if (orderedKeys.length === 0) return false;
  let prevPlace = Number.NEGATIVE_INFINITY;
  for (const key of orderedKeys) {
    const place = officialPlace.get(key);
    if (place === void 0) return false;
    if (place < prevPlace) return false;
    prevPlace = place;
  }
  return true;
}

// src/utils/roundStandings.ts
function isRealContender(id) {
  return getOpponentKind(id) === "paired";
}
function isUnplayedGame(game) {
  return isWalkoverResultCode(game.result) || !isCountableResult(game.result);
}
function computeRoundStandings(roundResults, options) {
  const {
    mode,
    qualityMetric = "buchholz",
    tiebreakSystem,
    matchPointValues = { win: 2, draw: 1, loss: 0 }
  } = options;
  const team = mode === "team";
  const ssfRules = !team && tiebreakSystem !== void 0 && isSsfSecPointsSupported(tiebreakSystem);
  const byRound = /* @__PURE__ */ new Map();
  for (const pairing of roundResults) {
    const list = byRound.get(pairing.roundNr);
    if (list) list.push(pairing);
    else byRound.set(pairing.roundNr, [pairing]);
  }
  const rounds = [...byRound.keys()].sort((a, b) => a - b);
  const basis = secondaryBasis({ mode, tiebreakSystem, hasUnhandledUnplayed: false });
  const estimated = isEstimated(basis);
  let teamParity = { homeWhiteOnOdd: true, known: false };
  let boardKeys = [];
  if (team) {
    const played = roundResults.filter(
      (p) => isRealContender(p.homeId) && isRealContender(p.awayId) && p.games.length > 0
    );
    teamParity = deriveTeamParity(played);
    boardKeys = teamBoardKeys([...new Set(played.flatMap((p) => p.games.map((g) => g.tableNr)))]);
  }
  const keyOf = (id, teamNumber) => team ? `${id}:${teamNumber}` : `${id}`;
  const acc = /* @__PURE__ */ new Map();
  const get = (id, teamNumber) => {
    const key = keyOf(id, teamNumber);
    let a = acc.get(key);
    if (!a) {
      a = {
        contenderId: id,
        teamNumber,
        points: 0,
        matchPoints: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gamesPlayed: 0,
        order: acc.size,
        gamesWithBlack: 0,
        unplayedWon: 0,
        unplayedLost: 0,
        forfeitWins: 0,
        roundsPaired: 0,
        opponents: [],
        boardPoints: /* @__PURE__ */ new Map(),
        boardAttributed: true,
        mpAgainst: /* @__PURE__ */ new Map(),
        bpAgainst: /* @__PURE__ */ new Map()
      };
      acc.set(key, a);
    }
    return a;
  };
  const snapshots = [];
  for (const round of rounds) {
    for (const p of byRound.get(round)) {
      const homeReal = isRealContender(p.homeId);
      const awayReal = isRealContender(p.awayId);
      if (homeReal) get(p.homeId, p.homeTeamNumber).points += p.homeResult;
      if (awayReal) get(p.awayId, p.awayTeamNumber).points += p.awayResult;
      const unplayed = !team && (!homeReal || !awayReal || ssfRules && p.games.some(isUnplayedGame));
      if (!team) {
        if (homeReal) get(p.homeId, 0).roundsPaired += 1;
        if (awayReal) get(p.awayId, 0).roundsPaired += 1;
      }
      if (unplayed) {
        const sides = [
          [homeReal, p.homeId, p.homeResult - p.awayResult, awayReal],
          [awayReal, p.awayId, p.awayResult - p.homeResult, homeReal]
        ];
        for (const [real, id, margin, vsReal] of sides) {
          if (!real) continue;
          const x = get(id, 0);
          if (margin > 0) {
            x.unplayedWon += 1;
            if (vsReal) x.forfeitWins += 1;
          } else {
            x.unplayedLost += 1;
          }
        }
      } else if (homeReal && awayReal) {
        const h = get(p.homeId, p.homeTeamNumber);
        const a = get(p.awayId, p.awayTeamNumber);
        if (team) {
          recordMatch(h, p.homeResult, p.awayResult, matchPointValues);
          recordMatch(a, p.awayResult, p.homeResult, matchPointValues);
          const hk = keyOf(p.homeId, p.homeTeamNumber);
          const ak = keyOf(p.awayId, p.awayTeamNumber);
          h.mpAgainst.set(ak, (h.mpAgainst.get(ak) ?? 0) + matchPointsFor(p.homeResult, p.awayResult, matchPointValues));
          h.bpAgainst.set(ak, (h.bpAgainst.get(ak) ?? 0) + p.homeResult);
          a.mpAgainst.set(hk, (a.mpAgainst.get(hk) ?? 0) + matchPointsFor(p.awayResult, p.homeResult, matchPointValues));
          a.bpAgainst.set(hk, (a.bpAgainst.get(hk) ?? 0) + p.awayResult);
          if (p.games.length > 0) {
            const s = teamParity.known ? splitTeamMatch(p, teamParity.homeWhiteOnOdd) : null;
            if (s && s.ok) {
              for (const [b, v] of s.home) h.boardPoints.set(b, (h.boardPoints.get(b) ?? 0) + v);
              for (const [b, v] of s.away) a.boardPoints.set(b, (a.boardPoints.get(b) ?? 0) + v);
            } else {
              h.boardAttributed = false;
              a.boardAttributed = false;
            }
          }
        } else {
          recordGame(h, p.awayId, p.homeResult, p.awayResult);
          recordGame(a, p.homeId, p.awayResult, p.homeResult);
          for (const g of p.games) {
            if (g.blackId > 0) get(g.blackId, 0).gamesWithBlack += 1;
          }
        }
      }
    }
    snapshots.push({
      round,
      rows: buildRows(acc, keyOf, { team, qualityMetric, tiebreakSystem, boardKeys, roundsSoFar: snapshots.length + 1 }),
      estimated,
      secondaryBasis: basis
    });
  }
  return snapshots;
}
function recordGame(player, opponentId, myResult, opponentResult) {
  player.gamesPlayed += 1;
  player.opponents.push({ id: opponentId, myResult });
  if (myResult > opponentResult) player.wins += 1;
  else if (myResult === opponentResult) player.draws += 1;
  else player.losses += 1;
}
function matchPointsFor(myBoardPoints, opponentBoardPoints, mpv) {
  if (myBoardPoints > opponentBoardPoints) return mpv.win;
  if (myBoardPoints === opponentBoardPoints) return mpv.draw;
  return mpv.loss;
}
function recordMatch(team, myBoardPoints, opponentBoardPoints, mpv) {
  team.gamesPlayed += 1;
  team.matchPoints += matchPointsFor(myBoardPoints, opponentBoardPoints, mpv);
  if (myBoardPoints > opponentBoardPoints) team.wins += 1;
  else if (myBoardPoints === opponentBoardPoints) team.draws += 1;
  else team.losses += 1;
}
var BOARD_EPS = 1e-9;
function splitTeamMatch(p, homeWhiteOnOdd) {
  const home = /* @__PURE__ */ new Map();
  const away = /* @__PURE__ */ new Map();
  let hSum = 0;
  let aSum = 0;
  for (const g of p.games) {
    const [whitePts, blackPts] = calculatePoints(g.result);
    const homeIsWhite = g.tableNr % 2 === 1 === homeWhiteOnOdd;
    const hp = homeIsWhite ? whitePts : blackPts;
    const ap = homeIsWhite ? blackPts : whitePts;
    home.set(g.tableNr, hp);
    away.set(g.tableNr, ap);
    hSum += hp;
    aSum += ap;
  }
  const ok = Math.abs(hSum - p.homeResult) < BOARD_EPS && Math.abs(aSum - p.awayResult) < BOARD_EPS;
  return { home, away, ok };
}
function deriveTeamParity(matches) {
  let odd = 0;
  let even = 0;
  for (const p of matches) {
    const onOdd = splitTeamMatch(p, true);
    const onEven = splitTeamMatch(p, false);
    if (onOdd.ok && !onEven.ok) odd += 1;
    else if (onEven.ok && !onOdd.ok) even += 1;
  }
  return { homeWhiteOnOdd: odd >= even, known: odd > 0 || even > 0 };
}
function teamBoardKeys(boards) {
  const sorted = [...boards].sort((a, b) => a - b);
  const n = sorted.length;
  if (n < 2) return [];
  const half = Math.floor(n / 2);
  const keys = [sorted.slice(0, half)];
  for (let i = half; i < n - 1; i++) keys.push([sorted[i]]);
  return keys;
}
function resolveTeams(accs, boardKeys) {
  const oppKey = (a) => `${a.contenderId}:${a.teamNumber}`;
  const inbordes = (grp, field) => (t) => {
    let s = 0;
    for (const o of grp) if (o !== t) s += t[field].get(oppKey(o)) ?? 0;
    return s;
  };
  const criteria = [
    { score: () => (t) => t.matchPoints, needsBoards: false },
    { score: () => (t) => t.points, needsBoards: false },
    { score: (grp) => inbordes(grp, "mpAgainst"), needsBoards: false },
    { score: (grp) => inbordes(grp, "bpAgainst"), needsBoards: false },
    ...boardKeys.map((bs) => ({
      score: () => (t) => bs.reduce((s, b) => s + (t.boardPoints.get(b) ?? 0), 0),
      needsBoards: true
    }))
  ];
  const partition = (grp, score) => {
    const sorted = [...grp].sort((a, b) => score(b) - score(a));
    const parts = [];
    for (const t of sorted) {
      const last = parts[parts.length - 1];
      if (last && score(last[0]) === score(t)) last.push(t);
      else parts.push([t]);
    }
    return parts;
  };
  const resolve = (grp) => {
    if (grp.length === 1) return [grp];
    const boardsOk = grp.every((t) => t.boardAttributed);
    for (const c of criteria) {
      if (c.needsBoards && !boardsOk) break;
      const parts = partition(grp, c.score(grp));
      if (parts.length > 1) return parts.flatMap(resolve);
    }
    return [[...grp].sort((a, b) => a.order - b.order)];
  };
  return resolve(accs);
}
function buildRows(acc, keyOf, opts) {
  const { team, qualityMetric, tiebreakSystem, boardKeys = [], roundsSoFar } = opts;
  const absentRounds = (a) => Math.max(0, roundsSoFar - a.roundsPaired);
  const useSsf = !team && tiebreakSystem !== void 0 && isSsfSecPointsSupported(tiebreakSystem);
  const berger = !team && qualityMetric === "sonneborn-berger";
  const rows = [];
  const resultsAgainst = /* @__PURE__ */ new Map();
  const blackOf = /* @__PURE__ */ new Map();
  for (const a of acc.values()) {
    let qualityPoints;
    if (!team) {
      const opponentScores = [];
      const opponentAbsentRounds = [];
      const sbContributions = [];
      if (berger) {
        const r = /* @__PURE__ */ new Map();
        for (const opp of a.opponents) r.set(opp.id, (r.get(opp.id) ?? 0) + opp.myResult);
        resultsAgainst.set(a.contenderId, r);
        blackOf.set(a.contenderId, a.gamesWithBlack);
      }
      for (const opp of a.opponents) {
        const o = acc.get(keyOf(opp.id, 0));
        const oppScore = o?.points ?? 0;
        opponentScores.push(oppScore);
        opponentAbsentRounds.push(o ? absentRounds(o) : 0);
        sbContributions.push({ opponentScore: oppScore, myResult: opp.myResult });
      }
      const ssf = useSsf ? computeSsfSecPoints(tiebreakSystem, {
        opponentScores,
        opponentAbsentRounds,
        sbContributions,
        ownScore: a.points,
        wins: a.wins + a.forfeitWins,
        gamesWithBlack: a.gamesWithBlack,
        unplayedWon: a.unplayedWon,
        unplayedLost: a.unplayedLost,
        absentRounds: absentRounds(a)
      }) : null;
      qualityPoints = ssf ?? (qualityMetric === "sonneborn-berger" ? sbContributions.reduce((s, c) => s + c.opponentScore * c.myResult, 0) : opponentScores.reduce((s, x) => s + x, 0));
    }
    rows.push({
      contenderId: a.contenderId,
      teamNumber: team ? a.teamNumber : void 0,
      rank: 0,
      points: a.points,
      matchPoints: team ? a.matchPoints : void 0,
      qualityPoints,
      wins: a.wins,
      draws: a.draws,
      losses: a.losses,
      gamesPlayed: a.gamesPlayed
    });
  }
  if (team) {
    const classes = resolveTeams([...acc.values()], boardKeys);
    const rankOf = /* @__PURE__ */ new Map();
    const orderIndex = /* @__PURE__ */ new Map();
    let placed = 0;
    let idx = 0;
    for (const cls of classes) {
      const rank = placed + 1;
      for (const a of cls) {
        const k = keyOf(a.contenderId, a.teamNumber);
        rankOf.set(k, rank);
        orderIndex.set(k, idx++);
      }
      placed += cls.length;
    }
    const rowKey = (r) => keyOf(r.contenderId, r.teamNumber ?? 0);
    rows.sort((a, b) => orderIndex.get(rowKey(a)) - orderIndex.get(rowKey(b)));
    for (const r of rows) r.rank = rankOf.get(rowKey(r));
    return rows;
  }
  const inbordesOf = /* @__PURE__ */ new Map();
  if (berger) {
    const idsByPoints = /* @__PURE__ */ new Map();
    for (const r of rows) {
      const g = idsByPoints.get(r.points) ?? [];
      g.push(r.contenderId);
      idsByPoints.set(r.points, g);
    }
    for (const r of rows) {
      const group = idsByPoints.get(r.points);
      const mine = resultsAgainst.get(r.contenderId);
      let s = 0;
      if (mine && group.length > 1) {
        for (const other of group) if (other !== r.contenderId) s += mine.get(other) ?? 0;
      }
      inbordesOf.set(r.contenderId, s);
    }
  }
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (berger) {
      const ia = inbordesOf.get(a.contenderId) ?? 0;
      const ib = inbordesOf.get(b.contenderId) ?? 0;
      if (ib !== ia) return ib - ia;
      if (b.qualityPoints !== a.qualityPoints) return b.qualityPoints - a.qualityPoints;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (blackOf.get(b.contenderId) ?? 0) - (blackOf.get(a.contenderId) ?? 0);
    }
    if (b.qualityPoints !== a.qualityPoints) return b.qualityPoints - a.qualityPoints;
    return 0;
  });
  const tiedWithPrev = (prev, row) => {
    if (berger) {
      return prev.points === row.points && inbordesOf.get(prev.contenderId) === inbordesOf.get(row.contenderId) && prev.qualityPoints === row.qualityPoints && prev.wins === row.wins && blackOf.get(prev.contenderId) === blackOf.get(row.contenderId);
    }
    return prev.points === row.points && prev.qualityPoints === row.qualityPoints;
  };
  rows.forEach((row, i) => {
    row.rank = i === 0 ? 1 : tiedWithPrev(rows[i - 1], row) ? rows[i - 1].rank : i + 1;
  });
  return rows;
}

// src/services/results.ts
var ResultsService = class extends BaseApiService {
  constructor(baseUrl, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  // Tournament Results API methods
  /**
   * Get individual tournament results by group ID.
   *
   * Note: the upstream endpoint is server-side cached for ~10 seconds.
   * Polling faster than that returns stale data; back off accordingly.
   *
   * @param groupId - Tournament group ID (e.g., 15816)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Tournament results with player standings
   */
  async getTournamentResults(groupId, options) {
    const endpoint = `/tournamentresults/table/id/${groupId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get tournament round results by group ID.
   *
   * Note: the upstream endpoint is server-side cached for ~10 seconds.
   * Polling faster than that returns stale data; back off accordingly.
   *
   * @param groupId - Tournament group ID (e.g., 15816)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Tournament round results with individual games
   */
  async getTournamentRoundResults(groupId, options) {
    const endpoint = `/tournamentresults/roundresults/id/${groupId}`;
    return this.get(endpoint, options);
  }
  /**
   * Replay tournament standings round-by-round — a best-effort "playback" of how
   * the table evolved. Give it a group ID and nothing else: it detects whether
   * the event is team or individual, picks the right round-results endpoint, and
   * (for individual events) the right secondary metric — all from the tournament
   * data. The caller never specifies any of that.
   *
   * Cumulative points reproduce the official primary column exactly; this is an
   * *estimated* view of intermediate rounds. For the official final table use
   * `getTournamentResults` / `getTeamTournamentResults`.
   *
   * Detection: `isTeamPairing(tournament.type)` chooses team vs individual; for
   * individual events the group's `pairingSystemMember` chooses the secondary —
   * Sonneborn-Berger for Berger/round-robin (Buchholz is FIDE-invalid there),
   * Buchholz otherwise. Team standings (match points → board points) match the
   * official table exactly; individual quality points are indicative — the
   * official per-group tie-break variant is not reproduced (see `TiebreakSystem`).
   *
   * Returns every round's snapshot; for a single round just
   * `result.data?.find(s => s.round === n)`.
   *
   * @param groupId - Tournament group ID
   * @param options - Per-request options (e.g. timeoutMs), applied to every
   *   underlying request this method makes.
   * @returns One standings snapshot per round, ordered by round ascending
   */
  async getRoundStandings(groupId, options) {
    let mode = "individual";
    let qualityMetric = "buchholz";
    let tiebreakSystem;
    const tournament = await new TournamentService(this.baseUrl).getTournamentFromGroup(groupId, options);
    if (tournament.data) {
      mode = isTeamPairing(tournament.data.type) ? "team" : "individual";
      if (mode === "individual") {
        const group = findTournamentGroup(tournament.data, groupId);
        tiebreakSystem = group?.group.tiebreakSystem;
        if (group?.group.pairingSystemMember === PairingSystem.BERGER) {
          qualityMetric = "sonneborn-berger";
        }
      }
    }
    const roundResults = mode === "team" ? await this.getTeamRoundResults(groupId, options) : await this.getTournamentRoundResults(groupId, options);
    if (roundResults.error || !roundResults.data) {
      return {
        error: roundResults.error ?? "No round results",
        status: roundResults.status,
        message: "Error"
      };
    }
    const snapshots = computeRoundStandings(roundResults.data, { mode, qualityMetric, tiebreakSystem });
    await this.verifyAgainstOfficial(groupId, mode, snapshots, options);
    return { data: snapshots, status: roundResults.status, message: "Success" };
  }
  /**
   * Check our reconstructed final-round ordering against the official standings
   * table and, when it matches, mark estimated snapshots as `'verified'`. Pure
   * upgrade: never downgrades (a missing official row or table is ignored).
   */
  async verifyAgainstOfficial(groupId, mode, snapshots, options) {
    if (snapshots.length === 0) return;
    const finalRows = snapshots[snapshots.length - 1].rows;
    if (finalRows.length === 0) return;
    const key = (contenderId, teamNumber) => mode === "team" ? `${contenderId}:${teamNumber}` : `${contenderId}`;
    const officialPlace = /* @__PURE__ */ new Map();
    if (mode === "team") {
      const table = await this.getTeamTournamentResults(groupId, options);
      if (!table.data) return;
      for (const r of table.data) officialPlace.set(key(r.contenderId, r.teamNumber), r.place);
    } else {
      const table = await this.getTournamentResults(groupId, options);
      if (!table.data) return;
      for (const r of table.data) officialPlace.set(key(r.contenderId), r.place);
    }
    const orderedKeys = finalRows.map((row) => key(row.contenderId, row.teamNumber));
    const matches = orderingMatchesOfficial(orderedKeys, officialPlace);
    if (mode === "team") {
      if (!matches) {
        for (const snap of snapshots) {
          snap.estimated = true;
          snap.secondaryBasis = "indicative";
        }
      }
      return;
    }
    if (matches) {
      const final = snapshots[snapshots.length - 1];
      if (final.estimated) {
        final.estimated = false;
        final.secondaryBasis = "verified";
      }
    }
  }
  /**
   * Get team tournament results by group ID
   * @param groupId - Tournament group ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Team tournament results with club standings
   */
  async getTeamTournamentResults(groupId, options) {
    const endpoint = `/tournamentresults/team/table/id/${groupId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get team tournament round results by group ID
   * @param groupId - Tournament group ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Team tournament round results
   */
  async getTeamRoundResults(groupId, options) {
    const endpoint = `/tournamentresults/team/roundresults/id/${groupId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get individual tournament results for a specific member
   * @param memberId - Member ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of tournament results for the member
   */
  async getMemberTournamentResults(memberId, options) {
    const endpoint = `/tournamentresults/table/memberid/${memberId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get team tournament round results for a specific member
   * @param groupId - Tournament group ID
   * @param memberId - Member ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Team tournament round results for the specific member
   */
  async getTeamMemberRoundResults(groupId, memberId, options) {
    const endpoint = `/tournamentresults/team/roundresults/id/${groupId}/memberid/${memberId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get all games played by a member
   * Returns all games (individual and team tournaments) for the specified member.
   * Useful for player profiles showing complete game history.
   * @param memberId - Member ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of all games played by the member
   */
  async getMemberGames(memberId, options) {
    const endpoint = `/tournamentresults/game/memberid/${memberId}`;
    return this.get(endpoint, options);
  }
};

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
  getGroupName,
  ResultsService
};
