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

## Feature PRs

When opening or merging a feature PR:

- **Do not bump `package.json` version.** Leave the version alone.
- **Do add CHANGELOG entries** under the `## Unreleased` heading at the top of `CHANGELOG.md`. Use whatever sub-sections make sense (`### Added`, `### Changed`, `### Fixed`, `### BREAKING`, etc.).

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
6. Commits the two files as `Release X.Y.Z`.
7. Creates a lightweight tag `vX.Y.Z`.
8. Prints the push command — **does not auto-push**.

Review the commit and tag (`git show HEAD`, `git show vX.Y.Z`), then push:

```bash
git push origin main vX.Y.Z
```

## What CI does

`.github/workflows/ci.yml` runs on pull requests against `main` and on tag pushes matching `v*`. The job runs typecheck + test + build. There is no npm publish step and no GitHub Release creation step.

## Cautionary tale: `v0.6.0`

Tagging the PR merge commit for `v0.6.0` broke sthlmschack CI because pacote couldn't fetch a tarball for a merge commit and tried to fall back to `git+ssh://git@github.com:msvens/schack-se-sdk.git#<sha>` — which fails on CI runners without SSH keys. The fix was to bump to `v0.6.1` from a dedicated `Release 0.6.1` commit (single-parent, lands the codeload tarball), delete the broken `v0.6.0` tag, and have consumers point at `v0.6.1` instead.

If you ever find yourself about to `git tag vX.Y.Z <merge-commit-sha>` — stop, run `pnpm release X.Y.Z` instead.
