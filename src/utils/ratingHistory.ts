import { PlayerService } from '../services/players';
import type { ApiResponse, RatingDataPoint } from '../types';

/**
 * Decimate rating data to max points while preserving first and last data points.
 * This ensures the chart remains readable even with long time ranges.
 * @param data - Array of rating data points
 * @param maxPoints - Maximum number of data points to return
 * @returns Decimated array with first and last points preserved
 */
export function decimateRatingData(
  data: RatingDataPoint[],
  maxPoints: number
): RatingDataPoint[] {
  if (data.length <= maxPoints || maxPoints < 2) return data;

  const result: RatingDataPoint[] = [data[0]]; // Always include first

  // Distribute middle points evenly
  const step = (data.length - 1) / (maxPoints - 1);
  for (let i = 1; i < maxPoints - 1; i++) {
    result.push(data[Math.round(i * step)]);
  }

  result.push(data[data.length - 1]); // Always include last
  return result;
}

/**
 * Fetches player rating history for a date range
 * @param playerId - The player's SSF ID
 * @param startMonth - Start month in YYYY-MM format (default: 12 months ago)
 * @param endMonth - End month in YYYY-MM format (default: current month)
 * @param maxPoints - Max data points to return (0 or undefined = unlimited). Preserves first/last.
 * @returns Array of rating data points sorted by date (oldest to newest)
 */
export async function getPlayerRatingHistory(
  playerId: number,
  startMonth?: string,
  endMonth?: string,
  maxPoints?: number
): Promise<ApiResponse<RatingDataPoint[]>> {
  const playerService = new PlayerService();

  try {
    const response = await playerService.getPlayerEloHistory(playerId, startMonth, endMonth);

    if (response.status !== 200 || !response.data) {
      return {
        status: response.status,
        error: response.error || 'Failed to fetch rating history'
      };
    }

    // Map PlayerRatingHistory[] to RatingDataPoint[] for chart
    const dataPoints: RatingDataPoint[] = response.data.map(history => ({
      date: formatDateForChart(history.elo.date),
      standard: history.elo.rating || undefined,
      rapid: history.elo.rapidRating || undefined,
      blitz: history.elo.blitzRating || undefined,
      lask: history.lask?.rating || undefined
    }));

    // Reverse to get oldest first (for chart display)
    // getPlayerEloHistory returns latest first, chart wants oldest first
    dataPoints.reverse();

    // Decimate if maxPoints specified and data exceeds limit
    const finalData = (maxPoints && maxPoints > 0 && dataPoints.length > maxPoints)
      ? decimateRatingData(dataPoints, maxPoints)
      : dataPoints;

    return {
      status: 200,
      data: finalData
    };
  } catch (error) {
    return {
      status: 500,
      error: error instanceof Error ? error.message : 'Failed to fetch rating history'
    };
  }
}

/**
 * Format date as YYYY-MM for chart display
 */
function formatDateForChart(dateString: string): string {
  // dateString is in format YYYY-MM-DD, extract YYYY-MM
  return dateString.substring(0, 7);
}
