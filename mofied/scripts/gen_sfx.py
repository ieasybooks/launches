"""Generate the film's sound effects with ElevenLabs Sound Effects v3. Every prompt is non-musical:
air, paper, glass, wood and a quiet room. No bells, chimes, tones or melodies.
Existing files are kept unless named on the command line. usage: gen_sfx.py [name …]"""
import json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from eleven import request, ROOT

MODEL = "eleven_text_to_sound_v3"
SFX = {
    # name: (prompt, seconds, prompt influence, loop)
    "flick": ("a single quick finger flick swiping across a smartphone glass screen, soft airy swish, close and dry, no beep, no music", 0.5, 0.6, False),
    "swipe": ("one soft airy whoosh of a finger swiping up on a phone screen, subtle and smooth, close, no beep, no music", 0.8, 0.55, False),
    "tap": ("a soft muted fingertip tap on a glass phone screen, close microphone, dry, no click, no beep", 0.5, 0.6, False),
    "breath": ("a single soft breath of air, like a heavy paper page settling onto a desk, warm and intimate, no music, no tone", 1.5, 0.5, False),
    "room": ("quiet early morning room by an open window, faint distant birds, light breeze, calm, no voices, no music, no traffic", 22.0, 0.45, True),
    "cards": ("light rustle of paper cards being sorted and set down on a wooden table, gentle and unhurried, close, no music", 2.5, 0.5, False),
    "card": ("a single small paper card placed softly onto a wooden table, close, short", 0.5, 0.6, False),
    "tick": ("a single soft wooden clock tick, close and dry, short, no bell, no chime, no ring", 0.5, 0.6, False),
    "wind": ("a gentle gust of wind through an open window that fades into stillness, soft and airy, no music, no tone", 3.0, 0.45, False),
    "paper": ("a single sheet of thick paper placed softly onto a desk, close, short", 0.6, 0.55, False),
    "whoosh": ("slow soft air whoosh passing by, warm and smooth, no music, no tones", 1.6, 0.5, False),
    "thud": ("a heavy hardcover book closed firmly on a wooden table, one deep soft thud, close, short, no ring", 0.8, 0.6, False),
    "zip": ("a fast sharp air whoosh passing close by, quick and clean, no tone, no beep", 0.6, 0.6, False),
    "rush": ("a rush of wind building up quickly then cut off, airy, no tone, no music", 1.5, 0.5, False),
}
force = set(sys.argv[1:])
(ROOT / "audio/sfx_raw").mkdir(parents=True, exist_ok=True)
for name, (text, dur, influence, loop) in SFX.items():
    out = ROOT / f"audio/sfx_raw/{name}.mp3"
    if out.exists() and name not in force:
        continue
    payload = {"text": text, "model_id": MODEL, "duration_seconds": dur, "prompt_influence": influence}
    if loop: payload["loop"] = True
    out.write_bytes(request("/v1/sound-generation", payload, raw=True))
    print("generated", name, flush=True)
(ROOT / "audio/sfx_raw/prompts.json").write_text(json.dumps({"model": MODEL, "sfx": {k: {"prompt": v[0], "seconds": v[1], "prompt_influence": v[2], "loop": v[3]} for k, v in SFX.items()}}, ensure_ascii=False, indent=2) + "\n")
