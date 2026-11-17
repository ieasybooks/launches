import React from "react";
import { DISPLAY } from "../../lib/fonts";
import { clamp, ramp, spr } from "../../lib/motion";
import { C } from "../../theme";

export type Word = { text: string; at: number };

/** Display rows timed to the narration: when the display has as many words as were spoken, each word lands on
 *  its own spoken word; otherwise the spoken span is shared out evenly. */
export const timeRows = (rows: string[], spoken: { word: string; at: number }[], from?: number, to?: number): Word[][] => {
  const words = rows.map((r) => r.split(/\s+/).filter(Boolean));
  const flat = words.flat();
  const a = from ?? spoken[0]?.at ?? 0;
  const b = to ?? spoken[spoken.length - 1]?.at ?? a;
  let k = 0;
  return words.map((row) =>
    row.map((text) => {
      const i = k++;
      const at = flat.length === spoken.length && from === undefined ? spoken[i].at : a + ((b - a) * i) / Math.max(1, flat.length - 1);
      return { text, at };
    }),
  );
};

/** A word that lands: it rises slightly large and blurred, and settles. Whole words only, so Arabic letters
 *  always stay joined. */
export const Land: React.FC<{ at: number; t: number; children: React.ReactNode; from?: number; style?: React.CSSProperties }> = ({ at, t, children, from = 1.18, style }) => {
  const k = spr(t, at - 0.05, { damping: 18, stiffness: 280 });
  const o = clamp(ramp(t, at - 0.05, 0.14));
  return (
    <span style={{ display: "inline-block", opacity: o, transform: `scale(${from + (1 - from) * k}) translateY(${(1 - k) * 0.14}em)`, filter: o < 1 ? `blur(${(1 - o) * 8}px)` : undefined, ...style }}>
      {children}
    </span>
  );
};

/** Rows of landing words. Arabic gets no letter-spacing and a taller line. */
export const KineticRows: React.FC<{
  rows: Word[][]; size: number; dir: "rtl" | "ltr"; align?: "right" | "left" | "center"; color?: string; weight?: number; t: number;
  style?: React.CSSProperties; accent?: (word: string) => React.CSSProperties | undefined;
}> = ({ rows, size, dir, align = "center", color = C.ink, weight = 600, t, style, accent }) => (
  <div
    style={{
      fontFamily: DISPLAY, fontWeight: weight, fontSize: size, lineHeight: dir === "rtl" ? 1.45 : 1.12, color, direction: dir, textAlign: align,
      letterSpacing: dir === "ltr" ? "-0.025em" : 0, ...style,
    }}
  >
    {rows.map((row, i) => (
      <div key={i}>
        {row.map((w, j) => (
          <React.Fragment key={j}>
            {j > 0 && " "}
            <Land at={w.at} t={t} style={accent?.(w.text)}>
              {w.text}
            </Land>
          </React.Fragment>
        ))}
      </div>
    ))}
  </div>
);
