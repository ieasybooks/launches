import React from "react";
import { clamp, ease, ramp } from "../../lib/motion";

/** The pointer, its tip at (x, y). `press` is 0–1 (the click), `ripple` 0–1 after it. */
export const Cursor: React.FC<{ x: number; y: number; size: number; opacity?: number; press?: number; ripple?: number; hand?: boolean }> = ({
  x, y, size, opacity = 1, press = 0, ripple = 0, hand = false,
}) => {
  if (opacity <= 0) return null;
  const s = 1 - 0.16 * press;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity, zIndex: 50, pointerEvents: "none" }}>
      {ripple > 0 && ripple < 1 && (
        <div
          style={{
            position: "absolute", left: -size * 1.1 * ease.out(ripple), top: -size * 1.1 * ease.out(ripple),
            width: size * 2.2 * ease.out(ripple), height: size * 2.2 * ease.out(ripple), borderRadius: "50%",
            border: `${Math.max(1.5, size * 0.09)}px solid rgba(31, 29, 26, ${0.55 * (1 - ripple)})`, background: `rgba(244, 237, 224, ${0.35 * (1 - ripple)})`,
          }}
        />
      )}
      <svg
        viewBox="0 0 24 24" width={size} height={size}
        style={{ position: "absolute", left: hand ? -size * 0.36 : -size * 0.18, top: -size * 0.08, transform: `scale(${s})`, transformOrigin: "18% 8%", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))", overflow: "visible" }}
      >
        {hand ? (
          <path
            d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V10m0-.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-1.6a6 6 0 0 1-4.6-2.1L4.2 16.2a1.6 1.6 0 0 1 2.3-2.2L9 16.5V11"
            fill="#fff" stroke="#111" strokeWidth={1.4} strokeLinejoin="round"
          />
        ) : (
          <path d="M4.5 2.5v17.2l4.6-4.4 2.9 6.6 2.8-1.2-2.9-6.5h6.5z" fill="#111" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
        )}
      </svg>
    </div>
  );
};

/** A cursor path: it rests at each stop and glides between them; clicks press and ripple. */
export type Stop = { at: number; x: number; y: number; move?: number };
export const cursorAt = (t: number, stops: Stop[], clicks: number[]) => {
  let x = stops[0].x;
  let y = stops[0].y;
  for (let i = 1; i < stops.length; i++) {
    const s = stops[i];
    const dur = s.move ?? 0.55;
    const k = ramp(t, s.at - dur, dur, ease.inOut);
    if (k <= 0) break;
    // a slight arc, as a hand moves
    const arc = Math.sin(Math.PI * k) * Math.min(60, Math.hypot(s.x - x, s.y - y) * 0.12);
    x = x + (s.x - x) * k;
    y = y + (s.y - y) * k - arc;
  }
  let press = 0;
  let ripple = 0;
  for (const c of clicks) {
    const d = t - c;
    if (d > -0.08 && d < 0.14) press = Math.max(press, d < 0 ? (d + 0.08) / 0.08 : 1 - d / 0.14);
    if (d >= 0 && d < 0.5) ripple = d / 0.5;
  }
  return { x, y, press: clamp(press), ripple };
};
