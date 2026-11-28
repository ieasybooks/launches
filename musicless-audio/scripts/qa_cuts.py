"""Check that every narration line starts and ends in silence (no word cut in two at a line boundary).
usage: qa_cuts.py ar|en"""
import json, subprocess, sys, pathlib, numpy as np
ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 44100
lang = sys.argv[1]
def load(p):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).astype(np.float64)
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
bad = []
for cid in json.loads((ROOT / f"audio/vo_clean/{lang}/clips.json").read_text()):
    x = load(ROOT / f"audio/vo_clean/{lang}/{cid}.wav")
    n = int(0.025 * SR)
    head, tail = db(x[:n]), db(x[-n:])
    ok = head < -45 and tail < -45
    if not ok: bad.append(cid)
    print(f"{lang} {cid:9s} edges {head:6.1f} / {tail:6.1f} dBFS {'ok' if ok else 'CUT IN SPEECH'}")
if bad: raise SystemExit("lines cut inside speech: " + ", ".join(bad))
