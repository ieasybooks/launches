# Contact sheet of a clip between two clip times. Usage: tsheet.py <clip dir> <t0> <t1> <n> <out.jpg>
import json, sys, bisect
from PIL import Image, ImageDraw
d, t0, t1, n, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
clip = json.load(open(f"{d}/clip.json"))
s = clip["started"]
ts = [f["t"] - s for f in clip["frames"]]
W, H, cols = 400, 250, 5
picks = []
for k in range(n):
    t = t0 + (t1 - t0) * k / max(n - 1, 1)
    i = max(0, bisect.bisect_right(ts, t) - 1)
    picks.append((t, clip["frames"][i]))
rows = (len(picks) + cols - 1) // cols
sheet = Image.new("RGB", (W * cols, H * rows), "white")
dr = ImageDraw.Draw(sheet)
for k, (t, f) in enumerate(picks):
    im = Image.open(f"{d}/{f['file']}").convert("RGB").resize((W - 6, H - 22))
    x, y = (k % cols) * W, (k // cols) * H
    sheet.paste(im, (x + 3, y + 18))
    dr.text((x + 4, y + 2), f"t={t:.2f} {f['file']}", fill="black")
sheet.save(out, quality=80)
print(out)
