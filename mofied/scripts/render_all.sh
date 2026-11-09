#!/bin/bash
# Render, mix and finalize the film: scripts/render_all.sh [ar] [en]   (default: both)
# Each language renders 1920×1080 and 1080×1920 at 60 fps.
set -euo pipefail
cd "$(dirname "$0")/.."
LANGS=("$@"); [ ${#LANGS[@]} -eq 0 ] && LANGS=(ar en)
CONC=${CONCURRENCY:-6}
mkdir -p out/final
for lang in "${LANGS[@]}"; do
  title="مفيد — شاهد ما يبقى معك"; code=ara; [ "$lang" = en ] && { title="Mofied — Watch what stays with you"; code=eng; }
  node scripts/measure.mjs "$lang"
  python3 scripts/mix_audio.py "$lang" "out/final/mix-$lang.wav"
  for shape in 16x9 9x16; do
    node scripts/render.mjs "Mofied-$lang-$shape" "out/video-$lang-$shape.mp4" --muted --crf=17 --concurrency="$CONC"
    python3 scripts/finalize.py "out/video-$lang-$shape.mp4" "out/final/mofied-launch-$lang-$shape.mp4" "$title" "out/final/mix-$lang.wav" "$code"
  done
done
