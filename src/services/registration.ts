import { BaseApiService } from './base';
import type { TeamRegistrationDto, ApiResponse, RequestOptions } from '../types';

export class RegistrationService extends BaseApiService {
  constructor(baseUrl?: string, timeoutMs?: number) {
    super(baseUrl, undefined, timeoutMs);
  }

  // Tournament Team Registration API method

  /**
   * Get registered players for a tournament team from a specific club
   * @param tournamentId - Tournament ID
   * @param clubId - Club ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Team registration information with list of registered players
   */
  async getTeamRegistration(tournamentId: number, clubId: number, options?: RequestOptions): Promise<ApiResponse<TeamRegistrationDto>> {
    const endpoint = `/tournamentteamregistration/tournament/${tournamentId}/club/${clubId}`;

    return this.get<TeamRegistrationDto>(endpoint, options);
  }
}
