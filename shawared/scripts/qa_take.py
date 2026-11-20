"""Check a whole narration take against its script with ElevenLabs Scribe, and report the pace.
usage: qa_take.py ar|en"""
import difflib, json, re, subprocess, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from eleven import stt, ROOT

lang = sys.argv[1]

def norm(s):
    s = re.sub(r"[ً-ْٰـ]", "", s).lower()
    s = re.sub(r"[إأآا]", "ا", s).replace("ة", "ه").replace("ى", "ي")
    # the script spells Latin names in Arabic letters for the narrator; Scribe may write either
    for ar, en in (("كروم او اس", "chromeos"), ("يوتيوب", "youtube"), ("كروم", "chrome"), ("فايرفوكس", "firefox"), ("ويندوز", "windows"),
                   ("ماك", "mac"), ("لينكس", "linux")):
        s = s.replace(ar, en)
    s = s.replace("chrome os", "chromeos").replace("add-ons", "add ons").replace("you're", "you are").replace("it's", "it is")
    s = s.replace("you'll", "you will").replace("here's", "here is").replace("there's", "there is").replace("music less", "musicless")
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
