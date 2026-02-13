/**
 * Unit tests for result formatting utilities
 */

import {
  isWalkoverPlayer,
  isWalkoverClub,
  isWalkoverResult,
  isWalkover,
  formatGameResult,
  formatMatchResult
} from '../../src/utils/resultFormatting';
import { ResultCode } from '../../src/utils/gameResults';

describe('resultFormatting', () => {
  describe('isWalkoverPlayer', () => {
    it('should identify negative IDs as walkover', () => {
      expect(isWalkoverPlayer(-1)).toBe(true);
      expect(isWalkoverPlayer(-100)).toBe(true);
      expect(isWalkoverPlayer(-200)).toBe(true);
    });

    it('should not identify positive IDs as walkover', () => {
      expect(isWalkoverPlayer(1)).toBe(false);
      expect(isWalkoverPlayer(12345)).toBe(false);
      expect(isWalkoverPlayer(999999)).toBe(false);
    });

    it('should not identify zero as walkover', () => {
      expect(isWalkoverPlayer(0)).toBe(false);
    });
  });

  describe('isWalkoverClub', () => {
    it('should identify negative IDs as walkover', () => {
      expect(isWalkoverClub(-100)).toBe(true);
      expect(isWalkoverClub(-1)).toBe(true);
    });

    it('should not identify positive IDs as walkover', () => {
      expect(isWalkoverClub(38464)).toBe(false);
      expect(isWalkoverClub(1)).toBe(false);
    });

    it('should not identify zero as walkover', () => {
      expect(isWalkoverClub(0)).toBe(false);
    });
  });

  describe('isWalkoverResult', () => {
    it('should identify walkover result codes', () => {
      expect(isWalkoverResult(ResultCode.WHITE_WIN_WO)).toBe(true);
      expect(isWalkoverResult(ResultCode.BLACK_WIN_WO)).toBe(true);
      expect(isWalkoverResult(ResultCode.NO_WIN_WO)).toBe(true);
      expect(isWalkoverResult(ResultCode.SCHACK4AN_WHITE_WIN_WO)).toBe(true);
      expect(isWalkoverResult(ResultCode.POINT310_BLACK_WIN_WO)).toBe(true);
    });

    it('should not identify normal results as walkover', () => {
      expect(isWalkoverResult(ResultCode.WHITE_WIN)).toBe(false);
      expect(isWalkoverResult(ResultCode.BLACK_WIN)).toBe(false);
      expect(isWalkoverResult(ResultCode.DRAW)).toBe(false);
    });
  });

  describe('isWalkover', () => {
    it('should detect walkover by home player ID', () => {
      expect(isWalkover(-1, 12345)).toBe(true);
    });

    it('should detect walkover by away player ID', () => {
      expect(isWalkover(12345, -1)).toBe(true);
    });

    it('should detect walkover by result code', () => {
      expect(isWalkover(12345, 67890, ResultCode.WHITE_WIN_WO)).toBe(true);
    });

    it('should not detect walkover for normal game', () => {
      expect(isWalkover(12345, 67890, ResultCode.WHITE_WIN)).toBe(false);
      expect(isWalkover(12345, 67890)).toBe(false);
    });

    it('should handle undefined result', () => {
      expect(isWalkover(12345, 67890, undefined)).toBe(false);
    });
  });

  describe('formatGameResult', () => {
    it('should format normal results correctly', () => {
      expect(formatGameResult(ResultCode.WHITE_WIN)).toBe('1 - 0');
      expect(formatGameResult(ResultCode.BLACK_WIN)).toBe('0 - 1');
      expect(formatGameResult(ResultCode.DRAW)).toBe('½ - ½');
    });

    it('should keep w.o suffix for walkover result codes', () => {
      expect(formatGameResult(ResultCode.WHITE_WIN_WO)).toBe('1 - 0 w.o');
      expect(formatGameResult(ResultCode.BLACK_WIN_WO)).toBe('0 - 1 w.o');
    });

    it('should append w.o when player ID indicates walkover', () => {
      // Normal result code but walkover player
      expect(formatGameResult(ResultCode.WHITE_WIN, -1, 12345)).toBe('1 - 0 w.o');
      expect(formatGameResult(ResultCode.WHITE_WIN, 12345, -1)).toBe('1 - 0 w.o');
    });

    it('should not double-add w.o for walkover result code with walkover player', () => {
      // Result code already indicates walkover
      expect(formatGameResult(ResultCode.WHITE_WIN_WO, -1, 12345)).toBe('1 - 0 w.o');
    });

    it('should format tourist bye correctly', () => {
      expect(formatGameResult(ResultCode.WHITE_TOURIST_WO)).toBe('½ bye');
    });

    it('should format Schack4an results', () => {
      expect(formatGameResult(ResultCode.SCHACK4AN_WHITE_WIN)).toBe('3 - 1');
      expect(formatGameResult(ResultCode.SCHACK4AN_BLACK_WIN)).toBe('1 - 3');
      expect(formatGameResult(ResultCode.SCHACK4AN_DRAW)).toBe('2 - 2');
    });

    it('should format Point310 results', () => {
      expect(formatGameResult(ResultCode.POINT310_WHITE_WIN)).toBe('3 - 0');
      expect(formatGameResult(ResultCode.POINT310_BLACK_WIN)).toBe('0 - 3');
      expect(formatGameResult(ResultCode.POINT310_DRAW)).toBe('1 - 1');
    });
  });

  describe('formatMatchResult', () => {
    it('should format normal results as "X - Y"', () => {
      expect(formatMatchResult(1, 0)).toBe('1 - 0');
      expect(formatMatchResult(0, 1)).toBe('0 - 1');
      expect(formatMatchResult(0.5, 0.5)).toBe('0.5 - 0.5');
    });

    it('should return dash for undefined results', () => {
      expect(formatMatchResult(undefined, 0)).toBe('-');
      expect(formatMatchResult(1, undefined)).toBe('-');
      expect(formatMatchResult(undefined, undefined)).toBe('-');
    });

    it('should append w.o when player ID indicates walkover', () => {
      expect(formatMatchResult(1, 0, -1, 12345)).toBe('1 - 0 w.o');
      expect(formatMatchResult(1, 0, 12345, -1)).toBe('1 - 0 w.o');
    });

    it('should not append w.o for normal player IDs', () => {
      expect(formatMatchResult(1, 0, 12345, 67890)).toBe('1 - 0');
    });

    it('should handle undefined player IDs', () => {
      expect(formatMatchResult(1, 0, undefined, undefined)).toBe('1 - 0');
    });
  });
});
