import { GameDto, PlayerInfoDto, TournamentDto } from '../types';
export interface TournamentInfo {
    groupId: number;
    tournamentId: number;
    name: string;
    timeControl: 'standard' | 'rapid' | 'blitz' | 'unrated';
}
export interface OpponentStats {
    opponentId: number;
    opponentName: string;
    opponentRating: string;
    wins: number;
    draws: number;
    losses: number;
    totalGames: number;
    tournamentCount: number;
    tournaments: TournamentInfo[];
}
export interface GameDisplay {
    gameId: number;
    whiteId: number;
    whiteName: string;
    blackId: number;
    blackName: string;
    result: string;
    /**
     * Raw result code behind `result`. Exposed so consumers can localize the
     * label (e.g. "bye"/"adj") via `parseResultDisplay` instead of the baked-in
     * English `result` string.
     */
    resultCode: number;
    groupId: number;
    tournamentId: number;
    tournamentName: string;
    date?: string;
}
export interface ColorStats {
    wins: number;
    draws: number;
    losses: number;
}
/**
 * Calculate game result from player's perspective
 * @param game - The game data
 * @param playerId - The player ID to calculate result for
 * @returns 'win', 'draw', 'loss', or null if result code is not recognized
 *
 * Supports all point systems: DEFAULT (1/0.5/0), SCHACK4AN (3/2/1), POINT310 (3/1/0)
 */
export declare function calculatePlayerResult(game: GameDto, playerId: number): 'win' | 'draw' | 'loss' | null;
/**
 * Calculate points earned by a player for a single game
 * Uses the appropriate point system based on the result code
 *
 * @param game - The game data
 * @param playerId - The player ID to calculate points for
 * @returns Points earned, or null if result code is not recognized
 *
 * Supports all point systems: DEFAULT (1/0.5/0), SCHACK4AN (3/2/1), POINT310 (3/1/0)
 */
export declare function calculatePlayerPoints(game: GameDto, playerId: number): number | null;
/**
 * Filter games by time control
 * @param games - Array of games
 * @param tournamentMap - Map of group ID to tournament data
 * @param timeControl - Time control to filter by ('all' returns all games)
 * @returns Filtered array of games
 */
export declare function filterGamesByTimeControl(games: GameDto[], tournamentMap: Map<number, TournamentDto>, timeControl: 'all' | 'standard' | 'rapid' | 'blitz' | 'unrated'): GameDto[];
/**
 * Calculate statistics split by color (all, white, black)
 *
 * Supports all point systems: DEFAULT (1/0.5/0), SCHACK4AN (3/2/1), POINT310 (3/1/0)
 * Excludes walkovers, forfeits, and non-countable results.
 *
 * @param games - Array of games
 * @param playerId - The player ID
 * @returns Statistics object with all, white, and black breakdown
 */
export declare function calculateStatsByColor(games: GameDto[], playerId: number): {
    all: ColorStats;
    white: ColorStats;
    black: ColorStats;
};
/**
 * Aggregate games into opponent statistics
 * @param games - Array of games
 * @param playerId - The player ID
 * @param playerMap - Map of player ID to player info
 * @param tournamentMap - Map of group ID to tournament data
 * @returns Array of opponent statistics
 */
export declare function aggregateOpponentStats(games: GameDto[], playerId: number, playerMap: Map<number, PlayerInfoDto>, tournamentMap: Map<number, TournamentDto>): OpponentStats[];
/**
 * Sort opponent stats by various criteria
 * @param stats - Array of opponent statistics
 * @param sortBy - Sort criteria ('games', 'name', 'winRate')
 * @returns Sorted array of opponent statistics
 */
export declare function sortOpponentStats(stats: OpponentStats[], sortBy: 'games' | 'name' | 'winRate'): OpponentStats[];
/**
 * Format game result as string
 * Supports all point systems: DEFAULT, SCHACK4AN, POINT310
 * @param result - Game result code
 * @returns Formatted result string (e.g., "1 - 0", "½ - ½", "3 - 1")
 */
export declare function formatGameResult(result: number): string;
/**
 * Convert filtered games to display format with player names
 *
 * Displays games with countable results from all point systems.
 * Filters out walkovers, forfeits, cancelled games, and non-countable results.
 *
 * @param games - Array of games (oldest-first from API)
 * @param playerId - Current player ID
 * @param playerMap - Map of player info
 * @param tournamentMap - Map of tournament info
 * @param currentPlayerName - Current player's full name
 * @param playersLoading - Whether player data is still loading
 * @param retrievingText - Text to show while loading (e.g., "Retrieving" or "Hämtar")
 * @param unknownText - Text to show for unknown players (e.g., "Unknown" or "Okänd")
 * @param includeWalkovers - Include walkover games (rendered e.g. "1 - 0 w.o");
 *   default `false` keeps them hidden, as before. Other non-countable results
 *   (postponed, not-set, adjudicated-no-result) are always excluded regardless.
 *   Stats helpers (`calculatePlayerResult`, etc.) are unaffected — they stay
 *   countable-only.
 * @returns Array of games ready for display (latest-first order)
 */
export declare function gamesToDisplayFormat(games: GameDto[], playerId: number, playerMap: Map<number, PlayerInfoDto>, tournamentMap: Map<number, TournamentDto>, currentPlayerName: string, playersLoading?: boolean, retrievingText?: string, unknownText?: string, includeWalkovers?: boolean): GameDisplay[];
//# sourceMappingURL=opponentStats.d.ts.map