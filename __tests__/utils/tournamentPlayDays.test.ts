/**
 * Unit tests for getTournamentPlayDays. Fixtures are modelled on real tournaments
 * from the coming list (Nov 2026), trimmed, so the tests don't depend on live data.
 */

import { getTournamentPlayDays } from '../../src/utils/tournamentPlayDays';
import type { TournamentDto } from '../../src/types';

interface GroupSpec {
  id: number;
  range?: [string, string];
  rounds?: string[];
}

function t(id: number, start: string, end: string, groups: GroupSpec[] = [], type = 0): TournamentDto {
  return {
    id,
    name: `T${id}`,
    type,
    start,
    end,
    rootClasses: [
      {
        groups: groups.map(g => ({
          id: g.id,
          start: g.range?.[0] ?? start,
          end: g.range?.[1] ?? end,
          tournamentRounds: (g.rounds ?? []).map((roundDate, n) => ({ roundNumber: n + 1, roundDate })),
        })),
        subClasses: [],
      },
    ],
  } as unknown as TournamentDto;
}

/** Each day as `date[:marker] groupId/rounds ...`, for compact assertions. */
function summary(tournament: TournamentDto): string[] {
  return getTournamentPlayDays(tournament).map(d =>
    [`${d.date}${d.marker ? `:${d.marker}` : ''}`, ...d.groups.map(g => `${g.group.id}/${g.rounds.length}`)].join(' ')
  );
}

describe('getTournamentPlayDays', () => {
  it('ignores rounds outside the tournament range (Juniorallsvenskan 7045)', () => {
    // Div II's range and rounds run a day past the tournament's end.
    const jas = t(7045, '2026-11-27', '2026-11-29', [
      { id: 1, rounds: ['2026-11-28', '2026-11-27', '2026-11-28', '2026-11-29', '2026-11-29'] },
      { id: 2, range: ['2026-11-28', '2026-11-30'], rounds: ['2026-11-29', '2026-11-29', '2026-11-30'] },
    ]);
    expect(summary(jas)).toEqual(['2026-11-27 1/1', '2026-11-28 1/2', '2026-11-29 1/2 2/2']);
  });

  it('places a weekly league on its round evenings only (Lag-DM 7126)', () => {
    const lagDm = t(7126, '2026-09-14', '2027-02-15', [
      { id: 1, range: ['2026-09-14', '2027-01-25'], rounds: ['2026-09-14', '2026-10-12', '2027-01-25'] },
      { id: 2, range: ['2026-10-05', '2027-02-15'], rounds: ['2026-10-05', '2026-11-02', '2027-02-15'] },
      { id: 3, range: ['2026-10-05', '2027-02-15'], rounds: ['2026-10-05', '2027-02-15'] },
    ]);
    expect(summary(lagDm)).toEqual([
      '2026-09-14 1/1',
      '2026-10-05 2/1 3/1',
      '2026-10-12 1/1',
      '2026-11-02 2/1',
      '2027-01-25 1/1',
      '2027-02-15 2/1 3/1',
    ]);
  });

  it('marks the end of a long tournament whose last round is earlier (Hästlampan 7457)', () => {
    const rounds = ['2026-11-19', '2026-11-20', '2026-11-21', '2026-12-08'];
    expect(summary(t(7457, '2026-11-19', '2026-12-10', [{ id: 1, rounds }]))).toEqual([
      '2026-11-19 1/1',
      '2026-11-20 1/1',
      '2026-11-21 1/1',
      '2026-12-08 1/1',
      '2026-12-10:ends 1/0',
    ]);
  });

  it('marks the start of a long tournament whose first round is later', () => {
    expect(summary(t(1, '2026-09-01', '2026-12-01', [{ id: 1, rounds: ['2026-09-08'] }]))).toEqual([
      '2026-09-01:starts 1/0',
      '2026-09-08 1/1',
      '2026-12-01:ends 1/0',
    ]);
  });

  it('gives a long tournament without round dates only markers', () => {
    expect(summary(t(1, '2026-09-01', '2026-12-15', [{ id: 1 }]))).toEqual([
      '2026-09-01:starts 1/0',
      '2026-12-15:ends 1/0',
    ]);
  });

  it('gives a Grand Prix series only markers, with no groups', () => {
    const series = t(
      6972,
      '2026-08-14',
      '2027-05-08',
      [
        { id: 1, rounds: ['2026-08-14', '2026-09-21'] },
        { id: 2, range: ['2026-10-30', '2026-11-01'], rounds: ['2026-10-30', '2026-11-01'] },
      ],
      7
    );
    expect(summary(series)).toEqual(['2026-08-14:starts', '2027-05-08:ends']);
    expect(summary(t(2, '2026-11-01', '2026-11-01', [], 7))).toEqual(['2026-11-01:starts']);
  });

  it('fills every day of a short event without round dates', () => {
    expect(summary(t(1, '2026-11-14', '2026-11-16', [{ id: 1 }]))).toEqual([
      '2026-11-14 1/0',
      '2026-11-15 1/0',
      '2026-11-16 1/0',
    ]);
    expect(summary(t(2, '2026-11-14', '2026-11-15'))).toEqual(['2026-11-14', '2026-11-15']);
  });

  it('fills the undated days of a partly dated short event (Malmö Open 6967)', () => {
    const malmo = t(6967, '2026-12-11', '2026-12-13', [
      { id: 1, rounds: ['2026-12-11', '2026-12-11', '2026-12-12'] },
      { id: 2, rounds: ['2026-12-11', '2026-12-12'] },
    ]);
    expect(summary(malmo)).toEqual(['2026-12-11 1/2 2/1', '2026-12-12 1/1 2/1', '2026-12-13 1/0 2/0']);
  });

  it('plays a short undated group inside a long tournament on its own days', () => {
    const festival = t(1, '2026-07-01', '2026-07-20', [
      { id: 1, rounds: ['2026-07-01', '2026-07-20'] },
      { id: 2, range: ['2026-07-11', '2026-07-12'] },
    ]);
    expect(summary(festival)).toEqual(['2026-07-01 1/1', '2026-07-11 2/0', '2026-07-12 2/0', '2026-07-20 1/1']);
  });

  it('uses the tournament range for a group range that is reversed or outside it', () => {
    const reversed = t(1, '2026-09-01', '2027-02-24', [{ id: 1, range: ['2026-09-30', '2026-02-24'], rounds: ['2026-11-08'] }]);
    expect(summary(reversed)).toContain('2026-11-08 1/1');

    // Like Haga skolan GP1 (7343): group and rounds a week before the tournament's only day.
    const outside = t(7343, '2026-11-29', '2026-11-29', [{ id: 1, range: ['2026-11-22', '2026-11-22'], rounds: ['2026-11-22'] }]);
    expect(summary(outside)).toEqual(['2026-11-29 1/0']);
  });

  it('ignores a round outside its valid group range', () => {
    const spread = t(1, '2026-11-07', '2026-11-08', [
      { id: 1, range: ['2026-11-07', '2026-11-07'], rounds: ['2026-11-07', '2026-11-08', '2026-11-14'] },
    ]);
    expect(summary(spread)).toEqual(['2026-11-07 1/1', '2026-11-08']);
  });

  it('returns nothing for a missing or reversed tournament range', () => {
    expect(getTournamentPlayDays(t(1, '2026-11-09', '2026-11-08', [{ id: 1, rounds: ['2026-11-08'] }]))).toEqual([]);
    expect(getTournamentPlayDays({ id: 2, name: 'T2' } as unknown as TournamentDto)).toEqual([]);
  });
});
