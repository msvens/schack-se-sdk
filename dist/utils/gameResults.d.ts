/**
 * Game result handling for different point systems
 *
 * Point Systems:
 * - DEFAULT (-1): Standard 1/0.5/0 (Win=1, Draw=0.5, Loss=0)
 * - SCHACK4AN (1): Schackfyran 3/2/1 (Win=3, Draw=2, Loss=1)
 * - POINT310 (2): 3-1-0 system (Win=3, Draw=1, Loss=0)
 */
import type { TournamentRoundResultDto } from '../types';
export declare const PointSystem: {
    readonly DEFAULT: -1;
    readonly SCHACK4AN: 1;
    readonly POINT310: 2;
};
export type PointSystemType = typeof PointSystem[keyof typeof PointSystem];
export declare const PointValues: {
    readonly [-1]: {
        readonly win: 1;
        readonly draw: 0.5;
        readonly loss: 0;
    };
    readonly 1: {
        readonly win: 3;
        readonly draw: 2;
        readonly loss: 1;
    };
    readonly 2: {
        readonly win: 3;
        readonly draw: 1;
        readonly loss: 0;
    };
};
/**
 * Result codes from the API
 * Positive values generally favor white, negative favor black
 */
export declare const ResultCode: {
    readonly NOT_SET: -100;
    readonly POSTPONED: 100;
    readonly WHITE_WIN: 1;
    readonly WHITE_WIN_WO: 2;
    readonly WHITE_TOURIST_WO: 29;
    readonly BLACK_WIN: -1;
    readonly BLACK_WIN_WO: -2;
    readonly NO_WIN_WO: -3;
    readonly DRAW: 0;
    readonly BOTH_NO_RESULT: -10;
    readonly BOTH_WIN: 15;
    readonly SCHACK4AN_WHITE_WIN: 3;
    readonly SCHACK4AN_WHITE_WIN_WO: 5;
    readonly SCHACK4AN_WHITE_TOURIST_WO: 31;
    readonly SCHACK4AN_BLACK_WIN: -4;
    readonly SCHACK4AN_BLACK_WIN_WO: -5;
    readonly SCHACK4AN_DRAW: 10;
    readonly SCHACK4AN_BOTH_NO_RESULT: -20;
    readonly SCHACK4AN_BOTH_WIN: 20;
    readonly POINT310_WHITE_WIN: 26;
    readonly POINT310_WHITE_WIN_WO: 25;
    readonly POINT310_WHITE_TOURIST_WO: 30;
    readonly POINT310_BLACK_WIN: -26;
    readonly POINT310_BLACK_WIN_WO: -25;
    readonly POINT310_DRAW: 27;
    readonly POINT310_BOTH_NO_RESULT: -27;
    readonly POINT310_BOTH_WIN: 28;
};
export type ResultCodeType = typeof ResultCode[keyof typeof ResultCode];
export declare const ResultDisplay: {
    readonly WHITE_WIN: "1 - 0";
    readonly WHITE_WIN_WO: "1 - 0 w.o";
    readonly WHITE_TOURIST_WO: "½ bye";
    readonly BLACK_WIN: "0 - 1";
    readonly BLACK_WIN_WO: "0 - 1 w.o";
    readonly NO_WIN_WO: "0 - 0 w.o";
    readonly DRAW: "½ - ½";
    readonly NO_RESULT: "  -  ";
    readonly BOTH_NO_RESULT: "0 - 0 adj";
    readonly BOTH_WIN: "1 - 1 adj";
    readonly POSTPONED: "postponed";
    readonly SCHACK4AN_WHITE_WIN: "3 - 1";
    readonly SCHACK4AN_WHITE_WIN_WO: "3 - 0 w.o";
    readonly SCHACK4AN_WHITE_TOURIST_WO: "2 bye";
    readonly SCHACK4AN_BLACK_WIN: "1 - 3";
    readonly SCHACK4AN_BLACK_WIN_WO: "0 - 3 w.o";
    readonly SCHACK4AN_DRAW: "2 - 2";
    readonly SCHACK4AN_BOTH_NO_RESULT: "1 - 1 adj";
    readonly SCHACK4AN_BOTH_WIN: "3 - 3 adj";
    readonly POINT310_WHITE_WIN: "3 - 0";
    readonly POINT310_WHITE_WIN_WO: "3 - 0 w.o";
    readonly POINT310_WHITE_TOURIST_WO: "1 bye";
    readonly POINT310_BLACK_WIN: "0 - 3";
    readonly POINT310_BLACK_WIN_WO: "0 - 3 w.o";
    readonly POINT310_DRAW: "1 - 1";
    readonly POINT310_BOTH_NO_RESULT: "0 - 0 adj";
    readonly POINT310_BOTH_WIN: "3 - 3 adj";
};
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
export type ResultKind = 'normal' | 'walkover' | 'tourist_bye' | 'adjudicated' | 'postponed' | 'none';
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
/**
 * Determine which point system a result code belongs to
 */
export declare function getPointSystemFromResult(resultCode: number): PointSystemType;
/**
 * Check if a result code indicates white won
 */
export declare function isWhiteWin(resultCode: number): boolean;
/**
 * Check if a result code indicates black won
 */
export declare function isBlackWin(resultCode: number): boolean;
/**
 * Check if a result code indicates a draw
 */
export declare function isDraw(resultCode: number): boolean;
/**
 * Check if a result code indicates a walkover/forfeit
 */
export declare function isWalkoverResultCode(resultCode: number): boolean;
/**
 * Check if a result code indicates a tourist bye
 */
export declare function isTouristBye(resultCode: number): boolean;
/**
 * Check if a result should be counted in statistics
 */
export declare function isCountableResult(resultCode: number): boolean;
/**
 * Get the game outcome from a result code
 */
export declare function getGameOutcome(resultCode: number): GameOutcome;
/**
 * Calculate points for a result code
 * Returns [whitePoints, blackPoints]
 */
export declare function calculatePoints(resultCode: number): [number, number];
/**
 * Get the display string for a result code
 */
export declare function getResultDisplayString(resultCode: number): string;
/**
 * Parse a result code into a structured result object
 */
export declare function parseGameResult(resultCode: number): ParsedGameResult;
/**
 * Calculate player result from their perspective
 * @param resultCode - The game result code
 * @param isWhite - Whether the player was white
 * @returns 'win', 'draw', 'loss', or null if not countable
 */
export declare function getPlayerOutcome(resultCode: number, isWhite: boolean): 'win' | 'draw' | 'loss' | null;
/**
 * Calculate player points from their perspective
 * @param resultCode - The game result code
 * @param isWhite - Whether the player was white
 * @returns Points earned, or null if not countable
 */
export declare function getPlayerPoints(resultCode: number, isWhite: boolean): number | null;
/**
 * Get the point system name for display
 */
export declare function getPointSystemName(pointSystem: PointSystemType): string;
/**
 * Whether a result code was decided by adjudication (both-win / both-no-result),
 * across all three point systems.
 */
export declare function isAdjudicatedResult(resultCode: number): boolean;
/**
 * Whether a result code marks the game as postponed (uppskjutet).
 */
export declare function isPostponed(resultCode: number): boolean;
/**
 * Whether a result code carries any information. `false` only for `NOT_SET` and
 * codes the SDK doesn't recognise — the signal that a consumer should fall back
 * to the pairing row's points rather than trust the code.
 */
export declare function isResultCodeInformative(resultCode: number): boolean;
/**
 * Parse a single result code into structured facts (score, nature, point system)
 * instead of a display string. Scores are numbers in the code's own point system
 * (`½` vs `0.5` is the consumer's presentation choice); `postponed` and `none`
 * carry `null` scores because they are not a result.
 */
export declare function parseResultDisplay(resultCode: number): ParsedResultDisplay;
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
export declare function resolveIndividualResult(row: Pick<TournamentRoundResultDto, 'homeResult' | 'awayResult' | 'games'>): ParsedResultDisplay;
/**
 * Resolve the result of a **team match** row. The match score is the row's
 * `homeResult`/`awayResult`; `games[]` holds the individual boards and is not
 * read here. `0 - 0` means the match has not been played.
 */
export declare function resolveTeamMatchResult(row: Pick<TournamentRoundResultDto, 'homeResult' | 'awayResult'>): ParsedResultDisplay;
//# sourceMappingURL=gameResults.d.ts.map