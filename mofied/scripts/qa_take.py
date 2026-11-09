"""Check a whole narration take against its script with ElevenLabs Scribe, and report the pace.
usage: qa_take.py ar|en"""
import difflib, json, re, subprocess, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from eleven import stt, ROOT

lang = sys.argv[1]

def norm(s):
    s = re.sub(r"[ً-ْٰـ]", "", s).lower()
    s = re.sub(r"[إأآا]", "ا", s).replace("ة", "ه").replace("ى", "ي")
    if lang == "en": s = s.replace("مفيد", "mofied").replace("mu-feed", "mofied")
    s = s.replace("mofied dot com", "mofied.com").replace("مفيد دوت كوم", "mofied.com")
    s = re.sub(r"\bm(?:o|u|ou|oo|ew)ff?(?:i|ee|ea)d?\b", "mofied", s)
    s = re.sub(r"\bmofied(?:\s+dot\s+com|\.com)\b", "mofied.com", s)
    for ar, en in (("اب ستور", "app store"), ("جوجل بلاي", "google play"), ("اب غاليري", "appgallery")):
        s = s.replace(ar, en)
    s = s.replace("you're", "you are").replace("it's", "it is").replace("sign-up", "sign up")
    s = re.sub(r"\bapp gallery\b", "appgallery", s)
    s = re.sub(r"[^ء-يa-z0-9.\s]", " ", s).replace(". ", " ")
    return [w.strip(".") for w in s.split() if w.strip(".")]

take = ROOT / f"audio/vo/{lang}/take.mp3"
cache = take.with_suffix(".stt.json")
if not cache.exists() or cache.stat().st_mtime < take.stat().st_mtime:
    cache.write_text(json.dumps(stt(take, {"ar": "ara", "en": "eng"}[lang]), ensure_ascii=False))
res = json.loads(cache.read_text())
script = json.loads((ROOT / f"data/script-{lang}.json").read_text())
ref = norm(" ".join(c["text"] for c in script["clips"]))
hyp = norm(res["text"])
sm = difflib.SequenceMatcher(None, ref, hyp)
errs = [(" ".join(ref[a:b]), " ".join(hyp[c:d])) for op, a, b, c, d in sm.get_opcodes() if op != "equal"]
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(take)]))
print(f"{lang}: {dur:.1f}s, {len(ref)} words, {len(ref) / dur * 60:.0f} words/min, match {sm.ratio():.3f}")
print("STT:", res["text"])
for e in errs: print("  diff:", e)
