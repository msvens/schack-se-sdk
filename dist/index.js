"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  API_VERSION: () => API_VERSION,
  API_VERSION_DEV: () => API_VERSION_DEV,
  BaseApiService: () => BaseApiService,
  CHESSTOOLS_API_URL: () => CHESSTOOLS_API_URL,
  CURRENT_API_URL: () => CURRENT_API_URL,
  DEFAULT_TIMEOUT: () => DEFAULT_TIMEOUT,
  FideService: () => FideService,
  MemberCategory: () => MemberCategory,
  OrganizationService: () => OrganizationService,
  PairingSystem: () => PairingSystem,
  PlayerCategory: () => PlayerCategory,
  PlayerService: () => PlayerService,
  PointSystem: () => PointSystem,
  PointValues: () => PointValues,
  PrizeCategoryType: () => PrizeCategoryType,
  RATING_DIFFERENCE_CAP: () => RATING_DIFFERENCE_CAP,
  RatingAlgorithm: () => RatingAlgorithm,
  RatingType: () => RatingType,
  RatingsService: () => RatingsService,
  RegistrationService: () => RegistrationService,
  ResultCode: () => ResultCode,
  ResultDisplay: () => ResultDisplay,
  ResultsService: () => ResultsService,
  RoundRatedType: () => RoundRatedType,
  SSF_DEV_API_URL: () => SSF_DEV_API_URL,
  SSF_PROD_API_URL: () => SSF_PROD_API_URL,
  Schack4anTeamPointSystem: () => Schack4anTeamPointSystem,
  Sex: () => Sex,
  TeamTournamentPlayerListType: () => TeamTournamentPlayerListType,
  TiebreakSystem: () => TiebreakSystem,
  TournamentService: () => TournamentService,
  TournamentState: () => TournamentState,
  TournamentType: () => TournamentType,
  aggregateOpponentStats: () => aggregateOpponentStats,
  birthYearOf: () => birthYearOf,
  calculateExpectedScore: () => calculateExpectedScore,
  calculatePerformanceRating: () => calculatePerformanceRating,
  calculatePlayerPoints: () => calculatePlayerPoints,
  calculatePlayerResult: () => calculatePlayerResult,
  calculatePoints: () => calculatePoints,
  calculateRatingChange: () => calculateRatingChange,
  calculateStatsByColor: () => calculateStatsByColor,
  calculateTournamentStats: () => calculateTournamentStats,
  chessAge: () => chessAge,
  chunkArray: () => chunkArray,
  configure: () => configure,
  countTeamsByClub: () => countTeamsByClub,
  countTeamsFromRoundResults: () => countTeamsFromRoundResults,
  createRoundResultsTeamNameFormatter: () => createRoundResultsTeamNameFormatter,
  createTeamNameFormatter: () => createTeamNameFormatter,
  decimateRatingData: () => decimateRatingData,
  deduplicateIds: () => deduplicateIds,
  filterGamesByTimeControl: () => filterGamesByTimeControl,
  findTournamentGroup: () => findTournamentGroup,
  formatGameResult: () => formatGameResult,
  formatMatchResult: () => formatMatchResult,
  formatPlayerName: () => formatPlayerName,
  formatPlayerRating: () => formatPlayerRating,
  formatRatingWithType: () => formatRatingWithType,
  formatTeamName: () => formatTeamName,
  gamesToDisplayFormat: () => gamesToDisplayFormat,
  getConfig: () => getConfig,
  getGameOutcome: () => getGameOutcome,
  getGroupName: () => getGroupName,
  getKFactorForRating: () => getKFactorForRating,
  getMonthStart: () => getMonthStart,
  getMonthStartString: () => getMonthStartString,
  getOpponentKind: () => getOpponentKind,
  getPlayerDateCacheKey: () => getPlayerDateCacheKey,
  getPlayerOutcome: () => getPlayerOutcome,
  getPlayerPoints: () => getPlayerPoints,
  getPlayerRatingByAlgorithm: () => getPlayerRatingByAlgorithm,
  getPlayerRatingByRoundType: () => getPlayerRatingByRoundType,
  getPlayerRatingForTournament: () => getPlayerRatingForTournament,
  getPlayerRatingHistory: () => getPlayerRatingHistory,
  getPlayerRatingStrict: () => getPlayerRatingStrict,
  getPointSystemFromResult: () => getPointSystemFromResult,
  getPointSystemName: () => getPointSystemName,
  getPrimaryRatingType: () => getPrimaryRatingType,
  getRatingTypeFromRoundRated: () => getRatingTypeFromRoundRated,
  getResultDisplayString: () => getResultDisplayString,
  getTiebreakSystemName: () => getTiebreakSystemName,
  getTournamentStatus: () => getTournamentStatus,
  isAdjudicatedResult: () => isAdjudicatedResult,
  isBlackWin: () => isBlackWin,
  isCountableResult: () => isCountableResult,
  isDraw: () => isDraw,
  isFemale: () => isFemale,
  isFinished: () => isFinished,
  isJuniorPlayer: () => isJuniorPlayer,
  isLooseTeamTournament: () => isLooseTeamTournament,
  isOngoing: () => isOngoing,
  isPostponed: () => isPostponed,
  isPrizeCategory: () => isPrizeCategory,
  isResultCodeInformative: () => isResultCodeInformative,
  isSchackfyran: () => isSchackfyran,
  isSchackfyranLike: () => isSchackfyranLike,
  isTeamPairing: () => isTeamPairing,
  isTeamTournament: () => isTeamTournament,
  isTouristBye: () => isTouristBye,
  isUpcoming: () => isUpcoming,
  isWalkover: () => isWalkover,
  isWalkoverResult: () => isWalkoverResult,
  isWalkoverResultCode: () => isWalkoverResultCode,
  isWhiteWin: () => isWhiteWin,
  normalizeEloLookupDate: () => normalizeEloLookupDate,
  parseGameResult: () => parseGameResult,
  parseLocalDate: () => parseLocalDate,
  parsePrizeCategory: () => parsePrizeCategory,
  parseResultDisplay: () => parseResultDisplay,
  parseTimeControl: () => parseTimeControl,
  resolveIndividualResult: () => resolveIndividualResult,
  resolvePrizeMembers: () => resolvePrizeMembers,
  resolveTeamMatchResult: () => resolveTeamMatchResult,
  sortOpponentStats: () => sortOpponentStats,
  sortTournamentEndResultsByPlace: () => sortTournamentEndResultsByPlace,
  sortTournamentsByDate: () => sortTournamentsByDate,
  toRomanNumeral: () => toRomanNumeral
});
module.exports = __toCommonJS(index_exports);

// src/constants.ts
var API_VERSION = "v1";
var API_VERSION_DEV = "v1";
var SSF_PROD_API_URL = `https://member.schack.se/public/api/${API_VERSION}`;
var SSF_DEV_API_URL = `https://halvarsson.no-ip.com/webapp/memdb/public/api/${API_VERSION_DEV}`;
var CURRENT_API_URL = SSF_PROD_API_URL;
var CHESSTOOLS_API_URL = "https://api.chesstools.org";
var DEFAULT_TIMEOUT = 1e4;

// src/config.ts
var config = {
  baseUrl: SSF_PROD_API_URL,
  timeoutMs: DEFAULT_TIMEOUT
};
function configure(options) {
  Object.assign(config, options);
}
function getConfig() {
  return config;
}

// src/services/base.ts
var BaseApiService = class {
  constructor(baseUrl, defaultHeaders, timeoutMs) {
    this.baseUrl = baseUrl ?? getConfig().baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders
    };
    this.timeoutMs = timeoutMs;
  }
  async request(endpoint, options = {}, reqOptions = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const timeoutMs = reqOptions.timeoutMs ?? this.timeoutMs ?? getConfig().timeoutMs;
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    const config2 = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      ...options,
      signal: controller.signal
    };
    try {
      let response;
      try {
        response = await fetch(url, config2);
      } catch (error) {
        if (timedOut) {
          return {
            error: `Request timed out after ${timeoutMs}ms`,
            status: 408,
            message: "Error"
          };
        }
        return {
          error: error instanceof Error ? error.message : "Network error",
          status: 0,
          message: "Error"
        };
      }
      if (!response.ok) {
        let errorMessage = response.statusText || `HTTP ${response.status}`;
        try {
          const body = await response.json();
          if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
            errorMessage = body.message;
          } else if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
            errorMessage = body.error;
          }
        } catch {
        }
        return {
          error: errorMessage,
          status: response.status,
          message: "Error"
        };
      }
      try {
        const data = await response.json();
        return {
          data,
          status: response.status,
          message: "Success"
        };
      } catch (error) {
        if (timedOut) {
          return {
            error: `Request timed out after ${timeoutMs}ms`,
            status: 408,
            message: "Error"
          };
        }
        return {
          error: error instanceof Error ? error.message : "Failed to parse response",
          status: 0,
          message: "Error"
        };
      }
    } finally {
      clearTimeout(timer);
    }
  }
  async get(endpoint, reqOptions) {
    return this.request(endpoint, { method: "GET" }, reqOptions);
  }
  async post(endpoint, body, reqOptions) {
    return this.request(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : void 0
    }, reqOptions);
  }
  async put(endpoint, body, reqOptions) {
    return this.request(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : void 0
    }, reqOptions);
  }
  async delete(endpoint, reqOptions) {
    return this.request(endpoint, { method: "DELETE" }, reqOptions);
  }
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  formatDateToString(date) {
    return this.formatDate(date);
  }
  getCurrentDate() {
    return this.formatDate(/* @__PURE__ */ new Date());
  }
};

// src/utils/gameResults.ts
var PointSystem = {
  DEFAULT: -1,
  SCHACK4AN: 1,
  POINT310: 2
};
var PointValues = {
  [PointSystem.DEFAULT]: {
    win: 1,
    draw: 0.5,
    loss: 0
  },
  [PointSystem.SCHACK4AN]: {
    win: 3,
    draw: 2,
    loss: 1
  },
  [PointSystem.POINT310]: {
    win: 3,
    draw: 1,
    loss: 0
  }
};
var ResultCode = {
  // Special values
  NOT_SET: -100,
  POSTPONED: 100,
  // Standard system
  WHITE_WIN: 1,
  WHITE_WIN_WO: 2,
  WHITE_TOURIST_WO: 29,
  BLACK_WIN: -1,
  BLACK_WIN_WO: -2,
  NO_WIN_WO: -3,
  DRAW: 0,
  BOTH_NO_RESULT: -10,
  BOTH_WIN: 15,
  // Schack4an system
  SCHACK4AN_WHITE_WIN: 3,
  SCHACK4AN_WHITE_WIN_WO: 5,
  SCHACK4AN_WHITE_TOURIST_WO: 31,
  SCHACK4AN_BLACK_WIN: -4,
  SCHACK4AN_BLACK_WIN_WO: -5,
  SCHACK4AN_DRAW: 10,
  SCHACK4AN_BOTH_NO_RESULT: -20,
  SCHACK4AN_BOTH_WIN: 20,
  // Point310 system
  POINT310_WHITE_WIN: 26,
  POINT310_WHITE_WIN_WO: 25,
  POINT310_WHITE_TOURIST_WO: 30,
  POINT310_BLACK_WIN: -26,
  POINT310_BLACK_WIN_WO: -25,
  POINT310_DRAW: 27,
  POINT310_BOTH_NO_RESULT: -27,
  POINT310_BOTH_WIN: 28
};
var ResultDisplay = {
  // Standard
  WHITE_WIN: "1 - 0",
  WHITE_WIN_WO: "1 - 0 w.o",
  WHITE_TOURIST_WO: "\xBD bye",
  BLACK_WIN: "0 - 1",
  BLACK_WIN_WO: "0 - 1 w.o",
  NO_WIN_WO: "0 - 0 w.o",
  DRAW: "\xBD - \xBD",
  NO_RESULT: "  -  ",
  BOTH_NO_RESULT: "0 - 0 adj",
  BOTH_WIN: "1 - 1 adj",
  POSTPONED: "postponed",
  // Schack4an
  SCHACK4AN_WHITE_WIN: "3 - 1",
  SCHACK4AN_WHITE_WIN_WO: "3 - 0 w.o",
  SCHACK4AN_WHITE_TOURIST_WO: "2 bye",
  SCHACK4AN_BLACK_WIN: "1 - 3",
  SCHACK4AN_BLACK_WIN_WO: "0 - 3 w.o",
  SCHACK4AN_DRAW: "2 - 2",
  SCHACK4AN_BOTH_NO_RESULT: "1 - 1 adj",
  SCHACK4AN_BOTH_WIN: "3 - 3 adj",
  // Point310
  POINT310_WHITE_WIN: "3 - 0",
  POINT310_WHITE_WIN_WO: "3 - 0 w.o",
  POINT310_WHITE_TOURIST_WO: "1 bye",
  POINT310_BLACK_WIN: "0 - 3",
  POINT310_BLACK_WIN_WO: "0 - 3 w.o",
  POINT310_DRAW: "1 - 1",
  POINT310_BOTH_NO_RESULT: "0 - 0 adj",
  POINT310_BOTH_WIN: "3 - 3 adj"
};
var WHITE_WIN_CODES = /* @__PURE__ */ new Set([
  ResultCode.WHITE_WIN,
  ResultCode.WHITE_WIN_WO,
  ResultCode.WHITE_TOURIST_WO,
  ResultCode.SCHACK4AN_WHITE_WIN,
  ResultCode.SCHACK4AN_WHITE_WIN_WO,
  ResultCode.SCHACK4AN_WHITE_TOURIST_WO,
  ResultCode.POINT310_WHITE_WIN,
  ResultCode.POINT310_WHITE_WIN_WO,
  ResultCode.POINT310_WHITE_TOURIST_WO
]);
var BLACK_WIN_CODES = /* @__PURE__ */ new Set([
  ResultCode.BLACK_WIN,
  ResultCode.BLACK_WIN_WO,
  ResultCode.SCHACK4AN_BLACK_WIN,
  ResultCode.SCHACK4AN_BLACK_WIN_WO,
  ResultCode.POINT310_BLACK_WIN,
  ResultCode.POINT310_BLACK_WIN_WO
]);
var DRAW_CODES = /* @__PURE__ */ new Set([
  ResultCode.DRAW,
  ResultCode.SCHACK4AN_DRAW,
  ResultCode.POINT310_DRAW
]);
var WALKOVER_CODES = /* @__PURE__ */ new Set([
  ResultCode.WHITE_WIN_WO,
  ResultCode.BLACK_WIN_WO,
  ResultCode.NO_WIN_WO,
  ResultCode.SCHACK4AN_WHITE_WIN_WO,
  ResultCode.SCHACK4AN_BLACK_WIN_WO,
  ResultCode.POINT310_WHITE_WIN_WO,
  ResultCode.POINT310_BLACK_WIN_WO
]);
var TOURIST_BYE_CODES = /* @__PURE__ */ new Set([
  ResultCode.WHITE_TOURIST_WO,
  ResultCode.SCHACK4AN_WHITE_TOURIST_WO,
  ResultCode.POINT310_WHITE_TOURIST_WO
]);
var NON_COUNTABLE_CODES = /* @__PURE__ */ new Set([
  ResultCode.NOT_SET,
  ResultCode.POSTPONED,
  ResultCode.NO_WIN_WO,
  ResultCode.BOTH_NO_RESULT,
  ResultCode.SCHACK4AN_BOTH_NO_RESULT,
  ResultCode.POINT310_BOTH_NO_RESULT
]);
var ADJUDICATED_CODES = /* @__PURE__ */ new Set([
  ResultCode.BOTH_NO_RESULT,
  ResultCode.BOTH_WIN,
  ResultCode.SCHACK4AN_BOTH_NO_RESULT,
  ResultCode.SCHACK4AN_BOTH_WIN,
  ResultCode.POINT310_BOTH_NO_RESULT,
  ResultCode.POINT310_BOTH_WIN
]);
var KNOWN_CODES = new Set(Object.values(ResultCode));
function getPointSystemFromResult(resultCode) {
  if ([3, -4, 10, 5, -5, 31, -20, 20].includes(resultCode)) {
    return PointSystem.SCHACK4AN;
  }
  if ([26, -26, 27, 25, -25, 30, -27, 28].includes(resultCode)) {
    return PointSystem.POINT310;
  }
  return PointSystem.DEFAULT;
}
function isWhiteWin(resultCode) {
  return WHITE_WIN_CODES.has(resultCode);
}
function isBlackWin(resultCode) {
  return BLACK_WIN_CODES.has(resultCode);
}
function isDraw(resultCode) {
  return DRAW_CODES.has(resultCode);
}
function isWalkoverResultCode(resultCode) {
  return WALKOVER_CODES.has(resultCode);
}
function isTouristBye(resultCode) {
  return TOURIST_BYE_CODES.has(resultCode);
}
function isCountableResult(resultCode) {
  return !NON_COUNTABLE_CODES.has(resultCode);
}
function getGameOutcome(resultCode) {
  if (isWhiteWin(resultCode)) return "white_win";
  if (isBlackWin(resultCode)) return "black_win";
  if (isDraw(resultCode)) return "draw";
  if (NON_COUNTABLE_CODES.has(resultCode)) return "no_result";
  return "special";
}
function calculatePoints(resultCode) {
  const pointSystem = getPointSystemFromResult(resultCode);
  const values = PointValues[pointSystem];
  if (isWhiteWin(resultCode)) {
    if (isTouristBye(resultCode)) {
      return [values.draw, 0];
    }
    return [values.win, values.loss];
  }
  if (isBlackWin(resultCode)) {
    return [values.loss, values.win];
  }
  if (isDraw(resultCode)) {
    return [values.draw, values.draw];
  }
  switch (resultCode) {
    case ResultCode.BOTH_WIN:
      return [1, 1];
    case ResultCode.SCHACK4AN_BOTH_WIN:
      return [3, 3];
    case ResultCode.POINT310_BOTH_WIN:
      return [3, 3];
    case ResultCode.NO_WIN_WO:
    case ResultCode.BOTH_NO_RESULT:
    case ResultCode.SCHACK4AN_BOTH_NO_RESULT:
    case ResultCode.POINT310_BOTH_NO_RESULT:
      return [0, 0];
    default:
      return [0, 0];
  }
}
function getResultDisplayString(resultCode) {
  switch (resultCode) {
    // Standard
    case ResultCode.WHITE_WIN:
      return ResultDisplay.WHITE_WIN;
    case ResultCode.WHITE_WIN_WO:
      return ResultDisplay.WHITE_WIN_WO;
    case ResultCode.WHITE_TOURIST_WO:
      return ResultDisplay.WHITE_TOURIST_WO;
    case ResultCode.BLACK_WIN:
      return ResultDisplay.BLACK_WIN;
    case ResultCode.BLACK_WIN_WO:
      return ResultDisplay.BLACK_WIN_WO;
    case ResultCode.NO_WIN_WO:
      return ResultDisplay.NO_WIN_WO;
    case ResultCode.DRAW:
      return ResultDisplay.DRAW;
    case ResultCode.BOTH_NO_RESULT:
      return ResultDisplay.BOTH_NO_RESULT;
    case ResultCode.BOTH_WIN:
      return ResultDisplay.BOTH_WIN;
    case ResultCode.POSTPONED:
      return ResultDisplay.POSTPONED;
    case ResultCode.NOT_SET:
      return ResultDisplay.NO_RESULT;
    // Schack4an
    case ResultCode.SCHACK4AN_WHITE_WIN:
      return ResultDisplay.SCHACK4AN_WHITE_WIN;
    case ResultCode.SCHACK4AN_WHITE_WIN_WO:
      return ResultDisplay.SCHACK4AN_WHITE_WIN_WO;
    case ResultCode.SCHACK4AN_WHITE_TOURIST_WO:
      return ResultDisplay.SCHACK4AN_WHITE_TOURIST_WO;
    case ResultCode.SCHACK4AN_BLACK_WIN:
      return ResultDisplay.SCHACK4AN_BLACK_WIN;
    case ResultCode.SCHACK4AN_BLACK_WIN_WO:
      return ResultDisplay.SCHACK4AN_BLACK_WIN_WO;
    case ResultCode.SCHACK4AN_DRAW:
      return ResultDisplay.SCHACK4AN_DRAW;
    case ResultCode.SCHACK4AN_BOTH_NO_RESULT:
      return ResultDisplay.SCHACK4AN_BOTH_NO_RESULT;
    case ResultCode.SCHACK4AN_BOTH_WIN:
      return ResultDisplay.SCHACK4AN_BOTH_WIN;
    // Point310
    case ResultCode.POINT310_WHITE_WIN:
      return ResultDisplay.POINT310_WHITE_WIN;
    case ResultCode.POINT310_WHITE_WIN_WO:
      return ResultDisplay.POINT310_WHITE_WIN_WO;
    case ResultCode.POINT310_WHITE_TOURIST_WO:
      return ResultDisplay.POINT310_WHITE_TOURIST_WO;
    case ResultCode.POINT310_BLACK_WIN:
      return ResultDisplay.POINT310_BLACK_WIN;
    case ResultCode.POINT310_BLACK_WIN_WO:
      return ResultDisplay.POINT310_BLACK_WIN_WO;
    case ResultCode.POINT310_DRAW:
      return ResultDisplay.POINT310_DRAW;
    case ResultCode.POINT310_BOTH_NO_RESULT:
      return ResultDisplay.POINT310_BOTH_NO_RESULT;
    case ResultCode.POINT310_BOTH_WIN:
      return ResultDisplay.POINT310_BOTH_WIN;
    default:
      return "-";
  }
}
function parseGameResult(resultCode) {
  const [whitePoints, blackPoints] = calculatePoints(resultCode);
  const outcome = getGameOutcome(resultCode);
  return {
    outcome,
    whitePoints,
    blackPoints,
    isWalkover: isWalkoverResultCode(resultCode),
    isTouristBye: isTouristBye(resultCode),
    isCountable: isCountableResult(resultCode),
    displayString: getResultDisplayString(resultCode)
  };
}
function getPlayerOutcome(resultCode, isWhite) {
  if (!isCountableResult(resultCode)) {
    return null;
  }
  const outcome = getGameOutcome(resultCode);
  switch (outcome) {
    case "white_win":
      return isWhite ? "win" : "loss";
    case "black_win":
      return isWhite ? "loss" : "win";
    case "draw":
      return "draw";
    default:
      return null;
  }
}
function getPlayerPoints(resultCode, isWhite) {
  if (!isCountableResult(resultCode)) {
    return null;
  }
  const [whitePoints, blackPoints] = calculatePoints(resultCode);
  return isWhite ? whitePoints : blackPoints;
}
function getPointSystemName(pointSystem) {
  switch (pointSystem) {
    case PointSystem.SCHACK4AN:
      return "Schackfyran (3-2-1)";
    case PointSystem.POINT310:
      return "3-1-0";
    case PointSystem.DEFAULT:
    default:
      return "Standard (1-\xBD-0)";
  }
}
function isAdjudicatedResult(resultCode) {
  return ADJUDICATED_CODES.has(resultCode);
}
function isPostponed(resultCode) {
  return resultCode === ResultCode.POSTPONED;
}
function isResultCodeInformative(resultCode) {
  return KNOWN_CODES.has(resultCode) && resultCode !== ResultCode.NOT_SET;
}
function parseResultDisplay(resultCode) {
  const pointSystem = getPointSystemFromResult(resultCode);
  const informative = isResultCodeInformative(resultCode);
  let kind;
  if (isTouristBye(resultCode)) kind = "tourist_bye";
  else if (isWalkoverResultCode(resultCode)) kind = "walkover";
  else if (isAdjudicatedResult(resultCode)) kind = "adjudicated";
  else if (isPostponed(resultCode)) kind = "postponed";
  else if (!informative) kind = "none";
  else kind = "normal";
  if (kind === "postponed" || kind === "none") {
    return { home: null, away: null, kind, pointSystem, informative };
  }
  const [home, away] = calculatePoints(resultCode);
  return { home, away, kind, pointSystem, informative };
}
function resultFromRowPoints(homeResult, awayResult) {
  if (homeResult === 0 && awayResult === 0) {
    return { home: null, away: null, kind: "none", pointSystem: PointSystem.DEFAULT, informative: false };
  }
  return { home: homeResult, away: awayResult, kind: "normal", pointSystem: PointSystem.DEFAULT, informative: true };
}
function resolveIndividualResult(row) {
  const games = row.games ?? [];
  if (games.length > 1) {
    return { home: null, away: null, kind: "none", pointSystem: PointSystem.DEFAULT, informative: false };
  }
  if (games.length === 1) {
    const parsed = parseResultDisplay(games[0].result);
    if (parsed.informative) return parsed;
  }
  return resultFromRowPoints(row.homeResult, row.awayResult);
}
function resolveTeamMatchResult(row) {
  return resultFromRowPoints(row.homeResult, row.awayResult);
}

// src/types/tournament.ts
var TournamentType = {
  ALLSVENSKAN: 2,
  INDIVIDUAL: 3,
  SM_TREE: 4,
  SCHOOL_SM: 5,
  SVENSKA_CUPEN: 6,
  GRAND_PRIX: 7,
  YES2CHESS: 8,
  SCHACKFYRAN: 9
};
var TournamentState = {
  REGISTRATION: 1,
  STARTED: 2,
  FINISHED: 3
};
var TeamTournamentPlayerListType = {
  REGISTRATION_TEAMS: 1,
  RATINGLIST_TEAMS: 2,
  TEAM_TEAMS: 3
};
var PairingSystem = {
  BERGER: 1,
  MONRAD: 2,
  NORDIC: 3,
  FIDE_SWISS: 4,
  ARENA: 5
};
var TiebreakSystem = {
  UNSET: -1,
  SSF_BERGER: 1,
  BUCHHOLZ: 2,
  SSF_BUCHHOLZ: 3,
  MEDIAN_BUCHHOLZ: 4,
  PROGRESSIVE: 5,
  ALLSVENSKAN: 6,
  FIDE_BUCHHOLZ_2024: 7
};
function getTiebreakSystemName(tiebreakSystem) {
  switch (tiebreakSystem) {
    case TiebreakSystem.UNSET:
      return "Unset";
    case TiebreakSystem.SSF_BERGER:
      return "SSF-Berger";
    case TiebreakSystem.BUCHHOLZ:
      return "Buchholz";
    case TiebreakSystem.SSF_BUCHHOLZ:
      return "SSF Buchholz";
    case TiebreakSystem.MEDIAN_BUCHHOLZ:
      return "Median Buchholz";
    case TiebreakSystem.PROGRESSIVE:
      return "Progressive";
    case TiebreakSystem.ALLSVENSKAN:
      return "Allsvenskan";
    case TiebreakSystem.FIDE_BUCHHOLZ_2024:
      return "FIDE Buchholz 2024";
    default:
      return `Unknown (${tiebreakSystem})`;
  }
}
var Schack4anTeamPointSystem = {
  S4_NORMALIZED: 1,
  NORMAL: -1,
  LEGACY_DEFAULT: 10
};
function isLooseTeamTournament(playerListType) {
  return playerListType === TeamTournamentPlayerListType.TEAM_TEAMS;
}
function isTeamTournament(type) {
  return type === TournamentType.ALLSVENSKAN || type === TournamentType.SVENSKA_CUPEN || type === TournamentType.YES2CHESS || type === TournamentType.SCHACKFYRAN;
}
function isTeamPairing(type) {
  return type === TournamentType.ALLSVENSKAN || type === TournamentType.SVENSKA_CUPEN || type === TournamentType.YES2CHESS;
}
function isSchackfyran(type) {
  return type === TournamentType.SCHACKFYRAN;
}
function isSchackfyranLike(type, groupPointSystem) {
  return type === TournamentType.SCHACKFYRAN || groupPointSystem === PointSystem.SCHACK4AN;
}

// src/types/ratings.ts
var RatingType = /* @__PURE__ */ ((RatingType2) => {
  RatingType2[RatingType2["STANDARD"] = 1] = "STANDARD";
  RatingType2[RatingType2["RAPID"] = 6] = "RAPID";
  RatingType2[RatingType2["BLITZ"] = 7] = "BLITZ";
  return RatingType2;
})(RatingType || {});
var MemberCategory = /* @__PURE__ */ ((MemberCategory2) => {
  MemberCategory2[MemberCategory2["ALL"] = 0] = "ALL";
  MemberCategory2[MemberCategory2["JUNIORS"] = 1] = "JUNIORS";
  MemberCategory2[MemberCategory2["CADETS"] = 2] = "CADETS";
  MemberCategory2[MemberCategory2["VETERANS"] = 4] = "VETERANS";
  MemberCategory2[MemberCategory2["WOMEN"] = 5] = "WOMEN";
  MemberCategory2[MemberCategory2["MINORS"] = 6] = "MINORS";
  MemberCategory2[MemberCategory2["KIDS"] = 7] = "KIDS";
  MemberCategory2[MemberCategory2["Y2C_ELEMENTARY"] = 10] = "Y2C_ELEMENTARY";
  MemberCategory2[MemberCategory2["Y2C_GRADE5"] = 11] = "Y2C_GRADE5";
  MemberCategory2[MemberCategory2["Y2C_GRADE6"] = 12] = "Y2C_GRADE6";
  MemberCategory2[MemberCategory2["Y2C_MIDDLE_SCHOOL"] = 13] = "Y2C_MIDDLE_SCHOOL";
  return MemberCategory2;
})(MemberCategory || {});
var PlayerCategory = /* @__PURE__ */ ((PlayerCategory2) => {
  PlayerCategory2[PlayerCategory2["ALL"] = 0] = "ALL";
  PlayerCategory2[PlayerCategory2["JUNIORS"] = 1] = "JUNIORS";
  PlayerCategory2[PlayerCategory2["CADETS"] = 2] = "CADETS";
  PlayerCategory2[PlayerCategory2["VETERANS"] = 4] = "VETERANS";
  PlayerCategory2[PlayerCategory2["WOMEN"] = 5] = "WOMEN";
  PlayerCategory2[PlayerCategory2["MINORS"] = 6] = "MINORS";
  PlayerCategory2[PlayerCategory2["KIDS"] = 7] = "KIDS";
  PlayerCategory2[PlayerCategory2["Y2C_ELEMENTARY"] = 10] = "Y2C_ELEMENTARY";
  PlayerCategory2[PlayerCategory2["Y2C_GRADE5"] = 11] = "Y2C_GRADE5";
  PlayerCategory2[PlayerCategory2["Y2C_GRADE6"] = 12] = "Y2C_GRADE6";
  PlayerCategory2[PlayerCategory2["Y2C_MIDDLE_SCHOOL"] = 13] = "Y2C_MIDDLE_SCHOOL";
  return PlayerCategory2;
})(PlayerCategory || {});

// src/types/ratingAlgorithm.ts
var RatingAlgorithm = {
  /** Standard ELO algorithm */
  STANDARD_ELO: 1,
  /** Use ELO if available, otherwise LASK */
  IF_ELO_THEN_ELO_OTHERWISE_LASK: 2,
  /** LASK algorithm */
  LASK: 3,
  /** Max of ELO and LASK */
  MAX_ELO_LASK: 4,
  /** No rating calculation */
  NO_RATING: 5,
  /** Rapid ELO algorithm */
  RAPID_ELO: 6,
  /** Blitz ELO algorithm */
  BLITZ_ELO: 7,
  /** Priority order: Blitz, Standard, Rapid */
  BLITZ_STANDARD_RAPID_ELO: 8,
  /** Priority order: Standard, Rapid, Blitz */
  STANDARD_RAPID_BLITZ_ELO: 9,
  /** Priority order: Rapid, Standard, Blitz */
  RAPID_STANDARD_BLITZ_ELO: 10
};

// src/utils/batchUtils.ts
function deduplicateIds(ids) {
  return Array.from(new Set(ids));
}
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// src/services/players.ts
var PlayerService = class extends BaseApiService {
  constructor(baseUrl, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  // Player API methods
  /**
   * Get player information by SSF ID and date
   * @param playerId - The Swedish Chess Federation player ID (number)
   * @param date - Optional date (defaults to current date)
   * @param options - Per-request options (e.g. timeoutMs)
   *
   * @returns Player information
   */
  async getPlayerInfo(playerId, date, options) {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/${playerId}/date/${targetDate}`;
    return this.get(endpoint, options);
  }
  /**
   * Get player information by FIDE ID and date
   * @param fideId - The FIDE player ID (number)
   * @param date - Optional date (defaults to current date)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Player information
   */
  async getPlayerByFIDEId(fideId, date, options) {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/fideid/${fideId}/date/${targetDate}`;
    return this.get(endpoint, options);
  }
  /**
   * Search for players by first name and last name
   * @param fornamn - The first name (Swedish: fornamn)
   * @param efternamn - The last name (Swedish: efternamn)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of matching players
   */
  async searchPlayer(fornamn, efternamn, options) {
    const endpoint = `/player/fornamn/${encodeURIComponent(fornamn)}/efternamn/${encodeURIComponent(efternamn)}`;
    return this.get(endpoint, options);
  }
  /**
   * Fetch player information for multiple players in a single API call
   *
   * @param members - Array of { id, date } objects
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of player information
   */
  async getPlayerList(members, options) {
    return this.post("/player/list/", members, options);
  }
  /**
   * Fetch player information for multiple player IDs in batches
   *
   * Uses individual GET requests per player ID, which is slower than
   * {@link getPlayerList} but tolerant of invalid/missing IDs — a single
   * bad ID won't fail the entire batch. Prefer {@link getPlayerList} when
   * you know all IDs are valid.
   *
   * @param playerIds - Array of player IDs to fetch (duplicates allowed, order preserved)
   * @param date - Optional date filter (defaults to current date)
   * @param options - Batch processing options
   * @returns Array of results matching input order - each item contains either data or error
   */
  async getPlayerInfoBatch(playerIds, date, options = {}) {
    const { concurrency = 10, timeoutMs } = options;
    const chunks = chunkArray(playerIds, concurrency);
    const results = [];
    for (const chunk of chunks) {
      const responses = await Promise.allSettled(
        chunk.map((id) => this.getPlayerInfo(id, date, { timeoutMs }))
      );
      responses.forEach((response) => {
        if (response.status === "fulfilled" && response.value.data) {
          results.push({ data: response.value.data, error: null });
        } else if (response.status === "fulfilled" && response.value.error) {
          results.push({ data: null, error: response.value.error });
        } else if (response.status === "rejected") {
          results.push({
            data: null,
            error: response.reason?.message || "Unknown error"
          });
        }
      });
    }
    return results;
  }
  /**
   * Fetch player rating history for a date range
   *
   * @param playerId - The Swedish Chess Federation player ID
   * @param startMonth - Start month in YYYY-MM format (default: 12 months ago)
   * @param endMonth - End month in YYYY-MM format (default: current month)
   * @returns Array of rating history sorted by date (latest first)
   *
   * @remarks
   * - Fetches all months in the range via a single POST to /player/list/
   * - Results are ordered latest first (matching the request order)
   * - **Smart stopping**: Iterates results and stops at the first month with no ratings
   *   (elo and lask are null/0), so months before the player was rated are excluded
   * - Only returns months where the player has at least one rating value
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
  async getPlayerEloHistory(playerId, startMonth, endMonth, options) {
    try {
      const today = /* @__PURE__ */ new Date();
      const end = endMonth ? new Date(parseInt(endMonth.split("-")[0]), parseInt(endMonth.split("-")[1]) - 1, 1) : new Date(today.getFullYear(), today.getMonth(), 1);
      const start = startMonth ? new Date(parseInt(startMonth.split("-")[0]), parseInt(startMonth.split("-")[1]) - 1, 1) : new Date(today.getFullYear(), today.getMonth() - 11, 1);
      const dates = [];
      const current = new Date(end.getFullYear(), end.getMonth(), 1);
      while (current >= start) {
        dates.push(new Date(current.getFullYear(), current.getMonth(), 1));
        current.setMonth(current.getMonth() - 1);
      }
      const members = dates.map((d) => ({
        id: playerId,
        date: this.formatDateToString(d)
      }));
      const response = await this.getPlayerList(members, options);
      if (response.error || !response.data) {
        return {
          status: response.status,
          error: response.error || "Failed to fetch rating history"
        };
      }
      const ratingHistory = [];
      for (const player of response.data) {
        const elo = player.elo;
        const lask = player.lask;
        const hasAnyRating = elo?.rating || elo?.rapidRating || elo?.blitzRating || lask?.rating;
        if (hasAnyRating) {
          ratingHistory.push({ elo, lask });
        } else {
          break;
        }
      }
      return {
        status: 200,
        data: ratingHistory
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : "Failed to fetch rating history"
      };
    }
  }
};

// src/services/organizations.ts
var OrganizationService = class extends BaseApiService {
  constructor(baseUrl, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  // Organization API methods
  /**
   * Get Swedish Chess Federation information
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Federation information
   */
  async getFederation(options) {
    const endpoint = "/organisation/federation";
    return this.get(endpoint, options);
  }
  /**
   * Get all districts information
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of all districts
   */
  async getDistricts(options) {
    const endpoint = "/organisation/districts";
    return this.get(endpoint, options);
  }
  /**
   * Get clubs in a specific district
   * @param districtId - District ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of clubs in the district
   */
  async getClubsInDistrict(districtId, options) {
    const endpoint = `/organisation/district/clubs/${districtId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get specific club information
   * @param clubId - Club ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Club information
   */
  async getClub(clubId, options) {
    const endpoint = `/organisation/club/${clubId}`;
    return this.get(endpoint, options);
  }
  /**
   * Check if a club name already exists (excluding a specific club ID)
   * @param name - Club name to check
   * @param id - Club ID to exclude from the check
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Boolean indicating if the name exists
   */
  async checkClubNameExists(name, id, options) {
    const endpoint = `/organisation/club/exists/${encodeURIComponent(name)}/${id}`;
    return this.get(endpoint, options);
  }
};

// src/services/tournaments.ts
var TournamentService = class extends BaseApiService {
  constructor(baseUrl, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  // Tournament Structure API methods
  /**
   * Get detailed tournament information by tournament ID
   * @param tournamentId - Tournament ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Comprehensive tournament information including classes and groups
   */
  async getTournament(tournamentId, options) {
    const endpoint = `/tournament/tournament/id/${tournamentId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get tournament information by group ID
   * @param groupId - Tournament group ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Tournament information for the tournament containing this group
   */
  async getTournamentFromGroup(groupId, options) {
    const endpoint = `/tournament/group/id/${groupId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get tournament information by class/division ID
   * @param classId - Tournament class ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Tournament information for the tournament containing this class
   */
  async getTournamentFromClass(classId, options) {
    const endpoint = `/tournament/class/id/${classId}`;
    return this.get(endpoint, options);
  }
  /**
   * Search for tournament groups by name or location
   * @param searchWord - Search term for tournament/group name or location
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of matching tournament groups with basic information
   */
  async searchGroups(searchWord, options) {
    const endpoint = `/tournament/group/search/${encodeURIComponent(searchWord)}`;
    return this.get(endpoint, options);
  }
  /**
   * Get upcoming tournaments
   * @param districtId - Optional district ID to filter by district and club tournaments
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of upcoming tournaments
   */
  async searchComingTournaments(districtId, options) {
    const endpoint = districtId !== void 0 ? `/tournament/group/coming/${districtId}` : "/tournament/group/coming";
    return this.get(endpoint, options);
  }
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
  async searchUpdatedTournaments(startDate, endDate, districtId, options) {
    const endpoint = districtId !== void 0 ? `/tournament/tournament/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}` : `/tournament/tournament/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;
    return this.get(endpoint, options);
  }
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
  async searchUpdatedGroups(startDate, endDate, districtId, options) {
    const endpoint = districtId !== void 0 ? `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}/${districtId}` : `/tournament/group/updated/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;
    return this.get(endpoint, options);
  }
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
  async getTournamentBatch(tournamentIds, options = {}) {
    const { concurrency = 10, timeoutMs } = options;
    const chunks = chunkArray(tournamentIds, concurrency);
    const results = [];
    for (const chunk of chunks) {
      const responses = await Promise.allSettled(
        chunk.map((id) => this.getTournament(id, { timeoutMs }))
      );
      responses.forEach((response) => {
        if (response.status === "fulfilled" && response.value.data) {
          results.push({ data: response.value.data, error: null });
        } else if (response.status === "fulfilled" && response.value.error) {
          results.push({ data: null, error: response.value.error });
        } else if (response.status === "rejected") {
          results.push({
            data: null,
            error: response.reason?.message || "Unknown error"
          });
        }
      });
    }
    return results;
  }
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
  async getTournamentFromGroupBatch(groupIds, options = {}) {
    const { concurrency = 10, timeoutMs } = options;
    const chunks = chunkArray(groupIds, concurrency);
    const results = [];
    for (const chunk of chunks) {
      const responses = await Promise.allSettled(
        chunk.map((id) => this.getTournamentFromGroup(id, { timeoutMs }))
      );
      responses.forEach((response) => {
        if (response.status === "fulfilled" && response.value.data) {
          results.push({ data: response.value.data, error: null });
        } else if (response.status === "fulfilled" && response.value.error) {
          results.push({ data: null, error: response.value.error });
        } else if (response.status === "rejected") {
          results.push({
            data: null,
            error: response.reason?.message || "Unknown error"
          });
        }
      });
    }
    return results;
  }
};

// src/utils/resultFormatting.ts
var BYE_ID = -100;
function getOpponentKind(id) {
  if (id === BYE_ID) return "bye";
  if (id < 0) return "walkover";
  return "paired";
}
function isWalkoverResult(result) {
  return isWalkoverResultCode(result);
}
function isWalkover(homeId, awayId, result) {
  return getOpponentKind(homeId) === "walkover" || getOpponentKind(awayId) === "walkover" || result !== void 0 && isWalkoverResult(result);
}
function formatGameResult(result, whiteId, blackId) {
  const displayString = getResultDisplayString(result);
  if (isWalkoverResultCode(result) || isTouristBye(result)) {
    return displayString;
  }
  const hasWalkoverPlayer = whiteId !== void 0 && getOpponentKind(whiteId) === "walkover" || blackId !== void 0 && getOpponentKind(blackId) === "walkover";
  if (hasWalkoverPlayer && isCountableResult(result)) {
    return `${displayString} w.o`;
  }
  return displayString;
}
function formatMatchResult(homeResult, awayResult, homeId, awayId) {
  if (homeResult === void 0 || awayResult === void 0) {
    return "-";
  }
  const hasWalkover = homeId !== void 0 && getOpponentKind(homeId) === "walkover" || awayId !== void 0 && getOpponentKind(awayId) === "walkover";
  const resultStr = `${homeResult} - ${awayResult}`;
  return hasWalkover ? `${resultStr} w.o` : resultStr;
}

// src/utils/tiebreaks.ts
function buchholz(opponentScores) {
  return opponentScores.reduce((sum, s) => sum + s, 0);
}
function buchholzCut1(opponentScores) {
  if (opponentScores.length === 0) return 0;
  const min = Math.min(...opponentScores);
  return buchholz(opponentScores) - min;
}
var FIELD_SCALE = [0.01, 1e-4, 1e-6, 1e-8];
function pack(base, fields) {
  return fields.reduce((acc, f, i) => acc + f * FIELD_SCALE[i], base);
}
function computeSsfSecPoints(tiebreakSystem, ctx) {
  switch (tiebreakSystem) {
    case TiebreakSystem.SSF_BUCHHOLZ: {
      const base = ctx.byeFictiveScores.length ? buchholz(ctx.opponentScores) : buchholzCut1(ctx.opponentScores);
      return pack(base, [ctx.wins, ctx.gamesWithBlack]);
    }
    default:
      return null;
  }
}
function isSsfSecPointsSupported(tiebreakSystem) {
  return tiebreakSystem === TiebreakSystem.SSF_BUCHHOLZ;
}
var REPRODUCED_SYSTEMS = /* @__PURE__ */ new Set([TiebreakSystem.SSF_BUCHHOLZ]);
var CONFIRMED_SYSTEMS = /* @__PURE__ */ new Set();
function secondaryBasis(opts) {
  if (opts.mode === "team") return "exact";
  const sys = opts.tiebreakSystem;
  if (sys !== void 0 && CONFIRMED_SYSTEMS.has(sys) && !opts.hasUnhandledUnplayed) {
    return "official";
  }
  if (sys !== void 0 && REPRODUCED_SYSTEMS.has(sys)) return "reproduced";
  return "indicative";
}
function isEstimated(basis) {
  return basis === "reproduced" || basis === "indicative";
}
function orderingMatchesOfficial(orderedKeys, officialPlace) {
  if (orderedKeys.length === 0) return false;
  let prevPlace = Number.NEGATIVE_INFINITY;
  for (const key of orderedKeys) {
    const place = officialPlace.get(key);
    if (place === void 0) return false;
    if (place < prevPlace) return false;
    prevPlace = place;
  }
  return true;
}

// src/utils/roundStandings.ts
function isRealContender(id) {
  return getOpponentKind(id) === "paired";
}
function computeRoundStandings(roundResults, options) {
  const {
    mode,
    qualityMetric = "buchholz",
    tiebreakSystem,
    matchPointValues = { win: 2, draw: 1, loss: 0 }
  } = options;
  const team = mode === "team";
  const byRound = /* @__PURE__ */ new Map();
  for (const pairing of roundResults) {
    const list = byRound.get(pairing.roundNr);
    if (list) list.push(pairing);
    else byRound.set(pairing.roundNr, [pairing]);
  }
  const rounds = [...byRound.keys()].sort((a, b) => a - b);
  const basis = secondaryBasis({ mode, tiebreakSystem, hasUnhandledUnplayed: false });
  const estimated = isEstimated(basis);
  let teamParity = { homeWhiteOnOdd: true, known: false };
  let boardKeys = [];
  if (team) {
    const played = roundResults.filter(
      (p) => isRealContender(p.homeId) && isRealContender(p.awayId) && p.games.length > 0
    );
    teamParity = deriveTeamParity(played);
    boardKeys = teamBoardKeys([...new Set(played.flatMap((p) => p.games.map((g) => g.tableNr)))]);
  }
  const keyOf = (id, teamNumber) => team ? `${id}:${teamNumber}` : `${id}`;
  const acc = /* @__PURE__ */ new Map();
  const get = (id, teamNumber) => {
    const key = keyOf(id, teamNumber);
    let a = acc.get(key);
    if (!a) {
      a = {
        contenderId: id,
        teamNumber,
        points: 0,
        matchPoints: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gamesPlayed: 0,
        order: acc.size,
        gamesWithBlack: 0,
        byeResults: [],
        opponents: [],
        boardPoints: /* @__PURE__ */ new Map(),
        boardAttributed: true,
        mpAgainst: /* @__PURE__ */ new Map(),
        bpAgainst: /* @__PURE__ */ new Map()
      };
      acc.set(key, a);
    }
    return a;
  };
  const snapshots = [];
  for (const round of rounds) {
    for (const p of byRound.get(round)) {
      const homeReal = isRealContender(p.homeId);
      const awayReal = isRealContender(p.awayId);
      if (homeReal) get(p.homeId, p.homeTeamNumber).points += p.homeResult;
      if (awayReal) get(p.awayId, p.awayTeamNumber).points += p.awayResult;
      if (!team) {
        if (homeReal && !awayReal) get(p.homeId, 0).byeResults.push(p.homeResult);
        if (awayReal && !homeReal) get(p.awayId, 0).byeResults.push(p.awayResult);
      }
      if (homeReal && awayReal) {
        const h = get(p.homeId, p.homeTeamNumber);
        const a = get(p.awayId, p.awayTeamNumber);
        if (team) {
          recordMatch(h, p.homeResult, p.awayResult, matchPointValues);
          recordMatch(a, p.awayResult, p.homeResult, matchPointValues);
          const hk = keyOf(p.homeId, p.homeTeamNumber);
          const ak = keyOf(p.awayId, p.awayTeamNumber);
          h.mpAgainst.set(ak, (h.mpAgainst.get(ak) ?? 0) + matchPointsFor(p.homeResult, p.awayResult, matchPointValues));
          h.bpAgainst.set(ak, (h.bpAgainst.get(ak) ?? 0) + p.homeResult);
          a.mpAgainst.set(hk, (a.mpAgainst.get(hk) ?? 0) + matchPointsFor(p.awayResult, p.homeResult, matchPointValues));
          a.bpAgainst.set(hk, (a.bpAgainst.get(hk) ?? 0) + p.awayResult);
          if (p.games.length > 0) {
            const s = teamParity.known ? splitTeamMatch(p, teamParity.homeWhiteOnOdd) : null;
            if (s && s.ok) {
              for (const [b, v] of s.home) h.boardPoints.set(b, (h.boardPoints.get(b) ?? 0) + v);
              for (const [b, v] of s.away) a.boardPoints.set(b, (a.boardPoints.get(b) ?? 0) + v);
            } else {
              h.boardAttributed = false;
              a.boardAttributed = false;
            }
          }
        } else {
          recordGame(h, p.awayId, p.homeResult, p.awayResult);
          recordGame(a, p.homeId, p.awayResult, p.homeResult);
          for (const g of p.games) {
            if (g.blackId > 0) get(g.blackId, 0).gamesWithBlack += 1;
          }
        }
      }
    }
    snapshots.push({
      round,
      rows: buildRows(acc, keyOf, { team, qualityMetric, tiebreakSystem, boardKeys }),
      estimated,
      secondaryBasis: basis
    });
  }
  return snapshots;
}
function recordGame(player, opponentId, myResult, opponentResult) {
  player.gamesPlayed += 1;
  player.opponents.push({ id: opponentId, myResult });
  if (myResult > opponentResult) player.wins += 1;
  else if (myResult === opponentResult) player.draws += 1;
  else player.losses += 1;
}
function matchPointsFor(myBoardPoints, opponentBoardPoints, mpv) {
  if (myBoardPoints > opponentBoardPoints) return mpv.win;
  if (myBoardPoints === opponentBoardPoints) return mpv.draw;
  return mpv.loss;
}
function recordMatch(team, myBoardPoints, opponentBoardPoints, mpv) {
  team.gamesPlayed += 1;
  team.matchPoints += matchPointsFor(myBoardPoints, opponentBoardPoints, mpv);
  if (myBoardPoints > opponentBoardPoints) team.wins += 1;
  else if (myBoardPoints === opponentBoardPoints) team.draws += 1;
  else team.losses += 1;
}
var BOARD_EPS = 1e-9;
function splitTeamMatch(p, homeWhiteOnOdd) {
  const home = /* @__PURE__ */ new Map();
  const away = /* @__PURE__ */ new Map();
  let hSum = 0;
  let aSum = 0;
  for (const g of p.games) {
    const [whitePts, blackPts] = calculatePoints(g.result);
    const homeIsWhite = g.tableNr % 2 === 1 === homeWhiteOnOdd;
    const hp = homeIsWhite ? whitePts : blackPts;
    const ap = homeIsWhite ? blackPts : whitePts;
    home.set(g.tableNr, hp);
    away.set(g.tableNr, ap);
    hSum += hp;
    aSum += ap;
  }
  const ok = Math.abs(hSum - p.homeResult) < BOARD_EPS && Math.abs(aSum - p.awayResult) < BOARD_EPS;
  return { home, away, ok };
}
function deriveTeamParity(matches) {
  let odd = 0;
  let even = 0;
  for (const p of matches) {
    const onOdd = splitTeamMatch(p, true);
    const onEven = splitTeamMatch(p, false);
    if (onOdd.ok && !onEven.ok) odd += 1;
    else if (onEven.ok && !onOdd.ok) even += 1;
  }
  return { homeWhiteOnOdd: odd >= even, known: odd > 0 || even > 0 };
}
function teamBoardKeys(boards) {
  const sorted = [...boards].sort((a, b) => a - b);
  const n = sorted.length;
  if (n < 2) return [];
  const half = Math.floor(n / 2);
  const keys = [sorted.slice(0, half)];
  for (let i = half; i < n - 1; i++) keys.push([sorted[i]]);
  return keys;
}
function resolveTeams(accs, boardKeys) {
  const oppKey = (a) => `${a.contenderId}:${a.teamNumber}`;
  const inbordes = (grp, field) => (t) => {
    let s = 0;
    for (const o of grp) if (o !== t) s += t[field].get(oppKey(o)) ?? 0;
    return s;
  };
  const criteria = [
    { score: () => (t) => t.matchPoints, needsBoards: false },
    { score: () => (t) => t.points, needsBoards: false },
    { score: (grp) => inbordes(grp, "mpAgainst"), needsBoards: false },
    { score: (grp) => inbordes(grp, "bpAgainst"), needsBoards: false },
    ...boardKeys.map((bs) => ({
      score: () => (t) => bs.reduce((s, b) => s + (t.boardPoints.get(b) ?? 0), 0),
      needsBoards: true
    }))
  ];
  const partition = (grp, score) => {
    const sorted = [...grp].sort((a, b) => score(b) - score(a));
    const parts = [];
    for (const t of sorted) {
      const last = parts[parts.length - 1];
      if (last && score(last[0]) === score(t)) last.push(t);
      else parts.push([t]);
    }
    return parts;
  };
  const resolve = (grp) => {
    if (grp.length === 1) return [grp];
    const boardsOk = grp.every((t) => t.boardAttributed);
    for (const c of criteria) {
      if (c.needsBoards && !boardsOk) break;
      const parts = partition(grp, c.score(grp));
      if (parts.length > 1) return parts.flatMap(resolve);
    }
    return [[...grp].sort((a, b) => a.order - b.order)];
  };
  return resolve(accs);
}
function buildRows(acc, keyOf, opts) {
  const { team, qualityMetric, tiebreakSystem, boardKeys = [] } = opts;
  const useSsf = !team && tiebreakSystem !== void 0 && isSsfSecPointsSupported(tiebreakSystem);
  const berger = !team && qualityMetric === "sonneborn-berger";
  const rows = [];
  const resultsAgainst = /* @__PURE__ */ new Map();
  const blackOf = /* @__PURE__ */ new Map();
  for (const a of acc.values()) {
    let qualityPoints;
    if (!team) {
      const opponentScores = [];
      const sbContributions = [];
      if (berger) {
        const r = /* @__PURE__ */ new Map();
        for (const opp of a.opponents) r.set(opp.id, (r.get(opp.id) ?? 0) + opp.myResult);
        resultsAgainst.set(a.contenderId, r);
        blackOf.set(a.contenderId, a.gamesWithBlack);
      }
      for (const opp of a.opponents) {
        const oppScore = acc.get(keyOf(opp.id, 0))?.points ?? 0;
        opponentScores.push(oppScore);
        sbContributions.push({ opponentScore: oppScore, myResult: opp.myResult });
      }
      const byeFictiveScores = a.byeResults.map((br) => a.points - br);
      const ssf = useSsf ? computeSsfSecPoints(tiebreakSystem, {
        opponentScores,
        sbContributions,
        wins: a.wins,
        gamesWithBlack: a.gamesWithBlack,
        byeFictiveScores
      }) : null;
      qualityPoints = ssf ?? (qualityMetric === "sonneborn-berger" ? sbContributions.reduce((s, c) => s + c.opponentScore * c.myResult, 0) : opponentScores.reduce((s, x) => s + x, 0));
    }
    rows.push({
      contenderId: a.contenderId,
      teamNumber: team ? a.teamNumber : void 0,
      rank: 0,
      points: a.points,
      matchPoints: team ? a.matchPoints : void 0,
      qualityPoints,
      wins: a.wins,
      draws: a.draws,
      losses: a.losses,
      gamesPlayed: a.gamesPlayed
    });
  }
  if (team) {
    const classes = resolveTeams([...acc.values()], boardKeys);
    const rankOf = /* @__PURE__ */ new Map();
    const orderIndex = /* @__PURE__ */ new Map();
    let placed = 0;
    let idx = 0;
    for (const cls of classes) {
      const rank = placed + 1;
      for (const a of cls) {
        const k = keyOf(a.contenderId, a.teamNumber);
        rankOf.set(k, rank);
        orderIndex.set(k, idx++);
      }
      placed += cls.length;
    }
    const rowKey = (r) => keyOf(r.contenderId, r.teamNumber ?? 0);
    rows.sort((a, b) => orderIndex.get(rowKey(a)) - orderIndex.get(rowKey(b)));
    for (const r of rows) r.rank = rankOf.get(rowKey(r));
    return rows;
  }
  const inbordesOf = /* @__PURE__ */ new Map();
  if (berger) {
    const idsByPoints = /* @__PURE__ */ new Map();
    for (const r of rows) {
      const g = idsByPoints.get(r.points) ?? [];
      g.push(r.contenderId);
      idsByPoints.set(r.points, g);
    }
    for (const r of rows) {
      const group = idsByPoints.get(r.points);
      const mine = resultsAgainst.get(r.contenderId);
      let s = 0;
      if (mine && group.length > 1) {
        for (const other of group) if (other !== r.contenderId) s += mine.get(other) ?? 0;
      }
      inbordesOf.set(r.contenderId, s);
    }
  }
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (berger) {
      const ia = inbordesOf.get(a.contenderId) ?? 0;
      const ib = inbordesOf.get(b.contenderId) ?? 0;
      if (ib !== ia) return ib - ia;
      if (b.qualityPoints !== a.qualityPoints) return b.qualityPoints - a.qualityPoints;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (blackOf.get(b.contenderId) ?? 0) - (blackOf.get(a.contenderId) ?? 0);
    }
    if (b.qualityPoints !== a.qualityPoints) return b.qualityPoints - a.qualityPoints;
    return 0;
  });
  const tiedWithPrev = (prev, row) => {
    if (berger) {
      return prev.points === row.points && inbordesOf.get(prev.contenderId) === inbordesOf.get(row.contenderId) && prev.qualityPoints === row.qualityPoints && prev.wins === row.wins && blackOf.get(prev.contenderId) === blackOf.get(row.contenderId);
    }
    return prev.points === row.points && prev.qualityPoints === row.qualityPoints;
  };
  rows.forEach((row, i) => {
    row.rank = i === 0 ? 1 : tiedWithPrev(rows[i - 1], row) ? rows[i - 1].rank : i + 1;
  });
  return rows;
}

// src/utils/tournamentGroupUtils.ts
function findGroupInClasses(classes, groupId) {
  for (const tournamentClass of classes) {
    const group = tournamentClass.groups?.find((g) => g.id === groupId);
    if (group) {
      return { group, parentClass: tournamentClass };
    }
    if (tournamentClass.subClasses && tournamentClass.subClasses.length > 0) {
      const foundInSubclass = findGroupInClasses(tournamentClass.subClasses, groupId);
      if (foundInSubclass) {
        return foundInSubclass;
      }
    }
  }
  return null;
}
function findTournamentGroup(tournament, groupId) {
  if (!tournament.rootClasses || tournament.rootClasses.length === 0) {
    return null;
  }
  const result = findGroupInClasses(tournament.rootClasses, groupId);
  if (!result) {
    return null;
  }
  const hasMultipleClasses = tournament.rootClasses.length > 1 || tournament.rootClasses.some(
    (rootClass) => rootClass.subClasses && rootClass.subClasses.length > 0
  );
  return {
    group: result.group,
    parentClass: result.parentClass,
    hasMultipleClasses
  };
}
function getGroupName(tournament, groupId) {
  const result = findTournamentGroup(tournament, groupId);
  return result?.group.name || "";
}

// src/services/results.ts
var ResultsService = class extends BaseApiService {
  constructor(baseUrl, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  // Tournament Results API methods
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
  async getTournamentResults(groupId, options) {
    const endpoint = `/tournamentresults/table/id/${groupId}`;
    return this.get(endpoint, options);
  }
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
  async getTournamentRoundResults(groupId, options) {
    const endpoint = `/tournamentresults/roundresults/id/${groupId}`;
    return this.get(endpoint, options);
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
   * Returns every round's snapshot; for a single round just
   * `result.data?.find(s => s.round === n)`.
   *
   * @param groupId - Tournament group ID
   * @param options - Per-request options (e.g. timeoutMs), applied to every
   *   underlying request this method makes.
   * @returns One standings snapshot per round, ordered by round ascending
   */
  async getRoundStandings(groupId, options) {
    let mode = "individual";
    let qualityMetric = "buchholz";
    let tiebreakSystem;
    const tournament = await new TournamentService(this.baseUrl).getTournamentFromGroup(groupId, options);
    if (tournament.data) {
      mode = isTeamPairing(tournament.data.type) ? "team" : "individual";
      if (mode === "individual") {
        const group = findTournamentGroup(tournament.data, groupId);
        tiebreakSystem = group?.group.tiebreakSystem;
        if (group?.group.pairingSystemMember === PairingSystem.BERGER) {
          qualityMetric = "sonneborn-berger";
        }
      }
    }
    const roundResults = mode === "team" ? await this.getTeamRoundResults(groupId, options) : await this.getTournamentRoundResults(groupId, options);
    if (roundResults.error || !roundResults.data) {
      return {
        error: roundResults.error ?? "No round results",
        status: roundResults.status,
        message: "Error"
      };
    }
    const snapshots = computeRoundStandings(roundResults.data, { mode, qualityMetric, tiebreakSystem });
    await this.verifyAgainstOfficial(groupId, mode, snapshots, options);
    return { data: snapshots, status: roundResults.status, message: "Success" };
  }
  /**
   * Check our reconstructed final-round ordering against the official standings
   * table and, when it matches, mark estimated snapshots as `'verified'`. Pure
   * upgrade: never downgrades (a missing official row or table is ignored).
   */
  async verifyAgainstOfficial(groupId, mode, snapshots, options) {
    if (snapshots.length === 0) return;
    const finalRows = snapshots[snapshots.length - 1].rows;
    if (finalRows.length === 0) return;
    const key = (contenderId, teamNumber) => mode === "team" ? `${contenderId}:${teamNumber}` : `${contenderId}`;
    const officialPlace = /* @__PURE__ */ new Map();
    if (mode === "team") {
      const table = await this.getTeamTournamentResults(groupId, options);
      if (!table.data) return;
      for (const r of table.data) officialPlace.set(key(r.contenderId, r.teamNumber), r.place);
    } else {
      const table = await this.getTournamentResults(groupId, options);
      if (!table.data) return;
      for (const r of table.data) officialPlace.set(key(r.contenderId), r.place);
    }
    const orderedKeys = finalRows.map((row) => key(row.contenderId, row.teamNumber));
    const matches = orderingMatchesOfficial(orderedKeys, officialPlace);
    if (mode === "team") {
      if (!matches) {
        for (const snap of snapshots) {
          snap.estimated = true;
          snap.secondaryBasis = "indicative";
        }
      }
      return;
    }
    if (matches) {
      const final = snapshots[snapshots.length - 1];
      if (final.estimated) {
        final.estimated = false;
        final.secondaryBasis = "verified";
      }
    }
  }
  /**
   * Get team tournament results by group ID
   * @param groupId - Tournament group ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Team tournament results with club standings
   */
  async getTeamTournamentResults(groupId, options) {
    const endpoint = `/tournamentresults/team/table/id/${groupId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get team tournament round results by group ID
   * @param groupId - Tournament group ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Team tournament round results
   */
  async getTeamRoundResults(groupId, options) {
    const endpoint = `/tournamentresults/team/roundresults/id/${groupId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get individual tournament results for a specific member
   * @param memberId - Member ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of tournament results for the member
   */
  async getMemberTournamentResults(memberId, options) {
    const endpoint = `/tournamentresults/table/memberid/${memberId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get team tournament round results for a specific member
   * @param groupId - Tournament group ID
   * @param memberId - Member ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Team tournament round results for the specific member
   */
  async getTeamMemberRoundResults(groupId, memberId, options) {
    const endpoint = `/tournamentresults/team/roundresults/id/${groupId}/memberid/${memberId}`;
    return this.get(endpoint, options);
  }
  /**
   * Get all games played by a member
   * Returns all games (individual and team tournaments) for the specified member.
   * Useful for player profiles showing complete game history.
   * @param memberId - Member ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of all games played by the member
   */
  async getMemberGames(memberId, options) {
    const endpoint = `/tournamentresults/game/memberid/${memberId}`;
    return this.get(endpoint, options);
  }
};

// src/services/ratings.ts
var RatingsService = class extends BaseApiService {
  constructor(baseUrl, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  // Rating List API methods
  /**
   * Get Swedish Chess Federation rating list
   * @param ratingDate - Date for the rating list
   * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
   * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the federation rating list
   */
  async getFederationRatingList(ratingDate, ratingType, category, options) {
    const formattedDate = this.formatDateToString(ratingDate);
    const endpoint = `/ratinglist/federation/date/${formattedDate}/ratingtype/${ratingType}/category/${category}`;
    return this.get(endpoint, options);
  }
  /**
   * Get district rating list
   * @param districtId - District ID
   * @param ratingDate - Date for the rating list
   * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
   * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the district rating list
   */
  async getDistrictRatingList(districtId, ratingDate, ratingType, category, options) {
    const formattedDate = this.formatDateToString(ratingDate);
    const endpoint = `/ratinglist/district/${districtId}/date/${formattedDate}/ratingtype/${ratingType}/category/${category}`;
    return this.get(endpoint, options);
  }
  /**
   * Get club rating list
   * @param clubId - Club ID
   * @param ratingDate - Date for the rating list
   * @param ratingType - Type of rating (Standard=1, Rapid=6, Blitz=7)
   * @param category - Player category (All=0, Juniors=1, Cadets=2, Veterans=4, Women=5, Minors=6, Youth=7)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the club rating list
   */
  async getClubRatingList(clubId, ratingDate, ratingType, category, options) {
    const formattedDate = this.formatDateToString(ratingDate);
    const endpoint = `/ratinglist/club/${clubId}/date/${formattedDate}/ratingtype/${ratingType}/category/${category}`;
    return this.get(endpoint, options);
  }
  /**
   * Helper method to get current federation rating list with sensible defaults
   * @param ratingType - Type of rating (defaults to Standard)
   * @param category - Player category (defaults to All)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the current federation rating list
   */
  async getCurrentFederationRatingList(ratingType = 1 /* STANDARD */, category = 0 /* ALL */, options) {
    const currentDate = /* @__PURE__ */ new Date();
    return this.getFederationRatingList(currentDate, ratingType, category, options);
  }
  /**
   * Helper method to get current club rating list with sensible defaults
   * @param clubId - Club ID
   * @param ratingType - Type of rating (defaults to Standard)
   * @param category - Player category (defaults to All)
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Array of players in the current club rating list
   */
  async getCurrentClubRatingList(clubId, ratingType = 1 /* STANDARD */, category = 0 /* ALL */, options) {
    const currentDate = /* @__PURE__ */ new Date();
    return this.getClubRatingList(clubId, currentDate, ratingType, category, options);
  }
};

// src/services/registration.ts
var RegistrationService = class extends BaseApiService {
  constructor(baseUrl, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  // Tournament Team Registration API method
  /**
   * Get registered players for a tournament team from a specific club
   * @param tournamentId - Tournament ID
   * @param clubId - Club ID
   * @param options - Per-request options (e.g. timeoutMs)
   * @returns Team registration information with list of registered players
   */
  async getTeamRegistration(tournamentId, clubId, options) {
    const endpoint = `/tournamentteamregistration/tournament/${tournamentId}/club/${clubId}`;
    return this.get(endpoint, options);
  }
};

// src/services/fide.ts
var FideService = class extends BaseApiService {
  constructor(baseUrl = CHESSTOOLS_API_URL, timeoutMs) {
    super(baseUrl, void 0, timeoutMs);
  }
  /**
   * Get top players by classical rating
   * @param limit - Number of players to return (default: 100)
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getTopByRating(limit, options) {
    const params = limit !== void 0 ? `?limit=${limit}` : "";
    return this.get(`/fide/top_by_rating${params}`, options);
  }
  /**
   * Get top active players
   * @param limit - Number of players to return
   * @param history - Include rating history
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getTopActive(limit, history, options) {
    const params = new URLSearchParams();
    if (limit !== void 0) params.set("limit", String(limit));
    if (history !== void 0) params.set("history", String(history));
    const qs = params.toString();
    return this.get(`/fide/top_active/${qs ? `?${qs}` : ""}`, options);
  }
  /**
   * Get a single player by FIDE ID
   * @param fideId - The FIDE player ID
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getPlayer(fideId, options) {
    return this.get(`/fide/${fideId}`, options);
  }
  /**
   * Get detailed player info
   * @param fideId - The FIDE player ID
   * @param history - Include rating history
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getPlayerInfo(fideId, history, options) {
    const params = new URLSearchParams();
    params.set("fide_id", String(fideId));
    if (history !== void 0) params.set("history", String(history));
    return this.get(`/fide/player_info/?${params.toString()}`, options);
  }
  /**
   * Get full rating history for a player
   * @param fideId - The FIDE player ID
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async getPlayerHistory(fideId, options) {
    return this.get(`/fide/player_history/?fide_id=${fideId}`, options);
  }
  /**
   * Search for FIDE-rated players by name.
   *
   * @param query - Search string (name or partial name)
   * @param options - Per-request options (e.g. timeoutMs)
   */
  async searchPlayers(query, options) {
    const params = new URLSearchParams();
    params.set("query", query);
    params.set("list_type", "fide");
    return this.get(`/ratinglist/search?${params.toString()}`, options);
  }
};

// src/utils/ratingHistory.ts
function decimateRatingData(data, maxPoints) {
  if (data.length <= maxPoints || maxPoints < 2) return data;
  const result = [data[0]];
  const step = (data.length - 1) / (maxPoints - 1);
  for (let i = 1; i < maxPoints - 1; i++) {
    result.push(data[Math.round(i * step)]);
  }
  result.push(data[data.length - 1]);
  return result;
}
async function getPlayerRatingHistory(playerId, startMonth, endMonth, maxPoints) {
  const playerService = new PlayerService();
  try {
    const response = await playerService.getPlayerEloHistory(playerId, startMonth, endMonth);
    if (response.status !== 200 || !response.data) {
      return {
        status: response.status,
        error: response.error || "Failed to fetch rating history"
      };
    }
    const dataPoints = response.data.map((history) => ({
      date: formatDateForChart(history.elo.date),
      standard: history.elo.rating || void 0,
      rapid: history.elo.rapidRating || void 0,
      blitz: history.elo.blitzRating || void 0,
      lask: history.lask?.rating || void 0
    }));
    dataPoints.reverse();
    const finalData = maxPoints && maxPoints > 0 && dataPoints.length > maxPoints ? decimateRatingData(dataPoints, maxPoints) : dataPoints;
    return {
      status: 200,
      data: finalData
    };
  } catch (error) {
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to fetch rating history"
    };
  }
}
function formatDateForChart(dateString) {
  return dateString.substring(0, 7);
}

// src/utils/sortingUtils.ts
function sortTournamentEndResultsByPlace(results) {
  return [...results].sort((a, b) => {
    return a.place - b.place;
  });
}
function sortTournamentsByDate(tournaments) {
  return [...tournaments].sort((a, b) => {
    const dateA = new Date(a.end);
    const dateB = new Date(b.end);
    return dateB.getTime() - dateA.getTime();
  });
}

// src/utils/ratingUtils.ts
var RoundRatedType = {
  UNRATED: 0,
  STANDARD: 1,
  RAPID: 2,
  BLITZ: 3
};
function parseTimeControl(thinkingTime) {
  if (!thinkingTime) {
    return "standard";
  }
  const minutesMatch = thinkingTime.match(/(\d+)(?:\+(\d+))?\s*min/i);
  if (!minutesMatch) {
    return "standard";
  }
  const baseMinutes = parseInt(minutesMatch[1], 10);
  const additionalMinutes = minutesMatch[2] ? parseInt(minutesMatch[2], 10) : 0;
  const totalMinutes = baseMinutes + additionalMinutes;
  if (totalMinutes < 10) {
    return "blitz";
  } else if (totalMinutes <= 60) {
    return "rapid";
  } else {
    return "standard";
  }
}
function getPlayerRatingForTournament(elo, thinkingTime) {
  if (!elo) {
    return { rating: null, isFallback: false, ratingType: null };
  }
  const timeControl = parseTimeControl(thinkingTime);
  switch (timeControl) {
    case "standard":
      return {
        rating: elo.rating || null,
        isFallback: false,
        ratingType: elo.rating ? "standard" : null
      };
    case "rapid":
      if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: false, ratingType: "rapid" };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true, ratingType: "standard" };
      }
      return { rating: null, isFallback: false, ratingType: null };
    case "blitz":
      if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: false, ratingType: "blitz" };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true, ratingType: "standard" };
      }
      return { rating: null, isFallback: false, ratingType: null };
  }
}
function formatPlayerRating(elo, thinkingTime) {
  const { rating, isFallback } = getPlayerRatingForTournament(elo, thinkingTime);
  if (rating === null) {
    return "-";
  }
  return `${rating}${isFallback ? " S" : ""}`;
}
function formatRatingWithType(rating, ratingType, language = "sv") {
  if (rating === null) {
    return "-";
  }
  let suffix = "";
  if (ratingType) {
    switch (ratingType) {
      case "standard":
        suffix = "";
        break;
      case "rapid":
        suffix = language === "sv" ? " S" : " R";
        break;
      case "blitz":
        suffix = " B";
        break;
      case "lask":
        suffix = " L";
        break;
    }
  }
  return `${rating}${suffix}`;
}
function isJuniorPlayer(birthdate, gameDate) {
  if (!birthdate) return false;
  try {
    const birth = new Date(birthdate);
    if (isNaN(birth.getTime())) return false;
    const gameYear = gameDate ? typeof gameDate === "number" ? new Date(gameDate).getFullYear() : gameDate.getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
    const ageAtEndOfYear = gameYear - birth.getFullYear();
    return ageAtEndOfYear <= 18;
  } catch {
    return false;
  }
}
function birthYearOf(birthdate) {
  if (!birthdate) return null;
  const year = Number.parseInt(String(birthdate).slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}
function chessAge(birthdate, tournamentYear) {
  const birthYear = birthYearOf(birthdate);
  return birthYear === null ? null : tournamentYear - birthYear;
}
function getKFactorForRating(ratingType, playerRating, playerElo, birthdate, gameDate) {
  if (!ratingType || !playerRating) {
    return 20;
  }
  if (birthdate && playerRating < 2300 && isJuniorPlayer(birthdate, gameDate)) {
    return 40;
  }
  switch (ratingType) {
    case "rapid":
    case "blitz":
      return playerRating >= 2400 ? 10 : 20;
    case "standard":
    case "lask":
      if (playerElo?.k) {
        return playerElo.k;
      }
      return playerRating >= 2400 ? 10 : 20;
    default:
      return 20;
  }
}
function getPlayerRatingByAlgorithm(elo, rankingAlgorithm) {
  if (!elo) {
    return { rating: null, isFallback: false, ratingType: null };
  }
  if (!rankingAlgorithm) {
    return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? "standard" : null };
  }
  switch (rankingAlgorithm) {
    case RatingAlgorithm.STANDARD_ELO:
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? "standard" : null };
    case RatingAlgorithm.RAPID_ELO:
      return { rating: elo.rapidRating || null, isFallback: false, ratingType: elo.rapidRating ? "rapid" : null };
    case RatingAlgorithm.BLITZ_ELO:
      return { rating: elo.blitzRating || null, isFallback: false, ratingType: elo.blitzRating ? "blitz" : null };
    case RatingAlgorithm.IF_ELO_THEN_ELO_OTHERWISE_LASK:
      if (elo.rating) {
        return { rating: elo.rating, isFallback: false, ratingType: "standard" };
      }
      return { rating: null, isFallback: false, ratingType: null };
    case RatingAlgorithm.LASK:
      return { rating: null, isFallback: false, ratingType: null };
    case RatingAlgorithm.MAX_ELO_LASK:
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? "standard" : null };
    case RatingAlgorithm.BLITZ_STANDARD_RAPID_ELO:
      if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: false, ratingType: "blitz" };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true, ratingType: "standard" };
      } else if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: true, ratingType: "rapid" };
      }
      return { rating: null, isFallback: false, ratingType: null };
    case RatingAlgorithm.STANDARD_RAPID_BLITZ_ELO:
      if (elo.rating) {
        return { rating: elo.rating, isFallback: false, ratingType: "standard" };
      } else if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: true, ratingType: "rapid" };
      } else if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: true, ratingType: "blitz" };
      }
      return { rating: null, isFallback: false, ratingType: null };
    case RatingAlgorithm.RAPID_STANDARD_BLITZ_ELO:
      if (elo.rapidRating) {
        return { rating: elo.rapidRating, isFallback: false, ratingType: "rapid" };
      } else if (elo.rating) {
        return { rating: elo.rating, isFallback: true, ratingType: "standard" };
      } else if (elo.blitzRating) {
        return { rating: elo.blitzRating, isFallback: true, ratingType: "blitz" };
      }
      return { rating: null, isFallback: false, ratingType: null };
    case RatingAlgorithm.NO_RATING:
      return { rating: null, isFallback: false, ratingType: null };
    default:
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? "standard" : null };
  }
}
function getRatingTypeFromRoundRated(rated) {
  switch (rated) {
    case RoundRatedType.STANDARD:
      return "standard";
    case RoundRatedType.RAPID:
      return "rapid";
    case RoundRatedType.BLITZ:
      return "blitz";
    case RoundRatedType.UNRATED:
    default:
      return null;
  }
}
function getPlayerRatingByRoundType(elo, roundRatedType) {
  const ratingType = getRatingTypeFromRoundRated(roundRatedType);
  if (!elo || !ratingType) {
    return { rating: null, isFallback: false, ratingType: null };
  }
  switch (ratingType) {
    case "standard":
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? "standard" : null };
    case "rapid":
      return { rating: elo.rapidRating || null, isFallback: false, ratingType: elo.rapidRating ? "rapid" : null };
    case "blitz":
      return { rating: elo.blitzRating || null, isFallback: false, ratingType: elo.blitzRating ? "blitz" : null };
    default:
      return { rating: null, isFallback: false, ratingType: null };
  }
}
function getPrimaryRatingType(rankingAlgorithm) {
  switch (rankingAlgorithm) {
    case RatingAlgorithm.STANDARD_ELO:
    case RatingAlgorithm.IF_ELO_THEN_ELO_OTHERWISE_LASK:
    case RatingAlgorithm.MAX_ELO_LASK:
    case RatingAlgorithm.STANDARD_RAPID_BLITZ_ELO:
      return "standard";
    case RatingAlgorithm.RAPID_ELO:
    case RatingAlgorithm.RAPID_STANDARD_BLITZ_ELO:
      return "rapid";
    case RatingAlgorithm.BLITZ_ELO:
    case RatingAlgorithm.BLITZ_STANDARD_RAPID_ELO:
      return "blitz";
    case RatingAlgorithm.LASK:
      return "lask";
    case RatingAlgorithm.NO_RATING:
    default:
      return null;
  }
}
function getPlayerRatingStrict(elo, rankingAlgorithm) {
  if (!elo) return { rating: null, isFallback: false, ratingType: null };
  const ratingType = getPrimaryRatingType(rankingAlgorithm);
  if (!ratingType) return { rating: null, isFallback: false, ratingType: null };
  switch (ratingType) {
    case "standard":
      return { rating: elo.rating || null, isFallback: false, ratingType: elo.rating ? "standard" : null };
    case "rapid":
      return { rating: elo.rapidRating || null, isFallback: false, ratingType: elo.rapidRating ? "rapid" : null };
    case "blitz":
      return { rating: elo.blitzRating || null, isFallback: false, ratingType: elo.blitzRating ? "blitz" : null };
    default:
      return { rating: null, isFallback: false, ratingType: null };
  }
}
function formatPlayerName(firstName, lastName, title) {
  const fullName = `${firstName} ${lastName}`;
  if (title && title.trim()) {
    return `${title} ${fullName}`;
  }
  return fullName;
}
var Sex = {
  /**
   * Male — but also the value you get from a fabricated/placeholder player, so
   * reading `sex === 0` from arbitrary data does not prove male (there is
   * deliberately no `isMale`; this constant is for constructing/labelling).
   */
  MALE: 0,
  /** Female. Girls-only groups are uniformly this value. */
  FEMALE: 1,
  /**
   * Unrecorded — the field was never filled in (common in bulk school-club
   * registrations); a gender mix, **not** female. Meaning inferred, to be
   * confirmed with schack.se.
   */
  UNRECORDED: 2,
  /**
   * Not a real member — synthetic walkover/"Frirond" row (member id `-100`).
   * Meaning inferred, to be confirmed with schack.se.
   */
  NON_MEMBER: -1
};
function isFemale(player) {
  return player?.sex === Sex.FEMALE;
}

// src/utils/eloCalculations.ts
var RATING_DIFFERENCE_CAP = 400;
function calculateExpectedScore(playerRating, opponentRating) {
  let ratingDiff = opponentRating - playerRating;
  if (ratingDiff > RATING_DIFFERENCE_CAP) {
    ratingDiff = RATING_DIFFERENCE_CAP;
  } else if (ratingDiff < -RATING_DIFFERENCE_CAP) {
    ratingDiff = -RATING_DIFFERENCE_CAP;
  }
  return 1 / (1 + Math.pow(10, ratingDiff / 400));
}
function calculateRatingChange(playerRating, opponentRating, actualScore, kFactor) {
  const expectedScore = calculateExpectedScore(playerRating, opponentRating);
  const ratingChange = kFactor * (actualScore - expectedScore);
  return Math.round(ratingChange * 10) / 10;
}
function calculatePerformanceRating(opponentRatings, score) {
  if (opponentRatings.length === 0) {
    return 0;
  }
  const averageOpponentRating = opponentRatings.reduce((sum, rating) => sum + rating, 0) / opponentRatings.length;
  const scorePercentage = score / opponentRatings.length;
  if (scorePercentage === 1) {
    return Math.round(averageOpponentRating + 800);
  }
  if (scorePercentage === 0) {
    return Math.round(averageOpponentRating - 800);
  }
  const ratingDifference = -400 * Math.log10(1 / scorePercentage - 1);
  const performanceRating = averageOpponentRating + ratingDifference;
  return Math.round(performanceRating);
}
function calculateTournamentStats(matches, playerRating, kFactor) {
  let totalChange = 0;
  const ratedOpponentRatings = [];
  let totalScore = 0;
  for (const match of matches) {
    if (match.opponentRating && match.opponentRating > 0) {
      const change = calculateRatingChange(
        playerRating,
        match.opponentRating,
        match.actualScore,
        kFactor
      );
      totalChange += change;
      ratedOpponentRatings.push(match.opponentRating);
      totalScore += match.actualScore;
    }
  }
  const performanceRating = calculatePerformanceRating(ratedOpponentRatings, totalScore);
  return {
    totalChange: Math.round(totalChange * 10) / 10,
    // Round to 1 decimal
    performanceRating,
    gamesWithRatedOpponents: ratedOpponentRatings.length
  };
}

// src/utils/prizeCategories.ts
var PrizeCategoryType = {
  /** Age band. `start`/`end` are ages (see {@link chessAge}). */
  AGE: 1,
  /** Women's prize ("DAM"). Matched as "is female"; any `start`/`end` bounds
   *  are present in the data but not applied (see resolvePrizeMembers). */
  WOMEN: 2,
  /** Senior/veteran ("VETERAN"). Bounds are ignored; the rule is age ≥ 60. */
  SENIOR: 3,
  /** Rating band ("RANKING"). `start`/`end` are Elo bounds, inclusive. */
  RATING: 4,
  /** SM class ("SM-KLASS"). Only ever seen as a registration restriction. */
  SMCLASS: 5
};
var USAGE_PRIZE = 1;
var SeniorAgeLimit = {
  WOMEN: 60,
  MALE: 60
};
function isPrizeCategory(category) {
  return category.usagetype === USAGE_PRIZE;
}
function parsePrizeCategory(category) {
  switch (category.type) {
    case PrizeCategoryType.RATING:
      return { kind: "rating", min: category.start, max: category.end };
    case PrizeCategoryType.AGE:
      return { kind: "age", minAge: category.start, maxAge: category.end };
    case PrizeCategoryType.SENIOR:
      return { kind: "senior" };
    case PrizeCategoryType.WOMEN:
      return { kind: "women" };
    case PrizeCategoryType.SMCLASS:
      return { kind: "smclass" };
    default:
      return { kind: "unknown", type: category.type };
  }
}
function withinBand(value, min, max) {
  return value != null && value >= min && value <= max;
}
function resolvePrizeMembers(category, results, opts) {
  if (!isPrizeCategory(category)) return [];
  const { tournamentYear, rankingAlgorithm } = opts;
  const rule = parsePrizeCategory(category);
  const ids = [];
  for (const row of results) {
    if (row.contenderId < 0) continue;
    const player = row.playerInfo;
    if (!player) continue;
    const inRatingBand = (min, max) => {
      const rating = getPlayerRatingByAlgorithm(player.elo, rankingAlgorithm).rating;
      return rating == null ? min === 0 : withinBand(rating, min, max);
    };
    let eligible = false;
    switch (rule.kind) {
      case "rating":
        eligible = inRatingBand(rule.min, rule.max);
        break;
      case "age": {
        const age = chessAge(player.birthdate, tournamentYear);
        eligible = withinBand(age, rule.minAge, rule.maxAge);
        break;
      }
      case "senior": {
        const age = chessAge(player.birthdate, tournamentYear);
        const limit = isFemale(player) ? SeniorAgeLimit.WOMEN : SeniorAgeLimit.MALE;
        eligible = age != null && age >= limit;
        break;
      }
      case "women":
        eligible = isFemale(player);
        break;
      case "smclass":
      case "unknown":
        eligible = false;
        break;
    }
    if (eligible) ids.push(row.contenderId);
  }
  return ids;
}

// src/utils/dateUtils.ts
function getMonthStart(timestamp) {
  const d = new Date(timestamp);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}
function getMonthStartString(timestamp) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function normalizeEloLookupDate(timestamp) {
  const requestedMonthStart = getMonthStart(timestamp);
  const currentMonthStart = getMonthStart(Date.now());
  if (requestedMonthStart > currentMonthStart) {
    return currentMonthStart;
  }
  return requestedMonthStart;
}
function getPlayerDateCacheKey(playerId, timestamp) {
  const monthStart = getMonthStartString(timestamp);
  return `${playerId}-${monthStart}`;
}
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// src/utils/tournamentStatus.ts
function deriveStatus(input, now) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const toMs = (d) => {
    if (!d) return null;
    const parsed = parseLocalDate(d).getTime();
    return Number.isNaN(parsed) ? null : parsed;
  };
  const startMs = toMs(input.start);
  const endMs = toMs(input.end);
  if (input.hasRoundResults) {
    return endMs !== null && todayMs > endMs ? "finished" : "ongoing";
  }
  if (endMs !== null && todayMs > endMs) return "finished";
  if (startMs !== null && todayMs < startMs) return "upcoming";
  if (input.state === TournamentState.REGISTRATION) return "upcoming";
  if (startMs !== null || endMs !== null) return "ongoing";
  if (input.state === TournamentState.STARTED) return "ongoing";
  if (input.state === TournamentState.FINISHED) return "finished";
  return "unknown";
}
function normalize(source) {
  const isBag = source != null && ("tournament" in source || "group" in source || "roundResults" in source);
  const bag = isBag ? source : { tournament: source };
  const { tournament, group, roundResults } = bag;
  return {
    start: group?.start ?? tournament?.start,
    end: group?.end ?? tournament?.end,
    state: tournament?.state,
    hasRoundResults: (roundResults?.length ?? 0) > 0
  };
}
function getTournamentStatus(source, now = /* @__PURE__ */ new Date()) {
  return deriveStatus(normalize(source), now);
}
function isUpcoming(source, now) {
  return getTournamentStatus(source, now) === "upcoming";
}
function isOngoing(source, now) {
  return getTournamentStatus(source, now) === "ongoing";
}
function isFinished(source, now) {
  return getTournamentStatus(source, now) === "finished";
}

// src/utils/teamFormatting.ts
function toRomanNumeral(num) {
  if (num <= 0 || num > 20) {
    return num.toString();
  }
  const romanNumerals = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"]
  ];
  let result = "";
  let remaining = num;
  for (const [value, numeral] of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }
  return result;
}
function countTeamsByClub(results) {
  const teamCounts = /* @__PURE__ */ new Map();
  results.forEach((result) => {
    const existing = teamCounts.get(result.contenderId) || /* @__PURE__ */ new Set();
    existing.add(result.teamNumber);
    teamCounts.set(result.contenderId, existing);
  });
  const counts = /* @__PURE__ */ new Map();
  teamCounts.forEach((teamNumbers, clubId) => {
    counts.set(clubId, teamNumbers.size);
  });
  return counts;
}
function formatTeamName(clubName, teamNumber, clubTeamCount) {
  if (teamNumber > 1 || clubTeamCount > 1) {
    return `${clubName} ${toRomanNumeral(teamNumber)}`;
  }
  return clubName;
}
function createTeamNameFormatter(results, getClubName) {
  const teamCounts = countTeamsByClub(results);
  return (clubId, teamNumber) => {
    const clubName = getClubName(clubId);
    const teamCount = teamCounts.get(clubId) || 1;
    return formatTeamName(clubName, teamNumber, teamCount);
  };
}
function countTeamsFromRoundResults(roundResults) {
  const teamCounts = /* @__PURE__ */ new Map();
  roundResults.forEach((result) => {
    const homeExisting = teamCounts.get(result.homeId) || /* @__PURE__ */ new Set();
    homeExisting.add(result.homeTeamNumber);
    teamCounts.set(result.homeId, homeExisting);
    const awayExisting = teamCounts.get(result.awayId) || /* @__PURE__ */ new Set();
    awayExisting.add(result.awayTeamNumber);
    teamCounts.set(result.awayId, awayExisting);
  });
  const counts = /* @__PURE__ */ new Map();
  teamCounts.forEach((teamNumbers, clubId) => {
    counts.set(clubId, teamNumbers.size);
  });
  return counts;
}
function createRoundResultsTeamNameFormatter(roundResults, getClubName) {
  const teamCounts = countTeamsFromRoundResults(roundResults);
  return (clubId, teamNumber) => {
    const clubName = getClubName(clubId);
    const teamCount = teamCounts.get(clubId) || 1;
    return formatTeamName(clubName, teamNumber, teamCount);
  };
}

// src/utils/opponentStats.ts
function calculatePlayerResult(game, playerId) {
  const isWhite = game.whiteId === playerId;
  return getPlayerOutcome(game.result, isWhite);
}
function calculatePlayerPoints(game, playerId) {
  const isWhite = game.whiteId === playerId;
  return getPlayerPoints(game.result, isWhite);
}
function getGroupRatingType(groupId, tournamentMap) {
  const tournament = tournamentMap.get(groupId);
  if (!tournament) return "standard";
  const groupResult = findTournamentGroup(tournament, groupId);
  if (!groupResult) return "standard";
  const ratingType = getPrimaryRatingType(groupResult.group.rankingAlgorithm);
  if (!ratingType) return "unrated";
  if (ratingType === "lask") return "standard";
  return ratingType;
}
function filterGamesByTimeControl(games, tournamentMap, timeControl) {
  if (timeControl === "all") {
    return games;
  }
  return games.filter((game) => {
    return getGroupRatingType(game.groupiD, tournamentMap) === timeControl;
  });
}
function calculateStatsByColor(games, playerId) {
  const all = { wins: 0, draws: 0, losses: 0 };
  const white = { wins: 0, draws: 0, losses: 0 };
  const black = { wins: 0, draws: 0, losses: 0 };
  games.forEach((game) => {
    const result = calculatePlayerResult(game, playerId);
    if (result === null) return;
    const isWhite = game.whiteId === playerId;
    if (result === "win") all.wins++;
    else if (result === "draw") all.draws++;
    else all.losses++;
    if (isWhite) {
      if (result === "win") white.wins++;
      else if (result === "draw") white.draws++;
      else white.losses++;
    } else {
      if (result === "win") black.wins++;
      else if (result === "draw") black.draws++;
      else black.losses++;
    }
  });
  return { all, white, black };
}
function aggregateOpponentStats(games, playerId, playerMap, tournamentMap) {
  const opponentRecords = /* @__PURE__ */ new Map();
  games.forEach((game) => {
    const opponentId = game.whiteId === playerId ? game.blackId : game.whiteId;
    if (opponentId === -1) return;
    const result = calculatePlayerResult(game, playerId);
    if (result === null) return;
    const record = opponentRecords.get(opponentId) || {
      wins: 0,
      draws: 0,
      losses: 0,
      groupIds: /* @__PURE__ */ new Set()
    };
    if (result === "win") record.wins++;
    else if (result === "draw") record.draws++;
    else record.losses++;
    record.groupIds.add(game.groupiD);
    opponentRecords.set(opponentId, record);
  });
  const stats = [];
  opponentRecords.forEach((record, opponentId) => {
    const opponent = playerMap.get(opponentId);
    const opponentName = opponent ? formatPlayerName(opponent.firstName, opponent.lastName, opponent.elo?.title) : `Unknown Player (${opponentId})`;
    const opponentRating = opponent && opponent.elo ? formatPlayerRating(opponent.elo, null) : "-";
    const tournaments = Array.from(record.groupIds).map((groupId) => {
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
function sortOpponentStats(stats, sortBy) {
  const sorted = [...stats];
  switch (sortBy) {
    case "games":
      sorted.sort((a, b) => b.totalGames - a.totalGames);
      break;
    case "name":
      sorted.sort((a, b) => a.opponentName.localeCompare(b.opponentName));
      break;
    case "winRate":
      sorted.sort((a, b) => {
        const aRate = a.totalGames > 0 ? a.wins / a.totalGames : 0;
        const bRate = b.totalGames > 0 ? b.wins / b.totalGames : 0;
        return bRate - aRate;
      });
      break;
  }
  return sorted;
}
function formatGameResult2(result) {
  return getResultDisplayString(result);
}
function gamesToDisplayFormat(games, playerId, playerMap, tournamentMap, currentPlayerName, playersLoading = false, retrievingText = "Retrieving", unknownText = "Unknown", includeWalkovers = false) {
  const displayGames = [];
  games.forEach((game) => {
    if (isWalkoverResultCode(game.result)) {
      if (!includeWalkovers) return;
    } else if (!isCountableResult(game.result)) {
      return;
    }
    if (game.whiteId < 0 || game.blackId < 0) return;
    const whitePlayer = game.whiteId === playerId ? null : playerMap.get(game.whiteId);
    const blackPlayer = game.blackId === playerId ? null : playerMap.get(game.blackId);
    const whiteName = game.whiteId === playerId ? currentPlayerName : whitePlayer ? formatPlayerName(whitePlayer.firstName, whitePlayer.lastName, whitePlayer.elo?.title) : playersLoading ? `${retrievingText} (${game.whiteId})` : `${unknownText} (${game.whiteId})`;
    const blackName = game.blackId === playerId ? currentPlayerName : blackPlayer ? formatPlayerName(blackPlayer.firstName, blackPlayer.lastName, blackPlayer.elo?.title) : playersLoading ? `${retrievingText} (${game.blackId})` : `${unknownText} (${game.blackId})`;
    const tournament = tournamentMap.get(game.groupiD);
    displayGames.push({
      gameId: game.id,
      whiteId: game.whiteId,
      whiteName,
      blackId: game.blackId,
      blackName,
      result: formatGameResult2(game.result),
      resultCode: game.result,
      groupId: game.groupiD,
      tournamentId: tournament?.id || 0,
      tournamentName: tournament?.name || `Group ${game.groupiD}`
    });
  });
  return displayGames.reverse();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  API_VERSION,
  API_VERSION_DEV,
  BaseApiService,
  CHESSTOOLS_API_URL,
  CURRENT_API_URL,
  DEFAULT_TIMEOUT,
  FideService,
  MemberCategory,
  OrganizationService,
  PairingSystem,
  PlayerCategory,
  PlayerService,
  PointSystem,
  PointValues,
  PrizeCategoryType,
  RATING_DIFFERENCE_CAP,
  RatingAlgorithm,
  RatingType,
  RatingsService,
  RegistrationService,
  ResultCode,
  ResultDisplay,
  ResultsService,
  RoundRatedType,
  SSF_DEV_API_URL,
  SSF_PROD_API_URL,
  Schack4anTeamPointSystem,
  Sex,
  TeamTournamentPlayerListType,
  TiebreakSystem,
  TournamentService,
  TournamentState,
  TournamentType,
  aggregateOpponentStats,
  birthYearOf,
  calculateExpectedScore,
  calculatePerformanceRating,
  calculatePlayerPoints,
  calculatePlayerResult,
  calculatePoints,
  calculateRatingChange,
  calculateStatsByColor,
  calculateTournamentStats,
  chessAge,
  chunkArray,
  configure,
  countTeamsByClub,
  countTeamsFromRoundResults,
  createRoundResultsTeamNameFormatter,
  createTeamNameFormatter,
  decimateRatingData,
  deduplicateIds,
  filterGamesByTimeControl,
  findTournamentGroup,
  formatGameResult,
  formatMatchResult,
  formatPlayerName,
  formatPlayerRating,
  formatRatingWithType,
  formatTeamName,
  gamesToDisplayFormat,
  getConfig,
  getGameOutcome,
  getGroupName,
  getKFactorForRating,
  getMonthStart,
  getMonthStartString,
  getOpponentKind,
  getPlayerDateCacheKey,
  getPlayerOutcome,
  getPlayerPoints,
  getPlayerRatingByAlgorithm,
  getPlayerRatingByRoundType,
  getPlayerRatingForTournament,
  getPlayerRatingHistory,
  getPlayerRatingStrict,
  getPointSystemFromResult,
  getPointSystemName,
  getPrimaryRatingType,
  getRatingTypeFromRoundRated,
  getResultDisplayString,
  getTiebreakSystemName,
  getTournamentStatus,
  isAdjudicatedResult,
  isBlackWin,
  isCountableResult,
  isDraw,
  isFemale,
  isFinished,
  isJuniorPlayer,
  isLooseTeamTournament,
  isOngoing,
  isPostponed,
  isPrizeCategory,
  isResultCodeInformative,
  isSchackfyran,
  isSchackfyranLike,
  isTeamPairing,
  isTeamTournament,
  isTouristBye,
  isUpcoming,
  isWalkover,
  isWalkoverResult,
  isWalkoverResultCode,
  isWhiteWin,
  normalizeEloLookupDate,
  parseGameResult,
  parseLocalDate,
  parsePrizeCategory,
  parseResultDisplay,
  parseTimeControl,
  resolveIndividualResult,
  resolvePrizeMembers,
  resolveTeamMatchResult,
  sortOpponentStats,
  sortTournamentEndResultsByPlace,
  sortTournamentsByDate,
  toRomanNumeral
});
