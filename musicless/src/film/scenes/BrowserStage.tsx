import React from "react";
import { DISPLAY } from "../../lib/fonts";
import { clamp, ease, life, rand, ramp, spr, track, useStage } from "../../lib/motion";
import { C, SHADOW } from "../../theme";
import { BROWSER_H, BROWSER_W, useFilm } from "../context";
import {
  BrowserFrame, DIALOG, dialogAdd, InstallDialog, mx, STORE, StorePage, TOP, WATCH, WatchPage, WelcomePage, type Tab,
} from "../parts/Browser";
import { Cursor, cursorAt } from "../parts/Cursor";
import { Icon } from "../parts/icons";
import { Land } from "../parts/Kinetic";
import { FlyingNote, type NoteSpec } from "../parts/Notes";
import { playerButton } from "../parts/Player";
import { VoiceLine } from "../parts/VoiceLine";

const EXT_ID = "fllcnhpmoanojfbncfpdencchjlgphco";

/** Where the extension's "Turn on Musicless" button sits on its first-run page (content pixels): the heading and
 *  text above it have fixed heights here, so the button stays put in both languages. */
export const welcomeButtonY = (rtl: boolean) => 96 + 64 + 28 + (rtl ? 48 : 40) + 12 + (rtl ? 112 : 96) + 32 + 20;

export const BrowserStage: React.FC = () => {
  const { T, W: win, L, copy, ui, lang, dir, tl, typing } = useFilm();
  const { t, W, H } = useStage();
  const [a, b] = win.browser;
  if (t < a || t > b + 0.7) return null;
  const u = L.u;
  const rtl = L.rtl;
  const bs = L.browser.w / BROWSER_W;
  const X = (x: number) => (rtl ? BROWSER_W - x : x);

  // points of interest, in window pixels
  const btn = { x: X(STORE.button.x + STORE.button.w / 2), y: TOP + STORE.button.y + STORE.button.h / 2 };
  const add = dialogAdd(rtl);
  const addPt = { x: add.x, y: TOP + add.y };
  const welcomeBtn = { x: BROWSER_W / 2, y: TOP + welcomeButtonY(rtl) };
  const pl = { x: mx(rtl, WATCH.player.x, WATCH.player.w), y: TOP + WATCH.player.y, w: WATCH.player.w };
  const ph = (pl.w * 9) / 16;
  const pb = playerButton(pl.w);
  const iconPt = { x: pl.x + pb.x, y: pl.y + pb.y };
  const playerMid = { x: pl.x + pl.w / 2, y: pl.y + ph / 2 };

  // moments
  // the results arrive once the name is typed
  const listingAt = Math.max(T.store, typing.store.at + (Array.from(copy.search).length + 1) * typing.store.step + 0.12);
  const dialogAt = T.click1 + 0.16;
  // Chrome installs the extension, then its first-run tab opens (the click's badge has a moment first)
  const welcomeAt = T.click2 + 0.6;
  const watchAt = T.demo - 0.08;
  // the demo's video, in its own time: it waits on its first frame, plays with its music, pauses while the music is
  // removed (the click), then plays on with the voices alone
  const sm = tl.sample;
  const srcAt = (x: number) => (x < sm.start ? sm.a0 : x < sm.cutAt ? sm.a0 + (x - sm.start) : x < sm.resume ? sm.cut : sm.cut + (x - sm.resume));

  // the camera, as a screen recording zooms. In the narrow frames each shot is framed by how much of the window
  // it shows across (window pixels), so the part that matters fills the width.
  const S = (s16: number, across: number) => (L.P ? W / across / bs : s16);
  const cam = track(t, [
    { at: a, dur: 0, x: 640, y: 420, s: 0.96 },
    // the search box, with the store's name beside it in 16:9
    { at: T.find - 0.4, dur: 0.6, x: X(L.P ? 732 : 575), y: TOP + 92, s: S(1.4, 800) },
    { at: listingAt + 0.05, dur: 0.6, x: X(L.P ? 600 : 700), y: TOP + 290, s: S(1.28, 860) },
    { at: T.click1 - 0.55, dur: 0.5, x: btn.x, y: btn.y + 80, s: S(1.8, 600) },
    { at: dialogAt + 0.02, dur: 0.5, x: 640, y: TOP + DIALOG.y + 120, s: S(1.9, 560) },
    { at: welcomeAt + 0.05, dur: 0.6, x: 640, y: TOP + 290, s: S(1.38, 660) },
    { at: T.click3 - 0.6, dur: 0.5, x: 640, y: welcomeBtn.y - 70, s: S(1.7, 600) },
    { at: T.click3 + 0.3, dur: 0.8, x: 640, y: TOP + 300, s: S(1.3, 660) },
    { at: watchAt, dur: 0.5, x: 640, y: 410, s: 1.02 },
    { at: T.sampleStart - 0.55, dur: 0.6, x: playerMid.x, y: playerMid.y + 10, s: S(1.4, 900) },
    { at: T.original - 0.45, dur: 0.6, x: iconPt.x - 40, y: iconPt.y - 70, s: S(2.45, 440) },
    { at: b - 0.55, dur: 0.6, x: 640, y: 420, s: 1.0 },
  ]);
  const k = bs * cam.s;
  const hw = W / k / 2;
  const hh = H / k / 2;
  const fx = hw >= BROWSER_W / 2 ? BROWSER_W / 2 : clamp(cam.x, hw, BROWSER_W - hw);
  const fy = hh >= BROWSER_H / 2 ? BROWSER_H / 2 : clamp(cam.y, hh, BROWSER_H - hh);
  const titleOut = Math.max(T.three + 0.55, T.find - 0.55);
  const rise = ramp(t, titleOut, 0.75, ease.inOut);
  const lift = (1 - rise) * H * 0.95;
  const toScreen = (p: { x: number; y: number }) => ({ x: W / 2 + (p.x - fx) * k, y: H / 2 + (p.y - fy) * k + lift });

  // the cursor
  const cur = cursorAt(
    t,
    [
      { at: a, x: X(1020), y: 900 },
      { at: T.find - 0.1, x: X(560), y: TOP + 44, move: 0.6 },
      { at: T.click1 - 0.05, x: btn.x, y: btn.y, move: 0.75 },
      { at: T.click2 - 0.05, x: addPt.x, y: addPt.y, move: 0.6 },
      { at: T.click3 - 0.05, x: welcomeBtn.x, y: welcomeBtn.y, move: 0.65 },
      { at: T.done + 0.7, x: X(980), y: TOP + 600, move: 0.6 },
      { at: watchAt + 0.3, x: playerMid.x + (rtl ? -150 : 150), y: playerMid.y + 90, move: 0.01 },
      // while the music plays, to Musicless's button: the click
      { at: T.sampleCut - 0.05, x: iconPt.x, y: iconPt.y, move: 1.0 },
      // out of the way while the voices play
      { at: T.sampleResume + 0.5, x: playerMid.x + (rtl ? -140 : 140), y: playerMid.y + 70, move: 0.7 },
      { at: T.original + 0.1, x: iconPt.x, y: iconPt.y, move: 0.75 },
    ],
    [T.click1, T.click2, T.click3, T.sampleCut, T.clickIcon],
  );
  const near = (p: { x: number; y: number }, r = 30) => clamp(1 - Math.hypot(cur.x - p.x, cur.y - p.y) / r);
  const curSize = 25 / Math.sqrt(cam.s);

  // the pages: a new tab's page dissolves in over the one before
  const page = t < welcomeAt ? "store" : t < watchAt ? "welcome" : "watch";
  const FADE = 0.22;
  const showStore = t < welcomeAt + FADE;
  const showWelcome = t >= welcomeAt && t < watchAt + FADE;
  const showWatch = t >= watchAt;
  const typedN = Math.max(0, Math.floor((t - typing.store.at) / typing.store.step));
  const typed = Array.from(copy.search).slice(0, typedN).join("");
  const listing = ramp(t, listingAt, 0.3, ease.out);
  const dialog = t < T.click2 + 0.12 ? ramp(t, dialogAt, 0.28, ease.out) : 1 - ramp(t, T.click2 + 0.12, 0.14);
  const tabs: Tab[] = [
    { title: listing > 0.5 ? ui.tabStore : lang === "ar" ? "سوق Chrome الإلكتروني" : "Chrome Web Store", icon: "store" },
  ];
  if (t >= welcomeAt) tabs.push({ title: ui.name, icon: "ext", open: ramp(t, welcomeAt, 0.22) });
  if (t >= watchAt) tabs.push({ title: `${ui.videoTitle} - YouTube`, icon: "yt", open: ramp(t, watchAt, 0.22) });
  const active = page === "store" ? 0 : page === "welcome" ? 1 : 2;
  const url =
    page === "store"
      ? listing > 0.5 ? `chromewebstore.google.com/detail/musicless/${EXT_ID}` : "chromewebstore.google.com"
      : page === "welcome" ? `chrome-extension://${EXT_ID}/welcome.html` : `youtube.com/watch?v=${ui.videoId}`;

  // the demo: the button's tooltip as the cursor reaches it ("Remove music" while it is off)
  const tip =
    t >= T.sampleCut - 0.7 && t < T.sampleCut
      ? { text: ui.ext("control_name"), k: ramp(t, T.sampleCut - 0.7, 0.18) }
      : t >= T.original + 0.2 && t < T.clickIcon
        ? { text: ui.ext("control_on"), k: ramp(t, T.original + 0.2, 0.18) }
        : t >= T.clickIcon + 0.05 && t < b
          ? { text: ui.ext("control_name"), k: ramp(t, T.clickIcon + 0.05, 0.18) }
          : null;
  const demoNotes: NoteSpec[] = Array.from({ length: 12 }, (_, i) => {
    let fx = 0.08 + 0.84 * rand(i * 3.7 + 2);
    const fy = 0.12 + 0.62 * rand(i * 5.3 + 1);
    // keep the spinner and «Removing music» in the middle clear
    if (fx > 0.34 && fx < 0.66 && fy > 0.3 && fy < 0.74) fx = fx < 0.5 ? 0.34 - (0.5 - fx) * 0.6 : 0.66 + (fx - 0.5) * 0.6;
    const x = pl.x + pl.w * fx;
    const y = pl.y + ph * fy;
    return { x, y, size: 46 + 34 * rand(i * 2.2), rot: (rand(i * 1.9) - 0.5) * 34, seed: 200 + i, born: T.sampleStart + 0.15 + i * 0.07, snapAt: T.sampleCut + 0.3 + Math.hypot(x - iconPt.x, y - iconPt.y) / 2400 };
  });

  // "3 clicks", before the browser
  const title = 1 - ramp(t, titleOut, 0.4, ease.inOut);
  // each click's count lives until the page it belongs to changes
  const badgeEnd = [T.click1 + 0.95, welcomeAt - 0.02, T.click3 + 0.62];
  const titleUp = ramp(t, titleOut, 0.4, ease.inOut);
  const clicksDone = [T.click1, T.click2, T.click3];

  return (
    <div style={{ position: "absolute", inset: 0, background: C.paper, overflow: "hidden", opacity: clamp(ramp(t, a, 0.3)) }}>
      {/* the title */}
      {title > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: H * (L.P ? 0.36 : 0.27) - titleUp * 160 * u, opacity: title, textAlign: "center", direction: dir }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 22 * u, marginBottom: 26 * u }}>
            {[0, 1, 2].map((i) => {
              const p = spr(t, T.easy - 0.12 + i * 0.12, { stiffness: 300, damping: 14 });
              return (
                <div key={i} style={{ width: 74 * u, height: 74 * u, borderRadius: "50%", border: `${5 * u}px solid ${C.ink}`, display: "grid", placeItems: "center", transform: `scale(${p})`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 36 * u, color: C.ink }}>
                  {i + 1}
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 150 * u, color: C.ink, lineHeight: 1.1, letterSpacing: dir === "ltr" ? "-0.04em" : 0 }}>
            <Land at={T.three} t={t}>{copy.clicks}</Land>
          </div>
          {/* Arabic letters like the ق of «نقرات» reach far below the line: give the subtitle room under them */}
          <div style={{ marginTop: (dir === "rtl" ? 40 : 10) * u, fontFamily: DISPLAY, fontWeight: 500, fontSize: 46 * u, color: C.muted, opacity: clamp(ramp(t, T.three + 0.3, 0.3)) }}>{copy.clicksSub}</div>
        </div>
      )}
      {/* the window, through the camera */}
      <div style={{ position: "absolute", left: 0, top: 0, width: BROWSER_W, height: BROWSER_H, transformOrigin: "0 0", transform: `translate(${W / 2 - fx * k}px, ${H / 2 - fy * k + lift}px) scale(${k})` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 14, boxShadow: SHADOW }} />
        <BrowserFrame rtl={rtl} tabs={tabs} active={active} url={url} dark={page === "watch"}>
          {showStore && (
            <>
              <StorePage rtl={rtl} t={t} typed={typed} caret={t > T.find - 0.3 && t < listingAt && Math.floor(t * 2.4) % 2 === 0} listing={listing} ui={ui} shot={`ui/store-${lang}-1.png`} pressed={life(t, T.click1 - 0.06, T.click1 + 0.12, 0.05, 0.1)} hoverBtn={near(btn, 40)} />
              <InstallDialog rtl={rtl} k={dialog} pressed={life(t, T.click2 - 0.06, T.click2 + 0.12, 0.05, 0.1)} ui={ui} />
            </>
          )}
          {showWelcome && (
            <div style={{ position: "absolute", inset: 0, background: C.white, opacity: ramp(t, welcomeAt, FADE, ease.inOut) }}>
              <WelcomePage
                rtl={rtl} ext={ui.ext}
                snap={ease.outQuint(ramp(t, T.click3 + 0.14, 0.56, ease.linear))}
                done={ramp(t, T.click3 + 0.3, 1.1, ease.linear)}
                pressed={life(t, T.click3 - 0.06, T.click3 + 0.12, 0.05, 0.1)}
              />
            </div>
          )}
          {showWatch && (
            <div style={{ position: "absolute", inset: 0, opacity: ramp(t, watchAt, FADE, ease.inOut) }}>
            <WatchPage
              rtl={rtl} lang={lang} ui={ui}
              player={{
                t, src: srcAt(t), on: t >= T.sampleCut && t < T.clickIcon + 0.03, tip, hover: near(iconPt, 26),
                waiting: life(t, T.sampleCut + 0.04, T.sampleResume + 0.05, 0.12, 0.15), waitLabel: ui.ext("notice_working"),
              }}
            />
            </div>
          )}
        </BrowserFrame>
        {/* the music leaving the video, and the button that did it */}
        {page === "watch" && (
          <>
            {demoNotes.map((n) => (
              <FlyingNote key={n.seed} spec={n} t={t} color={C.paper} u={1} />
            ))}
            {/* the voices that stay, across the picture */}
            {t > T.sampleResume - 0.05 && t < T.original + 0.2 && (
              <div style={{ position: "absolute", left: pl.x, top: pl.y, width: pl.w, height: ph, overflow: "hidden", borderRadius: 12, opacity: 0.9 * (1 - ramp(t, T.original - 0.35, 0.3)) }}>
                <VoiceLine t={t} y={ph * 0.5} width={pl.w} u={0.62} at={T.sampleResume - 0.05} color={C.paper} amp={40} />
              </div>
            )}
            {[0, 1].map((i) => {
              const r = ramp(t, T.sampleCut + 0.05 + i * 0.25, 0.9, ease.out);
              if (r <= 0 || r >= 1) return null;
              const d = 30 + 90 * r;
              return <div key={i} style={{ position: "absolute", left: iconPt.x - d / 2, top: iconPt.y - d / 2, width: d, height: d, borderRadius: "50%", border: `3px solid rgba(244, 237, 224, ${0.9 * (1 - r)})` }} />;
            })}
          </>
        )}
        <Cursor x={cur.x} y={cur.y} size={curSize} press={cur.press} ripple={cur.ripple} opacity={clamp(ramp(t, T.find - 0.8, 0.3))} />
      </div>
      {/* each click, counted */}
      {clicksDone.map((at, i) => {
        const p = spr(t, at + 0.02, { stiffness: 330, damping: 13 });
        const o = 1 - ramp(t, badgeEnd[i] - 0.2, 0.2);
        if (t < at || o <= 0) return null;
        const s = toScreen(i === 0 ? btn : i === 1 ? addPt : welcomeBtn);
        const off = 92 * u;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: s.x + (rtl ? -off : off) - 52 * u, top: s.y - off - 52 * u, width: 104 * u, height: 104 * u, borderRadius: "50%",
              background: C.ink, color: C.paper, display: "grid", placeItems: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 56 * u,
              transform: `scale(${p})`, opacity: o, boxShadow: "0 14px 30px -10px rgba(31,29,26,0.5)",
            }}
          >
            {i + 1}
          </div>
        );
      })}
      {/* done */}
      {t > T.done - 0.1 && t < T.demo + 0.2 && (
        <div style={{ position: "absolute", left: 0, right: 0, ...(L.P ? { top: Math.min(H - 260 * u, toScreen({ x: 0, y: BROWSER_H }).y + 56 * u) } : { bottom: 70 * u }), display: "flex", justifyContent: "center", opacity: 1 - ramp(t, T.demo - 0.25, 0.25) }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 20 * u, padding: `${18 * u}px ${44 * u}px ${18 * u}px ${34 * u}px`, borderRadius: 80 * u, background: C.ink, color: C.paper,
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 64 * u, direction: dir, transform: `scale(${spr(t, T.done - 0.08, { stiffness: 300, damping: 13 })})`,
              boxShadow: "0 24px 50px -18px rgba(31,29,26,0.55)", lineHeight: dir === "rtl" ? 1.4 : 1.15,
            }}
          >
            <div style={{ width: 66 * u, height: 66 * u, borderRadius: "50%", background: C.paper, display: "grid", placeItems: "center" }}>
              <Icon name="check" size={42 * u} color={C.ink} stroke={3.2} />
            </div>
            {copy.done}
          </div>
        </div>
      )}
    </div>
  );
};
