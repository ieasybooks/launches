"""Generate the narration as ONE continuous take (natural flow from line to line), then split it into
the script's lines at the quietest point between them, using the take's character timings.
usage: gen_take.py ar|en [--split-only]
Writes audio/vo/<lang>/take.mp3 + take.json, and audio/vo_clean/<lang>/<id>.wav + clips.json.
The voice's optional "tag" (an eleven_v4 audio tag such as "[speaking quickly]") is sent before the text: it steers the
delivery and is not spoken. It is dropped from the alignment, so timings still start at the first word."""
import json, re, subprocess, sys, pathlib
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from eleven import tts, ROOT

lang = sys.argv[1]
script = json.loads((ROOT / f"data/script-{lang}.json").read_text())
voice, clips = script["voice"], script["clips"]
text = " ".join(c["text"] for c in clips)
vo_dir = ROOT / f"audio/vo/{lang}"; vo_dir.mkdir(parents=True, exist_ok=True)
take = vo_dir / "take.mp3"
if "--split-only" not in sys.argv:
    tag = voice.get("tag")
    data = tts(voice["id"], f"{tag} {text}" if tag else text, voice["model"], voice["settings"], take, extra={"seed": voice["seed"], "language_code": voice["language"]})
    al = data["alignment"]
    if tag and "".join(al["characters"]).startswith(tag):
        k = len(tag) + 1
        al = {key: v[k:] for key, v in al.items()}
    (vo_dir / "take.json").write_text(json.dumps({"text": text, "tag": tag, "lines": [{"id": c["id"], "text": c["text"]} for c in clips], "alignment": al}, ensure_ascii=False))
    print("generated take", lang, flush=True)
take_doc = json.loads((vo_dir / "take.json").read_text())
al = take_doc["alignment"]
if "--split-only" in sys.argv and "lines" in take_doc:
    # re-split with the take's own lines; patched lines are re-applied afterwards (scripts/patch_line.py)
    clips = [dict(next(c for c in clips if c["id"] == l["id"]), text=l["text"]) for l in take_doc["lines"]]
    text = take_doc["text"]
chars, starts, ends = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
assert "".join(chars) == text, "alignment text differs from the script"

SR = 44100
raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(take), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
x = np.frombuffer(raw, np.float32).astype(np.float64)
HOP = int(0.01 * SR)
WIN = int(0.02 * SR)
frames = np.array([np.sqrt(np.mean(x[i:i + WIN] ** 2)) for i in range(0, len(x) - WIN, HOP)])
level = 20 * np.log10(frames + 1e-9)
THRESHOLD = -48.0  # dBFS: below this is silence in the take
def frame_t(i): return (i * HOP + WIN / 2) / SR

def silent_cut(a, b):
    """The middle of the real silence nearest the boundary between two lines (a = previous line's last
    voiced character, b = next line's first), found in the waveform rather than trusted to the alignment."""
    lo, hi = max(0, int((min(a, b) - 0.35) * SR / HOP)), min(len(level), int((max(a, b) + 0.35) * SR / HOP))
    runs, i = [], lo
    while i < hi:
        if level[i] < THRESHOLD:
            j = i
            while j < hi and level[j] < THRESHOLD: j += 1
            if (j - i) * HOP / SR >= 0.04: runs.append((i, j))
            i = j
        else:
            i += 1
    if runs:
        mid = (a + b) / 2
        i, j = min(runs, key=lambda r: abs(frame_t((r[0] + r[1]) / 2) - mid))
        return frame_t((i + j) / 2), False
    k = lo + int(np.argmin(level[lo:hi]))  # no silence: the lines run together
    return frame_t(k), True

# each line's character span in the joined text
spans, pos = [], 0
for c in clips:
    spans.append((pos, pos + len(c["text"])))
    pos += len(c["text"]) + 1
def last_voiced(i0, i1):
    k = i1 - 1
    while k > i0 and not chars[k].strip(): k -= 1
    return ends[k]
first_on = next(frame_t(i) for i in range(len(level)) if level[i] > THRESHOLD)
cuts, joined = [max(0.0, first_on - 0.05)], []
for (a0, a1), (b0, b1), nxt in zip(spans, spans[1:], clips[1:]):
    t, j = silent_cut(last_voiced(a0, a1), starts[b0])
    cuts.append(t)
    if j: joined.append(nxt["id"])
last_on = max(frame_t(i) for i in range(len(level)) if level[i] > THRESHOLD)
cuts.append(min(len(x) / SR, last_on + 0.3))

out_dir = ROOT / f"audio/vo_clean/{lang}"; out_dir.mkdir(parents=True, exist_ok=True)
lufs_out = subprocess.run(["ffmpeg", "-nostats", "-i", str(take), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
gain_db = -23.0 - float(re.findall(r"I:\s+(-?[\d.]+) LUFS", lufs_out)[-1])
report = {}
fade = int(0.003 * SR)
for c, (i0, i1), t0, t1 in zip(clips, spans, cuts, cuts[1:]):
    y = x[int(t0 * SR): int(t1 * SR)].copy()
    y[:fade] *= np.linspace(0, 1, fade); y[-fade:] *= np.linspace(1, 0, fade)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s24le", str(out_dir / f"{c['id']}.wav")],
                   input=y.tobytes(), check=True)
    report[c["id"]] = {"offset": round(t0, 3), "duration": round(len(y) / SR, 3), "gain_db": round(gain_db, 2), "chars": chars[i0:i1],
                       "starts": [round(max(0.0, s - t0), 3) for s in starts[i0:i1]], "ends": [round(max(0.0, e - t0), 3) for e in ends[i0:i1]]}
    print(f"{c['id']:9s} {t0:6.2f}–{t1:6.2f}  {len(y) / SR:5.2f}s{'  (runs on from the line before: no pause may be added)' if c['id'] in joined else ''}")
(out_dir / "clips.json").write_text(json.dumps(report, ensure_ascii=False))
(out_dir / "joined.json").write_text(json.dumps(joined))
print(f"take {len(x) / SR:.2f}s, gain {gain_db:+.2f} dB → -23 LUFS")
