// SDK configuration
export { configure, getConfig } from './config';

// Main API exports
export { BaseApiService } from './services/base';

// Export all types
export * from './types';

// Export domain services
export { PlayerService, type BatchOptions, type BatchItemResult } from './services/players';
export { OrganizationService } from './services/organizations';
export { TournamentService } from './services/tournaments';
export { ResultsService } from './services/results';
export { RatingsService } from './services/ratings';
export { RegistrationService } from './services/registration';

// Export constants
export {
  API_VERSION,
  API_VERSION_DEV,
  SSF_PROD_API_URL,
  SSF_DEV_API_URL,
  CURRENT_API_URL,
  DEFAULT_TIMEOUT
} from './constants';

// Export utility functions
export { getPlayerRatingHistory, decimateRatingData } from './utils/ratingHistory';
export { sortTournamentEndResultsByPlace, sortTournamentsByDate } from './utils/sortingUtils';
export {
  getPlayerRatingForTournament,
  getPlayerRatingByAlgorithm,
  formatPlayerRating,
  formatRatingWithType,
  getKFactorForRating,
  formatPlayerName,
  getRatingTypeFromRoundRated,
  getPlayerRatingByRoundType,
  getPrimaryRatingType,
  getPlayerRatingStrict,
  isJuniorPlayer,
  parseTimeControl,
  RoundRatedType,
  type PlayerRating,
  type TimeControlType,
  type RoundRatedTypeValue
} from './utils/ratingUtils';
export { RatingAlgorithm, type RatingAlgorithmType } from './types/ratingAlgorithm';
export {
  calculateExpectedScore,
  calculateRatingChange,
  calculatePerformanceRating,
  calculateTournamentStats,
  RATING_DIFFERENCE_CAP,
  type MatchResult,
  type TournamentRatingStats
} from './utils/eloCalculations';
export {
  isWalkoverPlayer,
  isWalkoverClub,
  isWalkoverResult,
  isWalkover,
  formatGameResult,
  formatMatchResult
} from './utils/resultFormatting';
export {
  findTournamentGroup,
  getGroupName,
  type TournamentGroupResult
} from './utils/tournamentGroupUtils';
export {
  toRomanNumeral,
  countTeamsByClub,
  formatTeamName,
  createTeamNameFormatter,
  countTeamsFromRoundResults,
  createRoundResultsTeamNameFormatter
} from './utils/teamFormatting';
export {
  // Constants
  PointSystem,
  ResultCode,
  ResultDisplay,
  PointValues,
  // Types
  type PointSystemType,
  type ResultCodeType,
  type GameOutcome,
  type ParsedGameResult,
  // Functions
  getPointSystemFromResult,
  isWhiteWin,
  isBlackWin,
  isDraw,
  isWalkoverResultCode,
  isTouristBye,
  isCountableResult,
  getGameOutcome,
  calculatePoints,
  getResultDisplayString,
  parseGameResult,
  getPlayerOutcome,
  getPlayerPoints,
  getPointSystemName
} from './utils/gameResults';
export {
  getMonthStart,
  getMonthStartString,
  normalizeEloLookupDate,
  getPlayerDateCacheKey,
  parseLocalDate
} from './utils/dateUtils';
export { deduplicateIds, chunkArray } from './utils/batchUtils';
export {
  type TournamentInfo,
  type OpponentStats,
  type GameDisplay,
  type ColorStats,
  calculatePlayerResult,
  calculatePlayerPoints,
  filterGamesByTimeControl,
  calculateStatsByColor,
  aggregateOpponentStats,
  sortOpponentStats,
  gamesToDisplayFormat
} from './utils/opponentStats';
