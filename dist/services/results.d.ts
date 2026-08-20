import { BaseApiService } from './base';
import type { TournamentEndResultDto, TournamentRoundResultDto, TeamTournamentEndResultDto, GameDto, ApiResponse, RequestOptions } from '../types';
import { type RoundStandings } from '../utils/roundStandings';
export declare class ResultsService extends BaseApiService {
    constructor(baseUrl?: string, timeoutMs?: number);
    /**
     * Get individual tournament results by group ID.
     *
     * Note: the upstream endpoint is server-side cached for ~10 seconds.
     * Polling faster than that returns stale data; back off accordingly.
     *
     * @param groupId - Tournament group ID (e.g., 15816)
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Tournament results with player standings
     */
    getTournamentResults(groupId: number, options?: RequestOptions): Promise<ApiResponse<TournamentEndResultDto[]>>;
    /**
     * Get tournament round results by group ID.
     *
     * Note: the upstream endpoint is server-side cached for ~10 seconds.
     * Polling faster than that returns stale data; back off accordingly.
     *
     * @param groupId - Tournament group ID (e.g., 15816)
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Tournament round results with individual games
     */
    getTournamentRoundResults(groupId: number, options?: RequestOptions): Promise<ApiResponse<TournamentRoundResultDto[]>>;
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
     * Returns every round's snapshot; for a single round just
     * `result.data?.find(s => s.round === n)`.
     *
     * @param groupId - Tournament group ID
     * @param options - Per-request options (e.g. timeoutMs), applied to every
     *   underlying request this method makes.
     * @returns One standings snapshot per round, ordered by round ascending
     */
    getRoundStandings(groupId: number, options?: RequestOptions): Promise<ApiResponse<RoundStandings[]>>;
    /**
     * Check our reconstructed final-round ordering against the official standings
     * table and, when it matches, mark estimated snapshots as `'verified'`. Pure
     * upgrade: never downgrades (a missing official row or table is ignored).
     */
    private verifyAgainstOfficial;
    /**
     * Get team tournament results by group ID
     * @param groupId - Tournament group ID
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Team tournament results with club standings
     */
    getTeamTournamentResults(groupId: number, options?: RequestOptions): Promise<ApiResponse<TeamTournamentEndResultDto[]>>;
    /**
     * Get team tournament round results by group ID
     * @param groupId - Tournament group ID
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Team tournament round results
     */
    getTeamRoundResults(groupId: number, options?: RequestOptions): Promise<ApiResponse<TournamentRoundResultDto[]>>;
    /**
     * Get individual tournament results for a specific member
     * @param memberId - Member ID
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Array of tournament results for the member
     */
    getMemberTournamentResults(memberId: number, options?: RequestOptions): Promise<ApiResponse<TournamentEndResultDto[]>>;
    /**
     * Get team tournament round results for a specific member
     * @param groupId - Tournament group ID
     * @param memberId - Member ID
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Team tournament round results for the specific member
     */
    getTeamMemberRoundResults(groupId: number, memberId: number, options?: RequestOptions): Promise<ApiResponse<TournamentRoundResultDto[]>>;
    /**
     * Get all games played by a member
     * Returns all games (individual and team tournaments) for the specified member.
     * Useful for player profiles showing complete game history.
     * @param memberId - Member ID
     * @param options - Per-request options (e.g. timeoutMs)
     * @returns Array of all games played by the member
     */
    getMemberGames(memberId: number, options?: RequestOptions): Promise<ApiResponse<GameDto[]>>;
}
//# sourceMappingURL=results.d.ts.map