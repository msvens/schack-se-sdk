# Release Process

This package is **not** published to npm. Consumers depend on it directly via git URL — e.g.

```bash
pnpm add github:msvens/schack-se-sdk#v0.6.1
```

pnpm resolves the tag to a GitHub tarball under the hood.

## Critical rule: the release tag MUST point at a non-merge commit

pnpm/pacote's GitHub resolver only uses the fast codeload tarball (`codeload.github.com/.../tar.gz/<sha>`) when the tagged commit is single-parent. For merge commits it falls back to `git+ssh` clone, which breaks CI on any machine that doesn't have an SSH key registered with GitHub.

This is exactly what happened with `v0.6.0` — it was tagged on a PR merge commit, sthlmschack CI broke, and we had to re-cut `v0.6.1` from a dedicated `Release 0.6.1` commit. Don't repeat that.

The procedure below is structured so the tag always lands on a fresh, single-parent commit — regardless of how feature PRs were merged.

## Critical rule: `dist/` is committed, and there is no `prepare` script

Consumers install from a git URL, so pnpm would otherwise have to build the package
during their install. Since pnpm 10.26 that requires each consumer to allowlist this
package in `onlyBuiltDependencies` — and the matching rule changed in 10.34.2, so no
single entry works across pnpm versions. On pnpm 11 no working configuration exists
at all. See pnpm/pnpm#12856: package-name-only rules are registry-only by design and
deliberately do not approve git artifacts.

So `dist/` is checked in and the `prepare` script is deleted. pnpm decides a git
package "needs to execute build scripts" purely from whether `prepare` exists — it
runs it whether or not `dist/` is already present, so committing `dist/` while
keeping `prepare` would fix nothing. **The two go together: never re-add `prepare`.**

Consequences:

- `dist/` is generated output that lives in git. It changes **only in release
  commits** — `scripts/release.sh` rebuilds and stages it.
- Feature PRs do **not** rebuild or commit `dist/`. Leaving it stale on a branch is
  expected and invisible to consumers, who only ever install a tag.
- CI smoke-tests the committed `dist/` **on tag pushes only** — it loads both entry
  points and the `./corpus` subpath from the exact bytes the tag ships. It does
  *not* diff against a fresh build: esbuild orders chunk imports
  non-deterministically, so `dist/index.mjs` is not byte-reproducible and an exact
  comparison would fail releases at random. Don't "fix" that by disabling code
  splitting either — the entry points share one copy of `config.ts`, and
  unsplitting would give each subpath its own, silently breaking `configure()`.
  `scripts/release.sh` is the staleness guarantee: it always rebuilds and stages.
- Local `pnpm install` no longer builds. Run `pnpm build` once after cloning (or
  just `pnpm check`, which builds).

## Feature PRs

When opening or merging a feature PR:

- **Do not bump `package.json` version.** Leave the version alone.
- **Do add CHANGELOG entries** under the `## Unreleased` heading at the top of `CHANGELOG.md`. Use whatever sub-sections make sense (`### Added`, `### Changed`, `### Fixed`, `### BREAKING`, etc.).
- **Do not rebuild or commit `dist/`.** It is refreshed by the release commit; a PR that ships a rebuilt `dist/` just adds conflict-prone diff noise.

The version bump lives only in the release commit — that's what guarantees the release tag has a meaningful, single-parent commit to point at.

## Releasing

From a clean checkout of `main`:

```bash
pnpm release X.Y.Z
```

This runs `scripts/release.sh`, which:

1. Validates `X.Y.Z` is semver.
2. Pre-flight git checks:
   - on `main`
   - working tree clean
   - in sync with `origin/main`
   - tag `vX.Y.Z` doesn't already exist locally or on origin
3. Runs `pnpm check` (typecheck + test + build). Aborts if anything fails.
4. Bumps `package.json` version to `X.Y.Z`.
5. Promotes `## Unreleased` → `## X.Y.Z` in `CHANGELOG.md`. If no `## Unreleased` section exists, opens `$EDITOR` for you to add the entry manually.
6. Stages `dist/` (rebuilt by `pnpm check` in step 3) and commits it together with `package.json` and `CHANGELOG.md` as `Release X.Y.Z`, so the tag points at sources *and* their build output.
7. Creates a lightweight tag `vX.Y.Z`.
8. Prints the push command — **does not auto-push**.

Review the commit and tag (`git show HEAD`, `git show vX.Y.Z`), then push:

```bash
git push origin main vX.Y.Z
```

## What CI does

`.github/workflows/ci.yml` runs on pull requests against `main` and on tag pushes matching `v*`. The job runs typecheck + test + build. On tag pushes it additionally smoke-tests the committed `dist/` before building, so a tag cannot ship output that fails to load. There is no npm publish step and no GitHub Release creation step.

## Cautionary tale: `v0.6.0`

Tagging the PR merge commit for `v0.6.0` broke sthlmschack CI because pacote couldn't fetch a tarball for a merge commit and tried to fall back to `git+ssh://git@github.com:msvens/schack-se-sdk.git#<sha>` — which fails on CI runners without SSH keys. The fix was to bump to `v0.6.1` from a dedicated `Release 0.6.1` commit (single-parent, lands the codeload tarball), delete the broken `v0.6.0` tag, and have consumers point at `v0.6.1` instead.

If you ever find yourself about to `git tag vX.Y.Z <merge-commit-sha>` — stop, run `pnpm release X.Y.Z` instead.
