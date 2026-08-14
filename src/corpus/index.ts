/**
 * A curated catalogue of real SSF tournaments and groups that illustrate
 * specific data shapes, encodings and anomalies — for discovery, verifying new
 * features, and hunting anomalies, plus as a source of realistic test targets.
 *
 * This is a **catalogue, not a fixture folder**: most entries exist to answer
 * "show me a real example of X", keyed by `tags`. Every claim carries an
 * `observed` date because SSF data drifts — counts move as results/ratings
 * update, and ids can disappear. `pnpm corpus:verify` checks entries against
 * live data.
 *
 * Shipped on the `./corpus` subpath (not the main index) so it stays out of a
 * consumer's production bundle:
 *
 * ```ts
 * import { findCorpusEntries } from '@msvens/schack-se-sdk/corpus';
 * const walkovers = findCorpusEntries({ tags: ['walkover'] });
 * ```
 */
import rawCorpus from './ssf-corpus.json';

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
export const ssfCorpus = rawCorpus as unknown as Corpus;

/** All catalogue entries. */
export const corpusEntries: readonly CorpusEntry[] = ssfCorpus.entries;

/** The declared tag vocabulary (every entry tag must be one of these). */
export const CORPUS_TAGS: readonly string[] = ssfCorpus._meta.tags;

/** Look up a single entry by its stable id. */
export function getCorpusEntry(id: string): CorpusEntry | undefined {
  return corpusEntries.find((e) => e.id === id);
}

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
export function findCorpusEntries(filter: CorpusFilter = {}): CorpusEntry[] {
  const { tags, allTags, anomaly, hasGroupId, hasTournamentId } = filter;
  return corpusEntries.filter((e) => {
    if (tags && !tags.some((t) => e.tags.includes(t))) return false;
    if (allTags && !allTags.every((t) => e.tags.includes(t))) return false;
    if (anomaly !== undefined && Boolean(e.anomaly) !== anomaly) return false;
    if (hasGroupId !== undefined && (e.groupId !== null) !== hasGroupId) return false;
    if (hasTournamentId !== undefined && (e.tournamentId !== null) !== hasTournamentId) return false;
    return true;
  });
}
