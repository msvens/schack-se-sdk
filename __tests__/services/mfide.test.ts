/**
 * Unit tests for MfideService: unwrapping mfide's `{ data }` / `{ error }`
 * envelope, the API-key header and query strings. Uses fetch mocking; the
 * live checks are in mfide.integration.test.ts.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MfideService } from '../../src';

const BASE_URL = 'https://mfide.test/api';
const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), { status, headers });

describe('MfideService', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('unwraps { data }', async () => {
    const player = { fideId: 1503014, name: 'Carlsen, Magnus' };
    fetchMock.mockResolvedValueOnce(json({ data: player }));

    const response = await new MfideService(BASE_URL).getPlayer(1503014);

    expect(response).toEqual({ data: player, status: 200, message: 'Success' });
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/v1/players/1503014`);
  });

  it('maps an { error } in a 200 body to its code', async () => {
    fetchMock.mockResolvedValueOnce(json({ error: { code: 404, message: 'player not found' } }));

    const response = await new MfideService(BASE_URL).getPlayer(1);

    expect(response).toEqual({ error: 'player not found', status: 404, message: 'Error' });
  });

  it('reports a real 401/429 with mfide\'s message', async () => {
    fetchMock.mockResolvedValueOnce(
      json({ error: { code: 401, message: 'missing or invalid API key' } }, 401)
    );

    const response = await new MfideService(BASE_URL).getKey();

    expect(response.status).toBe(401);
    expect(response.error).toBe('missing or invalid API key');
    expect(response.data).toBeUndefined();
  });

  it("keeps the HTTP status of a proxy's non-JSON error page", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('<html><body>429 Too Many Requests</body></html>', {
        status: 429,
        statusText: 'Too Many Requests',
      })
    );

    const response = await new MfideService(BASE_URL).searchPlayers('carlsen');

    expect(response).toEqual({ error: 'Too Many Requests', status: 429, message: 'Error' });
  });

  it('passes transport failures through', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));

    const response = await new MfideService(BASE_URL).getHealth();

    expect(response).toEqual({ error: 'fetch failed', status: 0, message: 'Error' });
  });

  it('sends X-API-Key only when given', async () => {
    fetchMock.mockImplementation(async () => json({ data: {} }));

    await new MfideService(BASE_URL, 'mfide_secret').getKey();
    await new MfideService(BASE_URL).getKey();

    const headers = fetchMock.mock.calls.map(([, init]) => init.headers as Record<string, string>);
    expect(headers[0]['X-API-Key']).toBe('mfide_secret');
    expect(headers[1]).not.toHaveProperty('X-API-Key');
  });

  it('builds query strings from the params given', async () => {
    fetchMock.mockImplementation(async () => json({ data: [] }));
    const mfide = new MfideService(BASE_URL);

    await mfide.searchPlayers('Stål', { match: 'word', country: 'SWE', limit: 5 });
    await mfide.getTop();
    await mfide.getTop({ type: 'blitz', list: 'women', country: 'SWE', limit: 10 });
    await mfide.getPlayerHistory(1503014, 'rapid');

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `${BASE_URL}/v1/players/search?q=St%C3%A5l&match=word&country=SWE&limit=5`,
      `${BASE_URL}/v1/top`,
      `${BASE_URL}/v1/top?type=blitz&list=women&country=SWE&limit=10`,
      `${BASE_URL}/v1/players/1503014/history?type=rapid`,
    ]);
  });
});
