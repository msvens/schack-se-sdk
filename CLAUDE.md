# Project Context

TypeScript SDK for the Swedish Chess Federation (schack.se) public API, plus FIDE
player data via the ChessTools API. Typed service wrappers + chess utilities.
Consumed via git tag, not npm. Full usage docs: README.md. Release: RELEASE.md.

# Commands

- Check (CI gate — run before committing): `pnpm check`  # typecheck + test + build
- Test: `pnpm test` (Vitest) · Build: `pnpm build` · Typecheck: `pnpm typecheck`
- Release (tag-only): `pnpm release X.Y.Z`
- API spec drift: `pnpm api:check`

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
- Tests live in `__tests__/` (Vitest).
- Feature PRs: don't bump `package.json` version; add notes under `## Unreleased`
  in CHANGELOG.md. Releasing is git-tag only — never tag a merge commit; use
  `pnpm release` (see RELEASE.md).

# Behavior Rules

- Ask before assuming when requirements are ambiguous
- Write minimum code to solve the stated problem — no preemptive abstraction
- Only modify files and functions directly involved in the current task
- Say "I'm not sure" when uncertain rather than confabulating
