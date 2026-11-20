#!/bin/bash
# Render, mix and finalize the film: scripts/render_all.sh [en] [ar]   (default: both)
# Each language renders 9:16 (1080×1920), 4:5 (1080×1350) and 16:9 (1920×1080) at 60 fps; SHAPES="9x16" limits it.
set -euo pipefail
cd "$(dirname "$0")/.."
LANGS=("$@"); [ ${#LANGS[@]} -eq 0 ] && LANGS=(en ar)
CONC=${CONCURRENCY:-4}
# Remotion's bundle and frames, and Chrome's shared memory, go to the temp directory. /tmp here is a RAM disk with a
# per-user quota: when it filled, every tab crashed ("ran out of memory or disk space"). Use the main disk instead.
export TMPDIR=${RENDER_TMPDIR:-$HOME/.cache/shawared-render-tmp}
mkdir -p "$TMPDIR"
mkdir -p out/final
for lang in "${LANGS[@]}"; do
  title="Shawared — Arabic poetry, as it's recited"; code=eng
  [ "$lang" = ar ] && { title="شوارد — الشعر العربي كما يُلقى"; code=ara; }
  node scripts/measure.mjs "$lang"
  uv run -q --with numpy python -I scripts/mix_audio.py "$lang" "out/final/mix-$lang.wav"
  for shape in ${SHAPES:-9x16 4x5 16x9}; do
    # four 1080-wide tall tabs ran Chrome out of memory on this machine: the narrow frames default to two workers
    conc=$CONC; [ -z "${CONCURRENCY:-}" ] && conc=3
    node scripts/render.mjs "Shawared-$lang-$shape" "out/video-$lang-$shape.mp4" --muted --crf=17 --concurrency="$conc" --chunk=12
    python3 scripts/finalize.py "out/video-$lang-$shape.mp4" "out/final/shawared-launch-$lang-$shape.mp4" "$title" "out/final/mix-$lang.wav" "$code"
  done
done
