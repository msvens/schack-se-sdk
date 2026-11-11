/**
 * Tie-break engine tests.
 *
 * Unit tests cover the FIDE base methods (Layer A) and the reverse-engineered
 * SSF packing (Layer B). The integration block validates, against the live SSF
 * API, that the playback's individual `qualityPoints` reproduce the official
 * `secPoints` for a supported tie-break system (SSF Buchholz / group 15816).
 */

import {
  buchholz,
  buchholzCut1,
  medianBuchholz,
  sonnebornBerger,
  computeSsfSecPoints,
  isSsfSecPointsSupported,
  secondaryBasis,
  isEstimated,
  orderingMatchesOfficial,
  type TiebreakContext
} from '../src/utils/tiebreaks';
import { TiebreakSystem } from '../src/index';
import { ResultsService } from '../src/index';
import { CURRENT_TEST_API_URL } from '../src/constants';
import { TEST_RESULTS_GROUP_ID, TEST_UNPLAYED_ROUNDS_GROUP_ID } from './test-data';
import { ssfUnreachable } from './helpers/liveProbe';

// Only the integration block below hits the network; skip it when SSF is
// unreachable (outage → skipped, not failed). The unit blocks always run.
const SSF_DOWN = await ssfUnreachable();

describe('FIDE base methods', () => {
  test('buchholz sums opponent scores', () => {
    expect(buchholz([5, 6.5, 3])).toBe(14.5);
    expect(buchholz([])).toBe(0);
  });

  test('buchholz cut-1 drops the single lowest opponent', () => {
    expect(buchholzCut1([5, 6.5, 3])).toBe(11.5); // drop 3
    expect(buchholzCut1([4])).toBe(0); // nothing left after cut
    expect(buchholzCut1([])).toBe(0);
  });

  test('median buchholz drops highest and lowest', () => {
    expect(medianBuchholz([5, 6.5, 3, 4])).toBe(9); // drop 6.5 and 3 -> 5+4
    expect(medianBuchholz([5, 3])).toBe(0); // too few
  });

  test('sonneborn-berger weights opponent score by result', () => {
    expect(
      sonnebornBerger([
        { opponentScore: 5, myResult: 1 },
        { opponentScore: 6.5, myResult: 0.5 },
        { opponentScore: 4, myResult: 0 }
      ])
    ).toBe(8.25); // 5 + 3.25 + 0
  });
});

describe('SSF packing (reverse-engineered)', () => {
  /** A context with no unplayed rounds; override per test. */
  const ctx = (o: Partial<TiebreakContext>): TiebreakContext => ({
    opponentScores: [],
    opponentAbsentRounds: [],
    sbContributions: [],
    ownScore: 0,
    wins: 0,
    gamesWithBlack: 0,
    unplayedWon: 0,
    unplayedLost: 0,
    absentRounds: 0,
    ...o
  });

  test('SSF Buchholz = cut-1 + wins·0.01 + gamesWithBlack·0.0001', () => {
    const v = computeSsfSecPoints(
      TiebreakSystem.SSF_BUCHHOLZ,
      ctx({ opponentScores: [4, 5, 6], opponentAbsentRounds: [0, 0, 0], wins: 6, gamesWithBlack: 4 }) // cut-1 = 11
    );
    expect(v).toBeCloseTo(11.0604, 10);
  });

  test('a won bye or walkover is a fictive opponent with the player\'s own score', () => {
    // 7271/19418, player 676308: walkover win in round 1, then 4.5, 5.5, 4.5, 4.5, 5.5, 4.5.
    // Fictive 5.5 joins them and the lowest (4.5) is cut: 29 + 5.5 − 4.5 = 30.
    const v = computeSsfSecPoints(
      TiebreakSystem.SSF_BUCHHOLZ,
      ctx({ opponentScores: [4.5, 5.5, 4.5, 4.5, 5.5, 4.5], opponentAbsentRounds: [0, 0, 0, 0, 0, 0], ownScore: 5.5, wins: 4, gamesWithBlack: 3, unplayedWon: 1 })
    );
    expect(v).toBeCloseTo(30.0403, 10);
  });

  test('a lost walkover counts 0 (and is the one cut)', () => {
    // 7271/19418, player 759974: walkover loss in round 1, then 3, 1, 3.5, 4, 1, 2.5 → 15.
    const v = computeSsfSecPoints(
      TiebreakSystem.SSF_BUCHHOLZ,
      ctx({ opponentScores: [3, 1, 3.5, 4, 1, 2.5], opponentAbsentRounds: [0, 0, 0, 0, 0, 0], ownScore: 2.5, wins: 2, gamesWithBlack: 3, unplayedLost: 1 })
    );
    expect(v).toBeCloseTo(15.0203, 10);
  });

  test('a single value is not cut: a round-1 walkover win is worth 1', () => {
    const v = computeSsfSecPoints(TiebreakSystem.SSF_BUCHHOLZ, ctx({ ownScore: 1, wins: 1, unplayedWon: 1 }));
    expect(v).toBeCloseTo(1.01, 10);
    // A round-1 loss over the board: the opponent's 1 point counts.
    const loss = computeSsfSecPoints(TiebreakSystem.SSF_BUCHHOLZ, ctx({ opponentScores: [1], opponentAbsentRounds: [0], gamesWithBlack: 1 }));
    expect(loss).toBeCloseTo(1.0001, 10);
  });

  test('an opponent without a pairing in some rounds gets ½ per such round', () => {
    // Opponent on 1 point missed 4 rounds → 3; the 0 is cut: 5 + 3 = 8.
    const v = computeSsfSecPoints(
      TiebreakSystem.SSF_BUCHHOLZ,
      ctx({ opponentScores: [0, 1, 5], opponentAbsentRounds: [0, 4, 0] })
    );
    expect(v).toBeCloseTo(8, 10);
  });

  test('returns null for systems we do not model yet', () => {
    expect(isSsfSecPointsSupported(TiebreakSystem.SSF_BUCHHOLZ)).toBe(true);
    expect(isSsfSecPointsSupported(TiebreakSystem.SSF_BERGER)).toBe(false);
    const v = computeSsfSecPoints(TiebreakSystem.SSF_BERGER, ctx({ opponentScores: [4, 5], opponentAbsentRounds: [0, 0], wins: 1, gamesWithBlack: 1 }));
    expect(v).toBeNull();
  });
});

describe('secondaryBasis / estimated flag', () => {
  test('team standings are exact (not estimated)', () => {
    const b = secondaryBasis({ mode: 'team', tiebreakSystem: TiebreakSystem.ALLSVENSKAN, hasUnhandledUnplayed: false });
    expect(b).toBe('exact');
    expect(isEstimated(b)).toBe(false);
  });

  test('individual SSF Buchholz is reproduced (estimated, pending SSF)', () => {
    const b = secondaryBasis({ mode: 'individual', tiebreakSystem: TiebreakSystem.SSF_BUCHHOLZ, hasUnhandledUnplayed: false });
    expect(b).toBe('reproduced');
    expect(isEstimated(b)).toBe(true);
  });

  test('unmodeled / unknown individual systems are indicative (estimated)', () => {
    expect(secondaryBasis({ mode: 'individual', tiebreakSystem: TiebreakSystem.SSF_BERGER, hasUnhandledUnplayed: false })).toBe('indicative');
    expect(secondaryBasis({ mode: 'individual', tiebreakSystem: undefined, hasUnhandledUnplayed: false })).toBe('indicative');
    expect(isEstimated('indicative')).toBe(true);
  });
});

describe('orderingMatchesOfficial (self-verification)', () => {
  const official = new Map([['a', 1], ['b', 2], ['c', 3], ['d', 4]]);

  test('true when our order agrees with official place order', () => {
    expect(orderingMatchesOfficial(['a', 'b', 'c', 'd'], official)).toBe(true);
  });

  test('false when our order contradicts official (a swap)', () => {
    expect(orderingMatchesOfficial(['a', 'c', 'b', 'd'], official)).toBe(false);
  });

  test('false when a contender is missing from the official table', () => {
    expect(orderingMatchesOfficial(['a', 'b', 'x'], official)).toBe(false);
  });

  test('official ties (equal places) are allowed in either order', () => {
    const tied = new Map([['a', 1], ['b', 1], ['c', 3]]);
    expect(orderingMatchesOfficial(['a', 'b', 'c'], tied)).toBe(true);
    expect(orderingMatchesOfficial(['b', 'a', 'c'], tied)).toBe(true);
  });

  test('empty ordering does not verify', () => {
    expect(orderingMatchesOfficial([], official)).toBe(false);
  });
});

describe.skipIf(SSF_DOWN)('getRoundStandings reproduces official secPoints (integration)', () => {
  test('SSF Buchholz group: qualityPoints match official secPoints', async () => {
    const service = new ResultsService(CURRENT_TEST_API_URL);
    const [replay, table] = await Promise.all([
      service.getRoundStandings(TEST_RESULTS_GROUP_ID),
      service.getTournamentResults(TEST_RESULTS_GROUP_ID)
    ]);

    if (!replay.data || replay.data.length === 0 || !table.data || table.data.length === 0) {
      return;
    }

    const final = replay.data[replay.data.length - 1];
    // SSF Buchholz is reproduced (reverse-engineered) → flagged as an estimate.
    expect(final.secondaryBasis).toBe('reproduced');
    expect(final.estimated).toBe(true);

    const byId = new Map(final.rows.map((r) => [r.contenderId, r]));

    // Group 15816 uses SSF Buchholz (tiebreakSystem 3), which we reproduce.
    // Each player's qualityPoints should match official secPoints to ~5 decimals
    // (the only gap is the undecoded sub-1e-5 packed field).
    let matched = 0;
    for (const official of table.data) {
      const computed = byId.get(official.contenderId);
      if (!computed || computed.qualityPoints == null) continue;
      expect(computed.qualityPoints).toBeCloseTo(official.secPoints, 4);
      matched++;
    }
    expect(matched).toBeGreaterThan(0);
  }, 10000);
});

describe.skipIf(SSF_DOWN)('getRoundStandings handles unplayed rounds like SSF (integration)', () => {
  // Farsta SK JGP 2026, Klass C (7271/19418): finished, with walkover wins and
  // losses between real players, byes and a player who withdrew after round 1.
  test('every player matches the official secPoints', async () => {
    const service = new ResultsService(CURRENT_TEST_API_URL);
    const [replay, table] = await Promise.all([
      service.getRoundStandings(TEST_UNPLAYED_ROUNDS_GROUP_ID),
      service.getTournamentResults(TEST_UNPLAYED_ROUNDS_GROUP_ID)
    ]);
    if (!replay.data?.length || !table.data?.length) return;

    const final = replay.data[replay.data.length - 1];
    const byId = new Map(final.rows.map((r) => [r.contenderId, r]));
    for (const official of table.data) {
      expect(byId.get(official.contenderId)?.qualityPoints).toBeCloseTo(official.secPoints, 3);
    }
    // Not 'verified': the official table splits some players tied on every field by lot.
  }, 15000);
});
