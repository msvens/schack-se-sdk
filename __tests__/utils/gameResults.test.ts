/**
 * Unit tests for game result utilities
 */

import {
  PointSystem,
  ResultCode,
  isWhiteWin,
  isBlackWin,
  isDraw,
  isWalkoverResultCode,
  isTouristBye,
  isCountableResult,
  getGameOutcome,
  calculatePoints,
  getResultDisplayString,
  parseGameResult,
  getPlayerOutcome,
  getPlayerPoints,
  getPointSystemFromResult,
  getPointSystemName
} from '../../src/utils/gameResults';

describe('Game Results Utilities', () => {
  describe('Result Classification', () => {
    describe('isWhiteWin', () => {
      test('should identify standard white wins', () => {
        expect(isWhiteWin(ResultCode.WHITE_WIN)).toBe(true);
        expect(isWhiteWin(ResultCode.WHITE_WIN_WO)).toBe(true);
        expect(isWhiteWin(ResultCode.WHITE_TOURIST_WO)).toBe(true);
      });

      test('should identify Schack4an white wins', () => {
        expect(isWhiteWin(ResultCode.SCHACK4AN_WHITE_WIN)).toBe(true);
        expect(isWhiteWin(ResultCode.SCHACK4AN_WHITE_WIN_WO)).toBe(true);
      });

      test('should identify Point310 white wins', () => {
        expect(isWhiteWin(ResultCode.POINT310_WHITE_WIN)).toBe(true);
        expect(isWhiteWin(ResultCode.POINT310_WHITE_WIN_WO)).toBe(true);
      });

      test('should not identify non-white-wins', () => {
        expect(isWhiteWin(ResultCode.BLACK_WIN)).toBe(false);
        expect(isWhiteWin(ResultCode.DRAW)).toBe(false);
      });
    });

    describe('isBlackWin', () => {
      test('should identify standard black wins', () => {
        expect(isBlackWin(ResultCode.BLACK_WIN)).toBe(true);
        expect(isBlackWin(ResultCode.BLACK_WIN_WO)).toBe(true);
      });

      test('should identify Schack4an black wins', () => {
        expect(isBlackWin(ResultCode.SCHACK4AN_BLACK_WIN)).toBe(true);
        expect(isBlackWin(ResultCode.SCHACK4AN_BLACK_WIN_WO)).toBe(true);
      });

      test('should not identify non-black-wins', () => {
        expect(isBlackWin(ResultCode.WHITE_WIN)).toBe(false);
        expect(isBlackWin(ResultCode.DRAW)).toBe(false);
      });
    });

    describe('isDraw', () => {
      test('should identify draws in all systems', () => {
        expect(isDraw(ResultCode.DRAW)).toBe(true);
        expect(isDraw(ResultCode.SCHACK4AN_DRAW)).toBe(true);
        expect(isDraw(ResultCode.POINT310_DRAW)).toBe(true);
      });

      test('should not identify non-draws', () => {
        expect(isDraw(ResultCode.WHITE_WIN)).toBe(false);
        expect(isDraw(ResultCode.BLACK_WIN)).toBe(false);
      });
    });

    describe('isWalkoverResultCode', () => {
      test('should identify walkovers', () => {
        expect(isWalkoverResultCode(ResultCode.WHITE_WIN_WO)).toBe(true);
        expect(isWalkoverResultCode(ResultCode.BLACK_WIN_WO)).toBe(true);
        expect(isWalkoverResultCode(ResultCode.NO_WIN_WO)).toBe(true);
      });

      test('should not identify normal results as walkovers', () => {
        expect(isWalkoverResultCode(ResultCode.WHITE_WIN)).toBe(false);
        expect(isWalkoverResultCode(ResultCode.DRAW)).toBe(false);
      });
    });

    describe('isTouristBye', () => {
      test('should identify tourist byes', () => {
        expect(isTouristBye(ResultCode.WHITE_TOURIST_WO)).toBe(true);
        expect(isTouristBye(ResultCode.SCHACK4AN_WHITE_TOURIST_WO)).toBe(true);
        expect(isTouristBye(ResultCode.POINT310_WHITE_TOURIST_WO)).toBe(true);
      });

      test('should not identify non-tourist-byes', () => {
        expect(isTouristBye(ResultCode.WHITE_WIN)).toBe(false);
        expect(isTouristBye(ResultCode.WHITE_WIN_WO)).toBe(false);
      });
    });

    describe('isCountableResult', () => {
      test('should mark normal results as countable', () => {
        expect(isCountableResult(ResultCode.WHITE_WIN)).toBe(true);
        expect(isCountableResult(ResultCode.DRAW)).toBe(true);
        expect(isCountableResult(ResultCode.BLACK_WIN)).toBe(true);
      });

      test('should mark special results as non-countable', () => {
        expect(isCountableResult(ResultCode.NOT_SET)).toBe(false);
        expect(isCountableResult(ResultCode.POSTPONED)).toBe(false);
        expect(isCountableResult(ResultCode.NO_WIN_WO)).toBe(false);
        expect(isCountableResult(ResultCode.BOTH_NO_RESULT)).toBe(false);
      });
    });
  });

  describe('Point Systems', () => {
    describe('getPointSystemFromResult', () => {
      test('should identify standard system', () => {
        expect(getPointSystemFromResult(ResultCode.WHITE_WIN)).toBe(PointSystem.DEFAULT);
        expect(getPointSystemFromResult(ResultCode.DRAW)).toBe(PointSystem.DEFAULT);
      });

      test('should identify Schack4an system', () => {
        expect(getPointSystemFromResult(ResultCode.SCHACK4AN_WHITE_WIN)).toBe(PointSystem.SCHACK4AN);
        expect(getPointSystemFromResult(ResultCode.SCHACK4AN_DRAW)).toBe(PointSystem.SCHACK4AN);
      });

      test('should identify Point310 system', () => {
        expect(getPointSystemFromResult(ResultCode.POINT310_WHITE_WIN)).toBe(PointSystem.POINT310);
        expect(getPointSystemFromResult(ResultCode.POINT310_DRAW)).toBe(PointSystem.POINT310);
      });
    });

    describe('calculatePoints', () => {
      test('standard system: win=1, draw=0.5, loss=0', () => {
        expect(calculatePoints(ResultCode.WHITE_WIN)).toEqual([1, 0]);
        expect(calculatePoints(ResultCode.BLACK_WIN)).toEqual([0, 1]);
        expect(calculatePoints(ResultCode.DRAW)).toEqual([0.5, 0.5]);
      });

      test('Schack4an system: win=3, draw=2, loss=1', () => {
        expect(calculatePoints(ResultCode.SCHACK4AN_WHITE_WIN)).toEqual([3, 1]);
        expect(calculatePoints(ResultCode.SCHACK4AN_BLACK_WIN)).toEqual([1, 3]);
        expect(calculatePoints(ResultCode.SCHACK4AN_DRAW)).toEqual([2, 2]);
      });

      test('Point310 system: win=3, draw=1, loss=0', () => {
        expect(calculatePoints(ResultCode.POINT310_WHITE_WIN)).toEqual([3, 0]);
        expect(calculatePoints(ResultCode.POINT310_BLACK_WIN)).toEqual([0, 3]);
        expect(calculatePoints(ResultCode.POINT310_DRAW)).toEqual([1, 1]);
      });

      test('tourist bye gives half points', () => {
        expect(calculatePoints(ResultCode.WHITE_TOURIST_WO)).toEqual([0.5, 0]);
        expect(calculatePoints(ResultCode.SCHACK4AN_WHITE_TOURIST_WO)).toEqual([2, 0]);
        expect(calculatePoints(ResultCode.POINT310_WHITE_TOURIST_WO)).toEqual([1, 0]);
      });
    });

    describe('getPointSystemName', () => {
      test('should return human-readable names', () => {
        expect(getPointSystemName(PointSystem.DEFAULT)).toContain('Standard');
        expect(getPointSystemName(PointSystem.SCHACK4AN)).toContain('Schackfyran');
        expect(getPointSystemName(PointSystem.POINT310)).toContain('3-1-0');
      });
    });
  });

  describe('Player Perspective', () => {
    describe('getPlayerOutcome', () => {
      test('white player perspective', () => {
        expect(getPlayerOutcome(ResultCode.WHITE_WIN, true)).toBe('win');
        expect(getPlayerOutcome(ResultCode.BLACK_WIN, true)).toBe('loss');
        expect(getPlayerOutcome(ResultCode.DRAW, true)).toBe('draw');
      });

      test('black player perspective', () => {
        expect(getPlayerOutcome(ResultCode.WHITE_WIN, false)).toBe('loss');
        expect(getPlayerOutcome(ResultCode.BLACK_WIN, false)).toBe('win');
        expect(getPlayerOutcome(ResultCode.DRAW, false)).toBe('draw');
      });

      test('non-countable results return null', () => {
        expect(getPlayerOutcome(ResultCode.NOT_SET, true)).toBeNull();
        expect(getPlayerOutcome(ResultCode.POSTPONED, false)).toBeNull();
      });
    });

    describe('getPlayerPoints', () => {
      test('standard system from player perspective', () => {
        expect(getPlayerPoints(ResultCode.WHITE_WIN, true)).toBe(1);
        expect(getPlayerPoints(ResultCode.WHITE_WIN, false)).toBe(0);
        expect(getPlayerPoints(ResultCode.DRAW, true)).toBe(0.5);
      });

      test('non-countable results return null', () => {
        expect(getPlayerPoints(ResultCode.NOT_SET, true)).toBeNull();
      });
    });
  });

  describe('Display Strings', () => {
    describe('getResultDisplayString', () => {
      test('standard results', () => {
        expect(getResultDisplayString(ResultCode.WHITE_WIN)).toBe('1 - 0');
        expect(getResultDisplayString(ResultCode.BLACK_WIN)).toBe('0 - 1');
        expect(getResultDisplayString(ResultCode.DRAW)).toContain('1/2');
      });

      test('walkover results', () => {
        expect(getResultDisplayString(ResultCode.WHITE_WIN_WO)).toContain('w.o');
        expect(getResultDisplayString(ResultCode.BLACK_WIN_WO)).toContain('w.o');
      });

      test('Schack4an results', () => {
        expect(getResultDisplayString(ResultCode.SCHACK4AN_WHITE_WIN)).toBe('3 - 1');
        expect(getResultDisplayString(ResultCode.SCHACK4AN_DRAW)).toBe('2 - 2');
      });
    });
  });

  describe('parseGameResult', () => {
    test('should parse standard white win', () => {
      const result = parseGameResult(ResultCode.WHITE_WIN);

      expect(result.outcome).toBe('white_win');
      expect(result.whitePoints).toBe(1);
      expect(result.blackPoints).toBe(0);
      expect(result.isWalkover).toBe(false);
      expect(result.isTouristBye).toBe(false);
      expect(result.isCountable).toBe(true);
      expect(result.displayString).toBe('1 - 0');
    });

    test('should parse walkover correctly', () => {
      const result = parseGameResult(ResultCode.WHITE_WIN_WO);

      expect(result.outcome).toBe('white_win');
      expect(result.isWalkover).toBe(true);
      expect(result.displayString).toContain('w.o');
    });

    test('should parse tourist bye correctly', () => {
      const result = parseGameResult(ResultCode.WHITE_TOURIST_WO);

      expect(result.outcome).toBe('white_win');
      expect(result.isTouristBye).toBe(true);
      expect(result.whitePoints).toBe(0.5);
    });
  });

  describe('getGameOutcome', () => {
    test('should return correct outcomes', () => {
      expect(getGameOutcome(ResultCode.WHITE_WIN)).toBe('white_win');
      expect(getGameOutcome(ResultCode.BLACK_WIN)).toBe('black_win');
      expect(getGameOutcome(ResultCode.DRAW)).toBe('draw');
      expect(getGameOutcome(ResultCode.NOT_SET)).toBe('no_result');
    });
  });
});
