import React from "react";
import { C } from "../../theme";

// The site's logo (src/app/images/logo.svg): the letter ع from Thmanyah Serif Display on a green
// tile, with the gold diamond of the page-title ornament.
const GLYPH =
  "M39.17 25.04 38.74 24.66 34.52 25.71C32.66 26.18 30.95 26.37 29.38 26.37C24.25 26.37 20.88 24.19 20.88 21.91C20.88 20.05 24.02 18.58 27.67 18.58C30.95 18.58 34.33 19.72 35.99 20.86L36.46 20.48C35.23 15.02 32 12.5 28.77 12.5C24.63 12.5 20.26 16.59 20.26 22.43C20.26 26.23 22.16 29.18 25.96 30.89C22.73 33.64 18.88 37.21 18.88 43.29C18.88 51.32 25.54 54.5 31.71 54.5L43.12 48.85V48.13H32.9C26.3 48.13 19.74 46.19 19.74 42.24C19.74 37.4 29.72 32.5 36.13 31.03L37.6 30.7Z";

/** `glyph` reveals the letter from the top (0–1); `diamond` scales the ornament in (0–1). */
export const Logo: React.FC<{ size: number; glyph?: number; diamond?: number; tile?: string }> = ({ size, glyph = 1, diamond = 1, tile = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: "block", overflow: "visible" }}>
    <defs>
      <clipPath id={`glyph-${size}`}>
        <rect x="0" y="0" width="64" height={10 + 46 * glyph} />
      </clipPath>
    </defs>
    <rect width="64" height="64" rx="14" fill={tile} />
    <path fill={C.paper} d={GLYPH} clipPath={`url(#glyph-${size})`} />
    <g transform={`translate(50 14) scale(${diamond}) rotate(${(1 - diamond) * 90})`}>
      <path fill={C.gold} d="M0-4.5 4.5 0 0 4.5-4.5 0z" />
    </g>
  </svg>
);
