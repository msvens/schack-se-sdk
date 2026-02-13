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

// src/utils/index.ts
var utils_exports = {};
__export(utils_exports, {
  PointSystem: () => PointSystem,
  PointValues: () => PointValues,
  RATING_DIFFERENCE_CAP: () => RATING_DIFFERENCE_CAP,
  ResultCode: () => ResultCode,
  ResultDisplay: () => ResultDisplay,
  RoundRatedType: () => RoundRatedType,
  aggregateOpponentStats: () => aggregateOpponentStats,
  calculateExpectedScore: () => calculateExpectedScore,
  calculatePerformanceRating: () => calculatePerformanceRating,
  calculatePlayerPoints: () => calculatePlayerPoints,
  calculatePlayerResult: () => calculatePlayerResult,
  calculatePoints: () => calculatePoints,
  calculateRatingChange: () => calculateRatingChange,
  calculateStatsByColor: () => calculateStatsByColor,
  calculateTournamentStats: () => calculateTournamentStats,
  chunkArray: () => chunkArray,
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
  getGameOutcome: () => getGameOutcome,
  getGroupName: () => getGroupName,
  getKFactorForRating: () => getKFactorForRating,
  getMonthStart: () => getMonthStart,
  getMonthStartString: () => getMonthStartString,
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
  isBlackWin: () => isBlackWin,
  isCountableResult: () => isCountableResult,
  isDraw: () => isDraw,
  isJuniorPlayer: () => isJuniorPlayer,
  isTouristBye: () => isTouristBye,
  isWalkover: () => isWalkover,
  isWalkoverClub: () => isWalkoverClub,
  isWalkoverPlayer: () => isWalkoverPlayer,
  isWalkoverResult: () => isWalkoverResult,
  isWalkoverResultCode: () => isWalkoverResultCode,
  isWhiteWin: () => isWhiteWin,
  normalizeEloLookupDate: () => normalizeEloLookupDate,
  parseGameResult: () => parseGameResult,
  parseLocalDate: () => parseLocalDate,
  parseTimeControl: () => parseTimeControl,
  sortOpponentStats: () => sortOpponentStats,
  sortTournamentEndResultsByPlace: () => sortTournamentEndResultsByPlace,
  sortTournamentsByDate: () => sortTournamentsByDate,
  toRomanNumeral: () => toRomanNumeral
});
module.exports = __toCommonJS(utils_exports);

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

// src/utils/resultFormatting.ts
function isWalkoverPlayer(playerId) {
  return playerId < 0;
}
function isWalkoverClub(clubId) {
  return clubId < 0;
}
function isWalkoverResult(result) {
  return isWalkoverResultCode(result);
}
function isWalkover(homeId, awayId, result) {
  return isWalkoverPlayer(homeId) || isWalkoverPlayer(awayId) || result !== void 0 && isWalkoverResult(result);
}
function formatGameResult(result, whiteId, blackId) {
  const displayString = getResultDisplayString(result);
  if (isWalkoverResultCode(result) || isTouristBye(result)) {
    return displayString;
  }
  const hasWalkoverPlayer = whiteId !== void 0 && isWalkoverPlayer(whiteId) || blackId !== void 0 && isWalkoverPlayer(blackId);
  if (hasWalkoverPlayer && isCountableResult(result)) {
    return `${displayString} w.o`;
  }
  return displayString;
}
function formatMatchResult(homeResult, awayResult, homeId, awayId) {
  if (homeResult === void 0 || awayResult === void 0) {
    return "-";
  }
  const hasWalkover = homeId !== void 0 && isWalkoverPlayer(homeId) || awayId !== void 0 && isWalkoverPlayer(awayId);
  const resultStr = `${homeResult} - ${awayResult}`;
  return hasWalkover ? `${resultStr} w.o` : resultStr;
}

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

// src/constants.ts
var API_VERSION = "v1";
var API_VERSION_DEV = "v1";
var SSF_PROD_API_URL = `https://member.schack.se/public/api/${API_VERSION}`;
var SSF_DEV_API_URL = `https://halvarsson.no-ip.com/webapp/memdb/public/api/${API_VERSION_DEV}`;
var CURRENT_API_URL = SSF_PROD_API_URL;

// src/services/base.ts
var BaseApiService = class {
  constructor(baseUrl = CURRENT_API_URL, defaultHeaders) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders
    };
  }
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config = {
        headers: {
          ...this.defaultHeaders,
          ...options.headers
        },
        ...options
      };
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return {
        data,
        status: response.status,
        message: "Success"
      };
    } catch (error) {
      const apiError = {
        message: error instanceof Error ? error.message : "Unknown error occurred",
        status: 500
      };
      return {
        error: apiError.message,
        status: apiError.status,
        message: "Error"
      };
    }
  }
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : void 0
    });
  }
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : void 0
    });
  }
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
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

// src/services/players.ts
var PlayerService = class extends BaseApiService {
  constructor(baseUrl) {
    super(baseUrl);
  }
  // Player API methods
  /**
   * Get player information by SSF ID and date
   * @param playerId - The Swedish Chess Federation player ID (number)
   * @param date - Optional date (defaults to current date)
   *
   * @returns Player information
   */
  async getPlayerInfo(playerId, date) {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/${playerId}/date/${targetDate}`;
    return this.get(endpoint);
  }
  /**
   * Get player information by FIDE ID and date
   * @param fideId - The FIDE player ID (number)
   * @param date - Optional date (defaults to current date)
   * @returns Player information
   */
  async getPlayerByFIDEId(fideId, date) {
    const targetDate = date ? this.formatDateToString(date) : this.getCurrentDate();
    const endpoint = `/player/fideid/${fideId}/date/${targetDate}`;
    return this.get(endpoint);
  }
  /**
   * Search for players by first name and last name
   * @param fornamn - The first name (Swedish: fornamn)
   * @param efternamn - The last name (Swedish: efternamn)
   * @returns Array of matching players
   */
  async searchPlayer(fornamn, efternamn) {
    const endpoint = `/player/fornamn/${encodeURIComponent(fornamn)}/efternamn/${encodeURIComponent(efternamn)}`;
    return this.get(endpoint);
  }
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
  async getPlayerInfoBatch(playerIds, date, options = {}) {
    const { concurrency = 10 } = options;
    const chunks = chunkArray(playerIds, concurrency);
    const results = [];
    for (const chunk of chunks) {
      const responses = await Promise.allSettled(
        chunk.map((id) => this.getPlayerInfo(id, date))
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
  async getPlayerEloHistory(playerId, startMonth, endMonth) {
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
      const chunks = chunkArray(dates, 12);
      const ratingHistory = [];
      let shouldStop = false;
      for (const chunk of chunks) {
        if (shouldStop) break;
        const responses = await Promise.allSettled(
          chunk.map((date) => this.getPlayerInfo(playerId, date))
        );
        for (const response of responses) {
          if (response.status === "fulfilled" && response.value.status === 200 && response.value.data) {
            const player = response.value.data;
            const elo = player.elo;
            const lask = player.lask;
            const hasAnyRating = elo?.rating || elo?.rapidRating || elo?.blitzRating || lask?.rating;
            if (hasAnyRating) {
              ratingHistory.push({
                elo,
                lask
              });
            } else {
              shouldStop = true;
              break;
            }
          } else {
            shouldStop = true;
            break;
          }
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
  if (clubTeamCount <= 1) {
    return clubName;
  }
  return `${clubName} ${toRomanNumeral(teamNumber)}`;
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
function gamesToDisplayFormat(games, playerId, playerMap, tournamentMap, currentPlayerName, playersLoading = false, retrievingText = "Retrieving", unknownText = "Unknown") {
  const displayGames = [];
  games.forEach((game) => {
    if (!isCountableResult(game.result) || isWalkoverResultCode(game.result)) return;
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
      groupId: game.groupiD,
      tournamentId: tournament?.id || 0,
      tournamentName: tournament?.name || `Group ${game.groupiD}`
    });
  });
  return displayGames.reverse();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PointSystem,
  PointValues,
  RATING_DIFFERENCE_CAP,
  ResultCode,
  ResultDisplay,
  RoundRatedType,
  aggregateOpponentStats,
  calculateExpectedScore,
  calculatePerformanceRating,
  calculatePlayerPoints,
  calculatePlayerResult,
  calculatePoints,
  calculateRatingChange,
  calculateStatsByColor,
  calculateTournamentStats,
  chunkArray,
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
  getGameOutcome,
  getGroupName,
  getKFactorForRating,
  getMonthStart,
  getMonthStartString,
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
  isBlackWin,
  isCountableResult,
  isDraw,
  isJuniorPlayer,
  isTouristBye,
  isWalkover,
  isWalkoverClub,
  isWalkoverPlayer,
  isWalkoverResult,
  isWalkoverResultCode,
  isWhiteWin,
  normalizeEloLookupDate,
  parseGameResult,
  parseLocalDate,
  parseTimeControl,
  sortOpponentStats,
  sortTournamentEndResultsByPlace,
  sortTournamentsByDate,
  toRomanNumeral
});
