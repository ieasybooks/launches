"""Prepare audio for Remotion: loudness-matched voice clips for both languages (with their character
timings for src/data/vo-<lang>.json) and cleaned sound effects."""
import json, re, subprocess, pathlib, numpy as np
ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000

def decode(path, sr=SR):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).copy()

def write(path, x, sr=SR):
    path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-", "-c:a", "pcm_s24le", str(path)],
                   input=np.clip(x, -1, 1).astype(np.float32).tobytes(), check=True)

def lufs(path):
    out = subprocess.run(["ffmpeg", "-nostats", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", out)[-1])

def fade(x, fin=0.004, fout=0.03):
    a, b = int(fin * SR), int(fout * SR)
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[-b:] *= np.linspace(1, 0, b)
    return x

# Voice: match every clip to -23 LUFS with plain gain.
for lang in ("ar", "en"):
    clips = json.loads((ROOT / f"audio/vo_clean/{lang}/clips.json").read_text())
    script = {c["id"]: c for c in json.loads((ROOT / f"data/script-{lang}.json").read_text())["clips"]}
    vo = {}
    for cid, info in clips.items():
        if cid not in script:  # a line cut from the film stays in the take, unused
            continue
        src = ROOT / f"audio/vo_clean/{lang}/{cid}.wav"
        # lines cut from one continuous take share one gain, so their relative levels stay natural
        g = info["gain_db"] if "gain_db" in info else -23.0 - lufs(src)
        x = decode(src) * 10 ** (g / 20)
        peak = np.abs(x).max()
        if peak > 0.89: x *= 0.89 / peak
        write(ROOT / f"public/audio/vo/{lang}/{cid}.wav", x)
        vo[cid] = {"duration": round(len(x) / SR, 3), "chars": "".join(info["chars"]), "starts": info["starts"], "ends": info["ends"],
                   "caption": script[cid]["caption"]}
    (ROOT / f"src/data/vo-{lang}.json").write_text(json.dumps(vo, ensure_ascii=False))
    print(lang, len(vo), "voice clips")

# Sound effects: trim to onset, normalise, short fades. The air bed keeps its loop and level shape.
for p in sorted((ROOT / "audio/sfx_raw").glob("*.mp3")):
    x = decode(p)
    if p.stem in ("air", "night"):
        x = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 0.05
        write(ROOT / f"public/audio/sfx/{p.stem}.wav", x)
        continue
    env = np.abs(x)
    onset = 0 if p.stem in ("whoosh", "wind", "breath") else max(int(np.argmax(env > env.max() * 0.05)) - int(0.004 * SR), 0)
    x = x[onset:]
    x = x / (np.abs(x).max() + 1e-9) * 0.7
    write(ROOT / f"public/audio/sfx/{p.stem}.wav", fade(x))
print("sfx written")
