import { BaseApiService } from './base';
import type { TournamentDto, GroupSearchAnswerDto, ApiResponse } from '../types';
import type { BatchOptions, BatchItemResult } from './players';
import { chunkArray } from '../utils/batchUtils';

export class TournamentService extends BaseApiService {
  constructor(baseUrl?: string) {
    super(baseUrl);
  }

  // Tournament Structure API methods

  /**
   * Get detailed tournament information by tournament ID
   * @param tournamentId - Tournament ID
   * @returns Comprehensive tournament information including classes and groups
   */
  async getTournament(tournamentId: number): Promise<ApiResponse<TournamentDto>> {
    const endpoint = `/tournament/tournament/id/${tournamentId}`;

    return this.get<TournamentDto>(endpoint);
  }

  /**
   * Get tournament information by group ID
   * @param groupId - Tournament group ID
   * @returns Tournament information for the tournament containing this group
   */
  async getTournamentFromGroup(groupId: number): Promise<ApiResponse<TournamentDto>> {
    const endpoint = `/tournament/group/id/${groupId}`;

    return this.get<TournamentDto>(endpoint);
  }

  /**
   * Get tournament information by class/division ID
   * @param classId - Tournament class ID
   * @returns Tournament information for the tournament containing this class
   */
  async getTournamentFromClass(classId: number): Promise<ApiResponse<TournamentDto>> {
    const endpoint = `/tournament/class/id/${classId}`;

    return this.get<TournamentDto>(endpoint);
  }

  /**
   * Search for tournament groups by name or location
   * @param searchWord - Search term for tournament/group name or location
   * @returns Array of matching tournament groups with basic information
   */
  async searchGroups(searchWord: string): Promise<ApiResponse<GroupSearchAnswerDto[]>> {
    const endpoint = `/tournament/group/search/${encodeURIComponent(searchWord)}`;

    return this.get<GroupSearchAnswerDto[]>(endpoint);
  }

  /**
   * Get upcoming tournaments
   * @param districtId - Optional district ID to filter by district and club tournaments
   * @returns Array of upcoming tournaments
   */
  async searchComingTournaments(districtId?: number): Promise<ApiResponse<TournamentDto[]>> {
    const endpoint = districtId !== undefined
      ? `/tournament/group/coming/${districtId}`
      : '/tournament/group/coming';

    return this.get<TournamentDto[]>(endpoint);
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
  async searchUpdatedTournaments(
    startDate: string,
    endDate: string,
    districtId?: number
  ): Promise<ApiResponse<TournamentDto[]>> {
    const endpoint = districtId !== undefined
      ? `/tournament/tournament/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}`
      : `/tournament/tournament/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;

    return this.get<TournamentDto[]>(endpoint);
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
  async searchUpdatedGroups(
    startDate: string,
    endDate: string,
    districtId?: number
  ): Promise<ApiResponse<GroupSearchAnswerDto[]>> {
    const endpoint = districtId !== undefined
      ? `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}`
      : `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;

    return this.get<GroupSearchAnswerDto[]>(endpoint);
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
    options: BatchOptions = {}
  ): Promise<BatchItemResult<TournamentDto>[]> {
    const { concurrency = 10 } = options;
    const chunks = chunkArray(tournamentIds, concurrency);

    const results: BatchItemResult<TournamentDto>[] = [];

    // Process each chunk sequentially
    for (const chunk of chunks) {
      // Within each chunk, process requests in parallel
      const responses = await Promise.allSettled(
        chunk.map(id => this.getTournament(id))
      );

      // Collect results in order
      responses.forEach((response) => {
        if (response.status === 'fulfilled' && response.value.data) {
          results.push({ data: response.value.data, error: null });
        } else if (response.status === 'fulfilled' && response.value.error) {
          results.push({ data: null, error: response.value.error });
        } else if (response.status === 'rejected') {
          results.push({
            data: null,
            error: response.reason?.message || 'Unknown error'
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
  async getTournamentFromGroupBatch(
    groupIds: number[],
    options: BatchOptions = {}
  ): Promise<BatchItemResult<TournamentDto>[]> {
    const { concurrency = 10 } = options;
    const chunks = chunkArray(groupIds, concurrency);

    const results: BatchItemResult<TournamentDto>[] = [];

    // Process each chunk sequentially
    for (const chunk of chunks) {
      // Within each chunk, process requests in parallel
      const responses = await Promise.allSettled(
        chunk.map(id => this.getTournamentFromGroup(id))
      );

      // Collect results in order
      responses.forEach((response) => {
        if (response.status === 'fulfilled' && response.value.data) {
          results.push({ data: response.value.data, error: null });
        } else if (response.status === 'fulfilled' && response.value.error) {
          results.push({ data: null, error: response.value.error });
        } else if (response.status === 'rejected') {
          results.push({
            data: null,
            error: response.reason?.message || 'Unknown error'
          });
        }
      });
    }

    return results;
  }
}
