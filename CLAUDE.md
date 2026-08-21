# Project Context

TypeScript SDK for the Swedish Chess Federation (schack.se) public API, plus FIDE
player data via the ChessTools API. Typed service wrappers + chess utilities.
Consumed via git tag, not npm. Full usage docs: README.md. Release: RELEASE.md.

# Commands

- Check (CI gate — run before committing): `pnpm check`  # typecheck + test + build
- Test: `pnpm test` (Vitest; excludes the live FIDE suite) · Build: `pnpm build` · Typecheck: `pnpm typecheck`
- Pre-PR (run before opening a PR): `pnpm preflight`  # check + live FIDE integration; also reports ChessTools/FIDE status
- Live FIDE integration only: `pnpm test:integration`  # hits api.chesstools.org; skips cleanly if it's down
- Release (tag-only): `pnpm release X.Y.Z`
- API spec drift: `pnpm api:check`
- Test-data corpus drift (live, not in CI): `pnpm corpus:verify`  # checks src/corpus/ssf-corpus.json ids still resolve

# Conventions

- Spec-driven services: `src/services/` are 1:1 wrappers of documented endpoints in
  `api-specs/` (`ssf-api.json` = SSF, `chesstools-api.json` = FIDE/ChessTools;
  `pnpm api:check` flags drift). Don't wrap undocumented endpoints as spec'd
  services — if one is genuinely needed, keep it clearly separated.
- Aggregation / derived helpers are encouraged in `src/utils/` (composing spec'd
  endpoints), separate from the raw service wrappers.
- Named exports only (no default exports).
- Service methods return `ApiResponse<T>` (`{ data?, error?, status }`); callers
  check `response.data` / `response.error`.
- Tests live in `__tests__/` (Vitest). Most hit live APIs. Live suites self-skip
  when their host is unreachable (`__tests__/helpers/liveProbe.ts`), so an outage
  yellows the run instead of reding it; a real contract drift (host up, shape
  changed) still fails. The live FIDE suite (`*.integration.test.ts`) is excluded
  from `pnpm test`/PR CI and runs via `pnpm test:integration` (nightly workflow +
  on demand); the live SSF suites stay in `pnpm test`.
- Before opening a PR, run `pnpm preflight` — it runs the live FIDE integration
  suite for a final check and surfaces current ChessTools/FIDE server status.
  (Integration is intentionally *not* part of the per-commit `pnpm check`.)
- Feature PRs: don't bump `package.json` version; add notes under `## Unreleased`
  in CHANGELOG.md. Releasing is git-tag only — never tag a merge commit; use
  `pnpm release` (see RELEASE.md).
- **`dist/` is committed and there is no `prepare` script — never re-add one and
  never re-ignore `dist/`.** Consumers install from a git tag; a `prepare` script
  would force every one of them to allowlist this package in pnpm's
  `onlyBuiltDependencies`, which no single entry satisfies across pnpm versions
  and which has no working form at all on pnpm 11. pnpm gates on `prepare`
  *existing*, not on whether `dist/` is present, so the two go together. Don't
  "fix" the resulting build non-determinism by disabling tsup code splitting
  either — the entry points share one copy of `config.ts`, and unsplitting would
  give each subpath its own and silently break `configure()`. See RELEASE.md.
- Don't rebuild or commit `dist/` in a feature PR. `scripts/release.sh` refreshes
  and stages it in the release commit; CI smoke-tests it on tag pushes only.

# Behavior Rules

- Ask before assuming when requirements are ambiguous
- Write minimum code to solve the stated problem — no preemptive abstraction
- Only modify files and functions directly involved in the current task
- Say "I'm not sure" when uncertain rather than confabulating
