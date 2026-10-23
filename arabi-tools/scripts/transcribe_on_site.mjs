// Transcribe a file on the live site, as a visitor would, and save its SRT cues and TXT file.
// usage: NODE_PATH=<dir with puppeteer-core> node scripts/transcribe_on_site.mjs out/vo_track.mp3 src/data/transcript.json
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const require = createRequire(path.join(process.env.NODE_PATH ?? ".", "x.js"));
const puppeteer = require("puppeteer-core");

const [audio, out] = process.argv.slice(2);
// Upload under the name the film shows.
const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "arabi-")), "أدوات-العربية.mp3");
fs.copyFileSync(audio, file);
const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"], protocolTimeout: 900000 });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto("https://arabi.tools/transcribe", { waitUntil: "networkidle2" });
const input = await page.$("#upload-form input[type=file]");
await input.uploadFile(path.resolve(file));
await page.click("#upload-form button[type=submit]");
// The status page updates live; poll it and log each change.
let last = "";
for (const started = Date.now(); Date.now() - started < 900000; await new Promise((r) => setTimeout(r, 2000))) {
  const state = await page.evaluate(() => {
    const job = document.querySelector(".job");
    if (job) return `${job.dataset.state} ${document.querySelector("#job-status")?.textContent ?? ""} ${document.querySelector(".percent")?.textContent ?? ""}`;
    const error = document.querySelector("#upload-form .error:not([hidden])");
    return error ? `error ${error.textContent}` : "uploading";
  });
  if (state !== last) console.error(`${new Date().toISOString().slice(11, 19)} ${state}`);
  last = state;
  if (/^(done|failed|error)/.test(state)) break;
}
if (!last.startsWith("done")) throw new Error(`transcription did not finish: ${last}`);
const result = await page.evaluate(async () => {
  const links = [...document.querySelectorAll(".downloads a")].map((a) => a.href);
  const [txt, srt] = await Promise.all(links.map(async (href) => (await fetch(href)).text()));
  return { name: document.querySelector(".result-name")?.textContent.trim(), txt, srt };
});
const cues = result.srt.trim().split("\n\n").map((block) => {
  const [n, times, ...text] = block.split("\n");
  const [start, end] = times.split(" --> ");
  return { n: Number(n), start, end, text: text.join(" ") };
});
const transcript = {
  source: "https://arabi.tools/transcribe",
  file: path.basename(file),
  name: result.name,
  transcribedAt: new Date().toISOString(),
  note: "The film's own narration (out/vo_track.mp3) transcribed on the live site; unedited.",
  cues,
  txt: result.txt,
};
fs.writeFileSync(out, JSON.stringify(transcript, null, 1));
console.log(`${cues.length} cues → ${out}`);
await browser.close();
