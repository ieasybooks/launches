"""Draw every highlight box on the recording frame it sits on, for checking alignment.
usage: check_boxes.py [out.jpg]  (needs out/dbg/director.json from scripts/measure.mjs)"""
import json, subprocess, sys, pathlib
from PIL import Image, ImageDraw
ROOT = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((ROOT / "out/dbg/director.json").read_text())
clips = json.loads((ROOT / "src/data/clips.json").read_text())
out = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / "out/dbg/boxes.jpg")
tiles = []
for i, sp in enumerate(d["SPOTS"]):
    info = clips[sp["clip"]]
    frame = min(info["frames"] - 1, max(0, round(sp["v"] * info["fps"])))
    png = ROOT / f"out/dbg/box-{i}.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(ROOT / "public" / info["src"]), "-vf", f"select=eq(n\\,{frame})", "-frames:v", "1", str(png)], check=True)
    im = Image.open(png).convert("RGB")
    x, y, w, h = [v * 2 for v in sp["box"]]
    dr = ImageDraw.Draw(im)
    dr.rectangle([x, y, x + w, y + h], outline=(230, 40, 20), width=4)
    m = 90
    crop = im.crop((max(0, x - m), max(0, y - m), min(2560, x + w + m), min(1600, y + h + m)))
    crop.thumbnail((620, 300))
    tile = Image.new("RGB", (640, 330), "white")
    tile.paste(crop, (10, 24))
    ImageDraw.Draw(tile).text((10, 4), f"#{i} t={sp['t0']:.1f} {sp['clip']} v={sp['v']:.2f} box={sp['box']}", fill="black")
    tiles.append(tile)
cols = 3
sheet = Image.new("RGB", (640 * cols, 330 * ((len(tiles) + cols - 1) // cols)), "white")
for i, tl in enumerate(tiles):
    sheet.paste(tl, ((i % cols) * 640, (i // cols) * 330))
sheet.save(out, quality=85)
print(len(tiles), "boxes →", out)
