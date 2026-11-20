import React from "react";
import { UI_MEDIUM, UI_SEMI } from "../../lib/fonts";

// An iPhone (Black Titanium) around a 393 × 852 pt screen: frame, bezel, Dynamic Island, side buttons, the
// status bar and the home indicator (from the Mofied film). The camera places it: the screen point (fx, fy) sits
// at the frame point (X, Y), scaled by s.
export const PHONE_W = 393;
export const PHONE_H = 852;

export type Cam = { X: number; Y: number; s: number; fx: number; fy: number };

const Glyphs: React.FC<{ color: string; airplane?: number }> = ({ color, airplane = 0 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <div style={{ position: "relative", width: 19, height: 12 }}>
      <svg width={19} height={12} viewBox="0 0 19 12" style={{ position: "absolute", opacity: 1 - airplane }}>
        {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 5} y={9 - i * 3} width={3.2} height={3 + i * 3} rx={0.9} fill={color} />)}
      </svg>
      <svg width={17} height={14} viewBox="0 0 24 24" style={{ position: "absolute", left: 1, top: -1, opacity: airplane }}>
        <path fill={color} d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8.5l-8 5v2l8-2.5V18.5l-2 1.5V21.5l3.5-1 3.5 1V20l-2-1.5V13z" />
      </svg>
    </div>
    <svg width={17} height={12} viewBox="0 0 17 12" fill="none" stroke={color} strokeLinecap="round" style={{ opacity: 1 - airplane }}>
      <path d="M1.2 4.4a10.6 10.6 0 0 1 14.6 0" strokeWidth={2} />
      <path d="M3.9 7.2a6.6 6.6 0 0 1 9.2 0" strokeWidth={2} />
      <circle cx={8.5} cy={10.2} r={1.3} fill={color} stroke="none" />
    </svg>
    <svg width={27} height={13} viewBox="0 0 27 13">
      <rect x={0.5} y={0.5} width={23} height={12} rx={3.8} fill="none" stroke={color} strokeOpacity={0.4} />
      <rect x={2.2} y={2.2} width={17.6} height={8.6} rx={2.4} fill={color} />
      <path d="M25 4.4v4.2a2.3 2.3 0 0 0 0-4.2z" fill={color} fillOpacity={0.45} />
    </svg>
  </div>
);

/** iOS status bar: the time and the cellular (or airplane), Wi-Fi and battery glyphs, mirrored in Arabic. */
export const StatusBar: React.FC<{ tone: "light" | "dark"; rtl: boolean; airplane?: number; hideTime?: boolean }> = ({ tone, rtl, airplane, hideTime }) => {
  const color = tone === "light" ? "#fff" : "#0a0a0a";
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 54, display: "flex", flexDirection: rtl ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", padding: rtl ? "4px 46px 0 34px" : "4px 34px 0 46px", boxSizing: "border-box", zIndex: 20, pointerEvents: "none" }}>
      <span style={{ fontFamily: UI_SEMI, fontSize: 17, color, letterSpacing: "-0.01em", opacity: hideTime ? 0 : 1 }}>9:41</span>
      <Glyphs color={color} airplane={airplane} />
    </div>
  );
};

const RING: React.CSSProperties = {
  WebkitMaskImage: "linear-gradient(#000, #000), linear-gradient(#000, #000)",
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
  maskComposite: "exclude",
};
const titanium = "linear-gradient(90deg, #121214 0%, #57575c 1.6%, #2b2b2f 4%, #222226 50%, #2b2b2f 96%, #57575c 98.4%, #121214 100%)";
const button = (side: "left" | "right", top: number, height: number) => (
  <div key={`${side}${top}`} style={{ position: "absolute", top, height, width: 4, [side]: -14.5, borderRadius: side === "left" ? "2px 0 0 2px" : "0 2px 2px 0", background: "linear-gradient(90deg, #1b1b1e, #4d4d52 45%, #1f1f22)" }} />
);

export const Phone: React.FC<{
  cam: Cam; frame?: number; tone?: "light" | "dark"; rtl: boolean; airplane?: number; screenBg?: string; shadow?: number; status?: number; hideTime?: boolean;
  /** pressed side button (0–1), for the lock */
  press?: number;
  children: React.ReactNode;
}> = ({ cam, frame = 1, tone = "dark", rtl, airplane, screenBg = "#000", shadow = 1, status = 1, hideTime, press = 0, children }) => {
  const { X, Y, s, fx, fy } = cam;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: PHONE_W, height: PHONE_H, transform: `translate(${X - fx * s}px, ${Y - fy * s}px) scale(${s})`, transformOrigin: "0 0" }}>
      <div style={{ position: "absolute", inset: 0, opacity: frame }}>
        <div style={{ position: "absolute", inset: -10.5, borderRadius: 65.5, boxShadow: `0 70px 130px -55px rgba(26, 32, 54, ${0.55 * shadow}), 0 22px 46px -22px rgba(26, 32, 54, ${0.4 * shadow})` }} />
        {button("left", 112, 32)}
        {button("left", 182, 62)}
        {button("left", 258, 62)}
        <div style={{ position: "absolute", top: 216, height: 96, width: 4, right: -14.5 + press * 2.5, borderRadius: "0 2px 2px 0", background: "linear-gradient(90deg, #1b1b1e, #4d4d52 45%, #1f1f22)" }} />
        {/* the frame and the bezel are rings: nothing of them lies under the screen, which can be see-through */}
        <div style={{ position: "absolute", inset: -10.5, borderRadius: 65.5, padding: 3.5, boxSizing: "border-box", background: titanium, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 1.5px 0 rgba(255,255,255,0.18)", ...RING }} />
        <div style={{ position: "absolute", inset: -7, borderRadius: 62, border: "7px solid #030303", boxSizing: "border-box" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, borderRadius: 55 * frame, overflow: "hidden", background: screenBg }}>
        {children}
        <div style={{ position: "absolute", inset: 0, opacity: status * frame, pointerEvents: "none" }}>
          <StatusBar tone={tone} rtl={rtl} airplane={airplane} hideTime={hideTime} />
          <div style={{ position: "absolute", top: 11, left: (PHONE_W - 126) / 2, width: 126, height: 37, borderRadius: 19, background: "#000", zIndex: 21 }} />
          <div style={{ position: "absolute", bottom: 8, left: (PHONE_W - 139) / 2, width: 139, height: 5, borderRadius: 3, background: tone === "light" ? "#fff" : "#0a0a0a", opacity: 0.85, zIndex: 21 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(118deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 30%)", zIndex: 22 }} />
        </div>
      </div>
    </div>
  );
};

/** A touch on the screen, as screen recordings show it: a soft disc that presses in and fades. */
export const Touch: React.FC<{ x: number; y: number; t: number; at: number; dark?: boolean }> = ({ x, y, t, at, dark }) => {
  const k = (t - at) / 0.42;
  if (k < -0.35 || k > 1) return null;
  const inK = Math.min(1, (k + 0.35) / 0.35);
  const press = k < 0 ? 1 - 0.18 * inK : 0.82 + 0.18 * Math.min(1, k * 3);
  const op = k < 0 ? inK : 1 - Math.max(0, (k - 0.25) / 0.75);
  const c = dark ? "255, 255, 255" : "26, 32, 54";
  return (
    <div style={{ position: "absolute", left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: `rgba(${c}, 0.22)`, border: `1.5px solid rgba(${c}, 0.35)`, transform: `scale(${press})`, opacity: op, zIndex: 30, pointerEvents: "none", boxSizing: "border-box" }} />
  );
};

export { UI_MEDIUM };
