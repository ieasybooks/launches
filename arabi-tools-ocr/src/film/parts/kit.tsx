import React from "react";
import { BODY, DISPLAY, MONO } from "../../lib/fonts";
import { clamp } from "../../lib/motion";
import { C, LIFT } from "../../theme";
import { Icon, OUTLINE, SOLID } from "./icons";

/** A row of rounded bars; `heights` are 0–1 of `height`. */
export const Bars: React.FC<{ heights: number[]; height: number; barW: number; gap: number; color: string; grow?: (i: number) => number; style?: React.CSSProperties }> = ({
  heights, height, barW, gap, color, grow, style,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap, height, direction: "ltr", ...style }}>
    {heights.map((h, i) => {
      const g = grow ? grow(i) : 1;
      return (
        <div
          key={i}
          style={{ width: barW, height: Math.max(barW, h * height) * g, borderRadius: barW, background: color, opacity: g > 0 ? 1 : 0 }}
        />
      );
    })}
  </div>
);

/** The gold divider under the site's page titles: two lines, two dots and a diamond. */
export const Ornament: React.FC<{ width: number; draw?: number; color?: string }> = ({ width, draw = 1, color = C.gold }) => {
  const half = (width - 48) / 2;
  const line = half * clamp(draw);
  const mid = width / 2;
  return (
    <svg width={width} height={14} viewBox={`0 0 ${width} 14`} style={{ display: "block", overflow: "visible" }}>
      <path d={`M${mid - 24} 7h${-line}M${mid + 24} 7h${line}`} stroke={color} strokeWidth={1.4} />
      <circle cx={mid - 13} cy={7} r={1.4 * clamp(draw * 3)} fill={color} />
      <circle cx={mid + 13} cy={7} r={1.4 * clamp(draw * 3)} fill={color} />
      <path d={`M${mid} 1l6 6-6 6-6-6z`} fill={color} transform={`rotate(${(1 - clamp(draw * 2)) * 90} ${mid} 7)`} opacity={clamp(draw * 2)} />
    </svg>
  );
};

/** A paper card like the site's panels. */
export const Panel: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; radius?: number }> = ({ style, children, radius = 32 }) => (
  <div style={{ background: C.surface, borderRadius: radius, boxShadow: `inset 0 0 0 1.5px ${C.lineSoft}, ${LIFT}`, ...style }}>{children}</div>
);

/** An audio file: microphone tile, name, format and length, and its waveform. */
export const FileCard: React.FC<{ name: string; meta: string; width: number; scale?: number; play?: number; heights: number[] }> = ({
  name, meta, width, scale = 1, play = 0, heights,
}) => {
  const s = scale;
  const n = heights.length;
  return (
    <Panel radius={26 * s} style={{ width, padding: `${24 * s}px ${28 * s}px`, direction: "rtl" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 * s }}>
        <div style={{ width: 64 * s, height: 64 * s, borderRadius: 18 * s, background: C.greenSoft, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon d={SOLID.mic} solid size={34 * s} color={C.green} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 31 * s, color: C.text, lineHeight: 1.35, whiteSpace: "nowrap" }}>{name}</div>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 22 * s, color: C.faint, fontVariantNumeric: "tabular-nums", direction: "ltr", textAlign: "right" }}>{meta}</div>
        </div>
      </div>
      <div style={{ position: "relative", marginTop: 18 * s }}>
        <Bars heights={heights} height={46 * s} barW={5 * s} gap={(width - 56 * s - n * 5 * s) / (n - 1)} color={C.gold} style={{ opacity: 0.45 }} />
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${(1 - play) * 100}%)` }}>
          <Bars heights={heights} height={46 * s} barW={5 * s} gap={(width - 56 * s - n * 5 * s) / (n - 1)} color={C.green} />
        </div>
      </div>
    </Panel>
  );
};

/** The site's pill buttons. */
export const Button: React.FC<{ label: string; primary?: boolean; icon?: string; size: number; press?: number; style?: React.CSSProperties }> = ({
  label, primary, icon, size, press = 0, style,
}) => (
  <div
    style={{
      display: "inline-flex", alignItems: "center", gap: size * 0.35, direction: "rtl",
      padding: `${size * 0.42}px ${size * 1.05}px`, borderRadius: 999,
      background: primary ? C.green : C.surface, color: primary ? "#fff" : C.text,
      boxShadow: primary ? `0 10px 24px -10px rgba(31, 92, 73, 0.6)` : `inset 0 0 0 1.5px ${C.line}`,
      fontFamily: BODY, fontWeight: 500, fontSize: size, lineHeight: 1.3, whiteSpace: "nowrap",
      transform: `scale(${1 - 0.05 * press})`, ...style,
    }}
  >
    {icon && <Icon d={icon} size={size * 0.95} color={primary ? "#fff" : C.green} stroke={1.8} />}
    <span>{label}</span>
  </div>
);

/** A pointer in the macOS style. */
export const Cursor: React.FC<{ x: number; y: number; size: number; press?: number; opacity?: number }> = ({ x, y, size, press = 0, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity, transform: `scale(${1 - 0.12 * press})`, transformOrigin: "0 0", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))", zIndex: 50 }}>
    <svg width={size} height={size * 1.4} viewBox="0 0 20 28">
      <path d="M2 1.5v21.2l5.3-5.1 3.6 8.3 3.6-1.6-3.6-8.2h7.4z" fill={C.ink} stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  </div>
);

/** A click ripple centred on (x, y). */
export const Ripple: React.FC<{ x: number; y: number; k: number; size: number; color?: string }> = ({ x, y, k, size, color = C.gold }) =>
  k <= 0 || k >= 1 ? null : (
    <div
      style={{
        position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%",
        border: `${3 * (1 - k)}px solid ${color}`, transform: `scale(${0.2 + 0.8 * k})`, opacity: 1 - k, zIndex: 49,
      }}
    />
  );

export const Display: React.FC<{ size: number; color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ size, color = C.text, style, children }) => (
  <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: size, lineHeight: 1.35, color, direction: "rtl", whiteSpace: "nowrap", ...style }}>{children}</div>
);

export { Icon, OUTLINE, SOLID };
