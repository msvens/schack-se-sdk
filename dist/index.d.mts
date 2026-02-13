export { BaseApiService, BatchItemResult, BatchOptions, OrganizationService, PlayerService, RatingsService, RegistrationService, ResultsService, TournamentService } from './services/index.mjs';
export { A as ApiError, a as ApiResponse, C as ClubDTO, D as DistrictDTO, b as DistrictMembershipDTO, F as FederationDTO, G as GameDto, c as GroupSearchAnswerDto, L as LocalTime, M as MemberFIDERatingDTO, d as MemberLASKRatingDTO, P as PlayerInfoDto, e as PlayerRatingHistory, f as PrizeCategoryDto, R as RatingDataPoint, g as RegistrationYear, h as RoundDto, T as TeamTournamentEndResultDto, i as TournamentClassDto, j as TournamentClassGroupDto, k as TournamentDto, l as TournamentEndResultDto, m as TournamentRoundResultDto, n as TournamentState, o as TournamentType, p as isTeamTournament } from './results-BROCPBpO.mjs';
export { M as MemberCategory, P as PlayerCategory, R as RatingListResponse, T as TeamRegistrationDto, a as TeamRegistrationPlayerDto } from './registration-DIaO9kYy.mjs';
export { RatingAlgorithm, RatingAlgorithmType } from './types/index.mjs';
export { ColorStats, GameDisplay, GameOutcome, MatchResult, OpponentStats, ParsedGameResult, PlayerRating, PointSystem, PointSystemType, PointValues, RATING_DIFFERENCE_CAP, RatingType, ResultCode, ResultCodeType, ResultDisplay, RoundRatedType, RoundRatedTypeValue, TournamentGroupResult, TournamentInfo, TournamentRatingStats, aggregateOpponentStats, calculateExpectedScore, calculatePerformanceRating, calculatePlayerPoints, calculatePlayerResult, calculatePoints, calculateRatingChange, calculateStatsByColor, calculateTournamentStats, chunkArray, countTeamsByClub, countTeamsFromRoundResults, createRoundResultsTeamNameFormatter, createTeamNameFormatter, decimateRatingData, deduplicateIds, filterGamesByTimeControl, findTournamentGroup, formatGameResult, formatMatchResult, formatPlayerName, formatPlayerRating, formatRatingWithType, formatTeamName, gamesToDisplayFormat, getGameOutcome, getGroupName, getKFactorForRating, getMonthStart, getMonthStartString, getPlayerDateCacheKey, getPlayerOutcome, getPlayerPoints, getPlayerRatingByAlgorithm, getPlayerRatingByRoundType, getPlayerRatingForTournament, getPlayerRatingHistory, getPlayerRatingStrict, getPointSystemFromResult, getPointSystemName, getPrimaryRatingType, getRatingTypeFromRoundRated, getResultDisplayString, isBlackWin, isCountableResult, isDraw, isJuniorPlayer, isTouristBye, isWalkover, isWalkoverClub, isWalkoverPlayer, isWalkoverResult, isWalkoverResultCode, isWhiteWin, normalizeEloLookupDate, parseGameResult, parseLocalDate, parseTimeControl, sortOpponentStats, sortTournamentEndResultsByPlace, sortTournamentsByDate, toRomanNumeral } from './utils/index.mjs';

/**
 * API Configuration Constants
 *
 * USAGE:
 * - For production: Use SSF_PROD_API_URL
 * - For development/testing: Use SSF_DEV_API_URL
 * - Default: SSF_PROD_API_URL
 */
declare const API_VERSION = "v1";
declare const API_VERSION_DEV = "v1";
declare const SSF_PROD_API_URL = "https://member.schack.se/public/api/v1";
declare const SSF_DEV_API_URL = "https://halvarsson.no-ip.com/webapp/memdb/public/api/v1";
declare const CURRENT_API_URL = "https://member.schack.se/public/api/v1";
declare const DEFAULT_TIMEOUT = 10000;

export { API_VERSION, API_VERSION_DEV, CURRENT_API_URL, DEFAULT_TIMEOUT, SSF_DEV_API_URL, SSF_PROD_API_URL };
