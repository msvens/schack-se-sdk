/**
 * Unit tests for tournamentGroupUtils
 */

import {
  findTournamentGroup,
  getGroupName,
} from '../../src/utils/tournamentGroupUtils';
import type {
  TournamentDto,
  TournamentClassDto,
  TournamentClassGroupDto,
} from '../../src/types';

function makeGroup(id: number, name = `Group ${id}`): TournamentClassGroupDto {
  return { id, name } as TournamentClassGroupDto;
}

function makeClass(
  classID: number,
  groups: TournamentClassGroupDto[] = [],
  subClasses: TournamentClassDto[] = [],
  className = `Class ${classID}`
): TournamentClassDto {
  return { classID, className, groups, subClasses } as TournamentClassDto;
}

function makeTournament(rootClasses: TournamentClassDto[]): TournamentDto {
  return { id: 1, name: 'T', rootClasses } as unknown as TournamentDto;
}

describe('tournamentGroupUtils', () => {
  describe('findTournamentGroup', () => {
    it('returns null for tournament with no rootClasses', () => {
      const tournament = { id: 1, name: 'T' } as unknown as TournamentDto;
      expect(findTournamentGroup(tournament, 42)).toBeNull();
    });

    it('returns null for empty rootClasses array', () => {
      const tournament = makeTournament([]);
      expect(findTournamentGroup(tournament, 42)).toBeNull();
    });

    it('returns null when group is not found', () => {
      const tournament = makeTournament([makeClass(1, [makeGroup(10)])]);
      expect(findTournamentGroup(tournament, 999)).toBeNull();
    });

    it('finds group in a single root class', () => {
      const group = makeGroup(10);
      const rootClass = makeClass(1, [group]);
      const tournament = makeTournament([rootClass]);

      const result = findTournamentGroup(tournament, 10);

      expect(result).not.toBeNull();
      expect(result!.group).toBe(group);
      expect(result!.parentClass).toBe(rootClass);
      expect(result!.hasMultipleClasses).toBe(false);
    });

    it('finds group in a nested subclass', () => {
      const deepGroup = makeGroup(99);
      const subSubClass = makeClass(3, [deepGroup]);
      const subClass = makeClass(2, [], [subSubClass]);
      const rootClass = makeClass(1, [], [subClass]);
      const tournament = makeTournament([rootClass]);

      const result = findTournamentGroup(tournament, 99);

      expect(result).not.toBeNull();
      expect(result!.group).toBe(deepGroup);
      expect(result!.parentClass).toBe(subSubClass);
      expect(result!.hasMultipleClasses).toBe(true); // because subclasses exist
    });

    it('flags hasMultipleClasses when there are multiple root classes', () => {
      const group = makeGroup(10);
      const tournament = makeTournament([
        makeClass(1, [group]),
        makeClass(2, [makeGroup(20)]),
      ]);

      const result = findTournamentGroup(tournament, 10);
      expect(result?.hasMultipleClasses).toBe(true);
    });

    it('flags hasMultipleClasses when a root class has subclasses', () => {
      const group = makeGroup(10);
      const rootClass = makeClass(1, [group], [makeClass(2)]);
      const tournament = makeTournament([rootClass]);

      const result = findTournamentGroup(tournament, 10);
      expect(result?.hasMultipleClasses).toBe(true);
    });

    it('handles classes with null/undefined groups and subClasses', () => {
      const sparseClass = { classID: 1, className: 'x' } as TournamentClassDto;
      const tournament = makeTournament([sparseClass]);
      expect(findTournamentGroup(tournament, 10)).toBeNull();
    });

    it('searches breadth across siblings before giving up', () => {
      const target = makeGroup(77);
      const tournament = makeTournament([
        makeClass(1, [makeGroup(10)]),
        makeClass(2, [makeGroup(20), target]),
        makeClass(3, [makeGroup(30)]),
      ]);

      const result = findTournamentGroup(tournament, 77);
      expect(result?.group).toBe(target);
      expect(result?.parentClass.classID).toBe(2);
    });
  });

  describe('getGroupName', () => {
    it('returns group name when found', () => {
      const tournament = makeTournament([
        makeClass(1, [makeGroup(10, 'Elite')]),
      ]);
      expect(getGroupName(tournament, 10)).toBe('Elite');
    });

    it('returns empty string when group is not found', () => {
      const tournament = makeTournament([makeClass(1, [makeGroup(10)])]);
      expect(getGroupName(tournament, 999)).toBe('');
    });

    it('returns empty string for tournament with no rootClasses', () => {
      const tournament = { id: 1, name: 'T' } as unknown as TournamentDto;
      expect(getGroupName(tournament, 10)).toBe('');
    });
  });
});
