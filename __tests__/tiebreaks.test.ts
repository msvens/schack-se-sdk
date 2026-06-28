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
  isEstimated
} from '../src/utils/tiebreaks';
import { TiebreakSystem } from '../src/index';
import { ResultsService } from '../src/index';
import { CURRENT_TEST_API_URL } from '../src/constants';
import { TEST_RESULTS_GROUP_ID } from './test-data';

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
  test('SSF Buchholz = cut-1 + wins·0.01 + gamesWithBlack·0.0001', () => {
    const v = computeSsfSecPoints(TiebreakSystem.SSF_BUCHHOLZ, {
      opponentScores: [4, 5, 6], // cut-1 = 11
      sbContributions: [],
      wins: 6,
      gamesWithBlack: 4,
      hasVoluntaryUnplayed: false
    });
    expect(v).toBeCloseTo(11.0604, 10);
  });

  test('a bye spends the cut on the dummy → plain Buchholz base (Art 16.5.1)', () => {
    const v = computeSsfSecPoints(TiebreakSystem.SSF_BUCHHOLZ, {
      opponentScores: [4, 5, 6], // plain Buchholz = 15 (no real cut)
      sbContributions: [],
      wins: 3,
      gamesWithBlack: 4,
      hasVoluntaryUnplayed: true
    });
    expect(v).toBeCloseTo(15.0304, 10);
  });

  test('returns null for systems we do not model yet', () => {
    expect(isSsfSecPointsSupported(TiebreakSystem.SSF_BUCHHOLZ)).toBe(true);
    expect(isSsfSecPointsSupported(TiebreakSystem.SSF_BERGER)).toBe(false);
    const v = computeSsfSecPoints(TiebreakSystem.SSF_BERGER, {
      opponentScores: [4, 5],
      sbContributions: [],
      wins: 1,
      gamesWithBlack: 1,
      hasVoluntaryUnplayed: false
    });
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

describe('getRoundStandings reproduces official secPoints (integration)', () => {
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
