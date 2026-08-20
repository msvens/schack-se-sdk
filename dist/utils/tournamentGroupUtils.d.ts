/**
 * Utility functions for working with tournament groups
 */
import { TournamentDto, TournamentClassDto, TournamentClassGroupDto } from '../types';
/**
 * Result of finding a group within tournament class hierarchy
 */
export interface TournamentGroupResult {
    group: TournamentClassGroupDto;
    parentClass: TournamentClassDto;
    /** Whether the tournament has multiple classes that should be distinguished */
    hasMultipleClasses: boolean;
}
/**
 * Get tournament group metadata by its ID
 * @param tournament Tournament data containing class hierarchy
 * @param groupId Group ID to find
 * @returns Group, parent class, and whether it's a root class, or null if not found
 */
export declare function findTournamentGroup(tournament: TournamentDto, groupId: number): TournamentGroupResult | null;
/**
 * Get the name of a tournament group by its ID
 * @param tournament Tournament data containing class hierarchy
 * @param groupId Group ID to find
 * @returns Group name if found, empty string otherwise
 */
export declare function getGroupName(tournament: TournamentDto, groupId: number): string;
//# sourceMappingURL=tournamentGroupUtils.d.ts.map