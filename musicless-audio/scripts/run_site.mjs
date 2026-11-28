// Runs the demo file through the real Musicless website (a local build: `npm run build:landing && PORT=8841 npm run
// preview:landing` in the musicless repository) and saves the audio tool's own download.
// usage: node scripts/run_site.mjs <en|ar> <file.mp3> <out.mp3>   (SITE=http://127.0.0.1:8841 by default)
import { chromium } from "playwright-core";
const [lang, file, out] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: lang === "ar" ? "ar" : "en-US", acceptDownloads: true });
const page = await ctx.newPage();
await page.goto(`${process.env.SITE ?? "http://127.0.0.1:8841"}/${lang}/#files`, { waitUntil: "networkidle" });
await page.setInputFiles('input[type="file"]', file);
await page.waitForSelector('[data-action="run"]', { timeout: 60000 });
const t0 = Date.now();
await page.click('[data-action="run"]');
const log = [];
let last = "";
while (!(await page.$('[data-action="processed"]'))) {
  const s = await page.evaluate(() => {
    const w = document.querySelector("#audio-workspace");
    return [w.querySelector("h2")?.textContent, w.querySelector(".audio-percent")?.textContent, document.querySelector("#audio-remaining")?.textContent].join(" | ");
  });
  if (s !== last) { log.push(`${((Date.now() - t0) / 1000).toFixed(1)}s ${s}`); last = s; }
  await page.waitForTimeout(250);
}
log.push(`${((Date.now() - t0) / 1000).toFixed(1)}s done`);
const [dl] = await Promise.all([page.waitForEvent("download"), page.click("a[download]")]);
await dl.saveAs(out);
console.log(log.join("\n"));
console.log("saved", out, dl.suggestedFilename());
await browser.close();
