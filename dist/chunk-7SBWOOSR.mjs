import {
  PlayerService,
  findTournamentGroup
} from "./chunk-T4K5ZM7T.mjs";
import {
  RatingAlgorithm,
  TournamentState,
  getPlayerOutcome,
  getPlayerPoints,
  getResultDisplayString,
  isCountableResult,
  isWalkoverResultCode
} from "./chunk-6U6BXSQJ.mjs";

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
function formatGameResult(result) {
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
      result: formatGameResult(game.result),
      resultCode: game.result,
      groupId: game.groupiD,
      tournamentId: tournament?.id || 0,
      tournamentName: tournament?.name || `Group ${game.groupiD}`
    });
  });
  return displayGames.reverse();
}

export {
  decimateRatingData,
  getPlayerRatingHistory,
  sortTournamentEndResultsByPlace,
  sortTournamentsByDate,
  RoundRatedType,
  parseTimeControl,
  getPlayerRatingForTournament,
  formatPlayerRating,
  formatRatingWithType,
  isJuniorPlayer,
  birthYearOf,
  chessAge,
  getKFactorForRating,
  getPlayerRatingByAlgorithm,
  getRatingTypeFromRoundRated,
  getPlayerRatingByRoundType,
  getPrimaryRatingType,
  getPlayerRatingStrict,
  formatPlayerName,
  Sex,
  isFemale,
  RATING_DIFFERENCE_CAP,
  calculateExpectedScore,
  calculateRatingChange,
  calculatePerformanceRating,
  calculateTournamentStats,
  PrizeCategoryType,
  isPrizeCategory,
  parsePrizeCategory,
  resolvePrizeMembers,
  getMonthStart,
  getMonthStartString,
  normalizeEloLookupDate,
  getPlayerDateCacheKey,
  parseLocalDate,
  getTournamentStatus,
  isUpcoming,
  isOngoing,
  isFinished,
  toRomanNumeral,
  countTeamsByClub,
  formatTeamName,
  createTeamNameFormatter,
  countTeamsFromRoundResults,
  createRoundResultsTeamNameFormatter,
  calculatePlayerResult,
  calculatePlayerPoints,
  filterGamesByTimeControl,
  calculateStatsByColor,
  aggregateOpponentStats,
  sortOpponentStats,
  gamesToDisplayFormat
};
