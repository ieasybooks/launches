// node scripts/measure.mjs → out/dbg/director.json (key times, duration and every sound event).
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

fs.mkdirSync("out/dbg", { recursive: true });
const browserExecutable = process.env.CHROME_PATH ?? undefined;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });
try {
  const composition = await selectComposition({ browserExecutable, serveUrl, id: "Measure" });
  await renderStill({
    browserExecutable,
    serveUrl, composition, frame: 0, output: "out/dbg/measure.png",
    onBrowserLog: (log) => {
      if (log.text.startsWith("DIRECTOR:")) fs.writeFileSync("out/dbg/director.json", log.text.slice(9));
    },
  });
} finally {
  fs.rmSync(serveUrl, { recursive: true, force: true });
}
console.log("wrote out/dbg/director.json");
