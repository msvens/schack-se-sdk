/**
 * The tournament-wide performance list — resultat.schack.se's "Individuella
 * resultat" (ShowIndividualPerformanceServlet): every player of the
 * tournament, ranked by tournament performance (PERF). One row per player
 * across all groups — in team leagues players move between a club's teams in
 * different divisions, and the official list pools those games into one row.
 * Use {@link hasIndividualPerformance} to decide whether the list is meaningful.
 *
 * Pure: no fetching. Ratings come from the caller through {@link PlayerAt}, so
 * caching and where ratings come from stay the caller's concern. Use
 * {@link getIndividualPerformanceLookups} to learn which ratings to prefetch.
 *
 * Rules, verified exactly against the official list (see
 * __tests__/fixtures/individual-results.json and official-performance.json):
 * - Groups with Schackfyran scoring (`pointSystem` 3/2/1) are left out.
 * - SP counts every countable game, walkovers and byes included.
 * - W / D / L and points count games actually played: walkover result codes
 *   and byes excluded (a game against a walkover placeholder id with an
 *   ordinary result code counts). Points are 1 / ½ / 0.
 * - PERF uses games actually played in rated rounds against rated opponents,
 *   each opponent rated per round (`getPlayerRatingForRound`); the player's own
 *   rating is not needed. A group mixing rating types gets one pooled PERF.
 * - PERF needs at least {@link MIN_RATED_GAMES_FOR_PERFORMANCE} such games;
 *   below that the official list (and player page) shows none.
 * - Order: PERF highest first, players without one last. The official site
 *   shows no derivable order among equal PERFs; ties keep encounter order.
 *
 * Not verified (no such group in the sample): 3-1-0 groups (`pointSystem` 2)
 * are included with 1 / ½ / 0 points.
 *
 * Not included: players registered to a team who never played. The official
 * list shows them (from the team registrations) with SP 0 and no PERF, last;
 * they appear in no round result, so they can't be derived from these inputs.
 */

import type {
  PlayerInfoDto,
  TournamentClassDto,
  TournamentClassGroupDto,
  TournamentDto,
  TournamentRoundResultDto,
} from '../types';
import { calculatePerformanceRating } from './eloCalculations';
import {
  PointSystem,
  getPlayerOutcome,
  isCountableResult,
  isTouristBye,
  isWalkoverResultCode,
} from './gameResults';
import { getGroupTimeControl, getPlayerRatingForRound, RoundRatedType } from './ratingUtils';
import { getOpponentKind } from './resultFormatting';

/**
 * Fewest games against rated opponents for the official site to show a PERF.
 * Verified: every official PERF in the reference data rests on ≥ 3 such games,
 * and every player with 1–2 has none.
 */
export const MIN_RATED_GAMES_FOR_PERFORMANCE = 3;

/** One row of the performance list: one player, across all the tournament's groups. */
export interface IndividualPerformanceRow {
  playerId: number;
  /**
   * The groups the player played in, by games played (most first, ties in
   * encounter order). `groupIds[0]` is the natural place to link to their games.
   */
  groupIds: number[];
  /** SP: countable games, walkovers and byes included. */
  games: number;
  /** Games actually played (walkovers and byes excluded). */
  won: number;
  drawn: number;
  lost: number;
  /** 1 / ½ / 0 over games actually played. */
  points: number;
  /** Games behind `performance`: played, in a rated round, against a rated opponent. */
  ratedGames: number;
  /** Tournament performance, or `null` with fewer than {@link MIN_RATED_GAMES_FOR_PERFORMANCE} rated games. */
  performance: number | null;
}

/**
 * A player's record as of a round. `roundDate` is the round result row's `date`
 * (`YYYY-MM-DD`), passed through untouched — map it to whichever rating list
 * you use. The official PERF uses the list of each round's month.
 */
export type PlayerAt = (
  playerId: number,
  roundDate: string
) => Pick<PlayerInfoDto, 'elo'> | null | undefined;

/** A `(playerId, roundDate)` pair {@link getIndividualPerformance} will ask {@link PlayerAt} for. */
export interface IndividualPerformanceLookup {
  playerId: number;
  roundDate: string;
}

function allGroups(classes: TournamentClassDto[] | undefined): TournamentClassGroupDto[] {
  return (classes ?? []).flatMap((c) => [...(c.groups ?? []), ...allGroups(c.subClasses)]);
}

interface GroupGame {
  group: TournamentClassGroupDto;
  rated: number | undefined;
  roundDate: string;
  whiteId: number;
  blackId: number;
  result: number;
}

/** Every countable game of the eligible groups, in encounter order. */
function* eligibleGames(
  tournament: TournamentDto,
  roundResultsByGroup: Map<number, TournamentRoundResultDto[]>
): Generator<GroupGame> {
  for (const group of allGroups(tournament.rootClasses)) {
    if (group.pointSystem === PointSystem.SCHACK4AN) continue;
    const rows = roundResultsByGroup.get(group.id);
    if (!rows) continue;
    // Round results say `roundNr`, the group's rounds `roundNumber`. A round
    // missing here stays undefined and resolves through the group algorithm.
    const ratedByRound = new Map((group.tournamentRounds ?? []).map((r) => [r.roundNumber, r.rated]));
    for (const row of rows) {
      for (const game of row.games ?? []) {
        if (!isCountableResult(game.result)) continue;
        yield {
          group,
          rated: ratedByRound.get(row.roundNr),
          roundDate: row.date,
          whiteId: game.whiteId,
          blackId: game.blackId,
          result: game.result,
        };
      }
    }
  }
}

/**
 * A game that counts in W/D/L and points. Walkover *result codes* and byes
 * (id -100) don't. A game against a walkover placeholder id (e.g. -1) with an
 * ordinary result code does — the official list counts it (Stockholmsserien
 * 2025/2026: "W.O - Lo Strimling 0 - 1" counts as a win, "0 - 1 w.o" doesn't).
 */
const isPlayed = (g: GroupGame, opponentId: number) =>
  getOpponentKind(opponentId) !== 'bye' && !isWalkoverResultCode(g.result) && !isTouristBye(g.result);

/** A real opponent whose rating can be looked up (placeholder ids are never rated). */
const isRealOpponent = (opponentId: number) => getOpponentKind(opponentId) === 'paired';

const isRatedRound = (g: GroupGame) => g.rated !== RoundRatedType.UNRATED;

/** Both sides of a game that are real players, as `[self, opponent, isWhite]`. */
function sides(g: GroupGame): [number, number, boolean][] {
  const out: [number, number, boolean][] = [];
  if (g.whiteId > 0) out.push([g.whiteId, g.blackId, true]);
  if (g.blackId > 0) out.push([g.blackId, g.whiteId, false]);
  return out;
}

/**
 * Build the performance list for a tournament.
 *
 * @param tournament - The tournament, with its groups' `pointSystem`, `rankingAlgorithm` and rounds
 * @param roundResultsByGroup - Round results per group id (individual or team); groups not in the map are skipped
 * @param playerAt - A player's record as of a round, for the opponent ratings
 * @returns One row per player (games pooled across groups), sorted by performance, highest first, `null` last
 */
export function getIndividualPerformance(
  tournament: TournamentDto,
  roundResultsByGroup: Map<number, TournamentRoundResultDto[]>,
  playerAt: PlayerAt
): IndividualPerformanceRow[] {
  type Acc = Omit<IndividualPerformanceRow, 'groupIds'> & {
    gamesByGroup: Map<number, number>; // insertion order = encounter order
    opponentRatings: number[];
    ratedScore: number;
  };
  const rows = new Map<number, Acc>();

  for (const g of eligibleGames(tournament, roundResultsByGroup)) {
    for (const [self, opponent, isWhite] of sides(g)) {
      let row = rows.get(self);
      if (!row) {
        row = {
          playerId: self, games: 0, won: 0, drawn: 0, lost: 0, points: 0, ratedGames: 0, performance: null,
          gamesByGroup: new Map(), opponentRatings: [], ratedScore: 0,
        };
        rows.set(self, row);
      }
      row.games++;
      row.gamesByGroup.set(g.group.id, (row.gamesByGroup.get(g.group.id) ?? 0) + 1);

      if (!isPlayed(g, opponent)) continue;
      const outcome = getPlayerOutcome(g.result, isWhite);
      if (outcome === null) continue;
      const score = outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0;
      if (outcome === 'win') row.won++;
      else if (outcome === 'draw') row.drawn++;
      else row.lost++;
      row.points += score;

      if (!isRatedRound(g) || !isRealOpponent(opponent)) continue;
      const { rating } = getPlayerRatingForRound(
        playerAt(opponent, g.roundDate)?.elo, g.group.rankingAlgorithm, g.rated
      );
      if (!rating) continue;
      row.opponentRatings.push(rating);
      row.ratedScore += score;
    }
  }

  const result: IndividualPerformanceRow[] = [...rows.values()].map(
    ({ gamesByGroup, opponentRatings, ratedScore, ...row }) => ({
      playerId: row.playerId,
      // Stable sort: equal game counts keep encounter order.
      groupIds: [...gamesByGroup.entries()].sort((a, b) => b[1] - a[1]).map(([groupId]) => groupId),
      games: row.games, won: row.won, drawn: row.drawn, lost: row.lost, points: row.points,
      ratedGames: opponentRatings.length,
      performance: opponentRatings.length >= MIN_RATED_GAMES_FOR_PERFORMANCE
        ? calculatePerformanceRating(opponentRatings, ratedScore)
        : null,
    })
  );
  // Array.prototype.sort is stable, so equal performances keep encounter order.
  return result.sort((a, b) => {
    if (a.performance === b.performance) return 0;
    if (a.performance === null) return 1;
    if (b.performance === null) return -1;
    return b.performance - a.performance;
  });
}

/**
 * The lookups {@link getIndividualPerformance} will make, deduplicated, so the
 * caller can prefetch them (e.g. into a cache) before building the list.
 */
export function getIndividualPerformanceLookups(
  tournament: TournamentDto,
  roundResultsByGroup: Map<number, TournamentRoundResultDto[]>
): IndividualPerformanceLookup[] {
  const seen = new Set<string>();
  const out: IndividualPerformanceLookup[] = [];
  for (const g of eligibleGames(tournament, roundResultsByGroup)) {
    if (!isRatedRound(g)) continue;
    for (const [self, opponent] of sides(g)) {
      if (!isPlayed(g, opponent) || !isRealOpponent(opponent)) continue;
      if (getPlayerOutcome(g.result, self === g.whiteId) === null) continue;
      const key = `${opponent}@${g.roundDate}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ playerId: opponent, roundDate: g.roundDate });
    }
  }
  return out;
}

/**
 * Whether the performance list is meaningful for a tournament: true when at
 * least one group without Schackfyran (3/2/1) scoring is rated, i.e. its
 * rounds' rated types or its `rankingAlgorithm` give a time control
 * ({@link getGroupTimeControl} is not `'unknown'`).
 *
 * False for unrated tournaments (e.g. Minior-Lag-DM 2025, group 17042: no
 * rating algorithm, every round unrated — the official list shows rows without
 * any results there), LASK-only ones and all-Schackfyran ones.
 */
export function hasIndividualPerformance(tournament: TournamentDto): boolean {
  return allGroups(tournament.rootClasses).some(
    (group) => group.pointSystem !== PointSystem.SCHACK4AN && getGroupTimeControl(group).primary !== 'unknown'
  );
}
