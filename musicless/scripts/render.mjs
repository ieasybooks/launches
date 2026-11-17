// Render a composition: node scripts/render.mjs <id> <out.mp4> [--scale=0.5] [--from=s --to=s] [--muted] [--crf=18] [--chunk=s]
// --chunk renders the film in pieces of that many seconds, each in a fresh browser (a long render can exhaust a
// tab's memory on a busy machine), then joins them without re-encoding. A part that stops producing frames (a
// crashed browser can leave the render waiting forever) is cancelled after --stall seconds (default 90) and tried
// again.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { makeCancelSignal, renderMedia, selectComposition } from "@remotion/renderer";

const [id, output, ...flags] = process.argv.slice(2);
const opt = Object.fromEntries(flags.map((f) => f.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
const browserExecutable = process.env.CHROME_PATH ?? undefined;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });

const STALL = (opt.stall ? Number(opt.stall) : 90) * 1000;

const render = async (composition, frameRange, outputLocation, label) => {
  const started = Date.now();
  let last = 0;
  let lastFrames = -1;
  let lastChange = Date.now();
  const { cancelSignal, cancel } = makeCancelSignal();
  let stalled = false;
  let giveUp;
  // if even the cancelled render never settles, stop waiting for it 30 s later
  const abandoned = new Promise((_, reject) => (giveUp = reject));
  const watchdog = setInterval(() => {
    if (Date.now() - lastChange > STALL) {
      stalled = true;
      clearInterval(watchdog);
      console.log(`${label}no new frames for ${STALL / 1000}s: cancelling`);
      cancel();
      setTimeout(() => giveUp(new Error("the cancelled render did not stop")), 30000).unref();
    }
  }, 5000);
  try {
  await Promise.race([abandoned, renderMedia({
    cancelSignal,
    browserExecutable,
    serveUrl,
    composition,
    codec: "h264",
    outputLocation,
    scale: opt.scale ? Number(opt.scale) : 1,
    frameRange,
    muted: !!opt.muted,
    crf: opt.crf ? Number(opt.crf) : 18,
    pixelFormat: "yuv420p",
    x264Preset: opt.preset ?? "medium",
    audioCodec: "aac",
    audioBitrate: "256k",
    concurrency: opt.concurrency ? Number(opt.concurrency) : 2,
    chromiumOptions: { gl: opt.gl ?? "angle" },
    imageFormat: opt.png ? "png" : "jpeg",
    jpegQuality: 96,
    colorSpace: "bt709",
    onProgress: ({ progress, renderedFrames }) => {
      const now = Date.now();
      if (renderedFrames !== lastFrames) {
        lastFrames = renderedFrames;
        lastChange = now;
      }
      if (now - last > 15000) {
        last = now;
        console.log(`${label}${(progress * 100).toFixed(1)}%  frames=${renderedFrames}  ${((now - started) / 1000).toFixed(0)}s`);
      }
    },
  })]);
  } catch (err) {
    throw stalled ? new Error(`stalled (${String(err.message ?? err).split("\n")[0]})`) : err;
  } finally {
    clearInterval(watchdog);
  }
  console.log(`${label}done ${outputLocation} in ${((Date.now() - started) / 1000).toFixed(0)}s`);
};

try {
  const composition = await selectComposition({ browserExecutable, serveUrl, id });
  const fps = composition.fps;
  const last = composition.durationInFrames - 1;
  const from = opt.from ? Math.round(Number(opt.from) * fps) : 0;
  const to = opt.to ? Math.min(last, Math.round(Number(opt.to) * fps)) : last;
  if (!opt.chunk) {
    await render(composition, opt.from ? [from, to] : null, output, "");
  } else {
    const size = Math.round(Number(opt.chunk) * fps);
    const dir = `${output}.parts`;
    fs.mkdirSync(dir, { recursive: true });
    const parts = [];
    for (let a = from, i = 0; a <= to; a += size, i++) {
      const b = Math.min(to, a + size - 1);
      const part = path.resolve(dir, `part-${String(i).padStart(3, "0")}.mp4`);
      // a part already rendered with the same frames is kept (a failed run resumes where it stopped)
      const done = `${part}.frames`;
      if (!(fs.existsSync(part) && fs.existsSync(done) && fs.readFileSync(done, "utf8") === `${a}-${b}`)) {
        // a tab can still die on a busy machine: try the part again in a fresh browser
        for (let attempt = 1; ; attempt++) {
          try {
            await render(composition, [a, b], part, `[part ${i + 1}: frames ${a}–${b}] `);
            break;
          } catch (err) {
            if (attempt >= 3) throw err;
            console.log(`[part ${i + 1}] attempt ${attempt} failed (${String(err.message ?? err).split("\n")[0]}); retrying`);
          }
        }
        fs.writeFileSync(done, `${a}-${b}`);
      }
      parts.push(part);
    }
    const list = path.resolve(dir, "list.txt");
    fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join("\n") + "\n");
    execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", output], { stdio: "inherit" });
    const frames = Number(execFileSync("ffprobe", ["-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", output]).toString().trim());
    if (frames !== to - from + 1) throw new Error(`joined ${frames} frames, expected ${to - from + 1}`);
    console.log(`joined ${parts.length} parts into ${output} (${frames} frames)`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  fs.rmSync(serveUrl, { recursive: true, force: true });
  // an abandoned browser must not keep the process alive
  process.exit(process.exitCode ?? 0);
}
