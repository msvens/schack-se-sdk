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
  /** Individual only — games played with the black pieces (FIDE Art 7.3). */
  gamesWithBlack: number;
  /** Individual only — the points awarded for each bye/walkover (unplayed round). */
  byeResults: number[];
  /** Individual only — one entry per real game (kept for Buchholz / SB). */
  opponents: { id: number; myResult: number }[];
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
        gamesWithBlack: 0,
        byeResults: [],
        opponents: []
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
      rows: buildRows(acc, keyOf, { team, qualityMetric, tiebreakSystem }),
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

function recordMatch(
  team: Accumulator,
  myBoardPoints: number,
  opponentBoardPoints: number,
  mpv: { win: number; draw: number; loss: number }
): void {
  team.gamesPlayed += 1;
  if (myBoardPoints > opponentBoardPoints) {
    team.matchPoints += mpv.win;
    team.wins += 1;
  } else if (myBoardPoints === opponentBoardPoints) {
    team.matchPoints += mpv.draw;
    team.draws += 1;
  } else {
    team.matchPoints += mpv.loss;
    team.losses += 1;
  }
}

function buildRows(
  acc: Map<string, Accumulator>,
  keyOf: (id: number, teamNumber: number) => string,
  opts: { team: boolean; qualityMetric: QualityMetric; tiebreakSystem?: number }
): RoundStandingRow[] {
  const { team, qualityMetric, tiebreakSystem } = opts;
  const useSsf = !team && tiebreakSystem !== undefined && isSsfSecPointsSupported(tiebreakSystem);
  const rows: RoundStandingRow[] = [];

  for (const a of acc.values()) {
    let qualityPoints: number | undefined;
    if (!team) {
      const opponentScores: number[] = [];
      const sbContributions: SbContribution[] = [];
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

  rows.sort((a, b) => {
    if (team) {
      if (b.matchPoints! !== a.matchPoints!) return b.matchPoints! - a.matchPoints!;
      if (b.points !== a.points) return b.points - a.points;
      return 0;
    }
    if (b.points !== a.points) return b.points - a.points;
    if (b.qualityPoints! !== a.qualityPoints!) return b.qualityPoints! - a.qualityPoints!;
    return 0;
  });

  const tiedWithPrev = (prev: RoundStandingRow, row: RoundStandingRow): boolean =>
    team
      ? prev.matchPoints === row.matchPoints && prev.points === row.points
      : prev.points === row.points && prev.qualityPoints === row.qualityPoints;

  // Standard competition ranking ("1224"): tied rows share the leader's rank.
  rows.forEach((row, i) => {
    row.rank = i === 0 ? 1 : tiedWithPrev(rows[i - 1], row) ? rows[i - 1].rank : i + 1;
  });

  return rows;
}
