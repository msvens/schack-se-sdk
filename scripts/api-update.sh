#!/usr/bin/env bash
# Download and update stored API specs from upstream.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SPECS_DIR="$SCRIPT_DIR/../api-specs"

SSF_URL="https://member.schack.se/memdb/v3/api-docs"
CHESSTOOLS_URL="https://api.chesstools.org/openapi.json"

echo "Updating SSF API spec..."
if curl -sf "$SSF_URL" | python3 -c "import json,sys; json.dump(json.load(sys.stdin), sys.stdout, indent=2, ensure_ascii=False); print()" > "$SPECS_DIR/ssf-api.json"; then
  echo "  OK"
else
  echo "  ERROR - failed to fetch SSF API spec"
  exit 1
fi

echo "Updating ChessTools API spec..."
if curl -sf "$CHESSTOOLS_URL" | python3 -c "import json,sys; json.dump(json.load(sys.stdin), sys.stdout, indent=2, ensure_ascii=False); print()" > "$SPECS_DIR/chesstools-api.json"; then
  echo "  OK"
else
  echo "  ERROR - failed to fetch ChessTools API spec"
  exit 1
fi

echo ""
echo "API specs updated. Review changes with 'git diff api-specs/'."
