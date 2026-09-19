import { NO_PLACE, isUnplaced, hasStandings } from '../src/types/results';

const row = (place: number) => ({ place });

describe('NO_PLACE', () => {
  it('is the 1000 sentinel SSF returns before a group has results', () => {
    expect(NO_PLACE).toBe(1000);
  });
});

describe('isUnplaced', () => {
  it('recognises the sentinel from a result row or a raw place value', () => {
    expect(isUnplaced(row(NO_PLACE))).toBe(true);
    expect(isUnplaced(NO_PLACE)).toBe(true);
  });

  it('returns false for real placements', () => {
    expect(isUnplaced(row(1))).toBe(false);
    expect(isUnplaced(row(72))).toBe(false);
    expect(isUnplaced(1)).toBe(false);
  });

  it('treats a missing result as unplaced rather than throwing', () => {
    expect(isUnplaced(null)).toBe(true);
    expect(isUnplaced(undefined)).toBe(true);
  });

  it('does not treat place 0 as the sentinel', () => {
    expect(isUnplaced(row(0))).toBe(false);
  });
});

describe('hasStandings', () => {
  it('is false when every row carries the sentinel (not-yet-started group)', () => {
    expect(hasStandings([row(NO_PLACE), row(NO_PLACE), row(NO_PLACE)])).toBe(false);
  });

  it('is true for a played group with real placements', () => {
    expect(hasStandings([row(1), row(2), row(3)])).toBe(true);
  });

  it('is true when only some rows are placed', () => {
    // Not observed live - groups are all-or-nothing - but a single real place
    // still means placement order carries information.
    expect(hasStandings([row(NO_PLACE), row(1)])).toBe(true);
  });

  it('is false for an empty or missing result set', () => {
    expect(hasStandings([])).toBe(false);
    expect(hasStandings(null)).toBe(false);
    expect(hasStandings(undefined)).toBe(false);
  });
});
