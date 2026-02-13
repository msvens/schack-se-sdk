/**
 * Unit tests for team formatting utilities
 */

import {
  toRomanNumeral,
  countTeamsByClub,
  formatTeamName,
  createTeamNameFormatter
} from '../../src/utils/teamFormatting';

describe('teamFormatting', () => {
  describe('toRomanNumeral', () => {
    it('should convert 1-10 correctly', () => {
      expect(toRomanNumeral(1)).toBe('I');
      expect(toRomanNumeral(2)).toBe('II');
      expect(toRomanNumeral(3)).toBe('III');
      expect(toRomanNumeral(4)).toBe('IV');
      expect(toRomanNumeral(5)).toBe('V');
      expect(toRomanNumeral(6)).toBe('VI');
      expect(toRomanNumeral(7)).toBe('VII');
      expect(toRomanNumeral(8)).toBe('VIII');
      expect(toRomanNumeral(9)).toBe('IX');
      expect(toRomanNumeral(10)).toBe('X');
    });

    it('should convert 11-20 correctly', () => {
      expect(toRomanNumeral(11)).toBe('XI');
      expect(toRomanNumeral(12)).toBe('XII');
      expect(toRomanNumeral(13)).toBe('XIII');
      expect(toRomanNumeral(14)).toBe('XIV');
      expect(toRomanNumeral(15)).toBe('XV');
      expect(toRomanNumeral(16)).toBe('XVI');
      expect(toRomanNumeral(17)).toBe('XVII');
      expect(toRomanNumeral(18)).toBe('XVIII');
      expect(toRomanNumeral(19)).toBe('XIX');
      expect(toRomanNumeral(20)).toBe('XX');
    });

    it('should return string for edge cases (0, negative, >20)', () => {
      expect(toRomanNumeral(0)).toBe('0');
      expect(toRomanNumeral(-1)).toBe('-1');
      expect(toRomanNumeral(21)).toBe('21');
      expect(toRomanNumeral(100)).toBe('100');
    });
  });

  describe('countTeamsByClub', () => {
    it('should count unique teams per club', () => {
      const results = [
        { contenderId: 1, teamNumber: 1 },
        { contenderId: 1, teamNumber: 2 },
        { contenderId: 1, teamNumber: 3 },
        { contenderId: 2, teamNumber: 1 },
      ];

      const counts = countTeamsByClub(results);
      expect(counts.get(1)).toBe(3);
      expect(counts.get(2)).toBe(1);
    });

    it('should return empty map for empty input', () => {
      const counts = countTeamsByClub([]);
      expect(counts.size).toBe(0);
    });

    it('should handle duplicate team entries', () => {
      const results = [
        { contenderId: 1, teamNumber: 1 },
        { contenderId: 1, teamNumber: 1 }, // Duplicate
        { contenderId: 1, teamNumber: 2 },
      ];

      const counts = countTeamsByClub(results);
      expect(counts.get(1)).toBe(2); // Only 2 unique teams
    });
  });

  describe('formatTeamName', () => {
    it('should return plain name for single team clubs', () => {
      expect(formatTeamName('SK Rockaden', 1, 1)).toBe('SK Rockaden');
    });

    it('should append Roman numeral for multi-team clubs', () => {
      expect(formatTeamName('SK Rockaden', 1, 3)).toBe('SK Rockaden I');
      expect(formatTeamName('SK Rockaden', 2, 3)).toBe('SK Rockaden II');
      expect(formatTeamName('SK Rockaden', 3, 3)).toBe('SK Rockaden III');
    });

    it('should handle team count of 0', () => {
      expect(formatTeamName('SK Rockaden', 1, 0)).toBe('SK Rockaden');
    });
  });

  describe('createTeamNameFormatter', () => {
    it('should create formatter that handles multi-team clubs', () => {
      const results = [
        { contenderId: 1, teamNumber: 1 },
        { contenderId: 1, teamNumber: 2 },
        { contenderId: 2, teamNumber: 1 },
      ];

      const getClubName = (id: number) => id === 1 ? 'SK Rockaden' : 'Stockholms SS';

      const formatter = createTeamNameFormatter(results, getClubName);

      // Club 1 has 2 teams - should show Roman numerals
      expect(formatter(1, 1)).toBe('SK Rockaden I');
      expect(formatter(1, 2)).toBe('SK Rockaden II');

      // Club 2 has 1 team - should not show numeral
      expect(formatter(2, 1)).toBe('Stockholms SS');
    });

    it('should handle clubs not in results', () => {
      const results = [{ contenderId: 1, teamNumber: 1 }];
      const getClubName = (id: number) => `Club ${id}`;

      const formatter = createTeamNameFormatter(results, getClubName);

      // Club 999 not in results - should default to 1 team (no numeral)
      expect(formatter(999, 1)).toBe('Club 999');
    });
  });
});
