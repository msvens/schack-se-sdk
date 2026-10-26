import { BaseApiService } from './base';
import type {
  ApiResponse,
  RequestOptions,
  MfideHealth,
  MfideKeyInfo,
  MfidePlayer,
  MfideTopEntry,
  MfideHistoryEntry,
  MfideRatingType,
  MfideSearchParams,
  MfideTopParams,
} from '../types';
import { MFIDE_API_URL } from '../constants';

/** mfide's response envelope: `{ data }` or `{ error: { code, message } }`. */
interface Envelope<T> {
  data?: T;
  error?: { code: number; message: string };
}

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
export class MfideService extends BaseApiService {
  /**
   * @param baseUrl - mfide's `/api` root (default {@link MFIDE_API_URL}), or a
   *   proxy path that maps to it
   * @param apiKey - Sent as `X-API-Key`. Server-side only: never put a key in
   *   browser code; let a proxy add it instead.
   * @param timeoutMs - Per-service request timeout
   */
  constructor(baseUrl: string = MFIDE_API_URL, apiKey?: string, timeoutMs?: number) {
    super(baseUrl, apiKey ? { 'X-API-Key': apiKey } : undefined, timeoutMs);
  }

  private async getEnveloped<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const response = await this.get<Envelope<T>>(endpoint, options);
    const body = response.data;
    if (!body) return { error: response.error, status: response.status, message: response.message };
    if (body.error) return { error: body.error.message, status: body.error.code, message: 'Error' };
    return { data: body.data, status: response.status, message: 'Success' };
  }

  /** Service status and data freshness (no key needed). */
  async getHealth(options?: RequestOptions): Promise<ApiResponse<MfideHealth>> {
    return this.getEnveloped<MfideHealth>('/health', options);
  }

  /** The calling key's name and rate limit; a quick "is my key valid". */
  async getKey(options?: RequestOptions): Promise<ApiResponse<MfideKeyInfo>> {
    return this.getEnveloped<MfideKeyInfo>('/key', options);
  }

  /**
   * Find players by name (words in any order), best match first. A query of
   * digits only looks up that FIDE id (0 or 1 result).
   *
   * @param query - Name words; max 5 words / 100 chars, at least one word of 2+ letters
   */
  async searchPlayers(
    query: string,
    params: MfideSearchParams = {},
    options?: RequestOptions
  ): Promise<ApiResponse<MfidePlayer[]>> {
    const qs = new URLSearchParams({ q: query });
    if (params.match) qs.set('match', params.match);
    if (params.country) qs.set('country', params.country);
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    return this.getEnveloped<MfidePlayer[]>(`/v1/players/search?${qs}`, options);
  }

  /** One player with the current month's ratings; 404 for unknown or removed players. */
  async getPlayer(fideId: number, options?: RequestOptions): Promise<ApiResponse<MfidePlayer>> {
    return this.getEnveloped<MfidePlayer>(`/v1/players/${fideId}`, options);
  }

  /**
   * A player's monthly ratings, oldest first (up to 60 months).
   *
   * @param type - Only that type, and only months the player was rated in it
   */
  async getPlayerHistory(
    fideId: number,
    type?: MfideRatingType,
    options?: RequestOptions
  ): Promise<ApiResponse<MfideHistoryEntry[]>> {
    const qs = type ? `?type=${type}` : '';
    return this.getEnveloped<MfideHistoryEntry[]>(`/v1/players/${fideId}/history${qs}`, options);
  }

  /** A current top list in FIDE's order (active in the type, rating, games, name). */
  async getTop(params: MfideTopParams = {}, options?: RequestOptions): Promise<ApiResponse<MfideTopEntry[]>> {
    const qs = new URLSearchParams();
    if (params.type) qs.set('type', params.type);
    if (params.list) qs.set('list', params.list);
    if (params.country) qs.set('country', params.country);
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return this.getEnveloped<MfideTopEntry[]>(`/v1/top${query ? `?${query}` : ''}`, options);
  }
}
