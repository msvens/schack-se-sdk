import { BaseApiService } from './base';
import type { TeamRegistrationDto, ApiResponse, RequestOptions } from '../types';
export declare class RegistrationService extends BaseApiService {
    constructor(baseUrl?: string, timeoutMs?: number);
    /**
     * Get registered players for a tournament team from a specific club
     * @param tournamentId - Tournament ID
     * @param clubId - Club ID
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Team registration information with list of registered players
     */
    getTeamRegistration(tournamentId: number, clubId: number, options?: RequestOptions): Promise<ApiResponse<TeamRegistrationDto>>;
}
//# sourceMappingURL=registration.d.ts.map