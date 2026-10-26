"""Read the paragraphs of the sample document and of the site's unedited DOCX result into
src/data/lesson.json, so the film can show both pages without parsing Word files."""
import hashlib, json, pathlib, zipfile
import xml.etree.ElementTree as ET
ROOT = pathlib.Path(__file__).resolve().parent.parent
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

def paragraphs(path):
    root = ET.fromstring(zipfile.ZipFile(path).read("word/document.xml"))
    texts = ["".join(t.text or "" for t in p.iter(W + "t")) for p in root.iter(W + "p")]
    return [t for t in texts if t]

source, result = ROOT / "src/data/فضل-العلم.docx", ROOT / "src/data/lesson-catt-result.docx"
data = {
    "file": source.name,
    "bytes": source.stat().st_size,
    "sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
    "plain": paragraphs(source),
    "marked": paragraphs(result),
}
assert len(data["plain"]) == len(data["marked"])
(ROOT / "src/data/lesson.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(data, ensure_ascii=False, indent=2))
