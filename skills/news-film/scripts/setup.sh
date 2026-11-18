#!/bin/sh
# Install the engine's dependencies once: playwright-core and its headless Chrome, and a Python venv for the mix.
#   sh <skill>/scripts/setup.sh           install (re-running is safe: it skips what is already there)
#   sh <skill>/scripts/setup.sh --check   only list what is missing
set -e
E=$(cd "$(dirname "$0")/../engine" && pwd); cd "$E"
miss=""
for t in node npm ffmpeg ffprobe python3 curl; do command -v "$t" >/dev/null || miss="$miss $t"; done
[ -z "$miss" ] || { echo "✗ missing system tools:$miss (install them, then run this again)"; exit 1; }
node -e 'process.exit(+process.versions.node.split(".")[0] >= 20 ? 0 : 1)' || { echo "✗ Node 20+ is needed"; exit 1; }
if [ "$1" = --check ]; then
  ok=1
  [ -d node_modules/playwright-core ] || { echo "missing: npm packages"; ok=0; }
  [ -x .venv/bin/python ] || { echo "missing: Python venv"; ok=0; }
  [ $ok = 1 ] && echo "✓ engine ready: $E"
  exit 0
fi
[ -d node_modules/playwright-core ] || npm install --no-audit --no-fund --silent
node node_modules/playwright-core/cli.js install chromium-headless-shell
if [ ! -x .venv/bin/python ]; then
  if command -v uv >/dev/null; then uv venv --quiet --python 3.12 .venv; else python3 -m venv .venv; fi
fi
if command -v uv >/dev/null; then uv pip install --quiet --python .venv/bin/python -r requirements.txt
else .venv/bin/python -m pip install --quiet --disable-pip-version-check -r requirements.txt; fi
echo "✓ engine ready: $E"
echo "  the score's sample libraries download on first use (VSCO 2 CE ~414 MB, VCSL ~285 MB, both CC0)"
