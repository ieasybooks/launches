"""Write SRT and WebVTT captions from the narration timeline (same plan and alignment as the film)."""
import json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
vo = json.loads((ROOT / "src/data/vo.json").read_text())
plan = re.findall(r'\["(\w+)", ([\d.]+)\]', (ROOT / "src/lib/timeline.ts").read_text())
cues = []
t = 0
for cid, gap in plan:
    clip = vo[cid]; start = t + float(gap); t = start + clip["duration"]
    chars = list(clip["chars"])
    parts = re.split(r"(?<=[،.:…])\s+", clip["caption"].strip())
    bounds = [0] + [i + 1 for i, ch in enumerate(chars) if ch in "،.:" and i < len(chars) - 1]
    if len(parts) != len(bounds):
        parts, bounds = [clip["caption"]], [0]
    chunks = []
    for k, text in enumerate(parts):
        i0 = bounds[k]
        while i0 < len(chars) - 1 and chars[i0].isspace(): i0 += 1
        s = start + clip["starts"][i0]
        e = start + clip["ends"][bounds[k + 1] - 2] if k + 1 < len(bounds) else t
        chunks.append([text, s, e])
    # merge short pieces so each caption stays on screen long enough to read
    merged = []
    for c in chunks:
        if merged and (len(c[0]) < 16 or len(merged[-1][0]) < 16) and len(merged[-1][0]) + len(c[0]) < 70:
            merged[-1][0] += " " + c[0]; merged[-1][2] = c[2]
        else:
            merged.append(c)
    cues += merged
def ts(x, sep):
    ms = round(max(0, x) * 1000)
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d}{sep}{ms:03d}"
srt, vtt = [], ["WEBVTT", ""]
for n, (text, s, e) in enumerate(cues, 1):
    e = max(e + 0.2, s + 1.2)
    if n < len(cues): e = min(e, cues[n][1] - 0.03)
    assert e > s, (text, s, e)
    srt += [str(n), f"{ts(s, ',')} --> {ts(e, ',')}", text, ""]
    vtt += [f"{ts(s, '.')} --> {ts(e, '.')}", text, ""]
(ROOT / "out/final/arabi-tools-ocr-launch.ar.srt").write_text("\n".join(srt), encoding="utf-8")
(ROOT / "out/final/arabi-tools-ocr-launch.ar.vtt").write_text("\n".join(vtt), encoding="utf-8")
print(len(cues), "cues"); print("\n".join(srt[:16]))
