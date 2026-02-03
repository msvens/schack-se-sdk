// Utils exports
export { deduplicateIds, chunkArray } from './batchUtils';
export {
  RATING_DIFFERENCE_CAP,
  calculateExpectedScore,
  calculateRatingChange,
  calculatePerformanceRating,
  calculateTournamentStats,
  type MatchResult,
  type TournamentRatingStats
} from './eloCalculations';
export {
  PointSystem,
  PointValues,
  ResultCode,
  ResultDisplay,
  type PointSystemType,
  type ResultCodeType,
  type GameOutcome,
  type ParsedGameResult,
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
} from './gameResults';
export {
  isWalkoverPlayer,
  isWalkoverClub,
  isWalkoverResult,
  isWalkover,
  formatGameResult,
  formatMatchResult
} from './resultFormatting';
export {
  RoundRatedType,
  type RoundRatedTypeValue,
  parseTimeControl,
  type RatingType,
  type PlayerRating,
  getPlayerRatingForTournament,
  formatPlayerRating,
  formatRatingWithType,
  isJuniorPlayer,
  getKFactorForRating,
  getPlayerRatingByAlgorithm,
  getRatingTypeFromRoundRated,
  getPlayerRatingByRoundType,
  formatPlayerName
} from './ratingUtils';
export { getPlayerRatingHistory, decimateRatingData } from './ratingHistory';
export { sortTournamentEndResultsByPlace, sortTournamentsByDate } from './sortingUtils';
export {
  toRomanNumeral,
  countTeamsByClub,
  formatTeamName,
  createTeamNameFormatter,
  countTeamsFromRoundResults,
  createRoundResultsTeamNameFormatter
} from './teamFormatting';
export {
  findTournamentGroup,
  getGroupName,
  type TournamentGroupResult
} from './tournamentGroupUtils';
export {
  getMonthStart,
  getMonthStartString,
  normalizeEloLookupDate,
  getPlayerDateCacheKey
} from './dateUtils';
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
  formatGameResultDisplay,
  gamesToDisplayFormat
} from './opponentStats';
