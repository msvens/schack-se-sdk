/** One catalogued tournament/group (or a conceptual entry with null ids). */
export interface CorpusEntry {
    /** Stable kebab-case slug; never reused. */
    id: string;
    /** SSF tournament id, or null for conceptual / group-only entries. */
    tournamentId: number | null;
    /** SSF group id, or null for tournament-level / conceptual entries. */
    groupId: number | null;
    /** Human label as it appears in the API. */
    name: string;
    /** Queryable topics; see {@link CORPUS_TAGS}. */
    tags: string[];
    /** One line: what this entry is an example OF. */
    illustrates: string;
    /** Detail worth knowing — the numbers/ids that make it useful. */
    note: string;
    /** ISO date (YYYY-MM-DD) the claim was last verified against live data. */
    observed: string;
    /** True when the entry documents something broken or contradictory upstream. */
    anomaly?: boolean;
}
/** The corpus `_meta` block: schema, conventions and the tag vocabulary. */
export interface CorpusMeta {
    purpose: string;
    seededBy: string;
    schema: Record<string, string>;
    conventions: string[];
    tags: string[];
    lastReviewed: string;
}
export interface Corpus {
    _meta: CorpusMeta;
    entries: CorpusEntry[];
}
/** The full corpus, including `_meta`. */
export declare const ssfCorpus: Corpus;
/** All catalogue entries. */
export declare const corpusEntries: readonly CorpusEntry[];
/** The declared tag vocabulary (every entry tag must be one of these). */
export declare const CORPUS_TAGS: readonly string[];
/** Look up a single entry by its stable id. */
export declare function getCorpusEntry(id: string): CorpusEntry | undefined;
/** Filter options for {@link findCorpusEntries}. All conditions are AND-ed. */
export interface CorpusFilter {
    /** Keep entries carrying ANY of these tags. */
    tags?: string[];
    /** Keep entries carrying ALL of these tags. */
    allTags?: string[];
    /** Keep only anomalies (true) or only non-anomalies (false). */
    anomaly?: boolean;
    /** Keep only entries that have (true) / lack (false) a groupId. */
    hasGroupId?: boolean;
    /** Keep only entries that have (true) / lack (false) a tournamentId. */
    hasTournamentId?: boolean;
}
/**
 * Find catalogue entries matching a filter. With no filter, returns all entries.
 */
export declare function findCorpusEntries(filter?: CorpusFilter): CorpusEntry[];
//# sourceMappingURL=index.d.ts.map