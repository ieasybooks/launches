"""Frame sweep of a draft around the film's key moments: sweep.py <lang> <shape> [fps]  → out/draft/sweep-<lang>-<shape>.jpg"""
import json, subprocess, sys, pathlib
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parent.parent
lang, shape = sys.argv[1], sys.argv[2]
fps = sys.argv[3] if len(sys.argv) > 3 else "5"
T = json.loads((ROOT / f"out/dbg/director-{lang}.json").read_text())["T"]
wins = [(0, 1.6), (T["rec1"] + 2, T["rec1"] + 3.6), (T["maha"] - 0.2, T["maha"] + 1.4), (T["brand"] - 0.4, T["brand"] + 1.4), (T["brandEnd"] - 0.2, T["hear"] + 1.4),
        (T["play"] - 0.3, T["play"] + 1.3), (T["word"] - 0.2, T["word"] + 1.4), (T["oryx"] - 0.5, T["oryx"] + 1.1), (T["eyes"], T["eyes"] + 1.6), (T["meaningEnd"] - 0.1, T["poets"] + 0.4),
        (T["rec2Ajuz"] - 0.4, T["rec2Ajuz"] + 1.2), (T["poets"] - 0.6, T["poets"] + 1.0), (T["imru"], T["shawqi"] + 0.4), (T["byPoet"] - 0.6, T["byReciter"] + 0.6),
        (T["night"] - 1.2, T["night"] + 0.4), (T["offline"] - 0.3, T["freeStart"] + 0.3), (T["download"] + 0.2, T["download"] + 1.8),
        (T["freeStart"] - 0.4, T["freeStart"] + 1.2), (T["cta"] - 0.4, T["cta"] + 1.2), (T["appstore"] - 0.2, T["gallery"] + 0.6), (T["dot"], T["filmEnd"])]
out = ROOT / "out/draft/sw"
out.mkdir(parents=True, exist_ok=True)
rows = []
for i, (a, b) in enumerate(wins):
    f = out / f"{lang}-{shape}-{i:02d}.jpg"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.2f}", "-t", f"{b - a:.2f}", "-i", str(ROOT / f"out/draft/{lang}-{shape}.mp4"),
                    "-vf", f"fps={fps},scale=150:-1,drawtext=text='%{{pts\\:hms}}':x=3:y=3:fontsize=11:fontcolor=red,tile=9x1", "-frames:v", "1", str(f)], check=True)
    rows.append(Image.open(f))
W = max(r.width for r in rows)
sheet = Image.new("RGB", (W * 2 + 10, ((len(rows) + 1) // 2) * (rows[0].height + 6)), "#222")
for i, r in enumerate(rows):
    sheet.paste(r, ((i % 2) * (W + 10), (i // 2) * (rows[0].height + 6)))
sheet.save(ROOT / f"out/draft/sweep-{lang}-{shape}.jpg", quality=82)
print(sheet.size)
