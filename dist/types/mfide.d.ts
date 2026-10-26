/**
 * FIDE rating types from mfide (https://github.com/msvens/mfide), a service
 * built on FIDE's official monthly rating-list downloads.
 *
 * 1:1 with the API's JSON (see mfide's API.md). Unlike ChessTools, every
 * endpoint shares one player shape, and an unrated type is `null`, never 0.
 */
/** A player's rating in one type (standard, rapid or blitz) for one month. */
export interface MfideRating {
    rating: number;
    /** Rated games in that month's list */
    games: number;
    /** K-factor */
    k: number;
    /** FIDE's activity flag, per rating type */
    active: boolean;
}
/** A player with the current month's ratings. */
export interface MfidePlayer {
    fideId: number;
    /** Exactly as FIDE spells it, usually "Last, First" but not always */
    name: string;
    /** Three-letter FIDE federation code, e.g. "SWE" */
    country: string;
    sex: 'M' | 'F';
    /** GM IM FM CM WGM WIM WFM WCM, or "" */
    title: string;
    /** WGM WIM WFM WCM held alongside `title`, or "" */
    womenTitle: string;
    /** Arbiter, trainer and organizer titles (IA, FA, NA, FT, …) */
    otherTitles: string[];
    /** FIDE Online Arena title, or "" */
    foaTitle: string;
    birthYear: number | null;
    /** null when unrated in that type */
    standard: MfideRating | null;
    rapid: MfideRating | null;
    blitz: MfideRating | null;
}
/** A top-list entry: a player plus its 1-based position (ties don't share). */
export interface MfideTopEntry extends MfidePlayer {
    rank: number;
}
/** One month of a player's ratings. */
export interface MfideHistoryEntry {
    /** "YYYY-MM" */
    period: string;
    standard: MfideRating | null;
    rapid: MfideRating | null;
    blitz: MfideRating | null;
}
/** `GET /health` */
export interface MfideHealth {
    status: string;
    db: string;
    apiVersion: string;
    build: string;
    /** The current ratings month, "YYYY-MM"; absent before the first import */
    ratingsMonth?: string;
    lastImport?: string;
    /** Absent before the first daily sync */
    lastSync?: {
        finishedAt: string;
        ok: boolean;
    };
}
/** `GET /key`: the calling key's name and limit. */
export interface MfideKeyInfo {
    name: string;
    prefix: string;
    ratePerMin: number;
}
export type MfideRatingType = 'standard' | 'rapid' | 'blitz';
/** Parameters for `searchPlayers`. */
export interface MfideSearchParams {
    /**
     * `prefix` (default): every word starts a word of the name, the last word
     * still being typed, so best for type-ahead. `word`: whole words only.
     */
    match?: 'prefix' | 'word';
    /** Federation code, e.g. "SWE" */
    country?: string;
    /** 1–100, default 20 */
    limit?: number;
}
/** Parameters for `getTop`. */
export interface MfideTopParams {
    /** Default `standard` */
    type?: MfideRatingType;
    /** Default `open`. `juniors`/`girls`: born in the last 20 years */
    list?: 'open' | 'women' | 'juniors' | 'girls';
    /** Federation code; omit for the world list */
    country?: string;
    /** 1–500, default 100 */
    limit?: number;
}
//# sourceMappingURL=mfide.d.ts.map