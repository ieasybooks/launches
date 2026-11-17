#!/bin/bash
# Extract the footage's first 40 s as JPEG frames (30 fps, half the published 60) for the player:
# public/media/clip-<lang>/0001.jpg … The English and Arabic uploads of "The Largest Star in the Universe" share one
# picture, but the Arabic one has its labels in Arabic, so each film gets its own set. The film shows them as stills,
# frame by frame, which is lighter and steadier to render than decoding video.
set -euo pipefail
cd "$(dirname "$0")/.."
for lang in en ar; do
  out=public/media/clip-$lang
  [ -f "$out/1200.jpg" ] && continue
  mkdir -p "$out"
  ffmpeg -v error -y -i "footage/largest-star-$lang.mp4" -t 40 -vf fps=30 -q:v 3 "$out/%04d.jpg"
  echo "extracted $(ls "$out" | wc -l) frames into $out"
done
