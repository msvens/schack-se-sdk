import type { PrizeCategoryDto, TournamentEndResultDto } from '../types';
/** Prize-category `type` codes. */
export declare const PrizeCategoryType: {
    /** Age band. `start`/`end` are ages (see {@link chessAge}). */
    readonly AGE: 1;
    /** Women's prize ("DAM"). Matched as "is female"; any `start`/`end` bounds
     *  are present in the data but not applied (see resolvePrizeMembers). */
    readonly WOMEN: 2;
    /** Senior/veteran ("VETERAN"). Bounds are ignored; the rule is age ≥ 60. */
    readonly SENIOR: 3;
    /** Rating band ("RANKING"). `start`/`end` are Elo bounds, inclusive. */
    readonly RATING: 4;
    /** SM class ("SM-KLASS"). Only ever seen as a registration restriction. */
    readonly SMCLASS: 5;
};
export type PrizeCategoryTypeValue = typeof PrizeCategoryType[keyof typeof PrizeCategoryType];
/**
 * A prize category parsed into a described rule, so a consumer never re-derives
 * that `start`/`end` mean ages here, Elo there, and nothing for SENIOR.
 */
export type PrizeRule = {
    kind: 'rating';
    min: number;
    max: number;
} | {
    kind: 'age';
    minAge: number;
    maxAge: number;
} | {
    kind: 'senior';
} | {
    kind: 'women';
} | {
    kind: 'smclass';
} | {
    kind: 'unknown';
    type: number;
};
/**
 * Whether a category is a prize (`usagetype === 1`) rather than an entry
 * restriction from `registrationCategories` (`usagetype === 2`).
 */
export declare function isPrizeCategory(category: PrizeCategoryDto): boolean;
/** Interpret a raw category into a {@link PrizeRule}. Pure — no player data. */
export declare function parsePrizeCategory(category: PrizeCategoryDto): PrizeRule;
export interface PrizeEligibilityOptions {
    /** Calendar year the tournament is played in — the basis for every age band. */
    tournamentYear: number;
    /** Group ranking algorithm, so ratings match what the standings table displays. */
    rankingAlgorithm: number | null | undefined;
}
/**
 * Contender ids from `results` eligible for `category`.
 *
 * PURE: the caller passes the standings it already has, so this never touches
 * the network. Ratings come from `getPlayerRatingByAlgorithm` — the same call
 * the standings table uses — so a player's displayed rating and their band
 * membership can never disagree, including when a fallback rating is used (a
 * player rated only in another time control is banded on that fallback rating,
 * as the federation does; verified against resultat.schack.se).
 *
 * - Rating band: rating within `[start, end]` inclusive. A genuinely unrated
 *   player (rating `null`) counts only towards a band starting at 0 — the
 *   organiser's catch-all, since no real SSF rating sits between 1 and 1000.
 * - Age band: {@link chessAge} within `[start, end]`.
 * - Senior: age ≥ 60 for the player's sex; bounds ignored.
 * - Women: female. Any rating bounds on the category are NOT applied — see the
 *   note in the implementation (verified against resultat.schack.se).
 * - SM class / unknown types: nobody.
 *
 * Only valid for individual standings; team result rows carry no player info.
 *
 * Returns `[]` for a non-prize category (`usagetype !== 1`) — the entries in a
 * group's `registrationCategories` are entry restrictions, not prizes, and share
 * the same `PrizeCategoryDto` shape, so this guards against one being passed by
 * mistake (which would otherwise return a plausible-but-wrong "winners" list,
 * e.g. every player under a "Rankingspärr 1750" registration bar).
 *
 * @returns Eligible contender ids, in the order they appear in `results`.
 */
export declare function resolvePrizeMembers(category: PrizeCategoryDto, results: readonly TournamentEndResultDto[], opts: PrizeEligibilityOptions): number[];
//# sourceMappingURL=prizeCategories.d.ts.map