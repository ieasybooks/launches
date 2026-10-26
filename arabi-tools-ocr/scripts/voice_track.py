"""Write the narration-only review track and the predecessor's per-frame loudness/spectrum data."""
import json, re, subprocess, pathlib, numpy as np
ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000
vo = json.loads((ROOT / "src/data/vo.json").read_text())
plan = re.findall(r'\["(\w+)", ([\d.]+)\]', (ROOT / "src/lib/timeline.ts").read_text())
hold = float(re.search(r"END_HOLD = ([\d.]+)", (ROOT / "src/lib/timeline.ts").read_text()).group(1))
parts, t = [], 0.0
for cid, gap in plan:
    start = t + float(gap)
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(ROOT / f"public/audio/vo/{cid}.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    parts.append((start, np.frombuffer(raw, np.float32)))
    t = start + vo[cid]["duration"]
mix = np.zeros(int((t + hold) * SR), np.float32)
for start, x in parts:
    i = int(round(start * SR)); mix[i:i + len(x)] += x
out = ROOT / "out/vo_track.mp3"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "96k", str(out)], input=mix.tobytes(), check=True)
print(out, round(len(mix) / SR, 2), "s")

# Per-frame loudness and a coarse spectrum of the narration, so on-screen waveforms move with the voice.
FPS, BANDS = 30, 16
hop = SR // FPS
win = np.hanning(2048)
edges = np.geomspace(120, 5000, BANDS + 1)
freqs = np.fft.rfftfreq(2048, 1 / SR)
env, bands = [], []
for f in range(int(len(mix) / hop)):
    c = f * hop + hop // 2
    seg = mix[max(0, c - 1024): c + 1024]
    seg = np.pad(seg, (0, 2048 - len(seg)))
    env.append(float(np.sqrt((seg ** 2).mean())))
    mag = np.abs(np.fft.rfft(seg * win))
    bands.append([float(mag[(freqs >= lo) & (freqs < hi)].mean()) for lo, hi in zip(edges[:-1], edges[1:])])
env = np.array(env); bands = np.array(bands)
env = np.clip(env / np.percentile(env[env > 0.01], 95), 0, 1.2)
bands = np.log1p(bands / np.percentile(bands[bands > 0], 50)) ; bands = np.clip(bands / np.percentile(bands, 99), 0, 1)
data = {"fps": FPS, "env": [round(x, 3) for x in env], "bands": [[round(x, 2) for x in row] for row in bands]}
(ROOT / "src/data/voice.json").write_text(json.dumps(data, separators=(",", ":")))
print("voice.json", len(env), "frames")
