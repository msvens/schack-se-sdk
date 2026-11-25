import {
  isGrandPrix,
  type RoundDto,
  type TournamentClassDto,
  type TournamentClassGroupDto,
  type TournamentDto,
} from '../types';

/** A tournament longer than this many days gets start/end markers instead of filling its range. */
export const LONG_TOURNAMENT_DAYS = 7;

/** A group played on a day. */
export interface GroupToday {
  group: TournamentClassGroupDto;
  /** The group's rounds dated that day. Empty means the group matched on its dates alone. */
  rounds: RoundDto[];
}

/** One day of a tournament, from {@link getTournamentPlayDays}. */
export interface TournamentPlayDay {
  /** `YYYY-MM-DD`. */
  date: string;
  /**
   * The groups played that day. For a marker, the groups whose range covers it, with
   * no rounds; always empty for a Grand Prix series.
   */
  groups: GroupToday[];
  /**
   * Set when the day is only the tournament's start or end, not a day of play: the
   * start or end of a long tournament with no round that day, or of a Grand Prix series.
   */
  marker?: 'starts' | 'ends';
}

interface DayRange {
  start: string;
  end: string;
}

const day = (d: string | null | undefined) => d?.slice(0, 10);

function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function daysIn(range: DayRange): string[] {
  const out: string[] = [];
  for (let d = range.start; d <= range.end; d = addDays(d, 1)) out.push(d);
  return out;
}

const length = (range: DayRange) => daysIn(range).length;

const inside = (date: string, range: DayRange) => range.start <= date && date <= range.end;

function allGroups(classes: TournamentClassDto[] | undefined): TournamentClassGroupDto[] {
  return (classes ?? []).flatMap(c => [...(c.groups ?? []), ...allGroups(c.subClasses)]);
}

/**
 * The group's range clipped to the tournament's, or the tournament's range when
 * the group's is missing, reversed or entirely outside it.
 */
function groupRange(g: TournamentClassGroupDto, tournament: DayRange): DayRange {
  const start = day(g.start);
  const end = day(g.end);
  if (!start || !end || start > end) return tournament;
  const clipped = {
    start: start > tournament.start ? start : tournament.start,
    end: end < tournament.end ? end : tournament.end,
  };
  return clipped.start <= clipped.end ? clipped : tournament;
}

/**
 * The days a tournament is played, with the groups played on each, plus start and
 * end markers. Pure: no date input, no service call. {@link getTournamentsToday}
 * is the coming list filtered by this function for today, so the two always agree.
 *
 * The tournament's `start`–`end` range is the hard limit: nothing outside it is
 * returned, and a tournament with a missing or reversed range returns no days. A
 * group's own range narrows that, unless it is missing, reversed or outside the
 * tournament's range, when the tournament range applies.
 *
 * Play days:
 * - Each day a group has a round dated within its range. Rounds outside it are
 *   ignored (often a placeholder schedule from when the tournament was created,
 *   or a typo).
 * - Each day of a group with no usable round dates, when its range is at most
 *   {@link LONG_TOURNAMENT_DAYS} days.
 * - Every day of a tournament of at most {@link LONG_TOURNAMENT_DAYS} days, since
 *   organizers often date only some rounds of a weekend event. A day with no
 *   dated round lists the groups whose range covers it.
 *
 * A day lists the groups with a round dated that day, plus any group without
 * usable round dates whose (short) range covers it; a league thus lists only the
 * divisions playing that day.
 *
 * Markers: the start and end days of a tournament longer than
 * {@link LONG_TOURNAMENT_DAYS} days that aren't play days get a `starts` or `ends`
 * marker, so a season-long league shows when it begins and finishes even if its
 * first or last round is on another day. A Grand Prix series (type 7) is never
 * played (its round dates don't reflect play; the games are in the stage
 * tournaments) and only gets markers. A one-day series gets `starts` only.
 *
 * Limits: round and group dates are set by organizers, so wrong dates inside both
 * ranges are reported as played, and a group with a valid but wrong range hides
 * its real round days.
 *
 * @returns The days in date order.
 *
 * @example
 * for (const { date, groups, marker } of getTournamentPlayDays(tournament)) { ... }
 */
export function getTournamentPlayDays(tournament: TournamentDto): TournamentPlayDay[] {
  const start = day(tournament.start);
  const end = day(tournament.end);
  if (!start || !end || start > end) return [];
  const range = { start, end };
  const groups = allGroups(tournament.rootClasses);
  const ranges = new Map(groups.map(g => [g, groupRange(g, range)]));

  const covering = (date: string): GroupToday[] =>
    groups.filter(g => inside(date, ranges.get(g)!)).map(group => ({ group, rounds: [] }));

  const marker = (date: string, kind: 'starts' | 'ends'): TournamentPlayDay => ({
    date,
    groups: covering(date),
    marker: kind,
  });

  if (isGrandPrix(tournament.type)) {
    // Its groups mirror the stages, which are listed as tournaments of their own.
    const gp = (date: string, kind: 'starts' | 'ends') => ({ date, groups: [], marker: kind });
    return start === end ? [gp(start, 'starts')] : [gp(start, 'starts'), gp(end, 'ends')];
  }

  const played = new Map<string, GroupToday[]>();
  const add = (date: string, entry: GroupToday) => {
    const list = played.get(date) ?? [];
    list.push(entry);
    played.set(date, list);
  };

  for (const group of groups) {
    const own = ranges.get(group)!;
    const rounds = (group.tournamentRounds ?? []).filter(r => {
      const d = day(r.roundDate);
      return !!d && inside(d, own);
    });
    if (rounds.length > 0) {
      const byDay = new Map<string, RoundDto[]>();
      for (const r of rounds) byDay.set(day(r.roundDate)!, [...(byDay.get(day(r.roundDate)!) ?? []), r]);
      for (const [date, dayRounds] of byDay) add(date, { group, rounds: dayRounds });
    } else if (length(own) <= LONG_TOURNAMENT_DAYS) {
      for (const date of daysIn(own)) add(date, { group, rounds: [] });
    }
  }

  const long = length(range) > LONG_TOURNAMENT_DAYS;
  if (!long) {
    for (const date of daysIn(range)) if (!played.has(date)) played.set(date, covering(date));
  }

  const days: TournamentPlayDay[] = [...played].map(([date, list]) => ({
    date,
    // Keep the tournament's group order.
    groups: [...list].sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group)),
  }));
  if (long) {
    if (!played.has(start)) days.push(marker(start, 'starts'));
    if (!played.has(end)) days.push(marker(end, 'ends'));
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
}
