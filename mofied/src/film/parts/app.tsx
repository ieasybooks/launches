import React from "react";
import { Img, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import content from "../../data/content.json";
import { DISPLAY, LATIN, QURAN, UI } from "../../lib/fonts";
import type { Lang } from "../../lib/timeline";
import { C } from "../../theme";
import { PHONE_H, PHONE_W } from "../context";
import { APP, clock } from "../copy";
import { Icon, PauseIcon } from "./icons";
import { MARK_PATH } from "./markPath";

// The Mofied app redrawn from its source (apps/mobile/src/App.tsx, Reminder.tsx, Ending.tsx and
// docs/design/player-overlay.md), in points on an iPhone's 393 × 852 screen with its real safe areas.
export type Media = (typeof content.media)[number];
export const MEDIA = Object.fromEntries(content.media.map((m) => [m.role === "open" ? "open" : m.id, m])) as Record<string, Media>;
export const media = (id: string) => content.media.find((m) => m.id === id)!;

export const SAFE_TOP = 59;
export const SAFE_BOTTOM = 34;
const TOP = SAFE_TOP + 18; // the header sits 18 pt under the safe top
const textShadow = "0 1px 10px rgba(0, 0, 0, 0.35)";

const Circle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ width: 44, height: 44, borderRadius: 22, border: "1px solid #ffffff26", background: "#00000099", display: "grid", placeItems: "center", boxSizing: "border-box" }}>{children}</div>
);

export const BudgetPill: React.FC<{ lang: Lang; minutes: number; style?: React.CSSProperties }> = ({ lang, minutes, style }) => (
  <div
    style={{
      minHeight: 40, borderRadius: 22, padding: "4px 14px", display: "flex", alignItems: "center", gap: 8, boxSizing: "border-box",
      border: "1px solid #ffffff26", background: "#00000099", flexDirection: "row", whiteSpace: "nowrap", ...style,
    }}
  >
    <Icon name="clock" size={15} color="#f5f5f5" />
    <span style={{ fontFamily: lang === "ar" ? UI : LATIN, fontSize: 14, color: C.text, direction: lang === "ar" ? "rtl" : "ltr", lineHeight: 1.6 }}>
      {APP[lang].remaining(minutes)}
    </span>
  </div>
);

export const Header: React.FC<{ lang: Lang; minutes: number; sound?: boolean }> = ({ lang, minutes, sound = true }) => (
  <div style={{ position: "absolute", top: TOP, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, zIndex: 3 }}>
    <div style={{ display: "flex", gap: 12 }}>
      <Circle><Icon name="info" size={21} /></Circle>
      {sound && <Circle><Icon name="volume" size={21} /></Circle>}
    </div>
    <BudgetPill lang={lang} minutes={minutes} />
  </div>
);

/** A media page: the clip, the top and bottom fades, the header and the bottom stack. */
export const MediaScreen: React.FC<{ m: Media; lang: Lang; minutes: number; videoFrom: number; t: number }> = ({ m, lang, minutes, videoFrom, t }) => {
  const { fps } = useVideoConfig();
  const elapsed = m.clipOffset * 1000 + Math.max(0, t - videoFrom) * 1000;
  const progress = Math.min(1, elapsed / m.durationMs);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.screen, overflow: "hidden" }}>
      <Sequence from={Math.round(videoFrom * fps)} layout="none">
        <OffthreadVideo src={staticFile(m.file)} muted style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </Sequence>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: SAFE_TOP + 110, background: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 256 + SAFE_BOTTOM + 16, background: "linear-gradient(rgba(0,0,0,0) 0px, rgba(0,0,0,0.62) 80px, rgba(0,0,0,0.68) 100%)" }} />
      <Header lang={lang} minutes={minutes} />
      <div style={{ position: "absolute", left: 20, right: 20, bottom: SAFE_BOTTOM + 16, direction: "rtl" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minHeight: 44 }}>
          <Img src={staticFile(m.portrait)} style={{ width: 30, height: 30, borderRadius: 15, border: "1px solid #ffffff26", objectFit: "cover" }} />
          <span style={{ fontFamily: UI, fontSize: 16, lineHeight: "24px", color: "#e2e2e2", textShadow }}>{m.speaker}</span>
        </div>
        <div
          style={{
            fontFamily: DISPLAY, fontWeight: 500, fontSize: 28, lineHeight: "42px", color: C.text, textAlign: "right", textShadow,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {m.title}
        </div>
        <div style={{ fontFamily: LATIN, fontSize: 13, lineHeight: "16px", marginTop: 4, color: "#f0f0f0", direction: "ltr", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
          {clock(elapsed)} / {clock(m.durationMs)}
        </div>
        <div style={{ height: 2, marginTop: 10, background: "#ffffff38", direction: "ltr" }}>
          <div style={{ height: 2, width: `${progress * 100}%`, background: "#fff" }} />
        </div>
      </div>
    </div>
  );
};

/** A reminder page: the plan's Quran text, its citation, the countdown and the pause-to-read control. */
export const ReminderScreen: React.FC<{ lang: Lang; minutes: number; remainingMs: number; chip?: number }> = ({ lang, minutes, remainingMs, chip = 0 }) => {
  const r = content.reminder[lang];
  const arabic = r.kind === "quran" && lang === "ar";
  const seconds = Math.ceil(Math.max(0, remainingMs) / 1000);
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#181818, #0a0a0a)", display: "flex", flexDirection: "column", padding: `${SAFE_TOP + 90}px 24px ${SAFE_BOTTOM + 24}px`, boxSizing: "border-box" }}>
      <Header lang={lang} minutes={minutes} sound={false} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 12, paddingBottom: 12 }}>
        <div
          style={{
            display: "flex", flexDirection: lang === "ar" ? "row-reverse" : "row", alignItems: "center", gap: 8, borderRadius: 24, padding: "5px 13px",
            border: `1px solid rgba(255,255,255,${0.18 + 0.5 * chip})`, boxShadow: `0 0 ${18 * chip}px rgba(255,255,255,${0.25 * chip})`,
          }}
        >
          <Icon name="book" size={18} color="#d6d6d6" />
          <span style={{ fontFamily: lang === "ar" ? UI : LATIN, fontSize: 16, color: C.text, lineHeight: 1.5 }}>{APP[lang].quran}</span>
        </div>
        <div
          style={{
            fontFamily: arabic ? QURAN : LATIN, fontSize: arabic ? 30 : 24, lineHeight: arabic ? "58px" : "40px", color: C.text, textAlign: "center",
            marginTop: 36, direction: arabic ? "rtl" : "ltr",
          }}
        >
          {r.body}
        </div>
        <div style={{ height: 1, width: 32, background: "#ffffff26", margin: "24px 0" }} />
        <div style={{ fontFamily: lang === "ar" ? UI : LATIN, fontSize: 16, color: "#c4c4c4", textAlign: "center", direction: lang === "ar" ? "rtl" : "ltr" }}>
          {r.citation}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: lang === "ar" ? UI : LATIN, fontSize: 16, color: "#d6d6d6", textAlign: "center", direction: lang === "ar" ? "rtl" : "ltr" }}>
          {APP[lang].countdown(seconds)}
        </div>
        <div style={{ height: 2, background: "#ffffff24", margin: "18px 8px 24px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ height: 2, background: "#fff", width: `${(Math.max(0, remainingMs) / r.durationMs) * 100}%` }} />
        </div>
        <div
          style={{
            minHeight: 48, padding: "10px 18px", boxSizing: "border-box", border: "1px solid #ffffff38", borderRadius: 28, display: "flex",
            flexDirection: lang === "ar" ? "row-reverse" : "row", alignItems: "center", justifyContent: "center", gap: 9, background: "#ffffff05",
          }}
        >
          <PauseIcon size={18} />
          <span style={{ fontFamily: lang === "ar" ? UI : LATIN, fontSize: 16, color: C.text }}>{APP[lang].pauseRead}</span>
        </div>
      </div>
    </div>
  );
};

/** The finite ending: the mark, the plan's title and reflection. */
export const EndingScreen: React.FC<{ lang: Lang }> = ({ lang }) => {
  const e = content.ending[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
    <div style={{ position: "absolute", inset: 0, background: C.screen, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: `${SAFE_TOP + 90}px 24px ${SAFE_BOTTOM + 24}px`, boxSizing: "border-box" }}>
      <div style={{ position: "absolute", top: TOP, left: 20 }}>
        <Circle><Icon name="info" size={21} /></Circle>
      </div>
      <svg width={72} height={72} viewBox="0 0 1024 1024" style={{ marginBottom: 32 }}>
        <path fill={C.text} fillRule="evenodd" d={MARK_PATH} />
      </svg>
      <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 26, lineHeight: "39px", color: C.text, textAlign: "center", direction: dir }}>{e.title}</div>
      <div style={{ height: 1, width: 32, background: "#ffffff26", margin: "24px 0" }} />
      <div style={{ fontFamily: lang === "ar" ? UI : LATIN, fontSize: 18, lineHeight: "34px", color: "#c9c9c9", maxWidth: 345, textAlign: "center", direction: dir }}>{e.body}</div>
    </div>
  );
};

const Glyphs: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <svg width={19} height={12} viewBox="0 0 19 12">
      {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 5} y={9 - i * 3} width={3.2} height={3 + i * 3} rx={0.9} fill={color} />)}
    </svg>
    <svg width={17} height={12} viewBox="0 0 17 12" fill="none" stroke={color} strokeLinecap="round">
      <path d="M1.2 4.4a10.6 10.6 0 0 1 14.6 0" strokeWidth={2} />
      <path d="M3.9 7.2a6.6 6.6 0 0 1 9.2 0" strokeWidth={2} />
      <circle cx={8.5} cy={10.2} r={1.3} fill={color} stroke="none" />
    </svg>
    <svg width={27} height={13} viewBox="0 0 27 13">
      <rect x={0.5} y={0.5} width={23} height={12} rx={3.8} fill="none" stroke={color} strokeOpacity={0.4} />
      <rect x={2.2} y={2.2} width={19.6} height={8.6} rx={2.4} fill={color} />
      <path d="M25 4.4v4.2a2.3 2.3 0 0 0 0-4.2z" fill={color} fillOpacity={0.45} />
    </svg>
  </div>
);

/** iOS status bar: the time and the cellular, Wi-Fi and battery glyphs, mirrored in Arabic as iOS does. */
export const StatusBar: React.FC<{ tone: "light" | "dark"; rtl: boolean }> = ({ tone, rtl }) => {
  const color = tone === "light" ? "#fff" : "#0a0a0a";
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 54, display: "flex", flexDirection: rtl ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", padding: "4px 34px 0 46px", boxSizing: "border-box", zIndex: 20, pointerEvents: "none", ...(rtl ? { padding: "4px 46px 0 34px" } : {}) }}>
      <span style={{ fontFamily: LATIN, fontWeight: 700, fontSize: 17, color, letterSpacing: "-0.01em" }}>9:41</span>
      <Glyphs color={color} />
    </div>
  );
};

const titanium = "linear-gradient(90deg, #121214 0%, #57575c 1.6%, #2b2b2f 4%, #222226 50%, #2b2b2f 96%, #57575c 98.4%, #121214 100%)";
const button = (side: "left" | "right", top: number, height: number) => (
  <div key={`${side}${top}`} style={{ position: "absolute", top, height, width: 4, [side]: -14.5, borderRadius: side === "left" ? "2px 0 0 2px" : "0 2px 2px 0", background: "linear-gradient(90deg, #1b1b1e, #4d4d52 45%, #1f1f22)" }} />
);

/** An iPhone (Black Titanium) around a 393 × 852 pt screen: frame, bezel, Dynamic Island, side buttons, the
 *  status bar, the home indicator and a faint glass reflection. Seen straight on, it can also turn a little. */
export const Phone: React.FC<{ cx: number; cy: number; s: number; ry?: number; rx?: number; opacity?: number; tone?: "light" | "dark"; rtl?: boolean; shadow?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({
  cx, cy, s, ry = 0, rx = 0, opacity = 1, tone = "light", rtl = true, shadow = true, children, style,
}) => {
  const transform = `perspective(2600px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${s})`;
  return (
    <div style={{ position: "absolute", left: cx - PHONE_W / 2, top: cy - PHONE_H / 2, width: PHONE_W, height: PHONE_H, transform, transformOrigin: "50% 50%", opacity, ...style }}>
      {shadow && <div style={{ position: "absolute", inset: -10.5, borderRadius: 65.5, boxShadow: "0 70px 130px -55px rgba(40, 32, 20, 0.6), 0 22px 46px -22px rgba(40, 32, 20, 0.45)" }} />}
      {button("left", 112, 32)}
      {button("left", 182, 62)}
      {button("left", 258, 62)}
      {button("right", 216, 96)}
      <div style={{ position: "absolute", inset: -10.5, borderRadius: 65.5, background: titanium, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 1.5px 0 rgba(255,255,255,0.18)" }} />
      <div style={{ position: "absolute", inset: -7, borderRadius: 62, background: "#030303" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 55, overflow: "hidden", background: C.screen }}>
        {children}
        <StatusBar tone={tone} rtl={rtl} />
        <div style={{ position: "absolute", top: 11, left: (PHONE_W - 126) / 2, width: 126, height: 37, borderRadius: 19, background: "#000", zIndex: 21 }} />
        <div style={{ position: "absolute", bottom: 8, left: (PHONE_W - 139) / 2, width: 139, height: 5, borderRadius: 3, background: tone === "light" ? "#fff" : "#0a0a0a", opacity: 0.9, zIndex: 21 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(118deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 30%)", zIndex: 22, pointerEvents: "none" }} />
      </div>
    </div>
  );
};

/** The iPhone home screen with Mofied on it (a plain warm wallpaper, no other apps). */
export const HomeScreen: React.FC<{ lang: Lang; icon: number; iconOpacity?: number }> = ({ lang, icon, iconOpacity = 1 }) => (
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 80% at 50% 0%, #fbf7ef 0%, #ece4d4 55%, #d8ccb6 100%)" }}>
    <div style={{ position: "absolute", left: (PHONE_W - icon) / 2, top: (PHONE_H - icon) / 2, width: icon, height: icon, borderRadius: icon * 0.225, background: C.screen, display: "grid", placeItems: "center", boxShadow: "0 10px 24px -10px rgba(40,32,20,0.45)", opacity: iconOpacity }}>
      <svg width={icon * 0.6} height={icon * 0.6} viewBox="0 0 1024 1024"><path fill={C.text} fillRule="evenodd" d={MARK_PATH} /></svg>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: (PHONE_H + icon) / 2 + 10, textAlign: "center", fontFamily: lang === "ar" ? UI : LATIN, fontSize: 18, color: "#1c1c1e" }}>
      {lang === "ar" ? "مفيد" : "Mofied"}
    </div>
  </div>
);
