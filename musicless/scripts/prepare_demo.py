"""The demo's real before/after sound, made with Musicless's own separation (tests/reference.py in the musicless
repository, which runs exactly what the extension runs, with its pinned model built by its setup.sh).
usage: MUSICLESS_REPO=<musicless checkout with extension/model/spleeter-2stems.onnx> \
       uv run --with numpy==2.5.4 --with onnxruntime==1.31.0 python -I scripts/prepare_demo.py
Writes public/audio/demo/<lang>-a.wav (the original, a0 → cut) and <lang>-b.wav (the voices only, cut → b1), both
at one gain that brings the original part to -24 LUFS (the narration sits at -23)."""
import json, os, pathlib, re, subprocess, sys
import numpy as np
ROOT = pathlib.Path(__file__).resolve().parent.parent
repo = pathlib.Path(os.environ.get("MUSICLESS_REPO", ""))
if not (repo / "extension/model/spleeter-2stems.onnx").exists():
    raise SystemExit("set MUSICLESS_REPO to a musicless checkout whose setup.sh has built extension/model/spleeter-2stems.onnx")
sys.path.insert(0, str(repo / "tests"))
import reference  # noqa: E402

SR = 44100
demo = json.loads((ROOT / "data/demo.json").read_text())
out = ROOT / "public/audio/demo"
out.mkdir(parents=True, exist_ok=True)

def write(path, y):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-ar", "48000", "-c:a", "pcm_s24le", str(path)],
                   input=y.astype(np.float32).tobytes(), check=True)

def lufs(y):
    err = subprocess.run(["ffmpeg", "-nostats", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-af", "ebur128", "-f", "null", "-"],
                         input=y.astype(np.float32).tobytes(), capture_output=True).stderr.decode()
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", err)[-1])

for lang in ("en", "ar"):
    d = demo[lang]
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(ROOT / f"footage/largest-star-{lang}.mp4"), "-vn", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"])
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    # separate from the start of the media, as the extension does (its windows start at media time 0)
    end = int((d["b1"] + 1) * SR)
    voices = reference.vocals(x[:end])
    a = x[int(d["a0"] * SR):int(d["cut"] * SR)].copy()
    b = voices[int(d["cut"] * SR):int(d["b1"] * SR)].copy()
    gain = 10 ** ((-24.0 - lufs(a)) / 20)
    f = int(0.03 * SR)
    a[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
    a[-f:] *= np.linspace(1, 0, f)[:, None]
    b[:f] *= np.linspace(0, 1, f)[:, None]
    b[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))[:, None]
    write(out / f"{lang}-a.wav", a * gain)
    write(out / f"{lang}-b.wav", b * gain)
    print(f"{lang}: before {len(a) / SR:.2f}s, after {len(b) / SR:.2f}s, gain {20 * np.log10(gain):+.1f} dB")
