/**
 * Unit tests for sorting utility functions
 */

import {
  sortTournamentEndResultsByPlace,
  sortTournamentsByDate
} from '../../src/utils/sortingUtils';
import type { TournamentEndResultDto, TournamentDto } from '../../src/types';

describe('sortingUtils', () => {
  describe('sortTournamentEndResultsByPlace', () => {
    it('should sort by place ascending', () => {
      const results: TournamentEndResultDto[] = [
        { place: 3 } as TournamentEndResultDto,
        { place: 1 } as TournamentEndResultDto,
        { place: 2 } as TournamentEndResultDto,
      ];

      const sorted = sortTournamentEndResultsByPlace(results);

      expect(sorted[0].place).toBe(1);
      expect(sorted[1].place).toBe(2);
      expect(sorted[2].place).toBe(3);
    });

    it('should not mutate original array', () => {
      const results: TournamentEndResultDto[] = [
        { place: 3 } as TournamentEndResultDto,
        { place: 1 } as TournamentEndResultDto,
      ];

      const sorted = sortTournamentEndResultsByPlace(results);

      expect(results[0].place).toBe(3); // Original unchanged
      expect(sorted[0].place).toBe(1);
    });

    it('should handle empty array', () => {
      const sorted = sortTournamentEndResultsByPlace([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single element', () => {
      const results: TournamentEndResultDto[] = [{ place: 1 } as TournamentEndResultDto];
      const sorted = sortTournamentEndResultsByPlace(results);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].place).toBe(1);
    });

    it('should handle already sorted array', () => {
      const results: TournamentEndResultDto[] = [
        { place: 1 } as TournamentEndResultDto,
        { place: 2 } as TournamentEndResultDto,
        { place: 3 } as TournamentEndResultDto,
      ];

      const sorted = sortTournamentEndResultsByPlace(results);

      expect(sorted[0].place).toBe(1);
      expect(sorted[1].place).toBe(2);
      expect(sorted[2].place).toBe(3);
    });
  });

  describe('sortTournamentsByDate', () => {
    it('should sort by end date descending (latest first)', () => {
      const tournaments: TournamentDto[] = [
        { id: 1, end: '2024-01-15' } as TournamentDto,
        { id: 2, end: '2024-03-20' } as TournamentDto,
        { id: 3, end: '2024-02-10' } as TournamentDto,
      ];

      const sorted = sortTournamentsByDate(tournaments);

      expect(sorted[0].id).toBe(2); // March - latest
      expect(sorted[1].id).toBe(3); // February
      expect(sorted[2].id).toBe(1); // January - earliest
    });

    it('should not mutate original array', () => {
      const tournaments: TournamentDto[] = [
        { id: 1, end: '2024-01-15' } as TournamentDto,
        { id: 2, end: '2024-03-20' } as TournamentDto,
      ];

      const sorted = sortTournamentsByDate(tournaments);

      expect(tournaments[0].id).toBe(1); // Original unchanged
      expect(sorted[0].id).toBe(2);
    });

    it('should handle empty array', () => {
      const sorted = sortTournamentsByDate([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single element', () => {
      const tournaments: TournamentDto[] = [
        { id: 1, end: '2024-01-15' } as TournamentDto,
      ];
      const sorted = sortTournamentsByDate(tournaments);
      expect(sorted).toHaveLength(1);
    });

    it('should handle same dates', () => {
      const tournaments: TournamentDto[] = [
        { id: 1, end: '2024-01-15' } as TournamentDto,
        { id: 2, end: '2024-01-15' } as TournamentDto,
      ];

      const sorted = sortTournamentsByDate(tournaments);
      expect(sorted).toHaveLength(2);
    });

    it('should handle ISO date strings', () => {
      const tournaments: TournamentDto[] = [
        { id: 1, end: '2024-01-15T10:00:00' } as TournamentDto,
        { id: 2, end: '2024-01-15T15:00:00' } as TournamentDto,
      ];

      const sorted = sortTournamentsByDate(tournaments);
      // Same date but different times - id:2 is later
      expect(sorted[0].id).toBe(2);
      expect(sorted[1].id).toBe(1);
    });

    it('should handle cross-year sorting', () => {
      const tournaments: TournamentDto[] = [
        { id: 1, end: '2023-12-31' } as TournamentDto,
        { id: 2, end: '2024-01-01' } as TournamentDto,
      ];

      const sorted = sortTournamentsByDate(tournaments);
      expect(sorted[0].id).toBe(2); // 2024 is later than 2023
      expect(sorted[1].id).toBe(1);
    });
  });
});
