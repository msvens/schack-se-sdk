/**
 * Live tests for MfideService against mfide (https://mfide.mellowtech.org/api).
 *
 * Needs a key, read from the environment (a GitHub Actions secret in CI):
 * - MFIDE_API_KEY: the key, sent as X-API-Key
 * - MFIDE_API_URL: optional other base URL, e.g. a local proxy that adds the
 *   key itself (http://localhost:8061/api/fide), in which case no key is needed
 *
 * Skipped without a key (forks, local runs) or when the host can't be reached;
 * a host that answers with the wrong shape still fails. Each test checks the
 * exact key set, so a new or dropped field shows up here. Keep the suite
 * light: a handful of calls, no loops.
 */

import { MfideService, MFIDE_API_URL } from '../src';
import { TEST_FIDE_CARLSEN_ID, TEST_FIDE_CRAMLING_ID } from './test-data';

const API_KEY = process.env.MFIDE_API_KEY;
const mfide = new MfideService(process.env.MFIDE_API_URL ?? MFIDE_API_URL, API_KEY);

async function unreachable(): Promise<boolean> {
  if (!API_KEY && !process.env.MFIDE_API_URL) {
    process.stderr.write('[integration] MFIDE_API_KEY not set; skipping mfide suite.\n');
    return true;
  }
  const res = await mfide.getHealth({ timeoutMs: 2500 });
  const down = res.status === 0 || res.status === 408;
  if (down) process.stderr.write(`[integration] mfide unreachable (status ${res.status}); skipping.\n`);
  return down;
}
const MFIDE_UNREACHABLE = await unreachable();

const PLAYER_KEYS = [
  'birthYear', 'blitz', 'country', 'fideId', 'foaTitle', 'name', 'otherTitles',
  'rapid', 'sex', 'standard', 'title', 'womenTitle',
];
const RATING_KEYS = ['active', 'games', 'k', 'rating'];
const HISTORY_KEYS = ['blitz', 'period', 'rapid', 'standard'];

const keys = (o: object) => Object.keys(o).sort();

describe.skipIf(MFIDE_UNREACHABLE)('MfideService (live)', () => {
  it('getHealth reports the current ratings month', async () => {
    const res = await mfide.getHealth();
    expect(res.status).toBe(200);
    expect(res.data?.apiVersion).toBeTruthy();
    expect(res.data?.ratingsMonth).toMatch(/^\d{4}-\d{2}$/);
  });

  // A proxy that adds the key itself may not expose /key
  it.skipIf(!API_KEY)('getKey accepts the key in use', async () => {
    const res = await mfide.getKey();
    expect(res.status).toBe(200);
    expect(res.data?.ratePerMin).toBeGreaterThan(0);
  });

  it('getPlayer returns the exact player shape', async () => {
    const res = await mfide.getPlayer(TEST_FIDE_CARLSEN_ID);
    expect(res.status).toBe(200);
    const p = res.data!;
    expect(keys(p)).toEqual(PLAYER_KEYS);
    expect(p.fideId).toBe(TEST_FIDE_CARLSEN_ID);
    expect(p.name).toBe('Carlsen, Magnus');
    expect(keys(p.standard!)).toEqual(RATING_KEYS);
  });

  it('getPlayer is a 404 for an unknown id', async () => {
    const res = await mfide.getPlayer(1);
    expect(res.status).toBe(404);
    expect(res.data).toBeUndefined();
  });

  it('getPlayerHistory is oldest first', async () => {
    const res = await mfide.getPlayerHistory(TEST_FIDE_CRAMLING_ID);
    expect(res.status).toBe(200);
    const h = res.data!;
    expect(h.length).toBeGreaterThan(1);
    expect(keys(h[0])).toEqual(HISTORY_KEYS);
    expect(h[0].period < h[h.length - 1].period).toBe(true);
  });

  it('searchPlayers finds by name and by id', async () => {
    const byName = await mfide.searchPlayers('carlsen magnus');
    expect(byName.data?.[0].fideId).toBe(TEST_FIDE_CARLSEN_ID);
    const byId = await mfide.searchPlayers(String(TEST_FIDE_CRAMLING_ID));
    expect(byId.data?.map((p) => p.fideId)).toEqual([TEST_FIDE_CRAMLING_ID]);
  });

  it('searchPlayers reports a bad parameter as 400', async () => {
    const res = await mfide.searchPlayers('a');
    expect(res.status).toBe(400);
  });

  it('getTop ranks from 1 with the player shape plus rank', async () => {
    const res = await mfide.getTop({ country: 'SWE', limit: 5 });
    expect(res.status).toBe(200);
    const top = res.data!;
    expect(top.map((p) => p.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(keys(top[0])).toEqual([...PLAYER_KEYS, 'rank'].sort());
    expect(top.every((p) => p.country === 'SWE')).toBe(true);
  });
});
