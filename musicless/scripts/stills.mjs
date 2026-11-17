// Render stills from one bundle and one browser:
//   node scripts/stills.mjs <composition> <out-prefix> <spec...>
// spec = seconds (film compositions) or JSON props (UITest), e.g. 12.5 or '{"screen":"reader"}'
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const [id, prefix, ...specs] = process.argv.slice(2);
const browserExecutable = process.env.CHROME_PATH ?? undefined;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });
let browser;
try {
  browser = await openBrowser("chrome", { browserExecutable, chromiumOptions: { gl: "angle" } });
  for (const spec of specs) {
    const isProps = spec.startsWith("{");
    const inputProps = isProps ? JSON.parse(spec) : {};
    const composition = await selectComposition({ browserExecutable, serveUrl, id, inputProps, puppeteerInstance: browser });
    const frame = isProps ? 0 : Math.min(composition.durationInFrames - 1, Math.round(Number(spec) * composition.fps));
    const name = isProps ? Object.values(inputProps).join("-") : Number(spec).toFixed(2).padStart(6, "0");
    const output = `${prefix}-${name}.png`;
    await renderStill({ serveUrl, composition, frame, output, inputProps, imageFormat: "png", puppeteerInstance: browser });
    console.log(output);
  }
} finally {
  await browser?.close({ silent: true });
  fs.rmSync(serveUrl, { recursive: true, force: true });
}
