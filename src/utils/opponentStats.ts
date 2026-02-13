import { GameDto, PlayerInfoDto, TournamentDto } from '../types';
import { getPrimaryRatingType, formatPlayerRating, formatPlayerName } from './ratingUtils';
import { findTournamentGroup } from './tournamentGroupUtils';
import {
  getPlayerOutcome,
  getPlayerPoints,
  isCountableResult,
  getResultDisplayString,
  isWalkoverResultCode
} from './gameResults';

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
  result: string;  // "1-0", "½-½", "0-1"
  groupId: number;
  tournamentId: number;
  tournamentName: string;
  date?: string;  // Optional for future use
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
export function calculatePlayerResult(
  game: GameDto,
  playerId: number
): 'win' | 'draw' | 'loss' | null {
  const isWhite = game.whiteId === playerId;
  return getPlayerOutcome(game.result, isWhite);
}

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
export function calculatePlayerPoints(
  game: GameDto,
  playerId: number
): number | null {
  const isWhite = game.whiteId === playerId;
  return getPlayerPoints(game.result, isWhite);
}

/**
 * Get the rating type for a group from the tournament map.
 * Uses the group's rankingAlgorithm to determine the type.
 */
function getGroupRatingType(
  groupId: number,
  tournamentMap: Map<number, TournamentDto>
): 'standard' | 'rapid' | 'blitz' | 'unrated' {
  const tournament = tournamentMap.get(groupId);
  if (!tournament) return 'standard';
  const groupResult = findTournamentGroup(tournament, groupId);
  if (!groupResult) return 'standard';
  const ratingType = getPrimaryRatingType(groupResult.group.rankingAlgorithm);
  if (!ratingType) return 'unrated';
  // LASK was the Swedish national rating for standard games
  if (ratingType === 'lask') return 'standard';
  return ratingType;
}

/**
 * Filter games by time control
 * @param games - Array of games
 * @param tournamentMap - Map of group ID to tournament data
 * @param timeControl - Time control to filter by ('all' returns all games)
 * @returns Filtered array of games
 */
export function filterGamesByTimeControl(
  games: GameDto[],
  tournamentMap: Map<number, TournamentDto>,
  timeControl: 'all' | 'standard' | 'rapid' | 'blitz' | 'unrated'
): GameDto[] {
  if (timeControl === 'all') {
    return games;
  }

  return games.filter(game => {
    return getGroupRatingType(game.groupiD, tournamentMap) === timeControl;
  });
}

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
export function calculateStatsByColor(
  games: GameDto[],
  playerId: number
): {
  all: ColorStats;
  white: ColorStats;
  black: ColorStats;
} {
  const all: ColorStats = { wins: 0, draws: 0, losses: 0 };
  const white: ColorStats = { wins: 0, draws: 0, losses: 0 };
  const black: ColorStats = { wins: 0, draws: 0, losses: 0 };

  games.forEach(game => {
    const result = calculatePlayerResult(game, playerId);

    // Skip unrecognized results (walkovers, forfeits, etc.)
    if (result === null) return;

    const isWhite = game.whiteId === playerId;

    // Update all stats
    if (result === 'win') all.wins++;
    else if (result === 'draw') all.draws++;
    else all.losses++;

    // Update color-specific stats
    if (isWhite) {
      if (result === 'win') white.wins++;
      else if (result === 'draw') white.draws++;
      else white.losses++;
    } else {
      if (result === 'win') black.wins++;
      else if (result === 'draw') black.draws++;
      else black.losses++;
    }
  });

  return { all, white, black };
}

/**
 * Aggregate games into opponent statistics
 * @param games - Array of games
 * @param playerId - The player ID
 * @param playerMap - Map of player ID to player info
 * @param tournamentMap - Map of group ID to tournament data
 * @returns Array of opponent statistics
 */
export function aggregateOpponentStats(
  games: GameDto[],
  playerId: number,
  playerMap: Map<number, PlayerInfoDto>,
  tournamentMap: Map<number, TournamentDto>
): OpponentStats[] {
  // Group games by opponent
  const opponentRecords = new Map<number, {
    wins: number;
    draws: number;
    losses: number;
    groupIds: Set<number>;
  }>();

  games.forEach(game => {
    // Determine opponent ID (skip W.O games with opponent ID -1)
    const opponentId = game.whiteId === playerId ? game.blackId : game.whiteId;
    if (opponentId === -1) return;  // Skip W.O games

    const result = calculatePlayerResult(game, playerId);

    // Skip unrecognized results (walkovers, forfeits, etc.)
    if (result === null) return;

    const record = opponentRecords.get(opponentId) || {
      wins: 0,
      draws: 0,
      losses: 0,
      groupIds: new Set<number>()
    };

    // Increment W/D/L
    if (result === 'win') record.wins++;
    else if (result === 'draw') record.draws++;
    else record.losses++;

    // Add tournament (Set deduplicates)
    record.groupIds.add(game.groupiD);

    opponentRecords.set(opponentId, record);
  });

  // Build OpponentStats array
  const stats: OpponentStats[] = [];

  opponentRecords.forEach((record, opponentId) => {
    const opponent = playerMap.get(opponentId);
    const opponentName = opponent
      ? formatPlayerName(opponent.firstName, opponent.lastName, opponent.elo?.title)
      : `Unknown Player (${opponentId})`;

    const opponentRating = opponent && opponent.elo
      ? formatPlayerRating(opponent.elo, null)
      : '-';

    // Build tournament list
    const tournaments: TournamentInfo[] = Array.from(record.groupIds).map(groupId => {
      const tournament = tournamentMap.get(groupId);
      return {
        groupId,
        tournamentId: tournament?.id || 0,
        name: tournament?.name || `Group ${groupId}`,
        timeControl: getGroupRatingType(groupId, tournamentMap)
      };
    });

    stats.push({
      opponentId,
      opponentName,
      opponentRating,
      wins: record.wins,
      draws: record.draws,
      losses: record.losses,
      totalGames: record.wins + record.draws + record.losses,
      tournamentCount: record.groupIds.size,
      tournaments
    });
  });

  return stats;
}

/**
 * Sort opponent stats by various criteria
 * @param stats - Array of opponent statistics
 * @param sortBy - Sort criteria ('games', 'name', 'winRate')
 * @returns Sorted array of opponent statistics
 */
export function sortOpponentStats(
  stats: OpponentStats[],
  sortBy: 'games' | 'name' | 'winRate'
): OpponentStats[] {
  const sorted = [...stats];

  switch (sortBy) {
    case 'games':
      sorted.sort((a, b) => b.totalGames - a.totalGames);
      break;
    case 'name':
      sorted.sort((a, b) => a.opponentName.localeCompare(b.opponentName));
      break;
    case 'winRate':
      sorted.sort((a, b) => {
        const aRate = a.totalGames > 0 ? a.wins / a.totalGames : 0;
        const bRate = b.totalGames > 0 ? b.wins / b.totalGames : 0;
        return bRate - aRate;
      });
      break;
  }

  return sorted;
}

/**
 * Format game result as string
 * Supports all point systems: DEFAULT, SCHACK4AN, POINT310
 * @param result - Game result code
 * @returns Formatted result string (e.g., "1 - 0", "½ - ½", "3 - 1")
 */
export function formatGameResult(result: number): string {
  return getResultDisplayString(result);
}

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
 * @returns Array of games ready for display (latest-first order)
 */
export function gamesToDisplayFormat(
  games: GameDto[],
  playerId: number,
  playerMap: Map<number, PlayerInfoDto>,
  tournamentMap: Map<number, TournamentDto>,
  currentPlayerName: string,
  playersLoading: boolean = false,
  retrievingText: string = 'Retrieving',
  unknownText: string = 'Unknown'
): GameDisplay[] {
  const displayGames: GameDisplay[] = [];

  games.forEach(game => {
    // Skip non-countable results and walkovers (show only real played games)
    if (!isCountableResult(game.result) || isWalkoverResultCode(game.result)) return;

    // Skip W.O games with missing players (negative IDs indicate walkover)
    if (game.whiteId < 0 || game.blackId < 0) return;

    // Get player names
    const whitePlayer = game.whiteId === playerId
      ? null
      : playerMap.get(game.whiteId);
    const blackPlayer = game.blackId === playerId
      ? null
      : playerMap.get(game.blackId);

    const whiteName = game.whiteId === playerId
      ? currentPlayerName
      : whitePlayer
        ? formatPlayerName(whitePlayer.firstName, whitePlayer.lastName, whitePlayer.elo?.title)
        : playersLoading
          ? `${retrievingText} (${game.whiteId})`
          : `${unknownText} (${game.whiteId})`;

    const blackName = game.blackId === playerId
      ? currentPlayerName
      : blackPlayer
        ? formatPlayerName(blackPlayer.firstName, blackPlayer.lastName, blackPlayer.elo?.title)
        : playersLoading
          ? `${retrievingText} (${game.blackId})`
          : `${unknownText} (${game.blackId})`;

    // Get tournament info
    const tournament = tournamentMap.get(game.groupiD);

    displayGames.push({
      gameId: game.id,
      whiteId: game.whiteId,
      whiteName,
      blackId: game.blackId,
      blackName,
      result: formatGameResult(game.result),
      groupId: game.groupiD,
      tournamentId: tournament?.id || 0,
      tournamentName: tournament?.name || `Group ${game.groupiD}`
    });
  });

  // Reverse to show latest games first (API returns oldest-first)
  return displayGames.reverse();
}
