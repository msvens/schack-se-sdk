/**
 * Organization-related types for the Swedish Chess Federation API
 */

/**
 * Federation (SSF) information
 */
export interface FederationDTO {
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
export interface DistrictDTO {
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
export interface DistrictMembershipDTO {
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
export interface RegistrationYear {
    /** Registration period start date */
    startDate: string;
    /** Registration period end date */
    endDate: string;
}

/**
 * Club information
 */
export interface ClubDTO {
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
