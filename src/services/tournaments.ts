import { BaseApiService } from './base';
import type { TournamentDto, GroupSearchAnswerDto, ApiResponse, RequestOptions } from '../types';
import { notifyItem, toBatchItem, type BatchOptions, type BatchItemResult } from './players';
import { chunkArray } from '../utils/batchUtils';

/**
 * Makes a searchGroups word safe for the URL path. The server answers an encoded
 * "/" with 404 (rejected before the app runs), an encoded "\" with 400, and drops
 * everything after a ";". Each becomes the single-character wildcard "_". Empty
 * and dot-only words (which would resolve to another path) return null.
 */
function toSearchGroupsWord(searchWord: string): string | null {
  const word = searchWord.trim().replace(/[/\\;]/g, '_');
  return word === '' || /^\.+$/.test(word) ? null : word;
}

export class TournamentService extends BaseApiService {
  constructor(baseUrl?: string, timeoutMs?: number) {
    super(baseUrl, undefined, timeoutMs);
  }

  // Tournament Structure API methods

  /**
   * Get detailed tournament information by tournament ID
   * @param tournamentId - Tournament ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Comprehensive tournament information including classes and groups
   */
  async getTournament(tournamentId: number, options?: RequestOptions): Promise<ApiResponse<TournamentDto>> {
    const endpoint = `/tournament/tournament/id/${tournamentId}`;

    return this.get<TournamentDto>(endpoint, options);
  }

  /**
   * Get tournament information by group ID
   * @param groupId - Tournament group ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Tournament information for the tournament containing this group
   */
  async getTournamentFromGroup(groupId: number, options?: RequestOptions): Promise<ApiResponse<TournamentDto>> {
    const endpoint = `/tournament/group/id/${groupId}`;

    return this.get<TournamentDto>(endpoint, options);
  }

  /**
   * Get tournament information by class/division ID
   * @param classId - Tournament class ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Tournament information for the tournament containing this class
   */
  async getTournamentFromClass(classId: number, options?: RequestOptions): Promise<ApiResponse<TournamentDto>> {
    const endpoint = `/tournament/class/id/${classId}`;

    return this.get<TournamentDto>(endpoint, options);
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
  async searchGroups(searchWord: string, options?: RequestOptions): Promise<ApiResponse<GroupSearchAnswerDto[]>> {
    const word = toSearchGroupsWord(searchWord);
    if (word === null) {
      return { data: [], status: 200, message: 'Success' };
    }
    const endpoint = `/tournament/group/search/${encodeURIComponent(word)}`;

    return this.get<GroupSearchAnswerDto[]>(endpoint, options);
  }

  /**
   * Get upcoming tournaments
   * @param districtId - Optional district ID to filter by district and club tournaments
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of upcoming tournaments
   */
  async searchComingTournaments(districtId?: number, options?: RequestOptions): Promise<ApiResponse<TournamentDto[]>> {
    const endpoint = districtId !== undefined
      ? `/tournament/group/coming/${districtId}`
      : '/tournament/group/coming';

    return this.get<TournamentDto[]>(endpoint, options);
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
  async searchUpdatedTournaments(
    startDate: string,
    endDate: string,
    districtId?: number,
    options?: RequestOptions
  ): Promise<ApiResponse<TournamentDto[]>> {
    const endpoint = districtId !== undefined
      ? `/tournament/tournament/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}`
      : `/tournament/tournament/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;

    return this.get<TournamentDto[]>(endpoint, options);
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
  async searchUpdatedGroups(
    startDate: string,
    endDate: string,
    districtId?: number,
    options?: RequestOptions
  ): Promise<ApiResponse<GroupSearchAnswerDto[]>> {
    const endpoint = districtId !== undefined
      ? `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}`
      : `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;

    return this.get<GroupSearchAnswerDto[]>(endpoint, options);
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
  async getTournamentBatch(
    tournamentIds: number[],
    options: BatchOptions<TournamentDto> = {}
  ): Promise<BatchItemResult<TournamentDto>[]> {
    const { concurrency = 10, timeoutMs } = options;
    const chunks = chunkArray(tournamentIds, concurrency);

    const results: BatchItemResult<TournamentDto>[] = [];

    // Process each chunk sequentially
    for (const chunk of chunks) {
      // Within each chunk, process requests in parallel
      const responses = await Promise.allSettled(
        chunk.map(id => this.getTournament(id, { timeoutMs }))
      );

      // Collect results in order — exactly one per input — and report each as it lands
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
  async getTournamentFromGroupBatch(
    groupIds: number[],
    options: BatchOptions<TournamentDto> = {}
  ): Promise<BatchItemResult<TournamentDto>[]> {
    const { concurrency = 10, timeoutMs } = options;
    const chunks = chunkArray(groupIds, concurrency);

    const results: BatchItemResult<TournamentDto>[] = [];

    // Process each chunk sequentially
    for (const chunk of chunks) {
      // Within each chunk, process requests in parallel
      const responses = await Promise.allSettled(
        chunk.map(id => this.getTournamentFromGroup(id, { timeoutMs }))
      );

      // Collect results in order — exactly one per input — and report each as it lands
      responses.forEach((response) => {
        const result = toBatchItem(response);
        results.push(result);
        notifyItem(options.onItem, result, results.length - 1);
      });
    }

    return results;
  }
}
