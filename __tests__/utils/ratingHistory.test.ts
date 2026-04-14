/**
 * Unit tests for ratingHistory utilities
 */

import { decimateRatingData } from '../../src/utils/ratingHistory';
import type { RatingDataPoint } from '../../src/types';

function makePoint(date: string, standard: number): RatingDataPoint {
  return { date, standard };
}

describe('ratingHistory', () => {
  describe('decimateRatingData', () => {
    it('returns input unchanged when length <= maxPoints', () => {
      const data = [makePoint('2024-01', 1500), makePoint('2024-02', 1510)];
      expect(decimateRatingData(data, 5)).toEqual(data);
    });

    it('returns input unchanged when length === maxPoints', () => {
      const data = [makePoint('2024-01', 1500), makePoint('2024-02', 1510), makePoint('2024-03', 1520)];
      expect(decimateRatingData(data, 3)).toEqual(data);
    });

    it('returns input unchanged when maxPoints < 2 (invalid)', () => {
      const data = [makePoint('2024-01', 1500), makePoint('2024-02', 1510), makePoint('2024-03', 1520)];
      expect(decimateRatingData(data, 1)).toEqual(data);
      expect(decimateRatingData(data, 0)).toEqual(data);
    });

    it('handles empty input', () => {
      expect(decimateRatingData([], 10)).toEqual([]);
    });

    it('preserves first and last points when decimating', () => {
      const data = Array.from({ length: 100 }, (_, i) =>
        makePoint(`2020-${String((i % 12) + 1).padStart(2, '0')}`, 1500 + i)
      );
      const result = decimateRatingData(data, 10);

      expect(result).toHaveLength(10);
      expect(result[0]).toEqual(data[0]);
      expect(result[result.length - 1]).toEqual(data[data.length - 1]);
    });

    it('returns exactly maxPoints when decimating', () => {
      const data = Array.from({ length: 50 }, (_, i) => makePoint(`m${i}`, 1000 + i));
      expect(decimateRatingData(data, 5)).toHaveLength(5);
      expect(decimateRatingData(data, 20)).toHaveLength(20);
    });

    it('handles maxPoints = 2 (just first and last)', () => {
      const data = Array.from({ length: 10 }, (_, i) => makePoint(`m${i}`, 1000 + i));
      const result = decimateRatingData(data, 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(data[0]);
      expect(result[1]).toEqual(data[9]);
    });

    it('distributes middle points approximately evenly', () => {
      const data = Array.from({ length: 11 }, (_, i) => makePoint(`m${i}`, i));
      // 11 points decimated to 5 → indices ~ 0, 2 or 3, 5, 7 or 8, 10
      const result = decimateRatingData(data, 5);
      expect(result).toHaveLength(5);
      expect(result[0]).toEqual(data[0]);
      expect(result[4]).toEqual(data[10]);
      // Middle indices should be strictly increasing
      const indices = result.map(p => data.indexOf(p));
      for (let i = 1; i < indices.length; i++) {
        expect(indices[i]).toBeGreaterThan(indices[i - 1]);
      }
    });
  });
});
