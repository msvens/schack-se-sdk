import { TournamentService } from '../services/tournaments';
import type {
  ApiResponse,
  RoundDto,
  TournamentClassDto,
  TournamentClassGroupDto,
  TournamentDto,
} from '../types';

export interface TournamentsTodayOptions {
  /** Limit to one district (and its clubs), as on the underlying endpoints. */
  districtId?: number;
  /** The service to call, e.g. one constructed with a proxy base URL. Defaults to `new TournamentService()`. */
  service?: TournamentService;
}

/** A group played today, from {@link getTournamentsToday}. */
export interface GroupToday {
  group: TournamentClassGroupDto;
  /** The group's rounds dated today. Empty means the group matched on its dates alone. */
  rounds: RoundDto[];
}

/** A tournament from {@link getTournamentsToday}, with the groups played today. */
export type TournamentToday = TournamentDto & { groupsToday: GroupToday[] };

/** Local calendar date as `YYYY-MM-DD`. */
function toLocalIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function allGroups(classes: TournamentClassDto[] | undefined): TournamentClassGroupDto[] {
  return (classes ?? []).flatMap(c => [...(c.groups ?? []), ...allGroups(c.subClasses)]);
}

const day = (d: string | null | undefined) => d?.slice(0, 10);

/** True when the group's range covers `today`, or the range is broken (end before start). */
function groupRangeAllows(g: TournamentClassGroupDto, today: string): boolean {
  const start = day(g.start);
  const end = day(g.end);
  if (!start || !end || start > end) return true;
  return start <= today && today <= end;
}

/**
 * The groups of `t` played today, for a tournament whose range already covers today:
 * 1. groups with a round dated today, within the group's range (a broken range
 *    defers to the tournament range); else
 * 2. groups whose own valid range covers today, with no rounds (short events often
 *    have no round dates filled in); else
 * 3. none.
 * Step 2 only applies when step 1 finds nothing, so a league lists only the
 * divisions with a round today.
 */
function groupsPlayedToday(t: TournamentDto, today: string): GroupToday[] {
  const groups = allGroups(t.rootClasses);

  const withRounds = groups
    .filter(g => groupRangeAllows(g, today))
    .map(group => ({
      group,
      rounds: (group.tournamentRounds ?? []).filter(r => day(r.roundDate) === today),
    }))
    .filter(g => g.rounds.length > 0);
  if (withRounds.length > 0) return withRounds;

  return groups
    .filter(g => {
      const start = day(g.start);
      const end = day(g.end);
      return !!start && !!end && start <= today && today <= end;
    })
    .map(group => ({ group, rounds: [] }));
}

/**
 * Tournaments played today (local date).
 *
 * Today must be within the tournament's `start`–`end` range. Then it counts if
 * it starts or ends today, or if a group has a round dated today and today is
 * also within that group's range (a group whose range ends before it starts is
 * checked against the tournament range only). Short events count by their dates
 * alone, since their round dates aren't always filled in for every day; a
 * season-long KM counts only on days it has a round.
 *
 * Candidates come from the SSF coming list (`searchComingTournaments`), which
 * holds every tournament ending today or later, so the result is a filtered
 * subset of it.
 *
 * Limits:
 * - Round and group dates are set by organizers. Round dates outside the
 *   tournament's or the group's range are ignored, but wrong dates inside both
 *   are reported as played, and a group with a valid but wrong range hides its
 *   real round days.
 * - Grand Prix series (type 7) are returned like any other tournament, but they
 *   have no results and their round dates don't reflect play; the real games are
 *   in the stage tournaments. Filter with `isGrandPrix` if they shouldn't show.
 *
 * Each tournament carries `groupsToday`: the groups with a round dated today (with
 * those rounds); if none, the groups whose own range covers today (no rounds); if
 * none either, an empty list. A league thus lists only the divisions playing today.
 *
 * The result keeps the coming list's order. If the search fails, its error is
 * returned.
 *
 * @example
 * const playing = await getTournamentsToday();
 * // One district, behind a proxy:
 * const local = await getTournamentsToday({ districtId: 9, service: new TournamentService('/api/chess/v1') });
 */
export async function getTournamentsToday(
  options: TournamentsTodayOptions = {}
): Promise<ApiResponse<TournamentToday[]>> {
  const { districtId } = options;
  const service = options.service ?? new TournamentService();

  const today = toLocalIsoDate(new Date());

  const coming = await service.searchComingTournaments(districtId);
  if (coming.status !== 200 || !coming.data) {
    return { status: coming.status, error: coming.error ?? 'Failed to fetch tournaments' };
  }

  const data: TournamentToday[] = [];
  for (const t of coming.data) {
    const start = day(t.start);
    const end = day(t.end);
    // Only within the tournament's own range: some round dates are a placeholder
    // schedule that starts when the tournament was created.
    if (!start || !end || start > today || end < today) continue;
    const groupsToday = groupsPlayedToday(t, today);
    const playedToday =
      start === today || end === today || groupsToday.some(g => g.rounds.length > 0);
    if (!playedToday) continue;
    data.push({ ...t, groupsToday });
  }

  return { status: 200, data };
}
