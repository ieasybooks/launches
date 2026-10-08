import React from "react";
import { Img, staticFile } from "remotion";
import { cue as C, DURATION, E, S } from "../lib/timeline";
import { clamp, easeInOutCubic, easeOutBack, easeOutCubic, lerp, prog, rand, typed } from "../lib/time";
import { FILM } from "../ui/theme";
import { HEADING_FONT, LATIN_FONT, UI_FONT } from "../lib/fonts";
import { Layout } from "./layout";
import { Logo, sheenAt } from "./Logo";
import { T } from "./director";
import { AppleLogo } from "./Guide";

export const O = {
  start: () => T.tourEnd,
  o1: S("outro1"),
  win: C("outro1", "لويندوز"),
  mac: C("outro1", "وماك"),
  o2: S("outro2"),
  url: C("outro2", "نزله"),
  site: C("outro2", "موقع"),
  clickDl: C("outro2", "الجامع"),
  web: C("outro2", "اقرأ"),
  gather: E("outro2") + 0.15,
  logo: S("outro3") + 0.05,
  tagline: C("outro3", "المكتبة"),
  end: DURATION,
};

/** Where the app window goes during the outro (applied by the Stage). */
export const outroFrame = (t: number, L: Layout) => {
  const a = prog(t, O.start(), O.start() + 1.1, easeInOutCubic);
  const away = prog(t, O.o2 - 0.5, O.o2 + 0.5, easeInOutCubic);
  if (L.format === "landscape") {
    return { dx: lerp(0, -40, a) - away * 260, dy: lerp(0, 10, a), scale: lerp(1, 0.74, a) - away * 0.1, opacity: 1 - away, tilt: a * 10 };
  }
  return { dx: 0, dy: lerp(0, -290, a) - away * 120, scale: lerp(1, 0.86, a) - away * 0.08, opacity: 1 - away, tilt: 0 };
};

const DownloadCard: React.FC<{ title: string; req: string; glyph: "win" | "mac"; u: number; a: number; width: number }> = ({ title, req, glyph, u, a, width }) => (
  <div
    style={{
      width,
      boxSizing: "border-box",
      padding: `${22 * u}px ${26 * u}px`,
      borderRadius: 22 * u,
      background: "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
      border: `${1.5 * u}px solid rgba(255,255,255,0.14)`,
      display: "flex",
      alignItems: "center",
      gap: 20 * u,
      opacity: a,
      transform: `translateY(${(1 - a) * 24 * u}px) scale(${0.96 + 0.04 * a})`,
      direction: "rtl",
    }}
  >
    <div style={{ width: 64 * u, height: 64 * u, borderRadius: 16 * u, background: "rgba(225,110,74,0.16)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {glyph === "win" ? (
        <svg width={30 * u} height={30 * u} viewBox="0 0 20 20">
          {[
            [0, 0],
            [11, 0],
            [0, 11],
            [11, 11],
          ].map(([x, y]) => (
            <rect key={`${x}${y}`} x={x} y={y} width={9} height={9} rx={1} fill={FILM.ember} />
          ))}
        </svg>
      ) : (
        <AppleLogo size={32 * u} color={FILM.ember} />
      )}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: LATIN_FONT, fontSize: 32 * u, color: "#f6eee7", fontWeight: 600, direction: "ltr", textAlign: "right", letterSpacing: -0.3 * u }}>{title}</div>
      <div style={{ fontFamily: LATIN_FONT, fontSize: 20 * u, color: "#b9aca5", marginTop: 4 * u, direction: "ltr", textAlign: "right" }}>{req}</div>
    </div>
    <div style={{ width: 54 * u, height: 54 * u, borderRadius: "50%", background: FILM.ember, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={26 * u} height={26 * u} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
      </svg>
    </div>
  </div>
);

const Browser: React.FC<{ t: number; w: number; u: number }> = ({ t, w, u }) => {
  const chrome = 64 * u;
  const h = w * (900 / 1440);
  const url = typed("aljam3.com", t, O.url + 0.1, 14);
  const loaded = prog(t, O.site - 0.1, O.site + 0.35, easeOutCubic);
  // cursor clicks the "download the desktop app" banner button (at 122–406 × 967–1038 in the 2880×1800 screenshot)
  const bx = w * (264 / 2880);
  const by = h * (1002.5 / 1800);
  const bw = w * (284 / 2880);
  const bh = h * (71 / 1800);
  const cursorP = prog(t, O.site + 0.1, O.clickDl - 0.05, easeInOutCubic);
  const cx = lerp(w * 0.45, bx, cursorP);
  const cy = lerp(h * 0.85, by, cursorP);
  const clickD = t - O.clickDl;
  const ring = clickD > 0 && clickD < 0.6 ? clickD / 0.6 : -1;
  const ringPad = (5 + 16 * easeOutCubic(Math.max(0, ring))) * u;
  return (
    <div style={{ width: w, height: chrome + h, borderRadius: 16 * u, overflow: "hidden", background: "#fff", boxShadow: "0 50px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)", position: "relative" }}>
      <div style={{ height: chrome, background: "#f1ece7", display: "flex", alignItems: "center", gap: 14 * u, padding: `0 ${18 * u}px`, direction: "ltr", borderBottom: "1px solid #e2d9d1" }}>
        <div style={{ display: "flex", gap: 8 * u }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 13 * u, height: 13 * u, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, height: 38 * u, borderRadius: 19 * u, background: "#fff", border: "1px solid #e2d9d1", display: "flex", alignItems: "center", gap: 10 * u, padding: `0 ${16 * u}px`, fontFamily: LATIN_FONT, fontSize: 20 * u, color: "#3b2f2c" }}>
          <svg width={14 * u} height={16 * u} viewBox="0 0 14 16" fill="none" stroke="#7d716c" strokeWidth={1.8}>
            <rect x={1.5} y={7} width={11} height={8} rx={2} />
            <path d="M4 7V5a3 3 0 0 1 6 0v2" />
          </svg>
          <span>{url}</span>
          {t >= O.url && t < O.site ? <span style={{ width: 1.5 * u, height: 22 * u, background: "#3b2f2c" }} /> : null}
        </div>
      </div>
      <div style={{ position: "relative", width: w, height: h, background: "#fff" }}>
        <Img src={staticFile("web/desktop.png")} style={{ width: w, height: h, opacity: loaded, transform: `translateY(${(1 - loaded) * 10 * u}px)` }} />
        {ring >= 0 ? (
          <div style={{ position: "absolute", boxSizing: "border-box", left: bx - bw / 2 - ringPad, top: by - bh / 2 - ringPad, width: bw + 2 * ringPad, height: bh + 2 * ringPad, borderRadius: 6 * u + ringPad, border: `${3 * u}px solid ${FILM.terracotta}`, opacity: 1 - ring }} />
        ) : null}
        {t > O.site - 0.1 ? (
          <svg width={26 * u} height={36 * u} viewBox="0 0 26 36" style={{ position: "absolute", left: cx - 3 * u, top: cy - 2 * u, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))", opacity: loaded }}>
            <path d="M3 2 L3 27 L9 21.5 L13.2 31 L17 29.4 L12.9 20 L21 20 Z" fill="#141010" stroke="#ffffff" strokeWidth={2} strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
    </div>
  );
};

const Phone: React.FC<{ w: number; u: number }> = ({ w, u }) => {
  const bezel = 11 * u;
  const sw = w - bezel * 2;
  const sh = sw * (2532 / 1170);
  return (
    <div style={{ width: w, height: sh + bezel * 2, borderRadius: 52 * u, background: "#0d0b0a", padding: bezel, boxSizing: "border-box", boxShadow: "0 50px 110px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(255,255,255,0.12)" }}>
      <div style={{ width: sw, height: sh, borderRadius: 42 * u, overflow: "hidden", position: "relative" }}>
        <Img src={staticFile("web/mobile.png")} style={{ width: sw, height: sh }} />
        <div style={{ position: "absolute", left: sw / 2 - 52 * u, top: 10 * u, width: 104 * u, height: 30 * u, borderRadius: 15 * u, background: "#0d0b0a" }} />
      </div>
    </div>
  );
};

/** Particles that pour out of the outro scene and gather into the final logo (echo of the intro). */
const GatherSparks: React.FC<{ t: number; L: Layout }> = ({ t, L }) => {
  const g0 = O.gather;
  if (t < g0 - 0.1 || t > O.logo + 0.4) return null;
  const items: React.ReactNode[] = [];
  const { W, H, u } = L;
  for (let i = 0; i < 90; i++) {
    const a0 = rand(i * 1.7) * Math.PI * 2;
    const r0 = (0.35 + 0.65 * rand(i * 2.9)) * Math.max(W, H) * 0.55;
    const g = prog(t, g0 + rand(i * 3.3) * 0.3, O.logo - 0.05, easeInOutCubic);
    const ang = a0 + g * 2.2;
    const r = r0 * (1 - g);
    const appear = prog(t, g0 + rand(i) * 0.25, g0 + 0.3 + rand(i) * 0.25);
    const w = (5 + 8 * rand(i * 5.5)) * u;
    const h = (30 + 60 * rand(i * 6.1)) * u;
    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: W / 2 + Math.cos(ang) * r - w / 2,
          top: H / 2 + Math.sin(ang) * r * 0.75 - h / 2,
          width: w,
          height: h,
          borderRadius: w * 0.35,
          background: ["#ae4721", "#e16e4a", "#c98a5c", "#dcb48e"][i % 4],
          opacity: appear * (1 - prog(t, O.logo - 0.15, O.logo + 0.1)) * 0.85,
          transform: `rotate(${(rand(i * 9) - 0.5) * 30 + g * 90}deg) scale(${1 - 0.7 * g})`,
        }}
      />,
    );
  }
  return <>{items}</>;
};

export const OutroForeground: React.FC<{ t: number; L: Layout }> = ({ t, L }) => {
  const { W, H, u } = L;
  const start = O.start();
  if (t < start) return null;
  const land = L.format === "landscape";
  const title = prog(t, start + 0.4, start + 1.1, easeOutCubic) * (1 - prog(t, O.o2 - 0.4, O.o2 + 0.2, easeInOutCubic));
  const cardWin = prog(t, O.win - 0.25, O.win + 0.35, easeOutCubic);
  const cardMac = prog(t, O.mac - 0.2, O.mac + 0.4, easeOutCubic);
  const cardsOut = prog(t, O.web - 0.2, O.web + 0.3, easeInOutCubic);
  const browserIn = prog(t, O.o2 - 0.45, O.o2 + 0.45, easeOutCubic);
  const phoneIn = prog(t, O.web - 0.1, O.web + 0.6, easeOutCubic);
  const gatherOut = prog(t, O.gather, O.gather + 0.65, easeInOutCubic);
  const webText = prog(t, O.web, O.web + 0.5, easeOutCubic) * (1 - gatherOut);
  const logoT = t - O.logo;
  const tagline = prog(t, O.tagline - 0.2, O.tagline + 0.5, easeOutCubic);
  const foot = prog(t, E("outro3") - 0.1, E("outro3") + 0.6, easeOutCubic);
  const endFade = prog(t, O.end - 0.55, O.end - 0.02, easeInOutCubic);

  // geometry
  const colX = land ? W * 0.56 : 70 * u;
  const colW = land ? W * 0.39 : W - 140 * u;
  const browserW = land ? 1040 * u : 940 * u;
  const browserX = land ? 110 * u : (W - browserW) / 2;
  const browserY = land ? (H - (browserW * 0.625 + 64 * u)) / 2 - 10 * u : 250 * u;
  const phoneW = land ? 300 * u : 300 * u;
  const phoneX = land ? browserX + browserW - phoneW * 0.55 : W - phoneW - 70 * u;
  const phoneY = land ? H - phoneW * 2.164 - 50 * u : 690 * u;
  const scatter = (p: number) => `translate(${(W / 2 - 0) * 0}px, 0px) scale(${1 - 0.55 * p})`;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* title + platform cards */}
      <div style={{ position: "absolute", left: colX, width: colW, top: land ? 250 * u : 1110 * u, textAlign: land ? "right" : "center", opacity: title, transform: `translateY(${(1 - title) * 20 * u}px)` }}>
        <div style={{ fontFamily: HEADING_FONT, fontSize: (land ? 84 : 92) * u, lineHeight: 1.15, color: "#f6eee7" }}>الجامع لسطح المكتب</div>
        <div style={{ display: "inline-block", marginTop: 34 * u, fontFamily: UI_FONT, fontSize: 30 * u, color: FILM.ember, border: `${1.5 * u}px solid rgba(225,110,74,0.5)`, borderRadius: 999, padding: `${6 * u}px ${22 * u}px` }}>مجاني · أحدث إصدار</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 * u, marginTop: 40 * u, alignItems: land ? "flex-end" : "center", opacity: 1 - cardsOut }}>
          <DownloadCard title="Windows" req="Windows 10 / 11 (x64) · Windows 11 ARM" glyph="win" u={u} a={cardWin} width={land ? colW : colW * 0.92} />
          <DownloadCard title="macOS" req="macOS 13+ · Apple silicon" glyph="mac" u={u} a={cardMac} width={land ? colW : colW * 0.92} />
        </div>
      </div>
      {/* the website */}
      {browserIn > 0 && gatherOut < 1 ? (
        <div style={{ position: "absolute", left: browserX, top: browserY, opacity: browserIn * (1 - gatherOut), transform: `translateY(${(1 - browserIn) * 80 * u}px) ${scatter(gatherOut)}`, transformOrigin: `${W / 2 - browserX}px ${H / 2 - browserY}px` }}>
          <Browser t={t} w={browserW} u={u} />
        </div>
      ) : null}
      {phoneIn > 0 && gatherOut < 1 ? (
        <div style={{ position: "absolute", left: phoneX, top: phoneY, opacity: phoneIn * (1 - gatherOut), transform: `translateY(${(1 - phoneIn) * 140 * u}px) rotate(${(1 - phoneIn) * 6}deg) ${scatter(gatherOut)}`, transformOrigin: `${W / 2 - phoneX}px ${H / 2 - phoneY}px` }}>
          <Phone w={phoneW} u={u} />
        </div>
      ) : null}
      {webText > 0 ? (
        <div style={{ position: "absolute", left: land ? W * 0.66 : 0, width: land ? W * 0.3 : W, top: land ? 330 * u : 1420 * u, textAlign: land ? "right" : "center", opacity: webText, transform: `translateY(${(1 - webText) * 20 * u}px)` }}>
          <div style={{ fontFamily: LATIN_FONT, fontSize: (land ? 64 : 70) * u, color: "#f6eee7", direction: "ltr", fontWeight: 600, letterSpacing: -1 * u, textAlign: land ? "right" : "center" }}>aljam3.com</div>
          <div style={{ fontFamily: HEADING_FONT, fontSize: 40 * u, color: FILM.ember, marginTop: 8 * u }}>على الويب وسطح المكتب</div>
        </div>
      ) : null}
      <GatherSparks t={t} L={L} />
      {/* final card */}
      {logoT > -0.3 ? (
        <div style={{ position: "absolute", inset: 0 }}>
          <div
            style={{
              position: "absolute",
              left: W / 2 - 240 * u,
              top: H / 2 - 240 * u - (land ? 80 : 120) * u,
              width: 480 * u,
              height: 480 * u,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(225,110,74,0.32) 0%, rgba(225,110,74,0) 65%)",
              opacity: prog(t, O.logo - 0.2, O.logo + 0.4),
              transform: `scale(${0.6 + 0.5 * prog(t, O.logo - 0.2, O.logo + 1.2, easeOutCubic)})`,
            }}
          />
          <div style={{ position: "absolute", left: W / 2 - (land ? 230 : 260) * u, top: H / 2 - (land ? 230 : 290) * u }}>
            <Logo id="outro-logo" width={(land ? 460 : 520) * u} color={FILM.ember} write={logoT} sheen={sheenAt(t, O.logo + 1.3)} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: H / 2 + (land ? 170 : 200) * u, textAlign: "center", opacity: tagline, transform: `translateY(${(1 - tagline) * 18 * u}px)`, filter: `blur(${(1 - tagline) * 6}px)` }}>
            <div style={{ fontFamily: HEADING_FONT, fontSize: (land ? 78 : 88) * u, color: "#f6eee7" }}>المكتبة بين يديك</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: H / 2 + (land ? 300 : 345) * u, textAlign: "center", opacity: foot, transform: `translateY(${(1 - foot) * 14 * u}px)` }}>
            <div style={{ fontFamily: LATIN_FONT, fontSize: 38 * u, color: FILM.ember, direction: "ltr", fontWeight: 600, letterSpacing: -0.5 * u }}>aljam3.com</div>
            <div style={{ fontFamily: UI_FONT, fontSize: 28 * u, color: "#b9aca5", marginTop: 12 * u }}>
              <span style={{ fontFamily: LATIN_FONT, fontSize: 24 * u, direction: "ltr", unicodeBidi: "isolate" }}>Windows</span>
              {"   ·   "}
              <span style={{ fontFamily: LATIN_FONT, fontSize: 24 * u, direction: "ltr", unicodeBidi: "isolate" }}>macOS</span>
              {"   ·   "}الويب
            </div>
          </div>
        </div>
      ) : null}
      {endFade > 0 ? <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${endFade})` }} /> : null}
    </div>
  );
};

export const outroDone = (t: number) => clamp((t - O.start()) / 1.1);
export const _o = easeOutBack;
