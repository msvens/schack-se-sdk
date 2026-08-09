/**
 * Unit tests for gameResults utility functions
 * Tests all 28+ result codes across 3 point systems
 */

import {
  PointSystem,
  ResultCode,
  ResultDisplay,
  getPointSystemFromResult,
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
  getPointSystemName,
  isAdjudicatedResult,
  isPostponed,
  isResultCodeInformative,
  parseResultDisplay,
  resolveIndividualResult,
  resolveTeamMatchResult
} from '../../src/utils/gameResults';
import type { GameDto } from '../../src/types';

/** Minimal GameDto carrying just a result code (the only field the resolvers read). */
const g = (result: number): GameDto => ({
  id: 0, tournamentResultID: 0, tableNr: 0, whiteId: 0, blackId: 0,
  result, pgn: '', groupiD: 0,
});

describe('gameResults', () => {
  describe('getPointSystemFromResult', () => {
    it('should identify standard result codes', () => {
      expect(getPointSystemFromResult(ResultCode.WHITE_WIN)).toBe(PointSystem.DEFAULT);
      expect(getPointSystemFromResult(ResultCode.BLACK_WIN)).toBe(PointSystem.DEFAULT);
      expect(getPointSystemFromResult(ResultCode.DRAW)).toBe(PointSystem.DEFAULT);
      expect(getPointSystemFromResult(ResultCode.WHITE_WIN_WO)).toBe(PointSystem.DEFAULT);
      expect(getPointSystemFromResult(ResultCode.BLACK_WIN_WO)).toBe(PointSystem.DEFAULT);
      expect(getPointSystemFromResult(ResultCode.NO_WIN_WO)).toBe(PointSystem.DEFAULT);
      expect(getPointSystemFromResult(ResultCode.WHITE_TOURIST_WO)).toBe(PointSystem.DEFAULT);
      expect(getPointSystemFromResult(ResultCode.BOTH_NO_RESULT)).toBe(PointSystem.DEFAULT);
      expect(getPointSystemFromResult(ResultCode.BOTH_WIN)).toBe(PointSystem.DEFAULT);
    });

    it('should identify Schack4an result codes', () => {
      expect(getPointSystemFromResult(ResultCode.SCHACK4AN_WHITE_WIN)).toBe(PointSystem.SCHACK4AN);
      expect(getPointSystemFromResult(ResultCode.SCHACK4AN_BLACK_WIN)).toBe(PointSystem.SCHACK4AN);
      expect(getPointSystemFromResult(ResultCode.SCHACK4AN_DRAW)).toBe(PointSystem.SCHACK4AN);
      expect(getPointSystemFromResult(ResultCode.SCHACK4AN_WHITE_WIN_WO)).toBe(PointSystem.SCHACK4AN);
      expect(getPointSystemFromResult(ResultCode.SCHACK4AN_BLACK_WIN_WO)).toBe(PointSystem.SCHACK4AN);
      expect(getPointSystemFromResult(ResultCode.SCHACK4AN_WHITE_TOURIST_WO)).toBe(PointSystem.SCHACK4AN);
      expect(getPointSystemFromResult(ResultCode.SCHACK4AN_BOTH_NO_RESULT)).toBe(PointSystem.SCHACK4AN);
      expect(getPointSystemFromResult(ResultCode.SCHACK4AN_BOTH_WIN)).toBe(PointSystem.SCHACK4AN);
    });

    it('should identify Point310 result codes', () => {
      expect(getPointSystemFromResult(ResultCode.POINT310_WHITE_WIN)).toBe(PointSystem.POINT310);
      expect(getPointSystemFromResult(ResultCode.POINT310_BLACK_WIN)).toBe(PointSystem.POINT310);
      expect(getPointSystemFromResult(ResultCode.POINT310_DRAW)).toBe(PointSystem.POINT310);
      expect(getPointSystemFromResult(ResultCode.POINT310_WHITE_WIN_WO)).toBe(PointSystem.POINT310);
      expect(getPointSystemFromResult(ResultCode.POINT310_BLACK_WIN_WO)).toBe(PointSystem.POINT310);
      expect(getPointSystemFromResult(ResultCode.POINT310_WHITE_TOURIST_WO)).toBe(PointSystem.POINT310);
      expect(getPointSystemFromResult(ResultCode.POINT310_BOTH_NO_RESULT)).toBe(PointSystem.POINT310);
      expect(getPointSystemFromResult(ResultCode.POINT310_BOTH_WIN)).toBe(PointSystem.POINT310);
    });
  });

  describe('isWhiteWin', () => {
    it('should identify standard white wins', () => {
      expect(isWhiteWin(ResultCode.WHITE_WIN)).toBe(true);
      expect(isWhiteWin(ResultCode.WHITE_WIN_WO)).toBe(true);
      expect(isWhiteWin(ResultCode.WHITE_TOURIST_WO)).toBe(true);
    });

    it('should identify Schack4an white wins', () => {
      expect(isWhiteWin(ResultCode.SCHACK4AN_WHITE_WIN)).toBe(true);
      expect(isWhiteWin(ResultCode.SCHACK4AN_WHITE_WIN_WO)).toBe(true);
      expect(isWhiteWin(ResultCode.SCHACK4AN_WHITE_TOURIST_WO)).toBe(true);
    });

    it('should identify Point310 white wins', () => {
      expect(isWhiteWin(ResultCode.POINT310_WHITE_WIN)).toBe(true);
      expect(isWhiteWin(ResultCode.POINT310_WHITE_WIN_WO)).toBe(true);
      expect(isWhiteWin(ResultCode.POINT310_WHITE_TOURIST_WO)).toBe(true);
    });

    it('should not identify black wins or draws as white wins', () => {
      expect(isWhiteWin(ResultCode.BLACK_WIN)).toBe(false);
      expect(isWhiteWin(ResultCode.DRAW)).toBe(false);
      expect(isWhiteWin(ResultCode.SCHACK4AN_BLACK_WIN)).toBe(false);
      expect(isWhiteWin(ResultCode.POINT310_BLACK_WIN)).toBe(false);
    });
  });

  describe('isBlackWin', () => {
    it('should identify standard black wins', () => {
      expect(isBlackWin(ResultCode.BLACK_WIN)).toBe(true);
      expect(isBlackWin(ResultCode.BLACK_WIN_WO)).toBe(true);
    });

    it('should identify Schack4an black wins', () => {
      expect(isBlackWin(ResultCode.SCHACK4AN_BLACK_WIN)).toBe(true);
      expect(isBlackWin(ResultCode.SCHACK4AN_BLACK_WIN_WO)).toBe(true);
    });

    it('should identify Point310 black wins', () => {
      expect(isBlackWin(ResultCode.POINT310_BLACK_WIN)).toBe(true);
      expect(isBlackWin(ResultCode.POINT310_BLACK_WIN_WO)).toBe(true);
    });

    it('should not identify white wins or draws as black wins', () => {
      expect(isBlackWin(ResultCode.WHITE_WIN)).toBe(false);
      expect(isBlackWin(ResultCode.DRAW)).toBe(false);
    });
  });

  describe('isDraw', () => {
    it('should identify draws in all point systems', () => {
      expect(isDraw(ResultCode.DRAW)).toBe(true);
      expect(isDraw(ResultCode.SCHACK4AN_DRAW)).toBe(true);
      expect(isDraw(ResultCode.POINT310_DRAW)).toBe(true);
    });

    it('should not identify wins as draws', () => {
      expect(isDraw(ResultCode.WHITE_WIN)).toBe(false);
      expect(isDraw(ResultCode.BLACK_WIN)).toBe(false);
    });
  });

  describe('isWalkoverResultCode', () => {
    it('should identify walkover codes in standard system', () => {
      expect(isWalkoverResultCode(ResultCode.WHITE_WIN_WO)).toBe(true);
      expect(isWalkoverResultCode(ResultCode.BLACK_WIN_WO)).toBe(true);
      expect(isWalkoverResultCode(ResultCode.NO_WIN_WO)).toBe(true);
    });

    it('should identify walkover codes in Schack4an system', () => {
      expect(isWalkoverResultCode(ResultCode.SCHACK4AN_WHITE_WIN_WO)).toBe(true);
      expect(isWalkoverResultCode(ResultCode.SCHACK4AN_BLACK_WIN_WO)).toBe(true);
    });

    it('should identify walkover codes in Point310 system', () => {
      expect(isWalkoverResultCode(ResultCode.POINT310_WHITE_WIN_WO)).toBe(true);
      expect(isWalkoverResultCode(ResultCode.POINT310_BLACK_WIN_WO)).toBe(true);
    });

    it('should not identify normal results as walkovers', () => {
      expect(isWalkoverResultCode(ResultCode.WHITE_WIN)).toBe(false);
      expect(isWalkoverResultCode(ResultCode.DRAW)).toBe(false);
    });
  });

  describe('isTouristBye', () => {
    it('should identify tourist bye codes in all systems', () => {
      expect(isTouristBye(ResultCode.WHITE_TOURIST_WO)).toBe(true);
      expect(isTouristBye(ResultCode.SCHACK4AN_WHITE_TOURIST_WO)).toBe(true);
      expect(isTouristBye(ResultCode.POINT310_WHITE_TOURIST_WO)).toBe(true);
    });

    it('should not identify walkovers as tourist byes', () => {
      expect(isTouristBye(ResultCode.WHITE_WIN_WO)).toBe(false);
      expect(isTouristBye(ResultCode.BLACK_WIN_WO)).toBe(false);
    });
  });

  describe('isCountableResult', () => {
    it('should identify countable results', () => {
      expect(isCountableResult(ResultCode.WHITE_WIN)).toBe(true);
      expect(isCountableResult(ResultCode.BLACK_WIN)).toBe(true);
      expect(isCountableResult(ResultCode.DRAW)).toBe(true);
      expect(isCountableResult(ResultCode.WHITE_WIN_WO)).toBe(true);
    });

    it('should identify non-countable results', () => {
      expect(isCountableResult(ResultCode.NOT_SET)).toBe(false);
      expect(isCountableResult(ResultCode.POSTPONED)).toBe(false);
      expect(isCountableResult(ResultCode.NO_WIN_WO)).toBe(false);
      expect(isCountableResult(ResultCode.BOTH_NO_RESULT)).toBe(false);
      expect(isCountableResult(ResultCode.SCHACK4AN_BOTH_NO_RESULT)).toBe(false);
      expect(isCountableResult(ResultCode.POINT310_BOTH_NO_RESULT)).toBe(false);
    });
  });

  describe('getGameOutcome', () => {
    it('should return correct outcomes for standard results', () => {
      expect(getGameOutcome(ResultCode.WHITE_WIN)).toBe('white_win');
      expect(getGameOutcome(ResultCode.BLACK_WIN)).toBe('black_win');
      expect(getGameOutcome(ResultCode.DRAW)).toBe('draw');
    });

    it('should return no_result for non-countable codes', () => {
      expect(getGameOutcome(ResultCode.NOT_SET)).toBe('no_result');
      expect(getGameOutcome(ResultCode.POSTPONED)).toBe('no_result');
      expect(getGameOutcome(ResultCode.BOTH_NO_RESULT)).toBe('no_result');
    });

    it('should return special for edge cases', () => {
      expect(getGameOutcome(ResultCode.BOTH_WIN)).toBe('special');
    });
  });

  describe('calculatePoints', () => {
    describe('standard system (1/0.5/0)', () => {
      it('should calculate white win points', () => {
        expect(calculatePoints(ResultCode.WHITE_WIN)).toEqual([1, 0]);
      });

      it('should calculate black win points', () => {
        expect(calculatePoints(ResultCode.BLACK_WIN)).toEqual([0, 1]);
      });

      it('should calculate draw points', () => {
        expect(calculatePoints(ResultCode.DRAW)).toEqual([0.5, 0.5]);
      });

      it('should give half point for tourist bye', () => {
        expect(calculatePoints(ResultCode.WHITE_TOURIST_WO)).toEqual([0.5, 0]);
      });

      it('should handle both_win special case', () => {
        expect(calculatePoints(ResultCode.BOTH_WIN)).toEqual([1, 1]);
      });

      it('should give zero points for no_result', () => {
        expect(calculatePoints(ResultCode.BOTH_NO_RESULT)).toEqual([0, 0]);
        expect(calculatePoints(ResultCode.NO_WIN_WO)).toEqual([0, 0]);
      });
    });

    describe('Schack4an system (3/2/1)', () => {
      it('should calculate white win points', () => {
        expect(calculatePoints(ResultCode.SCHACK4AN_WHITE_WIN)).toEqual([3, 1]);
      });

      it('should calculate black win points', () => {
        expect(calculatePoints(ResultCode.SCHACK4AN_BLACK_WIN)).toEqual([1, 3]);
      });

      it('should calculate draw points', () => {
        expect(calculatePoints(ResultCode.SCHACK4AN_DRAW)).toEqual([2, 2]);
      });

      it('should give half points (draw value) for tourist bye', () => {
        expect(calculatePoints(ResultCode.SCHACK4AN_WHITE_TOURIST_WO)).toEqual([2, 0]);
      });

      it('should handle both_win special case', () => {
        expect(calculatePoints(ResultCode.SCHACK4AN_BOTH_WIN)).toEqual([3, 3]);
      });
    });

    describe('Point310 system (3/1/0)', () => {
      it('should calculate white win points', () => {
        expect(calculatePoints(ResultCode.POINT310_WHITE_WIN)).toEqual([3, 0]);
      });

      it('should calculate black win points', () => {
        expect(calculatePoints(ResultCode.POINT310_BLACK_WIN)).toEqual([0, 3]);
      });

      it('should calculate draw points', () => {
        expect(calculatePoints(ResultCode.POINT310_DRAW)).toEqual([1, 1]);
      });

      it('should give half points (draw value) for tourist bye', () => {
        expect(calculatePoints(ResultCode.POINT310_WHITE_TOURIST_WO)).toEqual([1, 0]);
      });

      it('should handle both_win special case', () => {
        expect(calculatePoints(ResultCode.POINT310_BOTH_WIN)).toEqual([3, 3]);
      });
    });
  });

  describe('getResultDisplayString', () => {
    describe('standard system', () => {
      it('should return correct display strings for wins', () => {
        expect(getResultDisplayString(ResultCode.WHITE_WIN)).toBe(ResultDisplay.WHITE_WIN);
        expect(getResultDisplayString(ResultCode.BLACK_WIN)).toBe(ResultDisplay.BLACK_WIN);
      });

      it('should return correct display strings for walkovers', () => {
        expect(getResultDisplayString(ResultCode.WHITE_WIN_WO)).toBe(ResultDisplay.WHITE_WIN_WO);
        expect(getResultDisplayString(ResultCode.BLACK_WIN_WO)).toBe(ResultDisplay.BLACK_WIN_WO);
        expect(getResultDisplayString(ResultCode.NO_WIN_WO)).toBe(ResultDisplay.NO_WIN_WO);
      });

      it('should return correct display string for draw', () => {
        expect(getResultDisplayString(ResultCode.DRAW)).toBe(ResultDisplay.DRAW);
      });

      it('should return correct display string for special cases', () => {
        expect(getResultDisplayString(ResultCode.WHITE_TOURIST_WO)).toBe(ResultDisplay.WHITE_TOURIST_WO);
        expect(getResultDisplayString(ResultCode.POSTPONED)).toBe(ResultDisplay.POSTPONED);
        expect(getResultDisplayString(ResultCode.NOT_SET)).toBe(ResultDisplay.NO_RESULT);
      });
    });

    describe('Schack4an system', () => {
      it('should return correct display strings', () => {
        expect(getResultDisplayString(ResultCode.SCHACK4AN_WHITE_WIN)).toBe(ResultDisplay.SCHACK4AN_WHITE_WIN);
        expect(getResultDisplayString(ResultCode.SCHACK4AN_BLACK_WIN)).toBe(ResultDisplay.SCHACK4AN_BLACK_WIN);
        expect(getResultDisplayString(ResultCode.SCHACK4AN_DRAW)).toBe(ResultDisplay.SCHACK4AN_DRAW);
      });
    });

    describe('Point310 system', () => {
      it('should return correct display strings', () => {
        expect(getResultDisplayString(ResultCode.POINT310_WHITE_WIN)).toBe(ResultDisplay.POINT310_WHITE_WIN);
        expect(getResultDisplayString(ResultCode.POINT310_BLACK_WIN)).toBe(ResultDisplay.POINT310_BLACK_WIN);
        expect(getResultDisplayString(ResultCode.POINT310_DRAW)).toBe(ResultDisplay.POINT310_DRAW);
      });
    });

    it('should return dash for unknown codes', () => {
      expect(getResultDisplayString(999)).toBe('-');
    });
  });

  describe('parseGameResult', () => {
    it('should parse a standard white win', () => {
      const result = parseGameResult(ResultCode.WHITE_WIN);
      expect(result.outcome).toBe('white_win');
      expect(result.whitePoints).toBe(1);
      expect(result.blackPoints).toBe(0);
      expect(result.isWalkover).toBe(false);
      expect(result.isTouristBye).toBe(false);
      expect(result.isCountable).toBe(true);
      expect(result.displayString).toBe(ResultDisplay.WHITE_WIN);
    });

    it('should parse a walkover', () => {
      const result = parseGameResult(ResultCode.WHITE_WIN_WO);
      expect(result.isWalkover).toBe(true);
      expect(result.isCountable).toBe(true);
    });

    it('should parse a tourist bye', () => {
      const result = parseGameResult(ResultCode.WHITE_TOURIST_WO);
      expect(result.isTouristBye).toBe(true);
      expect(result.whitePoints).toBe(0.5);
    });

    it('should parse a non-countable result', () => {
      const result = parseGameResult(ResultCode.NOT_SET);
      expect(result.isCountable).toBe(false);
      expect(result.outcome).toBe('no_result');
    });
  });

  describe('getPlayerOutcome', () => {
    it('should return win for winning player (white)', () => {
      expect(getPlayerOutcome(ResultCode.WHITE_WIN, true)).toBe('win');
    });

    it('should return loss for losing player (white)', () => {
      expect(getPlayerOutcome(ResultCode.BLACK_WIN, true)).toBe('loss');
    });

    it('should return win for winning player (black)', () => {
      expect(getPlayerOutcome(ResultCode.BLACK_WIN, false)).toBe('win');
    });

    it('should return loss for losing player (black)', () => {
      expect(getPlayerOutcome(ResultCode.WHITE_WIN, false)).toBe('loss');
    });

    it('should return draw for draws', () => {
      expect(getPlayerOutcome(ResultCode.DRAW, true)).toBe('draw');
      expect(getPlayerOutcome(ResultCode.DRAW, false)).toBe('draw');
    });

    it('should return null for non-countable results', () => {
      expect(getPlayerOutcome(ResultCode.NOT_SET, true)).toBe(null);
      expect(getPlayerOutcome(ResultCode.POSTPONED, false)).toBe(null);
    });
  });

  describe('getPlayerPoints', () => {
    it('should return correct points for white player', () => {
      expect(getPlayerPoints(ResultCode.WHITE_WIN, true)).toBe(1);
      expect(getPlayerPoints(ResultCode.BLACK_WIN, true)).toBe(0);
      expect(getPlayerPoints(ResultCode.DRAW, true)).toBe(0.5);
    });

    it('should return correct points for black player', () => {
      expect(getPlayerPoints(ResultCode.WHITE_WIN, false)).toBe(0);
      expect(getPlayerPoints(ResultCode.BLACK_WIN, false)).toBe(1);
      expect(getPlayerPoints(ResultCode.DRAW, false)).toBe(0.5);
    });

    it('should return null for non-countable results', () => {
      expect(getPlayerPoints(ResultCode.NOT_SET, true)).toBe(null);
      expect(getPlayerPoints(ResultCode.POSTPONED, false)).toBe(null);
    });
  });

  describe('getPointSystemName', () => {
    it('should return correct names for all point systems', () => {
      expect(getPointSystemName(PointSystem.DEFAULT)).toBe('Standard (1-½-0)');
      expect(getPointSystemName(PointSystem.SCHACK4AN)).toBe('Schackfyran (3-2-1)');
      expect(getPointSystemName(PointSystem.POINT310)).toBe('3-1-0');
    });
  });

  describe('isAdjudicatedResult', () => {
    it('is true for both-win and both-no-result across all systems', () => {
      for (const c of [
        ResultCode.BOTH_WIN, ResultCode.BOTH_NO_RESULT,
        ResultCode.SCHACK4AN_BOTH_WIN, ResultCode.SCHACK4AN_BOTH_NO_RESULT,
        ResultCode.POINT310_BOTH_WIN, ResultCode.POINT310_BOTH_NO_RESULT,
      ]) {
        expect(isAdjudicatedResult(c)).toBe(true);
      }
    });
    it('is false for ordinary results, walkovers, and NOT_SET', () => {
      for (const c of [ResultCode.WHITE_WIN, ResultCode.DRAW, ResultCode.NO_WIN_WO, ResultCode.NOT_SET, 999]) {
        expect(isAdjudicatedResult(c)).toBe(false);
      }
    });
  });

  describe('isPostponed', () => {
    it('is true only for POSTPONED', () => {
      expect(isPostponed(ResultCode.POSTPONED)).toBe(true);
      expect(isPostponed(ResultCode.NOT_SET)).toBe(false);
      expect(isPostponed(ResultCode.WHITE_WIN)).toBe(false);
    });
  });

  describe('isResultCodeInformative', () => {
    it('is false for NOT_SET and unknown codes, true for every known code', () => {
      expect(isResultCodeInformative(ResultCode.NOT_SET)).toBe(false);
      expect(isResultCodeInformative(999)).toBe(false);      // unknown
      expect(isResultCodeInformative(ResultCode.WHITE_WIN)).toBe(true);
      expect(isResultCodeInformative(ResultCode.POSTPONED)).toBe(true);  // postponed still tells you something
      expect(isResultCodeInformative(ResultCode.NO_WIN_WO)).toBe(true);  // double forfeit is a real result
    });
  });

  describe('parseResultDisplay', () => {
    it('parses ordinary results with scores in the code\'s point system', () => {
      expect(parseResultDisplay(ResultCode.WHITE_WIN)).toEqual({
        home: 1, away: 0, kind: 'normal', pointSystem: PointSystem.DEFAULT, informative: true,
      });
      expect(parseResultDisplay(ResultCode.DRAW)).toMatchObject({ home: 0.5, away: 0.5, kind: 'normal' });
      expect(parseResultDisplay(ResultCode.SCHACK4AN_DRAW)).toMatchObject({
        home: 2, away: 2, kind: 'normal', pointSystem: PointSystem.SCHACK4AN,
      });
      expect(parseResultDisplay(ResultCode.POINT310_WHITE_WIN)).toMatchObject({
        home: 3, away: 0, kind: 'normal', pointSystem: PointSystem.POINT310,
      });
    });

    it('classifies walkovers, including the 0-0 double forfeit', () => {
      expect(parseResultDisplay(ResultCode.WHITE_WIN_WO)).toMatchObject({ home: 1, away: 0, kind: 'walkover' });
      expect(parseResultDisplay(ResultCode.NO_WIN_WO)).toMatchObject({ home: 0, away: 0, kind: 'walkover', informative: true });
    });

    it('classifies tourist byes as half a point', () => {
      expect(parseResultDisplay(ResultCode.WHITE_TOURIST_WO)).toMatchObject({ home: 0.5, away: 0, kind: 'tourist_bye' });
      expect(parseResultDisplay(ResultCode.SCHACK4AN_WHITE_TOURIST_WO)).toMatchObject({ home: 2, away: 0, kind: 'tourist_bye' });
    });

    it('classifies adjudications (score kept — BOTH_WIN counts)', () => {
      expect(parseResultDisplay(ResultCode.BOTH_WIN)).toMatchObject({ home: 1, away: 1, kind: 'adjudicated' });
      expect(parseResultDisplay(ResultCode.BOTH_NO_RESULT)).toMatchObject({ home: 0, away: 0, kind: 'adjudicated' });
    });

    it('gives postponed and no-result a null score', () => {
      expect(parseResultDisplay(ResultCode.POSTPONED)).toEqual({
        home: null, away: null, kind: 'postponed', pointSystem: PointSystem.DEFAULT, informative: true,
      });
      expect(parseResultDisplay(ResultCode.NOT_SET)).toMatchObject({ home: null, away: null, kind: 'none', informative: false });
      expect(parseResultDisplay(999)).toMatchObject({ home: null, away: null, kind: 'none', informative: false });
    });
  });

  describe('resolveIndividualResult', () => {
    it('uses the game code for a normal single-game row', () => {
      expect(resolveIndividualResult({ homeResult: 1, awayResult: 0, games: [g(ResultCode.WHITE_WIN)] }))
        .toMatchObject({ home: 1, away: 0, kind: 'normal' });
    });

    it('renders a 0-0 double forfeit as a walkover, not a swallowed dash', () => {
      // The row is 0-0, but the code says NO_WIN_WO — must not be dropped.
      expect(resolveIndividualResult({ homeResult: 0, awayResult: 0, games: [g(ResultCode.NO_WIN_WO)] }))
        .toMatchObject({ home: 0, away: 0, kind: 'walkover' });
    });

    it('falls back to row points when the code is NOT_SET but points exist', () => {
      // group 3941: Schackfyran draw with games[0].result == -100 but homeResult/awayResult == 2/2.
      expect(resolveIndividualResult({ homeResult: 2, awayResult: 2, games: [g(ResultCode.NOT_SET)] }))
        .toMatchObject({ home: 2, away: 2, kind: 'normal', informative: true });
    });

    it('treats a NOT_SET row with no points as not played', () => {
      expect(resolveIndividualResult({ homeResult: 0, awayResult: 0, games: [g(ResultCode.NOT_SET)] }))
        .toMatchObject({ home: null, away: null, kind: 'none' });
    });

    it('falls back to points when there is no game row', () => {
      expect(resolveIndividualResult({ homeResult: 1, awayResult: 0, games: [] }))
        .toMatchObject({ home: 1, away: 0, kind: 'normal' });
    });

    it('guards a team (multi-board) row instead of returning board 1', () => {
      // group 3958 r1: match 1.5-3.5 across 5 boards; must NOT report board 1 (a 1-0).
      const teamRow = {
        homeResult: 1.5, awayResult: 3.5,
        games: [g(1), g(1), g(1), g(-1), g(0)],
      };
      expect(resolveIndividualResult(teamRow)).toMatchObject({ home: null, away: null, kind: 'none' });
    });
  });

  describe('resolveTeamMatchResult', () => {
    it('uses the match score, never the boards (group 3958 r1 -> 1.5 - 3.5)', () => {
      expect(resolveTeamMatchResult({ homeResult: 1.5, awayResult: 3.5 }))
        .toMatchObject({ home: 1.5, away: 3.5, kind: 'normal' });
    });
    it('treats a 0-0 match as not played', () => {
      expect(resolveTeamMatchResult({ homeResult: 0, awayResult: 0 }))
        .toMatchObject({ home: null, away: null, kind: 'none' });
    });
  });
});
