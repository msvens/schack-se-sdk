import { BaseApiService } from './base';
import type {
  ApiResponse,
  FidePlayer,
  FidePlayerInfo,
  FideActivePlayer,
  FideRatingPeriod,
  FideSearchResult,
} from '../types';
import { CHESSTOOLS_API_URL } from '../constants';

export class FideService extends BaseApiService {
  constructor(baseUrl: string = CHESSTOOLS_API_URL) {
    super(baseUrl);
  }

  /**
   * Get top players by classical rating
   * @param limit - Number of players to return (default: 100)
   */
  async getTopByRating(limit?: number): Promise<ApiResponse<FidePlayer[]>> {
    const params = limit !== undefined ? `?limit=${limit}` : '';
    return this.get<FidePlayer[]>(`/fide/top_by_rating${params}`);
  }

  /**
   * Get top active players
   * @param limit - Number of players to return
   * @param history - Include rating history
   */
  async getTopActive(
    limit?: number,
    history?: boolean
  ): Promise<ApiResponse<FideActivePlayer[]>> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.set('limit', String(limit));
    if (history !== undefined) params.set('history', String(history));
    const qs = params.toString();
    return this.get<FideActivePlayer[]>(`/fide/top_active/${qs ? `?${qs}` : ''}`);
  }

  /**
   * Get a single player by FIDE ID
   * @param fideId - The FIDE player ID
   */
  async getPlayer(fideId: number): Promise<ApiResponse<FidePlayer>> {
    return this.get<FidePlayer>(`/fide/${fideId}`);
  }

  /**
   * Get detailed player info
   * @param fideId - The FIDE player ID
   * @param history - Include rating history
   */
  async getPlayerInfo(
    fideId: number,
    history?: boolean
  ): Promise<ApiResponse<FidePlayerInfo>> {
    const params = new URLSearchParams();
    params.set('fide_id', String(fideId));
    if (history !== undefined) params.set('history', String(history));
    return this.get<FidePlayerInfo>(`/fide/player_info/?${params.toString()}`);
  }

  /**
   * Get full rating history for a player
   * @param fideId - The FIDE player ID
   */
  async getPlayerHistory(fideId: number): Promise<ApiResponse<FideRatingPeriod[]>> {
    return this.get<FideRatingPeriod[]>(`/fide/player_history/?fide_id=${fideId}`);
  }

  /**
   * Search for FIDE-rated players by name.
   *
   * NOTE: As of Feb 2026, this endpoint is broken server-side on ChessTools —
   * it returns an empty array for all queries. The issue appears to be a missing
   * MongoDB text index. The method is kept for forward-compatibility in case
   * the ChessTools maintainer fixes it.
   *
   * @param query - Search string (name or partial name)
   */
  async searchPlayers(query: string): Promise<ApiResponse<FideSearchResult[]>> {
    const params = new URLSearchParams();
    params.set('query', query);
    params.set('list_type', 'fide');
    return this.get<FideSearchResult[]>(`/ratinglist/search?${params.toString()}`);
  }
}
