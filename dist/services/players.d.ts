import { BaseApiService } from './base';
import type { PlayerInfoDto, ApiResponse, PlayerRatingHistory, MemberDateDto, RequestOptions } from '../types';
/**
 * Options for batch processing
 *
 * Extends {@link RequestOptions}, so `timeoutMs` applies to each individual
 * request within the batch.
 */
export interface BatchOptions<T = unknown> extends RequestOptions {
    /** Number of parallel requests to execute at once (default: 10, use Infinity for unlimited) */
    concurrency?: number;
    /**
     * Called once per input as it resolves, with the same result object the
     * returned array holds at `index` — e.g. to count progress or fill a cache
     * as results arrive. Fires in completion order, not index order (a
     * successful bulk request fires its items as one burst), and every index
     * fires before the promise resolves. Errors thrown by the callback are
     * caught and ignored, so the batch always completes.
     */
    onItem?: (result: BatchItemResult<T>, index: number) => void;
}
/**
 * Result of a single batch item, with the HTTP status it resolved to:
 * - **found**: `data` set, `error: null`, `status` 200
 * - **missing**: `data: null`, `error: null`, `status` 204 or 404 — the API has no such record
 * - **error**: `data: null`, `error` set, `status` 0 (network / invalid input), 408 (timeout) or the
 *   HTTP error status — worth retrying later, unlike "missing"
 */
export type BatchItemResult<T> = {
    data: T;
    error: null;
    status: number;
} | {
    data: null;
    error: string | null;
    status: number;
};
/**
 * Deliver one result to a batch's `onItem`, isolating the batch from errors in it.
 * @internal shared by the batch methods of the services
 */
export declare function notifyItem<T>(onItem: BatchOptions<T>['onItem'], result: BatchItemResult<T>, index: number): void;
/**
 * One batch item from a settled request. Every input yields exactly one item,
 * including a response that carries neither data nor error.
 * @internal shared by the batch methods of the services
 */
export declare function toBatchItem<T>(settled: PromiseSettledResult<ApiResponse<T>>): BatchItemResult<T>;
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
     * Fetch many player records, each as of its own date, without failing as a whole.
     *
     * Strategy: one bulk `POST /player/list/` (see {@link getPlayerList}) for all
     * unique `(id, date)` pairs. That POST fails entirely (HTTP 500) if any id is
     * unknown to the member register — common in junior and school events — so
     * on failure the pairs are re-posted in chunks of 25 (4 POSTs in parallel),
     * and the pairs of every chunk that still fails are fetched with one GET each
     * (`concurrency` at a time). Clean data costs a single request; a single
     * pair is fetched with its GET directly, so this is also the way to fetch one.
     * A network failure (status 0) on a POST is reported for its pairs without
     * fanning out to single GETs.
     *
     * @param playerIds - Player IDs, all looked up at `date` (duplicates allowed)
     * @param date - Date for every id (defaults to today)
     * @param requests - `{ id, date: 'YYYY-MM-DD' }` pairs, each at its own date (duplicates allowed)
     * @param options - `concurrency` for the single-GET fallback (default 10) and `timeoutMs` per request
     * @returns One result per input, in input order — found, missing or error (see {@link BatchItemResult}).
     *   A month without a rating still returns the player (without `elo`): that is "found".
     *
     * @example
     * ```ts
     * const results = await players.getPlayerInfoBatch([
     *   { id: 594192, date: '2026-10-01' },
     *   { id: 762705, date: '2026-10-01' },
     * ]);
     * // [{ data: {...}, error: null, status: 200 }, { data: null, error: null, status: 204 }]
     * ```
     */
    getPlayerInfoBatch(playerIds: number[], date?: Date, options?: BatchOptions<PlayerInfoDto>): Promise<BatchItemResult<PlayerInfoDto>[]>;
    getPlayerInfoBatch(requests: MemberDateDto[], options?: BatchOptions<PlayerInfoDto>): Promise<BatchItemResult<PlayerInfoDto>[]>;
    /**
     * Bulk-fetch one chunk, settling each pair: one POST; on failure, retry POSTs of
     * {@link RETRY_CHUNK} pairs ({@link RETRY_PARALLEL} at a time); then one GET
     * per pair of every retry chunk that still failed, `concurrency` at a time.
     */
    private fetchPlayerChunk;
    /**
     * One `/player/list/` POST for `chunk`. Returns true when its pairs are settled:
     * either answered (found) or, on a network failure (status 0), marked as errors —
     * single GETs would fail the same way. Returns false when the chunk should be
     * retried smaller / per pair (HTTP 500 from an unknown id, a timeout, an
     * answer that doesn't line up with the request).
     */
    private postPlayerChunk;
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