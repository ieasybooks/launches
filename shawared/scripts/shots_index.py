"""Write src/data/shots/index.ts, which imports every recorded screen (capture/capture.mjs)."""
import glob, os, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
names = sorted(os.path.basename(f)[:-5] for f in glob.glob(str(ROOT / "src/data/shots/*.json")))
ident = lambda n: "s_" + re.sub(r"[^a-zA-Z0-9]", "_", n)
lines = ["// The app's recorded screens (capture/capture.mjs), keyed <lang>-<state>. Written by scripts/shots_index.py.",
         'import type { ShotData } from "../../film/parts/Shot";']
lines += [f'import {ident(n)} from "./{n}.json";' for n in names]
lines += ["export const SHOTS: Record<string, ShotData> = {"] + [f'  "{n}": {ident(n)} as unknown as ShotData,' for n in names] + ["};"]
(ROOT / "src/data/shots/index.ts").write_text("\n".join(lines) + "\n")
print(len(names), "screens")
