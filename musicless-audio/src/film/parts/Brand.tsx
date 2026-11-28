import React from "react";
import type { Lang } from "../../lib/timeline";
import { C } from "../../theme";
import { LOGO } from "./logoPaths";

const { whole, low, top } = LOGO.note;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** The upper piece's transform: k = 0 is the whole note, k = 1 the logo's snapped position (the extension's
 *  first-run page animates exactly this, pages.css `.brand .top`). */
export const topPieceTransform = (k: number) =>
  `translate(${lerp(39.44, 41.02, k)} ${lerp(54.96, 42.84, k)}) rotate(${lerp(-16, 0, k)}) translate(-41.02 -42.84)`;

/** The note in its own coordinates (about 17–75 × 11–90). Before `k` leaves 0 it is the whole note; then the two
 *  pieces, with the upper one turning away. */
export const NotePaths: React.FC<{ k: number; fill: string }> = ({ k, fill }) =>
  k <= 0 ? (
    <path d={whole} fill={fill} />
  ) : (
    <g fill={fill}>
      <path d={low} />
      <path d={top} transform={topPieceTransform(Math.min(1, k))} />
    </g>
  );

/** The note alone, sized by height. */
export const Note: React.FC<{ size: number; k?: number; fill?: string; style?: React.CSSProperties }> = ({ size, k = 0, fill = C.ink, style }) => (
  <svg viewBox="12 6 68 88" width={(size * 68) / 88} height={size} style={{ display: "block", overflow: "visible", ...style }}>
    <NotePaths k={k} fill={fill} />
  </svg>
);

/** The extension's icon: the note on an ink tile (welcome.html, store icon). */
export const AppIcon: React.FC<{ size: number; k?: number; style?: React.CSSProperties }> = ({ size, k = 0, style }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", ...style }}>
    <rect width="100" height="100" rx="24" fill={C.ink} />
    <g transform="matrix(0.9222 0 0 0.9222 7.46 3.72)">
      <NotePaths k={k} fill={C.paper} />
    </g>
  </svg>
);

/** The lockup (note and name) drawn from the brand files, so the note can snap and the name can arrive in
 *  reading order. `k` is the snap, `name` reveals the wordmark (0–1). Sized by height. */
export const Lockup: React.FC<{ lang: Lang; height: number; k?: number; name?: number; color?: string; style?: React.CSSProperties }> = ({
  lang, height, k = 1, name = 1, color = C.ink, style,
}) => {
  const logo = LOGO[lang];
  const [x, y, w, h] = logo.viewBox;
  const m = logo.mark;
  // the name is revealed from the note outwards: left to right in English, right to left in Arabic
  const reveal = lang === "ar" ? `inset(0 0 0 ${(1 - name) * 100}%)` : `inset(0 ${(1 - name) * 100}% 0 0)`;
  return (
    <div style={{ position: "relative", height, width: (height * w) / h, ...style }}>
      <svg viewBox={`${x} ${y} ${w} ${h}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`matrix(${m.join(" ")})`}>
          <NotePaths k={k} fill={color} />
        </g>
      </svg>
      <svg viewBox={`${x} ${y} ${w} ${h}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, clipPath: reveal, overflow: "visible" }}>
        <path d={logo.word} fill={color} />
      </svg>
    </div>
  );
};
