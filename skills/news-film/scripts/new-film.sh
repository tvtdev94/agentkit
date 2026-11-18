#!/bin/sh
# Start a film project from one of the examples:
#   sh <skill>/scripts/new-film.sh <landscape|vertical> <project-dir>
# Copies the example's code (no photos, fonts or renders) and pins build.sh to this skill's engine.
set -e
K=$(cd "$(dirname "$0")/.." && pwd); EX=$1; DST=$2
[ -n "$EX" ] && [ -n "$DST" ] || { echo "usage: sh $0 <landscape|vertical> <project-dir>"; exit 2; }
[ -d "$K/examples/$EX" ] || { echo "no example \"$EX\" (landscape, vertical)"; exit 2; }
if [ -e "$DST" ] && [ -n "$(ls -A "$DST" 2>/dev/null)" ]; then echo "$DST exists and is not empty"; exit 2; fi
mkdir -p "$DST"
for f in main.js index.html mix.py build.sh TREATMENT.md FACTS.md CREDITS tools; do cp -R "$K/examples/$EX/$f" "$DST/"; done
sed "s|^LIB=.*|LIB=\${NEWS_FILM_ENGINE:-$K/engine}|" "$K/examples/$EX/build.sh" > "$DST/build.sh"
echo "✓ $DST (from examples/$EX)"
echo "  rewrite for the new story: TREATMENT.md, FACTS.md, tools/fetch_photos.sh, main.js, mix.py, CREDITS"
