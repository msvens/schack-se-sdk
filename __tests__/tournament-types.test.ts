import {
  TournamentType,
  TeamTournamentPlayerListType,
  PairingSystem,
  Schack4anTeamPointSystem,
  isTeamTournament,
  isTeamPairing,
  isSchackfyran,
  isSchackfyranLike,
  isLooseTeamTournament,
} from '../src/types/tournament';
import { PointSystem } from '../src/utils/gameResults';

describe('isTeamTournament', () => {
  it('returns true for the team-identity set {ALLSVENSKAN, SVENSKA_CUPEN, YES2CHESS, SCHACKFYRAN}', () => {
    expect(isTeamTournament(TournamentType.ALLSVENSKAN)).toBe(true);
    expect(isTeamTournament(TournamentType.SVENSKA_CUPEN)).toBe(true);
    expect(isTeamTournament(TournamentType.YES2CHESS)).toBe(true);
    expect(isTeamTournament(TournamentType.SCHACKFYRAN)).toBe(true);
  });

  it('returns false for non-team types', () => {
    expect(isTeamTournament(0)).toBe(false); // UNKNOWN
    expect(isTeamTournament(TournamentType.INDIVIDUAL)).toBe(false);
    expect(isTeamTournament(TournamentType.SM_TREE)).toBe(false);
    expect(isTeamTournament(TournamentType.SCHOOL_SM)).toBe(false);
    expect(isTeamTournament(TournamentType.GRAND_PRIX)).toBe(false);
  });

  it('does not classify SCHOOL_SM (5) as a team tournament', () => {
    // Empirical: type=5 is used for individual school events in practice;
    // real team Skol-SM is type=2 with TEAM_TEAMS player-list type.
    expect(isTeamTournament(TournamentType.SCHOOL_SM)).toBe(false);
  });
});

describe('isTeamPairing', () => {
  it('returns true for team-vs-team pairing types {ALLSVENSKAN, SVENSKA_CUPEN, YES2CHESS}', () => {
    expect(isTeamPairing(TournamentType.ALLSVENSKAN)).toBe(true);
    expect(isTeamPairing(TournamentType.SVENSKA_CUPEN)).toBe(true);
    expect(isTeamPairing(TournamentType.YES2CHESS)).toBe(true);
  });

  it('returns false for SCHACKFYRAN — team tournament with individual pairing', () => {
    expect(isTeamPairing(TournamentType.SCHACKFYRAN)).toBe(false);
  });

  it('returns false for non-team types', () => {
    expect(isTeamPairing(0)).toBe(false);
    expect(isTeamPairing(TournamentType.INDIVIDUAL)).toBe(false);
    expect(isTeamPairing(TournamentType.SM_TREE)).toBe(false);
    expect(isTeamPairing(TournamentType.SCHOOL_SM)).toBe(false);
    expect(isTeamPairing(TournamentType.GRAND_PRIX)).toBe(false);
  });
});

describe('isSchackfyran', () => {
  it('returns true only for SCHACKFYRAN (9)', () => {
    expect(isSchackfyran(TournamentType.SCHACKFYRAN)).toBe(true);
  });

  it('returns false for everything else', () => {
    expect(isSchackfyran(0)).toBe(false);
    expect(isSchackfyran(TournamentType.ALLSVENSKAN)).toBe(false);
    expect(isSchackfyran(TournamentType.INDIVIDUAL)).toBe(false);
    expect(isSchackfyran(TournamentType.SCHOOL_SM)).toBe(false);
    expect(isSchackfyran(TournamentType.SVENSKA_CUPEN)).toBe(false);
    expect(isSchackfyran(TournamentType.YES2CHESS)).toBe(false);
  });
});

describe('isSchackfyranLike', () => {
  it('returns true when type is SCHACKFYRAN regardless of point system', () => {
    expect(isSchackfyranLike(TournamentType.SCHACKFYRAN, PointSystem.DEFAULT)).toBe(true);
    expect(isSchackfyranLike(TournamentType.SCHACKFYRAN, PointSystem.SCHACK4AN)).toBe(true);
    expect(isSchackfyranLike(TournamentType.SCHACKFYRAN, PointSystem.POINT310)).toBe(true);
  });

  it('returns true when group uses SCHACK4AN scoring even if type is something else', () => {
    expect(isSchackfyranLike(TournamentType.INDIVIDUAL, PointSystem.SCHACK4AN)).toBe(true);
    expect(isSchackfyranLike(TournamentType.GRAND_PRIX, PointSystem.SCHACK4AN)).toBe(true);
  });

  it('returns false for non-Schackfyran type with non-S4 scoring', () => {
    expect(isSchackfyranLike(TournamentType.INDIVIDUAL, PointSystem.DEFAULT)).toBe(false);
    expect(isSchackfyranLike(TournamentType.ALLSVENSKAN, PointSystem.DEFAULT)).toBe(false);
    expect(isSchackfyranLike(TournamentType.SCHOOL_SM, PointSystem.POINT310)).toBe(false);
  });
});

describe('isLooseTeamTournament (regression)', () => {
  it('returns true only for TEAM_TEAMS (3)', () => {
    expect(isLooseTeamTournament(TeamTournamentPlayerListType.TEAM_TEAMS)).toBe(true);
  });

  it('returns false for other player-list types', () => {
    expect(isLooseTeamTournament(-1)).toBe(false); // pure individual
    expect(isLooseTeamTournament(TeamTournamentPlayerListType.REGISTRATION_TEAMS)).toBe(false);
    expect(isLooseTeamTournament(TeamTournamentPlayerListType.RATINGLIST_TEAMS)).toBe(false);
  });
});

describe('PairingSystem constants', () => {
  it('has expected numeric values', () => {
    expect(PairingSystem.BERGER).toBe(1);
    expect(PairingSystem.MONRAD).toBe(2);
    expect(PairingSystem.NORDIC).toBe(3);
    expect(PairingSystem.FIDE_SWISS).toBe(4);
    expect(PairingSystem.ARENA).toBe(5);
  });
});

describe('Schack4anTeamPointSystem constants', () => {
  it('has expected numeric values', () => {
    expect(Schack4anTeamPointSystem.S4_NORMALIZED).toBe(1);
    expect(Schack4anTeamPointSystem.NORMAL).toBe(-1);
    expect(Schack4anTeamPointSystem.LEGACY_DEFAULT).toBe(10);
  });
});
