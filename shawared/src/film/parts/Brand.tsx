import React from "react";
import { KUFI, UI, UI_MEDIUM } from "../../lib/fonts";
import { clamp, ease, ramp } from "../../lib/motion";
import { DAY, NIGHT, TILE } from "../../theme";

// Shawared's identity (packages/design): mark A, a square-Kufic shin with three roaming diamond dots; the
// wordmark in Reem Kufi; the girih of eight-point stars in thin saffron lines.

export const MARK = {
  viewBox: [7, -3, 104, 104] as const,
  stroke: "M93.5 50V80.5H26V66M73.5 58V80.5M53.5 58V80.5",
  strokeWidth: 11,
  // the dots, largest (nearest the letter) first: centre and half-diagonal in mark units
  dots: [
    { cx: 58, cy: 38, r: 7.5 },
    { cx: 40, cy: 27, r: 6.5 },
    { cx: 24, cy: 17, r: 5.5 },
  ],
};
const STROKE_LEN = 30.5 + 67.5 + 14.5 + 22.5 + 22.5;

/** A diamond (a square on its corner) centred at (cx, cy), `r` from centre to corner. */
export const Diamond: React.FC<{ cx: number; cy: number; r: number; color: string; style?: React.CSSProperties }> = ({ cx, cy, r, color, style }) => (
  <div style={{ position: "absolute", left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, ...style }}>
    <svg width={2 * r} height={2 * r} viewBox="-1 -1 2 2" style={{ display: "block", overflow: "visible" }}>
      <path d="M0 -1L1 0L0 1L-1 0Z" fill={color} />
    </svg>
  </div>
);

/** The mark at `size` px (its 104-unit box), drawn in: `draw` 0–1 for the letter, `dots[i]` 0–1 for each dot. */
export const Mark: React.FC<{ size: number; draw?: number; dots?: [number, number, number]; ink?: string; dot?: string; hideDot?: number }> = ({
  size, draw = 1, dots = [1, 1, 1], ink = DAY.fg, dot = DAY.accent, hideDot,
}) => {
  const [vx, vy, vw] = MARK.viewBox;
  const k = size / vw;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={MARK.viewBox.join(" ")} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={MARK.stroke} fill="none" stroke={ink} strokeWidth={MARK.strokeWidth} strokeLinejoin="miter" strokeLinecap="butt"
          strokeDasharray={STROKE_LEN} strokeDashoffset={STROKE_LEN * (1 - draw)} />
      </svg>
      {MARK.dots.map((d, i) => {
        const p = dots[i];
        if (p <= 0 || hideDot === i) return null;
        const pop = ease.outBack(clamp(p));
        return <Diamond key={i} cx={(d.cx - vx) * k} cy={(d.cy - vy) * k} r={d.r * k * pop} color={dot} style={{ opacity: clamp(p * 3) }} />;
      })}
    </div>
  );
};
/** Where a dot of a `size` mark sits, relative to the mark's top left. */
export const markDot = (size: number, i: number) => {
  const [vx, vy, vw] = MARK.viewBox;
  const k = size / vw;
  const d = MARK.dots[i];
  return { x: (d.cx - vx) * k, y: (d.cy - vy) * k, r: d.r * k };
};

/** The wordmark: «شوارد» in Reem Kufi. */
export const Wordmark: React.FC<{ size: number; color?: string; style?: React.CSSProperties }> = ({ size, color = DAY.fg, style }) => (
  <div style={{ fontFamily: KUFI, fontSize: size, lineHeight: 1.25, color, direction: "rtl", whiteSpace: "nowrap", ...style }}>شوارد</div>
);

const bandSvg = (lines: string, dots: string, sw: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><g fill="none" stroke="${lines}" stroke-width="${sw}" stroke-linejoin="round">` +
  `<rect x="13" y="13" width="22" height="22"/><rect x="13" y="13" width="22" height="22" transform="rotate(45 24 24)"/>` +
  `<path d="M0 0L12 12M48 0L36 12M0 48L12 36M48 48L36 36"/></g><g fill="${dots}"><circle cx="0" cy="0" r="2"/><circle cx="48" cy="0" r="2"/>` +
  `<circle cx="0" cy="48" r="2"/><circle cx="48" cy="48" r="2"/></g></svg>`;
const uri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** The girih band across the top of the frame, fading downward (the app's BandPattern, larger). */
export const GirihBand: React.FC<{ height: number; cell: number; night?: number; opacity?: number; offset?: number }> = ({ height, cell, night = 0, opacity = 1, offset = 0 }) => {
  const sw = (1.15 * 48) / cell * 1.6;
  const mask = "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0))";
  const layer = (lines: string, dots: string, op: number) =>
    op > 0 ? (
      <div style={{ position: "absolute", inset: 0, opacity: op, backgroundImage: uri(bandSvg(lines, dots, sw)), backgroundSize: `${cell}px ${cell}px`, backgroundPosition: `${offset}px 0px` }} />
    ) : null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height, opacity, WebkitMaskImage: mask, maskImage: mask, pointerEvents: "none" }}>
      {layer(DAY.accent, DAY.muted, 1 - night)}
      {layer(NIGHT.accent, NIGHT.muted, night)}
    </div>
  );
};

/** The cover tile's girih: night blue with stars fading in toward its edges. */
export const tilePattern = (cell: number) => {
  const width = (0.8 * 40) / cell * 1.4;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cell}" height="${cell}" viewBox="0 0 40 40"><g fill="none" stroke="${TILE.girih}" stroke-opacity="0.55" stroke-width="${width.toFixed(2)}">` +
    `<rect x="11" y="11" width="18" height="18"/><rect x="11" y="11" width="18" height="18" transform="rotate(45 20 20)"/>` +
    `<path d="M0 0L10 10M40 0L30 10M0 40L10 30M40 40L30 30"/></g></svg>`;
  return { backgroundImage: uri(svg), backgroundSize: `${cell}px ${cell}px` };
};

/** Mark, wordmark and tagline in one column (the brand beat and the end card). */
export const Lockup: React.FC<{
  t: number; at: number; tagAt: number; mark: number; lang: "ar" | "en"; tagline: string; night?: boolean;
  /** the first dot arrives on its own (it flies in from the verse) */
  dotArrive?: number;
}> = ({ t, at, tagAt, mark, lang, tagline, night, dotArrive }) => {
  const ink = night ? NIGHT.fg : DAY.fg;
  const dotC = night ? NIGHT.accent : DAY.accent;
  const draw = ramp(t, at - 0.05, 0.55, ease.inOut);
  const d0 = dotArrive === undefined ? ramp(t, at + 0.35, 0.3) : t >= dotArrive ? 1 : 0;
  const d1 = ramp(t, (dotArrive ?? at + 0.35) + 0.12, 0.3);
  const d2 = ramp(t, (dotArrive ?? at + 0.35) + 0.24, 0.3);
  const word = ramp(t, at + 0.1, 0.5);
  const tag = ramp(t, tagAt - 0.1, 0.5);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Mark size={mark} draw={draw} dots={[d0, d1, d2]} ink={ink} dot={dotC} />
      <Wordmark size={mark * 0.62} color={ink} style={{ marginTop: mark * 0.02, opacity: word, transform: `translateY(${(1 - word) * 18}px)` }} />
      {lang === "en" && (
        <div style={{ fontFamily: UI_MEDIUM, fontSize: mark * 0.17, letterSpacing: "0.24em", color: ink, opacity: word * 0.85, marginTop: -mark * 0.02, textTransform: "uppercase", paddingLeft: "0.24em" }}>Shawared</div>
      )}
      <div style={{ fontFamily: UI, fontSize: mark * 0.215, color: night ? NIGHT.muted : DAY.muted, direction: lang === "ar" ? "rtl" : "ltr", marginTop: mark * 0.16, opacity: tag, transform: `translateY(${(1 - tag) * 16}px)`, whiteSpace: "nowrap" }}>
        {tagline}
      </div>
    </div>
  );
};
