import React from "react";
import { UI } from "../../lib/fonts";
import { rand } from "../../lib/motion";

// An audio file as the website lists it (the audio tool's file row, audio.css): the format in monospace, the name and,
// below, its length and size. Drawn in CSS pixels like the page (scale it with `s`); `wave` adds a strip of the
// file's sound under the name: music and speech (busy, even bars) or the voices alone (bursts with gaps).
const C = { card: "#faf6ee", line: "#d9d1c3", ink: "#1f1d1a", muted: "#666055" };

export const Wave: React.FC<{ width: number; height: number; t: number; music: number; seed: number; color?: string }> = ({ width, height, t, music, seed, color = C.ink }) => {
  const n = Math.floor(width / 6);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, width, height }}>
      {Array.from({ length: n }, (_, i) => {
        const x = i / n;
        // speech: words and pauses that drift past; music: a steady, full bed under it
        const words = Math.max(0, Math.sin(i * 0.55 - t * 7 + seed) * 0.7 + Math.sin(i * 0.21 + t * 2.3 + seed * 2) * 0.4);
        const bed = 0.45 + 0.25 * Math.sin(i * 1.7 + t * 11 + seed) + 0.2 * rand(i * 3.1 + Math.floor(t * 12) * 0.37 + seed);
        const a = Math.min(1, words * 0.85 + music * bed * 0.75) * (0.55 + 0.45 * Math.sin(Math.PI * x));
        return <div key={i} style={{ width: 4, height: Math.max(3, a * height), borderRadius: 2, background: color, opacity: 0.25 + 0.6 * a }} />;
      })}
    </div>
  );
};

export const FileCard: React.FC<{
  name: string; type: string; meta?: string; width: number; rtl: boolean; style?: React.CSSProperties; children?: React.ReactNode; check?: number;
}> = ({ name, type, meta, width, rtl, style, children, check = 0 }) => (
  <div
    style={{
      width, boxSizing: "border-box", padding: "14px 18px", borderRadius: 14, background: C.card, border: `1px solid ${C.line}`, direction: rtl ? "rtl" : "ltr",
      fontFamily: `${UI.replace("'Noto Sans Arabic'", "'Noto Naskh Arabic'")}`, color: C.ink, ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 50 }}>
      <span style={{ fontFamily: "'Noto Sans Mono', monospace", fontSize: 12, letterSpacing: "0.06em", color: C.muted, minWidth: 32, flex: "none" }}>{type}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div dir="auto" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: rtl ? "right" : "left" }}>{name}</div>
        {meta && <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, marginTop: 2, direction: "ltr", textAlign: rtl ? "right" : "left", fontVariantNumeric: "tabular-nums" }}>{meta}</div>}
      </div>
      {check > 0 && (
        <div style={{ width: 30, height: 30, borderRadius: 15, background: C.ink, display: "grid", placeItems: "center", flex: "none", transform: `scale(${check})` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f4ede0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
      )}
    </div>
    {children}
  </div>
);
