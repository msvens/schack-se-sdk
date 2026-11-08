/**
 * Unit tests for getTournamentsToday, with a stubbed TournamentService.
 */

import { vi } from 'vitest';
import { getTournamentsToday } from '../../src/utils/tournamentsToday';
import type { TournamentService } from '../../src/services/tournaments';
import type { ApiResponse, TournamentDto } from '../../src/types';

const TODAY = '2026-11-08';

/** A tournament with one group per entry in `groupRoundDates`, each with those round dates. */
function t(id: number, start: string, end: string, groupRoundDates: string[][] = []): TournamentDto {
  const groups = groupRoundDates.map((dates, i) => ({
    id: id * 10 + i,
    tournamentRounds: dates.map((roundDate, n) => ({ roundNumber: n + 1, roundDate })),
  }));
  return { id, name: `T${id}`, start, end, rootClasses: [{ groups, subClasses: [] }] } as unknown as TournamentDto;
}

function stubService(
  coming: ApiResponse<TournamentDto[]>,
  updated: ApiResponse<TournamentDto[]> = { status: 200, data: [] }
) {
  const service = {
    searchComingTournaments: vi.fn().mockResolvedValue(coming),
    searchUpdatedTournaments: vi.fn().mockResolvedValue(updated),
  };
  return { service, asService: service as unknown as TournamentService };
}

describe('getTournamentsToday', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 8, 10, 0, 0)); // 8 Nov 2026, local time
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns tournaments starting, ending or with a round today, deduped', async () => {
    const { service, asService } = stubService(
      {
        status: 200,
        data: [
          t(1, '2026-09-01', '2026-12-01', [['2026-11-05', '2026-11-19']]), // long, no round today: excluded
          t(2, '2026-10-01', '2027-04-30', [['2026-11-07'], ['2026-11-07', TODAY]]), // round today in 2nd group
          t(3, TODAY, '2026-11-09'), // starts today, no round dates
          t(4, '2026-11-21', '2026-11-21', [[TODAY, '2026-11-10']]), // placeholder round dates before the range: excluded
          t(5, '2026-11-20', '2026-11-22'), // not started: excluded
        ],
      },
      {
        status: 200,
        data: [
          t(6, '2026-11-07', TODAY, [['2026-11-07']]), // ends today, no round dated today
          t(7, TODAY, TODAY), // one-day event
          t(6, '2026-11-07', TODAY, [['2026-11-07']]), // the updated list repeats tournaments
          t(8, '2026-11-01', '2026-11-07', [['2026-11-07']]), // ended yesterday: excluded
          t(2, '2026-10-01', '2027-04-30', [[TODAY]]), // also in coming
        ],
      }
    );

    const res = await getTournamentsToday({ service: asService, districtId: 9 });

    expect(res.status).toBe(200);
    expect(res.data!.map(x => x.id)).toEqual([2, 3, 6, 7]);
    expect(service.searchComingTournaments).toHaveBeenCalledWith(9);
    expect(service.searchUpdatedTournaments).toHaveBeenCalledWith(
      '2026-11-05T00:00:00',
      '2026-11-08T23:59:59',
      9
    );
  });

  it('finds rounds in nested sub-classes', async () => {
    const nested = {
      id: 9,
      name: 'T9',
      start: '2026-09-01',
      end: '2026-12-01',
      rootClasses: [{ groups: [], subClasses: [{ groups: [{ id: 91, tournamentRounds: [{ roundNumber: 1, roundDate: TODAY }] }], subClasses: [] }] }],
    } as unknown as TournamentDto;
    const { asService } = stubService({ status: 200, data: [nested] });

    const res = await getTournamentsToday({ service: asService });
    expect(res.data!.map(x => x.id)).toEqual([9]);
  });

  it('returns an error rather than a partial list when either search fails', async () => {
    const comingDown = stubService({ status: 500, error: 'boom' });
    expect(await getTournamentsToday({ service: comingDown.asService })).toEqual({ status: 500, error: 'boom' });

    const updatedDown = stubService({ status: 200, data: [] }, { status: 408, error: 'Request timed out after 10000ms' });
    const res = await getTournamentsToday({ service: updatedDown.asService });
    expect(res.status).toBe(408);
    expect(res.data).toBeUndefined();
  });
});
