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

// src/types/index.ts
var types_exports = {};
__export(types_exports, {
  MemberCategory: () => MemberCategory,
  PairingSystem: () => PairingSystem,
  PlayerCategory: () => PlayerCategory,
  RatingAlgorithm: () => RatingAlgorithm,
  RatingType: () => RatingType,
  Schack4anTeamPointSystem: () => Schack4anTeamPointSystem,
  TeamTournamentPlayerListType: () => TeamTournamentPlayerListType,
  TiebreakSystem: () => TiebreakSystem,
  TournamentState: () => TournamentState,
  TournamentType: () => TournamentType,
  getTiebreakSystemName: () => getTiebreakSystemName,
  isLooseTeamTournament: () => isLooseTeamTournament,
  isSchackfyran: () => isSchackfyran,
  isSchackfyranLike: () => isSchackfyranLike,
  isTeamPairing: () => isTeamPairing,
  isTeamTournament: () => isTeamTournament
});
module.exports = __toCommonJS(types_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MemberCategory,
  PairingSystem,
  PlayerCategory,
  RatingAlgorithm,
  RatingType,
  Schack4anTeamPointSystem,
  TeamTournamentPlayerListType,
  TiebreakSystem,
  TournamentState,
  TournamentType,
  getTiebreakSystemName,
  isLooseTeamTournament,
  isSchackfyran,
  isSchackfyranLike,
  isTeamPairing,
  isTeamTournament
});
