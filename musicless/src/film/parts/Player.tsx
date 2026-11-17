import React from "react";
import { Img, staticFile } from "remotion";
import { UI, UI_AR } from "../../lib/fonts";
import { clamp } from "../../lib/motion";
import { C } from "../../theme";

/** The player is drawn at a 1280 × 720 reference and scaled, after the modern YouTube player in the store
 *  screenshots (rounded glass buttons, the red bar). Musicless's button sits left of captions. */
const REF_W = 1280;
// the footage as stills (scripts/extract_frames.sh): "The Largest Star in the Universe", each language's own upload,
// 30 frames a second, its first 40 seconds
const FOOTAGE_FPS = 30;
const FOOTAGE_FRAMES = 1200;
// seconds: each upload's whole length (11:58 and 11:33), for the clock and the progress bar
const VIDEO_LENGTH = { en: 718, ar: 693 } as const;
const ROW_Y = 668;
const BAR_Y = 612;
const BTN = 62;
/** Centres, in reference pixels, of the right-hand buttons. */
const RIGHT = { toggle: 916, musicless: 990, cc: 1062, settings: 1124, theater: 1184, full: 1240 };

/** Where Musicless's button is, in the player's own pixels. */
export const playerButton = (w: number) => ({ x: (RIGHT.musicless * w) / REF_W, y: (ROW_Y * w) / REF_W });

export type PlayerProps = {
  w: number;
  t: number;
  /** film time when the picture starts to move; before it the first frame holds */
  playFrom?: number;
  /** seconds into the video at playFrom */
  srcStart?: number;
  /** or the video's own time, given directly (the demo pauses it while the music is removed) */
  src?: number;
  /** 0–1: YouTube's spinner, with the extension's words under it */
  waiting?: number;
  waitLabel?: string;
  /** true while Musicless removes the music (the crossed-out note) */
  on: boolean;
  tip?: { text: string; k: number } | null;
  hover?: number;
  controls?: number;
  lang: "ar" | "en";
  radius?: number;
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const Glyph: React.FC<{ on: boolean; size: number }> = ({ on, size }) => {
  const id = `ml-cut-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "block" }}>
    {/* extension/icons/player-on.svg and player-off.svg */}
    <defs>
      <mask id={id} maskUnits="userSpaceOnUse">
        <rect x="-4" y="-4" width="32" height="32" fill="#fff" />
        <path d="M3.58 2.12 21.58 20.12" stroke="#000" strokeWidth="3.9" strokeLinecap="round" />
      </mask>
    </defs>
    <g mask={on ? `url(#${id})` : undefined} fill="#fff">
      <circle cx="9.2" cy="17.9" r="4.2" />
      <rect x="11.4" y="1.9" width="2" height="16" />
      <rect x="11.4" y="1.9" width="6.4" height="4.4" />
    </g>
    {on && <path d="M3.4 2.3 21.4 20.3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />}
  </svg>
  );
};

const glass = "rgba(28, 28, 28, 0.55)";

export const Player: React.FC<PlayerProps> = ({
  w, t, playFrom = 0, srcStart = 0, src, waiting = 0, waitLabel = "", on, tip = null, hover = 0, controls = 1, lang, radius = 14,
}) => {
  const f = w / REF_W;
  const h = (w * 9) / 16;
  const time = src ?? srcStart + Math.max(0, t - playFrom);
  const srcFrame = Math.min(FOOTAGE_FRAMES, Math.max(1, Math.floor(time * FOOTAGE_FPS) + 1));
  const shown = time;
  const length = VIDEO_LENGTH[lang];
  const played = shown / length;
  const font = lang === "ar" ? UI_AR : UI;
  const px = (v: number) => v * f;
  const spin = (t * 360) / 0.95;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: radius, overflow: "hidden", background: "#000" }}>
      <Img src={staticFile(`media/clip-${lang}/${String(srcFrame).padStart(4, "0")}.jpg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"}} />
      {/* the bottom bar's shade */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: px(250), opacity: controls, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.62))" }} />
      {/* waiting: the spinner and Musicless's words under it */}
      {waiting > 0 && (
        <>
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.25 * waiting})` }} />
          <svg width={px(72)} height={px(72)} viewBox="0 0 72 72" style={{ position: "absolute", left: w / 2 - px(36), top: h / 2 - px(36), opacity: waiting, transform: `rotate(${spin}deg)` }}>
            <circle cx="36" cy="36" r="30" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeDasharray="140 60" />
          </svg>
          <div
            style={{
              position: "absolute", left: w / 2, top: h / 2 + px(64), transform: "translateX(-50%)", opacity: waiting, height: px(44), lineHeight: `${px(44)}px`,
              padding: `0 ${px(16)}px`, borderRadius: px(11), background: "rgba(28, 28, 28, 0.9)", color: "#eee", fontFamily: font, fontWeight: 500,
              fontSize: px(lang === "ar" ? 25 : 24), whiteSpace: "nowrap", direction: lang === "ar" ? "rtl" : "ltr",
            }}
          >
            {waitLabel}
          </div>
        </>
      )}
      {/* controls */}
      <div style={{ position: "absolute", inset: 0, opacity: controls }}>
        {/* progress */}
        <div style={{ position: "absolute", left: px(24), right: px(24), top: px(BAR_Y), height: px(5), borderRadius: px(3), background: "rgba(255,255,255,0.25)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${clamp(played + 0.08) * 100}%`, background: "rgba(255,255,255,0.35)", borderRadius: px(3) }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${clamp(played) * 100}%`, background: C.ytRed, borderRadius: px(3) }} />
          <div style={{ position: "absolute", left: `${clamp(played) * 100}%`, top: px(2.5), width: px(16), height: px(16), marginLeft: px(-8), marginTop: px(-8), borderRadius: "50%", background: C.ytRed }} />
        </div>
        {/* left: pause, volume, time, chapter */}
        <Pill x={px(24)} w={px(BTN)} f={f}>
          <svg viewBox="0 0 24 24" width={px(30)} height={px(30)}><rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="#fff" /><rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="#fff" /></svg>
        </Pill>
        <Pill x={px(24 + BTN + 10)} w={px(BTN)} f={f}>
          <svg viewBox="0 0 24 24" width={px(30)} height={px(30)} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="#fff" stroke="none" />
            <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
          </svg>
        </Pill>
        <Pill x={px(24 + 2 * (BTN + 10))} w={px(172)} f={f}>
          <span style={{ color: "#fff", fontFamily: UI, fontWeight: 500, fontSize: px(19), letterSpacing: "0.01em" }}>{`${fmt(shown)} / ${fmt(length)}`}</span>
        </Pill>
        {/* right: autoplay and Musicless in one glass pill, then captions, settings, theatre, full screen */}
        <div style={{ position: "absolute", left: px(RIGHT.toggle - 44), top: px(ROW_Y - BTN / 2), width: px(RIGHT.musicless - RIGHT.toggle + 44 + 36), height: px(BTN), borderRadius: px(BTN / 2), background: glass }} />
        <div style={{ position: "absolute", left: px(RIGHT.toggle - 22), top: px(ROW_Y - 11), width: px(44), height: px(22), borderRadius: px(11), background: "rgba(255,255,255,0.92)" }}>
          <div style={{ position: "absolute", right: px(1), top: px(1), width: px(20), height: px(20), borderRadius: "50%", background: "#111", display: "grid", placeItems: "center" }}>
            <svg viewBox="0 0 10 10" width={px(9)} height={px(9)}><path d="M3 2v6l5-3z" fill="#fff" /></svg>
          </div>
        </div>
        <div
          style={{
            position: "absolute", left: px(RIGHT.musicless - 30), top: px(ROW_Y - 30), width: px(60), height: px(60), borderRadius: "50%",
            background: `rgba(255,255,255,${0.2 * hover})`, display: "grid", placeItems: "center",
          }}
        >
          <Glyph on={on} size={px(32)} />
        </div>
        <Icon24 cx={px(RIGHT.cc)} f={f}>
          <rect x="2.5" y="5" width="19" height="14" rx="3" fill="#fff" />
          <text x="12" y="15.4" textAnchor="middle" fontFamily="Roboto" fontWeight="800" fontSize="8.4" fill="#111">CC</text>
        </Icon24>
        <Icon24 cx={px(RIGHT.settings)} f={f}>
          <path
            d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            fill="none" stroke="#fff" strokeWidth="2"
          />
          <circle cx="12" cy="12" r="3" fill="none" stroke="#fff" strokeWidth="2" />
        </Icon24>
        <Icon24 cx={px(RIGHT.theater)} f={f}>
          <rect x="2.5" y="6" width="19" height="12" rx="2" fill="none" stroke="#fff" strokeWidth="2" />
        </Icon24>
        <Icon24 cx={px(RIGHT.full)} f={f}>
          <path d="M3 9V4h5M16 4h5v5M21 15v5h-5M8 20H3v-5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </Icon24>
        {/* the button's tooltip, above the bar */}
        {tip && tip.k > 0 && (
          <div
            style={{
              position: "absolute", left: px(RIGHT.musicless), top: px(BAR_Y - 22), transform: `translate(-50%, -100%) translateY(${(1 - tip.k) * px(6)}px)`, opacity: tip.k,
              padding: `${px(7)}px ${px(12)}px`, borderRadius: px(9), background: "rgba(28, 28, 28, 0.9)", color: "#eee", fontFamily: font, fontWeight: 500,
              fontSize: px(lang === "ar" ? 21 : 20), whiteSpace: "nowrap", direction: lang === "ar" ? "rtl" : "ltr",
            }}
          >
            {tip.text}
          </div>
        )}
      </div>
    </div>
  );
};

const Pill: React.FC<{ x: number; w: number; f: number; children: React.ReactNode }> = ({ x, w, f, children }) => (
  <div style={{ position: "absolute", left: x, top: (ROW_Y - BTN / 2) * f, width: w, height: BTN * f, borderRadius: (BTN / 2) * f, background: glass, display: "grid", placeItems: "center" }}>
    {children}
  </div>
);

const Icon24: React.FC<{ cx: number; f: number; children: React.ReactNode }> = ({ cx, f, children }) => (
  <svg viewBox="0 0 24 24" width={30 * f} height={30 * f} style={{ position: "absolute", left: cx - 15 * f, top: (ROW_Y - 15) * f, overflow: "visible" }}>
    {children}
  </svg>
);
