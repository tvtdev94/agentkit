#!/bin/sh
# Thế Giới 24 · Vua Charles III tại CHOGM — rebuild the film from source: sh <this folder>/build.sh (from any directory)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${NEWS_FILM_ENGINE:-$(cd "$HERE/../../engine" && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set NEWS_FILM_ENGINE to the news-film skill's engine folder"; exit 1; }
PY="$LIB/.venv/bin/python"
cd "$LIB"
"$PY" core/audio/sampler.py --need "$HERE/mix.py"
# 1. fonts (OFL subsets) and the coastline (Natural Earth 10m land, cropped; no borders)
sh "$HERE/tools/fonts.sh"
if [ ! -s "$HERE/assets/land.json" ]; then
  mkdir -p "$HERE/raw"
  [ -s "$HERE/raw/ne_10m_land.geojson" ] || curl -fsSL -o "$HERE/raw/ne_10m_land.geojson" https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson
  python3 -I "$HERE/tools/crop_land.py" "$HERE/raw/ne_10m_land.geojson" "$HERE/assets/land.json"
fi
# photos: Wikimedia Commons (licences in SOURCES.md), graded to the package duotone
sh "$HERE/tools/fetch_photos.sh"
"$PY" "$HERE/tools/prep_photos.py"
# 2. reading check, events, score and foley
node core/render/readcheck.mjs "$HERE"
node core/render/events.mjs "$HERE"
"$PY" "$HERE/mix.py"
# 3. picture, then master at −14 LUFS (no grain: flat graphics)
# One worker: with several workers in one video.mjs, some workers kept old pixels for a second or more (the new shot's
# strap over the old picture); one worker per process matched every still. The video is still compared with stills.
rm -rf "$HERE/out/verify"; node core/render/still.mjs "$HERE" --range 0:63:0.5 --out "$HERE/out/verify" --prefix v_ > /dev/null
for try in 1 2 3; do
  node core/render/video.mjs "$HERE" --fps 24 --workers 1 --out "$HERE/out/video.mp4"
  "$PY" "$HERE/tools/verify_frames.py" "$HERE/out/video.mp4" "$HERE/out/verify" && break
  [ "$try" = 3 ] && { echo "frames still differ from the stills after 3 renders"; exit 1; }
done
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/royal-news.mp4" 24 0
node core/render/still.mjs "$HERE" 13.5 --out "$HERE/out/still" --prefix po_ && cp "$HERE/out/still/po_13.5.jpg" "$HERE/poster.jpg"
