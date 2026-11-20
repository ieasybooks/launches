"""Mix a film's soundtrack offline from the sound events dumped by the Measure composition
(node scripts/measure.mjs <lang> → out/dbg/director-<lang>.json). Writes a 48 kHz stereo 24-bit WAV.
usage: mix_audio.py <ar|en> [out.wav]"""
import json, subprocess, sys, pathlib, numpy as np
ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000
lang = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else str(ROOT / f"out/final/mix-{lang}.wav")
d = json.loads((ROOT / f"out/dbg/director-{lang}.json").read_text())
n = int(np.ceil(d["DURATION"] * SR))
mix = np.zeros(n, np.float64)
cache = {}

def load(rel):
    if rel not in cache:
        raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(ROOT / "public" / rel), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
        cache[rel] = np.frombuffer(raw, np.float32).astype(np.float64)
    return cache[rel]

def ease(x):
    x = np.clip(x, 0, 1)
    return np.where(x < 0.5, 4 * x ** 3, 1 - (-2 * x + 2) ** 3 / 2)

for e in d["SOUND_EVENTS"]:
    x = load(e["file"])
    if e.get("from") is not None:
        # a stretch of a longer file (the recitation): cut at its own pauses, with short fades in and out
        a = int(round(e["from"] * SR))
        b = int(round((e["from"] + e["dur"]) * SR))
        tail = int((e.get("tail") or 0.1) * SR)
        x = x[a:b + tail].copy()
        fi = int((e.get("fadeIn") or 0.03) * SR)
        x[:fi] *= np.linspace(0, 1, fi)
        x[-tail:] *= 1 - ease(np.linspace(0, 1, tail))
    start = int(round(max(0.0, e["t"]) * SR))
    if e.get("fadeOut"):
        length = int(e["fadeOut"] * SR)
        if e.get("loop") and len(x) < length:
            x = np.tile(x, int(np.ceil(length / len(x))))
        length = min(len(x), length)
        s = np.arange(length) / SR
        gain = e["vol"] * np.minimum(1, s / 2) * (1 - ease((s - (e["fadeOut"] - 3)) / 3))
        x = x[:length] * gain
    else:
        x = x * e["vol"]
    end = min(n, start + len(x))
    mix[start:end] += x[: end - start]
peak = np.abs(mix).max()
print(f"{lang}: events {len(d['SOUND_EVENTS'])}, duration {n / SR:.2f}s, peak {20 * np.log10(peak):.2f} dBFS")
pathlib.Path(out).parent.mkdir(parents=True, exist_ok=True)
stereo = np.repeat(mix[:, None], 2, axis=1).astype(np.float32)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s24le", out], input=stereo.tobytes(), check=True)
print("wrote", out)
