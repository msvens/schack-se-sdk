/**
 * Unit tests for the tournament performance list (getIndividualPerformance).
 * The end-to-end check against the official list is in
 * individualPerformanceOfficial.test.ts.
 */

import {
  getIndividualPerformance,
  getIndividualPerformanceLookups,
  hasIndividualPerformance,
  MIN_RATED_GAMES_FOR_PERFORMANCE,
  type PlayerAt,
} from '../../src/utils/individualPerformance';
import { calculatePerformanceRating } from '../../src/utils/eloCalculations';
import { ResultCode, PointSystem } from '../../src/utils/gameResults';
import { RoundRatedType } from '../../src/utils/ratingUtils';
import { RatingAlgorithm } from '../../src/types/ratingAlgorithm';
import type {
  MemberFIDERatingDTO,
  TournamentClassGroupDto,
  TournamentDto,
  TournamentRoundResultDto,
} from '../../src/types';

const { WHITE_WIN, BLACK_WIN, DRAW, WHITE_WIN_WO, NOT_SET, SCHACK4AN_WHITE_WIN } = ResultCode;
const { STANDARD, RAPID, UNRATED } = RoundRatedType;

function group(
  id: number,
  rounds: [roundNumber: number, rated: number][],
  over: Partial<TournamentClassGroupDto> = {}
): TournamentClassGroupDto {
  return {
    id,
    pointSystem: PointSystem.DEFAULT,
    rankingAlgorithm: RatingAlgorithm.STANDARD_ELO,
    tournamentRounds: rounds.map(([roundNumber, rated]) => ({ roundNumber, rated })),
    ...over,
  } as TournamentClassGroupDto;
}

function tournament(...groups: TournamentClassGroupDto[]): TournamentDto {
  return { id: 1, rootClasses: [{ groups, subClasses: [] }] } as unknown as TournamentDto;
}

/** One round-result row; each game is [whiteId, blackId, resultCode]. */
function row(roundNr: number, date: string, ...games: [number, number, number][]): TournamentRoundResultDto {
  return {
    roundNr,
    date,
    games: games.map(([whiteId, blackId, result]) => ({ whiteId, blackId, result })),
  } as TournamentRoundResultDto;
}

const elo = (rating: number, rapidRating = 0): MemberFIDERatingDTO =>
  ({ rating, rapidRating, blitzRating: 0 }) as MemberFIDERatingDTO;

/** playerAt from a fixed id → elo map; the round date is ignored unless a per-date map is given. */
const ratings = (byId: Record<number, MemberFIDERatingDTO>): PlayerAt =>
  (id) => (byId[id] ? { elo: byId[id] } : undefined);

const rowOf = (rows: ReturnType<typeof getIndividualPerformance>, playerId: number) =>
  rows.find((r) => r.playerId === playerId)!;

describe('getIndividualPerformance', () => {
  const players = ratings({ 1: elo(1500), 2: elo(1600), 3: elo(1700), 4: elo(1800) });
  const standardRounds = (n: number) => Array.from({ length: n }, (_, i) => [i + 1, STANDARD] as [number, number]);

  it('counts games, W/D/L, points and performance per player', () => {
    const t = tournament(group(10, standardRounds(3)));
    const rounds = new Map([[10, [
      row(1, '2026-09-05', [1, 2, WHITE_WIN]),
      row(2, '2026-09-06', [3, 1, DRAW]),
      row(3, '2026-09-07', [1, 4, DRAW]),
    ]]]);
    const p1 = rowOf(getIndividualPerformance(t, rounds, players), 1);
    expect(p1).toEqual({
      playerId: 1, groupIds: [10], games: 3, won: 1, drawn: 2, lost: 0, points: 2,
      ratedGames: 3, performance: calculatePerformanceRating([1600, 1700, 1800], 2),
    });
  });

  it(`needs ${MIN_RATED_GAMES_FOR_PERFORMANCE} rated games for a performance`, () => {
    const t = tournament(group(10, standardRounds(3)));
    const two = new Map([[10, [row(1, '2026-09-05', [1, 2, DRAW]), row(2, '2026-09-06', [1, 3, DRAW])]]]);
    expect(rowOf(getIndividualPerformance(t, two, players), 1)).toMatchObject({ ratedGames: 2, performance: null });
    const three = new Map([[10, [...two.get(10)!, row(3, '2026-09-07', [1, 4, DRAW])]]]);
    expect(rowOf(getIndividualPerformance(t, three, players), 1)).toMatchObject({ ratedGames: 3, performance: 1700 });
  });

  it('leaves out groups with Schackfyran (3/2/1) scoring', () => {
    const t = tournament(
      group(10, [[1, STANDARD]]),
      group(20, [[1, STANDARD]], { pointSystem: PointSystem.SCHACK4AN })
    );
    const rounds = new Map([
      [10, [row(1, '2026-09-05', [1, 2, WHITE_WIN])]],
      [20, [row(1, '2026-09-05', [3, 4, SCHACK4AN_WHITE_WIN])]],
    ]);
    expect(getIndividualPerformance(t, rounds, players).map((r) => r.groupIds)).toEqual([[10], [10]]);
  });

  it('counts walkovers and byes in games (SP) only', () => {
    const t = tournament(group(10, standardRounds(5)));
    const rounds = new Map([[10, [
      row(1, '2026-09-05', [1, 2, WHITE_WIN_WO]),   // walkover by result code
      row(2, '2026-09-06', [1, -100, WHITE_WIN]),   // bye
      row(3, '2026-09-07', [1, 2, DRAW]),
      row(4, '2026-09-08', [1, 3, DRAW]),
      row(5, '2026-09-09', [1, 4, DRAW]),
    ]]]);
    expect(rowOf(getIndividualPerformance(t, rounds, players), 1)).toEqual({
      playerId: 1, groupIds: [10], games: 5, won: 0, drawn: 3, lost: 0, points: 1.5,
      ratedGames: 3, performance: calculatePerformanceRating([1600, 1700, 1800], 1.5),
    });
  });

  it('counts a game against a walkover placeholder with an ordinary result, but never rates it', () => {
    // Stockholmsserien 2025/2026: "W.O - Lo Strimling 0 - 1" (opponent id -1, code BLACK_WIN) is a win
    const t = tournament(group(10, standardRounds(2)));
    const rounds = new Map([[10, [
      row(1, '2026-09-05', [-1, 1, BLACK_WIN]),
      row(2, '2026-09-06', [-1, 1, ResultCode.BLACK_WIN_WO]), // a walkover code: not counted
    ]]]);
    const asked: number[] = [];
    const rows = getIndividualPerformance(t, rounds, (id) => { asked.push(id); return undefined; });
    expect(rowOf(rows, 1)).toMatchObject({ games: 2, won: 1, points: 1, ratedGames: 0, performance: null });
    expect(asked).toEqual([]);
    expect(getIndividualPerformanceLookups(t, rounds)).toEqual([]);
  });

  it('skips non-countable results entirely', () => {
    const t = tournament(group(10, standardRounds(2)));
    const rounds = new Map([[10, [
      row(1, '2026-09-05', [1, 2, NOT_SET]),
      row(2, '2026-09-06', [1, 3, WHITE_WIN]),
    ]]]);
    expect(rowOf(getIndividualPerformance(t, rounds, players), 1)).toMatchObject({ games: 1, won: 1 });
  });

  it('counts unrated rounds in the record but not in performance', () => {
    const t = tournament(group(10, [[1, UNRATED], ...standardRounds(4).slice(1)]));
    const rounds = new Map([[10, [
      row(1, '2026-09-05', [1, 2, WHITE_WIN]),
      row(2, '2026-09-06', [1, 2, DRAW]),
      row(3, '2026-09-07', [1, 3, DRAW]),
      row(4, '2026-09-08', [1, 4, DRAW]),
    ]]]);
    expect(rowOf(getIndividualPerformance(t, rounds, players), 1)).toMatchObject({
      games: 4, won: 1, drawn: 3, points: 2.5, ratedGames: 3,
      performance: calculatePerformanceRating([1600, 1700, 1800], 1.5),
    });
  });

  it('leaves unrated opponents out of performance, and needs no rating for the player', () => {
    const t = tournament(group(10, standardRounds(4)));
    const rounds = new Map([[10, [
      row(1, '2026-09-05', [9, 2, WHITE_WIN]),   // 9 is unrated
      row(2, '2026-09-06', [9, 3, WHITE_WIN]),
      row(3, '2026-09-07', [9, 4, WHITE_WIN]),
      row(4, '2026-09-08', [9, 8, WHITE_WIN]),   // 8 is unrated too
    ]]]);
    const rows = getIndividualPerformance(t, rounds, ratings({ 2: elo(1600), 3: elo(1700), 4: elo(1800) }));
    expect(rowOf(rows, 9)).toMatchObject({ games: 4, won: 4, ratedGames: 3, performance: 1700 + 800 });
    expect(rowOf(rows, 8)).toMatchObject({ games: 1, lost: 1, ratedGames: 0, performance: null });
  });

  it("pools a mixed group into one performance, each game at its round's rating type", () => {
    const t = tournament(group(10, [[1, RAPID], [2, STANDARD], [3, STANDARD]]));
    const rounds = new Map([[10, [
      row(1, '2026-09-05', [1, 2, WHITE_WIN]),
      row(2, '2026-09-06', [1, 3, BLACK_WIN]),
      row(3, '2026-09-07', [1, 4, DRAW]),
    ]]]);
    const mixed = ratings({ 1: elo(1500, 1550), 2: elo(1600, 1650), 3: elo(1700, 1750), 4: elo(1800, 1850) });
    const p1 = rowOf(getIndividualPerformance(t, rounds, mixed), 1);
    expect(p1.ratedGames).toBe(3);
    // round 1 at 2's rapid 1650; rounds 2–3 at standard 1700 and 1800
    expect(p1.performance).toBe(calculatePerformanceRating([1650, 1700, 1800], 1.5));
  });

  it('falls back to the group algorithm for a round missing from tournamentRounds', () => {
    const t = tournament(group(10, [], { rankingAlgorithm: RatingAlgorithm.RAPID_ELO }));
    const rounds = new Map([[10, [
      row(1, '2026-09-05', [1, 2, DRAW]),
      row(2, '2026-09-06', [1, 3, DRAW]),
      row(3, '2026-09-07', [1, 4, DRAW]),
    ]]]);
    const rapid = ratings({ 1: elo(1500, 1550), 2: elo(1600, 1650), 3: elo(1700, 1750), 4: elo(1800, 1850) });
    expect(rowOf(getIndividualPerformance(t, rounds, rapid), 1).performance).toBe(1750);
  });

  it('asks playerAt for the round date of each game', () => {
    const t = tournament(group(10, standardRounds(3)));
    const rounds = new Map([[10, [
      row(1, '2026-08-30', [1, 2, DRAW]),
      row(2, '2026-09-06', [1, 2, DRAW]),
      row(3, '2026-09-07', [1, 2, DRAW]),
    ]]]);
    const byDate: PlayerAt = (id, date) => (id === 2 ? { elo: elo(date < '2026-09-01' ? 1600 : 1700) } : undefined);
    expect(rowOf(getIndividualPerformance(t, rounds, byDate), 1).performance)
      .toBe(calculatePerformanceRating([1600, 1700, 1700], 1.5));
  });

  it('handles team groups, whose rows hold one game per board', () => {
    const t = tournament(group(10, standardRounds(3), { playersinteam: 2 }));
    const rounds = new Map([[10, [
      row(1, '2026-09-05', [1, 3, WHITE_WIN], [4, 2, DRAW]),
      row(2, '2026-09-06', [1, 4, WHITE_WIN], [3, 2, DRAW]),
      row(3, '2026-09-07', [2, 1, DRAW], [3, 4, DRAW]),
    ]]]);
    const rows = getIndividualPerformance(t, rounds, players);
    expect(rows.map((r) => r.playerId).sort()).toEqual([1, 2, 3, 4]);
    expect(rowOf(rows, 2)).toMatchObject({
      games: 3, drawn: 3, performance: calculatePerformanceRating([1800, 1700, 1500], 1.5),
    });
  });

  it('keeps one row per player across groups, finding groups in subclasses too', () => {
    const t = {
      id: 1,
      rootClasses: [{
        groups: [group(10, standardRounds(2))],
        subClasses: [{ groups: [group(20, standardRounds(1))], subClasses: [] }],
      }],
    } as unknown as TournamentDto;
    const rounds = new Map([
      [10, [row(1, '2026-09-05', [1, 2, WHITE_WIN]), row(2, '2026-09-06', [4, 1, DRAW])]],
      [20, [row(1, '2026-09-05', [1, 3, BLACK_WIN])]],
    ]);
    const rows = getIndividualPerformance(t, rounds, players).filter((r) => r.playerId === 1);
    expect(rows).toEqual([{
      playerId: 1, groupIds: [10, 20], games: 3, won: 1, drawn: 1, lost: 1, points: 1.5,
      ratedGames: 3, performance: calculatePerformanceRating([1600, 1800, 1700], 1.5),
    }]);
  });

  it('pools rated games across groups for the 3-game minimum (team leagues)', () => {
    // Like Benjamin Lang Sohl in Stockholmsserien 2025/2026: 2 games in one division, 2 in another.
    const t = tournament(group(10, standardRounds(2)), group(20, standardRounds(2)));
    const rounds = new Map([
      [10, [row(1, '2026-09-05', [1, 2, WHITE_WIN]), row(2, '2026-09-06', [3, 1, BLACK_WIN])]],
      [20, [row(1, '2026-09-12', [1, 4, WHITE_WIN]), row(2, '2026-09-13', [2, 1, BLACK_WIN])]],
    ]);
    const p1 = rowOf(getIndividualPerformance(t, rounds, players), 1);
    expect(p1).toMatchObject({ games: 4, won: 4, ratedGames: 4 });
    expect(p1.performance).toBe(calculatePerformanceRating([1600, 1700, 1800, 1600], 4));
  });

  it("rates each game by its own group's algorithm", () => {
    const t = tournament(
      group(10, [], { rankingAlgorithm: RatingAlgorithm.STANDARD_ELO }),
      group(20, [], { rankingAlgorithm: RatingAlgorithm.RAPID_ELO })
    );
    const rounds = new Map([
      [10, [row(1, '2026-09-05', [1, 2, DRAW])]],
      [20, [row(1, '2026-09-06', [1, 3, DRAW]), row(2, '2026-09-07', [1, 4, DRAW])]],
    ]);
    const mixed = ratings({ 1: elo(1500, 1550), 2: elo(1600, 1650), 3: elo(1700, 1750), 4: elo(1800, 1850) });
    // group 10: 2's standard 1600; group 20: rapid 1750 and 1850
    expect(rowOf(getIndividualPerformance(t, rounds, mixed), 1).performance)
      .toBe(calculatePerformanceRating([1600, 1750, 1850], 1.5));
  });

  it('orders groupIds by games played, ties in encounter order', () => {
    const t = tournament(group(10, standardRounds(1)), group(20, standardRounds(2)), group(30, standardRounds(1)));
    const rounds = new Map([
      [10, [row(1, '2026-09-05', [1, 2, DRAW])]],
      [20, [row(1, '2026-09-06', [1, 3, DRAW]), row(2, '2026-09-07', [1, 4, DRAW])]],
      [30, [row(1, '2026-09-08', [1, 2, DRAW])]],
    ]);
    expect(rowOf(getIndividualPerformance(t, rounds, players), 1).groupIds).toEqual([20, 10, 30]);
  });

  it('skips groups missing from the round-results map', () => {
    const t = tournament(group(10, [[1, STANDARD]]), group(20, [[1, STANDARD]]));
    const rounds = new Map([[10, [row(1, '2026-09-05', [1, 2, WHITE_WIN])]]]);
    expect(getIndividualPerformance(t, rounds, players).map((r) => r.groupIds)).toEqual([[10], [10]]);
  });

  it('sorts by performance, highest first, players without one last, ties in encounter order', () => {
    const t = tournament(group(10, standardRounds(3)));
    const round = (n: number) =>
      row(n, `2026-09-0${n}`, [1, 2, DRAW], [3, 4, DRAW], [5, 9, WHITE_WIN], [6, 7, WHITE_WIN]);
    const rounds = new Map([[10, [round(1), round(2), round(3)]]]);
    const equal = ratings({ 1: elo(1600), 2: elo(1600), 3: elo(1600), 4: elo(1600), 6: elo(1500), 7: elo(1500) });
    const order = getIndividualPerformance(t, rounds, equal).map((r) => [r.playerId, r.performance]);
    expect(order).toEqual([
      [6, 2300], [1, 1600], [2, 1600], [3, 1600], [4, 1600], [7, 700], [5, null], [9, null],
    ]);
  });
});

describe('getIndividualPerformanceLookups', () => {
  it('lists exactly the lookups getIndividualPerformance makes, deduplicated', () => {
    const t = tournament(
      group(10, [[1, STANDARD], [2, UNRATED], [3, STANDARD]]),
      group(20, [[1, STANDARD]], { pointSystem: PointSystem.SCHACK4AN })
    );
    const rounds = new Map([
      [10, [
        row(1, '2026-09-05', [1, 2, WHITE_WIN], [3, 4, WHITE_WIN_WO]),
        row(2, '2026-09-06', [1, 3, DRAW]),          // unrated round
        row(3, '2026-09-05', [1, -100, WHITE_WIN], [2, 1, DRAW]),
      ]],
      [20, [row(1, '2026-09-05', [5, 6, SCHACK4AN_WHITE_WIN])]],
    ]);

    const asked = new Set<string>();
    getIndividualPerformance(t, rounds, (id, date) => { asked.add(`${id}@${date}`); return undefined; });

    const lookups = getIndividualPerformanceLookups(t, rounds);
    expect(new Set(lookups.map((l) => `${l.playerId}@${l.roundDate}`))).toEqual(asked);
    expect(lookups).toHaveLength(asked.size);
    expect(asked).toEqual(new Set(['1@2026-09-05', '2@2026-09-05']));
  });
});

describe('hasIndividualPerformance', () => {
  const rounds = (...rated: number[]) => rated.map((r, i) => [i + 1, r] as [number, number]);

  it('is true when a non-Schackfyran group is rated', () => {
    expect(hasIndividualPerformance(tournament(group(10, rounds(STANDARD, STANDARD))))).toBe(true);
    // unrated algorithm, but the rounds carry a rated type
    expect(hasIndividualPerformance(tournament(group(10, rounds(RAPID), { rankingAlgorithm: RatingAlgorithm.NO_RATING })))).toBe(true);
    // unrated rounds, but the algorithm gives a type
    expect(hasIndividualPerformance(tournament(group(10, rounds(UNRATED), { rankingAlgorithm: RatingAlgorithm.RAPID_ELO })))).toBe(true);
  });

  it('is false for unrated, LASK-only and Schackfyran-only tournaments', () => {
    // Like Minior-Lag-DM 2025 (group 17042): no rating algorithm, every round unrated
    expect(hasIndividualPerformance(tournament(group(10, rounds(UNRATED, UNRATED), { rankingAlgorithm: RatingAlgorithm.NO_RATING })))).toBe(false);
    expect(hasIndividualPerformance(tournament(group(10, [], { rankingAlgorithm: RatingAlgorithm.LASK })))).toBe(false);
    expect(hasIndividualPerformance(tournament(group(10, rounds(RAPID), { pointSystem: PointSystem.SCHACK4AN })))).toBe(false);
  });

  it('is true when any one group qualifies', () => {
    expect(hasIndividualPerformance(tournament(
      group(10, rounds(UNRATED), { rankingAlgorithm: RatingAlgorithm.NO_RATING }),
      group(20, rounds(STANDARD))
    ))).toBe(true);
  });
});
