import { BaseApiService } from './base';
import type { FederationDTO, DistrictDTO, ClubDTO, ApiResponse, RequestOptions } from '../types';
export declare class OrganizationService extends BaseApiService {
    constructor(baseUrl?: string, timeoutMs?: number);
    /**
     * Get Swedish Chess Federation information
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Federation information
     */
    getFederation(options?: RequestOptions): Promise<ApiResponse<FederationDTO>>;
    /**
     * Get all districts information
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Array of all districts
     */
    getDistricts(options?: RequestOptions): Promise<ApiResponse<DistrictDTO[]>>;
    /**
     * Get clubs in a specific district
     * @param districtId - District ID
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Array of clubs in the district
     */
    getClubsInDistrict(districtId: number, options?: RequestOptions): Promise<ApiResponse<ClubDTO[]>>;
    /**
     * Get specific club information
     * @param clubId - Club ID
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Club information
     */
    getClub(clubId: number, options?: RequestOptions): Promise<ApiResponse<ClubDTO>>;
    /**
     * Check if a club name already exists (excluding a specific club ID)
     * @param name - Club name to check
     * @param id - Club ID to exclude from the check
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Boolean indicating if the name exists
     */
    checkClubNameExists(name: string, id: number, options?: RequestOptions): Promise<ApiResponse<boolean>>;
}
//# sourceMappingURL=organizations.d.ts.map