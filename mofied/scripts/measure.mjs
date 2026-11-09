// node scripts/measure.mjs <ar|en> → out/dbg/director-<lang>.json
// (key times, scene windows, narration order and every sound event).
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const [lang = "ar"] = process.argv.slice(2);
fs.mkdirSync("out/dbg", { recursive: true });
const out = `out/dbg/director-${lang}.json`;
const browserExecutable = process.env.CHROME_PATH ?? undefined;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });
try {
  const inputProps = { lang };
  const composition = await selectComposition({ browserExecutable, serveUrl, id: "Measure", inputProps });
  await renderStill({
    browserExecutable,
    serveUrl, composition, frame: 0, output: "out/dbg/measure.png", inputProps,
    onBrowserLog: (log) => {
      if (log.text.startsWith("DIRECTOR:")) fs.writeFileSync(out, log.text.slice(9));
    },
  });
} finally {
  fs.rmSync(serveUrl, { recursive: true, force: true });
}
console.log("wrote", out);
