"""Collect the real aljam3.com API data shown in the film into src/data/demo.json."""
import json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
D = ROOT / "data"
def load(n): return json.loads((D / n).read_text())
def plain(s): return re.sub(r"<[^>]+>", "", s).replace("&nbsp;", " ").replace("\r\n", "\n").replace("\r", "\n")
def excerpt(content, needle, length=300):
    text = re.sub(r"\s+", " ", plain(content)).strip()
    strip = lambda s: re.sub(r"[ً-ْٰـ]", "", s)
    i = strip(text).find(strip(needle.split()[0])) if needle else 0
    # map back roughly: count non-diacritic chars
    if i > 0:
        count, pos = -1, 0
        for pos, ch in enumerate(text):
            if not re.match(r"[ً-ْٰـ]", ch): count += 1
            if count == i: break
        start = max(0, pos - 60)
    else:
        start = 0
    out = text[start:start + length]
    return ("…" if start > 0 else "") + out + ("…" if start + length < len(text) else "")

def hit(p, q):
    b = p["book"]
    return {"page": p["number"], "bookId": b["id"], "title": plain(b["title"]), "author": (b.get("author") or {}).get("name", ""),
            "category": (b.get("category") or {}).get("name", ""), "excerpt": excerpt(p["content"], q)}

q = "إنما الأعمال بالنيات"
all_hits, seen = [], set()
for p in load("s_all.json")["pages"]:
    if p["book"]["id"] in seen: continue
    seen.add(p["book"]["id"]); all_hits.append(hit(p, q))
author_hits = [hit(p, q) for p in load("s_author.json")["pages"][:4]]
book_hits = [{"page": p["number"], "excerpt": excerpt(p["content"], "الأعمال", 220)} for p in load("s_book_aamal.json")["pages"][:6]]
pages = {n: load(f"page4971_{n}.json")["pages"][0]["content"].replace("\r\n", "\n") for n in (28, 29, 30)}
libs = load("libraries.json")["libraries"]
cats = load("categories.json")["categories"]
book = load("book1889.json")
data = {
  "query": q,
  "libraries": [{"name": l["name"], "count": l["books_count"]} for l in libs],
  "categories": [{"id": c["id"], "name": c["name"], "count": c.get("books_count", 0)} for c in cats],
  "riyad": {"id": 1889, "title": book["title"], "author": book["author"]["name"], "category": book["category"]["name"],
            "library": book["library"]["name"], "pages": book["pages_count"], "filePages": book["files"][0]["pages_count"]},
  "allHits": all_hits[:5], "allCount": load("s_all.json")["pagination"]["count"],
  "authorHits": author_hits, "authorCount": load("s_author.json")["pagination"]["count"],
  "bookHits": book_hits, "bookCount": load("s_book_aamal.json")["pagination"]["count"],
  # author search for «النووي»: the Riyad author (4622) first, then other real matches from the live API
  "authors": [{"id": a["id"], "name": plain(a["name"]), "count": a.get("books_count", 0)}
              for a in load("authors_q3.json")["authors"][:1] + [x for x in load("authors_nawawi.json")["authors"] if x["id"] in (7901, 7904, 6083, 31162)]],
  "pages": pages,
  "qayyimBooks": [{"title": plain(b["title"]), "author": (b.get("author") or {}).get("name", ""), "pages": b.get("pages_count", 0), "files": b.get("files_count", 1)}
                  for b in load("cat97.json")["books"] if b["id"] in (4081, 4100, 4110, 4072, 4085, 4111)],
  "offlineHits": [hit(p, "النية") for p in load("s_book_niyya.json")["pages"][1:2]] + [hit(p, "النية") for p in load("s_cat97_niyya.json")["pages"][:3:2]] + [hit(p, "النية") for p in load("s_book_niyya.json")["pages"][:1]],
}
(ROOT / "src/data/demo.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
for h in data["allHits"]: print(h["page"], h["title"], "|", h["excerpt"][:120])
print([h["title"] for h in data["authorHits"]])
