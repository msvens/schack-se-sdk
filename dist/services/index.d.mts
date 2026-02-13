import { a as ApiResponse, P as PlayerInfoDto, e as PlayerRatingHistory, F as FederationDTO, D as DistrictDTO, C as ClubDTO, k as TournamentDto, c as GroupSearchAnswerDto, l as TournamentEndResultDto, m as TournamentRoundResultDto, T as TeamTournamentEndResultDto, G as GameDto } from '../results-BROCPBpO.mjs';
import { b as RatingType, P as PlayerCategory, T as TeamRegistrationDto } from '../registration-DIaO9kYy.mjs';

declare class BaseApiService {
    protected baseUrl: string;
    protected defaultHeaders: HeadersInit;
    constructor(baseUrl?: string, defaultHeaders?: HeadersInit);
    protected request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>>;
    protected get<T>(endpoint: string): Promise<ApiResponse<T>>;
    protected post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>>;
    protected put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>>;
    protected delete<T>(endpoint: string): Promise<ApiResponse<T>>;
    protected formatDate(date: Date): string;
    protected formatDateToString(date: Date): string;
    protected getCurrentDate(): string;
}

/**
 * Options for batch processing
 */
interface BatchOptions {
    /** Number of parallel requests to execute at once (default: 10, use Infinity for unlimited) */
    concurrency?: number;
}
/**
 * Result of a single batch item
 * Either contains data or an error, never both
 */
type BatchItemResult<T> = {
    data: T;
    error: null;
} | {
    data: null;
    error: string;
};
declare class PlayerService extends BaseApiService {
    constructor(baseUrl?: string);
    /**
     * Get player information by SSF ID and date
     * @param playerId - The Swedish Chess Federation player ID (number)
     * @param date - Optional date (defaults to current date)
     *
     * @returns Player information
     */
    getPlayerInfo(playerId: number, date?: Date): Promise<ApiResponse<PlayerInfoDto>>;
    /**
     * Get player information by FIDE ID and date
     * @param fideId - The FIDE player ID (number)
     * @param date - Optional date (defaults to current date)
     * @returns Player information
     */
    getPlayerByFIDEId(fideId: number, date?: Date): Promise<ApiResponse<PlayerInfoDto>>;
    /**
     * Search for players by first name and last name
     * @param fornamn - The first name (Swedish: fornamn)
     * @param efternamn - The last name (Swedish: efternamn)
     * @returns Array of matching players
     */
    searchPlayer(fornamn: string, efternamn: string): Promise<ApiResponse<PlayerInfoDto[]>>;
    /**
     * Fetch player information for multiple player IDs in batches
     *
     * @param playerIds - Array of player IDs to fetch (duplicates allowed, order preserved)
     * @param date - Optional date filter (defaults to current date)
     * @param options - Batch processing options
     * @returns Array of results matching input order - each item contains either data or error
     *
     * @remarks
     * - **Preserves input order** - results[i] corresponds to playerIds[i]
     * - **Allows duplicates** - each ID is fetched separately (caller controls deduplication)
     * - Processes requests in batches to avoid overwhelming the API
     * - Use concurrency: Infinity for maximum parallelism
     *
     * @example
     * ```typescript
     * const results = await playerService.getPlayerInfoBatch([1, 2, 2, 3]);
     * results.forEach((result, i) => {
     *   if (result.data) {
     *     console.log(`Player ${playerIds[i]}:`, result.data);
     *   } else {
     *     console.error(`Player ${playerIds[i]} failed:`, result.error);
     *   }
     * });
     * ```
     */
    getPlayerInfoBatch(playerIds: number[], date?: Date, options?: BatchOptions): Promise<BatchItemResult<PlayerInfoDto>[]>;
    /**
     * Fetch player rating history for a date range
     *
     * @param playerId - The Swedish Chess Federation player ID
     * @param startMonth - Start month in YYYY-MM format (default: 12 months ago)
     * @param endMonth - End month in YYYY-MM format (default: current month)
     * @returns Array of rating history sorted by date (latest first)
     *
     * @remarks
     * - Fetches player ratings for each month in the range
     * - Processes in batches of 12 months for efficiency
     * - **Smart stopping**: Stops when encountering a month with no ratings (all rating fields are null/0)
     * - Also stops if API call fails (player doesn't exist at that date)
     * - Returns only months where the player has rating data
     *
     * @example
     * ```typescript
     * // Get last 12 months of rating history
     * const history = await playerService.getPlayerEloHistory(12345);
     *
     * // Get specific range
     * const history = await playerService.getPlayerEloHistory(12345, '2024-01', '2025-06');
     * ```
     */
    getPlayerEloHistory(playerId: number, startMonth?: string, endMonth?: string): Promise<ApiResponse<PlayerRatingHistory[]>>;
}

declare class OrganizationService extends BaseApiService {
    constructor(baseUrl?: string);
    /**
     * Get Swedish Chess Federation information
     * @returns Federation information
     */
    getFederation(): Promise<ApiResponse<FederationDTO>>;
    /**
     * Get all districts information
     * @returns Array of all districts
     */
    getDistricts(): Promise<ApiResponse<DistrictDTO[]>>;
    /**
     * Get clubs in a specific district
     * @param districtId - District ID
     * @returns Array of clubs in the district
     */
    getClubsInDistrict(districtId: number): Promise<ApiResponse<ClubDTO[]>>;
    /**
     * Get specific club information
     * @param clubId - Club ID
     * @returns Club information
     */
    getClub(clubId: number): Promise<ApiResponse<ClubDTO>>;
    /**
     * Check if a club name already exists (excluding a specific club ID)
     * @param name - Club name to check
     * @param id - Club ID to exclude from the check
     * @returns Boolean indicating if the name exists
     */
    checkClubNameExists(name: string, id: number): Promise<ApiResponse<boolean>>;
}

declare class TournamentService extends BaseApiService {
    constructor(baseUrl?: string);
    /**
     * Get detailed tournament information by tournament ID
     * @param tournamentId - Tournament ID
     * @returns Comprehensive tournament information including classes and groups
     */
    getTournament(tournamentId: number): Promise<ApiResponse<TournamentDto>>;
    /**
     * Get tournament information by group ID
     * @param groupId - Tournament group ID
     * @returns Tournament information for the tournament containing this group
     */
    getTournamentFromGroup(groupId: number): Promise<ApiResponse<TournamentDto>>;
    /**
     * Get tournament information by class/division ID
     * @param classId - Tournament class ID
     * @returns Tournament information for the tournament containing this class
     */
    getTournamentFromClass(classId: number): Promise<ApiResponse<TournamentDto>>;
    /**
     * Search for tournament groups by name or location
     * @param searchWord - Search term for tournament/group name or location
     * @returns Array of matching tournament groups with basic information
     */
    searchGroups(searchWord: string): Promise<ApiResponse<GroupSearchAnswerDto[]>>;
    /**
     * Get upcoming tournaments
     * @param districtId - Optional district ID to filter by district and club tournaments
     * @returns Array of upcoming tournaments
     */
    searchComingTournaments(districtId?: number): Promise<ApiResponse<TournamentDto[]>>;
    /**
     * Search for tournaments with results updated within a date range
     * Returns complete tournament objects (not just groups).
     * @param startDate - Start date in ISO format (YYYY-MM-DDTHH:mm:ss)
     * @param endDate - End date in ISO format (YYYY-MM-DDTHH:mm:ss)
     * @param districtId - Optional district ID to filter by district and club tournaments
     * @returns Array of tournaments with results updated within the date range
     * @example
     * // Find tournaments with updated results in December 2024
     * searchUpdatedTournamentsByTournament('2024-12-01T00:00:00', '2024-12-31T23:59:59')
     */
    searchUpdatedTournaments(startDate: string, endDate: string, districtId?: number): Promise<ApiResponse<TournamentDto[]>>;
    /**
     * Search for tournament groups with results updated within a date range
     * @deprecated Use searchUpdatedTournamentsByTournament() instead - returns full TournamentDto[] instead of group summaries
     * @param startDate - Start date in ISO format (YYYY-MM-DDTHH:mm:ss)
     * @param endDate - End date in ISO format (YYYY-MM-DDTHH:mm:ss)
     * @param districtId - Optional district ID to filter by district and club tournaments
     * @returns Array of tournament groups that started within the date range
     * @example
     * // Find tournaments that started in December 2024 (may still be running)
     * searchUpdatedTournaments('2024-12-01T00:00:00', '2024-12-31T23:59:59')
     */
    searchUpdatedGroups(startDate: string, endDate: string, districtId?: number): Promise<ApiResponse<GroupSearchAnswerDto[]>>;
    /**
     * Fetch tournament information for multiple tournament IDs in batches
     *
     * @param tournamentIds - Array of tournament IDs to fetch (duplicates allowed, order preserved)
     * @param options - Batch processing options
     * @returns Array of results matching input order - each item contains either data or error
     *
     * @remarks
     * - **Preserves input order** - results[i] corresponds to tournamentIds[i]
     * - **Allows duplicates** - each ID is fetched separately (caller controls deduplication)
     * - Processes requests in batches to avoid overwhelming the API
     * - Use concurrency: Infinity for maximum parallelism
     *
     * @example
     * ```typescript
     * const results = await tournamentService.getTournamentBatch([1, 2, 2, 3]);
     * results.forEach((result, i) => {
     *   if (result.data) {
     *     console.log(`Tournament ${tournamentIds[i]}:`, result.data);
     *   } else {
     *     console.error(`Tournament ${tournamentIds[i]} failed:`, result.error);
     *   }
     * });
     * ```
     */
    getTournamentBatch(tournamentIds: number[], options?: BatchOptions): Promise<BatchItemResult<TournamentDto>[]>;
    /**
     * Fetch tournament information for multiple group IDs in batches
     * Note: This fetches the tournament that contains each group
     *
     * @param groupIds - Array of group IDs to fetch tournaments for (duplicates allowed, order preserved)
     * @param options - Batch processing options
     * @returns Array of results matching input order - each item contains either data or error
     *
     * @remarks
     * - **Preserves input order** - results[i] corresponds to groupIds[i]
     * - **Allows duplicates** - each ID is fetched separately (caller controls deduplication)
     * - Processes requests in batches to avoid overwhelming the API
     * - Use concurrency: Infinity for maximum parallelism
     *
     * @example
     * ```typescript
     * const results = await tournamentService.getTournamentFromGroupBatch([1, 2, 2, 3]);
     * results.forEach((result, i) => {
     *   if (result.data) {
     *     console.log(`Group ${groupIds[i]} tournament:`, result.data);
     *   } else {
     *     console.error(`Group ${groupIds[i]} failed:`, result.error);
     *   }
     * });
     * ```
     */
    getTournamentFromGroupBatch(groupIds: number[], options?: BatchOptions): Promise<BatchItemResult<TournamentDto>[]>;
}

declare class ResultsService extends BaseApiService {
    constructor(baseUrl?: string);
    /**
     * Get individual tournament results by group ID
     * @param groupId - Tournament group ID (e.g., 15816)
     * @returns Tournament results with player standings
     */
    getTournamentResults(groupId: number): Promise<ApiResponse<TournamentEndResultDto[]>>;
    /**
     * Get tournament round results by group ID
     * @param groupId - Tournament group ID (e.g., 15816)
     * @returns Tournament round results with individual games
     */
    getTournamentRoundResults(groupId: number): Promise<ApiResponse<TournamentRoundResultDto[]>>;
    /**
     * Get team tournament results by group ID
     * @param groupId - Tournament group ID
     * @returns Team tournament results with club standings
     */
    getTeamTournamentResults(groupId: number): Promise<ApiResponse<TeamTournamentEndResultDto[]>>;
    /**
     * Get team tournament round results by group ID
     * @param groupId - Tournament group ID
     * @returns Team tournament round results
     */
    getTeamRoundResults(groupId: number): Promise<ApiResponse<TournamentRoundResultDto[]>>;
    /**
     * Get individual tournament results for a specific member
     * @param memberId - Member ID
     * @returns Array of tournament results for the member
     */
    getMemberTournamentResults(memberId: number): Promise<ApiResponse<TournamentEndResultDto[]>>;
    /**
     * Get team tournament round results for a specific member
     * @param groupId - Tournament group ID
     * @param memberId - Member ID
     * @returns Team tournament round results for the specific member
     */
    getTeamMemberRoundResults(groupId: number, memberId: number): Promise<ApiResponse<TournamentRoundResultDto[]>>;
    /**
     * Get all games played by a member
     * Returns all games (individual and team tournaments) for the specified member.
     * Useful for player profiles showing complete game history.
     * @param memberId - Member ID
     * @returns Array of all games played by the member
     */
    getMemberGames(memberId: number): Promise<ApiResponse<GameDto[]>>;
}

declare class RatingsService extends BaseApiService {
    constructor(baseUrl?: string);
    /**
     * Get Swedish Chess Federation rating list
     * @param ratingDate - Date for the rating list
     * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
     * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
     * @returns Array of players in the federation rating list
     */
    getFederationRatingList(ratingDate: Date, ratingType: RatingType, category: PlayerCategory): Promise<ApiResponse<PlayerInfoDto[]>>;
    /**
     * Get district rating list
     * @param districtId - District ID
     * @param ratingDate - Date for the rating list
     * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
     * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
     * @returns Array of players in the district rating list
     */
    getDistrictRatingList(districtId: number, ratingDate: Date, ratingType: RatingType, category: PlayerCategory): Promise<ApiResponse<PlayerInfoDto[]>>;
    /**
     * Get club rating list
     * @param clubId - Club ID
     * @param ratingDate - Date for the rating list
     * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
     * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
     * @returns Array of players in the club rating list
     */
    getClubRatingList(clubId: number, ratingDate: Date, ratingType: RatingType, category: PlayerCategory): Promise<ApiResponse<PlayerInfoDto[]>>;
    /**
     * Helper method to get current federation rating list with sensible defaults
     * @param ratingType - Type of rating (defaults to Standard)
     * @param category - Player category (defaults to All)
     * @returns Array of players in the current federation rating list
     */
    getCurrentFederationRatingList(ratingType?: RatingType, category?: PlayerCategory): Promise<ApiResponse<PlayerInfoDto[]>>;
    /**
     * Helper method to get current club rating list with sensible defaults
     * @param clubId - Club ID
     * @param ratingType - Type of rating (defaults to Standard)
     * @param category - Player category (defaults to All)
     * @returns Array of players in the current club rating list
     */
    getCurrentClubRatingList(clubId: number, ratingType?: RatingType, category?: PlayerCategory): Promise<ApiResponse<PlayerInfoDto[]>>;
}

declare class RegistrationService extends BaseApiService {
    constructor(baseUrl?: string);
    /**
     * Get registered players for a tournament team from a specific club
     * @param tournamentId - Tournament ID
     * @param clubId - Club ID
     * @returns Team registration information with list of registered players
     */
    getTeamRegistration(tournamentId: number, clubId: number): Promise<ApiResponse<TeamRegistrationDto>>;
}

export { BaseApiService, type BatchItemResult, type BatchOptions, OrganizationService, PlayerService, RatingsService, RegistrationService, ResultsService, TournamentService };
