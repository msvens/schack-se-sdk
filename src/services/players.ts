import { BaseApiService } from './base';
import type { PlayerInfoDto, ApiResponse, PlayerRatingHistory, MemberDateDto } from '../types';
import { chunkArray } from '../utils/batchUtils';

/**
 * Options for batch processing
 */
export interface BatchOptions {
  /** Number of parallel requests to execute at once (default: 10, use Infinity for unlimited) */
  concurrency?: number;
}

/**
 * Result of a single batch item
 * Either contains data or an error, never both
 */
export type BatchItemResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export class PlayerService extends BaseApiService {
  constructor(baseUrl?: string) {
    super(baseUrl);
  }

  // Player API methods

  /**
   * Get player information by SSF ID and date
   * @param playerId - The Swedish Chess Federation player ID (number)
   * @param date - Optional date (defaults to current date)
   *
   * @returns Player information
   */
  async getPlayerInfo(
    playerId: number,
    date?: Date
  ): Promise<ApiResponse<PlayerInfoDto>> {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/${playerId}/date/${targetDate}`;

    return this.get<PlayerInfoDto>(endpoint);
  }

  /**
   * Get player information by FIDE ID and date
   * @param fideId - The FIDE player ID (number)
   * @param date - Optional date (defaults to current date)
   * @returns Player information
   */
  async getPlayerByFIDEId(
    fideId: number,
    date?: Date
  ): Promise<ApiResponse<PlayerInfoDto>> {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/fideid/${fideId}/date/${targetDate}`;

    return this.get<PlayerInfoDto>(endpoint);
  }

  /**
   * Search for players by first name and last name
   * @param fornamn - The first name (Swedish: fornamn)
   * @param efternamn - The last name (Swedish: efternamn)
   * @returns Array of matching players
   */
  async searchPlayer(
    fornamn: string,
    efternamn: string
  ): Promise<ApiResponse<PlayerInfoDto[]>> {
    const endpoint = `/player/fornamn/${encodeURIComponent(fornamn)}/efternamn/${encodeURIComponent(efternamn)}`;

    return this.get<PlayerInfoDto[]>(endpoint);
  }

  /**
   * Fetch player information for multiple players in a single API call
   *
   * @param members - Array of { id, date } objects
   * @returns Array of player information
   */
  async getPlayerList(members: MemberDateDto[]): Promise<ApiResponse<PlayerInfoDto[]>> {
    return this.post<PlayerInfoDto[]>('/player/list/', members);
  }

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
  async getPlayerInfoBatch(
    playerIds: number[],
    date?: Date,
    options: BatchOptions = {}
  ): Promise<BatchItemResult<PlayerInfoDto>[]> {
    const { concurrency = 10 } = options;
    const chunks = chunkArray(playerIds, concurrency);

    const results: BatchItemResult<PlayerInfoDto>[] = [];

    // Process each chunk sequentially
    for (const chunk of chunks) {
      // Within each chunk, process requests in parallel
      const responses = await Promise.allSettled(
        chunk.map(id => this.getPlayerInfo(id, date))
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
  async getPlayerEloHistory(
    playerId: number,
    startMonth?: string,
    endMonth?: string
  ): Promise<ApiResponse<PlayerRatingHistory[]>> {
    try {
      // Parse start/end months or use defaults (12 months back to current month)
      const today = new Date();
      const end = endMonth
        ? new Date(parseInt(endMonth.split('-')[0]), parseInt(endMonth.split('-')[1]) - 1, 1)
        : new Date(today.getFullYear(), today.getMonth(), 1);
      const start = startMonth
        ? new Date(parseInt(startMonth.split('-')[0]), parseInt(startMonth.split('-')[1]) - 1, 1)
        : new Date(today.getFullYear(), today.getMonth() - 11, 1);

      // Generate dates from end backwards to start
      const dates: Date[] = [];
      const current = new Date(end.getFullYear(), end.getMonth(), 1);
      while (current >= start) {
        dates.push(new Date(current.getFullYear(), current.getMonth(), 1));
        current.setMonth(current.getMonth() - 1);
      }

      // Build MemberDateDto[] for all months and fetch in one call
      const members: MemberDateDto[] = dates.map(d => ({
        id: playerId,
        date: this.formatDateToString(d)
      }));

      const response = await this.getPlayerList(members);

      if (response.error || !response.data) {
        return {
          status: response.status,
          error: response.error || 'Failed to fetch rating history'
        };
      }

      // Process results in order (most recent first) with stop logic
      const ratingHistory: PlayerRatingHistory[] = [];
      for (const player of response.data) {
        const elo = player.elo;
        const lask = player.lask;

        // Check if player has any ratings at this date
        const hasAnyRating = elo?.rating || elo?.rapidRating || elo?.blitzRating || lask?.rating;

        if (hasAnyRating) {
          ratingHistory.push({ elo, lask });
        } else {
          // No ratings found - player likely didn't exist yet or wasn't rated
          break;
        }
      }

      return {
        status: 200,
        data: ratingHistory
      };

    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : 'Failed to fetch rating history'
      };
    }
  }
}
