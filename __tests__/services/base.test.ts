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
    it('converts 404 into error response with status 500', async () => {
      // Note: BaseApiService collapses all HTTP errors to status 500 in the
      // response — the original status is embedded in the error message.
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'not found' }), { status: 404 })
      );

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(999999);

      expect(response.data).toBeUndefined();
      expect(response.status).toBe(500);
      expect(response.message).toBe('Error');
      expect(response.error).toContain('404');
    });

    it('converts 500 into error response', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 500 })
      );

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(1);

      expect(response.status).toBe(500);
      expect(response.error).toContain('500');
      expect(response.message).toBe('Error');
    });
  });

  describe('network errors', () => {
    it('handles fetch rejection (network failure)', async () => {
      fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(1);

      expect(response.data).toBeUndefined();
      expect(response.status).toBe(500);
      expect(response.message).toBe('Error');
      expect(response.error).toBe('ECONNREFUSED');
    });

    it('handles non-Error rejection with fallback message', async () => {
      fetchMock.mockRejectedValueOnce('string rejection');

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(1);

      expect(response.status).toBe(500);
      expect(response.error).toBe('Unknown error occurred');
    });

    it('handles malformed JSON in response body', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('not-json{{{', { status: 200 })
      );

      const service = new PlayerService(BASE_URL);
      const response = await service.getPlayerInfo(1);

      expect(response.status).toBe(500);
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
