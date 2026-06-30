/**
 * Internal engine for round-by-round standings replay.
 *
 * NOT part of the public API — `ResultsService.getRoundStandings(groupId)` is
 * the only entry point. It derives `mode` and the individual quality metric
 * from the tournament/group and calls this engine; callers never choose them.
 * Only the result types (`RoundStandings`, `RoundStandingRow`) are exported.
 *
 * The round-results DTO is identical for team and individual events, so this
 * engine cannot infer the mode from its input — it must be told. The values it
 * accumulates (`homeResult` / `awayResult`) are already in the tournament's own
 * units, so the primary column it produces is exact:
 *
 * - **Individual**: player game points. Ranking points → quality points, where
 *   quality points are plain **Buchholz** or **Sonneborn-Berger** (used for
 *   round-robin, where Buchholz is FIDE-invalid). Indicative only — the official
 *   per-group tie-break variant is not reproduced (see `TiebreakSystem`).
 * - **Team**: team board-point totals per match. Ranking match points → board
 *   points, both exact. Match points from comparing the two board totals.
 *
 * Byes and walkovers credit the awarded points to the real contender but add no
 * opponent contribution and are excluded from W/D/L and gamesPlayed.
 */

import type { TournamentRoundResultDto } from '../types';
import { getOpponentKind } from './resultFormatting';
import { calculatePoints } from './gameResults';
import {
  computeSsfSecPoints,
  isSsfSecPointsSupported,
  secondaryBasis,
  isEstimated,
  type SbContribution,
  type SecondaryBasis
} from './tiebreaks';

export type { SecondaryBasis } from './tiebreaks';

export type StandingsMode = 'individual' | 'team';
export type QualityMetric = 'buchholz' | 'sonneborn-berger';

/** A single contender's row within a round snapshot. */
export interface RoundStandingRow {
  /** Player id (individual) or team/club id (team), from `homeId` / `awayId`. */
  contenderId: number;
  /** Team number distinguishing multiple teams of one club. Team mode only. */
  teamNumber?: number;
  /** 1-based placement; tied contenders share a rank (standard competition ranking). */
  rank: number;
  /**
   * Cumulative primary-unit points after this round — exact.
   * Individual: the player's game points. Team: the team's board/player points
   * (the team *secondary* key; `matchPoints` is the primary key).
   */
  points: number;
  /** Team mode only — cumulative match points (primary key). */
  matchPoints?: number;
  /** Individual mode only — indicative quality points (Buchholz or Sonneborn-Berger). */
  qualityPoints?: number;
  /** Wins in real games (individual) or matches (team) up to this round. */
  wins: number;
  /** Draws up to this round. */
  draws: number;
  /** Losses up to this round. */
  losses: number;
  /** Real games (individual) or matches (team) played; excludes byes/walkovers. */
  gamesPlayed: number;
}

/** Standings snapshot as of the end of a specific round. */
export interface RoundStandings {
  /** The round this snapshot reflects (table after this round). */
  round: number;
  /** Contender rows, sorted best-first. */
  rows: RoundStandingRow[];
  /**
   * Whether the secondary (tie-break) ordering should be shown to users as an
   * *estimate* rather than the trustworthy official result. Constant across a
   * group's snapshots. The app's rule is one line: `if (snapshot.estimated)`.
   * Today: `false` for team standings (exact), `true` for individual (the
   * tie-break reproduction is reverse-engineered / pending SSF confirmation).
   */
  estimated: boolean;
  /** Why — the basis of the secondary ordering (see {@link SecondaryBasis}). */
  secondaryBasis: SecondaryBasis;
}

/** Internal — the service derives these from the tournament; not caller-facing. */
export interface ComputeRoundStandingsOptions {
  /** `'individual'` or `'team'`. Determines the ranking keys. */
  mode: StandingsMode;
  /** Individual only — fallback secondary metric when no SSF system applies. Default `'buchholz'`. */
  qualityMetric?: QualityMetric;
  /**
   * Individual only — the group's `tiebreakSystem`. When it's one the SDK can
   * reproduce (see `computeSsfSecPoints`), `qualityPoints` becomes the official
   * `secPoints` value; otherwise the indicative `qualityMetric` is used.
   */
  tiebreakSystem?: number;
  /** Team only — match-point award scheme. Default `{ win: 2, draw: 1, loss: 0 }`. */
  matchPointValues?: { win: number; draw: number; loss: number };
}

interface Accumulator {
  contenderId: number;
  teamNumber: number;
  points: number;
  matchPoints: number;
  wins: number;
  draws: number;
  losses: number;
  gamesPlayed: number;
  /** Stable first-seen index — the final tiebreak (lottning is not reproducible). */
  order: number;
  /** Individual only — games played with the black pieces (FIDE Art 7.3). */
  gamesWithBlack: number;
  /** Individual only — the points awarded for each bye/walkover (unplayed round). */
  byeResults: number[];
  /** Individual only — one entry per real game (kept for Buchholz / SB). */
  opponents: { id: number; myResult: number }[];
  /** Team only — cumulative board points per board index (attributed matches only). */
  boardPoints: Map<number, number>;
  /** Team only — false if any of this team's matches could not be board-attributed. */
  boardAttributed: boolean;
  /** Team only — cumulative match points vs each opponent key (TB §11.3 inbördes). */
  mpAgainst: Map<string, number>;
  /** Team only — cumulative board points vs each opponent key (TB §11.3 inbördes). */
  bpAgainst: Map<string, number>;
}

function isRealContender(id: number): boolean {
  return getOpponentKind(id) === 'paired';
}

/**
 * Compute one standings snapshot per round present in `roundResults`, ordered
 * by round ascending. Internal — use `ResultsService.getRoundStandings`.
 */
export function computeRoundStandings(
  roundResults: TournamentRoundResultDto[],
  options: ComputeRoundStandingsOptions
): RoundStandings[] {
  const {
    mode,
    qualityMetric = 'buchholz',
    tiebreakSystem,
    matchPointValues = { win: 2, draw: 1, loss: 0 }
  } = options;
  const team = mode === 'team';

  const byRound = new Map<number, TournamentRoundResultDto[]>();
  for (const pairing of roundResults) {
    const list = byRound.get(pairing.roundNr);
    if (list) list.push(pairing);
    else byRound.set(pairing.roundNr, [pairing]);
  }
  const rounds = [...byRound.keys()].sort((a, b) => a - b);

  // Secondary-ordering confidence for this group (constant across rounds). Byes
  // are now modelled per spec (fictive opponents); withdrawal/forfeit-loss edge
  // cases (TB §7.3) are the residual we don't reproduce exactly, but those are
  // ultimately caught by self-verification at the service layer.
  const basis = secondaryBasis({ mode, tiebreakSystem, hasUnhandledUnplayed: false });
  const estimated = isEstimated(basis);

  // Team board-by-board tie-break (TB §11.3): derive the group's colour parity and
  // board-key order once, from the played matches, before replaying the rounds.
  let teamParity = { homeWhiteOnOdd: true, known: false };
  let boardKeys: number[][] = [];
  if (team) {
    const played = roundResults.filter(
      (p) => isRealContender(p.homeId) && isRealContender(p.awayId) && p.games.length > 0
    );
    teamParity = deriveTeamParity(played);
    boardKeys = teamBoardKeys([...new Set(played.flatMap((p) => p.games.map((g) => g.tableNr)))]);
  }

  // Identity: individuals by id; teams by id + teamNumber (one club may field
  // several teams). Map insertion order = first-seen order = stable final tiebreak.
  const keyOf = (id: number, teamNumber: number) => (team ? `${id}:${teamNumber}` : `${id}`);
  const acc = new Map<string, Accumulator>();
  const get = (id: number, teamNumber: number): Accumulator => {
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
        boardPoints: new Map(),
        boardAttributed: true,
        mpAgainst: new Map(),
        bpAgainst: new Map()
      };
      acc.set(key, a);
    }
    return a;
  };

  const snapshots: RoundStandings[] = [];

  for (const round of rounds) {
    for (const p of byRound.get(round)!) {
      const homeReal = isRealContender(p.homeId);
      const awayReal = isRealContender(p.awayId);

      if (homeReal) get(p.homeId, p.homeTeamNumber).points += p.homeResult;
      if (awayReal) get(p.awayId, p.awayTeamNumber).points += p.awayResult;

      // An unplayed round (bye/walkover): record the points awarded so we can
      // build the fictive opponent for the player's kvalitetspoäng (TB §7.2.2).
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
          // Inbördes (head-to-head) — exact; needs no board attribution.
          const hk = keyOf(p.homeId, p.homeTeamNumber);
          const ak = keyOf(p.awayId, p.awayTeamNumber);
          h.mpAgainst.set(ak, (h.mpAgainst.get(ak) ?? 0) + matchPointsFor(p.homeResult, p.awayResult, matchPointValues));
          h.bpAgainst.set(ak, (h.bpAgainst.get(ak) ?? 0) + p.homeResult);
          a.mpAgainst.set(hk, (a.mpAgainst.get(hk) ?? 0) + matchPointsFor(p.awayResult, p.homeResult, matchPointValues));
          a.bpAgainst.set(hk, (a.bpAgainst.get(hk) ?? 0) + p.awayResult);
          // Board-by-board points, validated against the match board totals.
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
          // Track colour for the games-with-black tie-break (FIDE Art 7.3).
          for (const g of p.games) {
            if (g.blackId > 0) get(g.blackId, 0).gamesWithBlack += 1;
          }
        }
      }
      // Bye/walkover: points already credited; no game/match, opponent, or W/D/L.
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

function recordGame(
  player: Accumulator,
  opponentId: number,
  myResult: number,
  opponentResult: number
): void {
  player.gamesPlayed += 1;
  player.opponents.push({ id: opponentId, myResult });
  if (myResult > opponentResult) player.wins += 1;
  else if (myResult === opponentResult) player.draws += 1;
  else player.losses += 1;
}

type MatchPointValues = { win: number; draw: number; loss: number };

/** Match points awarded for one match, from comparing the two board-point totals. */
function matchPointsFor(myBoardPoints: number, opponentBoardPoints: number, mpv: MatchPointValues): number {
  if (myBoardPoints > opponentBoardPoints) return mpv.win;
  if (myBoardPoints === opponentBoardPoints) return mpv.draw;
  return mpv.loss;
}

function recordMatch(
  team: Accumulator,
  myBoardPoints: number,
  opponentBoardPoints: number,
  mpv: MatchPointValues
): void {
  team.gamesPlayed += 1;
  team.matchPoints += matchPointsFor(myBoardPoints, opponentBoardPoints, mpv);
  if (myBoardPoints > opponentBoardPoints) team.wins += 1;
  else if (myBoardPoints === opponentBoardPoints) team.draws += 1;
  else team.losses += 1;
}

// Board points are multiples of 0.5; a tiny epsilon guards the checksum's float compare.
const BOARD_EPS = 1e-9;

/**
 * Split one team match's board games into home/away points for a chosen colour
 * parity, and check the per-board totals against the match's `homeResult` /
 * `awayResult`. The checksum is the safety net: a match whose split doesn't
 * reconstruct both totals is reported `ok: false` (left unattributed) rather
 * than guessed. `homeWhiteOnOdd` = home team plays White on odd `tableNr`.
 */
function splitTeamMatch(
  p: TournamentRoundResultDto,
  homeWhiteOnOdd: boolean
): { home: Map<number, number>; away: Map<number, number>; ok: boolean } {
  const home = new Map<number, number>();
  const away = new Map<number, number>();
  let hSum = 0;
  let aSum = 0;
  for (const g of p.games) {
    const [whitePts, blackPts] = calculatePoints(g.result);
    const homeIsWhite = (g.tableNr % 2 === 1) === homeWhiteOnOdd;
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

/**
 * Derive the group's board colour convention from the matches the checksum can
 * disambiguate (decisive matches, where exactly one parity reconstructs the
 * totals). A drawn match passes the checksum under both parities, so it cannot
 * vote. `known` is false when no match is decisive (no usable board data).
 */
function deriveTeamParity(matches: TournamentRoundResultDto[]): { homeWhiteOnOdd: boolean; known: boolean } {
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

/**
 * TB §11.3 / §5.4 board-key order from the boards actually present: the first
 * ⌊n/2⌋ boards as one group, then each remaining board individually up to the
 * penultimate. The last board is decided by lots (not reproducible) and excluded.
 * 8 boards → {0–3}, 4, 5, 6 (board 7 = lots); 4 boards → {0,1}, 2 (board 3 = lots).
 */
function teamBoardKeys(boards: number[]): number[][] {
  const sorted = [...boards].sort((a, b) => a - b);
  const n = sorted.length;
  if (n < 2) return [];
  const half = Math.floor(n / 2);
  const keys: number[][] = [sorted.slice(0, half)];
  for (let i = half; i < n - 1; i++) keys.push([sorted[i]]);
  return keys;
}

/**
 * Rank teams by the full TB §11.3 chain, returning ordered equivalence classes
 * (teams in the same class share a rank — they are inseparable short of lots).
 *
 * Criteria in order: matchpoäng → partipoäng → inbördes match points → inbördes
 * board points → board-key groups. Inbördes is recomputed over the *current*
 * tied sub-pool, so the criteria are applied top-down and the first one that
 * splits a pool recurses into each part — this re-applies the head-to-head
 * mini-table to a narrowed set (needed for >2-way ties, e.g. a 3-cycle). Board
 * criteria are skipped for a pool that has an unattributed team (it falls to
 * lots / stable order, and the service layer's self-verify flags such groups).
 */
function resolveTeams(accs: Accumulator[], boardKeys: number[][]): Accumulator[][] {
  const oppKey = (a: Accumulator) => `${a.contenderId}:${a.teamNumber}`;
  const inbordes = (grp: Accumulator[], field: 'mpAgainst' | 'bpAgainst') => (t: Accumulator): number => {
    let s = 0;
    for (const o of grp) if (o !== t) s += t[field].get(oppKey(o)) ?? 0;
    return s;
  };
  const criteria: Array<{ score: (grp: Accumulator[]) => (t: Accumulator) => number; needsBoards: boolean }> = [
    { score: () => (t) => t.matchPoints, needsBoards: false },
    { score: () => (t) => t.points, needsBoards: false },
    { score: (grp) => inbordes(grp, 'mpAgainst'), needsBoards: false },
    { score: (grp) => inbordes(grp, 'bpAgainst'), needsBoards: false },
    ...boardKeys.map((bs) => ({
      score: () => (t: Accumulator) => bs.reduce((s, b) => s + (t.boardPoints.get(b) ?? 0), 0),
      needsBoards: true
    }))
  ];

  const partition = (grp: Accumulator[], score: (t: Accumulator) => number): Accumulator[][] => {
    const sorted = [...grp].sort((a, b) => score(b) - score(a));
    const parts: Accumulator[][] = [];
    for (const t of sorted) {
      const last = parts[parts.length - 1];
      if (last && score(last[0]) === score(t)) last.push(t);
      else parts.push([t]);
    }
    return parts;
  };

  const resolve = (grp: Accumulator[]): Accumulator[][] => {
    if (grp.length === 1) return [grp];
    const boardsOk = grp.every((t) => t.boardAttributed);
    for (const c of criteria) {
      if (c.needsBoards && !boardsOk) break;
      const parts = partition(grp, c.score(grp));
      if (parts.length > 1) return parts.flatMap(resolve);
    }
    return [[...grp].sort((a, b) => a.order - b.order)]; // inseparable → lots → stable order
  };

  return resolve(accs);
}

function buildRows(
  acc: Map<string, Accumulator>,
  keyOf: (id: number, teamNumber: number) => string,
  opts: { team: boolean; qualityMetric: QualityMetric; tiebreakSystem?: number; boardKeys?: number[][] }
): RoundStandingRow[] {
  const { team, qualityMetric, tiebreakSystem, boardKeys = [] } = opts;
  const useSsf = !team && tiebreakSystem !== undefined && isSsfSecPointsSupported(tiebreakSystem);
  // Round-robin (Berger) groups rank by the full SSF order — inbördes resultat →
  // Sonneborn-Berger → wins → games-with-black (TB §7.2.1) — not a single number.
  const berger = !team && qualityMetric === 'sonneborn-berger';
  const rows: RoundStandingRow[] = [];
  // contenderId → (opponentId → summed result), for the inbördes head-to-head.
  const resultsAgainst = new Map<number, Map<number, number>>();
  const blackOf = new Map<number, number>();

  for (const a of acc.values()) {
    let qualityPoints: number | undefined;
    if (!team) {
      const opponentScores: number[] = [];
      const sbContributions: SbContribution[] = [];
      if (berger) {
        const r = new Map<number, number>();
        for (const opp of a.opponents) r.set(opp.id, (r.get(opp.id) ?? 0) + opp.myResult);
        resultsAgainst.set(a.contenderId, r);
        blackOf.set(a.contenderId, a.gamesWithBlack);
      }
      for (const opp of a.opponents) {
        const oppScore = acc.get(keyOf(opp.id, 0))?.points ?? 0;
        opponentScores.push(oppScore);
        sbContributions.push({ opponentScore: oppScore, myResult: opp.myResult });
      }
      // Official SSF secPoints when we can reproduce this group's tie-break
      // system; otherwise the indicative Buchholz / Sonneborn-Berger metric.
      // Fictive opponent per bye: score = player's score before the bye + points
      // in remaining rounds ≈ player's current score − the bye's points (§7.2.2).
      const byeFictiveScores = a.byeResults.map((br) => a.points - br);
      const ssf = useSsf
        ? computeSsfSecPoints(tiebreakSystem!, {
            opponentScores,
            sbContributions,
            wins: a.wins,
            gamesWithBlack: a.gamesWithBlack,
            byeFictiveScores
          })
        : null;
      qualityPoints = ssf ?? (qualityMetric === 'sonneborn-berger'
        ? sbContributions.reduce((s, c) => s + c.opponentScore * c.myResult, 0)
        : opponentScores.reduce((s, x) => s + x, 0));
    }
    rows.push({
      contenderId: a.contenderId,
      teamNumber: team ? a.teamNumber : undefined,
      rank: 0,
      points: a.points,
      matchPoints: team ? a.matchPoints : undefined,
      qualityPoints,
      wins: a.wins,
      draws: a.draws,
      losses: a.losses,
      gamesPlayed: a.gamesPlayed
    });
  }

  // Team: rank by the full TB §11.3 chain (match→board→inbördes→board groups),
  // assigning shared ranks to inseparable (lots) teams. Returns in resolved order.
  if (team) {
    const classes = resolveTeams([...acc.values()], boardKeys);
    const rankOf = new Map<string, number>();
    const orderIndex = new Map<string, number>();
    let placed = 0;
    let idx = 0;
    for (const cls of classes) {
      const rank = placed + 1; // standard competition ranking ("1224")
      for (const a of cls) {
        const k = keyOf(a.contenderId, a.teamNumber);
        rankOf.set(k, rank);
        orderIndex.set(k, idx++);
      }
      placed += cls.length;
    }
    const rowKey = (r: RoundStandingRow) => keyOf(r.contenderId, r.teamNumber ?? 0);
    rows.sort((a, b) => orderIndex.get(rowKey(a))! - orderIndex.get(rowKey(b))!);
    for (const r of rows) r.rank = rankOf.get(rowKey(r))!;
    return rows;
  }

  // Inbördes resultat: a player's score against the others tied on points
  // (head-to-head). Computed per points-group since it depends on who is tied.
  const inbordesOf = new Map<number, number>();
  if (berger) {
    const idsByPoints = new Map<number, number[]>();
    for (const r of rows) {
      const g = idsByPoints.get(r.points) ?? [];
      g.push(r.contenderId);
      idsByPoints.set(r.points, g);
    }
    for (const r of rows) {
      const group = idsByPoints.get(r.points)!;
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
      // §7.2.1: inbördes → Sonneborn-Berger → wins → games-with-black.
      const ia = inbordesOf.get(a.contenderId) ?? 0;
      const ib = inbordesOf.get(b.contenderId) ?? 0;
      if (ib !== ia) return ib - ia;
      if (b.qualityPoints! !== a.qualityPoints!) return b.qualityPoints! - a.qualityPoints!;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (blackOf.get(b.contenderId) ?? 0) - (blackOf.get(a.contenderId) ?? 0);
    }
    if (b.qualityPoints! !== a.qualityPoints!) return b.qualityPoints! - a.qualityPoints!;
    return 0;
  });

  const tiedWithPrev = (prev: RoundStandingRow, row: RoundStandingRow): boolean => {
    if (berger) {
      return (
        prev.points === row.points &&
        inbordesOf.get(prev.contenderId) === inbordesOf.get(row.contenderId) &&
        prev.qualityPoints === row.qualityPoints &&
        prev.wins === row.wins &&
        blackOf.get(prev.contenderId) === blackOf.get(row.contenderId)
      );
    }
    return prev.points === row.points && prev.qualityPoints === row.qualityPoints;
  };

  // Standard competition ranking ("1224"): tied rows share the leader's rank.
  rows.forEach((row, i) => {
    row.rank = i === 0 ? 1 : tiedWithPrev(rows[i - 1], row) ? rows[i - 1].rank : i + 1;
  });

  return rows;
}
