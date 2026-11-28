"""Cut the demo's sound from the demo file and the website's own output for it.
footage/<lang>-original.mp3 is the file the film chooses; footage/<lang>-musicless.mp3 is what the Musicless website
gave back for it (the audio tool's own download, made by scripts/run_site.mjs on the real page). The film plays the
original from 0 to `cut` (data/demo.json), then switches to "Music removed" and plays the site's output from `cut` to
`end`, as the tool's preview does (same position, same volume). Both halves share one gain: the original's part is
brought to -24 LUFS, about 1 dB under the narration.
Writes public/audio/demo/<lang>-{a,b}.wav (48 kHz stereo)."""
import json, re, subprocess, pathlib
import numpy as np
ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000
demo = json.loads((ROOT / "data/demo.json").read_text())

def decode(path):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)

def lufs(x):
    p = subprocess.run(["ffmpeg", "-nostats", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-af", "ebur128", "-f", "null", "-"],
                       input=x.astype(np.float32).tobytes(), capture_output=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", p.stderr.decode())[-1])

def write(path, x):
    path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s24le", str(path)],
                   input=np.clip(x, -1, 1).astype(np.float32).tobytes(), check=True)

for lang in ("en", "ar"):
    d = demo[lang]
    orig, out = decode(ROOT / f"footage/{lang}-original.mp3"), decode(ROOT / f"footage/{lang}-musicless.mp3")
    a = orig[: int(d["cut"] * SR)].copy()
    b = out[int(d["cut"] * SR): int(d["end"] * SR)].copy()
    g = 10 ** ((-24.0 - lufs(a)) / 20)
    a, b = a * g, b * g
    # the switch is a fresh start of the same position (the preview pauses, swaps the source and plays on)
    f = int(0.012 * SR)
    a[:int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))[:, None]
    a[-f:] *= np.linspace(1, 0, f)[:, None]
    b[:f] *= np.linspace(0, 1, f)[:, None]
    b[-int(0.15 * SR):] *= np.linspace(1, 0, int(0.15 * SR))[:, None]
    write(ROOT / f"public/audio/demo/{lang}-a.wav", a)
    write(ROOT / f"public/audio/demo/{lang}-b.wav", b)
    print(f"{lang}: gain {20 * np.log10(g):+.1f} dB, a {len(a) / SR:.2f}s ({lufs(a):.1f} LUFS), b {len(b) / SR:.2f}s ({lufs(b):.1f} LUFS)")
