import {
  getMonthStart,
  getMonthStartString,
  normalizeEloLookupDate,
  getPlayerDateCacheKey,
  parseLocalDate
} from '../../src/utils/dateUtils';

describe('dateUtils', () => {
  describe('getMonthStart', () => {
    it('should return first day of month at midnight', () => {
      const midMonth = new Date('2026-01-15T14:30:00').getTime();
      const result = new Date(getMonthStart(midMonth));

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(1);
    });

    it('should handle first day of month', () => {
      const firstDay = new Date('2026-03-01T00:00:00').getTime();
      const result = new Date(getMonthStart(firstDay));

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(2); // March
      expect(result.getDate()).toBe(1);
    });

    it('should handle last day of month', () => {
      const lastDay = new Date('2026-01-31T23:59:59').getTime();
      const result = new Date(getMonthStart(lastDay));

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(1);
    });
  });

  describe('getMonthStartString', () => {
    it('should return YYYY-MM-01 format', () => {
      const date = new Date('2026-01-15').getTime();
      expect(getMonthStartString(date)).toBe('2026-01-01');
    });

    it('should pad single digit months', () => {
      const date = new Date('2026-03-20').getTime();
      expect(getMonthStartString(date)).toBe('2026-03-01');
    });

    it('should handle December correctly', () => {
      const date = new Date('2026-12-25').getTime();
      expect(getMonthStartString(date)).toBe('2026-12-01');
    });
  });

  describe('normalizeEloLookupDate', () => {
    beforeEach(() => {
      // Mock Date.now to return January 15, 2026
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-01-15T12:00:00').getTime());
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return month-start for current month dates', () => {
      const midJanuary = new Date('2026-01-20').getTime();
      const result = new Date(normalizeEloLookupDate(midJanuary));

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(1);
    });

    it('should return month-start for past month dates', () => {
      const december = new Date('2025-12-15').getTime();
      const result = new Date(normalizeEloLookupDate(december));

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(11); // December
      expect(result.getDate()).toBe(1);
    });

    it('should fall back to current month for future month dates', () => {
      const february = new Date('2026-02-13').getTime();
      const result = new Date(normalizeEloLookupDate(february));

      // Should return January (current month), not February
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(1);
    });

    it('should fall back to current month for dates far in the future', () => {
      const farFuture = new Date('2027-06-15').getTime();
      const result = new Date(normalizeEloLookupDate(farFuture));

      // Should return January 2026 (current month)
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(1);
    });
  });

  describe('getPlayerDateCacheKey', () => {
    it('should generate key in playerId-YYYY-MM-01 format', () => {
      const date = new Date('2026-01-15').getTime();
      expect(getPlayerDateCacheKey(12345, date)).toBe('12345-2026-01-01');
    });

    it('should normalize date to month start', () => {
      const midMonth = new Date('2026-03-20').getTime();
      const lastDay = new Date('2026-03-31').getTime();

      // Both should produce same cache key
      expect(getPlayerDateCacheKey(999, midMonth)).toBe('999-2026-03-01');
      expect(getPlayerDateCacheKey(999, lastDay)).toBe('999-2026-03-01');
    });

    it('should handle different player IDs', () => {
      const date = new Date('2026-01-01').getTime();
      expect(getPlayerDateCacheKey(1, date)).toBe('1-2026-01-01');
      expect(getPlayerDateCacheKey(999999, date)).toBe('999999-2026-01-01');
    });
  });

  describe('parseLocalDate', () => {
    it('should parse YYYY-MM-DD as local midnight', () => {
      const result = parseLocalDate('2026-03-02');
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(2); // March (0-indexed)
      expect(result.getDate()).toBe(2);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should differ from new Date() for date-only strings in non-UTC timezones', () => {
      // parseLocalDate always creates local midnight
      const local = parseLocalDate('2026-06-15');
      expect(local.getFullYear()).toBe(2026);
      expect(local.getMonth()).toBe(5); // June
      expect(local.getDate()).toBe(15);
      expect(local.getHours()).toBe(0);
    });

    it('should handle January correctly', () => {
      const result = parseLocalDate('2026-01-01');
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(1);
    });

    it('should handle December correctly', () => {
      const result = parseLocalDate('2026-12-31');
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(31);
    });
  });
});
