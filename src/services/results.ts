import { BaseApiService } from './base';
import { isTeamPairing, PairingSystem } from '../types';
import type { TournamentEndResultDto, TournamentRoundResultDto, TeamTournamentEndResultDto, GameDto, ApiResponse } from '../types';
import { computeRoundStandings, type RoundStandings, type StandingsMode, type QualityMetric } from '../utils/roundStandings';
import { findTournamentGroup } from '../utils/tournamentGroupUtils';
import { TournamentService } from './tournaments';

export class ResultsService extends BaseApiService {
  constructor(baseUrl?: string) {
    super(baseUrl);
  }

  // Tournament Results API methods

  /**
   * Get individual tournament results by group ID.
   *
   * Note: the upstream endpoint is server-side cached for ~10 seconds.
   * Polling faster than that returns stale data; back off accordingly.
   *
   * @param groupId - Tournament group ID (e.g., 15816)
   * @returns Tournament results with player standings
   */
  async getTournamentResults(groupId: number): Promise<ApiResponse<TournamentEndResultDto[]>> {
    const endpoint = `/tournamentresults/table/id/${groupId}`;

    return this.get<TournamentEndResultDto[]>(endpoint);
  }

  /**
   * Get tournament round results by group ID.
   *
   * Note: the upstream endpoint is server-side cached for ~10 seconds.
   * Polling faster than that returns stale data; back off accordingly.
   *
   * @param groupId - Tournament group ID (e.g., 15816)
   * @returns Tournament round results with individual games
   */
  async getTournamentRoundResults(groupId: number): Promise<ApiResponse<TournamentRoundResultDto[]>> {
    const endpoint = `/tournamentresults/roundresults/id/${groupId}`;

    return this.get<TournamentRoundResultDto[]>(endpoint);
  }

  /**
   * Replay tournament standings round-by-round — a best-effort "playback" of how
   * the table evolved. Give it a group ID and nothing else: it detects whether
   * the event is team or individual, picks the right round-results endpoint, and
   * (for individual events) the right secondary metric — all from the tournament
   * data. The caller never specifies any of that.
   *
   * Cumulative points reproduce the official primary column exactly; this is an
   * *estimated* view of intermediate rounds. For the official final table use
   * `getTournamentResults` / `getTeamTournamentResults`.
   *
   * Detection: `isTeamPairing(tournament.type)` chooses team vs individual; for
   * individual events the group's `pairingSystemMember` chooses the secondary —
   * Sonneborn-Berger for Berger/round-robin (Buchholz is FIDE-invalid there),
   * Buchholz otherwise. Team standings (match points → board points) match the
   * official table exactly; individual quality points are indicative — the
   * official per-group tie-break variant is not reproduced (see `TiebreakSystem`).
   *
   * @param groupId - Tournament group ID
   * @returns One standings snapshot per round, ordered by round ascending
   */
  async getRoundStandings(groupId: number): Promise<ApiResponse<RoundStandings[]>>;
  /**
   * Replay standings for a single round.
   *
   * @param groupId - Tournament group ID
   * @param round - Round number to return the snapshot for
   * @returns The standings snapshot after `round`, or a 404 error if that round
   *   has no results
   */
  async getRoundStandings(groupId: number, round: number): Promise<ApiResponse<RoundStandings>>;
  async getRoundStandings(
    groupId: number,
    round?: number
  ): Promise<ApiResponse<RoundStandings | RoundStandings[]>> {
    // Derive everything from the tournament: one lookup yields the type
    // (team vs individual) and the group's pairing system (Buchholz vs SB).
    let mode: StandingsMode = 'individual';
    let qualityMetric: QualityMetric = 'buchholz';
    const tournament = await new TournamentService(this.baseUrl).getTournamentFromGroup(groupId);
    if (tournament.data) {
      mode = isTeamPairing(tournament.data.type) ? 'team' : 'individual';
      if (mode === 'individual') {
        const group = findTournamentGroup(tournament.data, groupId);
        if (group?.group.pairingSystemMember === PairingSystem.BERGER) {
          qualityMetric = 'sonneborn-berger';
        }
      }
    }
    // Detection failure is best-effort: fall through to individual/Buchholz.

    const roundResults = mode === 'team'
      ? await this.getTeamRoundResults(groupId)
      : await this.getTournamentRoundResults(groupId);
    if (roundResults.error || !roundResults.data) {
      return {
        error: roundResults.error ?? 'No round results',
        status: roundResults.status,
        message: 'Error'
      };
    }

    const snapshots = computeRoundStandings(roundResults.data, { mode, qualityMetric });

    if (round === undefined) {
      return { data: snapshots, status: roundResults.status, message: 'Success' };
    }

    const snapshot = snapshots.find((s) => s.round === round);
    if (!snapshot) {
      return {
        error: `No results for round ${round} in group ${groupId}`,
        status: 404,
        message: 'Error'
      };
    }
    return { data: snapshot, status: roundResults.status, message: 'Success' };
  }

  /**
   * Get team tournament results by group ID
   * @param groupId - Tournament group ID
   * @returns Team tournament results with club standings
   */
  async getTeamTournamentResults(groupId: number): Promise<ApiResponse<TeamTournamentEndResultDto[]>> {
    const endpoint = `/tournamentresults/team/table/id/${groupId}`;

    return this.get<TeamTournamentEndResultDto[]>(endpoint);
  }

  /**
   * Get team tournament round results by group ID
   * @param groupId - Tournament group ID
   * @returns Team tournament round results
   */
  async getTeamRoundResults(groupId: number): Promise<ApiResponse<TournamentRoundResultDto[]>> {
    const endpoint = `/tournamentresults/team/roundresults/id/${groupId}`;

    return this.get<TournamentRoundResultDto[]>(endpoint);
  }

  /**
   * Get individual tournament results for a specific member
   * @param memberId - Member ID
   * @returns Array of tournament results for the member
   */
  async getMemberTournamentResults(memberId: number): Promise<ApiResponse<TournamentEndResultDto[]>> {
    const endpoint = `/tournamentresults/table/memberid/${memberId}`;

    return this.get<TournamentEndResultDto[]>(endpoint);
  }

  /**
   * Get team tournament round results for a specific member
   * @param groupId - Tournament group ID
   * @param memberId - Member ID
   * @returns Team tournament round results for the specific member
   */
  async getTeamMemberRoundResults(groupId: number, memberId: number): Promise<ApiResponse<TournamentRoundResultDto[]>> {
    const endpoint = `/tournamentresults/team/roundresults/id/${groupId}/memberid/${memberId}`;

    return this.get<TournamentRoundResultDto[]>(endpoint);
  }

  /**
   * Get all games played by a member
   * Returns all games (individual and team tournaments) for the specified member.
   * Useful for player profiles showing complete game history.
   * @param memberId - Member ID
   * @returns Array of all games played by the member
   */
  async getMemberGames(memberId: number): Promise<ApiResponse<GameDto[]>> {
    const endpoint = `/tournamentresults/game/memberid/${memberId}`;

    return this.get<GameDto[]>(endpoint);
  }
}
