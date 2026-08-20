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

export {
  PointSystem,
  PointValues,
  ResultCode,
  ResultDisplay,
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
  getPointSystemName,
  isAdjudicatedResult,
  isPostponed,
  isResultCodeInformative,
  parseResultDisplay,
  resolveIndividualResult,
  resolveTeamMatchResult,
  TournamentType,
  TournamentState,
  TeamTournamentPlayerListType,
  PairingSystem,
  TiebreakSystem,
  getTiebreakSystemName,
  Schack4anTeamPointSystem,
  isLooseTeamTournament,
  isTeamTournament,
  isTeamPairing,
  isSchackfyran,
  isSchackfyranLike,
  RatingAlgorithm
};
