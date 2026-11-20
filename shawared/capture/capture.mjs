// Records the live Shawared app (shawared.com) in every state the film shows, as an iPhone 16 Pro would lay it out
// (393 × 852 pt, safe areas 59 / 34), into src/data/shots/<lang>-<state>.json (see dom.js), plus a PNG of each.
// The web build is the apps' own code; the apps' download button (the web has none) is added as the apps place it.
// usage: node capture/capture.mjs [ar|en] [state…]
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "src/data/shots");
const PNG = path.join(ROOT, "capture/png");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PNG, { recursive: true });
const DOM = fs.readFileSync(path.join(ROOT, "capture/dom.js"), "utf8");
const [only, ...states] = process.argv.slice(2);
const LANGS = only ? [only] : ["ar", "en"];
const want = (s) => !states.length || states.includes(s);

const L = {
  ar: { base: "https://shawared.com", play: "تشغيل", night: "المظهر الليلي", playlist: "أضف إلى قائمة", favourite: "أضف إلى المفضّلة", download: "نزّل", maha: "المَها", close: "أغلق الشرح", back: "رجوع", poets: "الشعراء", reciters: "المُلقون" },
  en: { base: "https://shawared.com/en", play: "Play", night: "Switch to night", playlist: "Add to a playlist", favourite: "Add to favourites", download: "Download", maha: "المَها", close: "Close the explanation", back: "Back", poets: "Poets", reciters: "Reciters" },
};

const browser = await chromium.launch({ channel: "chrome", args: ["--autoplay-policy=no-user-gesture-required"] });

const open = async (lang, url) => {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, locale: lang === "ar" ? "ar" : "en-US" });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 59, bottom: 34, left: 0, right: 0 } });
  // keep a handle on the player's media element (the web player never puts it in the page)
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      window.__media = this;
      this.muted = true;
      return play.call(this);
    };
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  return { ctx, page };
};

const dump = async (page, lang, name) => {
  await page.waitForTimeout(450);
  const shot = await page.evaluate(DOM);
  fs.writeFileSync(path.join(OUT, `${lang}-${name}.json`), JSON.stringify(shot));
  await page.screenshot({ path: path.join(PNG, `${lang}-${name}.png`) });
  console.log(`${lang}-${name}: ${(JSON.stringify(shot).length / 1024).toFixed(0)} KB`);
};

// the apps' download button, beside the playlist button (Meta.tsx), as a clone of it with the download icon
const addDownload = async (page, lang) =>
  page.evaluate(({ playlist, favourite, download }) => {
    const pl = document.querySelector(`[aria-label="${playlist}"]`);
    const fav = document.querySelector(`[aria-label="${favourite}"]`);
    if (!pl || !fav || document.querySelector('[data-film="download"]')) return;
    // the actions row holds the heart and the playlist menu side by side
    let row = pl.parentElement;
    while (row && !(row.contains(fav) && getComputedStyle(row).flexDirection === "row")) row = row.parentElement;
    let item = pl;
    while (item.parentElement !== row) item = item.parentElement;
    const dl = item.cloneNode(true);
    dl.setAttribute("data-film", "download");
    const btn = dl.matches(`[aria-label="${playlist}"]`) ? dl : dl.querySelector(`[aria-label="${playlist}"]`);
    btn.setAttribute("aria-label", download);
    const svg = btn.querySelector("svg");
    const stroke = svg.querySelector("[stroke]")?.getAttribute("stroke") ?? "currentColor";
    svg.innerHTML = `<path fill="none" stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"></path>`;
    item.after(dl);
  }, { playlist: L[lang].playlist, favourite: L[lang].favourite, download: L[lang].download });

// play, then hold the recording nearly still at `t` so the screen shows that moment while "playing"
const at = async (page, t) => {
  await page.evaluate(async (t) => {
    const m = window.__media;
    m.playbackRate = 0.0625;
    m.currentTime = t;
    if (m.paused) await m.play();
  }, t);
  await page.waitForTimeout(700);
};

for (const lang of LANGS) {
  const l = L[lang];
  {
    const { ctx, page } = await open(lang, `${l.base}/poems/uyun-al-maha`);
    await addDownload(page, lang);
    if (want("open")) await dump(page, lang, "open");
    await page.locator(`[aria-label="${l.play}"]:visible`).first().click();
    await page.waitForFunction(() => window.__media && !window.__media.paused);
    await addDownload(page, lang);
    // the opening's verse ends: the recording paused at the end of bayt 1
    await at(page, 10.3);
    await page.evaluate(() => window.__media.pause());
    if (want("p1")) await dump(page, lang, "p1");
    // then bayt 2 is recited
    for (const [name, t] of [["b2a", 11.4], ["b2b", 13.2], ["b2c", 15.0], ["b2ajuz", 18.0]]) {
      await at(page, t);
      if (want(name)) await dump(page, lang, name);
    }
    // a word opens its bayt's notes, the meaning picked out; then the sheet is closed again
    await at(page, 15.0);
    await page.locator(`[aria-label="${l.maha}"]:visible`).first().click();
    await page.waitForTimeout(1200);
    if (want("sheet")) await dump(page, lang, "sheet");
    await page.locator(`[aria-label="${l.close}"]:visible`).first().click();
    await page.waitForTimeout(900);
    // the library's tabs, with the poem still playing in the mini player
    await page.locator(`[aria-label="${l.back}"]:visible`).first().click();
    await page.waitForTimeout(1500);
    for (const tab of ["poets", "reciters"]) {
      await page.locator(`[role="tab"]:has-text("${l[tab]}"), a:has-text("${l[tab]}")`).last().click();
      await page.waitForTimeout(1500);
      if (want(tab)) await dump(page, lang, tab);
    }
    await ctx.close();
  }
  if (want("night")) {
    const { ctx, page } = await open(lang, `${l.base}/poems/uyun-al-maha`);
    await page.locator(`[aria-label="${l.night}"]:visible`).first().click();
    await page.waitForTimeout(800);
    await addDownload(page, lang);
    await page.locator(`[aria-label="${l.play}"]:visible`).first().click();
    await page.waitForFunction(() => window.__media && !window.__media.paused);
    await at(page, 13.2);
    await dump(page, lang, "night");
    await ctx.close();
  }
}
await browser.close();
