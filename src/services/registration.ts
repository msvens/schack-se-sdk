import { BaseApiService } from './base';
import type { TeamRegistrationDto, ApiResponse } from '../types';

export class RegistrationService extends BaseApiService {
  constructor(baseUrl?: string) {
    super(baseUrl);
  }

  // Tournament Team Registration API method

  /**
   * Get registered players for a tournament team from a specific club
   * @param tournamentId - Tournament ID
   * @param clubId - Club ID
   * @returns Team registration information with list of registered players
   */
  async getTeamRegistration(tournamentId: number, clubId: number): Promise<ApiResponse<TeamRegistrationDto>> {
    const endpoint = `/tournamentteamregistration/tournament/${tournamentId}/club/${clubId}`;

    return this.get<TeamRegistrationDto>(endpoint);
  }
}
