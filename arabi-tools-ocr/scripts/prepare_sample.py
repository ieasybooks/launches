"""Make the image-only demonstration PDF from two pages of the historical Tabari scan.
Requires PyMuPDF. Source page numbers are one-based; no source text layer is copied.
"""
import hashlib, json, pathlib, sys
import pymupdf as fitz
ROOT = pathlib.Path(__file__).resolve().parent.parent
source = pathlib.Path(sys.argv[1])
pages = [15, 16]
doc = fitz.open(source)
sample = fitz.open()
for i, number in enumerate(pages, 1):
    page = doc[number - 1]
    pix = page.get_pixmap(matrix=fitz.Matrix(200 / 72, 200 / 72), alpha=False)
    jpg = pix.tobytes('jpeg', jpg_quality=94)
    target = sample.new_page(width=page.rect.width, height=page.rect.height)
    target.insert_image(target.rect, stream=jpg)
    (ROOT / f'public/scans/page-{i}.jpg').write_bytes(jpg)
output = ROOT / 'src/data/تاريخ-الطبري.pdf'
sample.save(output, garbage=4, deflate=True)
assert all(not page.get_text().strip() for page in fitz.open(output))
metadata = {
    'book': 'تاريخ الرسل والملوك — الطبري',
    'sourceFile': source.name,
    'sourceUrl': 'https://archive.org/details/tarkhalrusulwaal01abaruoft',
    'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'sourcePagesOneBased': pages,
    'sampleFile': output.name,
    'sampleSha256': hashlib.sha256(output.read_bytes()).hexdigest(),
    'pageCount': len(pages), 'renderDpi': 200,
    'note': 'Two historical scanned pages rasterized into an image-only PDF; scan JPEGs are the exact embedded images. No source OCR layer is used.',
    'rights': 'Historical edition before 1921; public-domain status inferred from age, as recorded in the fleet corpus MANIFEST.md.'
}
(ROOT / 'src/data/source.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
print(output.name, output.stat().st_size, 'bytes;', len(pages), 'image-only pages')
