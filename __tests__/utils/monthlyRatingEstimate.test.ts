/**
 * Unit tests for estimateMonthlyRatingChange, with stubbed services.
 */

import { vi } from 'vitest';
import { estimateMonthlyRatingChange } from '../../src/utils/monthlyRatingEstimate';
import { calculateExpectedScore } from '../../src/utils/eloCalculations';
import { ResultCode } from '../../src/utils/gameResults';
import type { PlayerService } from '../../src/services/players';
import type { ResultsService } from '../../src/services/results';
import type { TournamentService } from '../../src/services/tournaments';
import type { GameDto, PlayerInfoDto, TournamentDto, TournamentRoundResultDto } from '../../src/types';
import { PlayerService as LivePlayerService } from '../../src/services/players';
import { ResultsService as LiveResultsService } from '../../src/services/results';
import { TournamentService as LiveTournamentService } from '../../src/services/tournaments';
import { CURRENT_TEST_API_URL } from '../../src/constants';
import { ssfUnreachable } from '../helpers/liveProbe';

const ME = 1;

/** A group with one round per entry: [roundNumber, rated]. */
function group(id: number, rounds: [number, number][]) {
  return { id, tournamentRounds: rounds.map(([roundNumber, rated]) => ({ roundNumber, rated })) };
}

function tournament(id: number, groups: ReturnType<typeof group>[]): TournamentDto {
  return { id, name: `T${id}`, rootClasses: [{ groups, subClasses: [] }] } as unknown as TournamentDto;
}

/** One round result row holding one game. */
interface Row {
  rowId: number;
  groupId: number;
  roundNr: number;
  date: string;
  whiteId: number;
  blackId: number;
  result: number;
}

function player(id: number, elo: Partial<PlayerInfoDto['elo']>, birthdate = '1980-01-01'): PlayerInfoDto {
  return { id, birthdate, elo } as unknown as PlayerInfoDto;
}

function setup(tournaments: TournamentDto[], rows: Row[], people: PlayerInfoDto[]) {
  const games: GameDto[] = rows.map((r, i) => ({
    id: i,
    tournamentResultID: r.rowId,
    tableNr: 1,
    whiteId: r.whiteId,
    blackId: r.blackId,
    result: r.result,
    pgn: '',
    groupiD: r.groupId,
  }));
  const roundResults = (groupId: number): TournamentRoundResultDto[] =>
    rows
      .filter((r) => r.groupId === groupId)
      .map((r) => ({ id: r.rowId, groupdId: groupId, roundNr: r.roundNr, date: r.date } as unknown as TournamentRoundResultDto));
  const byId = new Map(people.map((p) => [p.id, p]));

  const results = {
    getMemberGames: vi.fn().mockResolvedValue({ status: 200, data: games }),
    getTournamentRoundResults: vi.fn((id: number) => Promise.resolve({ status: 200, data: roundResults(id) })),
  };
  const tournamentService = {
    searchUpdatedTournaments: vi.fn().mockResolvedValue({ status: 200, data: tournaments }),
  };
  const players = {
    getPlayerInfoBatch: vi.fn((ids: number[], _date?: Date) =>
      Promise.resolve(
        ids.map((id) => {
          const p = byId.get(id);
          return p ? { data: p, error: null, status: 200 } : { data: null, error: null, status: 204 };
        })
      )
    ),
  };
  return {
    results,
    tournamentService,
    players,
    options: {
      resultsService: results as unknown as ResultsService,
      tournamentService: tournamentService as unknown as TournamentService,
      playerService: players as unknown as PlayerService,
    },
  };
}

describe('estimateMonthlyRatingChange', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 16, 10, 0, 0)); // 16 Nov 2026, local time
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts rated, played games in the month per time control', async () => {
    const t = tournament(100, [
      group(10, [[1, 2], [2, 2], [3, 2], [4, 0], [5, 2], [6, 2]]), // rapid, round 4 unrated
      group(11, [[1, 1]]), // standard
    ]);
    const { options, results, tournamentService, players } = setup(
      [t],
      [
        { rowId: 1, groupId: 10, roundNr: 1, date: '2026-11-08', whiteId: ME, blackId: 2, result: ResultCode.WHITE_WIN },
        { rowId: 2, groupId: 10, roundNr: 2, date: '2026-11-08', whiteId: 3, blackId: ME, result: ResultCode.DRAW },
        { rowId: 3, groupId: 10, roundNr: 3, date: '2026-11-08', whiteId: ME, blackId: 4, result: ResultCode.WHITE_WIN }, // opponent has no rapid rating
        { rowId: 4, groupId: 10, roundNr: 4, date: '2026-11-08', whiteId: ME, blackId: 2, result: ResultCode.WHITE_WIN }, // unrated round
        { rowId: 5, groupId: 10, roundNr: 5, date: '2026-11-09', whiteId: ME, blackId: -1, result: ResultCode.WHITE_WIN_WO }, // walkover
        { rowId: 6, groupId: 10, roundNr: 6, date: '2026-10-31', whiteId: ME, blackId: 2, result: ResultCode.WHITE_WIN }, // last month
        { rowId: 7, groupId: 11, roundNr: 1, date: '2026-11-02', whiteId: 5, blackId: ME, result: ResultCode.DRAW },
        { rowId: 8, groupId: 99, roundNr: 1, date: '2026-11-02', whiteId: ME, blackId: 2, result: ResultCode.WHITE_WIN }, // group without updates
      ],
      [
        player(ME, { rating: 1500, k: 20, rapidRating: 1500, rapidk: 40 }),
        player(2, { rapidRating: 1600 }),
        player(3, { rapidRating: 1400 }),
        player(4, { rating: 1700 }),
        player(5, { rating: 1500 }),
      ]
    );

    const res = await estimateMonthlyRatingChange(ME, { month: '2026-11', ...options });

    expect(res.status).toBe(200);
    const [standard, rapid] = res.data!.estimates;
    expect(res.data!.estimates.map((e) => e.timeControl)).toEqual(['standard', 'rapid']);

    expect(standard).toMatchObject({ rating: 1500, k: 20, games: 1, score: 0.5, change: 0, estimatedRating: 1500 });

    const expected = calculateExpectedScore(1500, 1600) + calculateExpectedScore(1500, 1400);
    expect(rapid).toMatchObject({ rating: 1500, k: 40, games: 2, score: 1.5 });
    expect(rapid.expectedScore).toBeCloseTo(expected);
    expect(rapid.change).toBe(Math.round(40 * (1.5 - expected)));
    expect(rapid.estimatedRating).toBe(1500 + rapid.change);
    expect(rapid.gameList.map((g) => [g.opponentId, g.score])).toEqual([[2, 1], [3, 0.5]]);
    expect(rapid.gameList[0]).toMatchObject({ tournamentId: 100, tournamentName: 'T100', groupId: 10, roundNr: 1, date: '2026-11-08', opponentRating: 1600 });

    expect(tournamentService.searchUpdatedTournaments).toHaveBeenCalledWith('2026-11-01T00:00:00', '2026-11-16T23:59:59');
    expect(results.getTournamentRoundResults.mock.calls.map((c) => c[0]).sort()).toEqual([10, 11]);
    expect(players.getPlayerInfoBatch.mock.calls[0][1]).toEqual(new Date(2026, 10, 1));
  });

  it('caps K so that K × games ≤ 700', async () => {
    const rounds = Array.from({ length: 20 }, (_, i): [number, number] => [i + 1, 2]);
    const rows = rounds.map(([n]) => ({ rowId: n, groupId: 10, roundNr: n, date: '2026-11-08', whiteId: ME, blackId: 2, result: ResultCode.WHITE_WIN }));
    const { options } = setup([tournament(100, [group(10, rounds)])], rows, [
      player(ME, { rapidRating: 1500, rapidk: 40 }),
      player(2, { rapidRating: 1500 }),
    ]);

    const rapid = (await estimateMonthlyRatingChange(ME, { month: '2026-11', ...options })).data!.estimates[0];
    expect(rapid).toMatchObject({ games: 20, k: 35, score: 20, expectedScore: 10, change: 350 });
  });

  it('rounds the month total half away from zero', async () => {
    const run = async (result: number) => {
      const { options } = setup(
        [tournament(100, [group(10, [[1, 1]])])],
        [{ rowId: 1, groupId: 10, roundNr: 1, date: '2026-11-08', whiteId: ME, blackId: 2, result }],
        [player(ME, { rating: 1500, k: 15 }), player(2, { rating: 1500 })]
      );
      return (await estimateMonthlyRatingChange(ME, { month: '2026-11', ...options })).data!.estimates[0];
    };
    expect((await run(ResultCode.WHITE_WIN)).change).toBe(8); // 7.5
    expect((await run(ResultCode.BLACK_WIN)).change).toBe(-8); // -7.5
    expect((await run(ResultCode.BLACK_WIN)).gameList[0].change).toBe(-7.5);
  });

  it('leaves out a time control the player has no rating in', async () => {
    const { options } = setup(
      [tournament(100, [group(10, [[1, 3]])])],
      [{ rowId: 1, groupId: 10, roundNr: 1, date: '2026-11-08', whiteId: ME, blackId: 2, result: ResultCode.WHITE_WIN }],
      [player(ME, { rating: 1500, rapidRating: 1500 }), player(2, { blitzRating: 1500 })]
    );
    const res = await estimateMonthlyRatingChange(ME, { month: '2026-11', ...options });
    expect(res).toEqual({ status: 200, data: { memberId: ME, month: '2026-11', estimates: [] } });
  });

  it('searches results entered up to 7 days after a past month', async () => {
    const { options, tournamentService, players } = setup([], [], []);
    const res = await estimateMonthlyRatingChange(ME, { month: '2026-10', ...options });
    expect(tournamentService.searchUpdatedTournaments).toHaveBeenCalledWith('2026-10-01T00:00:00', '2026-11-07T23:59:59');
    expect(res.data!.estimates).toEqual([]);
    expect(players.getPlayerInfoBatch).not.toHaveBeenCalled();
  });

  it('defaults to the current month and returns nothing for a future month', async () => {
    const { options, results } = setup([], [], []);
    expect((await estimateMonthlyRatingChange(ME, options)).data!.month).toBe('2026-11');

    const future = await estimateMonthlyRatingChange(ME, { month: '2026-12', ...options });
    expect(future.data!.estimates).toEqual([]);
    expect(results.getMemberGames).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid month', async () => {
    const { options } = setup([], [], []);
    expect((await estimateMonthlyRatingChange(ME, { month: '2026-13', ...options })).status).toBe(400);
    expect((await estimateMonthlyRatingChange(ME, { month: 'nov', ...options })).status).toBe(400);
  });

  it('returns the error rather than a partial estimate when a request fails', async () => {
    const t = tournament(100, [group(10, [[1, 2]])]);
    const rows = [{ rowId: 1, groupId: 10, roundNr: 1, date: '2026-11-08', whiteId: ME, blackId: 2, result: ResultCode.WHITE_WIN }];
    const people = [player(ME, { rapidRating: 1500, rapidk: 40 }), player(2, { rapidRating: 1500 })];

    const a = setup([t], rows, people);
    a.results.getMemberGames.mockResolvedValue({ status: 500, error: 'boom' });
    expect(await estimateMonthlyRatingChange(ME, { month: '2026-11', ...a.options })).toEqual({ status: 500, error: 'boom' });

    const b = setup([t], rows, people);
    b.results.getTournamentRoundResults.mockResolvedValue({ status: 408, error: 'timeout' } as never);
    expect((await estimateMonthlyRatingChange(ME, { month: '2026-11', ...b.options })).status).toBe(408);

    const c = setup([t], rows, people);
    c.players.getPlayerInfoBatch.mockResolvedValue([{ data: null, error: 'down', status: 503 }] as never);
    expect(await estimateMonthlyRatingChange(ME, { month: '2026-11', ...c.options })).toEqual({ status: 503, error: 'down' });
  });
});

// Live check against a known month, so a drift in how games, rounds and
// ratings line up shows. The ratings come from the 2026-11 list, so they're fixed.
const SSF_DOWN = await ssfUnreachable();

describe.skipIf(SSF_DOWN)('estimateMonthlyRatingChange (live)', () => {
  it('values Olle Svensson\'s November 2026 rapid games at +60 (Farsta SK JGP 2026)', async () => {
    const res = await estimateMonthlyRatingChange(642062, {
      month: '2026-11',
      tournamentService: new LiveTournamentService(CURRENT_TEST_API_URL),
      resultsService: new LiveResultsService(CURRENT_TEST_API_URL),
      playerService: new LivePlayerService(CURRENT_TEST_API_URL),
    });
    expect(res.status).toBe(200);
    const rapid = res.data!.estimates.find((e) => e.timeControl === 'rapid')!;
    const jgp = rapid.gameList.filter((g) => g.groupId === 19418);
    expect(jgp).toHaveLength(5); // 7 rounds, 2 against unrated opponents
    expect(rapid).toMatchObject({ rating: 1521, k: 40 });
    expect(Math.round(jgp.reduce((s, g) => s + g.change, 0))).toBe(60);
  }, 60_000);
});
