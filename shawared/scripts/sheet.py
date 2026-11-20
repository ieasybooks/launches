"""Contact sheet of stills: sheet.py out.jpg cols width img1 img2 … (each labelled with its file name)."""
import sys
from PIL import Image, ImageDraw
out, cols, width, *paths = sys.argv[1:]
cols, width = int(cols), int(width)
ims = [Image.open(p).convert("RGB") for p in paths]
w = width
h = int(ims[0].height * w / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w + (cols + 1) * 8, rows * (h + 26) + 8), "#333")
d = ImageDraw.Draw(sheet)
for i, (im, p) in enumerate(zip(ims, paths)):
    x = 8 + (i % cols) * (w + 8)
    y = 8 + (i // cols) * (h + 26)
    sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y + 18))
    d.text((x, y + 2), p.split("/")[-1], fill="#fff")
sheet.save(out, quality=88)
print(out, sheet.size)
