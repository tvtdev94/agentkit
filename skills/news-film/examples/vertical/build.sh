#!/bin/sh
# Thế Giới 24 · Vua Charles III tại CHOGM — vertical cuts for Reels and Shorts, rebuild from source: sh <this folder>/build.sh (from any directory)
# One page, two safe boxes (?cut=reels | ?cut=shorts): royal-news-reels.mp4 and royal-news-shorts.mp4, same score.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${NEWS_FILM_ENGINE:-$(cd "$HERE/../../engine" && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set NEWS_FILM_ENGINE to the news-film skill's engine folder"; exit 1; }
PY="$LIB/.venv/bin/python"
SZ="--size 1080x1920"
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
# 2. reading check for both safe boxes, events, score and foley
for c in reels shorts; do node core/render/readcheck.mjs "$HERE" $SZ --q "cut=$c"; done
node core/render/events.mjs "$HERE" $SZ
"$PY" "$HERE/mix.py"
DUR=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$HERE/events.json','utf8')).dur)")
# 3. picture per cut, then master at −14 LUFS. One worker: with several workers in one video.mjs, some workers kept old
#    pixels for a second or more (the new shot's strap over the old picture); one worker per process matched every still.
#    Each video is still compared with stills of the same times and rendered again on a mismatch.
for c in reels shorts; do
  rm -rf "$HERE/out/verify-$c"; node core/render/still.mjs "$HERE" --range 0:$DUR:0.5 $SZ --q "cut=$c" --out "$HERE/out/verify-$c" --prefix v_ > /dev/null
  for try in 1 2 3; do
    node core/render/video.mjs "$HERE" --fps 24 --workers 1 $SZ --q "cut=$c" --out "$HERE/out/video-$c.mp4"
    "$PY" "$HERE/tools/verify_frames.py" "$HERE/out/video-$c.mp4" "$HERE/out/verify-$c" && break
    [ "$try" = 3 ] && { echo "$c: frames still differ from the stills after 3 renders"; exit 1; }
  done
  sh core/render/mux.sh "$HERE/out/video-$c.mp4" "$HERE/out/mix.wav" "$HERE/royal-news-$c.mp4" 24 0
done
node core/render/still.mjs "$HERE" 20.5 $SZ --out "$HERE/out/still" --prefix po_ && cp "$HERE/out/still/po_20.5.jpg" "$HERE/poster.jpg"
