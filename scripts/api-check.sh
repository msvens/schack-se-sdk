#!/usr/bin/env bash
# Compare stored API specs against live upstream versions.
# Exit code 0 = no changes, 1 = changes detected, 2 = error.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SPECS_DIR="$SCRIPT_DIR/../api-specs"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

SSF_URL="https://member.schack.se/memdb/v3/api-docs"
CHESSTOOLS_URL="https://api.chesstools.org/openapi.json"

changed=0

echo "Checking SSF API spec..."
if curl -sf "$SSF_URL" | python3 -c "import json,sys; json.dump(json.load(sys.stdin), sys.stdout, indent=2, ensure_ascii=False); print()" > "$TMP_DIR/ssf-api.json" 2>/dev/null; then
  if ! diff -q "$SPECS_DIR/ssf-api.json" "$TMP_DIR/ssf-api.json" > /dev/null 2>&1; then
    echo "  CHANGED - SSF API spec differs from stored version"
    ssf_diff=$(diff --unified=3 "$SPECS_DIR/ssf-api.json" "$TMP_DIR/ssf-api.json" || true)
    ssf_hunks=$(echo "$ssf_diff" | grep -c '^@@' || true)
    ssf_adds=$(echo "$ssf_diff" | grep -cE '^\+[^+]' || true)
    ssf_dels=$(echo "$ssf_diff" | grep -cE '^-[^-]' || true)
    echo "  Summary: ${ssf_hunks} hunks, +${ssf_adds}/-${ssf_dels} lines"
    echo "$ssf_diff"
    changed=1
  else
    echo "  OK - no changes"
  fi
else
  echo "  ERROR - failed to fetch SSF API spec"
  exit 2
fi

echo ""
echo "Checking ChessTools API spec..."
if curl -sf "$CHESSTOOLS_URL" | python3 -c "import json,sys; json.dump(json.load(sys.stdin), sys.stdout, indent=2, ensure_ascii=False); print()" > "$TMP_DIR/chesstools-api.json" 2>/dev/null; then
  if ! diff -q "$SPECS_DIR/chesstools-api.json" "$TMP_DIR/chesstools-api.json" > /dev/null 2>&1; then
    echo "  CHANGED - ChessTools API spec differs from stored version"
    ct_diff=$(diff --unified=3 "$SPECS_DIR/chesstools-api.json" "$TMP_DIR/chesstools-api.json" || true)
    ct_hunks=$(echo "$ct_diff" | grep -c '^@@' || true)
    ct_adds=$(echo "$ct_diff" | grep -cE '^\+[^+]' || true)
    ct_dels=$(echo "$ct_diff" | grep -cE '^-[^-]' || true)
    echo "  Summary: ${ct_hunks} hunks, +${ct_adds}/-${ct_dels} lines"
    echo "$ct_diff"
    changed=1
  else
    echo "  OK - no changes"
  fi
else
  echo "  ERROR - failed to fetch ChessTools API spec"
  exit 2
fi

echo ""
if [ $changed -eq 1 ]; then
  echo "API changes detected. Run 'pnpm api:update' to update stored specs."
  exit 1
else
  echo "All API specs are up to date."
fi
