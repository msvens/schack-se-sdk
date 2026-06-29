/**
 * Tests for round-by-round standings replay.
 *
 * Unit tests run on hand-built fixtures (no network). The integration block
 * mirrors __tests__/results.test.ts: it hits the live SSF API and validates the
 * core guarantee — that replayed cumulative points reproduce the official
 * standings `points` column exactly.
 */

import { ResultsService, TiebreakSystem, getTiebreakSystemName } from '../src/index';
// The engine is internal (not part of the public API); test it via its module path.
import { computeRoundStandings } from '../src/utils/roundStandings';
import type { TournamentRoundResultDto } from '../src/types';
import { CURRENT_TEST_API_URL } from '../src/constants';
import { TEST_RESULTS_GROUP_ID, TEST_RESULTS_TEAM_GROUP_ID, TEST_RESULTS_BERGER_GROUP_ID } from './test-data';

/** Build a single individual pairing for a round. */
function pairing(
  roundNr: number,
  homeId: number,
  awayId: number,
  homeResult: number,
  awayResult: number,
  finalized = true
): TournamentRoundResultDto {
  return {
    id: 0,
    groupdId: 0,
    roundNr,
    board: 0,
    homeId,
    homeTeamNumber: 0,
    awayId,
    awayTeamNumber: 0,
    homeResult,
    awayResult,
    date: '',
    finalized,
    publisher: 0,
    publishDate: '',
    publishedNote: '',
    games: []
  };
}

/** Build a team match for a round, with composite id:teamNumber identities. */
function teamMatch(
  roundNr: number,
  home: [id: number, teamNumber: number],
  away: [id: number, teamNumber: number],
  homeResult: number,
  awayResult: number,
  finalized = true
): TournamentRoundResultDto {
  const p = pairing(roundNr, home[0], away[0], homeResult, awayResult, finalized);
  p.homeTeamNumber = home[1];
  p.awayTeamNumber = away[1];
  return p;
}

const BYE_ID = -100;

describe('computeRoundStandings (unit)', () => {
  // 4-player round robin, standard 1/0.5/0 scoring.
  // R1: 1>2 (1-0), 3=4 (0.5-0.5)
  // R2: 1>3 (1-0), 4>2 (away wins, 0-1)
  // R3: 1=4 (0.5-0.5), 2>3 (1-0)
  const roundRobin: TournamentRoundResultDto[] = [
    pairing(1, 1, 2, 1, 0),
    pairing(1, 3, 4, 0.5, 0.5),
    pairing(2, 1, 3, 1, 0),
    pairing(2, 2, 4, 0, 1),
    pairing(3, 1, 4, 0.5, 0.5),
    pairing(3, 2, 3, 1, 0)
  ];

  test('produces one snapshot per distinct round, ordered ascending', () => {
    const snapshots = computeRoundStandings(roundRobin, { mode: 'individual' });
    expect(snapshots.map((s) => s.round)).toEqual([1, 2, 3]);
  });

  test('individual with no known tiebreak system is flagged as an estimate', () => {
    const snap = computeRoundStandings(roundRobin, { mode: 'individual' })[0];
    expect(snap.secondaryBasis).toBe('indicative');
    expect(snap.estimated).toBe(true);
  });

  test('cumulative points are exact after each round', () => {
    const snapshots = computeRoundStandings(roundRobin, { mode: 'individual' });

    const pointsAfter = (round: number) => {
      const snap = snapshots.find((s) => s.round === round)!;
      return new Map(snap.rows.map((r) => [r.contenderId, r.points]));
    };

    expect(pointsAfter(1)).toEqual(new Map([[1, 1], [2, 0], [3, 0.5], [4, 0.5]]));
    expect(pointsAfter(2)).toEqual(new Map([[1, 2], [2, 0], [3, 0.5], [4, 1.5]]));
    expect(pointsAfter(3)).toEqual(new Map([[1, 2.5], [2, 1], [3, 0.5], [4, 2]]));
  });

  test('quality points equal the sum of opponents cumulative points (Buchholz)', () => {
    const final = computeRoundStandings(roundRobin, { mode: 'individual' }).find((s) => s.round === 3)!;
    const qp = new Map(final.rows.map((r) => [r.contenderId, r.qualityPoints]));

    // Final points: 1=2.5, 2=1, 3=0.5, 4=2
    // P1 opps 2,3,4 -> 1 + 0.5 + 2   = 3.5
    // P2 opps 1,4,3 -> 2.5 + 2 + 0.5 = 5
    // P3 opps 4,1,2 -> 2 + 2.5 + 1   = 5.5
    // P4 opps 3,2,1 -> 0.5 + 1 + 2.5 = 4
    expect(qp.get(1)).toBe(3.5);
    expect(qp.get(2)).toBe(5);
    expect(qp.get(3)).toBe(5.5);
    expect(qp.get(4)).toBe(4);
  });

  test('Sonneborn-Berger weights opponents by your result against them', () => {
    const final = computeRoundStandings(roundRobin, { mode: 'individual', qualityMetric: 'sonneborn-berger' })
      .find((s) => s.round === 3)!;
    const sb = new Map(final.rows.map((r) => [r.contenderId, r.qualityPoints]));

    // Final points: 1=2.5, 2=1, 3=0.5, 4=2
    // SB1 = 1·score(2) + 1·score(3) + 0.5·score(4) = 1 + 0.5 + 1   = 2.5
    // SB3 = 0.5·score(4) + 0·score(1) + 0·score(2) = 1 + 0 + 0     = 1
    expect(sb.get(1)).toBe(2.5);
    expect(sb.get(3)).toBe(1);
  });

  test('individual rows omit team-only fields', () => {
    const row = computeRoundStandings(roundRobin, { mode: 'individual' })[0].rows[0];
    expect(row.matchPoints).toBeUndefined();
    expect(row.teamNumber).toBeUndefined();
    expect(typeof row.qualityPoints).toBe('number');
  });

  test('W/D/L and gamesPlayed track real games', () => {
    const final = computeRoundStandings(roundRobin, { mode: 'individual' }).find((s) => s.round === 3)!;
    const p1 = final.rows.find((r) => r.contenderId === 1)!;
    expect(p1).toMatchObject({ wins: 2, draws: 1, losses: 0, gamesPlayed: 3 });
  });

  test('quality points break a points tie', () => {
    // R1: A(1)>B(2), C(3)>D(4)
    // R2: A(1)>C(3), D(4)>B(2)
    // After R2: A=2, B=0, C=1, D=1  -> C and D tie on points
    // C opps: D(1), A(2) -> QP 3 ; D opps: C(1), B(0) -> QP 1  => C above D
    const data = [
      pairing(1, 1, 2, 1, 0),
      pairing(1, 3, 4, 1, 0),
      pairing(2, 1, 3, 1, 0),
      pairing(2, 2, 4, 0, 1)
    ];
    const rows = computeRoundStandings(data, { mode: 'individual' }).find((s) => s.round === 2)!.rows;
    expect(rows.map((r) => r.contenderId)).toEqual([1, 3, 4, 2]);
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3, 4]);
  });

  test('contenders tied on points and quality share a rank in stable order', () => {
    // After R1: A(1)=1, C(3)=1 (both beat an opponent on 0 points -> QP 0 tie)
    const data = [pairing(1, 1, 2, 1, 0), pairing(1, 3, 4, 1, 0)];
    const rows = computeRoundStandings(data, { mode: 'individual' }).find((s) => s.round === 1)!.rows;
    // A and C are fully tied -> share rank 1, kept in first-seen order.
    expect(rows.filter((r) => r.points === 1).map((r) => r.contenderId)).toEqual([1, 3]);
    expect(rows.filter((r) => r.points === 1).map((r) => r.rank)).toEqual([1, 1]);
  });

  test('byes credit points but add no opponent, game, or W/D/L', () => {
    const data = [pairing(1, 1, BYE_ID, 1, 0)];
    const row = computeRoundStandings(data, { mode: 'individual' }).find((s) => s.round === 1)!.rows
      .find((r) => r.contenderId === 1)!;
    expect(row).toMatchObject({ points: 1, qualityPoints: 0, wins: 0, draws: 0, losses: 0, gamesPlayed: 0 });
    // The bye placeholder is not a contender.
    const ids = computeRoundStandings(data, { mode: 'individual' })[0].rows.map((r) => r.contenderId);
    expect(ids).toEqual([1]);
  });

  test('walkovers credit points but are not counted as games', () => {
    const data = [pairing(1, 1, -1, 1, 0)];
    const row = computeRoundStandings(data, { mode: 'individual' })[0].rows.find((r) => r.contenderId === 1)!;
    expect(row).toMatchObject({ points: 1, gamesPlayed: 0, qualityPoints: 0 });
  });

  test('SCHACK4AN 3/2/1 values accumulate without conversion', () => {
    // win=3, draw=2, loss=1 — engine sums the raw result values.
    const data = [
      pairing(1, 1, 2, 3, 1),
      pairing(2, 1, 2, 2, 2)
    ];
    const final = computeRoundStandings(data, { mode: 'individual' }).find((s) => s.round === 2)!;
    const p1 = final.rows.find((r) => r.contenderId === 1)!;
    const p2 = final.rows.find((r) => r.contenderId === 2)!;
    expect(p1.points).toBe(5); // 3 + 2
    expect(p2.points).toBe(3); // 1 + 2
  });

});

describe('computeRoundStandings (team mode)', () => {
  // 4 teams, 2 rounds, match points 2/1/0. Board totals in home/awayResult.
  // R1: 10>20 (3-1), 30=40 (2-2)
  // R2: 10>30 (2.5-1.5), 40>20 (away 1-3)
  const teamData: TournamentRoundResultDto[] = [
    teamMatch(1, [10, 1], [20, 1], 3, 1),
    teamMatch(1, [30, 1], [40, 1], 2, 2),
    teamMatch(2, [10, 1], [30, 1], 2.5, 1.5),
    teamMatch(2, [20, 1], [40, 1], 1, 3)
  ];

  test('ranks by match points, then board points', () => {
    const final = computeRoundStandings(teamData, { mode: 'team' }).find((s) => s.round === 2)!;
    expect(final.secondaryBasis).toBe('exact');
    expect(final.estimated).toBe(false);
    expect(final.rows.map((r) => r.contenderId)).toEqual([10, 40, 30, 20]);
    expect(final.rows.map((r) => r.matchPoints)).toEqual([4, 3, 1, 0]);
    expect(final.rows.map((r) => r.points)).toEqual([5.5, 5, 3.5, 2]);
    expect(final.rows.map((r) => r.rank)).toEqual([1, 2, 3, 4]);
  });

  test('match W/D/L and team-only fields', () => {
    const final = computeRoundStandings(teamData, { mode: 'team' }).find((s) => s.round === 2)!;
    const t40 = final.rows.find((r) => r.contenderId === 40)!;
    expect(t40).toMatchObject({ wins: 1, draws: 1, losses: 0, gamesPlayed: 2, teamNumber: 1 });
    expect(t40.qualityPoints).toBeUndefined();
  });

  test('board points break a match-points tie', () => {
    // R1: A(1)>B(2) 2.5-1.5, C(3)>D(4) 4-0 — A and C both on 2 match points
    const data = [
      teamMatch(1, [1, 1], [2, 1], 2.5, 1.5),
      teamMatch(1, [3, 1], [4, 1], 4, 0)
    ];
    const rows = computeRoundStandings(data, { mode: 'team' }).find((s) => s.round === 1)!.rows;
    // C (4 board) ranks above A (2.5 board)
    expect(rows.map((r) => r.contenderId)).toEqual([3, 1, 2, 4]);
  });

  test('teams of the same club are distinct rows by teamNumber', () => {
    const data = [
      teamMatch(1, [50, 1], [60, 1], 3, 1),
      teamMatch(1, [50, 2], [70, 1], 1, 3)
    ];
    const rows = computeRoundStandings(data, { mode: 'team' })[0].rows;
    const club50 = rows.filter((r) => r.contenderId === 50);
    expect(club50.length).toBe(2);
    expect(club50.map((r) => r.teamNumber).sort()).toEqual([1, 2]);
  });

  test('custom match-point scheme is honored', () => {
    const final = computeRoundStandings(teamData, {
      mode: 'team',
      matchPointValues: { win: 3, draw: 1, loss: 0 }
    }).find((s) => s.round === 2)!;
    const t10 = final.rows.find((r) => r.contenderId === 10)!;
    expect(t10.matchPoints).toBe(6); // two wins at 3 each
  });
});

describe('computeRoundStandings (Berger / round-robin)', () => {
  // 4-player single round robin. A(1) B(2) C(3) D(4).
  // R1: A>B (1-0), C=D (0.5-0.5)
  // R2: A>C (1-0), B>D (1-0)
  // R3: D>A (1-0), B>C (1-0)
  // Final points: A=2, B=2, C=0.5, D=1.5 — A and B tie on points.
  const rr: TournamentRoundResultDto[] = [
    pairing(1, 1, 2, 1, 0),
    pairing(1, 3, 4, 0.5, 0.5),
    pairing(2, 1, 3, 1, 0),
    pairing(2, 2, 4, 1, 0),
    pairing(3, 4, 1, 1, 0),
    pairing(3, 2, 3, 1, 0)
  ];

  test('ranks by inbördes resultat (direct encounter) before falling through', () => {
    const final = computeRoundStandings(rr, { mode: 'individual', qualityMetric: 'sonneborn-berger' })
      .find((s) => s.round === 3)!;
    // A and B both have 2 points; A beat B head-to-head, so inbördes puts A first.
    expect(final.rows.map((r) => r.contenderId)).toEqual([1, 2, 4, 3]);
    expect(final.rows.find((r) => r.contenderId === 1)!.rank).toBe(1);
    expect(final.rows.find((r) => r.contenderId === 2)!.rank).toBe(2);
  });

  test('still reports Sonneborn-Berger as the displayed qualityPoints', () => {
    const final = computeRoundStandings(rr, { mode: 'individual', qualityMetric: 'sonneborn-berger' })
      .find((s) => s.round === 3)!;
    // SB_A = 1·s(B) + 1·s(C) + 0·s(D) = 2 + 0.5 + 0 = 2.5
    expect(final.rows.find((r) => r.contenderId === 1)!.qualityPoints).toBe(2.5);
  });
});

describe('getTiebreakSystemName', () => {
  test('maps known values to SSF labels', () => {
    expect(getTiebreakSystemName(TiebreakSystem.BUCHHOLZ)).toBe('Buchholz');
    expect(getTiebreakSystemName(TiebreakSystem.SSF_BUCHHOLZ)).toBe('SSF Buchholz');
    expect(getTiebreakSystemName(TiebreakSystem.ALLSVENSKAN)).toBe('Allsvenskan');
    expect(getTiebreakSystemName(TiebreakSystem.FIDE_BUCHHOLZ_2024)).toBe('FIDE Buchholz 2024');
    expect(getTiebreakSystemName(TiebreakSystem.UNSET)).toBe('Unset');
  });

  test('surfaces unknown values rather than hiding them', () => {
    expect(getTiebreakSystemName(99)).toBe('Unknown (99)');
  });
});

describe('getRoundStandings (integration)', () => {
  let resultsService: ResultsService;

  beforeEach(() => {
    resultsService = new ResultsService(CURRENT_TEST_API_URL);
  });

  test('returns one snapshot per round', async () => {
    const response = await resultsService.getRoundStandings(TEST_RESULTS_GROUP_ID);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);

    if (response.data && response.data.length > 0) {
      const first = response.data[0];
      expect(typeof first.round).toBe('number');
      expect(Array.isArray(first.rows)).toBe(true);
      // Rounds are ascending.
      const rounds = response.data.map((s) => s.round);
      expect([...rounds].sort((a, b) => a - b)).toEqual(rounds);
    }
  }, 10000);

  test('final-round points exactly match the official standings table', async () => {
    const [replay, table] = await Promise.all([
      resultsService.getRoundStandings(TEST_RESULTS_GROUP_ID),
      resultsService.getTournamentResults(TEST_RESULTS_GROUP_ID)
    ]);

    if (!replay.data || replay.data.length === 0 || !table.data || table.data.length === 0) {
      return; // nothing to validate against
    }

    const finalSnapshot = replay.data[replay.data.length - 1];
    const computedPoints = new Map(finalSnapshot.rows.map((r) => [r.contenderId, r.points]));

    for (const official of table.data) {
      const computed = computedPoints.get(official.contenderId);
      expect(computed).toBeDefined();
      // Exact reproduction of the official points column.
      expect(computed).toBeCloseTo(official.points, 5);
    }
  }, 10000);

  test('auto-detects team mode and matches the official team table', async () => {
    const [replay, table] = await Promise.all([
      resultsService.getRoundStandings(TEST_RESULTS_TEAM_GROUP_ID),
      resultsService.getTeamTournamentResults(TEST_RESULTS_TEAM_GROUP_ID)
    ]);

    if (!replay.data || replay.data.length === 0 || !table.data || table.data.length === 0) {
      return;
    }

    const final = replay.data[replay.data.length - 1];
    // Team standings are exact, not an estimate.
    expect(final.secondaryBasis).toBe('exact');
    expect(final.estimated).toBe(false);
    // Team mode was detected: rows carry match points + teamNumber, no quality points.
    expect(final.rows[0].matchPoints).toBeDefined();
    expect(final.rows[0].teamNumber).toBeDefined();
    expect(final.rows[0].qualityPoints).toBeUndefined();

    const byKey = new Map(final.rows.map((r) => [`${r.contenderId}:${r.teamNumber}`, r]));
    for (const official of table.data) {
      const computed = byKey.get(`${official.contenderId}:${official.teamNumber}`);
      expect(computed).toBeDefined();
      // Official team `points` are match points; `secPoints` are board points.
      expect(computed!.matchPoints).toBeCloseTo(official.points, 5);
      expect(computed!.points).toBeCloseTo(official.secPoints, 5);
    }

    // The contract behind `estimated === false`: our ORDERING is the official
    // standings order, position for position.
    const ourOrder = final.rows.map((r) => `${r.contenderId}:${r.teamNumber}`);
    const officialOrder = [...table.data]
      .sort((a, b) => a.place - b.place)
      .map((o) => `${o.contenderId}:${o.teamNumber}`);
    expect(ourOrder).toEqual(officialOrder);
  }, 15000);

  test('round-robin (Berger) group reproduces the official order and self-verifies', async () => {
    const [replay, table] = await Promise.all([
      resultsService.getRoundStandings(TEST_RESULTS_BERGER_GROUP_ID),
      resultsService.getTournamentResults(TEST_RESULTS_BERGER_GROUP_ID)
    ]);
    if (!replay.data || replay.data.length === 0 || !table.data || table.data.length === 0) {
      return;
    }

    const final = replay.data[replay.data.length - 1];
    // Berger order (inbördes → SB → wins → black) matches the official place order,
    // so the final round self-verifies; earlier rounds stay estimated.
    const ourOrder = final.rows.map((r) => r.contenderId);
    const officialOrder = [...table.data].sort((a, b) => a.place - b.place).map((o) => o.contenderId);
    expect(ourOrder).toEqual(officialOrder);
    expect(final.secondaryBasis).toBe('verified');
    expect(final.estimated).toBe(false);
    if (replay.data.length > 1) {
      expect(replay.data[0].estimated).toBe(true); // intermediate rounds not verified
    }
  }, 15000);
});
