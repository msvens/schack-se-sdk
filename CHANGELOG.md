# Changelog

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
