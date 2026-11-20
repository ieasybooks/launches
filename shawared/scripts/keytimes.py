"""Times of the film's key moments (from out/dbg/director-<lang>.json), for stills: keytimes.py <lang>"""
import json, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
T = json.loads((ROOT / f"out/dbg/director-{sys.argv[1]}.json").read_text())["T"]
keys = [0.5, T["rec1"] + 3.2, T["maha"] + 0.5, T["tagline"] + 0.6, T["hear"] + 0.3, T["follow"] + 0.5, T["rec2"] + 2.5,
        T["verse"] + 0.3, T["eyes"] + 1.0, T["rec2Ajuz"] + 1.5, T["shawqi"] + 0.2, T["byPoet"] + 0.5, T["byReciter"] + 0.5,
        T["night"] - 0.2, T["download"] + 0.9, T["offline"] + 0.4, T["account"] + 0.3, T["gallery"] + 0.4, T["dot"] + 0.8, T["filmEnd"] - 0.4]
print(" ".join(f"{k:.2f}" for k in keys))
