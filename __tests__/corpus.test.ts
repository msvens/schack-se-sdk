/**
 * Keeps the test-data corpus honest as it grows (incl. via PRs): well-formed
 * ids, declared tags, valid dates, and correct query behaviour. Pure — no network.
 */
import { describe, it, expect } from 'vitest';
import {
  ssfCorpus,
  corpusEntries,
  CORPUS_TAGS,
  getCorpusEntry,
  findCorpusEntries,
} from '../src/corpus';

describe('corpus — data integrity', () => {
  it('has entries and a _meta block', () => {
    expect(corpusEntries.length).toBeGreaterThan(0);
    expect(ssfCorpus._meta.tags.length).toBeGreaterThan(0);
    expect(ssfCorpus._meta.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('ids are unique and kebab-case', () => {
    const ids = corpusEntries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id, id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('every entry has the required, correctly-typed fields', () => {
    for (const e of corpusEntries) {
      expect(typeof e.name, e.id).toBe('string');
      expect(e.name.length, e.id).toBeGreaterThan(0);
      expect(typeof e.illustrates, e.id).toBe('string');
      expect(typeof e.note, e.id).toBe('string');
      expect(e.tournamentId === null || typeof e.tournamentId === 'number', e.id).toBe(true);
      expect(e.groupId === null || typeof e.groupId === 'number', e.id).toBe(true);
      if (e.anomaly !== undefined) expect(typeof e.anomaly, e.id).toBe('boolean');
    }
  });

  it('every observed date is a valid YYYY-MM-DD', () => {
    for (const e of corpusEntries) {
      expect(e.observed, e.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(e.observed)), e.id).toBe(false);
    }
  });

  it('every tag used is declared in _meta.tags (CORPUS_TAGS)', () => {
    const known = new Set(CORPUS_TAGS);
    for (const e of corpusEntries) {
      expect(e.tags.length, e.id).toBeGreaterThan(0);
      for (const t of e.tags) expect(known.has(t), `${e.id}: undeclared tag "${t}"`).toBe(true);
    }
  });
});

describe('corpus — query helpers', () => {
  it('getCorpusEntry finds by id and returns undefined otherwise', () => {
    expect(getCorpusEntry('vasteras-open-2025-senior-boundary')?.groupId).toBe(16642);
    expect(getCorpusEntry('does-not-exist')).toBeUndefined();
  });

  it('findCorpusEntries with no filter returns everything', () => {
    expect(findCorpusEntries()).toHaveLength(corpusEntries.length);
  });

  it('tags matches ANY, allTags matches ALL', () => {
    const anyWomen = findCorpusEntries({ tags: ['prize-women'] });
    expect(anyWomen.length).toBeGreaterThan(0);
    expect(anyWomen.every((e) => e.tags.includes('prize-women'))).toBe(true);

    const both = findCorpusEntries({ allTags: ['prize-women', 'unrated-players'] });
    expect(both.every((e) => e.tags.includes('prize-women') && e.tags.includes('unrated-players'))).toBe(true);
    expect(both.length).toBeLessThanOrEqual(anyWomen.length);
  });

  it('filters by anomaly and by id presence', () => {
    expect(findCorpusEntries({ anomaly: true }).every((e) => e.anomaly === true)).toBe(true);
    expect(findCorpusEntries({ hasGroupId: true }).every((e) => e.groupId !== null)).toBe(true);
    expect(findCorpusEntries({ hasTournamentId: false }).every((e) => e.tournamentId === null)).toBe(true);
  });
});
