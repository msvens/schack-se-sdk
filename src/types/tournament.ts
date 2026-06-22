/**
 * Tournament-related types for the Swedish Chess Federation API
 */

import { PointSystem } from '../utils/gameResults';

/**
 * Tournament type constants — values of `TournamentDto.type`.
 *
 * Note on `SCHOOL_SM` (5): empirically this is used for *individual* school
 * championships (e.g. "Skol-SM 2023", tournament 3933, has type=5 with
 * `teamtournamentPlayerListType=-1`). Real team Skol-SM events are configured
 * as `ALLSVENSKAN` (2) with `teamtournamentPlayerListType=TEAM_TEAMS` (e.g.
 * "Skollags-SM 2026", tournament 6649). Do not rely on `SCHOOL_SM` alone as a
 * "team tournament" signal — it isn't one.
 *
 * Note on `SCHACKFYRAN` (9): individual lottning but team-aggregated results.
 * The federation deliberately hides individual standings publicly because the
 * participants are typically children who aren't tournament-registered. Treat
 * the individual results table as private and prefer linking to schack.se
 * when displaying Schackfyran tournaments. See {@link isSchackfyran}.
 */
export const TournamentType = {
  ALLSVENSKAN: 2,
  INDIVIDUAL: 3,
  SM_TREE: 4,
  SCHOOL_SM: 5,
  SVENSKA_CUPEN: 6,
  GRAND_PRIX: 7,
  YES2CHESS: 8,
  SCHACKFYRAN: 9,
} as const;

/**
 * Tournament state constants
 */
export const TournamentState = {
  REGISTRATION: 1,
  STARTED: 2,
  FINISHED: 3,
} as const;

/**
 * Team tournament player list type — describes how players are tied to teams
 * in a team tournament. Used as the value of
 * {@link TournamentDto.teamtournamentPlayerListType}.
 *
 * - `REGISTRATION_TEAMS` (1): Players are registered to the club. The team
 *   roster is the club's registered players (standard club team format).
 * - `RATINGLIST_TEAMS` (2): The team is drawn from the club's rating list.
 * - `TEAM_TEAMS` (3): "Loosely-coupled" teams that are not bound to a single
 *   club — the team is its own entity (e.g. real Skol-SM events, ad-hoc team
 *   competitions). For tournaments of this type, the `club` field on
 *   {@link TeamTournamentEndResultDto} may be `null`. Team names are not yet
 *   exposed in the public REST API — standings rows carry meaningful
 *   `contenderId` + `teamNumber` but lack a human-readable label until
 *   upstream catches up. App-side stopgap: link to
 *   `https://resultat.schack.se/ShowTournamentServlet?id={groupId}`.
 *   Use {@link isLooseTeamTournament} to detect this case.
 *
 * For pure individual tournaments the field on TournamentDto is `-1`.
 */
export const TeamTournamentPlayerListType = {
  REGISTRATION_TEAMS: 1,
  RATINGLIST_TEAMS: 2,
  TEAM_TEAMS: 3,
} as const;

/**
 * Pairing system constants — values of
 * {@link TournamentClassGroupDto.pairingSystemMember}.
 *
 * - `BERGER` (1): Round-robin (team & individual OTB).
 * - `MONRAD` (2): Swiss-style (S4 & individual OTB).
 * - `NORDIC` (3): Less common individual OTB system.
 * - `FIDE_SWISS` (4): The dominant individual OTB system.
 * - `ARENA` (5): Online tournaments. Uses high `nrofrounds` (300+) internally
 *   as part of continuous-play handling — that count is an implementation
 *   detail, not a real round count to display.
 */
export const PairingSystem = {
  BERGER: 1,
  MONRAD: 2,
  NORDIC: 3,
  FIDE_SWISS: 4,
  ARENA: 5,
} as const;

export type PairingSystemType = typeof PairingSystem[keyof typeof PairingSystem];

/**
 * Schack4an team aggregation modes — controls how individual player points
 * are aggregated into a team score in Schackfyran tournaments. The field
 * (`schack4anteampointsystem` on the backing `TournamentClassGroup`) is **not
 * yet exposed in the public REST API**; these constants are defined in
 * anticipation so consumers have stable names to reach for when upstream
 * lands it.
 *
 * - `S4_NORMALIZED` (1): Normalize by class size to prevent larger classes
 *   from getting an unfair advantage. Formula (per
 *   `cp.Club.getChess4Score()`): `round(40 / max(s4minclasssize, classSize) ×
 *   totalPlayerPoints)`.
 * - `NORMAL` (-1): Raw sum of individual player points, no normalization.
 * - `LEGACY_DEFAULT` (10): Legacy uninitialised default. Rare. Should be
 *   treated as `NORMAL` (-1) for compatibility.
 */
export const Schack4anTeamPointSystem = {
  S4_NORMALIZED: 1,
  NORMAL: -1,
  LEGACY_DEFAULT: 10,
} as const;

export type Schack4anTeamPointSystemType = typeof Schack4anTeamPointSystem[keyof typeof Schack4anTeamPointSystem];

/**
 * Check if a team tournament uses "loosely-coupled" teams that are not bound
 * to a single club (e.g. real Skol-SM events). For these tournaments,
 * standings rows may have `club: null` and team names are not yet exposed in
 * the public REST API.
 *
 * @param playerListType The `teamtournamentPlayerListType` from a TournamentDto
 * @returns true if the tournament uses TEAM_TEAMS registration
 */
export function isLooseTeamTournament(playerListType: number): boolean {
  return playerListType === TeamTournamentPlayerListType.TEAM_TEAMS;
}

/**
 * Check if a tournament is fundamentally a team tournament — i.e. the
 * *identity* of the event is a team competition. This is the question
 * consumers usually want when deciding whether to render a team results
 * table or a team-oriented UI.
 *
 * Returns true for: `ALLSVENSKAN` (2), `SVENSKA_CUPEN` (6), `YES2CHESS` (8),
 * and `SCHACKFYRAN` (9). Schackfyran is included because school classes
 * compete as teams even though the pairings are individual — see
 * {@link isTeamPairing} for that separate question.
 *
 * Note that `SCHOOL_SM` (5) is **not** included: empirically it's used for
 * individual school championships, not team events. Real team Skol-SM
 * tournaments are configured as `ALLSVENSKAN` with `TEAM_TEAMS` player-list
 * type — use {@link isLooseTeamTournament} to catch the loose-team case.
 *
 * **BREAKING (0.6.0):** Previously returned true only for `{2, 6, 8}`. The
 * set now also includes `SCHACKFYRAN` (9). If you specifically want the
 * team-vs-team-pairing question, use {@link isTeamPairing}, which preserves
 * the previous set.
 *
 * @param type Tournament type number (`TournamentDto.type`)
 * @returns true if the tournament is identity-wise a team tournament
 */
export function isTeamTournament(type: number): boolean {
  return type === TournamentType.ALLSVENSKAN
    || type === TournamentType.SVENSKA_CUPEN
    || type === TournamentType.YES2CHESS
    || type === TournamentType.SCHACKFYRAN;
}

/**
 * Check if a tournament uses team-vs-team pairings ("lottning"). This is a
 * narrower question than {@link isTeamTournament}: it asks how pairings are
 * made, not whether the event is a team competition.
 *
 * Returns true for: `ALLSVENSKAN` (2), `SVENSKA_CUPEN` (6), `YES2CHESS` (8).
 * Returns false for `SCHACKFYRAN` (9) — Schackfyran is a team tournament but
 * pairings are individual (subject to the school/class constraint).
 *
 * @param type Tournament type number (`TournamentDto.type`)
 * @returns true if pairings are team-vs-team
 */
export function isTeamPairing(type: number): boolean {
  return type === TournamentType.ALLSVENSKAN
    || type === TournamentType.SVENSKA_CUPEN
    || type === TournamentType.YES2CHESS;
}

/**
 * Check if a tournament is Schackfyran (type 9). Convenience wrapper that
 * also serves as the natural call site for the privacy commitment:
 *
 * The federation deliberately hides Schackfyran individual standings
 * because the participants are typically children who aren't
 * tournament-registered. Even though the API returns the individual results,
 * exposing them publicly works against that commitment — prefer linking to
 * `https://resultat.schack.se/ShowTournamentServlet?id={groupId}` for
 * Schackfyran tournaments.
 *
 * @param type Tournament type number (`TournamentDto.type`)
 * @returns true if the tournament is Schackfyran
 */
export function isSchackfyran(type: number): boolean {
  return type === TournamentType.SCHACKFYRAN;
}

/**
 * Pragmatic fallback for detecting Schackfyran-like behaviour when the
 * tournament type is wrong. Organisers occasionally pick `INDIVIDUAL` (or
 * some other type) but still configure the group with Schack4an scoring —
 * those tournaments behave like Schackfyran in every way that matters for
 * display, even though `type` doesn't say so.
 *
 * Returns true when `type === SCHACKFYRAN` *or* the group's `pointSystem` is
 * `SCHACK4AN` (1). Low-priority fallback — most consumers will only need
 * {@link isSchackfyran}.
 *
 * @param type Tournament type number (`TournamentDto.type`)
 * @param groupPointSystem `pointSystem` from `TournamentClassGroupDto`
 * @returns true if the tournament behaves like Schackfyran
 */
export function isSchackfyranLike(type: number, groupPointSystem: number): boolean {
  return type === TournamentType.SCHACKFYRAN
    || groupPointSystem === PointSystem.SCHACK4AN;
}

/**
 * Local time representation
 */
export interface LocalTime {
    /** Hour (0-23) */
    hour: number;
    /** Minute (0-59) */
    minute: number;
    /** Second (0-59) */
    second: number;
    /** Nanoseconds */
    nano: number;
}

/**
 * Prize category configuration
 */
export interface PrizeCategoryDto {
    /** Category ID */
    id: number;
    /** Category name */
    name: string;
    /** Start value */
    start: number;
    /** End value */
    end: number;
    /** Category type */
    type: number;
    /** Group ID */
    groupid: number;
    /** Display order */
    order: number;
    /** Usage type */
    usagetype: number;
    /** AND logic flag */
    andlogic: number;
}

/**
 * Tournament round informationas
 */
export interface RoundDto {
    /** Round ID */
    id: number;
    /** Group ID */
    groupId: number;
    /** Round number */
    roundNumber: number;
    /** Round date */
    roundDate: string;
    /** Whether round is rated */
    rated: number;
    /** Judge ID */
    judgeId: number;
    /** Lock time */
    lockTime: string;
    /** Publish time */
    publishTime: string;
    /** Match ID */
    matchId: number;
}

/**
 * Tournament group within a class
 */
export interface TournamentClassGroupDto {
    /** Group ID */
    id: number;
    /** Class ID */
    classID: number;
    /** Group name */
    name: string;
    /** Pairing system for members */
    pairingSystemMember: number;
    /** Display order */
    order: number;
    /** Group start date */
    start: string;
    /** Group end date */
    end: string;
    /** Number of teams to go up class */
    numberOfTeamsToGoUpClass: number;
    /** Number of teams to go down class */
    numberOfTeamsToGoDownClass: number;
    /** Percentage of points to go up class */
    percentageOfPointsToGoUpClass: number;
    /** Percentage of points to go down class */
    percentageOfPointsToGoDownClass: number;
    /** Number of players in team */
    playersinteam: number;
    /** Double rounded flag */
    doubleRounded: number;
    /** Entry cost */
    cost: number;
    /** Whether possible to register */
    possibleToRegister: number;
    /** Tie-break system */
    tiebreakSystem: number;
    /**
     * Point system for individual game scoring. See `PointSystem` from
     * `gameResults`:
     * - `DEFAULT` (-1): 1 / 0.5 / 0
     * - `SCHACK4AN` (1): 3 / 2 / 1 (Schackfyran scoring)
     * - `POINT310` (2): 3 / 1 / 0
     *
     * On Schackfyran groups this is usually `SCHACK4AN` but can be
     * `DEFAULT`. A group with `pointSystem === SCHACK4AN` may indicate a
     * Schackfyran-like tournament even when `TournamentDto.type` says
     * otherwise — see {@link isSchackfyranLike}.
     */
    pointSystem: number;
    /** Print name */
    printName: string;
    /** Ranking algorithm */
    rankingAlgorithm: number;
    /** Split group size */
    splitgroupSize: number;
    /** Number of rounds */
    nrofrounds: number;
    /** Arena start time */
    arenaStart: LocalTime;
    /** Arena end time */
    arenaEnd: LocalTime;
    /** Registration categories */
    registrationCategories: PrizeCategoryDto[];
    /** Prize categories */
    prizeCategories: PrizeCategoryDto[];
    /** Tournament rounds */
    tournamentRounds: RoundDto[];
}

/**
 * Tournament class/division information
 */
export interface TournamentClassDto {
    /** Class ID */
    classID: number;
    /** Tournament ID */
    tournamentID: number;
    /** Parent class ID */
    parentClassID: number;
    /** Display order */
    order: number;
    /** Class name */
    className: string;
    /** Number of teams to go up class */
    numberOfTeamsToGoUpClass: number;
    /** Number of teams to go down class */
    numberOfTeamsToGoDownClass: number;
    /** Percentage of points to go up class */
    percentageOfPointsToGoUpClass: number;
    /** Percentage of points to go down class */
    percentageOfPointsToGoDownClass: number;
    /** Games URL */
    gamesUrl: string;
    /** Groups in this class */
    groups: TournamentClassGroupDto[];
    /** Sub-classes (child classes) - recursive hierarchical structure */
    subClasses: TournamentClassDto[];
}

/**
 * Complete tournament information
 */
export interface TournamentDto {
    /** Tournament ID */
    id: number;
    /** Tournament name */
    name: string;
    /** Start date */
    start: string;
    /** End date */
    end: string;
    /** City */
    city: string;
    /** Arena/venue */
    arena: string;
    /** Tournament type */
    type: number;
    /** International Arbiter */
    ia: number;
    /** Secondary judges (raw string) */
    secjudges: string;
    /** Thinking time */
    thinkingTime: string;
    /** Tournament state */
    state: number;
    /** Allow foreign players */
    allowForeignPlayers: number;
    /**
     * Team tournament player list type — how players are tied to teams.
     * See {@link TeamTournamentPlayerListType} for the possible values:
     * 1 = REGISTRATION_TEAMS (club's registered players),
     * 2 = RATINGLIST_TEAMS (club's rating list),
     * 3 = TEAM_TEAMS (loosely-coupled teams, e.g. Skol-SM).
     */
    teamtournamentPlayerListType: number;
    /** Age filter */
    ageFilter: number;
    /** Number of participants link */
    nrOfPartLink: string;
    /** Organization type */
    orgType: number;
    /** Organization number */
    orgNumber: number;
    /** Rating registration date */
    ratingRegDate: string;
    /** Secondary rating registration date */
    ratingRegDate2: string;
    /** FIDE registered */
    fideregged: number;
    /** Online tournament */
    online: number;
    /** Yes2Chess rules */
    y2cRules: number;
    /** Team number of days registered */
    teamNrOfDaysRegged: number;
    /** Show public */
    showPublic: number;
    /** Invitation URL */
    invitationurl: string;
    /** Latest updated timestamp */
    latestUpdated?: string;
    /** Parsed secondary judges (array of IDs) */
    secParsedJudges: number[];
    /** Root classes */
    rootClasses: TournamentClassDto[];
}

/**
 * Tournament search result
 */
export interface GroupSearchAnswerDto {
    /** Group ID */
    id: number;
    /** Group/tournament name */
    name: string;
    /** Tournament ID */
    tournamentid: number;
    /** Tournament name */
    tournamentname: string;
    /** Latest updated game timestamp */
    latestUpdatedGame?: string;
}

/**
 * Derived lifecycle status of a tournament or group.
 *
 * This is the *trustworthy* status to display. Prefer it over the raw
 * `TournamentDto.state` field, which organizers frequently leave stale
 * (e.g. events long finished are still marked `REGISTRATION`). See
 * {@link getTournamentStatus} for how it is derived.
 *
 * - `upcoming`  — before the start date (registration phase).
 * - `ongoing`   — started but not past the end date (or round results exist).
 * - `finished`  — past the end date.
 * - `unknown`   — not enough information to decide.
 */
export type TournamentStatus = 'upcoming' | 'ongoing' | 'finished' | 'unknown';

/**
 * Input for {@link getTournamentStatus}: pass the raw objects you already hold.
 *
 * You MUST provide a `tournament` and/or a `group`; add `roundResults` if you
 * have already fetched them. The union enforces "at least one of
 * tournament/group" at compile time, so `{}` or a results-only object is a
 * type error.
 *
 * The SDK extracts what it needs internally:
 * - dates: `group` dates take precedence over `tournament` dates;
 * - `state`: read from `tournament` (a group DTO has no state field);
 * - "has results": derived from `roundResults` being non-empty.
 */
export type TournamentStatusSource =
    | { tournament: TournamentDto; group?: TournamentClassGroupDto; roundResults?: ReadonlyArray<unknown> }
    | { tournament?: TournamentDto; group: TournamentClassGroupDto; roundResults?: ReadonlyArray<unknown> };
