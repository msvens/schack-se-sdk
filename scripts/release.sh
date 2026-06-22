#!/usr/bin/env bash
# Cut a release: bump version, promote CHANGELOG, commit, tag.
# Does NOT push — prints the push command for the user to run.
#
# Usage: pnpm release X.Y.Z

set -euo pipefail

# ---------- 1. Validate args ----------
if [ $# -ne 1 ]; then
  echo "Usage: pnpm release X.Y.Z" >&2
  exit 1
fi

VERSION="$1"
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "ERROR: '$VERSION' is not semver (expected X.Y.Z)" >&2
  exit 1
fi

TAG="v$VERSION"
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# ---------- 2. Pre-flight git checks ----------
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "main" ]; then
  echo "ERROR: must run on 'main' (currently on '$BRANCH')" >&2
  exit 1
fi

if ! git diff-index --quiet HEAD --; then
  echo "ERROR: working tree not clean — commit or stash changes first" >&2
  exit 1
fi

echo "Fetching origin..."
git fetch origin main --tags

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse origin/main)"
if [ "$LOCAL" != "$REMOTE" ]; then
  echo "ERROR: local main ($LOCAL) is not in sync with origin/main ($REMOTE)" >&2
  echo "       Pull or push first." >&2
  exit 1
fi

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "ERROR: tag $TAG already exists locally" >&2
  exit 1
fi

if git ls-remote --tags origin "refs/tags/$TAG" | grep -q "$TAG"; then
  echo "ERROR: tag $TAG already exists on origin" >&2
  exit 1
fi

# ---------- 3. Run pnpm check (typecheck + test + build) ----------
echo ""
echo "Running pnpm check (typecheck + test + build)..."
if ! pnpm check; then
  echo "ERROR: pnpm check failed — fix before releasing" >&2
  exit 1
fi

# ---------- 4. Bump package.json version ----------
echo ""
echo "Bumping package.json version to $VERSION..."
node -e "
  const fs = require('fs');
  const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  p.version = '$VERSION';
  fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
"

# ---------- 5. Promote CHANGELOG ## Unreleased -> ## X.Y.Z ----------
CHANGELOG="CHANGELOG.md"
if [ ! -f "$CHANGELOG" ]; then
  echo "ERROR: $CHANGELOG not found" >&2
  exit 1
fi

if grep -qE '^## Unreleased\b' "$CHANGELOG"; then
  echo "Promoting CHANGELOG '## Unreleased' to '## $VERSION'..."
  # In-place rename of the first matching line. Use a temp file for portability across BSD/GNU sed.
  awk -v v="$VERSION" '
    !done && /^## Unreleased[[:space:]]*$/ { print "## " v; done=1; next }
    { print }
  ' "$CHANGELOG" > "$CHANGELOG.tmp"
  mv "$CHANGELOG.tmp" "$CHANGELOG"
else
  echo "WARNING: no '## Unreleased' section in $CHANGELOG."
  echo "         Opening \$EDITOR (${EDITOR:-vi}) so you can add a '## $VERSION' entry manually."
  echo "         Save and exit when done."
  read -r -p "Press Enter to open editor..." _
  "${EDITOR:-vi}" "$CHANGELOG"
fi

# ---------- 6. Commit ----------
echo ""
echo "Committing as 'Release $VERSION'..."
git add package.json "$CHANGELOG"
git commit -m "Release $VERSION"

# ---------- 7. Tag ----------
echo "Tagging $TAG..."
git tag "$TAG"

# ---------- 8. Done — print push command, do NOT auto-push ----------
echo ""
echo "----------------------------------------"
echo "Release $VERSION prepared."
echo ""
echo "Review:"
echo "  git show HEAD"
echo "  git show $TAG"
echo ""
echo "Push with:"
echo "  git push origin main $TAG"
echo "----------------------------------------"
