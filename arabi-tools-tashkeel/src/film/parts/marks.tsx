import React from "react";
import { LETTERS, MARKS } from "../../lib/fonts";
import { clamp, ease } from "../../lib/motion";
import { C } from "../../theme";

// Arabic diacritics, as the site counts them (fathatan … sukun, and the dagger alif).
const MARK = /[ً-ْٰ]/;
export const strip = (text: string) => Array.from(text).filter((c) => !MARK.test(c)).join("");

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const mix = (a: string, b: string, k: number) => {
  const [x, y] = [rgb(a), rgb(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * clamp(k))).join(",")})`;
};

/**
 * Diacritized text whose marks arrive word by word in reading order. Each word is drawn twice
 * with the same shaping: its letters (KitabLetters) in ink and, on top, only its marks
 * (KitabMarks), which drop in gold as `k` sweeps 0 → 1 and turn to ink with `settle`.
 * At k = 0 the text reads exactly as the undiacritized original.
 */
export const Marked: React.FC<{
  text: string; size: number; k?: number; settle?: number; color?: string; mark?: string; lineHeight?: number; style?: React.CSSProperties;
}> = ({ text, size, k = 1, settle = 0, color = C.text, mark = C.gold, lineHeight = 1.9, style }) => {
  const parts = text.split(/(\s+)/);
  const words = parts.filter((p) => p.trim()).length;
  const w = Math.max(2, words * 0.22);
  const tint = mix(mark, color, settle);
  let i = 0;
  return (
    <div dir="rtl" style={{ fontFamily: LETTERS, fontSize: size, lineHeight, color, whiteSpace: "pre-wrap", ...style }}>
      {parts.map((p, n) => {
        if (!p.trim()) return <React.Fragment key={n}>{p}</React.Fragment>;
        const a = ease.out(clamp((k * (words + w) - i++) / w));
        return (
          <span key={n} style={{ position: "relative", display: "inline-block" }}>
            {p}
            {a > 0 && (
              <span aria-hidden style={{ position: "absolute", inset: 0, fontFamily: MARKS, color: tint, opacity: clamp(a * 1.6), transform: `translateY(${-(1 - a) * size * 0.4}px)` }}>
                {p}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};
