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

export {
  TournamentType,
  TournamentState,
  isTeamTournament,
  RatingType,
  MemberCategory,
  PlayerCategory
};
