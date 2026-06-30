# Changelog

## Unreleased

### Added

- **Team standings now reproduce the full board-by-board tie-break (TB §11.3).** Teams tied on both match points and total board points are no longer left in stable order — `getRoundStandings` now applies the official chain: **inbördes möte (direct encounter) → board points on the first half of the boards → each remaining board individually** (the last board is decided by lots and not reproducible). The head-to-head mini-table is recomputed over each still-tied sub-pool, so multi-way ties (e.g. a three-way head-to-head cycle) resolve correctly. Per-board points are attributed from each match's individual games and validated against the match's board totals as a checksum; the colour convention (home plays White on odd boards) is derived once per group from its decisive matches. Validated against a live corpus of 90 team groups: every modern Allsvenskan event reproduces the official order position-for-position, so groups that were previously downgraded to `estimated` for an unbreakable match+board tie now stay `secondaryBasis: 'exact'`. Legacy events the chain can't reproduce (externally-managed pairing / incomplete board data) are still honestly downgraded by self-verification.

## 0.11.1

### Changed

- **Team standings now self-verify too.** They were always labelled `secondaryBasis: 'exact'` / `estimated: false` on the assumption that match points → board points are structurally the official numbers. That holds for clean modern events, but not for legacy ones with incomplete round data or an older match-point system (e.g. Stockholmsserien 2011/12 scored a win as 1, not 2). `getRoundStandings` now checks the team order against the official table and, when it doesn't match, honestly downgrades the group to `estimated: true` (`secondaryBasis: 'indicative'`) instead of over-claiming `exact`. Clean team events are unaffected (still `exact`). Known limitation: teams tied on *both* match points and board points are ordered by our stable order, not the official board-by-board tie-break (TB §11.3) — those rare cases are flagged `estimated`.

## 0.11.0

### Added

- **Round-robin (Berger) groups now reproduce the official tie-break order**, instead of an indicative Sonneborn-Berger. `getRoundStandings` ranks them by the full SSF order (TB §7.2.1): **inbördes resultat (direct encounter) → Sonneborn-Berger → most wins → most games with black**. Because that leads with a *pairwise* head-to-head rule (not a single number), it uses a dedicated comparator. Validated against six live round-robin groups — all match the official place order position-for-position (vs Sonneborn-Berger alone, which mis-ordered the head-to-head ties). So round-robins now **self-verify to `estimated: false`** where before they stayed `estimated: true`. (`qualityPoints` still reports Sonneborn-Berger as the displayed value.)

### Changed

- Self-verification now flips **only the final/current round** to `verified` / `estimated: false`, not every snapshot. Intermediate rounds are reconstructions with no official table to check against, so they honestly keep `estimated: true` (the QP cut-1 and bye weighting differ round-to-round). Team standings are unaffected — they're `exact` at every round by construction.

## 0.10.0

### BREAKING

- `getRoundStandings(groupId, round)` (the single-round overload) is removed; `getRoundStandings(groupId)` always returns every round's snapshot. For a single round use `result.data?.find(s => s.round === n)`. The method already computed all rounds (and now always fetches the official table to self-verify), so the overload saved nothing.

### Added

- `getRoundStandings` now **self-verifies**: it fetches the official table once and checks whether our reconstructed final-round ordering matches the official `place` order. When it does, the snapshots flip from an estimate to `secondaryBasis: 'verified'` / `estimated: false` — so the flag reflects whether we *actually* matched reality, not a hardcoded assumption, and it adapts automatically if SSF changes a tie-break method over time. Pure upgrade (never downgrades); best-effort (a missing official table leaves the static basis); the extra fetch is skipped when nothing is flagged as an estimate (e.g. team standings, already `exact`). New `SecondaryBasis` value `'verified'`. Note: today this rarely upgrades individual SSF Buchholz, because most groups have players tied on every criterion we compute (cut-1, wins, games-with-black) whom the official table separates only by **drawing of lots** (per the SSF tie-break rules — see README) — i.e. there is genuinely nothing left to reproduce, so we honestly keep `estimated: true`.

### Docs

- README links the official SSF tie-break rules (Tävlingsbestämmelser 2025/26). Those rules confirm the implemented individual formula: `kvalitetspoäng` = Buchholz **Cut-1**, then most wins, then most games with black, then **lots**. (We tried the rulebook's exact fictive-opponent bye rule from §7.2.2; it matched the *stored* tables worse than the simpler approximation, since stored tables vary by era — so byes keep the simpler rule, with self-verification flagging any mismatch.)

## 0.9.1

### Added

- `RoundStandings` now carries `estimated: boolean` and `secondaryBasis: 'exact' | 'official' | 'reproduced' | 'indicative'`. The SDK owns the "is this exact or an estimate?" decision so consumers never reason about tie-break systems: read `snapshot.estimated` to decide whether to show an "estimated standings" note/badge. Derived per group from the system and the data (not from team-vs-individual): team standings are `exact` (`estimated: false`); individual SSF Buchholz is `reproduced` (`estimated: true`, reverse-engineered / pending SSF confirmation); other individual systems are `indicative` (`estimated: true`). A clean round-robin of a confirmed system would become `official` (`estimated: false`) — the round-robin advantage falls out of an unplayed-rounds check, and the "confirmed" set is empty until SSF blesses a system. New exported type `SecondaryBasis`.

## 0.9.0

### Added

- `getRoundStandings` now reproduces the **official `secPoints`** for individual groups using **SSF Buchholz** (`tiebreakSystem === 3`, the common Swiss tie-break): `qualityPoints` becomes `base + wins·0.01 + gamesWithBlack·0.0001`, where `base` is Buchholz-Cut-1, or plain Buchholz when the player has a bye/walkover (the FIDE Art 16.5.1 virtual-opponent rule — the cut is spent on the dummy). Reverse-engineered from live data and validated against two groups: 15816 (2025, 64 players) to within 9.8e-6 with 62/64 ordering, and group 6072 (Linköpingsmästerskapen 2016, SSF's reference torture set with byes) where all 37 players — including all 6 with byes — match the official `secPoints` (that older event returns it rounded to ~0.1). The only residual is a not-yet-decoded sub-1e-5 packed field that separates the very deepest ties. For all other systems the secondary stays the indicative Buchholz/Sonneborn-Berger as before. No public API change.
- Internal `src/utils/tiebreaks.ts`: FIDE base methods (`buchholz`, `buchholzCut1`, `medianBuchholz`, `sonnebornBerger`, each cited to its handbook article) as a clean layer, plus the reverse-engineered SSF decimal-packing layer (`computeSsfSecPoints`) on top — kept separable so a pure-FIDE implementation remains a drop-in alternative.

### Notes

- The SSF packing is reverse-engineered (SSF/Lotta output, not the FIDE spec) and **pending confirmation from SSF**. Once the formula stabilizes across more systems, hand it to SSF to confirm/refute and request the Linköping 2016 autotest dataset.

## 0.8.0

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
