import { PlayerService } from '../services/players';
import { ResultsService } from '../services/results';
import { TournamentService } from '../services/tournaments';
import type {
  ApiResponse,
  GameDto,
  PlayerInfoDto,
  TournamentClassDto,
  TournamentClassGroupDto,
  TournamentDto,
} from '../types';
import { calculateExpectedScore } from './eloCalculations';
import { getPlayerOutcome, isTouristBye, isWalkoverResultCode } from './gameResults';
import {
  getKFactorForRating,
  getPlayerRatingByRoundType,
  getRatingTypeFromRoundRated,
  type RatedTimeControl,
} from './ratingUtils';
import { getOpponentKind } from './resultFormatting';

/** FIDE caps K × games in a rating period at this (Rating Regulations §8.3.3). */
const MAX_K_TIMES_GAMES = 700;

/**
 * How long after the month the results-updated search keeps looking, for games
 * played late in the month whose results were entered after it ended.
 */
const LATE_RESULTS_DAYS = 7;

/** From this rating FIDE's 400-point rule no longer applies in standard (§8.3.1). */
const STANDARD_UNCAPPED_FROM = 2650;

export interface MonthlyRatingEstimateOptions {
  /** The month as `YYYY-MM`. Defaults to the current month (local time). */
  month?: string;
  tournamentService?: TournamentService;
  resultsService?: ResultsService;
  playerService?: PlayerService;
}

/** One game behind an estimate. */
export interface EstimatedGame {
  tournamentId: number;
  tournamentName: string;
  groupId: number;
  roundNr: number;
  /** The round's date, `YYYY-MM-DD`. */
  date: string;
  opponentId: number;
  /** The opponent's rating for this time control, from the month's list. */
  opponentRating: number;
  /** 1 / ½ / 0. */
  score: number;
  expectedScore: number;
  /** K × (score − expected), to 0.1. Only the month's total is rounded to whole points. */
  change: number;
}

/** The estimate for one time control. */
export interface EstimatedRatingChange {
  timeControl: RatedTimeControl;
  /** The player's rating on the month's list. */
  rating: number;
  /** K used: the stored K, lowered so K × games ≤ 700. */
  k: number;
  games: number;
  score: number;
  expectedScore: number;
  /** Rounded to a whole number, 0.5 away from zero, as FIDE rounds a period's change. */
  change: number;
  /** `rating + change`: the rating if only these games were rated on top of the month's list. */
  estimatedRating: number;
  /** The games, oldest first. */
  gameList: EstimatedGame[];
}

/** From {@link estimateMonthlyRatingChange}. */
export interface MonthlyRatingEstimate {
  memberId: number;
  /** `YYYY-MM`. */
  month: string;
  /** One entry per time control with at least one counted game, standard, rapid, blitz order. */
  estimates: EstimatedRatingChange[];
}

const pad = (n: number) => String(n).padStart(2, '0');
const toLocalIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function allGroups(classes: TournamentClassDto[] | undefined): TournamentClassGroupDto[] {
  return (classes ?? []).flatMap((c) => [...(c.groups ?? []), ...allGroups(c.subClasses)]);
}

/** Round half away from zero, as FIDE rounds a rating change (§8.3.4). */
function roundFide(x: number): number {
  return Math.sign(x) * Math.round(Math.abs(x));
}

const round1 = (x: number) => Math.round(x * 10) / 10;
const round2 = (x: number) => Math.round(x * 100) / 100;

interface CountedGame {
  timeControl: RatedTimeControl;
  tournament: TournamentDto;
  groupId: number;
  roundNr: number;
  date: string;
  opponentId: number;
  score: number;
}

/**
 * An **estimate**, for fun, of how many FIDE rating points a player's games
 * in one month are worth: "your rated games in November ≈ +60 (rapid)". Built
 * from the games reported to SSF; not an official rating.
 *
 * It values the month's games; it doesn't predict the next list. FIDE rates a
 * tournament when the organizer reports it, usually in time for the next
 * list but sometimes a list or two later, so the next list can hold other
 * games. When FIDE rates the same games, the estimate matches exactly
 * (checked against published lists).
 *
 * Counts each game in a round dated in the month, in individual and team
 * groups alike, when the round is FIDE-rated (`rated` standard / rapid /
 * blitz, which also decides the time control), the game was actually played
 * (no walkovers or byes), and both players have a rating for that time control
 * on the month's list. Then per time control, following FIDE's rules:
 * - ratings (player and opponents) are those on the 1st of the month;
 * - K is the player's stored K ({@link getKFactorForRating}), lowered so that
 *   K × games ≤ 700;
 * - expected scores come from FIDE's table with the 400-point rule (not
 *   applied in standard from 2650);
 * - the change is K × (score − expected score), rounded once for the month.
 *
 * Limits:
 * - Only games reported to SSF: the player's FIDE-rated games abroad or
 *   elsewhere are missing (mostly a concern for strong players). Opponents'
 *   other games don't matter; only their rating on the month's list is used.
 * - Games are found through tournaments with results updated from the 1st to
 *   7 days after the month; results entered later are missed.
 * - Round dates and the `rated` flag are set by organizers and can be wrong.
 * - A time control the player has no rating in is left out: a first rating
 *   is calculated differently. So is FIDE's rule that rapid/blitz games
 *   between players 600+ points apart are unrated when one is above 2600.
 *
 * Requests: the player's games, one results-updated search, the round results
 * of each group the player played in that had updates, and one batch of
 * player lookups. If any fails, its error is returned rather than a partial
 * estimate.
 *
 * @example
 * const res = await estimateMonthlyRatingChange(642062, { month: '2026-11' });
 * for (const e of res.data?.estimates ?? []) {
 *   console.log(`${e.timeControl}: ${e.rating} → ~${e.estimatedRating} (${e.change >= 0 ? '+' : ''}${e.change})`);
 * }
 */
export async function estimateMonthlyRatingChange(
  memberId: number,
  options: MonthlyRatingEstimateOptions = {}
): Promise<ApiResponse<MonthlyRatingEstimate>> {
  const tournaments = options.tournamentService ?? new TournamentService();
  const results = options.resultsService ?? new ResultsService();
  const players = options.playerService ?? new PlayerService();

  const now = new Date();
  const month = options.month ?? `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const parsed = /^(\d{4})-(\d{2})$/.exec(month);
  if (!parsed || Number(parsed[2]) < 1 || Number(parsed[2]) > 12) {
    return { status: 400, error: `Invalid month '${month}', expected YYYY-MM` };
  }
  const listDate = new Date(Number(parsed[1]), Number(parsed[2]) - 1, 1);
  const empty = { status: 200, data: { memberId, month, estimates: [] } };
  if (listDate > now) return empty;

  const searchEnd = new Date(Number(parsed[1]), Number(parsed[2]), LATE_RESULTS_DAYS);
  const [gamesRes, updatedRes] = await Promise.all([
    results.getMemberGames(memberId),
    tournaments.searchUpdatedTournaments(
      `${month}-01T00:00:00`,
      `${toLocalIsoDate(searchEnd < now ? searchEnd : now)}T23:59:59`
    ),
  ]);
  for (const r of [gamesRes, updatedRes]) {
    if (r.status !== 200 || !r.data) {
      return { status: r.status, error: r.error ?? 'Failed to fetch games or tournaments' };
    }
  }

  // The player's games per group, for the groups with updates around the month.
  const updatedGroups = new Map<number, { group: TournamentClassGroupDto; tournament: TournamentDto }>();
  for (const tournament of updatedRes.data!) {
    for (const group of allGroups(tournament.rootClasses)) updatedGroups.set(group.id, { group, tournament });
  }
  const gamesByGroup = new Map<number, GameDto[]>();
  for (const game of gamesRes.data!) {
    if (!updatedGroups.has(game.groupiD)) continue;
    gamesByGroup.set(game.groupiD, [...(gamesByGroup.get(game.groupiD) ?? []), game]);
  }

  // Round results date the games: a game's tournamentResultID is its round result row.
  const groupIds = [...gamesByGroup.keys()];
  const roundResults = await Promise.all(groupIds.map((id) => results.getTournamentRoundResults(id)));
  const failed = roundResults.find((r) => r.status !== 200 || !r.data);
  if (failed) return { status: failed.status, error: failed.error ?? 'Failed to fetch round results' };

  const counted: CountedGame[] = [];
  groupIds.forEach((groupId, i) => {
    const { group, tournament } = updatedGroups.get(groupId)!;
    const rows = new Map(roundResults[i].data!.map((row) => [row.id, row]));
    const ratedByRound = new Map((group.tournamentRounds ?? []).map((r) => [r.roundNumber, r.rated]));
    for (const game of gamesByGroup.get(groupId)!) {
      const row = rows.get(game.tournamentResultID);
      const date = row?.date?.slice(0, 10);
      if (!row || !date?.startsWith(month)) continue;
      const timeControl = getRatingTypeFromRoundRated(ratedByRound.get(row.roundNr));
      if (timeControl !== 'standard' && timeControl !== 'rapid' && timeControl !== 'blitz') continue;
      const isWhite = game.whiteId === memberId;
      const opponentId = isWhite ? game.blackId : game.whiteId;
      if (getOpponentKind(opponentId) !== 'paired') continue;
      if (isWalkoverResultCode(game.result) || isTouristBye(game.result)) continue;
      const outcome = getPlayerOutcome(game.result, isWhite);
      if (!outcome) continue;
      counted.push({
        timeControl,
        tournament,
        groupId,
        roundNr: row.roundNr,
        date,
        opponentId,
        score: outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0,
      });
    }
  });
  if (counted.length === 0) return empty;

  // Everyone's rating on the month's list.
  const ids = [memberId, ...new Set(counted.map((g) => g.opponentId))];
  const lookups = await players.getPlayerInfoBatch(ids, listDate);
  const lookupFailed = lookups.find((r) => r.error);
  if (lookupFailed) return { status: lookupFailed.status, error: lookupFailed.error! };
  const info = new Map<number, PlayerInfoDto>();
  lookups.forEach((r, i) => r.data && info.set(ids[i], r.data));
  const me = info.get(memberId);
  const ratingIn = (p: PlayerInfoDto | undefined, tc: RatedTimeControl) =>
    getPlayerRatingByRoundType(p?.elo, { standard: 1, rapid: 2, blitz: 3 }[tc]).rating;

  const estimates: EstimatedRatingChange[] = [];
  for (const timeControl of ['standard', 'rapid', 'blitz'] as const) {
    const rating = ratingIn(me, timeControl);
    if (!rating) continue;
    const games = counted
      .filter((g) => g.timeControl === timeControl)
      .map((g) => ({ g, opponentRating: ratingIn(info.get(g.opponentId), timeControl) }))
      .filter((x): x is { g: CountedGame; opponentRating: number } => !!x.opponentRating)
      .sort((a, b) => a.g.date.localeCompare(b.g.date) || a.g.groupId - b.g.groupId || a.g.roundNr - b.g.roundNr);
    if (games.length === 0) continue;

    const storedK = getKFactorForRating(timeControl, rating, me?.elo, me?.birthdate, listDate);
    const k = Math.min(storedK, Math.floor(MAX_K_TIMES_GAMES / games.length));
    const capped = !(timeControl === 'standard' && rating >= STANDARD_UNCAPPED_FROM);

    const gameList: EstimatedGame[] = games.map(({ g, opponentRating }) => {
      const expectedScore = calculateExpectedScore(rating, opponentRating, { capped });
      return {
        tournamentId: g.tournament.id,
        tournamentName: g.tournament.name,
        groupId: g.groupId,
        roundNr: g.roundNr,
        date: g.date,
        opponentId: g.opponentId,
        opponentRating,
        score: g.score,
        expectedScore,
        change: round1(k * (g.score - expectedScore)),
      };
    });
    const score = gameList.reduce((s, g) => s + g.score, 0);
    const expectedScore = round2(gameList.reduce((s, g) => s + g.expectedScore, 0));
    const change = roundFide(k * (score - expectedScore));
    estimates.push({
      timeControl,
      rating,
      k,
      games: gameList.length,
      score,
      expectedScore,
      change,
      estimatedRating: rating + change,
      gameList,
    });
  }

  return { status: 200, data: { memberId, month, estimates } };
}
