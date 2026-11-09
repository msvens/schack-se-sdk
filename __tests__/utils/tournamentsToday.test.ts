/**
 * Unit tests for getTournamentsToday, with a stubbed TournamentService.
 */

import { vi } from 'vitest';
import { getTournamentsToday } from '../../src/utils/tournamentsToday';
import type { TournamentService } from '../../src/services/tournaments';
import type { ApiResponse, TournamentDto } from '../../src/types';

const TODAY = '2026-11-08';

/**
 * A tournament with one group per entry in `groupRoundDates`, each with those
 * round dates. Groups span the tournament's range unless `groupRanges` says otherwise.
 */
function t(
  id: number,
  start: string,
  end: string,
  groupRoundDates: string[][] = [],
  groupRanges: [string, string][] = []
): TournamentDto {
  const groups = groupRoundDates.map((dates, i) => ({
    id: id * 10 + i,
    start: groupRanges[i]?.[0] ?? start,
    end: groupRanges[i]?.[1] ?? end,
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

  it('ignores a round dated today outside its group range, unless that range is broken', async () => {
    const { asService } = stubService({
      status: 200,
      data: [
        // One-day group in October with rounds spread over weeks: excluded.
        t(1, '2026-09-01', '2026-12-01', [['2026-10-17', '2026-10-24', '2026-10-31', TODAY]], [['2026-10-17', '2026-10-17']]),
        // Group range ends before it starts: falls back to the tournament range.
        t(2, '2026-09-01', '2027-02-24', [[TODAY]], [['2026-09-30', '2026-02-24']]),
        // Second group's range covers today: counts.
        t(3, '2026-09-01', '2026-12-01', [[TODAY], [TODAY]], [['2026-09-01', '2026-10-01'], ['2026-11-01', '2026-11-30']]),
      ],
    });

    const res = await getTournamentsToday({ service: asService });
    expect(res.data!.map(x => x.id)).toEqual([2, 3]);
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

  describe('groupsToday', () => {
    /** Ids of each returned tournament's groupsToday, with their round counts. */
    async function groupsTodayOf(data: TournamentDto[]) {
      const { asService } = stubService({ status: 200, data });
      const res = await getTournamentsToday({ service: asService });
      return Object.fromEntries(
        res.data!.map(x => [x.id, x.groupsToday.map(g => [g.group.id, g.rounds.length])])
      );
    }

    it('lists only the divisions of a league with a round today, with those rounds', async () => {
      const league = t(1, '2026-10-01', '2027-04-30', [
        ['2026-11-01', TODAY],
        ['2026-11-01', '2026-11-09'],
      ]);
      const { asService } = stubService({ status: 200, data: [league] });
      const res = await getTournamentsToday({ service: asService });

      expect(res.data![0].groupsToday.map(g => g.group.id)).toEqual([10]);
      expect(res.data![0].groupsToday[0].rounds).toEqual([{ roundNumber: 2, roundDate: TODAY }]);
    });

    it('lists only the groups playing today in an event split over two days', async () => {
      // Like Farsta SK JGP (7271): A/B on the 7th, C/D on the 8th.
      const jgp = t(
        2,
        '2026-11-07',
        TODAY,
        [['2026-11-07', '2026-11-07'], ['2026-11-07'], [TODAY, TODAY], [TODAY]],
        [['2026-11-07', '2026-11-07'], ['2026-11-07', '2026-11-07'], [TODAY, TODAY], [TODAY, TODAY]]
      );
      expect(await groupsTodayOf([jgp])).toEqual({ 2: [[22, 2], [23, 1]] });
    });

    it('falls back to the groups whose dates cover today when no round dates are set', async () => {
      const noDates = t(3, '2026-11-07', TODAY, [[], [], []], [['2026-11-07', '2026-11-07'], [TODAY, TODAY], ['2026-11-07', TODAY]]);
      expect(await groupsTodayOf([noDates])).toEqual({ 3: [[31, 0], [32, 0]] });
    });

    it('does not match a round dated today outside a one-day group range', async () => {
      // Tournament ends today, so it is returned; its group was on the 7th with rounds spread weekly by mistake.
      const spread = t(4, '2026-11-07', TODAY, [['2026-11-07', TODAY, '2026-11-14']], [['2026-11-07', '2026-11-07']]);
      expect(await groupsTodayOf([spread])).toEqual({ 4: [] });
    });

    it('matches a round today in a group whose range ends before it starts', async () => {
      const broken = t(5, '2026-09-01', '2027-02-24', [[TODAY]], [['2026-09-30', '2026-02-24']]);
      expect(await groupsTodayOf([broken])).toEqual({ 5: [[50, 1]] });
    });

    it('returns a tournament starting today with no matching group, with an empty list', async () => {
      const startsToday = t(6, TODAY, '2026-12-01', [['2026-11-15']], [['2026-11-15', '2026-12-01']]);
      expect(await groupsTodayOf([startsToday])).toEqual({ 6: [] });
    });

    it('finds groups nested in subClasses', async () => {
      const nested = {
        id: 7,
        name: 'T7',
        start: '2026-09-01',
        end: '2026-12-01',
        rootClasses: [
          {
            groups: [],
            subClasses: [
              {
                groups: [{ id: 71, start: '2026-09-01', end: '2026-12-01', tournamentRounds: [{ roundNumber: 1, roundDate: TODAY }] }],
                subClasses: [],
              },
            ],
          },
        ],
      } as unknown as TournamentDto;
      expect(await groupsTodayOf([nested])).toEqual({ 7: [[71, 1]] });
    });

    it('sets groupsToday on every returned tournament and leaves the input unchanged', async () => {
      const input = [
        t(8, TODAY, TODAY),
        t(9, '2026-09-01', '2026-12-01', [[TODAY]]),
        t(10, '2026-11-07', TODAY, [[]], [['2026-11-07', '2026-11-07']]),
      ];
      const { asService } = stubService({ status: 200, data: input });
      const res = await getTournamentsToday({ service: asService });

      expect(res.data!.map(x => x.id)).toEqual([8, 9, 10]);
      for (const x of res.data!) expect(Array.isArray(x.groupsToday)).toBe(true);
      expect(input.some(x => 'groupsToday' in x)).toBe(false);
    });
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
