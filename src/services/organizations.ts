import { BaseApiService } from './base';
import type { FederationDTO, DistrictDTO, ClubDTO, ApiResponse, RequestOptions } from '../types';

export class OrganizationService extends BaseApiService {
  constructor(baseUrl?: string, timeoutMs?: number) {
    super(baseUrl, undefined, timeoutMs);
  }

  // Organization API methods

  /**
   * Get Swedish Chess Federation information
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Federation information
   */
  async getFederation(options?: RequestOptions): Promise<ApiResponse<FederationDTO>> {
    const endpoint = '/organisation/federation';

    return this.get<FederationDTO>(endpoint, options);
  }

  /**
   * Get all districts information
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of all districts
   */
  async getDistricts(options?: RequestOptions): Promise<ApiResponse<DistrictDTO[]>> {
    const endpoint = '/organisation/districts';

    return this.get<DistrictDTO[]>(endpoint, options);
  }

  /**
   * Get clubs in a specific district
   * @param districtId - District ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of clubs in the district
   */
  async getClubsInDistrict(districtId: number, options?: RequestOptions): Promise<ApiResponse<ClubDTO[]>> {
    const endpoint = `/organisation/district/clubs/${districtId}`;

    return this.get<ClubDTO[]>(endpoint, options);
  }

  /**
   * Get specific club information
   * @param clubId - Club ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Club information
   */
  async getClub(clubId: number, options?: RequestOptions): Promise<ApiResponse<ClubDTO>> {
    const endpoint = `/organisation/club/${clubId}`;

    return this.get<ClubDTO>(endpoint, options);
  }

  /**
   * Check if a club name already exists (excluding a specific club ID)
   * @param name - Club name to check
   * @param id - Club ID to exclude from the check
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Boolean indicating if the name exists
   */
  async checkClubNameExists(name: string, id: number, options?: RequestOptions): Promise<ApiResponse<boolean>> {
    const endpoint = `/organisation/club/exists/${encodeURIComponent(name)}/${id}`;

    return this.get<boolean>(endpoint, options);
  }
}
