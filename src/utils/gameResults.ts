/**
 * Game result handling for different point systems
 *
 * Point Systems:
 * - DEFAULT (-1): Standard 1/0.5/0 (Win=1, Draw=0.5, Loss=0)
 * - SCHACK4AN (1): Schackfyran 3/2/1 (Win=3, Draw=2, Loss=1)
 * - POINT310 (2): 3-1-0 system (Win=3, Draw=1, Loss=0)
 */

import type { TournamentRoundResultDto } from '../types';

// =============================================================================
// Point System Constants
// =============================================================================

export const PointSystem = {
  DEFAULT: -1,
  SCHACK4AN: 1,
  POINT310: 2,
} as const;

export type PointSystemType = typeof PointSystem[keyof typeof PointSystem];

// =============================================================================
// Point Values per System
// =============================================================================

export const PointValues = {
  [PointSystem.DEFAULT]: {
    win: 1,
    draw: 0.5,
    loss: 0,
  },
  [PointSystem.SCHACK4AN]: {
    win: 3,
    draw: 2,
    loss: 1,
  },
  [PointSystem.POINT310]: {
    win: 3,
    draw: 1,
    loss: 0,
  },
} as const;

// =============================================================================
// Result Code Constants
// =============================================================================

/**
 * Result codes from the API
 * Positive values generally favor white, negative favor black
 */
export const ResultCode = {
  // Special values
  NOT_SET: -100,
  POSTPONED: 100,

  // Standard system
  WHITE_WIN: 1,
  WHITE_WIN_WO: 2,
  WHITE_TOURIST_WO: 29,
  BLACK_WIN: -1,
  BLACK_WIN_WO: -2,
  NO_WIN_WO: -3,
  DRAW: 0,
  BOTH_NO_RESULT: -10,
  BOTH_WIN: 15,

  // Schack4an system
  SCHACK4AN_WHITE_WIN: 3,
  SCHACK4AN_WHITE_WIN_WO: 5,
  SCHACK4AN_WHITE_TOURIST_WO: 31,
  SCHACK4AN_BLACK_WIN: -4,
  SCHACK4AN_BLACK_WIN_WO: -5,
  SCHACK4AN_DRAW: 10,
  SCHACK4AN_BOTH_NO_RESULT: -20,
  SCHACK4AN_BOTH_WIN: 20,

  // Point310 system
  POINT310_WHITE_WIN: 26,
  POINT310_WHITE_WIN_WO: 25,
  POINT310_WHITE_TOURIST_WO: 30,
  POINT310_BLACK_WIN: -26,
  POINT310_BLACK_WIN_WO: -25,
  POINT310_DRAW: 27,
  POINT310_BOTH_NO_RESULT: -27,
  POINT310_BOTH_WIN: 28,
} as const;

export type ResultCodeType = typeof ResultCode[keyof typeof ResultCode];

// =============================================================================
// Result Display Strings
// =============================================================================

export const ResultDisplay = {
  // Standard
  WHITE_WIN: '1 - 0',
  WHITE_WIN_WO: '1 - 0 w.o',
  WHITE_TOURIST_WO: '½ bye',
  BLACK_WIN: '0 - 1',
  BLACK_WIN_WO: '0 - 1 w.o',
  NO_WIN_WO: '0 - 0 w.o',
  DRAW: '½ - ½',
  NO_RESULT: '  -  ',
  BOTH_NO_RESULT: '0 - 0 adj',
  BOTH_WIN: '1 - 1 adj',
  POSTPONED: 'postponed',

  // Schack4an
  SCHACK4AN_WHITE_WIN: '3 - 1',
  SCHACK4AN_WHITE_WIN_WO: '3 - 0 w.o',
  SCHACK4AN_WHITE_TOURIST_WO: '2 bye',
  SCHACK4AN_BLACK_WIN: '1 - 3',
  SCHACK4AN_BLACK_WIN_WO: '0 - 3 w.o',
  SCHACK4AN_DRAW: '2 - 2',
  SCHACK4AN_BOTH_NO_RESULT: '1 - 1 adj',
  SCHACK4AN_BOTH_WIN: '3 - 3 adj',

  // Point310
  POINT310_WHITE_WIN: '3 - 0',
  POINT310_WHITE_WIN_WO: '3 - 0 w.o',
  POINT310_WHITE_TOURIST_WO: '1 bye',
  POINT310_BLACK_WIN: '0 - 3',
  POINT310_BLACK_WIN_WO: '0 - 3 w.o',
  POINT310_DRAW: '1 - 1',
  POINT310_BOTH_NO_RESULT: '0 - 0 adj',
  POINT310_BOTH_WIN: '3 - 3 adj',
} as const;

// =============================================================================
// Result Classification Types
// =============================================================================

export type GameOutcome = 'white_win' | 'black_win' | 'draw' | 'no_result' | 'special';

export interface ParsedGameResult {
  /** The outcome of the game */
  outcome: GameOutcome;
  /** Points for white player */
  whitePoints: number;
  /** Points for black player */
  blackPoints: number;
  /** Whether this was a walkover/forfeit */
  isWalkover: boolean;
  /** Whether this is a tourist bye (half point) */
  isTouristBye: boolean;
  /** Whether the result is valid/countable for statistics */
  isCountable: boolean;
  /** Display string for the result */
  displayString: string;
}

/**
 * The nature of a result, separated from its score.
 * - `normal`      played to a conclusion
 * - `walkover`    w.o — includes the 0-0 double forfeit (`NO_WIN_WO`)
 * - `tourist_bye` ½ bye / 2 bye / 1 bye
 * - `adjudicated` adj (`BOTH_WIN` / `BOTH_NO_RESULT`)
 * - `postponed`   uppskjutet (`POSTPONED`)
 * - `none`        no usable result — `NOT_SET`, an unknown code, or a 0-0 fallback
 */
export type ResultKind =
  | 'normal'
  | 'walkover'
  | 'tourist_bye'
  | 'adjudicated'
  | 'postponed'
  | 'none';

/**
 * A result code parsed into structured facts, so consumers don't have to
 * re-derive the score/nature/point-system from the display string by hand.
 */
export interface ParsedResultDisplay {
  /** Home/white points in the code's own point system; `null` when there is no score. */
  home: number | null;
  /** Away/black points in the code's own point system; `null` when there is no score. */
  away: number | null;
  /** What kind of result this is, independent of the score. */
  kind: ResultKind;
  /** Which point system the score is expressed in. */
  pointSystem: PointSystemType;
  /** `false` only for `NOT_SET` and unknown codes — "this code tells you nothing". */
  informative: boolean;
}

// =============================================================================
// Result Sets for Classification
// =============================================================================

/** Result codes that indicate white won */
const WHITE_WIN_CODES: Set<number> = new Set([
  ResultCode.WHITE_WIN,
  ResultCode.WHITE_WIN_WO,
  ResultCode.WHITE_TOURIST_WO,
  ResultCode.SCHACK4AN_WHITE_WIN,
  ResultCode.SCHACK4AN_WHITE_WIN_WO,
  ResultCode.SCHACK4AN_WHITE_TOURIST_WO,
  ResultCode.POINT310_WHITE_WIN,
  ResultCode.POINT310_WHITE_WIN_WO,
  ResultCode.POINT310_WHITE_TOURIST_WO,
]);

/** Result codes that indicate black won */
const BLACK_WIN_CODES: Set<number> = new Set([
  ResultCode.BLACK_WIN,
  ResultCode.BLACK_WIN_WO,
  ResultCode.SCHACK4AN_BLACK_WIN,
  ResultCode.SCHACK4AN_BLACK_WIN_WO,
  ResultCode.POINT310_BLACK_WIN,
  ResultCode.POINT310_BLACK_WIN_WO,
]);

/** Result codes that indicate a draw */
const DRAW_CODES: Set<number> = new Set([
  ResultCode.DRAW,
  ResultCode.SCHACK4AN_DRAW,
  ResultCode.POINT310_DRAW,
]);

/** Result codes that indicate walkover/forfeit */
const WALKOVER_CODES: Set<number> = new Set([
  ResultCode.WHITE_WIN_WO,
  ResultCode.BLACK_WIN_WO,
  ResultCode.NO_WIN_WO,
  ResultCode.SCHACK4AN_WHITE_WIN_WO,
  ResultCode.SCHACK4AN_BLACK_WIN_WO,
  ResultCode.POINT310_WHITE_WIN_WO,
  ResultCode.POINT310_BLACK_WIN_WO,
]);

/** Result codes that indicate tourist bye (pre bye) */
const TOURIST_BYE_CODES: Set<number> = new Set([
  ResultCode.WHITE_TOURIST_WO,
  ResultCode.SCHACK4AN_WHITE_TOURIST_WO,
  ResultCode.POINT310_WHITE_TOURIST_WO,
]);

/** Result codes that should not be counted in statistics */
const NON_COUNTABLE_CODES: Set<number> = new Set([
  ResultCode.NOT_SET,
  ResultCode.POSTPONED,
  ResultCode.NO_WIN_WO,
  ResultCode.BOTH_NO_RESULT,
  ResultCode.SCHACK4AN_BOTH_NO_RESULT,
  ResultCode.POINT310_BOTH_NO_RESULT,
]);

/** Result codes decided by adjudication (both-win or both-no-result), all systems */
const ADJUDICATED_CODES: Set<number> = new Set([
  ResultCode.BOTH_NO_RESULT,
  ResultCode.BOTH_WIN,
  ResultCode.SCHACK4AN_BOTH_NO_RESULT,
  ResultCode.SCHACK4AN_BOTH_WIN,
  ResultCode.POINT310_BOTH_NO_RESULT,
  ResultCode.POINT310_BOTH_WIN,
]);

/** Every code the SDK recognises — used to tell a known code from an unknown one */
const KNOWN_CODES: Set<number> = new Set(Object.values(ResultCode));

// =============================================================================
// Core Functions
// =============================================================================

/**
 * Determine which point system a result code belongs to
 */
export function getPointSystemFromResult(resultCode: number): PointSystemType {
  // Schack4an codes
  if ([3, -4, 10, 5, -5, 31, -20, 20].includes(resultCode)) {
    return PointSystem.SCHACK4AN;
  }

  // Point310 codes
  if ([26, -26, 27, 25, -25, 30, -27, 28].includes(resultCode)) {
    return PointSystem.POINT310;
  }

  // Default to standard
  return PointSystem.DEFAULT;
}

/**
 * Check if a result code indicates white won
 */
export function isWhiteWin(resultCode: number): boolean {
  return WHITE_WIN_CODES.has(resultCode);
}

/**
 * Check if a result code indicates black won
 */
export function isBlackWin(resultCode: number): boolean {
  return BLACK_WIN_CODES.has(resultCode);
}

/**
 * Check if a result code indicates a draw
 */
export function isDraw(resultCode: number): boolean {
  return DRAW_CODES.has(resultCode);
}

/**
 * Check if a result code indicates a walkover/forfeit
 */
export function isWalkoverResultCode(resultCode: number): boolean {
  return WALKOVER_CODES.has(resultCode);
}

/**
 * Check if a result code indicates a tourist bye
 */
export function isTouristBye(resultCode: number): boolean {
  return TOURIST_BYE_CODES.has(resultCode);
}

/**
 * Check if a result should be counted in statistics
 */
export function isCountableResult(resultCode: number): boolean {
  return !NON_COUNTABLE_CODES.has(resultCode);
}

/**
 * Get the game outcome from a result code
 */
export function getGameOutcome(resultCode: number): GameOutcome {
  if (isWhiteWin(resultCode)) return 'white_win';
  if (isBlackWin(resultCode)) return 'black_win';
  if (isDraw(resultCode)) return 'draw';
  if (NON_COUNTABLE_CODES.has(resultCode)) return 'no_result';
  return 'special';
}

/**
 * Calculate points for a result code
 * Returns [whitePoints, blackPoints]
 */
export function calculatePoints(resultCode: number): [number, number] {
  const pointSystem = getPointSystemFromResult(resultCode);
  const values = PointValues[pointSystem];

  if (isWhiteWin(resultCode)) {
    // Tourist bye gives half points
    if (isTouristBye(resultCode)) {
      return [values.draw, 0]; // Half point for tourist
    }
    return [values.win, values.loss];
  }

  if (isBlackWin(resultCode)) {
    return [values.loss, values.win];
  }

  if (isDraw(resultCode)) {
    return [values.draw, values.draw];
  }

  // Special cases
  switch (resultCode) {
    case ResultCode.BOTH_WIN:
      return [1, 1];
    case ResultCode.SCHACK4AN_BOTH_WIN:
      return [3, 3];
    case ResultCode.POINT310_BOTH_WIN:
      return [3, 3];
    case ResultCode.NO_WIN_WO:
    case ResultCode.BOTH_NO_RESULT:
    case ResultCode.SCHACK4AN_BOTH_NO_RESULT:
    case ResultCode.POINT310_BOTH_NO_RESULT:
      return [0, 0];
    default:
      return [0, 0];
  }
}

/**
 * Get the display string for a result code
 */
export function getResultDisplayString(resultCode: number): string {
  switch (resultCode) {
    // Standard
    case ResultCode.WHITE_WIN: return ResultDisplay.WHITE_WIN;
    case ResultCode.WHITE_WIN_WO: return ResultDisplay.WHITE_WIN_WO;
    case ResultCode.WHITE_TOURIST_WO: return ResultDisplay.WHITE_TOURIST_WO;
    case ResultCode.BLACK_WIN: return ResultDisplay.BLACK_WIN;
    case ResultCode.BLACK_WIN_WO: return ResultDisplay.BLACK_WIN_WO;
    case ResultCode.NO_WIN_WO: return ResultDisplay.NO_WIN_WO;
    case ResultCode.DRAW: return ResultDisplay.DRAW;
    case ResultCode.BOTH_NO_RESULT: return ResultDisplay.BOTH_NO_RESULT;
    case ResultCode.BOTH_WIN: return ResultDisplay.BOTH_WIN;
    case ResultCode.POSTPONED: return ResultDisplay.POSTPONED;
    case ResultCode.NOT_SET: return ResultDisplay.NO_RESULT;

    // Schack4an
    case ResultCode.SCHACK4AN_WHITE_WIN: return ResultDisplay.SCHACK4AN_WHITE_WIN;
    case ResultCode.SCHACK4AN_WHITE_WIN_WO: return ResultDisplay.SCHACK4AN_WHITE_WIN_WO;
    case ResultCode.SCHACK4AN_WHITE_TOURIST_WO: return ResultDisplay.SCHACK4AN_WHITE_TOURIST_WO;
    case ResultCode.SCHACK4AN_BLACK_WIN: return ResultDisplay.SCHACK4AN_BLACK_WIN;
    case ResultCode.SCHACK4AN_BLACK_WIN_WO: return ResultDisplay.SCHACK4AN_BLACK_WIN_WO;
    case ResultCode.SCHACK4AN_DRAW: return ResultDisplay.SCHACK4AN_DRAW;
    case ResultCode.SCHACK4AN_BOTH_NO_RESULT: return ResultDisplay.SCHACK4AN_BOTH_NO_RESULT;
    case ResultCode.SCHACK4AN_BOTH_WIN: return ResultDisplay.SCHACK4AN_BOTH_WIN;

    // Point310
    case ResultCode.POINT310_WHITE_WIN: return ResultDisplay.POINT310_WHITE_WIN;
    case ResultCode.POINT310_WHITE_WIN_WO: return ResultDisplay.POINT310_WHITE_WIN_WO;
    case ResultCode.POINT310_WHITE_TOURIST_WO: return ResultDisplay.POINT310_WHITE_TOURIST_WO;
    case ResultCode.POINT310_BLACK_WIN: return ResultDisplay.POINT310_BLACK_WIN;
    case ResultCode.POINT310_BLACK_WIN_WO: return ResultDisplay.POINT310_BLACK_WIN_WO;
    case ResultCode.POINT310_DRAW: return ResultDisplay.POINT310_DRAW;
    case ResultCode.POINT310_BOTH_NO_RESULT: return ResultDisplay.POINT310_BOTH_NO_RESULT;
    case ResultCode.POINT310_BOTH_WIN: return ResultDisplay.POINT310_BOTH_WIN;

    default:
      return '-';
  }
}

/**
 * Parse a result code into a structured result object
 */
export function parseGameResult(resultCode: number): ParsedGameResult {
  const [whitePoints, blackPoints] = calculatePoints(resultCode);
  const outcome = getGameOutcome(resultCode);

  return {
    outcome,
    whitePoints,
    blackPoints,
    isWalkover: isWalkoverResultCode(resultCode),
    isTouristBye: isTouristBye(resultCode),
    isCountable: isCountableResult(resultCode),
    displayString: getResultDisplayString(resultCode),
  };
}

/**
 * Calculate player result from their perspective
 * @param resultCode - The game result code
 * @param isWhite - Whether the player was white
 * @returns 'win', 'draw', 'loss', or null if not countable
 */
export function getPlayerOutcome(
  resultCode: number,
  isWhite: boolean
): 'win' | 'draw' | 'loss' | null {
  if (!isCountableResult(resultCode)) {
    return null;
  }

  const outcome = getGameOutcome(resultCode);

  switch (outcome) {
    case 'white_win':
      return isWhite ? 'win' : 'loss';
    case 'black_win':
      return isWhite ? 'loss' : 'win';
    case 'draw':
      return 'draw';
    default:
      return null;
  }
}

/**
 * Calculate player points from their perspective
 * @param resultCode - The game result code
 * @param isWhite - Whether the player was white
 * @returns Points earned, or null if not countable
 */
export function getPlayerPoints(
  resultCode: number,
  isWhite: boolean
): number | null {
  if (!isCountableResult(resultCode)) {
    return null;
  }

  const [whitePoints, blackPoints] = calculatePoints(resultCode);
  return isWhite ? whitePoints : blackPoints;
}

/**
 * Get the point system name for display
 */
export function getPointSystemName(pointSystem: PointSystemType): string {
  switch (pointSystem) {
    case PointSystem.SCHACK4AN:
      return 'Schackfyran (3-2-1)';
    case PointSystem.POINT310:
      return '3-1-0';
    case PointSystem.DEFAULT:
    default:
      return 'Standard (1-½-0)';
  }
}

// =============================================================================
// Structured result parsing
// =============================================================================

/**
 * Whether a result code was decided by adjudication (both-win / both-no-result),
 * across all three point systems.
 */
export function isAdjudicatedResult(resultCode: number): boolean {
  return ADJUDICATED_CODES.has(resultCode);
}

/**
 * Whether a result code marks the game as postponed (uppskjutet).
 */
export function isPostponed(resultCode: number): boolean {
  return resultCode === ResultCode.POSTPONED;
}

/**
 * Whether a result code carries any information. `false` only for `NOT_SET` and
 * codes the SDK doesn't recognise — the signal that a consumer should fall back
 * to the pairing row's points rather than trust the code.
 */
export function isResultCodeInformative(resultCode: number): boolean {
  return KNOWN_CODES.has(resultCode) && resultCode !== ResultCode.NOT_SET;
}

/**
 * Parse a single result code into structured facts (score, nature, point system)
 * instead of a display string. Scores are numbers in the code's own point system
 * (`½` vs `0.5` is the consumer's presentation choice); `postponed` and `none`
 * carry `null` scores because they are not a result.
 */
export function parseResultDisplay(resultCode: number): ParsedResultDisplay {
  const pointSystem = getPointSystemFromResult(resultCode);
  const informative = isResultCodeInformative(resultCode);

  let kind: ResultKind;
  if (isTouristBye(resultCode)) kind = 'tourist_bye';
  else if (isWalkoverResultCode(resultCode)) kind = 'walkover';
  else if (isAdjudicatedResult(resultCode)) kind = 'adjudicated';
  else if (isPostponed(resultCode)) kind = 'postponed';
  else if (!informative) kind = 'none'; // NOT_SET or unknown code
  else kind = 'normal';

  if (kind === 'postponed' || kind === 'none') {
    return { home: null, away: null, kind, pointSystem, informative };
  }
  const [home, away] = calculatePoints(resultCode);
  return { home, away, kind, pointSystem, informative };
}

/**
 * Result of a row whose usable score is its points (not a game code): the team
 * match score, or an individual row falling back from a non-informative code.
 * `0 - 0` means "not played". The point system can't be recovered from points
 * alone, so it is reported as DEFAULT.
 */
function resultFromRowPoints(homeResult: number, awayResult: number): ParsedResultDisplay {
  if (homeResult === 0 && awayResult === 0) {
    return { home: null, away: null, kind: 'none', pointSystem: PointSystem.DEFAULT, informative: false };
  }
  return { home: homeResult, away: awayResult, kind: 'normal', pointSystem: PointSystem.DEFAULT, informative: true };
}

/**
 * Resolve the result of an **individually-paired** round row. Prefers the game's
 * result code; when that code is `NOT_SET` or unknown, falls back to the row's
 * `homeResult`/`awayResult` (treating `0 - 0` there as "not played").
 *
 * Dispatch team-vs-individual by tournament type — do **not** pass a team match
 * row here; those keep the boards in `games[]` and the match score in
 * `homeResult`/`awayResult` (use {@link resolveTeamMatchResult}). As a safety
 * net a multi-board row returns `kind: 'none'` rather than board 1's result.
 */
export function resolveIndividualResult(
  row: Pick<TournamentRoundResultDto, 'homeResult' | 'awayResult' | 'games'>
): ParsedResultDisplay {
  const games = row.games ?? [];
  if (games.length > 1) {
    return { home: null, away: null, kind: 'none', pointSystem: PointSystem.DEFAULT, informative: false };
  }
  if (games.length === 1) {
    const parsed = parseResultDisplay(games[0].result);
    if (parsed.informative) return parsed;
    // code was NOT_SET / unknown — fall through to the row's points
  }
  return resultFromRowPoints(row.homeResult, row.awayResult);
}

/**
 * Resolve the result of a **team match** row. The match score is the row's
 * `homeResult`/`awayResult`; `games[]` holds the individual boards and is not
 * read here. `0 - 0` means the match has not been played.
 */
export function resolveTeamMatchResult(
  row: Pick<TournamentRoundResultDto, 'homeResult' | 'awayResult'>
): ParsedResultDisplay {
  return resultFromRowPoints(row.homeResult, row.awayResult);
}
