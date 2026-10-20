/**
 * Unit tests for TournamentService.searchGroups word handling: what reaches the
 * URL path, and which words never hit the network.
 *
 * Uses fetch mocking (vi.fn); the live behaviour is covered in tournaments.test.ts.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TournamentService } from '../../src/services/tournaments';

const BASE_URL = 'https://example.test/api';
const SEARCH = `${BASE_URL}/tournament/group/search/`;

describe('searchGroups word handling', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let service: TournamentService;

  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation(async () => new Response('[]', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    service = new TournamentService(BASE_URL);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const sentUrl = () => fetchMock.mock.calls[0][0] as string;

  it.each([
    ['Allsvenskan', 'Allsvenskan'],
    ['  Allsvenskan 2026  ', 'Allsvenskan%202026'],
    ['Allsvenskan 2026/27', 'Allsvenskan%202026_27'],
    ['Stockholmsserien 2025/2026', 'Stockholmsserien%202025_2026'],
    ['a\\b;c', 'a_b_c'],
    ['/27', '_27'],
    ['Göteborg', 'G%C3%B6teborg'],
    ['%svenskan', '%25svenskan'],
    ['Rilton Cup 2024.', 'Rilton%20Cup%202024.'],
  ])('%j is sent as %j', async (word, encoded) => {
    await service.searchGroups(word);
    expect(sentUrl()).toBe(SEARCH + encoded);
  });

  it.each(['', '   ', '.', '..', ' ... '])('%j returns an empty list without a request', async (word) => {
    const response = await service.searchGroups(word);
    expect(response).toEqual({ data: [], status: 200, message: 'Success' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
