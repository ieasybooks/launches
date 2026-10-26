"""Split Kitab into two fonts with identical shaping: KitabLetters draws the letters (with hamza
and madda, which are spelling), KitabMarks draws only the diacritics. Stacked, they render the
same text as Kitab, so the film can colour and animate diacritics without moving a letter.
Both fonts drop Kitab's hamza+vowel ligatures, so a hamza and its vowel stay separate glyphs.
Run with `uv run --with fonttools python scripts/split_font.py`."""
import pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "public/fonts/Kitab.ttf"
SPELLING = ("uni0653", "uni0654", "uni0655")  # madda, hamza above, hamza below

def spelling(name):
    return name.split(".")[0] in SPELLING

def drop_hamza_ligatures(font):
    gsub = font["GSUB"].table
    dropped = 0
    for lookup in gsub.LookupList.Lookup:
        for sub in lookup.SubTable:
            sub = sub.ExtSubTable if lookup.LookupType == 7 else sub
            if not hasattr(sub, "ligatures"):
                continue
            for first in list(sub.ligatures):
                keep = [l for l in sub.ligatures[first] if not any(spelling(g) for g in [first, *l.Component])]
                dropped += len(sub.ligatures[first]) - len(keep)
                if keep:
                    sub.ligatures[first] = keep
                else:
                    del sub.ligatures[first]
    return dropped

def flatten(font):
    """Draw composite glyphs as plain outlines, so blanking a component (Kitab builds its damma
    from another glyph) cannot erase the glyphs that use it."""
    glyf, gs = font["glyf"], font.getGlyphSet()
    for name in font.getGlyphOrder():
        if glyf[name].isComposite():
            outline = DecomposingRecordingPen(gs)
            gs[name].draw(outline)
            pen = TTGlyphPen(None)
            outline.replay(pen)
            glyf[name] = pen.glyph()

def blank(font, names):
    for name in names:
        font["glyf"][name] = TTGlyphPen(None).glyph()  # no contours; the advance in hmtx is untouched

def rename(font, family):
    for rec in font["name"].names:
        if rec.nameID in (1, 3, 4, 6, 16):
            rec.string = family

probe = TTFont(SRC)
classes = probe["GDEF"].table.GlyphClassDef.classDefs
marks = {g for g, c in classes.items() if c == 3 and not spelling(g)}
letters = [g for g in probe.getGlyphOrder() if g not in marks and g != ".notdef"]
print(f"{len(marks)} diacritic glyphs, {len(letters)} others")
for family, hide in (("KitabLetters", marks), ("KitabMarks", letters)):
    font = TTFont(SRC)
    print("dropped", drop_hamza_ligatures(font), "hamza ligatures")
    flatten(font)
    blank(font, hide)
    rename(font, family)
    font.save(ROOT / f"public/fonts/{family}.ttf")
    print("wrote", family)
