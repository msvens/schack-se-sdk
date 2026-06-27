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
  getOpponentKind,
  type OpponentKind,
  isWalkoverResult,
  isWalkover,
  formatGameResult,
  formatMatchResult
} from './resultFormatting';
export {
  RoundRatedType,
  type RoundRatedTypeValue,
  parseTimeControl,
  type TimeControlType,
  type PlayerRating,
  getPlayerRatingForTournament,
  formatPlayerRating,
  formatRatingWithType,
  isJuniorPlayer,
  getKFactorForRating,
  getPlayerRatingByAlgorithm,
  getRatingTypeFromRoundRated,
  getPlayerRatingByRoundType,
  getPrimaryRatingType,
  getPlayerRatingStrict,
  formatPlayerName
} from './ratingUtils';
export {
  getTournamentStatus,
  isUpcoming,
  isOngoing,
  isFinished
} from './tournamentStatus';
export { getPlayerRatingHistory, decimateRatingData } from './ratingHistory';
export { sortTournamentEndResultsByPlace, sortTournamentsByDate } from './sortingUtils';
// Round-standings result types only — the engine (computeRoundStandings) is
// internal; ResultsService.getRoundStandings is the public entry point.
export type { RoundStandingRow, RoundStandings } from './roundStandings';
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
  getPlayerDateCacheKey,
  parseLocalDate
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
  gamesToDisplayFormat
} from './opponentStats';
