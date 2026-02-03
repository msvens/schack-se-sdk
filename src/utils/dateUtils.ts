/**
 * Date utilities for ELO rating lookups
 *
 * BACKGROUND:
 * The SSF (Swedish Chess Federation) API returns player ratings based on a date parameter.
 * ELO ratings are updated monthly (on the 1st of each month), so all dates within a month
 * return the same rating data.
 *
 * IMPORTANT: When requesting a FUTURE date, the API returns `elo: null` - it does NOT
 * automatically fall back to the latest available rating. This means we must handle
 * future dates ourselves by falling back to the current month.
 *
 * Example API behavior:
 * - Request date: 2026-01-15 -> Returns ELO with `elo.date: "2026-01-01"`
 * - Request date: 2026-02-01 (future) -> Returns `elo: null, elo.date: null`
 *
 * The `elo.date` field in the response is the SOURCE OF TRUTH for which month's
 * rating was actually returned.
 */

/**
 * Get the first day of a month from a timestamp (milliseconds)
 *
 * Since SSF ELO ratings update monthly, all dates within a month map to the same
 * rating. Normalizing to month-start ensures consistent cache keys.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Timestamp for the 1st of that month at 00:00:00
 *
 * @example
 * getMonthStart(new Date('2026-01-15').getTime()) // -> 2026-01-01 00:00:00
 */
export function getMonthStart(timestamp: number): number {
  const d = new Date(timestamp);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

/**
 * Convert a timestamp to a month-start string for API calls (YYYY-MM-01)
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Date string in YYYY-MM-01 format
 *
 * @example
 * getMonthStartString(new Date('2026-01-15').getTime()) // -> "2026-01-01"
 */
export function getMonthStartString(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Normalize a date for ELO lookup, falling back to current month if date is in the future.
 *
 * WHY THIS IS NEEDED:
 * When displaying tournament rounds that haven't been played yet (future dates),
 * we still want to show player ELO ratings. Since the SSF API returns null for
 * future dates, we fall back to the current month to get the latest available rating.
 *
 * The function:
 * 1. Normalizes the date to month-start (for cache consistency)
 * 2. If that month is in the future, returns current month-start instead
 *
 * @param timestamp - The round/game date as Unix timestamp (milliseconds)
 * @returns Timestamp normalized to month-start, or current month-start if future
 *
 * @example
 * // Assuming current date is January 2026
 *
 * // Past/current month - returns as-is (normalized to month start)
 * normalizeEloLookupDate(new Date('2026-01-15').getTime())
 * // -> 2026-01-01 (January, current month)
 *
 * // Future month - falls back to current month
 * normalizeEloLookupDate(new Date('2026-02-13').getTime())
 * // -> 2026-01-01 (January, NOT February)
 *
 * @see PlayerInfoDto.elo.date - The actual date of the returned rating (source of truth)
 */
export function normalizeEloLookupDate(timestamp: number): number {
  const requestedMonthStart = getMonthStart(timestamp);
  const currentMonthStart = getMonthStart(Date.now());

  // If the requested month is in the future, use current month instead
  if (requestedMonthStart > currentMonthStart) {
    return currentMonthStart;
  }

  return requestedMonthStart;
}

/**
 * Generate a cache key for player-date combination
 *
 * Uses month-start format since all dates within a month share the same ELO.
 * This ensures efficient caching without duplicate entries.
 *
 * @param playerId - The player's SSF ID
 * @param timestamp - Unix timestamp in milliseconds (will be normalized to month-start)
 * @returns Cache key in format "playerId-YYYY-MM-01"
 *
 * @example
 * getPlayerDateCacheKey(12345, new Date('2026-01-15').getTime())
 * // -> "12345-2026-01-01"
 */
export function getPlayerDateCacheKey(playerId: number, timestamp: number): string {
  const monthStart = getMonthStartString(timestamp);
  return `${playerId}-${monthStart}`;
}
