"""Validate every final MP4 (size, frame count, duration, codecs, colour, audio, loudness, fast start)
and write out/final/delivery.json with hashes. Run after scripts/render_all.sh and gen_captions.py."""
import hashlib, json, math, pathlib, re, subprocess
from datetime import datetime, timezone
from fractions import Fraction
ROOT = pathlib.Path(__file__).resolve().parent.parent
FPS = 60
manifest = {"checkedAt": datetime.now(timezone.utc).isoformat(), "fps": FPS, "videos": [], "reviewFiles": []}
for lang in ("ar", "en"):
    expected = json.loads((ROOT / f"out/dbg/director-{lang}.json").read_text())["DURATION"]
    frames = math.ceil(expected * FPS)
    duration = frames / FPS
    name = "musicless-launch"
    for shape, width, height in (("16x9", 1920, 1080), ("9x16", 1080, 1920), ("4x5", 1080, 1350)):
        p = ROOT / f"out/final/{name}-{lang}-{shape}.mp4"
        info = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(p)]))
        video = next(s for s in info["streams"] if s["codec_type"] == "video")
        audio = next(s for s in info["streams"] if s["codec_type"] == "audio")
        assert (video["width"], video["height"]) == (width, height), p
        assert Fraction(video["r_frame_rate"]) == FPS and int(video["nb_frames"]) == frames, (p, video["nb_frames"], frames)
        assert abs(float(video["duration"]) - duration) < 0.001, p
        assert abs(float(audio["duration"]) - duration) < 0.03, (p, audio["duration"], duration)
        assert video["codec_name"] == "h264" and video["pix_fmt"] == "yuv420p" and video.get("color_space") == "bt709", p
        assert audio["codec_name"] == "aac" and audio["sample_rate"] == "48000" and audio["channels"] == 2, p
        code = {"ar": "ara", "en": "eng"}[lang]
        assert audio["tags"]["language"] == code, p
        err = subprocess.run(["ffmpeg", "-nostats", "-i", str(p), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
        lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", err)[-1]); tp = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", err)[-1])
        assert abs(lufs + 14) <= 0.5 and tp <= -0.9, (p, lufs, tp)
        data = p.read_bytes()
        offset, atoms = 0, []
        while offset + 8 <= len(data):
            length = int.from_bytes(data[offset:offset + 4], "big"); kind = data[offset + 4:offset + 8].decode("latin-1")
            if length == 1: length = int.from_bytes(data[offset + 8:offset + 16], "big")
            if length == 0: length = len(data) - offset
            atoms.append(kind); offset += length
        assert atoms.index("moov") < atoms.index("mdat"), p
        manifest["videos"].append({"file": p.name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "width": width, "height": height,
                                   "frames": frames, "durationSeconds": round(duration, 3), "loudnessLUFS": lufs, "truePeakDBTP": tp, "language": code})
        print(f"PASS {p.name} {width}x{height} {frames} frames {duration:.2f}s {lufs} LUFS {tp} dBTP")
for p in sorted((ROOT / "out/final").glob("*")):
    if p.suffix in (".srt", ".vtt", ".jpg"):
        data = p.read_bytes()
        manifest["reviewFiles"].append({"file": p.name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
(ROOT / "out/final/delivery.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
print("PASS: delivery.json written")
