import {
  BaseApiService,
  CHESSTOOLS_API_URL,
  chunkArray,
  findTournamentGroup,
  getOpponentKind
} from "./chunk-T4K5ZM7T.mjs";
import {
  PairingSystem,
  TiebreakSystem,
  calculatePoints,
  isTeamPairing
} from "./chunk-6U6BXSQJ.mjs";

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

export {
  OrganizationService,
  TournamentService,
  ResultsService,
  RatingsService,
  RegistrationService,
  FideService
};
