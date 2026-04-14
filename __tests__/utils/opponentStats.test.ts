/**
 * Unit tests for opponentStats utilities
 *
 * Focused on non-happy-path and point-system coverage:
 * - All three point systems (DEFAULT, SCHACK4AN, POINT310)
 * - Empty input
 * - Walkover / unknown result filtering
 * - Color-split stats
 * - W.O games (negative opponent IDs)
 */

import {
  calculatePlayerResult,
  calculatePlayerPoints,
  calculateStatsByColor,
  aggregateOpponentStats,
  sortOpponentStats,
  filterGamesByTimeControl,
  formatGameResult,
  gamesToDisplayFormat,
  type OpponentStats,
} from '../../src/utils/opponentStats';
import { ResultCode } from '../../src/utils/gameResults';
import type { GameDto, PlayerInfoDto, TournamentDto } from '../../src/types';

function makeGame(overrides: Partial<GameDto>): GameDto {
  return {
    id: 1,
    tournamentResultID: 1,
    tableNr: 1,
    whiteId: 100,
    blackId: 200,
    result: ResultCode.DRAW,
    pgn: '',
    groupiD: 500,
    ...overrides,
  };
}

describe('opponentStats', () => {
  describe('calculatePlayerResult', () => {
    it('returns "win" for white win when player is white', () => {
      const game = makeGame({ whiteId: 100, blackId: 200, result: ResultCode.WHITE_WIN });
      expect(calculatePlayerResult(game, 100)).toBe('win');
    });

    it('returns "loss" for white win when player is black', () => {
      const game = makeGame({ whiteId: 100, blackId: 200, result: ResultCode.WHITE_WIN });
      expect(calculatePlayerResult(game, 200)).toBe('loss');
    });

    it('returns "draw" for a draw regardless of color', () => {
      const game = makeGame({ result: ResultCode.DRAW });
      expect(calculatePlayerResult(game, 100)).toBe('draw');
      expect(calculatePlayerResult(game, 200)).toBe('draw');
    });

    it('returns null for non-countable results (postponed, not set)', () => {
      const postponed = makeGame({ result: ResultCode.POSTPONED });
      const notSet = makeGame({ result: ResultCode.NOT_SET });
      expect(calculatePlayerResult(postponed, 100)).toBeNull();
      expect(calculatePlayerResult(notSet, 100)).toBeNull();
    });
  });

  describe('calculatePlayerPoints', () => {
    describe('DEFAULT system (1/0.5/0)', () => {
      it('awards 1 point for win', () => {
        const game = makeGame({ result: ResultCode.WHITE_WIN });
        expect(calculatePlayerPoints(game, 100)).toBe(1);
      });
      it('awards 0.5 for draw', () => {
        const game = makeGame({ result: ResultCode.DRAW });
        expect(calculatePlayerPoints(game, 100)).toBe(0.5);
      });
      it('awards 0 for loss', () => {
        const game = makeGame({ result: ResultCode.BLACK_WIN });
        expect(calculatePlayerPoints(game, 100)).toBe(0);
      });
    });

    describe('SCHACK4AN system (3/2/1)', () => {
      it('awards 3 for win', () => {
        const game = makeGame({ result: ResultCode.SCHACK4AN_WHITE_WIN });
        expect(calculatePlayerPoints(game, 100)).toBe(3);
      });
      it('awards 2 for draw', () => {
        const game = makeGame({ result: ResultCode.SCHACK4AN_DRAW });
        expect(calculatePlayerPoints(game, 100)).toBe(2);
      });
      it('awards 1 for loss', () => {
        const game = makeGame({ result: ResultCode.SCHACK4AN_BLACK_WIN });
        expect(calculatePlayerPoints(game, 100)).toBe(1);
      });
    });

    describe('POINT310 system (3/1/0)', () => {
      it('awards 3 for win', () => {
        const game = makeGame({ result: ResultCode.POINT310_WHITE_WIN });
        expect(calculatePlayerPoints(game, 100)).toBe(3);
      });
      it('awards 1 for draw', () => {
        const game = makeGame({ result: ResultCode.POINT310_DRAW });
        expect(calculatePlayerPoints(game, 100)).toBe(1);
      });
      it('awards 0 for loss', () => {
        const game = makeGame({ result: ResultCode.POINT310_BLACK_WIN });
        expect(calculatePlayerPoints(game, 100)).toBe(0);
      });
    });

    it('returns null for postponed/unrecognized results', () => {
      const game = makeGame({ result: ResultCode.POSTPONED });
      expect(calculatePlayerPoints(game, 100)).toBeNull();
    });
  });

  describe('calculateStatsByColor', () => {
    it('returns all-zero stats for empty array', () => {
      const stats = calculateStatsByColor([], 100);
      expect(stats).toEqual({
        all: { wins: 0, draws: 0, losses: 0 },
        white: { wins: 0, draws: 0, losses: 0 },
        black: { wins: 0, draws: 0, losses: 0 },
      });
    });

    it('splits stats correctly by color', () => {
      const games: GameDto[] = [
        // Player 100 as white, wins
        makeGame({ whiteId: 100, blackId: 200, result: ResultCode.WHITE_WIN }),
        // Player 100 as white, draws
        makeGame({ whiteId: 100, blackId: 201, result: ResultCode.DRAW }),
        // Player 100 as black, wins
        makeGame({ whiteId: 202, blackId: 100, result: ResultCode.BLACK_WIN }),
        // Player 100 as black, loses
        makeGame({ whiteId: 203, blackId: 100, result: ResultCode.WHITE_WIN }),
      ];

      const stats = calculateStatsByColor(games, 100);

      expect(stats.all).toEqual({ wins: 2, draws: 1, losses: 1 });
      expect(stats.white).toEqual({ wins: 1, draws: 1, losses: 0 });
      expect(stats.black).toEqual({ wins: 1, draws: 0, losses: 1 });
    });

    it('skips non-countable results (walkovers, postponed)', () => {
      const games: GameDto[] = [
        makeGame({ whiteId: 100, result: ResultCode.WHITE_WIN }),
        makeGame({ whiteId: 100, result: ResultCode.POSTPONED }),
        makeGame({ whiteId: 100, result: ResultCode.NOT_SET }),
        makeGame({ whiteId: 100, result: ResultCode.BOTH_NO_RESULT }),
      ];

      const stats = calculateStatsByColor(games, 100);
      expect(stats.all).toEqual({ wins: 1, draws: 0, losses: 0 });
    });
  });

  describe('aggregateOpponentStats', () => {
    const playerMap = new Map<number, PlayerInfoDto>();
    const tournamentMap = new Map<number, TournamentDto>();

    it('returns empty array for no games', () => {
      expect(aggregateOpponentStats([], 100, playerMap, tournamentMap)).toEqual([]);
    });

    it('skips games where opponent ID is -1 (walkover marker)', () => {
      const games: GameDto[] = [
        makeGame({ whiteId: 100, blackId: -1, result: ResultCode.WHITE_WIN }),
        makeGame({ whiteId: -1, blackId: 100, result: ResultCode.BLACK_WIN }),
      ];
      expect(aggregateOpponentStats(games, 100, playerMap, tournamentMap)).toEqual([]);
    });

    it('skips non-countable results', () => {
      const games: GameDto[] = [
        makeGame({ whiteId: 100, blackId: 200, result: ResultCode.POSTPONED }),
      ];
      expect(aggregateOpponentStats(games, 100, playerMap, tournamentMap)).toEqual([]);
    });

    it('aggregates multiple games vs the same opponent', () => {
      const games: GameDto[] = [
        makeGame({ id: 1, whiteId: 100, blackId: 200, result: ResultCode.WHITE_WIN, groupiD: 500 }),
        makeGame({ id: 2, whiteId: 200, blackId: 100, result: ResultCode.DRAW, groupiD: 500 }),
        makeGame({ id: 3, whiteId: 100, blackId: 200, result: ResultCode.BLACK_WIN, groupiD: 501 }),
      ];

      const result = aggregateOpponentStats(games, 100, playerMap, tournamentMap);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        opponentId: 200,
        wins: 1,
        draws: 1,
        losses: 1,
        totalGames: 3,
        tournamentCount: 2, // two distinct groups
      });
    });

    it('falls back to "Unknown Player (id)" when opponent is missing from map', () => {
      const games: GameDto[] = [
        makeGame({ whiteId: 100, blackId: 999, result: ResultCode.DRAW }),
      ];
      const result = aggregateOpponentStats(games, 100, playerMap, tournamentMap);
      expect(result[0].opponentName).toBe('Unknown Player (999)');
      expect(result[0].opponentRating).toBe('-');
    });
  });

  describe('sortOpponentStats', () => {
    const stats: OpponentStats[] = [
      { opponentId: 1, opponentName: 'Charlie', opponentRating: '-', wins: 2, draws: 2, losses: 6, totalGames: 10, tournamentCount: 1, tournaments: [] },
      { opponentId: 2, opponentName: 'Alice', opponentRating: '-', wins: 3, draws: 0, losses: 0, totalGames: 3, tournamentCount: 1, tournaments: [] },
      { opponentId: 3, opponentName: 'Bob', opponentRating: '-', wins: 5, draws: 0, losses: 5, totalGames: 10, tournamentCount: 1, tournaments: [] },
    ];

    it('sorts by games (most first)', () => {
      const result = sortOpponentStats(stats, 'games');
      expect(result.map(s => s.opponentId)).toEqual([1, 3, 2]);
    });

    it('sorts by name alphabetically', () => {
      const result = sortOpponentStats(stats, 'name');
      expect(result.map(s => s.opponentName)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('sorts by win rate (highest first)', () => {
      const result = sortOpponentStats(stats, 'winRate');
      // Alice: 100%, Bob: 50%, Charlie: 20%
      expect(result.map(s => s.opponentId)).toEqual([2, 3, 1]);
    });

    it('does not mutate the input array', () => {
      const original = [...stats];
      sortOpponentStats(stats, 'name');
      expect(stats).toEqual(original);
    });

    it('handles empty input', () => {
      expect(sortOpponentStats([], 'games')).toEqual([]);
    });

    it('treats 0 total games as 0 win rate', () => {
      const withZero: OpponentStats[] = [
        { opponentId: 1, opponentName: 'A', opponentRating: '-', wins: 0, draws: 0, losses: 0, totalGames: 0, tournamentCount: 0, tournaments: [] },
        { opponentId: 2, opponentName: 'B', opponentRating: '-', wins: 1, draws: 0, losses: 1, totalGames: 2, tournamentCount: 1, tournaments: [] },
      ];
      const result = sortOpponentStats(withZero, 'winRate');
      expect(result[0].opponentId).toBe(2);
    });
  });

  describe('filterGamesByTimeControl', () => {
    it('returns all games when filter is "all"', () => {
      const games: GameDto[] = [
        makeGame({ id: 1, groupiD: 500 }),
        makeGame({ id: 2, groupiD: 501 }),
      ];
      expect(filterGamesByTimeControl(games, new Map(), 'all')).toEqual(games);
    });

    it('handles empty games array', () => {
      expect(filterGamesByTimeControl([], new Map(), 'standard')).toEqual([]);
    });

    it('defaults unknown groups to standard rating type', () => {
      const games: GameDto[] = [makeGame({ groupiD: 9999 })];
      // Empty tournamentMap → getGroupRatingType returns 'standard'
      expect(filterGamesByTimeControl(games, new Map(), 'standard')).toEqual(games);
      expect(filterGamesByTimeControl(games, new Map(), 'rapid')).toEqual([]);
    });
  });

  describe('formatGameResult', () => {
    it('formats standard codes', () => {
      expect(formatGameResult(ResultCode.WHITE_WIN)).toBe('1 - 0');
      expect(formatGameResult(ResultCode.DRAW)).toBe('½ - ½');
    });

    it('formats SCHACK4AN codes', () => {
      expect(formatGameResult(ResultCode.SCHACK4AN_WHITE_WIN)).toBe('3 - 1');
    });

    it('formats POINT310 codes', () => {
      expect(formatGameResult(ResultCode.POINT310_WHITE_WIN)).toBe('3 - 0');
    });

    it('returns "-" for unknown codes', () => {
      expect(formatGameResult(99999)).toBe('-');
    });
  });

  describe('gamesToDisplayFormat', () => {
    const playerMap = new Map<number, PlayerInfoDto>();
    const tournamentMap = new Map<number, TournamentDto>();

    it('returns empty array for no games', () => {
      expect(gamesToDisplayFormat([], 100, playerMap, tournamentMap, 'Me')).toEqual([]);
    });

    it('filters out walkovers and non-countable results', () => {
      const games: GameDto[] = [
        makeGame({ id: 1, result: ResultCode.WHITE_WIN_WO }),
        makeGame({ id: 2, result: ResultCode.POSTPONED }),
        makeGame({ id: 3, result: ResultCode.NO_WIN_WO }),
      ];
      expect(gamesToDisplayFormat(games, 100, playerMap, tournamentMap, 'Me')).toEqual([]);
    });

    it('filters out games with negative player IDs', () => {
      const games: GameDto[] = [
        makeGame({ id: 1, whiteId: -1, blackId: 100, result: ResultCode.DRAW }),
        makeGame({ id: 2, whiteId: 100, blackId: -1, result: ResultCode.DRAW }),
      ];
      expect(gamesToDisplayFormat(games, 100, playerMap, tournamentMap, 'Me')).toEqual([]);
    });

    it('returns games in latest-first order (reverses API oldest-first)', () => {
      const games: GameDto[] = [
        makeGame({ id: 1, whiteId: 100, blackId: 200, result: ResultCode.WHITE_WIN }),
        makeGame({ id: 2, whiteId: 100, blackId: 201, result: ResultCode.DRAW }),
        makeGame({ id: 3, whiteId: 100, blackId: 202, result: ResultCode.BLACK_WIN }),
      ];
      const result = gamesToDisplayFormat(games, 100, playerMap, tournamentMap, 'Me');
      expect(result.map(g => g.gameId)).toEqual([3, 2, 1]);
    });

    it('uses currentPlayerName for the current player', () => {
      const games: GameDto[] = [
        makeGame({ id: 1, whiteId: 100, blackId: 200, result: ResultCode.DRAW }),
      ];
      const result = gamesToDisplayFormat(games, 100, playerMap, tournamentMap, 'Alice');
      expect(result[0].whiteName).toBe('Alice');
      expect(result[0].blackName).toBe('Unknown (200)');
    });

    it('uses retrievingText while players are loading', () => {
      const games: GameDto[] = [
        makeGame({ id: 1, whiteId: 100, blackId: 200, result: ResultCode.DRAW }),
      ];
      const result = gamesToDisplayFormat(
        games, 100, playerMap, tournamentMap, 'Me', true, 'Hämtar', 'Okänd'
      );
      expect(result[0].blackName).toBe('Hämtar (200)');
    });
  });
});
