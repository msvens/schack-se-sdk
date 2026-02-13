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
  PlayerCategory: () => PlayerCategory,
  RatingAlgorithm: () => RatingAlgorithm,
  RatingType: () => RatingType,
  TournamentState: () => TournamentState,
  TournamentType: () => TournamentType,
  isTeamTournament: () => isTeamTournament
});
module.exports = __toCommonJS(types_exports);

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
function isTeamTournament(type) {
  return type === TournamentType.ALLSVENSKAN || type === TournamentType.SVENSKA_CUPEN || type === TournamentType.YES2CHESS;
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
  PlayerCategory,
  RatingAlgorithm,
  RatingType,
  TournamentState,
  TournamentType,
  isTeamTournament
});
