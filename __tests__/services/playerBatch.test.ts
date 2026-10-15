/**
 * Unit tests for PlayerService.getPlayerInfoBatch (bulk POST first, then
 * smaller chunks, then single GETs) and the shared batch item contract.
 * Uses fetch mocking; the live check is in players.test.ts.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayerService, type BatchItemResult, type BatchOptions } from '../../src/services/players';
import { TournamentService } from '../../src/services/tournaments';
import type { MemberDateDto, PlayerInfoDto, TournamentDto } from '../../src/types';

const BASE_URL = 'https://example.test/api';
const LIST_URL = `${BASE_URL}/player/list/`;

const player = (id: number, withElo = true) => ({
  id, firstName: `P${id}`, lastName: 'Test',
  ...(withElo ? { elo: { rating: 1500 + id, date: '2026-10-01' } } : {}),
});
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

/**
 * A fake API. `unknown` ids make any POST containing them fail with 500 and
 * their single GET answer 204, like school-only players on the real API.
 */
function fakeApi(unknown: Set<number> = new Set()) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    if (url === LIST_URL) {
      const body = JSON.parse(String(init?.body)) as MemberDateDto[];
      if (body.some((m) => unknown.has(m.id))) return json({ message: 'Internal Server Error' }, 500);
      return json(body.map((m) => player(m.id)));
    }
    const m = url.match(/\/player\/(\d+)\/date\/(\d{4}-\d{2}-\d{2})$/);
    if (m) return unknown.has(Number(m[1])) ? new Response(null, { status: 204 }) : json(player(Number(m[1])));
    throw new Error(`unexpected request ${url}`);
  });
}

const posts = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.filter(([url]) => url === LIST_URL).map(([, init]) => JSON.parse(String(init.body)) as MemberDateDto[]);
const gets = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.filter(([url]) => url !== LIST_URL).map(([url]) => url as string);

const pairs = (ids: number[], date = '2026-10-01'): MemberDateDto[] => ids.map((id) => ({ id, date }));
const range = (from: number, n: number) => Array.from({ length: n }, (_, i) => from + i);

describe('PlayerService.getPlayerInfoBatch', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const service = () => new PlayerService(BASE_URL);

  beforeEach(() => {
    fetchMock = fakeApi();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches clean data with a single bulk POST, in input order', async () => {
    const results = await service().getPlayerInfoBatch(pairs([3, 1, 2]));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(posts(fetchMock)[0]).toEqual(pairs([3, 1, 2]));
    expect(results.map((r) => [r.data?.id, r.error, r.status])).toEqual([[3, null, 200], [1, null, 200], [2, null, 200]]);
  });

  it('posts each unique pair once and fills every input position', async () => {
    const input = [...pairs([1, 2]), { id: 1, date: '2026-09-01' }, ...pairs([2, 1])];
    const results = await service().getPlayerInfoBatch(input);
    expect(posts(fetchMock)).toEqual([[...pairs([1, 2]), { id: 1, date: '2026-09-01' }]]);
    expect(results.map((r) => r.data?.id)).toEqual([1, 2, 1, 2, 1]);
  });

  it('accepts ids with one date, defaulting to today', async () => {
    await service().getPlayerInfoBatch([1, 2], new Date(2026, 8, 15));
    expect(posts(fetchMock)[0]).toEqual(pairs([1, 2], '2026-09-15'));

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    await service().getPlayerInfoBatch([3, 4], undefined, { concurrency: 5 });
    expect(posts(fetchMock)[1]).toEqual(pairs([3, 4], today));
  });

  it('returns [] for empty input without a request', async () => {
    expect(await service().getPlayerInfoBatch([])).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('degrades a failed bulk POST to chunks of 25, then single GETs for a chunk that still fails', async () => {
    fetchMock = fakeApi(new Set([75]));
    vi.stubGlobal('fetch', fetchMock);

    const results = await service().getPlayerInfoBatch(pairs(range(1, 120)));

    // 1 bulk POST (500) → 5 retry POSTs of 25/25/25/25/20; the 3rd (ids 51–75) fails → 25 single GETs
    expect(posts(fetchMock).map((p) => p.length)).toEqual([120, 25, 25, 25, 25, 20]);
    expect(gets(fetchMock)).toHaveLength(25);
    expect(gets(fetchMock).every((url) => /\/player\/(5[1-9]|6\d|7[0-5])\//.test(url))).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(31);

    expect(results).toHaveLength(120);
    expect(results.filter((r) => r.status === 200)).toHaveLength(119);
    expect(results[74]).toEqual({ data: null, error: null, status: 204 }); // id 75: missing
  });

  it('runs at most 4 retry POSTs at once, then pools the failed chunks\' GETs', async () => {
    let inFlight = 0;
    let maxPostsInFlight = 0;
    const api = fakeApi(new Set([10, 60, 110, 160, 210]));
    fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const isRetryPost = url === LIST_URL && JSON.parse(String(init?.body)).length <= 25;
      if (isRetryPost) { inFlight++; maxPostsInFlight = Math.max(maxPostsInFlight, inFlight); }
      await new Promise((r) => setTimeout(r, 5));
      try { return await api(url, init); } finally { if (isRetryPost) inFlight--; }
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await service().getPlayerInfoBatch(pairs(range(1, 250)));

    expect(posts(fetchMock).filter((p) => p.length <= 25)).toHaveLength(10);
    expect(maxPostsInFlight).toBe(4);
    expect(gets(fetchMock)).toHaveLength(5 * 25); // the 5 chunks holding an unknown id
    expect(results.filter((r) => r.status === 204)).toHaveLength(5);
    expect(results.filter((r) => r.status === 200)).toHaveLength(245);
  });

  it('goes straight to single GETs when a small batch fails', async () => {
    fetchMock = fakeApi(new Set([2]));
    vi.stubGlobal('fetch', fetchMock);
    const results = await service().getPlayerInfoBatch(pairs([1, 2, 3]));
    expect(posts(fetchMock)).toHaveLength(1);
    expect(gets(fetchMock)).toHaveLength(3);
    expect(results.map((r) => r.status)).toEqual([200, 204, 200]);
  });

  it('maps single-GET outcomes to found / missing / error', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === LIST_URL) return json({}, 500);
      if (url.includes('/player/1/')) return json(player(1));
      if (url.includes('/player/2/')) return new Response(null, { status: 204 });
      if (url.includes('/player/3/')) return json({ error: 'Not found' }, 404);
      if (url.includes('/player/4/')) return json({}, 503);
      throw new Error('ECONNRESET');
    });
    const results = await service().getPlayerInfoBatch(pairs([1, 2, 3, 4, 5]));
    expect(results.map((r) => [r.status, r.error === null])).toEqual([
      [200, true],   // found
      [204, true],   // missing
      [404, true],   // missing
      [503, false],  // error
      [0, false],    // network error
    ]);
  });

  it('treats a POST answer of the wrong length or with mismatched ids as a failure', async () => {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url === LIST_URL) {
        const body = JSON.parse(String(init?.body)) as MemberDateDto[];
        return json(body.slice(1).map((m) => player(m.id))); // one short
      }
      return json(player(Number(url.match(/\/player\/(\d+)\//)![1])));
    });
    const results = await service().getPlayerInfoBatch(pairs([1, 2]));
    expect(gets(fetchMock)).toHaveLength(2);
    expect(results.map((r) => r.data?.id)).toEqual([1, 2]);

    fetchMock.mockImplementation(async (url: string) =>
      url === LIST_URL ? json([player(2), player(1)]) : json(player(Number(url.match(/\/player\/(\d+)\//)![1]))));
    const swapped = await service().getPlayerInfoBatch(pairs([1, 2]));
    expect(swapped.map((r) => r.data?.id)).toEqual([1, 2]);
  });

  it('reports a network failure on the POST without fanning out to single GETs', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const results = await service().getPlayerInfoBatch(pairs(range(1, 120)));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results.every((r) => r.status === 0 && r.error === 'ECONNREFUSED')).toBe(true);
  });

  it('answers ids <= 0 without a request and still fetches the rest', async () => {
    const results = await service().getPlayerInfoBatch(pairs([1, -100, 2]));
    expect(posts(fetchMock)[0]).toEqual(pairs([1, 2]));
    expect(results[1]).toEqual({ data: null, error: 'Invalid player id', status: 0 });
    expect(results.map((r) => r.status)).toEqual([200, 0, 200]);
  });

  it('counts a player without elo (unrated that month) as found', async () => {
    fetchMock.mockImplementation(async () => json([player(1, false), player(2)]));
    const [result] = await service().getPlayerInfoBatch(pairs([1, 2]));
    expect(result).toMatchObject({ error: null, status: 200, data: { id: 1 } });
    expect(result.data?.elo).toBeUndefined();
  });

  it('fetches a single pair with one GET and no POST', async () => {
    const [found] = await service().getPlayerInfoBatch(pairs([7]));
    expect(posts(fetchMock)).toHaveLength(0);
    expect(gets(fetchMock)).toEqual([`${BASE_URL}/player/7/date/2026-10-01`]);
    expect(found).toMatchObject({ error: null, status: 200, data: { id: 7 } });

    fetchMock = fakeApi(new Set([8]));
    vi.stubGlobal('fetch', fetchMock);
    const [missing] = await service().getPlayerInfoBatch([8, 8], new Date(2026, 9, 1)); // duplicates → still one pair
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(missing).toEqual({ data: null, error: null, status: 204 });
  });

  it('splits more than 1000 unique pairs into several bulk POSTs', async () => {
    const results = await service().getPlayerInfoBatch(pairs(range(1, 1500)));
    expect(posts(fetchMock).map((p) => p.length)).toEqual([1000, 500]);
    expect(results).toHaveLength(1500);
  });

  it('fetches a trailing bulk chunk of one pair with its GET', async () => {
    const results = await service().getPlayerInfoBatch(pairs(range(1, 1001)));
    expect(posts(fetchMock).map((p) => p.length)).toEqual([1000]);
    expect(gets(fetchMock)).toEqual([`${BASE_URL}/player/1001/date/2026-10-01`]);
    expect(results.every((r) => r.status === 200)).toBe(true);
  });
});

describe('onItem progress callback', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /** Records every onItem call. */
  function recorder<T>() {
    const calls: { result: BatchItemResult<T>; index: number }[] = [];
    return { calls, onItem: (result: BatchItemResult<T>, index: number) => { calls.push({ result, index }); } };
  }

  it('fires once per input index (duplicates and ids <= 0 included) with the returned objects', async () => {
    vi.stubGlobal('fetch', fakeApi());
    const { calls, onItem } = recorder<PlayerInfoDto>();
    const input = [...pairs([1, 2]), { id: -100, date: '2026-10-01' }, ...pairs([1])];
    const results = await new PlayerService(BASE_URL).getPlayerInfoBatch(input, { onItem });

    expect(calls.map((c) => c.index).sort()).toEqual([0, 1, 2, 3]);
    for (const { result, index } of calls) expect(result).toBe(results[index]);
    expect(results[0]).toBe(results[3]); // duplicate pairs share one result
  });

  it('reports ids <= 0 before any request', async () => {
    const fetchMock = fakeApi();
    vi.stubGlobal('fetch', fetchMock);
    let requestsAtFirstCall = -1;
    await new PlayerService(BASE_URL).getPlayerInfoBatch(pairs([-1, 1, 2]), {
      onItem: (_result, index) => { if (requestsAtFirstCall < 0 && index === 0) requestsAtFirstCall = fetchMock.mock.calls.length; },
    });
    expect(requestsAtFirstCall).toBe(0);
  });

  it('fires in completion order along the degrade path', async () => {
    vi.stubGlobal('fetch', fakeApi(new Set([75])));
    const { calls, onItem } = recorder<PlayerInfoDto>();
    const results = await new PlayerService(BASE_URL).getPlayerInfoBatch(pairs(range(1, 120)), { onItem });

    expect(calls).toHaveLength(120);
    expect(new Set(calls.map((c) => c.index)).size).toBe(120);
    // the 4 retry POSTs that succeed fire first; the failed chunk (ids 51–75, indices 50–74) comes last, via GETs
    const lastChunk = calls.slice(-25).map((c) => c.index).sort((a, b) => a - b);
    expect(lastChunk).toEqual(range(50, 25));
    expect(calls.find((c) => c.index === 74)!.result).toEqual({ data: null, error: null, status: 204 });
    for (const { result, index } of calls) expect(result).toBe(results[index]);
  });

  it('keeps going when the callback throws', async () => {
    vi.stubGlobal('fetch', fakeApi());
    const seen: number[] = [];
    const results = await new PlayerService(BASE_URL).getPlayerInfoBatch(pairs([1, 2, 3]), {
      onItem: (_result, index) => { seen.push(index); throw new Error('boom'); },
    });
    expect(seen.sort()).toEqual([0, 1, 2]);
    expect(results.map((r) => r.data?.id)).toEqual([1, 2, 3]);
  });

  it('fires for the tournament batch methods, once per index with the matching result', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const id = Number(url.split('/').pop());
      return id === 2 ? new Response(null, { status: 204 }) : json({ id, name: `T${id}` });
    }));
    const service = new TournamentService(BASE_URL);

    const a = recorder<TournamentDto>();
    const results = await service.getTournamentBatch([1, 2, 1, 3], { concurrency: 2, onItem: a.onItem });
    expect(a.calls.map((c) => c.index)).toEqual([0, 1, 2, 3]);
    for (const { result, index } of a.calls) expect(result).toBe(results[index]);

    const b = recorder<TournamentDto>();
    await service.getTournamentFromGroupBatch([5, 6], { onItem: b.onItem });
    expect(b.calls.map((c) => [c.index, c.result.data?.id])).toEqual([[0, 5], [1, 6]]);
  });

  it('accepts an untyped BatchOptions everywhere, and types result.data per method', async () => {
    vi.stubGlobal('fetch', fakeApi());
    const plain: BatchOptions = { concurrency: 5 };
    await new PlayerService(BASE_URL).getPlayerInfoBatch([1], undefined, plain);
    await new PlayerService(BASE_URL).getPlayerInfoBatch(pairs([1]), plain);
    await new TournamentService(BASE_URL).getTournamentBatch([], plain);
    await new TournamentService(BASE_URL).getTournamentFromGroupBatch([], plain);

    const names: string[] = [];
    await new PlayerService(BASE_URL).getPlayerInfoBatch(pairs([1, 2]), {
      onItem: (result) => { if (result.data) names.push(result.data.firstName); }, // typed as PlayerInfoDto
    });
    expect(names.sort()).toEqual(['P1', 'P2']);
  });
});

describe('TournamentService batch methods', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('give every input exactly one item, with its status', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.endsWith('/id/1')) return json({ id: 1, name: 'T1' });
      if (url.endsWith('/id/2')) return new Response(null, { status: 204 });
      if (url.endsWith('/id/3')) return json({}, 500);
      throw new Error('ECONNRESET');
    }));
    const results = await new TournamentService(BASE_URL).getTournamentBatch([1, 2, 3, 4]);
    expect(results.map((r) => [r.data?.id ?? null, r.error === null, r.status])).toEqual([
      [1, true, 200],
      [null, true, 204],
      [null, false, 500],
      [null, false, 0],
    ]);
  });
});
