/**
 * Tournament-related types for the Swedish Chess Federation API
 */

/**
 * Tournament type constants
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
 * Check if a tournament type is a team tournament
 * @param type Tournament type number
 * @returns true if team tournament (Allsvenskan, Svenska Cupen, Yes2Chess)
 */
export function isTeamTournament(type: number): boolean {
  return type === TournamentType.ALLSVENSKAN
    || type === TournamentType.SVENSKA_CUPEN
    || type === TournamentType.YES2CHESS;
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
    /** Point system */
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
    /** Team tournament player list type */
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
