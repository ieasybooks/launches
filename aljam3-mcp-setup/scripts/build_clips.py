"""Turn the raw screen captures (archive/captures/<clip>: 2× JPEG frames with timestamps, plus input marks)
into 30 fps MP4s of just the ranges the film uses → public/clips/<clip>.mp4 and src/data/clips.json.

Frames were only saved when the screen changed, so each one is held until the next. Ranges are joined
end to end; every cut falls on a still screen, so the joins don't show."""
import json, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "archive/captures"
FPS = 30

# Clip-time ranges (seconds since the recording started) that the film uses.
RANGES = {
    "site-copy": [(0.0, 5.6)],
    "gpt-add": [(0.0, 35.0)],
    "gpt-connect": [(23.6, 31.0)],
    "gpt-chat": [(0.0, 53.0), (455.6, 461.0), (928.6, 934.5), (1125.6, 1130.0)],
    "claude-add": [(0.0, 8.6), (803.6, 818.0), (1049.6, 1058.5), (1241.6, 1252.5), (1914.6, 1925.0)],
    "claude-chat": [(0.0, 6.6), (62.0, 141.0), (923.6, 930.0), (2375.6, 2380.0)],
    "site-verify": [(0.0, 11.3)],
}

def frame_at(frames, t):
    """Index of the last frame captured at or before clip time t."""
    lo, hi = 0, len(frames) - 1
    if t < frames[0]["t"]:
        return 0
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if frames[mid]["t"] <= t:
            lo = mid
        else:
            hi = mid - 1
    return lo

out = {}
only = set(sys.argv[1:])
(ROOT / "public/clips").mkdir(parents=True, exist_ok=True)
for cid, ranges in RANGES.items():
    src = "site-verify2" if cid == "site-verify" else cid
    clip = json.loads((RAW / src / "clip.json").read_text())
    t0 = clip["started"]
    frames = [{**f, "t": f["t"] - t0} for f in clip["frames"]]
    # one entry per output frame
    picks, spans, offset = [], [], 0.0
    for a, b in ranges:
        n = int(round((b - a) * FPS))
        picks += [frame_at(frames, a + k / FPS) for k in range(n)]
        spans.append({"a": a, "b": b, "o": round(offset, 4)})
        offset += n / FPS
    marks = []
    for m in clip["marks"]:
        t = m["t"] - t0
        span = next((s for s in spans if s["a"] <= t <= s["b"]), None)
        if span is None:
            continue
        marks.append({k: v for k, v in m.items() if k != "t"} | {"t": round(span["o"] + t - span["a"], 3)})
    out[cid] = {"src": f"clips/{cid}.mp4", "fps": FPS, "frames": len(picks), "duration": round(len(picks) / FPS, 3), "width": 2560, "height": 1600, "spans": spans, "marks": marks}
    if only and cid not in only:
        continue
    # ffconcat list: each distinct frame with how long it is held
    lines = ["ffconcat version 1.0"]
    run_start = 0
    for k in range(1, len(picks) + 1):
        if k == len(picks) or picks[k] != picks[run_start]:
            lines.append(f"file '{RAW / src / frames[picks[run_start]]['file']}'")
            lines.append(f"duration {(k - run_start) / FPS:.6f}")
            run_start = k
    lines.append(f"file '{RAW / src / frames[picks[-1]]['file']}'")
    listing = ROOT / f"out/clips/{cid}.ffconcat"
    listing.parent.mkdir(parents=True, exist_ok=True)
    listing.write_text("\n".join(lines) + "\n")
    target = ROOT / f"public/clips/{cid}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(listing),
                    "-vf", f"fps={FPS},scale=2560:1600:flags=lanczos,format=yuv420p", "-frames:v", str(len(picks)),
                    "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-g", "15", "-bf", "0", "-movflags", "+faststart", str(target)], check=True)
    size = target.stat().st_size / 1e6
    print(f"{cid:12s} {len(picks) / FPS:6.1f}s  {len(marks):2d} marks  {size:5.1f} MB", flush=True)

(ROOT / "src/data/clips.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
