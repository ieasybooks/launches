import React from "react";
import { DISPLAY } from "../../lib/fonts";
import { clamp, ease, ramp, spr, useStage } from "../../lib/motion";
import { C } from "../../theme";

export type Word = { text: string; at: number };

/** Display rows timed to the narration: when the display has as many words as were spoken, each word
 *  lands on its own spoken word; otherwise the spoken span is shared out evenly. */
export const timeRows = (rows: string[], spoken: { word: string; at: number }[], from?: number, to?: number): Word[][] => {
  const words = rows.map((r) => r.split(/\s+/).filter(Boolean));
  const flat = words.flat();
  const a = from ?? spoken[0]?.at ?? 0;
  const b = to ?? spoken[spoken.length - 1]?.at ?? a;
  let k = 0;
  return words.map((row) =>
    row.map((text) => {
      const i = k++;
      const at = flat.length === spoken.length ? spoken[i].at : a + ((b - a) * i) / Math.max(1, flat.length - 1);
      return { text, at };
    }),
  );
};

/** A word that lands: it drops in slightly large and blurred, and settles. */
export const Land: React.FC<{ at: number; t: number; children: React.ReactNode; from?: number; style?: React.CSSProperties }> = ({ at, t, children, from = 1.22, style }) => {
  const k = spr(t, at - 0.06, { damping: 19, stiffness: 260 });
  const o = clamp(ramp(t, at - 0.06, 0.16));
  return (
    <span style={{ display: "inline-block", opacity: o, transform: `scale(${from + (1 - from) * k}) translateY(${(1 - k) * 0.12}em)`, filter: o < 1 ? `blur(${(1 - o) * 10}px)` : undefined, ...style }}>
      {children}
    </span>
  );
};

/** Rows of landing words. */
export const KineticRows: React.FC<{ rows: Word[][]; size: number; dir: "rtl" | "ltr"; align?: "right" | "left" | "center"; color?: string; lineHeight?: number; t: number; family?: string; style?: React.CSSProperties }> = ({
  rows, size, dir, align = "center", color = C.ink, lineHeight = 1.12, t, family = DISPLAY, style,
}) => (
  <div style={{ fontFamily: family, fontWeight: 500, fontSize: size, lineHeight, color, direction: dir, textAlign: align, letterSpacing: dir === "ltr" ? "-0.02em" : 0, ...style }}>
    {rows.map((row, i) => (
      <div key={i} style={{ textWrap: "balance" }}>
        {row.map((w, j) => (
          <React.Fragment key={j}>
            {j > 0 && " "}
            <Land at={w.at} t={t}>{w.text}</Land>
          </React.Fragment>
        ))}
      </div>
    ))}
  </div>
);
