import { BaseApiService } from './base';
import type { PlayerInfoDto, ApiResponse, RequestOptions } from '../types';
import { RatingType, PlayerCategory } from '../types';

export class RatingsService extends BaseApiService {
  constructor(baseUrl?: string, timeoutMs?: number) {
    super(baseUrl, undefined, timeoutMs);
  }

  // Rating List API methods

  /**
   * Get Swedish Chess Federation rating list
   * @param ratingDate - Date for the rating list
   * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
   * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the federation rating list
   */
  async getFederationRatingList(
    ratingDate: Date,
    ratingType: RatingType,
    category: PlayerCategory,
    options?: RequestOptions
  ): Promise<ApiResponse<PlayerInfoDto[]>> {
    const formattedDate = this.formatDateToString(ratingDate);
    const endpoint = `/ratinglist/federation/date/${formattedDate}/ratingtype/${ratingType}/category/${category}`;

    return this.get<PlayerInfoDto[]>(endpoint, options);
  }

  /**
   * Get district rating list
   * @param districtId - District ID
   * @param ratingDate - Date for the rating list
   * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
   * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the district rating list
   */
  async getDistrictRatingList(
    districtId: number,
    ratingDate: Date,
    ratingType: RatingType,
    category: PlayerCategory,
    options?: RequestOptions
  ): Promise<ApiResponse<PlayerInfoDto[]>> {
    const formattedDate = this.formatDateToString(ratingDate);
    const endpoint = `/ratinglist/district/${districtId}/date/${formattedDate}/ratingtype/${ratingType}/category/${category}`;

    return this.get<PlayerInfoDto[]>(endpoint, options);
  }

  /**
   * Get club rating list
   * @param clubId - Club ID
   * @param ratingDate - Date for the rating list
   * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
   * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the club rating list
   */
  async getClubRatingList(
    clubId: number,
    ratingDate: Date,
    ratingType: RatingType,
    category: PlayerCategory,
    options?: RequestOptions
  ): Promise<ApiResponse<PlayerInfoDto[]>> {
    const formattedDate = this.formatDateToString(ratingDate);
    const endpoint = `/ratinglist/club/${clubId}/date/${formattedDate}/ratingtype/${ratingType}/category/${category}`;
    return this.get<PlayerInfoDto[]>(endpoint, options);
  }

  /**
   * Helper method to get current federation rating list with sensible defaults
   * @param ratingType - Type of rating (defaults to Standard)
   * @param category - Player category (defaults to All)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the current federation rating list
   */
  async getCurrentFederationRatingList(
    ratingType: RatingType = RatingType.STANDARD,
    category: PlayerCategory = PlayerCategory.ALL,
    options?: RequestOptions
  ): Promise<ApiResponse<PlayerInfoDto[]>> {
    const currentDate = new Date();
    return this.getFederationRatingList(currentDate, ratingType, category, options);
  }

  /**
   * Helper method to get current club rating list with sensible defaults
   * @param clubId - Club ID
   * @param ratingType - Type of rating (defaults to Standard)
   * @param category - Player category (defaults to All)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the current club rating list
   */
  async getCurrentClubRatingList(
    clubId: number,
    ratingType: RatingType = RatingType.STANDARD,
    category: PlayerCategory = PlayerCategory.ALL,
    options?: RequestOptions
  ): Promise<ApiResponse<PlayerInfoDto[]>> {
    const currentDate = new Date();
    return this.getClubRatingList(clubId, currentDate, ratingType, category, options);
  }
}
