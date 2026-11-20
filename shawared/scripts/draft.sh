#!/bin/bash
# Half-size drafts with the mixed sound, for review: scripts/draft.sh [ar|en …]  → out/draft/<lang>-<shape>.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
export TMPDIR=${RENDER_TMPDIR:-$HOME/.cache/shawared-render-tmp}
mkdir -p "$TMPDIR" out/draft out/final
LANGS=("$@"); [ ${#LANGS[@]} -eq 0 ] && LANGS=(ar en)
for lang in "${LANGS[@]}"; do
  node scripts/measure.mjs "$lang" > /dev/null
  uv run -q --with numpy python -I scripts/mix_audio.py "$lang" "out/final/mix-$lang.wav"
  for shape in ${SHAPES:-9x16 4x5 16x9}; do
    node scripts/render.mjs "Shawared-$lang-$shape" "out/draft/raw-$lang-$shape.mp4" --muted --scale=0.5 --crf=22 --concurrency=5 --chunk=30 | tail -1
    python3 scripts/finalize.py "out/draft/raw-$lang-$shape.mp4" "out/draft/$lang-$shape.mp4" "draft" "out/final/mix-$lang.wav" "$([ "$lang" = ar ] && echo ara || echo eng)" | tail -1
  done
done
