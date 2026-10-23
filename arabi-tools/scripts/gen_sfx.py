import json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from eleven import request, ROOT
SFX = {
  "whoosh": ("soft smooth airy whoosh transition, gentle and clean, modern motion graphics, no music", 1.0),
  "whoosh_long": ("slow soft cinematic air whoosh passing by, warm and smooth, no music, no tones", 1.8),
  "impact": ("deep soft cinematic low boom with a warm airy tail, gentle and elegant, not aggressive, no music, no melody", 3.0),
  "pop": ("soft subtle user interface pop, short and clean, no melody", 0.5),
  "drop": ("small paper card gently dropping onto a soft desk, short muted thud, close, no reverb", 0.6),
  "paper": ("single paper page sliding and settling, soft and close, no music", 0.8),
  "dissolve": ("soft fine sand grains scattering into the air, short airy granular dissolve, no music, no tones", 1.4),
  "slide": ("soft subtle sliding swipe of a card across a desk, short, smooth", 0.7),
  "denied": ("soft muted low wooden knock, two quick gentle taps, close, no music", 0.6),
}
for name, (text, dur) in SFX.items():
    out = ROOT / f"audio/sfx_raw/{name}.mp3"
    if out.exists(): continue
    out.write_bytes(request("/v1/sound-generation", {"text": text, "duration_seconds": dur, "prompt_influence": 0.55}, raw=True))
    print("ok", name, flush=True)
