/**
 * Unit tests for team formatting utilities
 */

import {
  toRomanNumeral,
  countTeamsByClub,
  formatTeamName,
  createTeamNameFormatter,
  getTeamRowName,
  createStandingsTeamNameFormatter,
  createRoundResultsTeamNameFormatter
} from '../../src/utils/teamFormatting';
import type { ClubDTO, TeamTournamentEndResultDto } from '../../src/types';

/** Minimal team standings row — only the fields the name helpers read. */
type NameRow = Pick<TeamTournamentEndResultDto, 'contenderId' | 'teamNumber' | 'club' | 'team'>;

const clubRow = (contenderId: number, teamNumber: number, name: string): NameRow => ({
  contenderId,
  teamNumber,
  club: { id: contenderId, name } as ClubDTO,
  team: null,
});

/** A loose (TEAM_TEAMS) row: club null, team set, teamNumber -1 as SSF returns it. */
const looseRow = (contenderId: number, name: string): NameRow => ({
  contenderId,
  teamNumber: -1,
  club: null,
  team: { id: contenderId, name },
});

describe('teamFormatting', () => {
  describe('toRomanNumeral', () => {
    it('should convert 1-10 correctly', () => {
      expect(toRomanNumeral(1)).toBe('I');
      expect(toRomanNumeral(2)).toBe('II');
      expect(toRomanNumeral(3)).toBe('III');
      expect(toRomanNumeral(4)).toBe('IV');
      expect(toRomanNumeral(5)).toBe('V');
      expect(toRomanNumeral(6)).toBe('VI');
      expect(toRomanNumeral(7)).toBe('VII');
      expect(toRomanNumeral(8)).toBe('VIII');
      expect(toRomanNumeral(9)).toBe('IX');
      expect(toRomanNumeral(10)).toBe('X');
    });

    it('should convert 11-20 correctly', () => {
      expect(toRomanNumeral(11)).toBe('XI');
      expect(toRomanNumeral(12)).toBe('XII');
      expect(toRomanNumeral(13)).toBe('XIII');
      expect(toRomanNumeral(14)).toBe('XIV');
      expect(toRomanNumeral(15)).toBe('XV');
      expect(toRomanNumeral(16)).toBe('XVI');
      expect(toRomanNumeral(17)).toBe('XVII');
      expect(toRomanNumeral(18)).toBe('XVIII');
      expect(toRomanNumeral(19)).toBe('XIX');
      expect(toRomanNumeral(20)).toBe('XX');
    });

    it('should return string for edge cases (0, negative, >20)', () => {
      expect(toRomanNumeral(0)).toBe('0');
      expect(toRomanNumeral(-1)).toBe('-1');
      expect(toRomanNumeral(21)).toBe('21');
      expect(toRomanNumeral(100)).toBe('100');
    });
  });

  describe('countTeamsByClub', () => {
    it('should count unique teams per club', () => {
      const results = [
        { contenderId: 1, teamNumber: 1 },
        { contenderId: 1, teamNumber: 2 },
        { contenderId: 1, teamNumber: 3 },
        { contenderId: 2, teamNumber: 1 },
      ];

      const counts = countTeamsByClub(results);
      expect(counts.get(1)).toBe(3);
      expect(counts.get(2)).toBe(1);
    });

    it('should return empty map for empty input', () => {
      const counts = countTeamsByClub([]);
      expect(counts.size).toBe(0);
    });

    it('should handle duplicate team entries', () => {
      const results = [
        { contenderId: 1, teamNumber: 1 },
        { contenderId: 1, teamNumber: 1 }, // Duplicate
        { contenderId: 1, teamNumber: 2 },
      ];

      const counts = countTeamsByClub(results);
      expect(counts.get(1)).toBe(2); // Only 2 unique teams
    });
  });

  describe('formatTeamName', () => {
    it('should return plain name for single team clubs', () => {
      expect(formatTeamName('SK Rockaden', 1, 1)).toBe('SK Rockaden');
    });

    it('should append Roman numeral for multi-team clubs', () => {
      expect(formatTeamName('SK Rockaden', 1, 3)).toBe('SK Rockaden I');
      expect(formatTeamName('SK Rockaden', 2, 3)).toBe('SK Rockaden II');
      expect(formatTeamName('SK Rockaden', 3, 3)).toBe('SK Rockaden III');
    });

    it('should handle team count of 0', () => {
      expect(formatTeamName('SK Rockaden', 1, 0)).toBe('SK Rockaden');
    });

    it('keeps the numeral for a lone team whose own number is > 1 (regression: Helsingborg SA III)', () => {
      // The team is the only one of its club in this group (clubTeamCount === 1),
      // but "III" is its identity, not a within-group disambiguator, so it must
      // not be dropped.
      expect(formatTeamName('Helsingborg SA', 3, 1)).toBe('Helsingborg SA III');
      expect(formatTeamName('Helsingborg SA', 2, 1)).toBe('Helsingborg SA II');
      // Lone first team stays bare.
      expect(formatTeamName('Helsingborg SA', 1, 1)).toBe('Helsingborg SA');
    });

    it('still numbers every team when a club fields several in one group (unchanged)', () => {
      expect(formatTeamName('SK Rockaden', 1, 2)).toBe('SK Rockaden I');
      expect(formatTeamName('SK Rockaden', 2, 2)).toBe('SK Rockaden II');
    });
  });

  describe('createTeamNameFormatter', () => {
    it('should create formatter that handles multi-team clubs', () => {
      const results = [
        { contenderId: 1, teamNumber: 1 },
        { contenderId: 1, teamNumber: 2 },
        { contenderId: 2, teamNumber: 1 },
      ];

      const getClubName = (id: number) => id === 1 ? 'SK Rockaden' : 'Stockholms SS';

      const formatter = createTeamNameFormatter(results, getClubName);

      // Club 1 has 2 teams - should show Roman numerals
      expect(formatter(1, 1)).toBe('SK Rockaden I');
      expect(formatter(1, 2)).toBe('SK Rockaden II');

      // Club 2 has 1 team - should not show numeral
      expect(formatter(2, 1)).toBe('Stockholms SS');
    });

    it('should handle clubs not in results', () => {
      const results = [{ contenderId: 1, teamNumber: 1 }];
      const getClubName = (id: number) => `Club ${id}`;

      const formatter = createTeamNameFormatter(results, getClubName);

      // Club 999 not in results - should default to 1 team (no numeral)
      expect(formatter(999, 1)).toBe('Club 999');
    });
  });

  describe('getTeamRowName', () => {
    it('reads the club name on a club-based row', () => {
      expect(getTeamRowName(clubRow(38431, 1, 'Lunds Schackklubb'))).toBe('Lunds Schackklubb');
    });

    it('reads the team name on a loose (TEAM_TEAMS) row', () => {
      expect(getTeamRowName(looseRow(16196, 'Bilingual Montessori School of Lund')))
        .toBe('Bilingual Montessori School of Lund');
    });

    it('prefers team over club if upstream ever populates both', () => {
      expect(getTeamRowName({ ...clubRow(1, 1, 'Some SK'), team: { id: 1, name: 'Some School' } }))
        .toBe('Some School');
    });

    it('returns null when the row carries neither', () => {
      expect(getTeamRowName({ club: null, team: null })).toBeNull();
    });
  });

  describe('createStandingsTeamNameFormatter', () => {
    it('names loose teams bare, despite teamNumber -1', () => {
      // Real shape from Skollags-SM 2026 group 18228: every team is its own
      // contenderId, so no numeral may be appended.
      const rows = [
        looseRow(16196, 'Bilingual Montessori School of Lund'),
        looseRow(16342, 'Söraskolan L1'),
      ];
      const name = createStandingsTeamNameFormatter(rows);

      expect(name(16196, -1)).toBe('Bilingual Montessori School of Lund');
      expect(name(16342, -1)).toBe('Söraskolan L1');
    });

    it('numbers a club fielding several teams and leaves a lone team bare', () => {
      const rows = [
        clubRow(1, 1, 'SK Rockaden'),
        clubRow(1, 2, 'SK Rockaden'),
        clubRow(2, 1, 'Stockholms SS'),
      ];
      const name = createStandingsTeamNameFormatter(rows);

      expect(name(1, 1)).toBe('SK Rockaden I');
      expect(name(1, 2)).toBe('SK Rockaden II');
      expect(name(2, 1)).toBe('Stockholms SS');
    });

    it('keeps a lone team\'s own numeral (teamNumber > 1)', () => {
      const name = createStandingsTeamNameFormatter([clubRow(100, 3, 'Helsingborgs SA')]);
      expect(name(100, 3)).toBe('Helsingborgs SA III');
    });

    it('returns null for an unknown id — covers the -100 bye sentinel', () => {
      const name = createStandingsTeamNameFormatter([looseRow(16196, 'Some School')]);
      expect(name(-100, -1)).toBeNull();
      expect(name(999, 1)).toBeNull();
    });

    it('names both sides of a team round-result match, which carries no names', () => {
      // Round results only give homeId/awayId; those are the standings
      // contenderIds, so the standings formatter resolves them.
      const rows = [looseRow(16343, 'Engelska Skolan Norr L'), looseRow(16186, 'Mälarparksskolan Västerås')];
      const name = createStandingsTeamNameFormatter(rows);
      const match = { homeId: 16343, awayId: 16186, homeTeamNumber: -1, awayTeamNumber: -1 };

      expect(name(match.homeId, match.homeTeamNumber)).toBe('Engelska Skolan Norr L');
      expect(name(match.awayId, match.awayTeamNumber)).toBe('Mälarparksskolan Västerås');
    });
  });

  describe('createRoundResultsTeamNameFormatter', () => {
    it('keeps a lone team\'s numeral from round-results data (the UI path)', () => {
      // One Helsingborg SA team (its III) plays in this group — only teamNumber 3
      // ever appears for club 100, so clubTeamCount is 1, yet the III must stay.
      const roundResults = [
        { homeId: 100, awayId: 200, homeTeamNumber: 3, awayTeamNumber: 1 },
        { homeId: 200, awayId: 100, homeTeamNumber: 1, awayTeamNumber: 3 },
      ];
      const getClubName = (id: number) => (id === 100 ? 'Helsingborg SA' : 'Lund ASK');

      const formatter = createRoundResultsTeamNameFormatter(roundResults, getClubName);

      expect(formatter(100, 3)).toBe('Helsingborg SA III');
      expect(formatter(200, 1)).toBe('Lund ASK');
    });
  });
});
