import React from "react";
import { HEADING_FONT, LATIN_FONT, UI_FONT } from "../lib/fonts";
import { clamp, easeInOutCubic, easeOutCubic, lerp, prog } from "../lib/time";
import { Icon } from "../ui/kit";
import { FILM } from "../ui/theme";
import { CHAPTERS } from "./director";
import { PANEL } from "./layout";

const ink = FILM.ink;
const soft = FILM.inkSoft;
const acc = FILM.terracotta;

/** The step guide: a table of contents whose active chapter expands with its steps. */
export const Panel: React.FC<{ t: number; appear: number; fade: number }> = ({ t, appear, fade }) => {
  if (fade <= 0 || appear <= 0) return null;
  const rowH = 74;
  const titleH = 82;
  const bulletH = 52;
  const exp = CHAPTERS.map((ch, i) => prog(t, ch.t0 - 0.15, ch.t0 + 0.55, easeInOutCubic) * (i < CHAPTERS.length - 1 ? 1 - prog(t, ch.t1 - 0.15, ch.t1 + 0.55, easeInOutCubic) : 1));
  const heights = CHAPTERS.map((ch, i) => rowH + exp[i] * (titleH - rowH + 24 + 62 + ch.bullets.length * bulletH));
  const total = heights.reduce((a, b) => a + b, 0);
  const top = PANEL.y + (PANEL.h - total) / 2;
  let y = top;
  const centers: number[] = [];
  const rows = CHAPTERS.map((ch, i) => {
    const e = exp[i];
    const done = t >= ch.t1 + 0.2;
    const active = e > 0.01;
    const rowTop = y;
    y += heights[i];
    centers.push(rowTop + lerp(rowH, titleH, e) / 2);
    const ap = prog(appear, i * 0.12, 0.55 + i * 0.12, easeOutCubic);
    return (
      <div key={ch.n} style={{ position: "absolute", left: PANEL.x, width: PANEL.w, top: rowTop, height: heights[i], opacity: ap, transform: `translateX(${(1 - ap) * 30}px)` }}>
        <div style={{ position: "absolute", right: 0, top: 0, height: lerp(rowH, titleH, e), display: "flex", alignItems: "center", gap: 22, direction: "rtl" }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              border: `2px solid ${active || done ? acc : "rgba(140,120,110,0.35)"}`,
              background: active ? acc : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: LATIN_FONT,
              fontWeight: 600,
              fontSize: 20,
              color: active ? "#fff" : done ? acc : soft,
              flexShrink: 0,
              direction: "ltr",
            }}
          >
            {done && !active ? <Icon name="check" size={24} color={acc} strokeWidth={2.6} /> : `0${ch.n}`}
          </div>
          <div style={{ fontFamily: ch.latin ? LATIN_FONT : HEADING_FONT, fontWeight: ch.latin ? 600 : 400, letterSpacing: ch.latin ? -0.5 : 0, fontSize: lerp(ch.latin ? 32 : 36, ch.latin ? 46 : 54, e), color: active ? ink : soft, whiteSpace: "nowrap" }}>{ch.title}</div>
        </div>
        {e > 0.02 ? (
          <div style={{ position: "absolute", right: 76, left: 0, top: titleH + 4, opacity: clamp((e - 0.35) / 0.65), direction: "rtl" }}>
            <div style={{ fontFamily: HEADING_FONT, fontSize: 40, lineHeight: 1.3, color: acc }}>{ch.headline}</div>
            <div style={{ marginTop: 14 }}>
              {ch.bullets.map((b, k) => {
                const ba = prog(t, b.t - 0.25, b.t + 0.3, easeOutCubic);
                const latest = k === ch.bullets.length - 1 || t < ch.bullets[k + 1].t - 0.2;
                const on = ba > 0.5 && latest;
                return (
                  <div key={k} style={{ height: bulletH, display: "flex", alignItems: "center", gap: 14, opacity: 0.2 + 0.8 * ba, transform: `translateX(${(1 - ba) * -12}px)` }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: on ? acc : "rgba(140,120,110,0.45)", flexShrink: 0, boxShadow: on ? "0 0 0 5px rgba(174,71,33,0.15)" : undefined }} />
                    <div
                      style={{
                        fontFamily: b.latin ? LATIN_FONT : UI_FONT,
                        fontWeight: b.latin ? 500 : 400,
                        fontSize: b.latin ? 25 : 28,
                        color: ink,
                        whiteSpace: "nowrap",
                        direction: b.latin ? "ltr" : "rtl",
                        unicodeBidi: "isolate",
                      }}
                    >
                      {b.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  });
  const ringGap = 28 + 9;
  const segments = centers.slice(1).map((c1, i) => {
    const y0 = centers[i] + ringGap;
    const y1 = c1 - ringGap;
    const fill = prog(t, CHAPTERS[i].t1 - 0.1, CHAPTERS[i].t1 + 0.4, easeInOutCubic);
    return y1 - y0 > 2 ? (
      <div key={i} style={{ position: "absolute", left: PANEL.x + PANEL.w - 28, width: 2, top: y0, height: y1 - y0, borderRadius: 1, background: "rgba(140,120,110,0.25)", overflow: "hidden", opacity: prog(appear, (i + 1) * 0.12, 0.55 + (i + 1) * 0.12) }}>
        <div style={{ width: "100%", height: `${fill * 100}%`, background: acc }} />
      </div>
    ) : null;
  });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade }}>
      {segments}
      {rows}
    </div>
  );
};
