// Copies the Musicless website as a phone shows it into the film: the built page's markup (both languages), its two
// stylesheets flattened for a 412-pixel-wide phone, and the audio tool's own words (landing/audio/copy.js).
// usage: MUSICLESS_REPO=~/path/to/musicless node scripts/site_snapshot.mjs   (after `npm run build:landing` there)
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const REPO = path.resolve(process.env.MUSICLESS_REPO ?? path.join(ROOT, "../../musicless"));
const DIST = path.join(REPO, "dist/landing");
const VW = 412; // the phone's width in CSS pixels (a Pixel 8)
const out = path.join(ROOT, "src/data");

// The stylesheets as the phone applies them: the narrow-screen rules always on, the rest of the media queries off,
// viewport units at the phone's width, Android's own fonts in place of the system stacks (Roboto, Noto Naskh Arabic,
// a monospace), the page's Alexandria subset under its own name, and :root/body moved onto the page's own boxes
// (the page lives in a shadow root inside the film).
const flatten = (css) => {
  let s = css.replace(/@font-face\s*{[^}]*}/g, "");
  // media blocks: keep the inner rules of the phone-width ones, drop the others
  const keep = [/max-width:\s*(700|480)px/];
  let outCss = "";
  for (let i = 0; i < s.length; ) {
    const at = s.indexOf("@media", i);
    if (at < 0) { outCss += s.slice(i); break; }
    outCss += s.slice(i, at);
    const open = s.indexOf("{", at);
    const cond = s.slice(at, open);
    let depth = 1, j = open + 1;
    while (depth && j < s.length) { if (s[j] === "{") depth++; else if (s[j] === "}") depth--; j++; }
    const inner = s.slice(open + 1, j - 1);
    if (keep.some((re) => re.test(cond))) outCss += inner;
    i = j;
  }
  s = outCss;
  s = s.replace(/(\d+(?:\.\d+)?)vw/g, (_, n) => `${(+n * VW) / 100}px`);
  s = s.replace(/-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif/g, "'Roboto', 'Noto Naskh Arabic', sans-serif");
  s = s.replace(/Tahoma, 'Segoe UI', sans-serif/g, "'Roboto', 'Noto Naskh Arabic', sans-serif");
  s = s.replace(/Alexandria, Tahoma, sans-serif/g, "'Alexandria Site', 'Roboto', 'Noto Naskh Arabic', sans-serif");
  s = s.replace(/ui-monospace, monospace/g, "'Noto Sans Mono', monospace");
  s = s.replace(/:root\b/g, ".ml-root").replace(/\[lang=ar\] body\b/g, "[lang=ar] .ml-body").replace(/(^|[\s}])body\s*{/g, "$1.ml-body {");
  s = s.replace(/scroll-behavior:\s*smooth;/g, "");
  return s.replace(/\n{2,}/g, "\n").trim();
};

const css = ["assets/site.css", "assets/audio.css"].map((f) => flatten(fs.readFileSync(path.join(DIST, f), "utf8"))).join("\n");
// the tabs' panels are shown by mode classes on the page's root, so the film never rewrites the page itself
const modes = `
.mode-files #youtube-panel, .mode-files [data-youtube-section], .mode-files [data-youtube-questions] { display: none !important; }
.mode-youtube #files-panel, .mode-youtube [data-files-questions] { display: none !important; }`;
fs.writeFileSync(path.join(out, "site-css.json"), JSON.stringify({ css: css + modes }));

for (const lang of ["en", "ar"]) {
  const html = fs.readFileSync(path.join(DIST, lang, "index.html"), "utf8");
  let body = html.slice(html.indexOf("<body>") + 6, html.indexOf("</body>"));
  body = body
    .replace(/<a class="skip"[^>]*>.*?<\/a>/s, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    // panels are shown and hidden by mode classes instead of the hidden attribute
    .replace(/(id="files-panel"[^>]*?) hidden/, "$1")
    .replace(/(data-files-questions) hidden/, "$1")
    // assets come from the film's public/site
    .replace(/(src|href)="\/assets\//g, '$1="{{site}}/');
  if (!body.includes('id="audio-workspace"')) throw new Error(`no workspace in ${lang}`);
  fs.writeFileSync(path.join(out, `site-${lang}.json`), JSON.stringify({ body }));
}

const { audioCopy } = await import(pathToFileURL(path.join(REPO, "landing/audio/copy.js")).href);
fs.writeFileSync(path.join(out, "audio-copy.json"), JSON.stringify(audioCopy, null, 1));
for (const f of ["alexandria-arabic.woff2", "musicless-logo-ink.svg", "musicless-logo-ar-ink.svg", "store-icons.svg", "poster-en.svg", "poster-ar.svg", "player-on.svg"])
  fs.copyFileSync(path.join(DIST, "assets", f), path.join(ROOT, "public/site", f));
console.log("site snapshot from", REPO, "→ src/data/site-*.json, audio-copy.json, public/site");
