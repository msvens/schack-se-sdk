/**
 * Utility functions for batch API operations
 */

/**
 * Deduplicate an array of IDs
 * Used by batch operations to avoid redundant API calls
 *
 * @param ids - Array of IDs (may contain duplicates)
 * @returns Array of unique IDs
 *
 * @example
 * ```typescript
 * deduplicateIds([1, 2, 2, 3, 3, 3]); // Returns: [1, 2, 3]
 * ```
 */
export function deduplicateIds(ids: number[]): number[] {
  return Array.from(new Set(ids));
}

/**
 * Split an array into chunks of specified size
 * Used by batch operations to control concurrency
 *
 * @param array - Array to split into chunks
 * @param chunkSize - Maximum size of each chunk
 * @returns Array of chunks
 *
 * @example
 * ```typescript
 * chunkArray([1, 2, 3, 4, 5], 2); // Returns: [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
