"""Sanity-check the director after timing changes: anchors that slipped behind their cue, clicks before the
cursor arrives, and how fast each stretch of each recording plays."""
import json
d = json.load(open("out/dbg/director.json"))
print("film duration", round(d["DURATION"], 2))
problems = 0
for l in d["LAG"]:
    problems += 1
    print(f"lag {l['t'] - l['want']:.2f}s in {l['shot']} at {l['t']:.2f} (cue {l['want']:.2f})")
cur = d["CURSOR"]
for c in d["CLICKS"]:
    keys = [k for k in cur if k["t"] <= c + 1e-6]
    if not keys:
        continue
    k = keys[-1]
    arrive = k["t"] + k.get("d", 0.5)
    if arrive > c + 0.03:
        problems += 1
        print(f"click at {c:.2f} before the cursor arrives ({arrive:.2f})")
for s in d["SHOTS"]:
    A = s["anchors"]
    rates = []
    for a, b in zip(A, A[1:]):
        dv, df = b["v"] - a["v"], b["f"] - a["f"]
        rates.append(f"{a['f']:.1f}→{b['f']:.1f} {'×%.1f' % (dv / df) if dv > df else 'hold %.1fs' % (df - dv)}{' ff' if b['ff'] else ''}")
    print(f"{s['id']:12s} {s['f0']:6.2f}–{s['f1']:6.2f}  " + " | ".join(rates))
print("problems:", problems)
