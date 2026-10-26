import { BaseApiService } from './base';
import type { ApiResponse, RequestOptions, MfideHealth, MfideKeyInfo, MfidePlayer, MfideTopEntry, MfideHistoryEntry, MfideRatingType, MfideSearchParams, MfideTopParams } from '../types';
/**
 * FIDE ratings from mfide, built on FIDE's official monthly rating lists.
 *
 * mfide answers HTTP 200 even for errors and puts the real status in the body
 * (`error.code`: 400, 404, 500, 503); this service unwraps that into the usual
 * `ApiResponse`, so e.g. an unknown player is `{ status: 404, error }`.
 * 401 (bad key) and 429 (rate limited) arrive as real HTTP statuses. A proxy
 * in front of mfide may answer 403/404/429 itself with a non-JSON body; those
 * keep their HTTP status.
 *
 * @example
 * ```ts
 * // Browser app behind a proxy that adds the key
 * const mfide = new MfideService('/api/fide');
 * // Node script calling mfide directly
 * const mfide = new MfideService(MFIDE_API_URL, process.env.MFIDE_API_KEY);
 * ```
 */
export declare class MfideService extends BaseApiService {
    /**
     * @param baseUrl - mfide's `/api` root (default {@link MFIDE_API_URL}), or a
     *   proxy path that maps to it
     * @param apiKey - Sent as `X-API-Key`. Server-side only: never put a key in
     *   browser code; let a proxy add it instead.
     * @param timeoutMs - Per-service request timeout
     */
    constructor(baseUrl?: string, apiKey?: string, timeoutMs?: number);
    private getEnveloped;
    /** Service status and data freshness (no key needed). */
    getHealth(options?: RequestOptions): Promise<ApiResponse<MfideHealth>>;
    /** The calling key's name and rate limit; a quick "is my key valid". */
    getKey(options?: RequestOptions): Promise<ApiResponse<MfideKeyInfo>>;
    /**
     * Find players by name (words in any order), best match first. A query of
     * digits only looks up that FIDE id (0 or 1 result).
     *
     * @param query - Name words; max 5 words / 100 chars, at least one word of 2+ letters
     */
    searchPlayers(query: string, params?: MfideSearchParams, options?: RequestOptions): Promise<ApiResponse<MfidePlayer[]>>;
    /** One player with the current month's ratings; 404 for unknown or removed players. */
    getPlayer(fideId: number, options?: RequestOptions): Promise<ApiResponse<MfidePlayer>>;
    /**
     * A player's monthly ratings, oldest first (up to 60 months).
     *
     * @param type - Only that type, and only months the player was rated in it
     */
    getPlayerHistory(fideId: number, type?: MfideRatingType, options?: RequestOptions): Promise<ApiResponse<MfideHistoryEntry[]>>;
    /** A current top list in FIDE's order (active in the type, rating, games, name). */
    getTop(params?: MfideTopParams, options?: RequestOptions): Promise<ApiResponse<MfideTopEntry[]>>;
}
//# sourceMappingURL=mfide.d.ts.map