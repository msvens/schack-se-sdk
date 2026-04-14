/**
 * Unit tests for BaseApiService error-handling contract.
 *
 * All service classes extend BaseApiService and inherit its request() behavior.
 * These tests pin down the error response shape so a regression surfaces in
 * one place rather than silently breaking every service.
 *
 * Uses fetch mocking (vi.fn) — unlike the other service test files, which hit
 * the live API.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayerService } from '../../src/services/players';

const BASE_URL = 'https://example.test/api';

describe('BaseApiService error contract', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('success path', () => {
    it('returns { data, status: 200, message: "Success" } on 200 OK', async () => {
      const payload = { id: 1, firstName: 'Test' };
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(payload), { status: 200 })
      );

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(1);

      expect(response.status).toBe(200);
      expect(response.message).toBe('Success');
      expect(response.data).toEqual(payload);
      expect(response.error).toBeUndefined();
    });
  });

  describe('HTTP error responses', () => {
    it('preserves the real HTTP status on 404', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Player not found' }), { status: 404 })
      );

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(999999);

      expect(response.data).toBeUndefined();
      expect(response.status).toBe(404);
      expect(response.message).toBe('Error');
      expect(response.error).toBe('Player not found');
    });

    it('preserves the real HTTP status on 500', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 500, statusText: 'Internal Server Error' })
      );

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(1);

      expect(response.status).toBe(500);
      expect(response.message).toBe('Error');
      expect(response.error).toBe('Internal Server Error');
    });

    it('preserves 429 (rate limit) so callers can back off', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('', { status: 429, statusText: 'Too Many Requests' })
      );

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(1);

      expect(response.status).toBe(429);
    });

    it('extracts error message from body.message when available', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Custom server message' }), { status: 400 })
      );

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(1);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Custom server message');
    });

    it('falls back to statusText when body is not JSON', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('plain text error', { status: 503, statusText: 'Service Unavailable' })
      );

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(1);

      expect(response.status).toBe(503);
      expect(response.error).toBe('Service Unavailable');
    });
  });

  describe('network errors (status: 0)', () => {
    it('returns status: 0 when fetch rejects', async () => {
      fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(1);

      expect(response.data).toBeUndefined();
      expect(response.status).toBe(0);
      expect(response.message).toBe('Error');
      expect(response.error).toBe('ECONNREFUSED');
    });

    it('handles non-Error rejection with fallback message', async () => {
      fetchMock.mockRejectedValueOnce('string rejection');

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(1);

      expect(response.status).toBe(0);
      expect(response.error).toBe('Network error');
    });

    it('returns status: 0 when 2xx response body is malformed JSON', async () => {
      // Server returned 200 OK but the body isn't valid JSON — we have no
      // usable response, so this is treated like a network-level failure.
      fetchMock.mockResolvedValueOnce(
        new Response('not-json{{{', { status: 200 })
      );

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(1);

      expect(response.status).toBe(0);
      expect(response.message).toBe('Error');
      expect(response.error).toBeDefined();
    });
  });

  describe('URL construction', () => {
    it('calls fetch with the configured base URL', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 200 })
      );

      const service = new PlayerService(BASE_URL);
      await service.getPlayerInfo(12345);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl.startsWith(BASE_URL)).toBe(true);
      expect(calledUrl).toContain('12345');
    });

    it('sends JSON content-type header by default', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 200 })
      );

      const service = new PlayerService(BASE_URL);
      await service.getPlayerInfo(1);

      const init = fetchMock.mock.calls[0][1] as RequestInit;
      const headers = init.headers as Record<string, string>;
      expect(headers['Content-Type']).toBe('application/json');
    });
  });
});
