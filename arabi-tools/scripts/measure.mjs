// node scripts/measure.mjs → out/dbg/director.json (key times, duration and every sound event).
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

fs.mkdirSync("out/dbg", { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });
const composition = await selectComposition({ serveUrl, id: "Measure" });
await renderStill({
  serveUrl, composition, frame: 0, output: "out/dbg/measure.png",
  onBrowserLog: (log) => {
    if (log.text.startsWith("DIRECTOR:")) fs.writeFileSync("out/dbg/director.json", log.text.slice(9));
  },
});
fs.rmSync(serveUrl, { recursive: true, force: true });
console.log("wrote out/dbg/director.json");
