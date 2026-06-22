/**
 * Unit tests for tournament status derivation.
 * Verifies the date-first logic that works around the unreliable API `state`.
 */

import {
  getTournamentStatus,
  isUpcoming,
  isOngoing,
  isFinished
} from '../../src/utils/tournamentStatus';
import { TournamentState } from '../../src/types';
import type { TournamentDto, TournamentClassGroupDto } from '../../src/types';

// Fixed reference "now": 2026-06-15 (local midnight handled inside the helper).
const NOW = new Date(2026, 5, 15);

// Minimal DTO builders — only the fields the helper reads matter.
const t = (over: Partial<TournamentDto>): TournamentDto =>
  ({ start: '', end: '', state: 0, ...over } as TournamentDto);
const g = (over: Partial<TournamentClassGroupDto>): TournamentClassGroupDto =>
  ({ start: '', end: '', ...over } as TournamentClassGroupDto);

describe('tournamentStatus', () => {
  describe('getTournamentStatus — core logic', () => {
    it('round results + past end → finished', () => {
      const status = getTournamentStatus(
        { tournament: t({ start: '2026-06-01', end: '2026-06-10', state: TournamentState.REGISTRATION }), roundResults: [{}] },
        NOW
      );
      expect(status).toBe('finished');
    });

    it('round results + not past end → ongoing', () => {
      const status = getTournamentStatus(
        { tournament: t({ start: '2026-06-10', end: '2026-06-20', state: TournamentState.REGISTRATION }), roundResults: [{}] },
        NOW
      );
      expect(status).toBe('ongoing');
    });

    it('past end with no results → finished even when state=REGISTRATION (the bug-fix case)', () => {
      const status = getTournamentStatus(
        t({ start: '2026-06-01', end: '2026-06-10', state: TournamentState.REGISTRATION }),
        NOW
      );
      expect(status).toBe('finished');
    });

    it('before start → upcoming', () => {
      expect(getTournamentStatus(t({ start: '2026-06-20', end: '2026-06-25', state: TournamentState.STARTED }), NOW)).toBe('upcoming');
    });

    it('in-window + state=REGISTRATION → upcoming', () => {
      expect(getTournamentStatus(t({ start: '2026-06-10', end: '2026-06-20', state: TournamentState.REGISTRATION }), NOW)).toBe('upcoming');
    });

    it('in-window otherwise → ongoing', () => {
      expect(getTournamentStatus(t({ start: '2026-06-10', end: '2026-06-20', state: TournamentState.STARTED }), NOW)).toBe('ongoing');
    });

    it('no dates + state=STARTED → ongoing', () => {
      expect(getTournamentStatus(t({ start: '', end: '', state: TournamentState.STARTED }), NOW)).toBe('ongoing');
    });

    it('no dates + state=FINISHED → finished', () => {
      expect(getTournamentStatus(t({ start: '', end: '', state: TournamentState.FINISHED }), NOW)).toBe('finished');
    });

    it('no dates + state=0 (search stub) → unknown', () => {
      expect(getTournamentStatus(t({ start: '', end: '', state: 0 }), NOW)).toBe('unknown');
    });
  });

  describe('getTournamentStatus — input shapes', () => {
    it('bare TournamentDto and { tournament } give the same result', () => {
      const dto = t({ start: '2026-06-10', end: '2026-06-20', state: TournamentState.STARTED });
      expect(getTournamentStatus(dto, NOW)).toBe(getTournamentStatus({ tournament: dto }, NOW));
    });

    it('group dates take precedence over tournament dates', () => {
      // Tournament dates say finished; group dates say upcoming → group wins.
      const status = getTournamentStatus(
        {
          tournament: t({ start: '2026-05-01', end: '2026-05-10', state: TournamentState.REGISTRATION }),
          group: g({ start: '2026-06-20', end: '2026-06-25' })
        },
        NOW
      );
      expect(status).toBe('upcoming');
    });

    it('empty roundResults array is treated as "no results"', () => {
      // With non-empty results this would be ongoing; empty → falls through to the REGISTRATION hint.
      const status = getTournamentStatus(
        { tournament: t({ start: '2026-06-10', end: '2026-06-20', state: TournamentState.REGISTRATION }), roundResults: [] },
        NOW
      );
      expect(status).toBe('upcoming');
    });

    it('returns unknown (never throws) when nothing usable is supplied', () => {
      // Plain-JS callers can bypass the type guard.
      expect(getTournamentStatus(undefined as never, NOW)).toBe('unknown');
      expect(getTournamentStatus({} as never, NOW)).toBe('unknown');
    });
  });

  describe('predicates agree with the core', () => {
    const upcoming = t({ start: '2026-06-20', end: '2026-06-25', state: TournamentState.STARTED });
    const ongoing = t({ start: '2026-06-10', end: '2026-06-20', state: TournamentState.STARTED });
    const finished = t({ start: '2026-06-01', end: '2026-06-10', state: TournamentState.REGISTRATION });

    it('isUpcoming', () => {
      expect(isUpcoming(upcoming, NOW)).toBe(true);
      expect(isUpcoming(ongoing, NOW)).toBe(false);
    });

    it('isOngoing', () => {
      expect(isOngoing(ongoing, NOW)).toBe(true);
      expect(isOngoing(finished, NOW)).toBe(false);
    });

    it('isFinished', () => {
      expect(isFinished(finished, NOW)).toBe(true);
      expect(isFinished(upcoming, NOW)).toBe(false);
    });
  });
});
