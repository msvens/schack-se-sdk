import { BaseApiService } from './base';
import type { ApiResponse, RequestOptions, FidePlayer, FidePlayerInfo, FideActivePlayer, FideRatingPeriod } from '../types';
export declare class FideService extends BaseApiService {
    constructor(baseUrl?: string, timeoutMs?: number);
    /**
     * Get top players by classical rating
     * @param limit - Number of players to return (default: 100)
     * @param options - Per-request options (e.g. timeoutMs)
     */
    getTopByRating(limit?: number, options?: RequestOptions): Promise<ApiResponse<FidePlayer[]>>;
    /**
     * Get top active players
     * @param limit - Number of players to return
     * @param history - Include rating history
     * @param options - Per-request options (e.g. timeoutMs)
     */
    getTopActive(limit?: number, history?: boolean, options?: RequestOptions): Promise<ApiResponse<FideActivePlayer[]>>;
    /**
     * Get a single player by FIDE ID
     * @param fideId - The FIDE player ID
     * @param options - Per-request options (e.g. timeoutMs)
     */
    getPlayer(fideId: number, options?: RequestOptions): Promise<ApiResponse<FidePlayer>>;
    /**
     * Get detailed player info
     * @param fideId - The FIDE player ID
     * @param history - Include rating history
     * @param options - Per-request options (e.g. timeoutMs)
     */
    getPlayerInfo(fideId: number, history?: boolean, options?: RequestOptions): Promise<ApiResponse<FidePlayerInfo>>;
    /**
     * Get full rating history for a player
     * @param fideId - The FIDE player ID
     * @param options - Per-request options (e.g. timeoutMs)
     */
    getPlayerHistory(fideId: number, options?: RequestOptions): Promise<ApiResponse<FideRatingPeriod[]>>;
    /**
     * Search for FIDE-rated players by name.
     *
     * @param query - Search string (name or partial name)
     * @param options - Per-request options (e.g. timeoutMs)
     */
    searchPlayers(query: string, options?: RequestOptions): Promise<ApiResponse<FidePlayer[]>>;
}
//# sourceMappingURL=fide.d.ts.map