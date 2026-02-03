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
 * Internal result type for recursive search
 */
interface GroupSearchResult {
  group: TournamentClassGroupDto;
  parentClass: TournamentClassDto;
}

/**
 * Recursively searches through tournament classes to find a group by ID
 * @param classes Array of tournament classes to search
 * @param groupId Group ID to find
 * @returns Group and its parent class if found, null otherwise
 */
function findGroupInClasses(classes: TournamentClassDto[], groupId: number): GroupSearchResult | null {
  for (const tournamentClass of classes) {
    // Search groups in this class
    const group = tournamentClass.groups?.find(g => g.id === groupId);
    if (group) {
      return { group, parentClass: tournamentClass };
    }

    // Recursively search subclasses
    if (tournamentClass.subClasses && tournamentClass.subClasses.length > 0) {
      const foundInSubclass = findGroupInClasses(tournamentClass.subClasses, groupId);
      if (foundInSubclass) {
        return foundInSubclass;
      }
    }
  }

  return null;
}

/**
 * Get tournament group metadata by its ID
 * @param tournament Tournament data containing class hierarchy
 * @param groupId Group ID to find
 * @returns Group, parent class, and whether it's a root class, or null if not found
 */
export function findTournamentGroup(tournament: TournamentDto, groupId: number): TournamentGroupResult | null {
  if (!tournament.rootClasses || tournament.rootClasses.length === 0) {
    return null;
  }

  const result = findGroupInClasses(tournament.rootClasses, groupId);

  if (!result) {
    return null;
  }

  // Check if the tournament has multiple classes that need to be distinguished
  // This happens if:
  // 1. There are multiple root classes, OR
  // 2. Any root class has subclasses (most common case, e.g., SM with Klass I, II, III)
  const hasMultipleClasses =
    tournament.rootClasses.length > 1 ||
    tournament.rootClasses.some(rootClass =>
      rootClass.subClasses && rootClass.subClasses.length > 0
    )

  return {
    group: result.group,
    parentClass: result.parentClass,
    hasMultipleClasses
  };
}

/**
 * Get the name of a tournament group by its ID
 * @param tournament Tournament data containing class hierarchy
 * @param groupId Group ID to find
 * @returns Group name if found, empty string otherwise
 */
export function getGroupName(tournament: TournamentDto, groupId: number): string {
  const result = findTournamentGroup(tournament, groupId);
  return result?.group.name || '';
}
