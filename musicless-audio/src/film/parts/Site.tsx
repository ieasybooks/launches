import React, { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import siteAr from "../../data/site-ar.json";
import siteCss from "../../data/site-css.json";
import siteEn from "../../data/site-en.json";
import type { Lang } from "../../lib/timeline";
import { SITE } from "../copy";
import { SCREEN } from "../context";

// The Musicless website as the phone shows it: the built page's own markup and stylesheets (scripts/site_snapshot.mjs)
// in a shadow root, so its styles and the film's never meet. The audio tool's states are drawn by the same templates
// as landing/audio/app.js (render(), row(), button(), icons), with the tool's own words.

export type Ws =
  | { state: "empty" }
  | { state: "checking" }
  | { state: "ready" }
  | { state: "working"; phase: "preflight" | "download" | "verify" | "initialize" | "processing" | "export"; percent: number | null; remaining: number | null }
  | { state: "done"; listening: "processed" | "original"; playing: boolean; position: number };
export type SiteView = {
  mode: "youtube" | "files";
  ws: Ws;
  scroll: number;
  /** fades the empty workspace's contents (0–1) */
  dim?: number;
  /** a change of state, drawn as the film's own transition (the tool itself switches at once), `k` 0–1: the previous
   *  state's contents fade out, then the new ones fade in, while the workspace's height goes from the old one to the
   *  new one. When both states show the same file, its row stays where it is and only what changes in it fades. */
  change?: { from: Ws; k: number; height: number };
  /** the file row's opacity, while the film's own card of it lies over it (so the row never shows under the card
   *  before it has landed) */
  row?: number;
  /** the tabs partway from "On YouTube" (0) to "Audio files" (1): the underline slides and the colours change, as
   *  the film draws the switch (the page itself swaps at once) */
  tabs?: number;
};
export type DemoFile = { name: string; size: number; duration: number };

const BODY: Record<Lang, string> = { en: siteEn.body, ar: siteAr.body };
const escape = (v: string) => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const time = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const icons = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke-width="3"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5"/></svg>',
};

/** The file row, as app.js's row() builds it; while the file is checked its format and length are not known yet. */
export const fileRowHtml = (file: DemoFile, checking: boolean, extra = "") => {
  const info = checking ? null : { format: "mp3", duration: file.duration };
  return `<div class="audio-file-row"><span class="audio-file-type">${info ? info.format.toUpperCase() : "—"}</span><div class="audio-file-info"><p class="audio-file-name" dir="auto" title="${escape(file.name)}">${escape(file.name)}</p><p class="audio-meta"><bdi>${info ? time(info.duration) + " · " : ""}${(file.size / 1024 / 1024).toFixed(1)} MB</bdi></p></div>${extra}</div>`;
};

/** The workspace's inner HTML for a state, exactly as app.js's render() builds it. */
export const workspaceHtml = (lang: Lang, ws: Ws, file: DemoFile) => {
  const c = SITE[lang] as typeof SITE.en & Record<string, string>;
  const format = "mp3";
  const formatText = (text: string) => text.replace("{format}", format.toUpperCase());
  const button = (action: string, text: string, primary = false, disabled = false) =>
    `<button type="button" class="${primary ? "button audio-primary" : "audio-text"}" data-action="${action}"${disabled ? " disabled" : ""}>${text}</button>`;
  const row = (change = false) => `${fileRowHtml(file, ws.state === "checking", change ? button("choose", c.change) : "")}<hr>`;
  const timeLeft = (seconds: number | null) => {
    if (seconds === null) return "";
    if (seconds < 60) return c.left.soon;
    const minutes = Math.ceil(seconds / 60);
    const left = c.left as Record<string, string>;
    return (left[new Intl.PluralRules(lang).select(minutes)] || left.other).replace("{n}", String(minutes));
  };
  if (ws.state === "empty")
    return `<div class="audio-empty"><div><h2>${c.drop}</h2><p class="audio-small">${c.types}</p></div>${button("choose", c.choose, true)}<p class="audio-hint">${c.limits}</p></div>`;
  if (ws.state === "ready")
    return `${row(true)}<div class="audio-ready"><p class="audio-small">${formatText(c.output)}</p>${button("run", c.remove, true)}<p class="audio-hint">${c.first}</p></div>`;
  if (ws.state === "checking" || ws.state === "working") {
    const label = ws.state === "checking" ? "checking" : ws.phase;
    const percent = ws.state === "checking" ? null : ws.percent;
    const remaining = ws.state === "checking" ? null : ws.remaining;
    return `${row()}<div class="audio-progress-content"><div class="audio-status-heading"><h2>${c[label]}</h2><span class="audio-percent" aria-hidden="true">${percent === null ? "" : percent + "%"}</span></div><progress max="100"${percent === null ? "" : ` value="${percent}"`} aria-label="${c[label]}"></progress><p class="audio-small" id="audio-progress-copy">${c[label + "Copy"]}</p>${label === "processing" ? `<p class="audio-small" id="audio-remaining">${timeLeft(remaining)}</p>` : ""}</div><div class="audio-cancel">${button("cancel", c.cancel)}</div>`;
  }
  const d = ws;
  const resultName = file.name.replace(/\.(mp3|m4a)$/i, "") + "-musicless." + format;
  return `${row()}<h2>${c.done}</h2><div class="audio-listen" role="group" aria-label="${c.compare}"><button type="button" data-action="processed" aria-pressed="${d.listening === "processed"}">${c.processed}</button><button type="button" data-action="original" aria-pressed="${d.listening === "original"}">${c.original}</button></div><div class="audio-player" dir="ltr"><button type="button" class="audio-play" data-action="play" aria-label="${d.playing ? c.pause : c.play}">${d.playing ? icons.pause : icons.play}</button><input type="range" min="0" max="${file.duration}" step="0.1" value="${d.position.toFixed(1)}" aria-label="${c.seek}" id="audio-seek"><span class="audio-time"><span id="audio-elapsed">${time(d.position)}</span> / ${time(file.duration)}</span></div><p class="audio-small" id="audio-preview-error" role="status" hidden></p><div class="audio-done-actions"><a class="button audio-primary" href="#" download="${escape(resultName)}">${icons.download}${formatText(c.downloadFile)}</a>${button("reset", c.another)}</div>`;
};

// the film's own: while the tabs switch, the selected tab's underline is drawn by .ml-underline, which slides
const FILM_CSS = ".ml-moving .audio-modes button[aria-selected=true]::after { content: none; } .audio-modes { position: relative; } .ml-underline { position: absolute; bottom: -1px; height: 2px; background: var(--ink); pointer-events: none; }";
const pageHtml = (lang: Lang) =>
  `<style>${siteCss.css}\n${FILM_CSS}</style><div class="ml-root mode-youtube" lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}"><div class="ml-body">${BODY[lang].replaceAll("{{site}}", staticFile("site").replace(/\/$/, ""))}</div></div>`;

/** Puts a page in a shadow root and shows one view of it. */
const apply = (shadow: ShadowRoot, lang: Lang, view: SiteView, file: DemoFile) => {
  const root = shadow.querySelector(".ml-root") as HTMLElement;
  const body = shadow.querySelector(".ml-body") as HTMLElement;
  const moving = view.tabs !== undefined;
  root.className = `ml-root mode-${view.mode}${moving ? " ml-moving" : ""}`;
  const tabs = [...shadow.querySelectorAll<HTMLElement>("[data-mode]")];
  for (const tab of tabs) tab.setAttribute("aria-selected", String(tab.dataset.mode === view.mode));
  const modes = shadow.querySelector<HTMLElement>(".audio-modes");
  if (modes) {
    let line = modes.querySelector<HTMLElement>(".ml-underline");
    if (!line) {
      line = document.createElement("span");
      line.className = "ml-underline";
      modes.appendChild(line);
    }
    line.style.display = moving ? "" : "none";
    const yt = tabs.find((b) => b.dataset.mode === "youtube");
    const fl = tabs.find((b) => b.dataset.mode === "files");
    if (moving && yt && fl) {
      const k = view.tabs!;
      line.style.left = `${yt.offsetLeft + (fl.offsetLeft - yt.offsetLeft) * k}px`;
      line.style.width = `${yt.offsetWidth + (fl.offsetWidth - yt.offsetWidth) * k}px`;
      yt.style.color = `color-mix(in srgb, var(--ink) ${(1 - k) * 100}%, var(--muted))`;
      fl.style.color = `color-mix(in srgb, var(--ink) ${k * 100}%, var(--muted))`;
    } else for (const tab of tabs) tab.style.color = "";
  }
  const ws = shadow.querySelector("#audio-workspace") as HTMLElement;
  const ch = view.change;
  // the previous state's contents lie over the new ones, laid out as the workspace lays out its own
  const was = ch ? `<div class="ml-was" style="position:absolute;inset:0;display:flex;flex-direction:column;padding:inherit;pointer-events:none">${workspaceHtml(lang, ch.from, file)}</div>` : "";
  const html = workspaceHtml(lang, view.ws, file) + was;
  if (ws.dataset.html !== html) {
    ws.innerHTML = html;
    ws.dataset.html = html;
  }
  ws.style.position = "relative";
  ws.style.height = ch ? `${ch.height}px` : "";
  ws.style.overflow = ch ? "hidden" : "";
  const top = ws.querySelector<HTMLElement>(".ml-was");
  const smooth = (x: number) => x * x * (3 - 2 * x);
  const kOut = ch ? smooth(Math.min(1, ch.k / 0.55)) : 1;
  const kIn = ch ? smooth(Math.max(0, (ch.k - 0.3) / 0.7)) : 1;
  // the file row: when both states show the same file it stays where it is, and only the parts of it that change fade
  // across from the old to the new, together (its format and length once checked, the "Change" button). A part with
  // the same words laid out anew (the name cut short to make room for "Change") shows the new one at once, under the
  // old one as it fades. Compared by text and layout, not markup: the styles set here stay from frame to frame.
  const oldRow = top?.querySelector<HTMLElement>(".audio-file-row");
  const newRow = ws.querySelector<HTMLElement>(":scope > .audio-file-row");
  const text = (el: Element | null | undefined) => el?.textContent ?? null;
  const look = (el: HTMLElement) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const r = range.getBoundingClientRect();
    return `${el.scrollWidth > el.clientWidth} ${Math.round(r.left)} ${Math.round(r.top)}`;
  };
  const shared = !!oldRow && !!newRow && text(oldRow.querySelector(".audio-file-name")) === text(newRow.querySelector(".audio-file-name"));
  const isRow = (el: Element) => el.matches(".audio-file-row, hr");
  for (const el of ws.children) if (el !== top) (el as HTMLElement).style.opacity = shared && isRow(el) ? "" : String(kIn);
  if (top) {
    top.style.opacity = "";
    for (const el of top.children) {
      (el as HTMLElement).style.opacity = shared && el === oldRow ? "" : String(1 - kOut);
      (el as HTMLElement).style.visibility = shared && isRow(el) ? "hidden" : "";
    }
  }
  const across = ch ? smooth(ch.k) : 1;
  for (const sel of [".audio-file-type", ".audio-file-name", ".audio-meta", ":scope > button"]) {
    const a = oldRow?.querySelector<HTMLElement>(sel);
    const b = newRow?.querySelector<HTMLElement>(sel);
    const reads = shared && text(a) !== text(b);
    const relaid = shared && !reads && !!a && !!b && look(a) !== look(b);
    if (a) {
      a.style.visibility = reads || relaid ? "visible" : "";
      a.style.opacity = reads || relaid ? String(1 - across) : "";
    }
    if (b) b.style.opacity = reads ? String(across) : "";
  }
  if (newRow && view.row !== undefined) newRow.style.opacity = String(view.row);
  ws.dataset.state = ch && ch.k < 0.5 ? ch.from.state : view.ws.state;
  for (const empty of ws.querySelectorAll<HTMLElement>(".audio-empty")) empty.style.opacity = String(1 - (view.dim ?? 0));
  body.style.transform = `translateY(${-view.scroll}px)`;
};

const mount = (host: HTMLElement, lang: Lang) => {
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  if (!shadow.querySelector(".ml-root")) shadow.innerHTML = pageHtml(lang);
  return shadow;
};

/** The page in the phone's viewport: `width` × `height` CSS pixels, scrolled by `view.scroll`. */
export const SiteScreen: React.FC<{ lang: Lang; view: SiteView; file: DemoFile; height: number }> = ({ lang, view, file, height }) => {
  const host = useRef<HTMLDivElement>(null);
  const [handle] = useState(() => delayRender("site images"));
  useLayoutEffect(() => {
    const shadow = mount(host.current!, lang);
    apply(shadow, lang, view, file);
  });
  useLayoutEffect(() => {
    const shadow = mount(host.current!, lang);
    const imgs = [...shadow.querySelectorAll("img")];
    Promise.all(imgs.map((img) => img.decode().catch(() => undefined))).then(() => continueRender(handle));
  }, [handle, lang]);
  return <div ref={host} style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height, overflow: "hidden" }} />;
};

/** The chosen file on its way in: the tool's own file row (as it is while the file is checked) on a card of the
 *  workspace's own style, so it lands exactly on the row the page then shows. The row sits at ROW_INSET in the card. */
export const ROW_INSET = { x: 17, y: 13 };
export const SiteFileCard: React.FC<{ lang: Lang; file: DemoFile; width: number }> = ({ lang, file, width }) => {
  const host = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const shadow = host.current!.shadowRoot ?? host.current!.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${siteCss.css}</style><div class="ml-root" lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}" style="background:none"><div class="ml-body"><div class="audio-workspace" style="min-height:0;padding:${ROW_INSET.y - 1}px ${ROW_INSET.x - 1}px;width:${width}px">${fileRowHtml(file, true)}</div></div></div>`;
  }, [lang, file, width]);
  return <div ref={host} style={{ width }} />;
};

export type Rect = { x: number; y: number; w: number; h: number };
export type Geometry = Record<string, Record<string, Rect>>;

/** Boxes of the elements the film points at, in page CSS pixels (unscrolled), for every view it uses: measured once
 *  from the same page, styles and fonts, in an unseen copy. */
export const useSiteGeometry = (lang: Lang, file: DemoFile, views: Record<string, SiteView>, targets: string[]) => {
  const [geo, setGeo] = useState<Geometry | null>(() => GEO.get(lang) ?? null);
  useLayoutEffect(() => {
    if (geo) return;
    const handle = delayRender("site geometry");
    let alive = true;
    (async () => {
      await document.fonts.ready;
      await Promise.all(["Roboto", "Noto Naskh Arabic", "Noto Sans Mono", "Alexandria Site"].map((f) => document.fonts.load(`16px "${f}"`, lang === "ar" ? "أب" : "Ab")));
      const host = document.createElement("div");
      host.style.cssText = `position:fixed;left:-5000px;top:0;width:${SCREEN.w}px;height:4000px;`;
      document.body.appendChild(host);
      const shadow = mount(host, lang);
      const out: Geometry = {};
      for (const [key, view] of Object.entries(views)) {
        apply(shadow, lang, { ...view, scroll: 0 }, file);
        const base = (shadow.querySelector(".ml-body") as HTMLElement).getBoundingClientRect();
        out[key] = {};
        for (const sel of targets) {
          const el = shadow.querySelector(sel);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (!r.width && !r.height) continue;
          out[key][sel] = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
        }
      }
      host.remove();
      GEO.set(lang, out);
      if (alive) setGeo(out);
      continueRender(handle);
    })();
    return () => {
      alive = false;
    };
  }, [geo, lang, file, views, targets]);
  return geo;
};
const GEO = new Map<Lang, Geometry>();
