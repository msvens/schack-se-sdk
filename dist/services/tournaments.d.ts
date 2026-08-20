import { BaseApiService } from './base';
import type { TournamentDto, GroupSearchAnswerDto, ApiResponse, RequestOptions } from '../types';
import type { BatchOptions, BatchItemResult } from './players';
export declare class TournamentService extends BaseApiService {
    constructor(baseUrl?: string, timeoutMs?: number);
    /**
     * Get detailed tournament information by tournament ID
     * @param tournamentId - Tournament ID
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Comprehensive tournament information including classes and groups
     */
    getTournament(tournamentId: number, options?: RequestOptions): Promise<ApiResponse<TournamentDto>>;
    /**
     * Get tournament information by group ID
     * @param groupId - Tournament group ID
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Tournament information for the tournament containing this group
     */
    getTournamentFromGroup(groupId: number, options?: RequestOptions): Promise<ApiResponse<TournamentDto>>;
    /**
     * Get tournament information by class/division ID
     * @param classId - Tournament class ID
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Tournament information for the tournament containing this class
     */
    getTournamentFromClass(classId: number, options?: RequestOptions): Promise<ApiResponse<TournamentDto>>;
    /**
     * Search for tournament groups by name or location
     * @param searchWord - Search term for tournament/group name or location
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Array of matching tournament groups with basic information
     */
    searchGroups(searchWord: string, options?: RequestOptions): Promise<ApiResponse<GroupSearchAnswerDto[]>>;
    /**
     * Get upcoming tournaments
     * @param districtId - Optional district ID to filter by district and club tournaments
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Array of upcoming tournaments
     */
    searchComingTournaments(districtId?: number, options?: RequestOptions): Promise<ApiResponse<TournamentDto[]>>;
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
    searchUpdatedTournaments(startDate: string, endDate: string, districtId?: number, options?: RequestOptions): Promise<ApiResponse<TournamentDto[]>>;
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
    searchUpdatedGroups(startDate: string, endDate: string, districtId?: number, options?: RequestOptions): Promise<ApiResponse<GroupSearchAnswerDto[]>>;
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
    getTournamentBatch(tournamentIds: number[], options?: BatchOptions): Promise<BatchItemResult<TournamentDto>[]>;
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
    getTournamentFromGroupBatch(groupIds: number[], options?: BatchOptions): Promise<BatchItemResult<TournamentDto>[]>;
}
//# sourceMappingURL=tournaments.d.ts.map