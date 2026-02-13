interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    status: number;
    message?: string;
}
interface ApiError {
    message: string;
    status: number;
    code?: string;
}

/**
 * Player-related types for the Swedish Chess Federation API
 */
/**
 * FIDE rating information for a member
 */
interface MemberFIDERatingDTO {
    /** Standard FIDE rating */
    rating: number;
    /** FIDE title */
    title: string;
    /** Rating date */
    date: string;
    /** K-factor for standard rating */
    k: number;
    /** Rapid FIDE rating */
    rapidRating: number;
    /** K-factor for rapid rating */
    rapidk: number;
    /** Blitz FIDE rating */
    blitzRating: number;
    /** K-factor for blitz rating */
    blitzK: number;
}
/**
 * LASK (Swedish national rating) information for a member
 */
interface MemberLASKRatingDTO {
    /** LASK rating value */
    rating: number;
    /** Rating date */
    date: string;
}
/**
 * Player rating history point containing FIDE and LASK ratings for a specific date
 */
interface PlayerRatingHistory {
    /** FIDE rating information */
    elo: MemberFIDERatingDTO;
    /** LASK rating information */
    lask: MemberLASKRatingDTO;
}
/**
 * Complete player information including ratings and club affiliation
 */
interface PlayerInfoDto {
    /** Player ID */
    id: number;
    /** First name */
    firstName: string;
    /** Last name */
    lastName: string;
    /** Date of birth */
    birthdate: string;
    /** Sex (1=Male, 2=Female, etc.) */
    sex: number;
    /** FIDE ID */
    fideid: number;
    /** Country code */
    country: string;
    /** Club name */
    club: string;
    /** Club ID */
    clubId: number;
    /** FIDE rating information */
    elo: MemberFIDERatingDTO;
    /** LASK rating information */
    lask: MemberLASKRatingDTO;
}
/**
 * Rating data point for chart display
 * Contains optional ratings for each time control type
 */
interface RatingDataPoint {
    /** Date in YYYY-MM format */
    date: string;
    /** Standard (classical) rating */
    standard?: number;
    /** Rapid rating */
    rapid?: number;
    /** Blitz rating */
    blitz?: number;
    /** LASK (Swedish national) rating */
    lask?: number;
}

/**
 * Organization-related types for the Swedish Chess Federation API
 */
/**
 * Federation (SSF) information
 */
interface FederationDTO {
    /** Federation ID */
    id: number;
    /** Federation name */
    name: string;
    /** Street address */
    street: string;
    /** Postal code */
    zipcode: number;
    /** City */
    city: string;
    /** Start date */
    started: string;
    /** Season start date */
    startseason: string;
    /** Season end date */
    endseason: string;
    /** Phone number */
    phonenr: string;
    /** Postgiro number */
    postgiro: string;
    /** Email address */
    email: string;
    /** Organization number */
    orgnumber: string;
    /** Website URL */
    url: string;
    /** SISU ID */
    sisuid: number;
}
/**
 * District information
 */
interface DistrictDTO {
    /** District ID */
    id: number;
    /** District name */
    name: string;
    /** Contact person (c/o) */
    co_ContantPerson: string;
    /** Street address */
    street: string;
    /** Postal code */
    zipcode: number;
    /** City */
    city: string;
    /** Start date */
    started: string;
    /** Season start date */
    startSeason: string;
    /** Season end date */
    endSeason: string;
    /** Phone number */
    phonenr: string;
    /** Postgiro number */
    postgiro: string;
    /** Active status */
    active: number;
    /** Email address */
    email: string;
    /** Organization number */
    orgnumber: string;
    /** Authorization for school clubs */
    authschoolclub: string;
    /** Website URL */
    url: string;
    /** SISU ID */
    sisuid: number;
    /** Date joined federation */
    joinFederationDate: string;
}
/**
 * District membership information for clubs
 */
interface DistrictMembershipDTO {
    /** Membership start date */
    start: string;
    /** Membership end date */
    end: string;
    /** Year */
    year: number;
    /** District ID */
    districtid: number;
    /** Club ID */
    clubid: number;
    /** Active status */
    active: number;
    /** Benefit status */
    benefit: number;
}
/**
 * Registration year information
 */
interface RegistrationYear {
    /** Registration period start date */
    startDate: string;
    /** Registration period end date */
    endDate: string;
}
/**
 * Club information
 */
interface ClubDTO {
    /** Club ID */
    id: number;
    /** Club name */
    name: string;
    /** Street address */
    street: string;
    /** Postal code */
    zipcode: number;
    /** City */
    city: string;
    /** Club start date */
    startdate: string;
    /** Season start date */
    startSeason: string;
    /** Season end date */
    endSeason: string;
    /** Phone number */
    phonenr: string;
    /** Postgiro number */
    postgiro: string;
    /** Alliance club ID */
    alliansclub: number;
    /** Email address */
    email: string;
    /** Organization number */
    orgnumber: string;
    /** District memberships */
    districts: DistrictMembershipDTO[];
    /** Registration year information */
    regYear: RegistrationYear;
    /** Website URL */
    url: string;
    /** Board description */
    vbdescr: string;
    /** School club indicator */
    schoolClub: number;
    /** School name */
    schoolName: string;
    /** School ID */
    schoolid: number;
    /** County (lan) */
    lan: number;
    /** No economy indicator */
    noEconomy: number;
    /** Special type indicator */
    specialType: number;
    /** Yes to chess reason */
    yes2chessreason: boolean;
    /** Chess4all reason */
    schack4anreason: boolean;
    /** Other reason */
    ovrigtreason: boolean;
    /** Has rating players */
    hasRatingPlayers: number;
    /** SISU ID */
    sisuid: number;
}

/**
 * Tournament-related types for the Swedish Chess Federation API
 */
/**
 * Tournament type constants
 */
declare const TournamentType: {
    readonly ALLSVENSKAN: 2;
    readonly INDIVIDUAL: 3;
    readonly SM_TREE: 4;
    readonly SCHOOL_SM: 5;
    readonly SVENSKA_CUPEN: 6;
    readonly GRAND_PRIX: 7;
    readonly YES2CHESS: 8;
    readonly SCHACKFYRAN: 9;
};
/**
 * Tournament state constants
 */
declare const TournamentState: {
    readonly REGISTRATION: 1;
    readonly STARTED: 2;
    readonly FINISHED: 3;
};
/**
 * Check if a tournament type is a team tournament
 * @param type Tournament type number
 * @returns true if team tournament (Allsvenskan, Svenska Cupen, Yes2Chess)
 */
declare function isTeamTournament(type: number): boolean;
/**
 * Local time representation
 */
interface LocalTime {
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
interface PrizeCategoryDto {
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
interface RoundDto {
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
interface TournamentClassGroupDto {
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
interface TournamentClassDto {
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
interface TournamentDto {
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
interface GroupSearchAnswerDto {
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
 * Results-related types for the Swedish Chess Federation API
 */

/**
 * Individual game information
 */
interface GameDto {
    /** Game ID */
    id: number;
    /** Tournament result ID */
    tournamentResultID: number;
    /** Table number */
    tableNr: number;
    /** White player ID */
    whiteId: number;
    /** Black player ID */
    blackId: number;
    /** Game result (0=loss, 0.5=draw, 1=win from white's perspective) */
    result: number;
    /** PGN notation of the game */
    pgn: string;
    /** Group ID */
    groupiD: number;
}
/**
 * Round result information for tournaments
 */
interface TournamentRoundResultDto {
    /** Round result ID */
    id: number;
    /** Group ID */
    groupdId: number;
    /** Round number */
    roundNr: number;
    /** Board number */
    board: number;
    /** Home player/team ID */
    homeId: number;
    /** Home team number */
    homeTeamNumber: number;
    /** Away player/team ID */
    awayId: number;
    /** Away team number */
    awayTeamNumber: number;
    /** Home result points */
    homeResult: number;
    /** Away result points */
    awayResult: number;
    /** Match date */
    date: string;
    /** Whether result is finalized */
    finalized: boolean;
    /** Publisher ID */
    publisher: number;
    /** Publish date */
    publishDate: string;
    /** Published note */
    publishedNote: string;
    /** Individual games in this round */
    games: GameDto[];
}
/**
 * Final tournament result for individual players
 */
interface TournamentEndResultDto {
    /** Total points earned */
    points: number;
    /** Secondary points (tie-break) */
    secPoints: number;
    /** Final placement */
    place: number;
    /** Contender ID */
    contenderId: number;
    /** Team number */
    teamNumber: number;
    /** Number of won games */
    wonGames: number;
    /** Number of drawn games */
    drawGames: number;
    /** Number of lost games */
    lostGames: number;
    /** Group ID */
    groupId: number;
    /** Player information */
    playerInfo: PlayerInfoDto;
}
/**
 * Final tournament result for team tournaments
 */
interface TeamTournamentEndResultDto {
    /** Total points earned */
    points: number;
    /** Secondary points (tie-break) */
    secPoints: number;
    /** Final placement */
    place: number;
    /** Contender ID */
    contenderId: number;
    /** Team number */
    teamNumber: number;
    /** Number of won games */
    wonGames: number;
    /** Number of drawn games */
    drawGames: number;
    /** Number of lost games */
    lostGames: number;
    /** Club information */
    club: ClubDTO;
}

export { type ApiError as A, type ClubDTO as C, type DistrictDTO as D, type FederationDTO as F, type GameDto as G, type LocalTime as L, type MemberFIDERatingDTO as M, type PlayerInfoDto as P, type RatingDataPoint as R, type TeamTournamentEndResultDto as T, type ApiResponse as a, type DistrictMembershipDTO as b, type GroupSearchAnswerDto as c, type MemberLASKRatingDTO as d, type PlayerRatingHistory as e, type PrizeCategoryDto as f, type RegistrationYear as g, type RoundDto as h, type TournamentClassDto as i, type TournamentClassGroupDto as j, type TournamentDto as k, type TournamentEndResultDto as l, type TournamentRoundResultDto as m, TournamentState as n, TournamentType as o, isTeamTournament as p };
