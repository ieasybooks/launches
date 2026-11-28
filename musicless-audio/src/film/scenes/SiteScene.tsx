import React from "react";
import demo from "../../../data/demo.json";
import { bezier, clamp, ease, lerp, rand, ramp, spr, track, useStage } from "../../lib/motion";
import { C } from "../../theme";
import { SCREEN, VIEW_H, useFilm } from "../context";
import { FileCard } from "../parts/FileCard";
import { FlyingNote, type NoteSpec } from "../parts/Notes";
import { Phone, Tap } from "../parts/Phone";
import { ROW_INSET, SiteFileCard, SiteScreen, useSiteGeometry, type DemoFile, type Rect, type SiteView, type Ws } from "../parts/Site";
import { VoiceLine } from "../parts/VoiceLine";
import { Rise } from "./Rise";

// The website on a phone: the page opens on the YouTube tab, "Audio files" is tapped, a file is chosen, "Remove music"
// runs (its real stages, compressed), and the result's preview plays the original, then switches to "Music removed"
// at the same moment, as the tool does. Then the download.

const TARGETS = [
  "#files-tab", ".audio-modes", '[data-action="choose"]', '[data-action="run"]', "#audio-workspace", ".audio-privacy", ".audio-file-row",
  '[data-action="processed"]', '[data-action="original"]', '[data-action="play"]', ".audio-player", "a[download]", ".audio-listen",
];
const VIEWS: Record<string, SiteView> = {
  home: { mode: "youtube", ws: { state: "empty" }, scroll: 0 },
  empty: { mode: "files", ws: { state: "empty" }, scroll: 0 },
  checking: { mode: "files", ws: { state: "checking" }, scroll: 0 },
  ready: { mode: "files", ws: { state: "ready" }, scroll: 0 },
  preflight: { mode: "files", ws: { state: "working", phase: "preflight", percent: null, remaining: null }, scroll: 0 },
  working: { mode: "files", ws: { state: "working", phase: "processing", percent: 39, remaining: 30 }, scroll: 0 },
  done: { mode: "files", ws: { state: "done", listening: "processed", playing: false, position: 0 }, scroll: 0 },
};
const TOP = SCREEN.status + SCREEN.toolbar; // the page's top inside the screen
// the panels' slide when the tab is tapped: quick to answer the tap, long to settle (Material's standard curve)
const TAB_SLIDE = 0.55;
const SLIDE_EASE = bezier(0.4, 0, 0.2, 1);

export const SiteScene: React.FC = () => {
  const { T, W: win, L, copy, tl, lang, file: F, work } = useFilm();
  const { t, W, H } = useStage();
  const d = demo[lang];
  const file: DemoFile = { name: d.name, size: d.size, duration: d.duration };
  const geo = useSiteGeometry(lang, file, VIEWS, TARGETS);
  const [a, b] = win.site;
  if (t < a || t > b || !geo) return null;
  const u = L.u;
  const s0 = L.phone.s;
  const smp = tl.sample;

  const g = (view: string, sel: string): Rect => geo[view]?.[sel] ?? { x: 0, y: 0, w: 0, h: 0 };

  // ---- what the page shows: the tool's states in their real order. The tool switches at once; the film cross-fades
  //      each change and lets the workspace grow or shrink to its new height. ----
  const processing = (tt: number): Ws => {
    // the real run went 0 → 94 % in 13 windows (scripts/run_site.mjs), "Less than a minute left" from the first one;
    // compressed into a few seconds its steps would stutter, so the bar fills steadily
    const k = clamp((tt - work.processing) / (work.end - work.processing));
    return { state: "working", phase: "processing", percent: Math.floor(94 * k), remaining: 30 };
  };
  const result = (tt: number): Ws => {
    const playing = tt >= T.play && tt < T.pause;
    const position = clamp(tt - smp.start, 0, smp.total);
    const listening = tt >= T.original && tt < T.cut ? "original" : "processed";
    return { state: "done", listening, playing, position };
  };
  const STATES: { at: number; dur: number; view: string; ws: (tt: number) => Ws }[] = [
    { at: -Infinity, dur: 0, view: "empty", ws: () => ({ state: "empty" }) },
    { at: F.checking, dur: 0.3, view: "checking", ws: () => ({ state: "checking" }) },
    { at: F.ready, dur: 0.3, view: "ready", ws: () => ({ state: "ready" }) },
    { at: work.preflight, dur: 0.2, view: "preflight", ws: () => ({ state: "working", phase: "preflight", percent: null, remaining: null }) },
    { at: work.processing, dur: 0.24, view: "working", ws: processing },
    { at: work.done, dur: 0.4, view: "done", ws: result },
  ];
  let si = STATES.length - 1;
  while (si > 0 && t < STATES[si].at) si--;
  const now = STATES[si];
  const ws = now.ws(t);
  const ck = si > 0 ? ramp(t, now.at, now.dur, ease.inOut) : 1;
  const was = STATES[Math.max(0, si - 1)];
  const hOf = (view: string) => g(view, "#audio-workspace").h;
  const change = ck < 1 ? { from: was.ws(now.at - 1e-3), k: ck, height: lerp(hOf(was.view), hOf(now.view), ck) } : undefined;
  // the finished card is taller than the screen: the page scrolls up to show it whole, with the line under it
  const doneScroll = Math.max(0, g("done", ".audio-privacy").y + g("done", ".audio-privacy").h + 18 - VIEW_H);
  const scroll = doneScroll * ramp(t, T.done + 0.05, 0.6, ease.inOut);
  // the tab switch: the page itself swaps panels at once. The film slides them, like pages, in step with the underline:
  // the files panel comes in from the side of its tab and pushes the YouTube panel out the other way. Two more copies
  // of the page, below the tabs, are the panels while they move.
  const tabK = ramp(t, T.tab + 0.02, TAB_SLIDE, ease.linear);
  const tabP = SLIDE_EASE(tabK);
  const switching = tabK > 0 && tabK < 1;
  // the moving panels start just under the tabs' border (their own copies of the tabs must not show)
  const tabsBottom = g("home", ".audio-modes").y + g("home", ".audio-modes").h - scroll + 2;
  const side = L.rtl ? -1 : 1; // "Audio files" is the second tab: on the right in English, on the left in Arabic
  // the empty workspace's words fade as the file passes over them; the page's own row of it shows once it has landed
  const view: SiteView = {
    mode: tabK >= 1 ? "files" : "youtube", ws, scroll, dim: ramp(t, F.tap + 0.12, F.land - F.tap - 0.3, ease.inOut), change, tabs: switching ? tabP : undefined,
    row: t < F.land ? 0 : undefined,
  };
  const panel = (mode: SiteView["mode"], x: number) => (
    <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: VIEW_H, clipPath: `inset(${tabsBottom}px 0 0 0)` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: VIEW_H, transform: `translateX(${x}px)` }}>
        <SiteScreen lang={lang} view={{ ...view, mode, tabs: undefined }} file={file} height={VIEW_H} />
      </div>
    </div>
  );
  const page = (
    <>
      <SiteScreen lang={lang} view={view} file={file} height={VIEW_H} />
      {switching && (
        <>
          {panel("youtube", -side * tabP * SCREEN.w)}
          {panel("files", side * (1 - tabP) * SCREEN.w)}
        </>
      )}
    </>
  );
  // ---- the camera: the scale of the phone, and which point of its screen sits where in the film ----
  const wsBox = g("ready", "#audio-workspace");
  const focusWs = TOP + wsBox.y + wsBox.h / 2 + 30;
  const doneCard = g("done", "#audio-workspace");
  const focusCard = TOP + doneCard.y + doneCard.h / 2 - doneScroll;
  const cam = track<{ s: number; fy: number; Y: number }>(t, [
    { at: 0, dur: 0, s: s0, fy: SCREEN.h / 2, Y: L.phone.cy + 220 * u },
    { at: T.paper, dur: 1.0, s: s0, fy: SCREEN.h / 2, Y: L.phone.cy },
    // the tool: closer, on its card, as the files panel settles; one long, gentle move that lands as the next tap comes
    { at: T.tab + 0.14, dur: T.choose - 0.24 - (T.tab + 0.14), s: L.close.s, fy: focusWs, Y: L.close.toolY, fn: ease.inOutSine },
    // the result: on its card, with room above it for the music
    { at: T.done + 0.1, dur: 0.6, s: L.close.s, fy: focusCard, Y: L.close.cardY },
    // the whole phone again once the file is saved, then it leaves
    { at: T.download + 0.8, dur: 0.7, s: s0, fy: SCREEN.h / 2, Y: L.phone.cy },
    { at: tl.S("free") - 0.1, dur: 0.75, s: s0 * 0.85, fy: SCREEN.h / 2, Y: H * 1.8 },
  ]);
  const left = W / 2 - (SCREEN.w / 2) * cam.s;
  const top = cam.Y - cam.fy * cam.s;
  // a point on the page (unscrolled CSS px) in the film, and in the screen's own coordinates
  const film = (x: number, y: number) => ({ x: left + x * cam.s, y: top + (TOP + y - scroll) * cam.s });
  const onScreen = (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 - scroll });

  // ---- the taps ----
  const taps: { at: number; r: Rect }[] = [
    { at: T.tab, r: g("home", "#files-tab") },
    { at: T.choose, r: g("empty", '[data-action="choose"]') },
    { at: T.run, r: g("ready", '[data-action="run"]') },
    { at: T.original, r: g("done", '[data-action="original"]') },
    { at: T.play, r: g("done", '[data-action="play"]') },
    { at: T.cut, r: g("done", '[data-action="processed"]') },
    { at: T.pause, r: g("done", '[data-action="play"]') },
    { at: T.download, r: g("done", "a[download]") },
  ];
  const tapEls = taps.map((tp, i) => {
    const k = t < tp.at ? (t - tp.at) / 0.22 : (t - tp.at) / 0.6;
    if (k <= -1 || k >= 1) return null;
    const p = onScreen(tp.r);
    return <Tap key={i} x={p.x} y={p.y} k={k} />;
  });

  // ---- the file arrives: it rises into the workspace as the tool's own file row, and lands on it ----
  const row = g("checking", ".audio-file-row");
  // it comes up from below the frame at an even pace and brakes steadily into place (no burst at the start, no crawl
  // at the end), in 0.66 s
  const fileK = ramp(t, F.tap + 0.06, F.land - F.tap - 0.06, ease.outQuad);
  const fileShow = t > F.tap + 0.05 && t < F.land + 0.4;
  const rowAt = film(row.x - ROW_INSET.x, row.y - ROW_INSET.y);
  const cardW = row.w + 2 * ROW_INSET.x;
  const fly = { x: rowAt.x, y: lerp(H + 80 * u, rowAt.y, fileK) };
  // once landed it is the page's own row, under it, so it leaves unseen
  const fileFade = 1 - ramp(t, F.land + 0.1, 0.2, ease.inOut);

  // ---- the privacy line: marked while it is spoken ----
  const priv = g("working", ".audio-privacy");
  const mark = ramp(t, T.device - 0.1, 0.45, ease.out) * (1 - ramp(t, T.done - 0.3, 0.3));

  // ---- the music: notes rise out of the player while the original plays, and snap at the switch ----
  const player = g("done", ".audio-player");
  const proc = g("done", '[data-action="processed"]');
  const snapFrom = film(proc.x + proc.w / 2, proc.y + proc.h / 2);
  const notes: NoteSpec[] = [];
  if (t > T.play - 0.1 && t < T.cut + 1.3) {
    // they rise out of the result's card, above it, and leave its controls clear
    const N = 34;
    const card = g("done", "#audio-workspace");
    for (let i = 0; i < N; i++) {
      const born = T.play + 0.02 + i * ((T.cut - T.play - 0.5) / N);
      if (t < born) continue;
      const side = rand(i * 3.7) - 0.5;
      const p0 = film(card.x + card.w * (0.5 + side * 0.98), card.y + 10);
      const age = Math.min(t, T.cut) - born;
      const rise = (240 + 200 * rand(i * 1.9)) * u;
      const x = p0.x + side * 260 * u * Math.min(1, age * 0.7) + Math.sin(age * 2 + i) * 22 * u;
      const y = p0.y - 40 * u - rise * age;
      const dist = Math.hypot(x - snapFrom.x, y - snapFrom.y);
      notes.push({ x, y, size: (70 + 56 * rand(i * 2.3)) * u, rot: (rand(i * 5.1) - 0.5) * 34, seed: i + 1, born, snapAt: T.cut + 0.04 + dist / (2600 * u) });
    }
  }
  const lineY = film(0, player.y + player.h / 2).y;

  // ---- the download: the new file leaves through the button ----
  const dl = g("done", "a[download]");
  const dlAt = film(dl.x, dl.y);
  const dlK = spr(t, T.download + 0.12, { stiffness: 150, damping: 18 });
  const dlName = file.name.replace(/\.mp3$/i, "") + "-musicless.mp3";
  const dlOut = ramp(t, tl.S("free") + 0.1, 0.6, ease.inOut);
  const dlW = 400;
  const dlS = 1.9 * u;

  return (
    <Rise t={t} at={T.paper} color={C.paper} H={H} u={u}>
      {/* the voices that stay, behind the phone */}
      <VoiceLine t={t} y={lineY} width={W} u={u} at={T.cut + 0.12} color={C.ink} amp={40} fade={ramp(t, tl.E("diff") - 0.2, 0.5)} />
      <Phone x={left} y={top} s={cam.s} rtl={L.rtl} url={copy.url}
        overlay={
          <>
            {mark > 0 && (
              <div style={{ position: "absolute", left: priv.x + priv.w / 2 - 150, top: priv.y - scroll - 6, width: 300, height: priv.h + 12, borderRadius: 999, background: "rgba(31,29,26,0.07)", boxShadow: "inset 0 0 0 1.5px rgba(31,29,26,0.35)", opacity: mark, transform: `scale(${0.9 + 0.1 * mark})` }} />
            )}
            {tapEls}
          </>
        }
      >
        {page}
      </Phone>
      {/* the chosen file, rising into place */}
      {fileShow && (
        <div style={{ position: "absolute", left: fly.x, top: fly.y, transform: `scale(${cam.s / (1 + 0.04 * (1 - fileK))})`, transformOrigin: "0 0", opacity: fileFade * clamp(fileK * 3), filter: `drop-shadow(0 ${30 * (1 - fileK)}px 40px rgba(31,29,26,${0.35 * (1 - fileK)}))` }}>
          <SiteFileCard lang={lang} file={file} width={cardW} />
        </div>
      )}
      {notes.map((n) => (
        <FlyingNote key={n.seed} spec={n} t={t} color={C.ink} u={u} bob={0.6} />
      ))}
      {/* the download */}
      {t > T.download + 0.1 && (
        <div
          style={{
            position: "absolute", left: W / 2, top: lerp(dlAt.y, L.dlY, dlK) + dlOut * H * 0.9, width: dlW, transform: `translateX(-50%) scale(${dlS * (0.7 + 0.3 * dlK)})`,
            transformOrigin: "50% 0", opacity: clamp(dlK * 2.5), filter: "drop-shadow(0 30px 50px rgba(31,29,26,0.35))",
          }}
        >
          <FileCard name={dlName} type="MP3" meta={`2:30 · 3.4 MB`} width={dlW} rtl={L.rtl} check={spr(t, T.download + 0.55, { stiffness: 260, damping: 13 })} />
        </div>
      )}
    </Rise>
  );
};
