// node scripts/measure.mjs → dumps the director's data (timings, sound events, shots) to out/dbg/director.json
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

fs.mkdirSync("out/dbg", { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });
const composition = await selectComposition({ serveUrl, id: "Measure" });
await renderStill({
  serveUrl,
  composition,
  frame: 0,
  output: "out/dbg/measure.jpeg",
  imageFormat: "jpeg",
  onBrowserLog: (log) => {
    if (log.text.startsWith("DIRECTOR:")) fs.writeFileSync("out/dbg/director.json", log.text.slice(9));
  },
});
fs.rmSync(serveUrl, { recursive: true, force: true });
const d = JSON.parse(fs.readFileSync("out/dbg/director.json", "utf8"));
console.log(`duration ${d.DURATION.toFixed(2)}s, ${d.SOUND_EVENTS.length} sound events, ${d.SHOTS.length} shots`);
