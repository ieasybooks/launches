#!/bin/bash
# Render, mix and finalize the film: scripts/render_all.sh [en] [ar]   (default: both)
# Each language renders 16:9 (1920×1080), 9:16 (1080×1920) and 4:5 (1080×1350) at 60 fps; SHAPES="9x16" limits it.
set -euo pipefail
cd "$(dirname "$0")/.."
LANGS=("$@"); [ ${#LANGS[@]} -eq 0 ] && LANGS=(en ar)
CONC=${CONCURRENCY:-4}
# Remotion's bundle and frames, and Chrome's shared memory, go to the temp directory. /tmp here is a RAM disk with a
# per-user quota: when it filled, every tab crashed ("ran out of memory or disk space"). Use the main disk instead.
export TMPDIR=${RENDER_TMPDIR:-$HOME/.cache/musicless-render-tmp}
mkdir -p "$TMPDIR"
mkdir -p out/final
./scripts/extract_frames.sh
for lang in "${LANGS[@]}"; do
  title="Musicless — Removes most of the music. Keeps the voices."; code=eng
  [ "$lang" = ar ] && { title="بلا موسيقى — تُزيل معظم الموسيقى. وتُبقي الأصوات البشرية."; code=ara; }
  node scripts/measure.mjs "$lang"
  uv run -q --with numpy python -I scripts/mix_audio.py "$lang" "out/final/mix-$lang.wav"
  for shape in ${SHAPES:-16x9 9x16 4x5}; do
    # four 1080-wide tall tabs ran Chrome out of memory on this machine: the narrow frames default to two workers
    conc=$CONC; [ "$shape" != 16x9 ] && [ -z "${CONCURRENCY:-}" ] && conc=2
    node scripts/render.mjs "Musicless-$lang-$shape" "out/video-$lang-$shape.mp4" --muted --crf=17 --concurrency="$conc" --chunk=12
    python3 scripts/finalize.py "out/video-$lang-$shape.mp4" "out/final/musicless-launch-$lang-$shape.mp4" "$title" "out/final/mix-$lang.wav" "$code"
  done
done
