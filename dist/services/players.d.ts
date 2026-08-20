import { BaseApiService } from './base';
import type { PlayerInfoDto, ApiResponse, PlayerRatingHistory, MemberDateDto, RequestOptions } from '../types';
/**
 * Options for batch processing
 *
 * Extends {@link RequestOptions}, so `timeoutMs` applies to each individual
 * request within the batch.
 */
export interface BatchOptions extends RequestOptions {
    /** Number of parallel requests to execute at once (default: 10, use Infinity for unlimited) */
    concurrency?: number;
}
/**
 * Result of a single batch item
 * Either contains data or an error, never both
 */
export type BatchItemResult<T> = {
    data: T;
    error: null;
} | {
    data: null;
    error: string;
};
export declare class PlayerService extends BaseApiService {
    constructor(baseUrl?: string, timeoutMs?: number);
    /**
     * Get player information by SSF ID and date
     * @param playerId - The Swedish Chess Federation player ID (number)
     * @param date - Optional date (defaults to current date)
     * @param options - Per-request options (e.g. timeoutMs)
     *
     * @returns Player information
     */
    getPlayerInfo(playerId: number, date?: Date, options?: RequestOptions): Promise<ApiResponse<PlayerInfoDto>>;
    /**
     * Get player information by FIDE ID and date
     * @param fideId - The FIDE player ID (number)
     * @param date - Optional date (defaults to current date)
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Player information
     */
    getPlayerByFIDEId(fideId: number, date?: Date, options?: RequestOptions): Promise<ApiResponse<PlayerInfoDto>>;
    /**
     * Search for players by first name and last name
     * @param fornamn - The first name (Swedish: fornamn)
     * @param efternamn - The last name (Swedish: efternamn)
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Array of matching players
     */
    searchPlayer(fornamn: string, efternamn: string, options?: RequestOptions): Promise<ApiResponse<PlayerInfoDto[]>>;
    /**
     * Fetch player information for multiple players in a single API call
     *
     * @param members - Array of { id, date } objects
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Array of player information
     */
    getPlayerList(members: MemberDateDto[], options?: RequestOptions): Promise<ApiResponse<PlayerInfoDto[]>>;
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
    getPlayerInfoBatch(playerIds: number[], date?: Date, options?: BatchOptions): Promise<BatchItemResult<PlayerInfoDto>[]>;
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
    getPlayerEloHistory(playerId: number, startMonth?: string, endMonth?: string, options?: RequestOptions): Promise<ApiResponse<PlayerRatingHistory[]>>;
}
//# sourceMappingURL=players.d.ts.map