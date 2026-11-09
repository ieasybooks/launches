"""Re-record one line of the continuous take and splice it in, keeping the take's voice and level.
The line is generated with the lines around it as context; candidates are checked with Scribe and the
first that contains every expected word is kept. It is trimmed to the original line's lead and given a
short natural tail, matched in loudness to the line it replaces, and its timings replace that line's
in audio/vo_clean/<lang>/clips.json. Run after gen_take.py (a re-split undoes a patch; run this again).
usage: patch_line.py <lang> <id> "<new text>" <must-hear word> [seeds…]"""
import json, re, subprocess, sys, pathlib
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from eleven import tts, stt, ROOT

lang, cid, text, must = sys.argv[1:5]
seeds = [int(s) for s in sys.argv[5:]] or [2024, 2025, 2026, 2027, 2028, 2029]
script = json.loads((ROOT / f"data/script-{lang}.json").read_text())
voice = script["voice"]
ids = [c["id"] for c in script["clips"]]
i = ids.index(cid)
prev_text = script["clips"][i - 1]["text"] if i > 0 else None
next_text = script["clips"][i + 1]["text"] if i + 1 < len(ids) else None
plain = lambda s: re.sub(r"[ً-ْٰـ]", "", s)
SR = 44100
out_dir = ROOT / f"audio/vo/{lang}"

def decode(path):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).astype(np.float64)

def lufs(path):
    err = subprocess.run(["ffmpeg", "-nostats", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", err)[-1])

chosen = None
# with the next line as context the model sometimes stops dead on the last word; then try without it
attempts = [(seed, True) for seed in seeds] + ([(seed, False) for seed in seeds] if next_text else [])
for seed, with_next in attempts:
    if chosen: break
    mp3 = out_dir / f"patch-{cid}-{seed}{'' if with_next else '-solo'}.mp3"
    extra = {"seed": seed, "language_code": voice["language"]}
    if prev_text: extra["previous_text"] = prev_text
    if next_text and with_next: extra["next_text"] = next_text
    data = tts(voice["id"], text, voice["model"], voice["settings"], mp3, extra=extra)
    heard = stt(mp3, {"ar": "ara", "en": "eng"}[lang])["text"]
    ok = plain(must) in re.sub(r"[^\w\s]", " ", plain(heard).lower()).split()
    # a usable take ends in silence: at least 0.1 s after the last voiced frame
    y0 = decode(mp3)
    lv0 = 20 * np.log10(np.array([np.sqrt(np.mean(y0[k:k + 882] ** 2)) for k in range(0, len(y0) - 882, 441)]) + 1e-9)
    tail = len(y0) / SR - (np.where(lv0 > -48.0)[0][-1] * 441 + 882) / SR
    if tail < 0.1:
        print(f"seed {seed}: ends without a pause ({tail:.2f}s) — {heard}"); continue
    print(f"seed {seed}: {'OK ' if ok else '   '} {heard}", flush=True)
    if ok:
        chosen = (seed, mp3, data["alignment"])
if not chosen:
    raise SystemExit(f"no candidate where Scribe hears «{must}»")
seed, mp3, al = chosen
assert "".join(al["characters"]) == text

clips_path = ROOT / f"audio/vo_clean/{lang}/clips.json"
clips = json.loads(clips_path.read_text())
old = clips[cid]
old_wav = ROOT / f"audio/vo_clean/{lang}/{cid}.wav"
x = decode(mp3)
# trim at the take's own silence threshold, from the waveform (not the alignment)
WIN, HOP = int(0.02 * SR), int(0.01 * SR)
lv = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + WIN] ** 2)) for i in range(0, len(x) - WIN, HOP)]) + 1e-9)
voiced = np.where(lv > -48.0)[0]
t0 = max(0.0, (voiced[0] * HOP) / SR - 0.06)
t1 = min(len(x) / SR, (voiced[-1] * HOP + WIN) / SR + 0.12)
y = x[int(t0 * SR): int(t1 * SR)].copy()
fade = int(0.004 * SR)
y[:fade] *= np.linspace(0, 1, fade); y[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
tmp = out_dir / f"patch-{cid}.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s24le", str(tmp)], input=y.tobytes(), check=True)
gain = 10 ** ((lufs(old_wav) - lufs(tmp)) / 20)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s24le", str(old_wav)], input=(y * gain).tobytes(), check=True)
tmp.unlink()
clips[cid] = {**old, "duration": round(len(y) / SR, 3), "chars": al["characters"],
              "starts": [round(max(0.0, s - t0), 3) for s in al["character_start_times_seconds"]],
              "ends": [round(max(0.0, e - t0), 3) for e in al["character_end_times_seconds"]],
              "patched": {"text": text, "seed": seed, "file": mp3.name}}
clips_path.write_text(json.dumps(clips, ensure_ascii=False))
for c in script["clips"]:
    if c["id"] == cid:
        c["text"] = text
        c["patch_seed"] = seed
(ROOT / f"data/script-{lang}.json").write_text(json.dumps(script, ensure_ascii=False, indent=2) + "\n")
for p in out_dir.glob(f"patch-{cid}-*.mp3"):
    if p != mp3: p.unlink()
print(f"patched {lang}/{cid} with seed {seed}: {old['duration']:.2f}s → {len(y) / SR:.2f}s, gain {20 * np.log10(gain):+.1f} dB")
