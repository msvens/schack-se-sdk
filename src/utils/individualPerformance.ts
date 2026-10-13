/**
 * The tournament-wide performance list — resultat.schack.se's "Individuella
 * resultat" (ShowIndividualPerformanceServlet): every player of every group,
 * ranked by tournament performance (PERF).
 *
 * Pure: no fetching. Ratings come from the caller through {@link PlayerAt}, so
 * caching and where ratings come from stay the caller's concern. Use
 * {@link getIndividualPerformanceLookups} to learn which ratings to prefetch.
 *
 * Rules, verified exactly against the official list (see
 * __tests__/fixtures/individual-results.json and official-performance.json):
 * - Groups with Schackfyran scoring (`pointSystem` 3/2/1) are left out.
 * - SP counts every countable game, walkovers and byes included.
 * - W / D / L and points count games actually played: walkovers and byes
 *   excluded. Points are 1 / ½ / 0.
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
import { getPlayerRatingForRound, RoundRatedType } from './ratingUtils';
import { getOpponentKind } from './resultFormatting';

/**
 * Fewest games against rated opponents for the official site to show a PERF.
 * Verified: every official PERF in the reference data rests on ≥ 3 such games,
 * and every player with 1–2 has none.
 */
export const MIN_RATED_GAMES_FOR_PERFORMANCE = 3;

/** One row of the performance list. */
export interface IndividualPerformanceRow {
  playerId: number;
  groupId: number;
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

const isPlayed = (g: GroupGame, opponentId: number) =>
  getOpponentKind(opponentId) === 'paired' && !isWalkoverResultCode(g.result) && !isTouristBye(g.result);

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
 * @returns One row per (player, group), sorted by performance, highest first, `null` last
 */
export function getIndividualPerformance(
  tournament: TournamentDto,
  roundResultsByGroup: Map<number, TournamentRoundResultDto[]>,
  playerAt: PlayerAt
): IndividualPerformanceRow[] {
  const rows = new Map<string, IndividualPerformanceRow & { opponentRatings: number[]; ratedScore: number }>();

  for (const g of eligibleGames(tournament, roundResultsByGroup)) {
    for (const [self, opponent, isWhite] of sides(g)) {
      const key = `${self}:${g.group.id}`;
      let row = rows.get(key);
      if (!row) {
        row = {
          playerId: self, groupId: g.group.id, games: 0, won: 0, drawn: 0, lost: 0, points: 0,
          ratedGames: 0, performance: null, opponentRatings: [], ratedScore: 0,
        };
        rows.set(key, row);
      }
      row.games++;

      if (!isPlayed(g, opponent)) continue;
      const outcome = getPlayerOutcome(g.result, isWhite);
      if (outcome === null) continue;
      const score = outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0;
      if (outcome === 'win') row.won++;
      else if (outcome === 'draw') row.drawn++;
      else row.lost++;
      row.points += score;

      if (!isRatedRound(g)) continue;
      const { rating } = getPlayerRatingForRound(
        playerAt(opponent, g.roundDate)?.elo, g.group.rankingAlgorithm, g.rated
      );
      if (!rating) continue;
      row.opponentRatings.push(rating);
      row.ratedScore += score;
    }
  }

  const result: IndividualPerformanceRow[] = [...rows.values()].map(
    ({ opponentRatings, ratedScore, ...row }) => ({
      ...row,
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
      if (!isPlayed(g, opponent) || getPlayerOutcome(g.result, self === g.whiteId) === null) continue;
      const key = `${opponent}@${g.roundDate}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ playerId: opponent, roundDate: g.roundDate });
    }
  }
  return out;
}
