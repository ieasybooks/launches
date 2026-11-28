import React from "react";
import { UI } from "../../lib/fonts";
import { clamp, ease } from "../../lib/motion";
import { SCREEN } from "../context";

// An Android phone with Chrome, drawn in CSS pixels and scaled as a whole by the camera: a thin black frame, the status
// bar, Chrome's toolbar tinted by the page's theme colour (#f4ede0, the page's own <meta name="theme-color">), the
// page, and the gesture bar. In Arabic the system bars mirror, as Android and Chrome do; the address stays LTR.

const PAPER = "#f4ede0";
const INK = "#1f1d1a";
const BEZEL = 11;
const RADIUS = 46;

const StatusBar: React.FC<{ rtl: boolean }> = ({ rtl }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: SCREEN.status, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", direction: rtl ? "rtl" : "ltr", fontFamily: UI, fontSize: 14, fontWeight: 500, color: INK, background: PAPER }}>
    <span style={{ direction: "ltr" }}>10:24</span>
    <span style={{ display: "flex", gap: 6, alignItems: "center", direction: "ltr" }}>
      {/* wi-fi, signal, battery */}
      <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 20.5 1.2 9.2a15.4 15.4 0 0 1 21.6 0Z" fill={INK} /></svg>
      <svg width="15" height="15" viewBox="0 0 24 24"><path d="M3 21h18V3Z" fill={INK} /></svg>
      <svg width="11" height="17" viewBox="0 0 11 18"><rect x="0.5" y="2" width="10" height="15.5" rx="2" fill="none" stroke={INK} strokeWidth="1" /><rect x="3.5" y="0" width="4" height="2" rx="0.6" fill={INK} /><rect x="2" y="6" width="7" height="10" rx="1" fill={INK} /></svg>
    </span>
  </div>
);

const Toolbar: React.FC<{ rtl: boolean; url: string }> = ({ rtl, url }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: SCREEN.status, height: SCREEN.toolbar, display: "flex", alignItems: "center", gap: 10, padding: "0 10px 0 12px", direction: rtl ? "rtl" : "ltr", background: PAPER }}>
    {/* the omnibox: the page's info icon and its address */}
    <div style={{ flex: 1, height: 42, borderRadius: 21, background: "rgba(31, 29, 26, 0.075)", display: "flex", alignItems: "center", gap: 10, padding: "0 14px", direction: "ltr" }}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round">
        <path d="M4 8h9M17 8h3M4 16h3M11 16h9" />
        <circle cx="15" cy="8" r="2.2" />
        <circle cx="9" cy="16" r="2.2" />
      </svg>
      <span style={{ fontFamily: UI, fontSize: 16.5, color: INK, letterSpacing: 0.1, whiteSpace: "nowrap", overflow: "hidden" }}>{url}</span>
    </div>
    {/* the tab switcher and the menu */}
    <div style={{ width: 22, height: 22, border: `2px solid ${INK}`, borderRadius: 5, display: "grid", placeItems: "center", fontFamily: UI, fontSize: 12, fontWeight: 700, color: INK, boxSizing: "border-box", margin: "0 6px" }}>1</div>
    <svg width="22" height="22" viewBox="0 0 24 24"><g fill={INK}><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></g></svg>
  </div>
);

/** A tap on the screen: a soft disc that comes down, presses and opens out (Android's own touch feedback is the
 *  ripple inside the button; the disc shows where the finger is). `k` runs −1 → 0 (arriving) → 1 (gone). */
export const Tap: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= -1 || k >= 1) return null;
  const arrive = clamp(k + 1);
  const after = clamp(k);
  const r = 23 * (1.25 - 0.25 * ease.out(arrive)) * (1 - 0.12 * Math.sin(Math.PI * clamp(k / 0.25)));
  const o = (k < 0 ? ease.out(arrive) : 1 - ease.inOut(clamp(k / 0.55))) * 0.9;
  const ring = after > 0 ? ease.out(clamp(after / 0.6)) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, pointerEvents: "none", zIndex: 20 }}>
      {ring > 0 && ring < 1 && (
        <div style={{ position: "absolute", left: -23 - 30 * ring, top: -23 - 30 * ring, width: 46 + 60 * ring, height: 46 + 60 * ring, borderRadius: "50%", border: `2px solid rgba(31,29,26,${0.4 * (1 - ring)})` }} />
      )}
      <div style={{ position: "absolute", left: -r, top: -r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: `rgba(31, 29, 26, ${0.2 * o})`, border: `1.5px solid rgba(31,29,26,${0.32 * o})`, boxShadow: `0 3px 10px rgba(31,29,26,${0.15 * o})` }} />
    </div>
  );
};

/** The phone. `x`, `y` are the screen's top-left corner in the film, `s` its scale; `children` is the page (drawn
 *  in CSS pixels below the toolbar), `overlay` anything on the screen above it (taps). */
export const Phone: React.FC<{ x: number; y: number; s: number; rtl: boolean; url: string; children: React.ReactNode; overlay?: React.ReactNode; shadow?: number }> = ({
  x, y, s, rtl, url, children, overlay, shadow = 1,
}) => (
  // placed by the transform rather than left/top, so slow moves glide by fractions of a pixel instead of stepping
  <div style={{ position: "absolute", left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: "0 0" }}>
    {/* the body */}
    <div
      style={{
        position: "absolute", left: -BEZEL, top: -BEZEL, right: -BEZEL, bottom: -BEZEL, borderRadius: RADIUS + BEZEL, background: "#121110",
        boxShadow: `0 ${40 * shadow}px ${80 * shadow}px -30px rgba(31,29,26,${0.55 * shadow}), 0 12px 30px -12px rgba(31,29,26,${0.35 * shadow}), inset 0 0 0 1.5px #3a3733`,
      }}
    />
    {/* side buttons */}
    <div style={{ position: "absolute", right: -BEZEL - 3, top: 190, width: 4, height: 70, borderRadius: 2, background: "#2a2825" }} />
    <div style={{ position: "absolute", right: -BEZEL - 3, top: 290, width: 4, height: 110, borderRadius: 2, background: "#2a2825" }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: RADIUS, overflow: "hidden", background: PAPER, isolation: "isolate" }}>
      <div style={{ position: "absolute", left: 0, top: SCREEN.status + SCREEN.toolbar, width: SCREEN.w, height: SCREEN.h - SCREEN.status - SCREEN.toolbar - SCREEN.nav, overflow: "hidden" }}>
        {children}
        {overlay}
      </div>
      <StatusBar rtl={rtl} />
      <Toolbar rtl={rtl} url={url} />
      {/* the camera's punch hole */}
      <div style={{ position: "absolute", left: SCREEN.w / 2 - 6, top: 10, width: 12, height: 12, borderRadius: "50%", background: "#0d0c0b" }} />
      {/* the gesture bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: SCREEN.nav, background: PAPER, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: 108, height: 4, borderRadius: 2, background: "rgba(31,29,26,0.55)" }} />
      </div>
    </div>
  </div>
);
