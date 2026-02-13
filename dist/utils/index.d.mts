import { R as RatingDataPoint, a as ApiResponse, l as TournamentEndResultDto, k as TournamentDto, M as MemberFIDERatingDTO, j as TournamentClassGroupDto, i as TournamentClassDto, G as GameDto, P as PlayerInfoDto } from '../results-BROCPBpO.mjs';

/**
 * Decimate rating data to max points while preserving first and last data points.
 * This ensures the chart remains readable even with long time ranges.
 * @param data - Array of rating data points
 * @param maxPoints - Maximum number of data points to return
 * @returns Decimated array with first and last points preserved
 */
declare function decimateRatingData(data: RatingDataPoint[], maxPoints: number): RatingDataPoint[];
/**
 * Fetches player rating history for a date range
 * @param playerId - The player's SSF ID
 * @param startMonth - Start month in YYYY-MM format (default: 12 months ago)
 * @param endMonth - End month in YYYY-MM format (default: current month)
 * @param maxPoints - Max data points to return (0 or undefined = unlimited). Preserves first/last.
 * @returns Array of rating data points sorted by date (oldest to newest)
 */
declare function getPlayerRatingHistory(playerId: number, startMonth?: string, endMonth?: string, maxPoints?: number): Promise<ApiResponse<RatingDataPoint[]>>;

/**
 * Utility functions for sorting tournament and player data
 */

/**
 * Sort TournamentEndResultDto array by placement (best first)
 * @param results - Array of tournament end results
 * @returns Sorted array with best placements first
 */
declare function sortTournamentEndResultsByPlace(results: TournamentEndResultDto[]): TournamentEndResultDto[];
/**
 * Sort TournamentDto array by end date (latest first)
 * @param tournaments - Array of tournaments
 * @returns Sorted array with most recent tournaments first
 */
declare function sortTournamentsByDate(tournaments: TournamentDto[]): TournamentDto[];

/**
 * Utility functions for handling chess ratings based on tournament types
 */

/**
 * Round rating type constants (from RoundDto.rated field)
 * These map to the API values for per-round rating types
 */
declare const RoundRatedType: {
    readonly UNRATED: 0;
    readonly STANDARD: 1;
    readonly RAPID: 2;
    readonly BLITZ: 3;
};
type RoundRatedTypeValue = typeof RoundRatedType[keyof typeof RoundRatedType];
/**
 * Parse thinkingTime string to determine tournament time control type
 *
 * Examples:
 * - "10 min + 5 sek/drag" -> Rapid (10 min)
 * - "3 min + 2 sek/drag" -> Blitz (3 min)
 * - "90+15 min +30 sek/drag" -> Standard (105 min)
 *
 * FIDE time control rules:
 * - Blitz: < 10 minutes
 * - Rapid: 10-60 minutes
 * - Standard: > 60 minutes or unspecified
 */
declare function parseTimeControl(thinkingTime: string | null | undefined): 'standard' | 'rapid' | 'blitz';
/**
 * Type of rating used
 */
type RatingType = 'standard' | 'rapid' | 'blitz' | 'lask';
/**
 * Result of getting a player's rating for a tournament
 */
interface PlayerRating {
    /** The rating value, or null if no rating available */
    rating: number | null;
    /** Whether this is a fallback to standard rating (marked with *) */
    isFallback: boolean;
    /** The type of rating that was used */
    ratingType: RatingType | null;
}
/**
 * Get the appropriate FIDE rating for a player based on tournament time control
 *
 * Logic:
 * - Standard tournament: Show standard rating, or null if not available
 * - Rapid tournament: Show rapid rating, or standard rating (marked as fallback), or null
 * - Blitz tournament: Show blitz rating, or standard rating (marked as fallback), or null
 *
 * @param elo - Player's FIDE rating information
 * @param thinkingTime - Tournament thinkingTime string (e.g., "10 min + 5 sek/drag")
 * @returns Object with rating value and fallback flag
 *
 * @example
 * ```ts
 * const { rating, isFallback } = getPlayerRatingForTournament(player.elo, "10 min + 5 sek/drag");
 * const displayRating = rating ? `${rating}${isFallback ? '*' : ''}` : '-';
 * ```
 */
declare function getPlayerRatingForTournament(elo: MemberFIDERatingDTO | null | undefined, thinkingTime: string | null | undefined): PlayerRating;
/**
 * Format a player's rating for display based on tournament time control
 *
 * @param elo - Player's FIDE rating information
 * @param thinkingTime - Tournament thinkingTime string (e.g., "10 min + 5 sek/drag")
 * @returns Formatted rating string (e.g., "2100", "1950 S", "-")
 *
 * @example
 * ```ts
 * const displayRating = formatPlayerRating(player.elo, "10 min + 5 sek/drag");
 * // Returns: "1416" (rapid rating for rapid tournament)
 * // or "1950 S" (standard rating as fallback if no rapid rating)
 * // or "-" (no rating available)
 * ```
 */
declare function formatPlayerRating(elo: MemberFIDERatingDTO | null | undefined, thinkingTime: string | null | undefined): string;
/**
 * Format a player's rating with language-sensitive suffix based on rating type
 *
 * Always shows rating type suffix for clarity:
 * - Standard: no suffix
 * - Rapid: " S" (Swedish - Snabb) / " R" (English - Rapid)
 * - Blitz: " B" (both languages - Blixt/Blitz)
 * - LASK: " L" (both languages)
 *
 * @param rating - The rating value
 * @param ratingType - The type of rating ('standard' | 'rapid' | 'blitz' | 'lask')
 * @param language - Language for suffix ('sv' | 'en')
 * @returns Formatted rating string with appropriate suffix
 *
 * @example
 * ```ts
 * formatRatingWithType(1638, 'rapid', 'sv') // "1638 S"
 * formatRatingWithType(1638, 'rapid', 'en') // "1638 R"
 * formatRatingWithType(1638, 'standard', 'sv') // "1638"
 * formatRatingWithType(1638, 'blitz', 'en') // "1638 B"
 * ```
 */
declare function formatRatingWithType(rating: number | null, ratingType: RatingType | null, language?: 'sv' | 'en'): string;
/**
 * Check if a player qualifies as a junior for K-factor purposes
 * FIDE rule: K=40 until the end of the year of their 18th birthday
 *
 * This means if you turn 18 in 2025, K=40 applies through all of 2025.
 * Only in 2026 would you lose the junior K-factor bonus.
 *
 * @param birthdate - Player's birth date string
 * @param gameDate - Date of the game (used to determine the year)
 * @returns true if the player is a junior (turning 18 or younger in the game year)
 */
declare function isJuniorPlayer(birthdate: string | null | undefined, gameDate?: Date | number): boolean;
/**
 * Get the appropriate K-factor for ELO calculations based on rating type
 *
 * FIDE K-factor rules (same for standard, rapid, and blitz):
 * - K=40 for new players (<30 games) - we can't detect this without game count
 * - K=40 for juniors (under 18 by end of year) with rating <2300
 * - K=20 as long as rating remains under 2400
 * - K=10 once published rating has reached 2400
 *
 * IMPORTANT: The stored K-factor (playerElo.k) is for STANDARD games only.
 * For rapid/blitz, we must calculate K based on the rapid/blitz rating being used,
 * not the stored standard K-factor.
 *
 * @param ratingType - The type of rating being used
 * @param playerRating - The player's rating value (should be the rating for this game type)
 * @param playerElo - Optional player ELO data (contains k-factor for standard games)
 * @param birthdate - Optional player birth date for junior K-factor calculation
 * @param gameDate - Optional game date for junior calculation (defaults to current date)
 * @returns K-factor to use for calculations
 */
declare function getKFactorForRating(ratingType: RatingType | null, playerRating: number | null, playerElo?: MemberFIDERatingDTO | null, birthdate?: string | null, gameDate?: Date | number): number;
/**
 * Get the appropriate rating for a player based on the tournament's ranking algorithm
 *
 * This uses the group-level rankingAlgorithm field which explicitly specifies
 * which rating system to use and in what priority order.
 *
 * @param elo - Player's FIDE rating information
 * @param rankingAlgorithm - The ranking algorithm from TournamentClassGroupDto
 * @returns Object with rating value and fallback flag
 */
declare function getPlayerRatingByAlgorithm(elo: MemberFIDERatingDTO | null | undefined, rankingAlgorithm: number | null | undefined): PlayerRating;
/**
 * Convert round.rated value to RatingType
 * Returns null for unrated rounds (no ELO calculation should happen)
 *
 * @param rated - The RoundDto.rated field value (0/1/2/3)
 * @returns The corresponding RatingType, or null for unrated rounds
 */
declare function getRatingTypeFromRoundRated(rated: number | undefined): RatingType | null;
/**
 * Get player rating for a specific round's rating type
 * Uses round.rated to determine which rating to use
 *
 * Unlike getPlayerRatingByAlgorithm, this function uses strict rating matching:
 * - If a round is Rapid but player has no Rapid rating, returns null (no fallback)
 * - This ensures accurate ELO calculations for tournaments with mixed round types
 *
 * @param elo - Player's FIDE rating information
 * @param roundRatedType - The RoundDto.rated field value (0/1/2/3)
 * @returns Object with rating value and rating type
 */
declare function getPlayerRatingByRoundType(elo: MemberFIDERatingDTO | null | undefined, roundRatedType: number | undefined): PlayerRating;
/**
 * Get the primary rating type for a ranking algorithm (no fallback chain).
 * E.g. RAPID_STANDARD_BLITZ_ELO → 'rapid', BLITZ_ELO → 'blitz'.
 */
declare function getPrimaryRatingType(rankingAlgorithm: number | null | undefined): RatingType | null;
/**
 * Strict rating lookup — returns only the primary rating type for the algorithm.
 * If the player doesn't have that rating, returns null (no fallback).
 * Use for display contexts like H2H where fallback would be misleading.
 */
declare function getPlayerRatingStrict(elo: MemberFIDERatingDTO | null | undefined, rankingAlgorithm: number | null | undefined): PlayerRating;
/**
 * Format a player's name with their FIDE title if they have one
 *
 * @param firstName - Player's first name
 * @param lastName - Player's last name
 * @param title - Player's FIDE title (e.g., "GM", "IM", "FM", "WGM", "WIM", "WFM", "CM", "WCM")
 * @returns Formatted name string (e.g., "GM Magnus Carlsen" or "Magnus Carlsen")
 *
 * @example
 * ```ts
 * formatPlayerName("Magnus", "Carlsen", "GM")  // "GM Magnus Carlsen"
 * formatPlayerName("Anna", "Svensson", "")     // "Anna Svensson"
 * formatPlayerName("Erik", "Lindberg")         // "Erik Lindberg"
 * ```
 */
declare function formatPlayerName(firstName: string, lastName: string, title?: string | null): string;

/**
 * ELO rating calculation utilities based on FIDE formulas
 *
 * These are approximations used for display purposes only.
 * Official ratings are calculated by FIDE monthly.
 */
/**
 * Maximum rating difference used in expected score calculation.
 * FIDE's "400-point rule": rating differences greater than 400 are treated as exactly 400.
 * This caps expected scores between 8% and 92%.
 *
 * Note: FIDE dropped this rule for players 2650+ in October 2025, but it still applies
 * to most players and is used by SSF.
 */
declare const RATING_DIFFERENCE_CAP = 400;
/**
 * Calculate expected score for a player against an opponent
 *
 * Implements FIDE's 400-point rule: rating differences greater than 400
 * are treated as exactly 400 for calculation purposes. This ensures
 * expected scores are capped between 8% and 92%.
 *
 * @param playerRating - Player's current rating
 * @param opponentRating - Opponent's current rating
 * @returns Expected score (0.0 to 1.0, capped at 0.08-0.92 due to 400-point rule)
 *
 * Formula: E = 1 / (1 + 10^((OpponentRating - PlayerRating) / 400))
 * With rating difference capped at +/-400
 */
declare function calculateExpectedScore(playerRating: number, opponentRating: number): number;
/**
 * Calculate rating change for a single game
 *
 * @param playerRating - Player's current rating
 * @param opponentRating - Opponent's current rating
 * @param actualScore - Actual game result (1.0 = win, 0.5 = draw, 0.0 = loss)
 * @param kFactor - K-factor for rating calculation (typically 40 for juniors, 20 for adults, 10 for 2400+)
 * @returns Rating change (can be positive or negative)
 *
 * Formula: dR = K x (ActualScore - ExpectedScore)
 */
declare function calculateRatingChange(playerRating: number, opponentRating: number, actualScore: number, kFactor: number): number;
/**
 * Calculate performance rating for a tournament
 *
 * Uses the inverse ELO formula to calculate performance rating.
 *
 * @param opponentRatings - Array of opponent ratings
 * @param score - Total score (wins + 0.5 x draws)
 * @returns Performance rating
 *
 * Formula: Performance = Average opponent rating + d
 * where d = -400 x log10((1/p) - 1) and p is the score percentage
 *
 * Special cases:
 * - 100% score: Use average opponent rating + 800
 * - 0% score: Use average opponent rating - 800
 */
declare function calculatePerformanceRating(opponentRatings: number[], score: number): number;
/**
 * Calculate total rating change and performance rating for a tournament
 *
 * @param matches - Array of match results
 * @returns Object containing total rating change and performance rating
 */
interface MatchResult {
    opponentRating: number | null;
    actualScore: number;
}
interface TournamentRatingStats {
    totalChange: number;
    performanceRating: number;
    gamesWithRatedOpponents: number;
}
declare function calculateTournamentStats(matches: MatchResult[], playerRating: number, kFactor: number): TournamentRatingStats;

/**
 * Utility functions for formatting tournament results
 */
/**
 * Check if a player ID represents a walkover (missing player)
 * Negative IDs indicate walkovers: -1 is standard, but other negative values
 * like -200 are also used in some tournaments
 */
declare function isWalkoverPlayer(playerId: number): boolean;
/**
 * Check if a club/organization ID represents a walkover (missing team)
 * Negative IDs like -100 indicate walkovers
 */
declare function isWalkoverClub(clubId: number): boolean;
/**
 * Check if a game result indicates a walkover
 * Supports all point systems: DEFAULT, SCHACK4AN, POINT310
 * @param result Game result value
 * @returns true if result indicates W.O (walkover)
 */
declare function isWalkoverResult(result: number): boolean;
/**
 * Check if a match has walkover conditions
 * @param homeId Home player/team ID
 * @param awayId Away player/team ID
 * @param result Game result (optional, for team tournaments)
 * @returns true if either player is missing or result indicates W.O
 */
declare function isWalkover(homeId: number, awayId: number, result?: number): boolean;
/**
 * Format a game result from white's perspective
 * Supports all point systems: DEFAULT, SCHACK4AN, POINT310
 * Used in team tournaments where games have result field
 *
 * @param result Game result code
 * @param whiteId White player ID (optional, to check for W.O)
 * @param blackId Black player ID (optional, to check for W.O)
 * @returns Formatted result string
 */
declare function formatGameResult(result: number, whiteId?: number, blackId?: number): string;
/**
 * Format a match result from home team's perspective
 * Used in individual tournaments where results have homeResult/awayResult
 * @param homeResult Home player/team result
 * @param awayResult Away player/team result
 * @param homeId Home player/team ID (optional, to check for W.O)
 * @param awayId Away player/team ID (optional, to check for W.O)
 * @returns Formatted result string
 */
declare function formatMatchResult(homeResult: number | undefined, awayResult: number | undefined, homeId?: number, awayId?: number): string;

/**
 * Utility functions for working with tournament groups
 */

/**
 * Result of finding a group within tournament class hierarchy
 */
interface TournamentGroupResult {
    group: TournamentClassGroupDto;
    parentClass: TournamentClassDto;
    /** Whether the tournament has multiple classes that should be distinguished */
    hasMultipleClasses: boolean;
}
/**
 * Get tournament group metadata by its ID
 * @param tournament Tournament data containing class hierarchy
 * @param groupId Group ID to find
 * @returns Group, parent class, and whether it's a root class, or null if not found
 */
declare function findTournamentGroup(tournament: TournamentDto, groupId: number): TournamentGroupResult | null;
/**
 * Get the name of a tournament group by its ID
 * @param tournament Tournament data containing class hierarchy
 * @param groupId Group ID to find
 * @returns Group name if found, empty string otherwise
 */
declare function getGroupName(tournament: TournamentDto, groupId: number): string;

/**
 * Utility functions for formatting team names in team tournaments
 */
/**
 * Convert a number to Roman numerals
 * Supports numbers 1-20 which covers typical team counts
 */
declare function toRomanNumeral(num: number): string;
/**
 * Count how many teams each club has in the results
 * @param results - Array of objects with contenderId and teamNumber
 * @returns Map of contenderId to count of teams
 */
declare function countTeamsByClub<T extends {
    contenderId: number;
    teamNumber: number;
}>(results: T[]): Map<number, number>;
/**
 * Format a team name with Roman numeral suffix if the club has multiple teams
 * @param clubName - The base club name
 * @param teamNumber - The team number (1, 2, 3, etc.)
 * @param clubTeamCount - How many teams this club has in the tournament
 * @returns Formatted team name (e.g., "SK Rockaden" or "SK Rockaden II")
 */
declare function formatTeamName(clubName: string, teamNumber: number, clubTeamCount: number): string;
/**
 * Create a team name formatter function based on results data
 * This pre-computes which clubs have multiple teams for efficient lookups
 *
 * @param results - Array of results with contenderId and teamNumber
 * @param getClubName - Function to get club name from ID
 * @returns A function that formats team names appropriately
 */
declare function createTeamNameFormatter<T extends {
    contenderId: number;
    teamNumber: number;
}>(results: T[], getClubName: (clubId: number) => string): (clubId: number, teamNumber: number) => string;
/**
 * Count how many teams each club has in round results
 * Round results have homeId/awayId and homeTeamNumber/awayTeamNumber
 * @param roundResults - Array of round result objects
 * @returns Map of clubId to count of teams
 */
declare function countTeamsFromRoundResults<T extends {
    homeId: number;
    awayId: number;
    homeTeamNumber: number;
    awayTeamNumber: number;
}>(roundResults: T[]): Map<number, number>;
/**
 * Create a team name formatter function based on round results data
 * For use with TeamRoundResults component
 *
 * @param roundResults - Array of round results with homeId/awayId and team numbers
 * @param getClubName - Function to get club name from ID
 * @returns A function that formats team names appropriately
 */
declare function createRoundResultsTeamNameFormatter<T extends {
    homeId: number;
    awayId: number;
    homeTeamNumber: number;
    awayTeamNumber: number;
}>(roundResults: T[], getClubName: (clubId: number) => string): (clubId: number, teamNumber: number) => string;

/**
 * Game result handling for different point systems
 *
 * Point Systems:
 * - DEFAULT (-1): Standard 1/0.5/0 (Win=1, Draw=0.5, Loss=0)
 * - SCHACK4AN (1): Schackfyran 3/2/1 (Win=3, Draw=2, Loss=1)
 * - POINT310 (2): 3-1-0 system (Win=3, Draw=1, Loss=0)
 */
declare const PointSystem: {
    readonly DEFAULT: -1;
    readonly SCHACK4AN: 1;
    readonly POINT310: 2;
};
type PointSystemType = typeof PointSystem[keyof typeof PointSystem];
declare const PointValues: {
    readonly [-1]: {
        readonly win: 1;
        readonly draw: 0.5;
        readonly loss: 0;
    };
    readonly 1: {
        readonly win: 3;
        readonly draw: 2;
        readonly loss: 1;
    };
    readonly 2: {
        readonly win: 3;
        readonly draw: 1;
        readonly loss: 0;
    };
};
/**
 * Result codes from the API
 * Positive values generally favor white, negative favor black
 */
declare const ResultCode: {
    readonly NOT_SET: -100;
    readonly POSTPONED: 100;
    readonly WHITE_WIN: 1;
    readonly WHITE_WIN_WO: 2;
    readonly WHITE_TOURIST_WO: 29;
    readonly BLACK_WIN: -1;
    readonly BLACK_WIN_WO: -2;
    readonly NO_WIN_WO: -3;
    readonly DRAW: 0;
    readonly BOTH_NO_RESULT: -10;
    readonly BOTH_WIN: 15;
    readonly SCHACK4AN_WHITE_WIN: 3;
    readonly SCHACK4AN_WHITE_WIN_WO: 5;
    readonly SCHACK4AN_WHITE_TOURIST_WO: 31;
    readonly SCHACK4AN_BLACK_WIN: -4;
    readonly SCHACK4AN_BLACK_WIN_WO: -5;
    readonly SCHACK4AN_DRAW: 10;
    readonly SCHACK4AN_BOTH_NO_RESULT: -20;
    readonly SCHACK4AN_BOTH_WIN: 20;
    readonly POINT310_WHITE_WIN: 26;
    readonly POINT310_WHITE_WIN_WO: 25;
    readonly POINT310_WHITE_TOURIST_WO: 30;
    readonly POINT310_BLACK_WIN: -26;
    readonly POINT310_BLACK_WIN_WO: -25;
    readonly POINT310_DRAW: 27;
    readonly POINT310_BOTH_NO_RESULT: -27;
    readonly POINT310_BOTH_WIN: 28;
};
type ResultCodeType = typeof ResultCode[keyof typeof ResultCode];
declare const ResultDisplay: {
    readonly WHITE_WIN: "1 - 0";
    readonly WHITE_WIN_WO: "1 - 0 w.o";
    readonly WHITE_TOURIST_WO: "½ bye";
    readonly BLACK_WIN: "0 - 1";
    readonly BLACK_WIN_WO: "0 - 1 w.o";
    readonly NO_WIN_WO: "0 - 0 w.o";
    readonly DRAW: "½ - ½";
    readonly NO_RESULT: "  -  ";
    readonly BOTH_NO_RESULT: "0 - 0 adj";
    readonly BOTH_WIN: "1 - 1 adj";
    readonly POSTPONED: "postponed";
    readonly SCHACK4AN_WHITE_WIN: "3 - 1";
    readonly SCHACK4AN_WHITE_WIN_WO: "3 - 0 w.o";
    readonly SCHACK4AN_WHITE_TOURIST_WO: "2 bye";
    readonly SCHACK4AN_BLACK_WIN: "1 - 3";
    readonly SCHACK4AN_BLACK_WIN_WO: "0 - 3 w.o";
    readonly SCHACK4AN_DRAW: "2 - 2";
    readonly SCHACK4AN_BOTH_NO_RESULT: "1 - 1 adj";
    readonly SCHACK4AN_BOTH_WIN: "3 - 3 adj";
    readonly POINT310_WHITE_WIN: "3 - 0";
    readonly POINT310_WHITE_WIN_WO: "3 - 0 w.o";
    readonly POINT310_WHITE_TOURIST_WO: "1 bye";
    readonly POINT310_BLACK_WIN: "0 - 3";
    readonly POINT310_BLACK_WIN_WO: "0 - 3 w.o";
    readonly POINT310_DRAW: "1 - 1";
    readonly POINT310_BOTH_NO_RESULT: "0 - 0 adj";
    readonly POINT310_BOTH_WIN: "3 - 3 adj";
};
type GameOutcome = 'white_win' | 'black_win' | 'draw' | 'no_result' | 'special';
interface ParsedGameResult {
    /** The outcome of the game */
    outcome: GameOutcome;
    /** Points for white player */
    whitePoints: number;
    /** Points for black player */
    blackPoints: number;
    /** Whether this was a walkover/forfeit */
    isWalkover: boolean;
    /** Whether this is a tourist bye (half point) */
    isTouristBye: boolean;
    /** Whether the result is valid/countable for statistics */
    isCountable: boolean;
    /** Display string for the result */
    displayString: string;
}
/**
 * Determine which point system a result code belongs to
 */
declare function getPointSystemFromResult(resultCode: number): PointSystemType;
/**
 * Check if a result code indicates white won
 */
declare function isWhiteWin(resultCode: number): boolean;
/**
 * Check if a result code indicates black won
 */
declare function isBlackWin(resultCode: number): boolean;
/**
 * Check if a result code indicates a draw
 */
declare function isDraw(resultCode: number): boolean;
/**
 * Check if a result code indicates a walkover/forfeit
 */
declare function isWalkoverResultCode(resultCode: number): boolean;
/**
 * Check if a result code indicates a tourist bye
 */
declare function isTouristBye(resultCode: number): boolean;
/**
 * Check if a result should be counted in statistics
 */
declare function isCountableResult(resultCode: number): boolean;
/**
 * Get the game outcome from a result code
 */
declare function getGameOutcome(resultCode: number): GameOutcome;
/**
 * Calculate points for a result code
 * Returns [whitePoints, blackPoints]
 */
declare function calculatePoints(resultCode: number): [number, number];
/**
 * Get the display string for a result code
 */
declare function getResultDisplayString(resultCode: number): string;
/**
 * Parse a result code into a structured result object
 */
declare function parseGameResult(resultCode: number): ParsedGameResult;
/**
 * Calculate player result from their perspective
 * @param resultCode - The game result code
 * @param isWhite - Whether the player was white
 * @returns 'win', 'draw', 'loss', or null if not countable
 */
declare function getPlayerOutcome(resultCode: number, isWhite: boolean): 'win' | 'draw' | 'loss' | null;
/**
 * Calculate player points from their perspective
 * @param resultCode - The game result code
 * @param isWhite - Whether the player was white
 * @returns Points earned, or null if not countable
 */
declare function getPlayerPoints(resultCode: number, isWhite: boolean): number | null;
/**
 * Get the point system name for display
 */
declare function getPointSystemName(pointSystem: PointSystemType): string;

/**
 * Date utilities for ELO rating lookups
 *
 * BACKGROUND:
 * The SSF (Swedish Chess Federation) API returns player ratings based on a date parameter.
 * ELO ratings are updated monthly (on the 1st of each month), so all dates within a month
 * return the same rating data.
 *
 * IMPORTANT: When requesting a FUTURE date, the API returns `elo: null` - it does NOT
 * automatically fall back to the latest available rating. This means we must handle
 * future dates ourselves by falling back to the current month.
 *
 * Example API behavior:
 * - Request date: 2026-01-15 -> Returns ELO with `elo.date: "2026-01-01"`
 * - Request date: 2026-02-01 (future) -> Returns `elo: null, elo.date: null`
 *
 * The `elo.date` field in the response is the SOURCE OF TRUTH for which month's
 * rating was actually returned.
 */
/**
 * Get the first day of a month from a timestamp (milliseconds)
 *
 * Since SSF ELO ratings update monthly, all dates within a month map to the same
 * rating. Normalizing to month-start ensures consistent cache keys.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Timestamp for the 1st of that month at 00:00:00
 *
 * @example
 * getMonthStart(new Date('2026-01-15').getTime()) // -> 2026-01-01 00:00:00
 */
declare function getMonthStart(timestamp: number): number;
/**
 * Convert a timestamp to a month-start string for API calls (YYYY-MM-01)
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Date string in YYYY-MM-01 format
 *
 * @example
 * getMonthStartString(new Date('2026-01-15').getTime()) // -> "2026-01-01"
 */
declare function getMonthStartString(timestamp: number): string;
/**
 * Normalize a date for ELO lookup, falling back to current month if date is in the future.
 *
 * WHY THIS IS NEEDED:
 * When displaying tournament rounds that haven't been played yet (future dates),
 * we still want to show player ELO ratings. Since the SSF API returns null for
 * future dates, we fall back to the current month to get the latest available rating.
 *
 * The function:
 * 1. Normalizes the date to month-start (for cache consistency)
 * 2. If that month is in the future, returns current month-start instead
 *
 * @param timestamp - The round/game date as Unix timestamp (milliseconds)
 * @returns Timestamp normalized to month-start, or current month-start if future
 *
 * @example
 * // Assuming current date is January 2026
 *
 * // Past/current month - returns as-is (normalized to month start)
 * normalizeEloLookupDate(new Date('2026-01-15').getTime())
 * // -> 2026-01-01 (January, current month)
 *
 * // Future month - falls back to current month
 * normalizeEloLookupDate(new Date('2026-02-13').getTime())
 * // -> 2026-01-01 (January, NOT February)
 *
 * @see PlayerInfoDto.elo.date - The actual date of the returned rating (source of truth)
 */
declare function normalizeEloLookupDate(timestamp: number): number;
/**
 * Generate a cache key for player-date combination
 *
 * Uses month-start format since all dates within a month share the same ELO.
 * This ensures efficient caching without duplicate entries.
 *
 * @param playerId - The player's SSF ID
 * @param timestamp - Unix timestamp in milliseconds (will be normalized to month-start)
 * @returns Cache key in format "playerId-YYYY-MM-01"
 *
 * @example
 * getPlayerDateCacheKey(12345, new Date('2026-01-15').getTime())
 * // -> "12345-2026-01-01"
 */
declare function getPlayerDateCacheKey(playerId: number, timestamp: number): string;
/**
 * Parse a YYYY-MM-DD date string as local midnight.
 *
 * IMPORTANT: Do NOT use `new Date("2026-03-02")` for date-only strings —
 * that creates UTC midnight, causing timezone issues when compared with
 * `new Date()` (local time). This function avoids that by using the
 * component-based Date constructor which creates local midnight.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object at local midnight
 *
 * @example
 * // In CET (UTC+1):
 * new Date("2026-03-02")      // → 2026-03-02T00:00:00Z (UTC midnight)
 * parseLocalDate("2026-03-02") // → 2026-03-02T00:00:00+01:00 (local midnight)
 */
declare function parseLocalDate(dateStr: string): Date;

/**
 * Utility functions for batch API operations
 */
/**
 * Deduplicate an array of IDs
 * Used by batch operations to avoid redundant API calls
 *
 * @param ids - Array of IDs (may contain duplicates)
 * @returns Array of unique IDs
 *
 * @example
 * ```typescript
 * deduplicateIds([1, 2, 2, 3, 3, 3]); // Returns: [1, 2, 3]
 * ```
 */
declare function deduplicateIds(ids: number[]): number[];
/**
 * Split an array into chunks of specified size
 * Used by batch operations to control concurrency
 *
 * @param array - Array to split into chunks
 * @param chunkSize - Maximum size of each chunk
 * @returns Array of chunks
 *
 * @example
 * ```typescript
 * chunkArray([1, 2, 3, 4, 5], 2); // Returns: [[1, 2], [3, 4], [5]]
 * ```
 */
declare function chunkArray<T>(array: T[], chunkSize: number): T[][];

interface TournamentInfo {
    groupId: number;
    tournamentId: number;
    name: string;
    timeControl: 'standard' | 'rapid' | 'blitz' | 'unrated';
}
interface OpponentStats {
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
interface GameDisplay {
    gameId: number;
    whiteId: number;
    whiteName: string;
    blackId: number;
    blackName: string;
    result: string;
    groupId: number;
    tournamentId: number;
    tournamentName: string;
    date?: string;
}
interface ColorStats {
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
declare function calculatePlayerResult(game: GameDto, playerId: number): 'win' | 'draw' | 'loss' | null;
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
declare function calculatePlayerPoints(game: GameDto, playerId: number): number | null;
/**
 * Filter games by time control
 * @param games - Array of games
 * @param tournamentMap - Map of group ID to tournament data
 * @param timeControl - Time control to filter by ('all' returns all games)
 * @returns Filtered array of games
 */
declare function filterGamesByTimeControl(games: GameDto[], tournamentMap: Map<number, TournamentDto>, timeControl: 'all' | 'standard' | 'rapid' | 'blitz' | 'unrated'): GameDto[];
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
declare function calculateStatsByColor(games: GameDto[], playerId: number): {
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
declare function aggregateOpponentStats(games: GameDto[], playerId: number, playerMap: Map<number, PlayerInfoDto>, tournamentMap: Map<number, TournamentDto>): OpponentStats[];
/**
 * Sort opponent stats by various criteria
 * @param stats - Array of opponent statistics
 * @param sortBy - Sort criteria ('games', 'name', 'winRate')
 * @returns Sorted array of opponent statistics
 */
declare function sortOpponentStats(stats: OpponentStats[], sortBy: 'games' | 'name' | 'winRate'): OpponentStats[];
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
declare function gamesToDisplayFormat(games: GameDto[], playerId: number, playerMap: Map<number, PlayerInfoDto>, tournamentMap: Map<number, TournamentDto>, currentPlayerName: string, playersLoading?: boolean, retrievingText?: string, unknownText?: string): GameDisplay[];

export { type ColorStats, type GameDisplay, type GameOutcome, type MatchResult, type OpponentStats, type ParsedGameResult, type PlayerRating, PointSystem, type PointSystemType, PointValues, RATING_DIFFERENCE_CAP, type RatingType, ResultCode, type ResultCodeType, ResultDisplay, RoundRatedType, type RoundRatedTypeValue, type TournamentGroupResult, type TournamentInfo, type TournamentRatingStats, aggregateOpponentStats, calculateExpectedScore, calculatePerformanceRating, calculatePlayerPoints, calculatePlayerResult, calculatePoints, calculateRatingChange, calculateStatsByColor, calculateTournamentStats, chunkArray, countTeamsByClub, countTeamsFromRoundResults, createRoundResultsTeamNameFormatter, createTeamNameFormatter, decimateRatingData, deduplicateIds, filterGamesByTimeControl, findTournamentGroup, formatGameResult, formatMatchResult, formatPlayerName, formatPlayerRating, formatRatingWithType, formatTeamName, gamesToDisplayFormat, getGameOutcome, getGroupName, getKFactorForRating, getMonthStart, getMonthStartString, getPlayerDateCacheKey, getPlayerOutcome, getPlayerPoints, getPlayerRatingByAlgorithm, getPlayerRatingByRoundType, getPlayerRatingForTournament, getPlayerRatingHistory, getPlayerRatingStrict, getPointSystemFromResult, getPointSystemName, getPrimaryRatingType, getRatingTypeFromRoundRated, getResultDisplayString, isBlackWin, isCountableResult, isDraw, isJuniorPlayer, isTouristBye, isWalkover, isWalkoverClub, isWalkoverPlayer, isWalkoverResult, isWalkoverResultCode, isWhiteWin, normalizeEloLookupDate, parseGameResult, parseLocalDate, parseTimeControl, sortOpponentStats, sortTournamentEndResultsByPlace, sortTournamentsByDate, toRomanNumeral };
