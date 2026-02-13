/**
 * Unit tests for batch utility functions
 */

import { deduplicateIds, chunkArray } from '../../src/utils/batchUtils';

describe('batchUtils', () => {
  describe('deduplicateIds', () => {
    it('should remove duplicate IDs', () => {
      expect(deduplicateIds([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it('should return empty array for empty input', () => {
      expect(deduplicateIds([])).toEqual([]);
    });

    it('should return same array when no duplicates', () => {
      expect(deduplicateIds([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle single element array', () => {
      expect(deduplicateIds([1])).toEqual([1]);
    });

    it('should handle all duplicates', () => {
      expect(deduplicateIds([5, 5, 5, 5])).toEqual([5]);
    });

    it('should preserve order of first occurrence', () => {
      expect(deduplicateIds([3, 1, 2, 1, 3, 2])).toEqual([3, 1, 2]);
    });
  });

  describe('chunkArray', () => {
    it('should split array into chunks of specified size', () => {
      expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should return empty array for empty input', () => {
      expect(chunkArray([], 2)).toEqual([]);
    });

    it('should return single chunk when array smaller than chunk size', () => {
      expect(chunkArray([1, 2], 5)).toEqual([[1, 2]]);
    });

    it('should return single chunk when array equals chunk size', () => {
      expect(chunkArray([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
    });

    it('should handle chunk size of 1', () => {
      expect(chunkArray([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });

    it('should work with strings', () => {
      expect(chunkArray(['a', 'b', 'c', 'd'], 2)).toEqual([['a', 'b'], ['c', 'd']]);
    });

    it('should work with objects', () => {
      const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const chunks = chunkArray(objects, 2);
      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toHaveLength(2);
      expect(chunks[1]).toHaveLength(1);
    });
  });
});
