import { BaseApiService } from './base';
import type { FederationDTO, DistrictDTO, ClubDTO, ApiResponse } from '../types';

export class OrganizationService extends BaseApiService {
  constructor(baseUrl?: string) {
    super(baseUrl);
  }

  // Organization API methods

  /**
   * Get Swedish Chess Federation information
   * @returns Federation information
   */
  async getFederation(): Promise<ApiResponse<FederationDTO>> {
    const endpoint = '/organisation/federation';

    return this.get<FederationDTO>(endpoint);
  }

  /**
   * Get all districts information
   * @returns Array of all districts
   */
  async getDistricts(): Promise<ApiResponse<DistrictDTO[]>> {
    const endpoint = '/organisation/districts';

    return this.get<DistrictDTO[]>(endpoint);
  }

  /**
   * Get clubs in a specific district
   * @param districtId - District ID
   * @returns Array of clubs in the district
   */
  async getClubsInDistrict(districtId: number): Promise<ApiResponse<ClubDTO[]>> {
    const endpoint = `/organisation/district/clubs/${districtId}`;

    return this.get<ClubDTO[]>(endpoint);
  }

  /**
   * Get specific club information
   * @param clubId - Club ID
   * @returns Club information
   */
  async getClub(clubId: number): Promise<ApiResponse<ClubDTO>> {
    const endpoint = `/organisation/club/${clubId}`;

    return this.get<ClubDTO>(endpoint);
  }

  /**
   * Check if a club name already exists (excluding a specific club ID)
   * @param name - Club name to check
   * @param id - Club ID to exclude from the check
   * @returns Boolean indicating if the name exists
   */
  async checkClubNameExists(name: string, id: number): Promise<ApiResponse<boolean>> {
    const endpoint = `/organisation/club/exists/${encodeURIComponent(name)}/${id}`;

    return this.get<boolean>(endpoint);
  }
}
