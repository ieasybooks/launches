#!/bin/bash
# Render, mix and finalize the film: scripts/render_all.sh [en] [ar]   (default: both)
# Each language renders 9:16 (1080×1920) and 4:5 (1080×1350) at 60 fps; SHAPES="9x16" picks one.
set -euo pipefail
cd "$(dirname "$0")/.."
LANGS=("$@"); [ ${#LANGS[@]} -eq 0 ] && LANGS=(en ar)
CONC=${CONCURRENCY:-2}
# Remotion's bundle and frames, and Chrome's shared memory, go to the temp directory. /tmp here is a RAM disk with a
# per-user quota: when it filled, every tab crashed ("ran out of memory or disk space"). Use the main disk instead.
export TMPDIR=${RENDER_TMPDIR:-$HOME/.cache/musicless-render-tmp}
mkdir -p "$TMPDIR" out/final
for lang in "${LANGS[@]}"; do
  title="Musicless — Remove music from your audio files"; code=eng
  [ "$lang" = ar ] && { title="بلا موسيقى — أزل الموسيقى من ملفاتك الصوتية"; code=ara; }
  node scripts/measure.mjs "$lang"
  uv run -q --with numpy python -I scripts/mix_audio.py "$lang" "out/final/mix-$lang.wav"
  for shape in ${SHAPES:-9x16 4x5}; do
    node scripts/render.mjs "MusiclessAudio-$lang-$shape" "out/video-$lang-$shape.mp4" --muted --crf=17 --concurrency="$CONC" --chunk=12
    python3 scripts/finalize.py "out/video-$lang-$shape.mp4" "out/final/musicless-audio-$lang-$shape.mp4" "$title" "out/final/mix-$lang.wav" "$code"
  done
done
