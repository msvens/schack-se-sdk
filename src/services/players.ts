import { BaseApiService } from './base';
import type { PlayerInfoDto, ApiResponse, PlayerRatingHistory, MemberDateDto, RequestOptions } from '../types';
import { chunkArray } from '../utils/batchUtils';

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
 * Result of a single batch item, with the HTTP status it resolved to:
 * - **found**: `data` set, `error: null`, `status` 200
 * - **missing**: `data: null`, `error: null`, `status` 204 or 404 — the API has no such record
 * - **error**: `data: null`, `error` set, `status` 0 (network / invalid input), 408 (timeout) or the
 *   HTTP error status — worth retrying later, unlike "missing"
 */
export type BatchItemResult<T> =
  | { data: T; error: null; status: number }
  | { data: null; error: string | null; status: number };

/** Statuses meaning "the API has no such record" rather than "the request failed". */
const MISSING_STATUSES = new Set([204, 404]);

/**
 * One batch item from a settled request. Every input yields exactly one item,
 * including a response that carries neither data nor error.
 * @internal shared by the batch methods of the services
 */
export function toBatchItem<T>(settled: PromiseSettledResult<ApiResponse<T>>): BatchItemResult<T> {
  if (settled.status === 'rejected') {
    return { data: null, error: settled.reason?.message || 'Unknown error', status: 0 };
  }
  const { data, error, status } = settled.value;
  if (data !== undefined && data !== null) return { data, error: null, status };
  if (MISSING_STATUSES.has(status)) return { data: null, error: null, status };
  return { data: null, error: error || 'No data', status };
}

/** Bulk POST size (verified fine up to 4000 pairs; this keeps answers modest). */
const BULK_CHUNK = 1000;
/** Chunk size when a bulk POST fails, so one unknown id only costs its own chunk. */
const RETRY_CHUNK = 25;
/** Retry POSTs in flight at once. */
const RETRY_PARALLEL = 4;

export class PlayerService extends BaseApiService {
  constructor(baseUrl?: string, timeoutMs?: number) {
    super(baseUrl, undefined, timeoutMs);
  }

  // Player API methods

  /**
   * Get player information by SSF ID and date
   * @param playerId - The Swedish Chess Federation player ID (number)
   * @param date - Optional date (defaults to current date)
   * @param options - Per-request options (e.g. timeoutMs)
   *
   * @returns Player information
   */
  async getPlayerInfo(
    playerId: number,
    date?: Date,
    options?: RequestOptions
  ): Promise<ApiResponse<PlayerInfoDto>> {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/${playerId}/date/${targetDate}`;

    return this.get<PlayerInfoDto>(endpoint, options);
  }

  /**
   * Get player information by FIDE ID and date
   * @param fideId - The FIDE player ID (number)
   * @param date - Optional date (defaults to current date)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Player information
   */
  async getPlayerByFIDEId(
    fideId: number,
    date?: Date,
    options?: RequestOptions
  ): Promise<ApiResponse<PlayerInfoDto>> {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/fideid/${fideId}/date/${targetDate}`;

    return this.get<PlayerInfoDto>(endpoint, options);
  }

  /**
   * Search for players by first name and last name
   * @param fornamn - The first name (Swedish: fornamn)
   * @param efternamn - The last name (Swedish: efternamn)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of matching players
   */
  async searchPlayer(
    fornamn: string,
    efternamn: string,
    options?: RequestOptions
  ): Promise<ApiResponse<PlayerInfoDto[]>> {
    const endpoint = `/player/fornamn/${encodeURIComponent(fornamn)}/efternamn/${encodeURIComponent(efternamn)}`;

    return this.get<PlayerInfoDto[]>(endpoint, options);
  }

  /**
   * Fetch player information for multiple players in a single API call
   *
   * @param members - Array of { id, date } objects
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of player information
   */
  async getPlayerList(members: MemberDateDto[], options?: RequestOptions): Promise<ApiResponse<PlayerInfoDto[]>> {
    return this.post<PlayerInfoDto[]>('/player/list/', members, options);
  }

  /**
   * Fetch many player records, each as of its own date, without failing as a whole.
   *
   * Strategy: one bulk `POST /player/list/` (see {@link getPlayerList}) for all
   * unique `(id, date)` pairs. That POST fails entirely (HTTP 500) if any id is
   * unknown to the member register — common in junior and school events — so
   * on failure the pairs are re-posted in chunks of 25 (4 POSTs in parallel),
   * and the pairs of every chunk that still fails are fetched with one GET each
   * (`concurrency` at a time). Clean data costs a single request.
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
  async getPlayerInfoBatch(
    playerIds: number[],
    date?: Date,
    options?: BatchOptions
  ): Promise<BatchItemResult<PlayerInfoDto>[]>;
  async getPlayerInfoBatch(
    requests: MemberDateDto[],
    options?: BatchOptions
  ): Promise<BatchItemResult<PlayerInfoDto>[]>;
  async getPlayerInfoBatch(
    input: number[] | MemberDateDto[],
    dateOrOptions?: Date | BatchOptions,
    maybeOptions?: BatchOptions
  ): Promise<BatchItemResult<PlayerInfoDto>[]> {
    if (input.length === 0) return [];

    let requests: MemberDateDto[];
    let options: BatchOptions;
    if (typeof input[0] === 'number') {
      const date = dateOrOptions instanceof Date ? this.formatDateToString(dateOrOptions) : this.getCurrentDate();
      requests = (input as number[]).map((id) => ({ id, date }));
      options = (dateOrOptions instanceof Date ? maybeOptions : (dateOrOptions as BatchOptions | undefined)) ?? {};
    } else {
      requests = input as MemberDateDto[];
      options = (dateOrOptions as BatchOptions | undefined) ?? {};
    }

    // Each unique valid pair is fetched once; ids <= 0 (byes, walkovers) never are.
    const keyOf = (r: MemberDateDto) => `${r.id}@${r.date}`;
    const unique = new Map<string, MemberDateDto>();
    for (const r of requests) if (r.id > 0 && !unique.has(keyOf(r))) unique.set(keyOf(r), r);

    const fetched = new Map<string, BatchItemResult<PlayerInfoDto>>();
    for (const chunk of chunkArray([...unique.values()], BULK_CHUNK)) {
      await this.fetchPlayerChunk(chunk, options, fetched);
    }

    return requests.map((r) =>
      r.id > 0
        ? fetched.get(keyOf(r))!
        : { data: null, error: 'Invalid player id', status: 0 }
    );
  }

  /**
   * Bulk-fetch one chunk into `out`: one POST; on failure, retry POSTs of
   * {@link RETRY_CHUNK} pairs ({@link RETRY_PARALLEL} at a time); then one GET
   * per pair of every retry chunk that still failed, `concurrency` at a time.
   */
  private async fetchPlayerChunk(
    chunk: MemberDateDto[],
    options: BatchOptions,
    out: Map<string, BatchItemResult<PlayerInfoDto>>
  ): Promise<void> {
    const { timeoutMs, concurrency = 10 } = options;
    if (await this.postPlayerChunk(chunk, timeoutMs, out)) return;

    let failed = chunk;
    if (chunk.length > RETRY_CHUNK) {
      failed = [];
      for (const group of chunkArray(chunkArray(chunk, RETRY_CHUNK), RETRY_PARALLEL)) {
        const done = await Promise.all(group.map((sub) => this.postPlayerChunk(sub, timeoutMs, out)));
        group.forEach((sub, i) => { if (!done[i]) failed.push(...sub); });
      }
    }

    for (const batch of chunkArray(failed, concurrency)) {
      const settled = await Promise.allSettled(
        batch.map((r) => this.get<PlayerInfoDto>(`/player/${r.id}/date/${r.date}`, { timeoutMs }))
      );
      settled.forEach((s, i) => out.set(`${batch[i].id}@${batch[i].date}`, toBatchItem(s)));
    }
  }

  /**
   * One `/player/list/` POST for `chunk`. Returns true when its pairs are settled:
   * either answered (found) or, on a network failure (status 0), marked as errors —
   * single GETs would fail the same way. Returns false when the chunk should be
   * retried smaller / per pair (HTTP 500 from an unknown id, a timeout, an
   * answer that doesn't line up with the request).
   */
  private async postPlayerChunk(
    chunk: MemberDateDto[],
    timeoutMs: number | undefined,
    out: Map<string, BatchItemResult<PlayerInfoDto>>
  ): Promise<boolean> {
    const response = await this.getPlayerList(chunk, { timeoutMs });
    const answer = response.data;
    if (
      response.status === 200 &&
      Array.isArray(answer) &&
      answer.length === chunk.length &&
      answer.every((player, i) => player?.id === chunk[i].id)
    ) {
      chunk.forEach((r, i) => out.set(`${r.id}@${r.date}`, { data: answer[i], error: null, status: 200 }));
      return true;
    }
    if (response.status === 0) {
      const error = response.error || 'Network error';
      for (const r of chunk) out.set(`${r.id}@${r.date}`, { data: null, error, status: 0 });
      return true;
    }
    return false;
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
    endMonth?: string,
    options?: RequestOptions
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

      const response = await this.getPlayerList(members, options);

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
