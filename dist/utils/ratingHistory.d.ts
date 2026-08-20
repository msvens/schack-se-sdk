import type { ApiResponse, RatingDataPoint } from '../types';
/**
 * Decimate rating data to max points while preserving first and last data points.
 * This ensures the chart remains readable even with long time ranges.
 * @param data - Array of rating data points
 * @param maxPoints - Maximum number of data points to return
 * @returns Decimated array with first and last points preserved
 */
export declare function decimateRatingData(data: RatingDataPoint[], maxPoints: number): RatingDataPoint[];
/**
 * Fetches player rating history for a date range
 * @param playerId - The player's SSF ID
 * @param startMonth - Start month in YYYY-MM format (default: 12 months ago)
 * @param endMonth - End month in YYYY-MM format (default: current month)
 * @param maxPoints - Max data points to return (0 or undefined = unlimited). Preserves first/last.
 * @returns Array of rating data points sorted by date (oldest to newest)
 */
export declare function getPlayerRatingHistory(playerId: number, startMonth?: string, endMonth?: string, maxPoints?: number): Promise<ApiResponse<RatingDataPoint[]>>;
//# sourceMappingURL=ratingHistory.d.ts.map