"""Crop a recording frame with a CSS-pixel grid, to measure boxes.
usage: grid_crop.py clip v x0 y0 x1 y1 out.png [step]   (CSS px of the 1280×800 recording)"""
import json, subprocess, sys, pathlib
from PIL import Image, ImageDraw
ROOT = pathlib.Path(__file__).resolve().parent.parent
clip, v, x0, y0, x1, y1, out = sys.argv[1], float(sys.argv[2]), *map(int, sys.argv[3:7]), sys.argv[7]
step = int(sys.argv[8]) if len(sys.argv) > 8 else 10
info = json.loads((ROOT / "src/data/clips.json").read_text())[clip]
frame = min(info["frames"] - 1, round(v * info["fps"]))
tmp = ROOT / "out/dbg/grid.png"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(ROOT / "public" / info["src"]), "-vf", f"select=eq(n\\,{frame})", "-frames:v", "1", str(tmp)], check=True)
im = Image.open(tmp).convert("RGB").crop((x0 * 2, y0 * 2, x1 * 2, y1 * 2))
dr = ImageDraw.Draw(im)
for x in range((x0 // step + 1) * step, x1, step):
    major = x % (step * 5) == 0
    dr.line([((x - x0) * 2, 0), ((x - x0) * 2, im.height)], fill=(255, 0, 0) if major else (255, 170, 170), width=1)
    if major: dr.text(((x - x0) * 2 + 2, 2), str(x), fill=(200, 0, 0))
for y in range((y0 // step + 1) * step, y1, step):
    major = y % (step * 5) == 0
    dr.line([(0, (y - y0) * 2), (im.width, (y - y0) * 2)], fill=(0, 0, 255) if major else (170, 170, 255), width=1)
    if major: dr.text((2, (y - y0) * 2 + 2), str(y), fill=(0, 0, 200))
im.save(out)
print(out, im.size)
