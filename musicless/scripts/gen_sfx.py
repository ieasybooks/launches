"""Generate the film's sound effects with ElevenLabs Sound Effects v3. Every prompt is non-musical:
clicks, wood, paper, air and a quiet room. No bells, chimes, tones or melodies.
Existing files are kept unless named on the command line. usage: gen_sfx.py [name …]"""
import json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from eleven import request, ROOT

MODEL = "eleven_text_to_sound_v3"
SFX = {
    # name: (prompt, seconds, prompt influence, loop)
    "click": ("a single crisp computer mouse click, close microphone, dry, short, no beep", 0.5, 0.7, False),
    "snap": ("a crisp dry snap of a thin wooden stick breaking in two, close, short, no ring, no tone", 0.6, 0.65, False),
    "scatter": ("a handful of small light plastic pieces falling and scattering onto a wooden table, short and bright, no music", 1.2, 0.55, False),
    "thud": ("a heavy hardcover book closed firmly on a wooden table, one deep soft thud, close, short, no ring", 0.8, 0.6, False),
    "whoosh": ("slow soft air whoosh passing by, warm and smooth, no music, no tones", 1.2, 0.5, False),
    "zip": ("a fast sharp air whoosh passing close by, quick and clean, no tone, no beep", 0.6, 0.6, False),
    "card": ("a single small paper card placed softly onto a wooden table, close, short", 0.5, 0.6, False),
    "pop": ("a soft dull pop of a small paper bag, close and dry, short, no tone, no squeak", 0.5, 0.6, False),
    "type": ("fast light typing on a laptop keyboard, eight soft keystrokes, close, dry, no beep", 1.2, 0.6, False),
    "air": ("very quiet calm room tone, soft air, no hum, no voices, no music, no birds, no traffic", 20.0, 0.45, True),
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
