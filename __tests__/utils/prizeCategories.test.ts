import { describe, it, expect } from 'vitest';
import { Sex } from '../../src/utils/ratingUtils';
import {
  PrizeCategoryType,
  isPrizeCategory,
  parsePrizeCategory,
  resolvePrizeMembers,
} from '../../src/utils/prizeCategories';
import type { PrizeCategoryDto, TournamentEndResultDto } from '../../src/types';

const cat = (
  over: Partial<PrizeCategoryDto> & Pick<PrizeCategoryDto, 'type' | 'start' | 'end'>
): PrizeCategoryDto =>
  ({ id: 1, name: 'X', groupid: 1, order: 0, usagetype: 1, andlogic: -1, ...over });

/** Standings row carrying just what the prize rules read. `rating` maps to the
 *  primary standard rating unless `elo` is given explicitly (for fallback tests). */
const player = (
  contenderId: number,
  opts: { rating?: number | null; birth?: string; sex?: number; elo?: Record<string, number> } = {}
): TournamentEndResultDto =>
  ({
    contenderId,
    place: contenderId,
    playerInfo: {
      id: contenderId,
      firstName: 'A',
      lastName: 'B',
      birthdate: opts.birth ?? '2000',
      sex: opts.sex ?? Sex.MALE,
      elo: opts.elo ?? (opts.rating === null ? null : { rating: opts.rating ?? 1500 }),
    },
  }) as never;

// rankingAlgorithm 1 = standard rating, matching what the standings table shows.
const opts = { tournamentYear: 2025, rankingAlgorithm: 1 };

describe('isPrizeCategory', () => {
  it('is true for a prize (usagetype 1), false for a registration restriction (2)', () => {
    expect(isPrizeCategory(cat({ type: 4, start: 0, end: 0, usagetype: 1 }))).toBe(true);
    expect(isPrizeCategory(cat({ type: 5, start: 0, end: 0, usagetype: 2 }))).toBe(false);
  });
});

describe('parsePrizeCategory', () => {
  it('parses RATING to Elo bounds', () => {
    expect(parsePrizeCategory(cat({ type: 4, start: 1575, end: 1718 })))
      .toEqual({ kind: 'rating', min: 1575, max: 1718 });
  });
  it('parses AGE to age bounds', () => {
    expect(parsePrizeCategory(cat({ type: 1, start: 10, end: 13 })))
      .toEqual({ kind: 'age', minAge: 10, maxAge: 13 });
  });
  it('parses SENIOR to a bounds-less rule', () => {
    expect(parsePrizeCategory(cat({ type: 3, start: 0, end: 50 }))).toEqual({ kind: 'senior' });
    expect(parsePrizeCategory(cat({ type: 3, start: -1, end: -1 }))).toEqual({ kind: 'senior' });
  });
  it('parses WOMEN to a bounds-less rule (bounds are not applied)', () => {
    expect(parsePrizeCategory(cat({ type: 2, start: 1400, end: 2500 }))).toEqual({ kind: 'women' });
    expect(parsePrizeCategory(cat({ type: 2, start: 0, end: 0 }))).toEqual({ kind: 'women' });
    expect(parsePrizeCategory(cat({ type: 2, start: -1, end: -1 }))).toEqual({ kind: 'women' });
  });
  it('parses SMCLASS and unknown types', () => {
    expect(parsePrizeCategory(cat({ type: 5, start: 0, end: 0 }))).toEqual({ kind: 'smclass' });
    expect(parsePrizeCategory(cat({ type: 99, start: 0, end: 0 }))).toEqual({ kind: 'unknown', type: 99 });
  });
});

describe('resolvePrizeMembers — rating bands', () => {
  const band = cat({ type: PrizeCategoryType.RATING, start: 1500, end: 1600 });

  it('includes both bounds and excludes just outside', () => {
    const rows = [
      player(1, { rating: 1499 }),
      player(2, { rating: 1500 }),
      player(3, { rating: 1600 }),
      player(4, { rating: 1601 }),
    ];
    expect(resolvePrizeMembers(band, rows, opts)).toEqual([2, 3]);
  });

  it('excludes an unrated player from a band that does not start at 0', () => {
    const rows = [player(1, { rating: null }), player(2, { rating: 1550 })];
    expect(resolvePrizeMembers(band, rows, opts)).toEqual([2]);
  });

  it('returns ids in the order they appear in results', () => {
    const rows = [player(3, { rating: 1550 }), player(1, { rating: 1500 })];
    expect(resolvePrizeMembers(band, rows, opts)).toEqual([3, 1]);
  });
});

describe('resolvePrizeMembers — unrated players and the bottom band', () => {
  // A band starting at 0 is the organiser's catch-all for unrated/beginners.
  // Regression: grp 16643 had 12 such players; the band matched nobody.
  const bottom = cat({ type: PrizeCategoryType.RATING, start: 0, end: 1000, name: 'R3' });

  it('includes unrated players (rating 0 and null) in a band starting at 0', () => {
    const rows = [player(1, { rating: 0 }), player(2, { rating: null }), player(3, { rating: 1500 })];
    expect(resolvePrizeMembers(bottom, rows, opts)).toEqual([1, 2]);
  });

  it('still respects the upper bound for rated players', () => {
    const rows = [player(1, { rating: 999 }), player(2, { rating: 1001 })];
    expect(resolvePrizeMembers(bottom, rows, opts)).toEqual([1]);
  });

  it('includes unrated women in a women band starting at 0', () => {
    const dam = cat({ type: PrizeCategoryType.WOMEN, start: 0, end: 1200 });
    const rows = [player(1, { sex: Sex.FEMALE, rating: null }), player(2, { sex: Sex.MALE, rating: null })];
    expect(resolvePrizeMembers(dam, rows, opts)).toEqual([1]);
  });
});

describe('resolvePrizeMembers — fallback ratings count', () => {
  // rankingAlgorithm 10 = rapid > standard(fallback) > blitz(fallback). A player
  // with no rapid rating but a standard one is banded on that fallback rating —
  // as the federation does. Verified vs resultat.schack.se: Umegård (2063 std,
  // no rapid) listed under R2 (1998-2090) in SM i snabbschack 2025 (grp 16584).
  const R2 = cat({ type: PrizeCategoryType.RATING, start: 1998, end: 2090, name: 'R2' });
  const rapidOpts = { tournamentYear: 2025, rankingAlgorithm: 10 };

  it('bands a fallback-rated player on their fallback rating', () => {
    const umegard = player(1, { elo: { rating: 2063, blitzRating: 1958 } }); // no rapidRating
    expect(resolvePrizeMembers(R2, [umegard], rapidOpts)).toEqual([1]);
  });

  it('a player with no rating at all still needs a zero-start band', () => {
    const noRating = player(2, { elo: {} });
    expect(resolvePrizeMembers(R2, [noRating], rapidOpts)).toEqual([]);
  });
});

describe('resolvePrizeMembers — age bands', () => {
  // Real Manhemknatten 2025 band: '2013' declared as ages 12-12.
  const born2013 = cat({ type: PrizeCategoryType.AGE, start: 12, end: 12, name: '2013' });

  it('computes age as tournamentYear - birthYear', () => {
    const rows = [player(1, { birth: '2012' }), player(2, { birth: '2013' }), player(3, { birth: '2014' })];
    expect(resolvePrizeMembers(born2013, rows, opts)).toEqual([2]);
  });

  it('accepts a full date and an open-ended junior band', () => {
    const junior = cat({ type: PrizeCategoryType.AGE, start: 0, end: 20 });
    const rows = [player(1, { birth: '2010-05-01' }), player(2, { birth: '1980' })];
    expect(resolvePrizeMembers(junior, rows, opts)).toEqual([1]);
  });

  it('excludes players with no birthdate', () => {
    expect(resolvePrizeMembers(born2013, [player(1, { birth: '' })], opts)).toEqual([]);
  });

  it('never matches the synthetic walkover row (-100, birthdate 1970)', () => {
    const veteranAges = cat({ type: PrizeCategoryType.AGE, start: 0, end: 100 });
    const rows = [player(-100, { birth: '1970' }), player(5, { birth: '2000' })];
    expect(resolvePrizeMembers(veteranAges, rows, opts)).toEqual([5]);
  });
});

describe('resolvePrizeMembers — senior (age >= 60, bounds ignored)', () => {
  // Confirmed by schack.se: SENIOR is age >= 60 regardless of the row's bounds.
  const senior = cat({ type: PrizeCategoryType.SENIOR, start: 0, end: 50 }); // junk bounds, ignored

  it('matches players aged 60+ and ignores the bounds', () => {
    const rows = [
      player(1, { birth: '1965' }), // 60
      player(2, { birth: '1966' }), // 59
      player(3, { birth: '1959' }), // 66
    ];
    expect(resolvePrizeMembers(senior, rows, opts)).toEqual([1, 3]);
  });

  it('applies the age-60 cutoff for women too (born 1965 in, 1966 out)', () => {
    const rows = [player(1, { birth: '1965', sex: Sex.FEMALE }), player(2, { birth: '1966', sex: Sex.FEMALE })];
    expect(resolvePrizeMembers(senior, rows, opts)).toEqual([1]);
  });

  it('excludes a player with no birthdate', () => {
    expect(resolvePrizeMembers(senior, [player(1, { birth: '' })], opts)).toEqual([]);
  });
});

describe('resolvePrizeMembers — women (female only, bounds ignored)', () => {
  it('matches every female; excludes male and unrecorded', () => {
    const dam = cat({ type: PrizeCategoryType.WOMEN, start: 0, end: 0, name: 'Dam' });
    const rows = [
      player(1, { sex: Sex.FEMALE, rating: 1200 }),
      player(2, { sex: Sex.MALE, rating: 2000 }),
      player(3, { sex: Sex.UNRECORDED, rating: 1800 }),
    ];
    expect(resolvePrizeMembers(dam, rows, opts)).toEqual([1]);
  });

  it('ignores a rating band on a women prize — every female is eligible', () => {
    // Verified vs resultat.schack.se: unrated Yeganeh Ranjbar is listed under
    // "Dampris 1400-2500" (group 16129), and a rated-below-band woman is too.
    const dampris = cat({ type: PrizeCategoryType.WOMEN, start: 1400, end: 2500, name: 'Dampris' });
    const rows = [
      player(1, { sex: Sex.FEMALE, rating: 1399 }), // below the band — still in
      player(2, { sex: Sex.FEMALE, rating: 1500 }),
      player(3, { sex: Sex.FEMALE, rating: null }), // unrated (the Yeganeh case) — in
      player(4, { sex: Sex.MALE, rating: 1500 }),
    ];
    expect(resolvePrizeMembers(dampris, rows, opts)).toEqual([1, 2, 3]);
  });
});

describe('resolvePrizeMembers — smclass / unknown', () => {
  it('matches nobody for SM class or an unknown type', () => {
    const rows = [player(1, { birth: '1950' }), player(2, { rating: 1500 })];
    expect(resolvePrizeMembers(cat({ type: PrizeCategoryType.SMCLASS, start: 0, end: 0 }), rows, opts)).toEqual([]);
    expect(resolvePrizeMembers(cat({ type: 99, start: 0, end: 3000 }), rows, opts)).toEqual([]);
  });
});

describe('resolvePrizeMembers — non-prize categories are rejected', () => {
  it('returns [] for a registration restriction (usagetype 2), not a plausible-wrong list', () => {
    // "Rankingspärr 1750": a rating-type entry restriction, not a prize. Without
    // the guard it would return every player rated <= 1750.
    const bar = cat({ type: PrizeCategoryType.RATING, start: 0, end: 1750, usagetype: 2, name: 'Rankingspärr 1750' });
    const rows = [player(1, { rating: 1500 }), player(2, { rating: 1200 })];
    expect(resolvePrizeMembers(bar, rows, opts)).toEqual([]);
  });
});
