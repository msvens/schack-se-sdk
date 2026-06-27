# Changelog

## Unreleased

### Added

- `ResultsService.getRoundStandings(groupId)` / `getRoundStandings(groupId, round)` — a best-effort "playback" of how a tournament's standings evolved, returning one snapshot per round (or a single round's). Give it a group ID and nothing else: it derives team-vs-individual from the tournament (`isTeamPairing(type)`, which selects the round-results endpoint) and, for individual events, the secondary metric from the group's `pairingSystemMember` — Sonneborn-Berger for Berger/round-robin (Buchholz is FIDE-invalid there), Buchholz otherwise. No options, no caller-supplied mode. Cumulative primary values reproduce the official column exactly; **team** standings match the official table exactly (match points → board points, verified against live data), while **individual** quality points are *indicative* (see caveat). Each `RoundStandingRow` has `rank`, `points`, `wins`/`draws`/`losses`, `gamesPlayed`; individual rows add `qualityPoints`, team rows add `matchPoints` and `teamNumber`.
- `RoundStandings`, `RoundStandingRow` types.
- `TiebreakSystem` constants (`UNSET` -1, `SSF_BERGER` 1, `BUCHHOLZ` 2, `SSF_BUCHHOLZ` 3, `MEDIAN_BUCHHOLZ` 4, `PROGRESSIVE` 5, `ALLSVENSKAN` 6, `FIDE_BUCHHOLZ_2024` 7) and `getTiebreakSystemName()` for decoding `TournamentClassGroupDto.tiebreakSystem`. `UNSET` (-1) marks imported legacy records whose pairing/ranking was handled outside the SSF member system. Reference/labeling only — the SDK intentionally does not implement the tie-break algorithms (per SSF guidance); the individual `qualityPoints` from `getRoundStandings` are plain Buchholz/Sonneborn-Berger and authoritative only when the group actually uses that metric.
- Caveats: **team** standings reproduce the official table exactly (match points then board points — both keys verified against live data). **Individual** primary points are exact, but the secondary (quality points) is *indicative*: the official per-group method is selected by `TournamentClassGroupDto.tiebreakSystem` (see `TiebreakSystem`), and the SDK does not implement the variants (SSF Buchholz, Median, FIDE Buchholz 2024, …), so a group using one may order point-ties differently than Buchholz/Sonneborn-Berger. Byes/walkovers credit points but add no secondary contribution and are excluded from W/D/L.

## 0.7.0

### Added

- `getTournamentStatus(source, now?)` — derives a trustworthy lifecycle status (`'upcoming' | 'ongoing' | 'finished' | 'unknown'`) for a tournament or group, working around the unreliable `TournamentDto.state` field (organizers frequently leave it stale). Pass a bare `TournamentDto` or a `{ tournament?, group?, roundResults? }` bag; derivation is date-first, group dates take precedence over tournament dates, and a non-empty `roundResults` array proves the event has started. `now` is injectable for tests/SSR.
- `isUpcoming` / `isOngoing` / `isFinished` — convenience predicates over `getTournamentStatus`.
- `TournamentStatus` and `TournamentStatusSource` types.

## 0.6.1

Republish from a non-merge commit to work around pnpm/pacote falling back to git-clone instead of the codeload tarball when the tag points at a merge commit. No code changes vs 0.6.0.

## 0.6.0

### BREAKING

- `isTeamTournament(type)` now returns `true` for Schackfyran (`type === 9`) in addition to Allsvenskan / Svenska Cupen / Yes2Chess. The predicate now answers the *identity* question ("is this fundamentally a team tournament?") rather than the previous *pairing-level* question. If you were using it specifically to detect team-vs-team pairings, switch to the new `isTeamPairing(type)` — that preserves the previous `{2, 6, 8}` set.

### Added

- `isTeamPairing(type)` — returns `true` for `{ALLSVENSKAN, SVENSKA_CUPEN, YES2CHESS}`. The lottning predicate; Schackfyran returns `false` here because pairings are individual.
- `isSchackfyran(type)` — convenience predicate for `type === 9`. Carries the privacy-commitment guidance in its JSDoc so it surfaces at every call site.
- `isSchackfyranLike(type, groupPointSystem)` — pragmatic fallback that also returns `true` when a group uses Schack4an scoring even if the tournament type is something other than `SCHACKFYRAN`. Useful for catching misclassified tournaments.
- `PairingSystem` constants (`BERGER`, `MONRAD`, `NORDIC`, `FIDE_SWISS`, `ARENA`) for decoding `TournamentClassGroupDto.pairingSystemMember`.
- `Schack4anTeamPointSystem` constants (`S4_NORMALIZED`, `NORMAL`, `LEGACY_DEFAULT`). The underlying field is not yet exposed by the public API — these constants are defined in anticipation so consumers have stable names when upstream lands it.

### Docs

- New "Team Tournaments and Schackfyran" section in README covering the identity-vs-pairing distinction, TEAM-TEAM (loose) tournaments, the Schackfyran privacy commitment, and the deferred upstream-blocked items.
- JSDoc clarifications on `TournamentType.SCHACKFYRAN` (privacy commitment) and `TournamentType.SCHOOL_SM` (empirical caveat — `type === 5` is used for individual school championships in practice, not team Skol-SM events).
- JSDoc on `TournamentClassGroupDto.pointSystem` now links to the `PointSystem` constants and calls out the `SCHACK4AN` case.

## 0.5.0

- See git tag `v0.5.0` for prior release notes.
