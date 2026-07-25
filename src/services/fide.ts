import { BaseApiService } from './base';
import type {
  ApiResponse,
  RequestOptions,
  FidePlayer,
  FidePlayerInfo,
  FideActivePlayer,
  FideRatingPeriod,
} from '../types';
import { CHESSTOOLS_API_URL } from '../constants';

export class FideService extends BaseApiService {
  constructor(baseUrl: string = CHESSTOOLS_API_URL, timeoutMs?: number) {
    super(baseUrl, undefined, timeoutMs);
  }

  /**
   * Get top players by classical rating
   * @param limit - Number of players to return (default: 100)
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getTopByRating(limit?: number, options?: RequestOptions): Promise<ApiResponse<FidePlayer[]>> {
    const params = limit !== undefined ? `?limit=${limit}` : '';
    return this.get<FidePlayer[]>(`/fide/top_by_rating${params}`, options);
  }

  /**
   * Get top active players
   * @param limit - Number of players to return
   * @param history - Include rating history
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getTopActive(
    limit?: number,
    history?: boolean,
    options?: RequestOptions
  ): Promise<ApiResponse<FideActivePlayer[]>> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.set('limit', String(limit));
    if (history !== undefined) params.set('history', String(history));
    const qs = params.toString();
    return this.get<FideActivePlayer[]>(`/fide/top_active/${qs ? `?${qs}` : ''}`, options);
  }

  /**
   * Get a single player by FIDE ID
   * @param fideId - The FIDE player ID
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getPlayer(fideId: number, options?: RequestOptions): Promise<ApiResponse<FidePlayer>> {
    return this.get<FidePlayer>(`/fide/${fideId}`, options);
  }

  /**
   * Get detailed player info
   * @param fideId - The FIDE player ID
   * @param history - Include rating history
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getPlayerInfo(
    fideId: number,
    history?: boolean,
    options?: RequestOptions
  ): Promise<ApiResponse<FidePlayerInfo>> {
    const params = new URLSearchParams();
    params.set('fide_id', String(fideId));
    if (history !== undefined) params.set('history', String(history));
    return this.get<FidePlayerInfo>(`/fide/player_info/?${params.toString()}`, options);
  }

  /**
   * Get full rating history for a player
   * @param fideId - The FIDE player ID
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getPlayerHistory(fideId: number, options?: RequestOptions): Promise<ApiResponse<FideRatingPeriod[]>> {
    return this.get<FideRatingPeriod[]>(`/fide/player_history/?fide_id=${fideId}`, options);
  }

  /**
   * Search for FIDE-rated players by name.
   *
   * @param query - Search string (name or partial name)
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async searchPlayers(query: string, options?: RequestOptions): Promise<ApiResponse<FidePlayer[]>> {
    const params = new URLSearchParams();
    params.set('query', query);
    params.set('list_type', 'fide');
    return this.get<FidePlayer[]>(`/ratinglist/search?${params.toString()}`, options);
  }
}
