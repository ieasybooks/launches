# Contact sheet of a recorded clip: every Nth frame with its time. Usage: sheet.py <clip dir> <step> <out.jpg> [start] [end]
import json, sys
from PIL import Image, ImageDraw
d = sys.argv[1]
step = int(sys.argv[2])
clip = json.load(open(f"{d}/clip.json"))
t0 = clip["started"]
frames = clip["frames"]
a = int(sys.argv[4]) if len(sys.argv) > 4 else 0
b = int(sys.argv[5]) if len(sys.argv) > 5 else len(frames)
picks = frames[a:b:step]
W, H, cols = 400, 250, 5
rows = (len(picks) + cols - 1) // cols
sheet = Image.new("RGB", (W * cols, H * rows), "white")
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(picks):
    im = Image.open(f"{d}/{f['file']}").convert("RGB").resize((W - 6, H - 22))
    x, y = (i % cols) * W, (i // cols) * H
    sheet.paste(im, (x + 3, y + 18))
    dr.text((x + 4, y + 2), f"{f['file']} t={f['t'] - t0:.2f}", fill="black")
sheet.save(sys.argv[3], quality=80)
print(len(picks), "frames →", sys.argv[3])
