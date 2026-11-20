"""Write SRT and WebVTT captions from the narration timeline (the same plan and alignment as the film).
usage: gen_captions.py <ar|en>   (needs out/dbg/director-<lang>.json from scripts/measure.mjs)"""
import json, re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
lang = sys.argv[1]
vo = json.loads((ROOT / f"src/data/vo-{lang}.json").read_text())
d = json.loads((ROOT / f"out/dbg/director-{lang}.json").read_text())
PUNCT = "،.:,?؟"
cues = []
for c in d["ORDER"]:
    clip = vo[c["id"]]
    start, end = c["start"], c["end"]
    chars = list(clip["chars"])
    parts = re.split(r"(?<=[،.:…,?؟])\s+", clip["caption"].strip())
    bounds = [0] + [i + 1 for i, ch in enumerate(chars) if ch in PUNCT and i < len(chars) - 1]
    if len(parts) != len(bounds):
        parts, bounds = [clip["caption"]], [0]
    chunks = []
    for k, text in enumerate(parts):
        i0 = bounds[k]
        while i0 < len(chars) - 1 and chars[i0].isspace(): i0 += 1
        s = start + clip["starts"][i0]
        e = start + clip["ends"][bounds[k + 1] - 2] if k + 1 < len(bounds) else end
        chunks.append([text, s, e])
    # merge short pieces so each caption stays on screen long enough to read
    merged = []
    for ch in chunks:
        if merged and (len(ch[0]) < 16 or len(merged[-1][0]) < 16) and len(merged[-1][0]) + len(ch[0]) < 70:
            merged[-1][0] += " " + ch[0]; merged[-1][2] = ch[2]
        else:
            merged.append(ch)
    cues += merged

# Osama Al-Waaedh's recitation, half by half, in the verse's own words (both languages hear it in Arabic)
poem = json.loads((ROOT / "data/verses.json").read_text())
rec = json.loads((ROOT / "src/data/recitation.json").read_text())
for e in d["SOUND_EVENTS"]:
    if e.get("from") is None:
        continue
    a, b = e["from"], e["from"] + e["dur"]
    for addr, s0, e0, *_ in rec["timeline"]:
        if s0 >= a - 0.05 and s0 < b:
            text = poem[addr]
            cues.append([text, e["t"] + (s0 - a), e["t"] + (min(e0, b) - a)])
cues.sort(key=lambda c: c[1])

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
name = "shawared-launch"
out = ROOT / "out/final"
out.mkdir(parents=True, exist_ok=True)
(out / f"{name}.{lang}.srt").write_text("\n".join(srt), encoding="utf-8")
(out / f"{name}.{lang}.vtt").write_text("\n".join(vtt), encoding="utf-8")
print(f"{name}.{lang}: {len(cues)} cues")
