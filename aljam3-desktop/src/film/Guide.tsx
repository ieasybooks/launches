import React from "react";
import { CAPTIONS, cue as C, S, E } from "../lib/timeline";
import { clamp, easeInOutCubic, easeOutCubic, lerp, prog } from "../lib/time";
import { FILM } from "../ui/theme";
import { HEADING_FONT, LATIN_FONT, UI_FONT } from "../lib/fonts";
import { Icon } from "../ui/kit";
import { CHAPTERS, T } from "./director";
import { Layout } from "./layout";

const mixColor = (a: string, b: string, p: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], p))).join(",")})`;
};

const darkness = (t: number) => prog(t, T.dark + 0.1, T.dark + 0.9, easeInOutCubic);
const inkAt = (t: number) => mixColor(FILM.ink, "#f6eee7", darkness(t));
const softAt = (t: number) => mixColor(FILM.inkSoft, "#b9aca5", darkness(t));
const accentAt = (t: number) => mixColor(FILM.terracotta, FILM.ember, darkness(t));

/** Apple logo (Simple Icons, CC0). */
export const AppleLogo: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <path
      fill={color}
      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
    />
  </svg>
);

const PlatformChip: React.FC<{ label: string; glyph: "win" | "mac"; u: number; color: string; border: string }> = ({ label, glyph, u, color, border }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 * u, padding: `${10 * u}px ${22 * u}px`, borderRadius: 999, border: `${1.5 * u}px solid ${border}`, color, fontFamily: LATIN_FONT, fontWeight: 500, fontSize: 24 * u, direction: "ltr" }}>
    {glyph === "win" ? (
      <svg width={22 * u} height={22 * u} viewBox="0 0 20 20">
        {[
          [0, 0],
          [11, 0],
          [0, 11],
          [11, 11],
        ].map(([x, y]) => (
          <rect key={`${x}${y}`} x={x} y={y} width={9} height={9} rx={1} fill={color} />
        ))}
      </svg>
    ) : (
      <AppleLogo size={23 * u} color={color} />
    )}
    <span>{label}</span>
  </div>
);

/** “Aljam3 for desktop” title block shown while the app is introduced. */
const TitleBlock: React.FC<{ t: number; L: Layout; align: "start" | "center" }> = ({ t, L, align }) => {
  const u = L.u;
  const a = prog(t, C("app", "تطبيق") - 0.25, C("app", "تطبيق") + 0.45, easeOutCubic);
  const chips = prog(t, C("app", "المكتب") + 0.1, C("app", "المكتب") + 0.6, easeOutCubic);
  const exitAt = L.format === "landscape" ? C("app", "جولة") - 0.2 : T.ch1 - 0.55;
  const out = prog(t, exitAt, exitAt + 0.55, easeInOutCubic);
  if (a <= 0 || out >= 1) return null;
  const land = L.format === "landscape";
  const big = land ? 116 : 86;
  return (
    <div style={{ opacity: a * (1 - out), transform: `translateY(${(1 - a) * 24 * u - out * 30 * u}px)`, textAlign: align === "center" ? "center" : "right" }}>
      <div style={{ display: "inline-block", fontFamily: UI_FONT, fontSize: 24 * u, color: FILM.terracotta, background: "rgba(174,71,33,0.09)", borderRadius: 999, padding: `${6 * u}px ${18 * u}px` }}>جديد · مجاني</div>
      {land ? (
        <>
          <div style={{ fontFamily: HEADING_FONT, fontSize: big * u, lineHeight: 1.3, color: FILM.ink, marginTop: 10 * u }}>الجامع</div>
          <div style={{ fontFamily: HEADING_FONT, fontSize: big * 0.56 * u, lineHeight: 1.3, color: FILM.ink, marginTop: 14 * u }}>لسطح المكتب</div>
          <div style={{ fontFamily: UI_FONT, fontSize: 28 * u, lineHeight: 1.6, color: FILM.inkSoft, marginTop: 16 * u, maxWidth: 520 * u }}>
            اقرأ وابحث في مكتبة الجامع كاملة، ونزّل ما تحتاجه للعمل دون إنترنت.
          </div>
        </>
      ) : (
        <div style={{ fontFamily: HEADING_FONT, fontSize: big * u, lineHeight: 1.25, color: FILM.ink, marginTop: 14 * u }}>الجامع لسطح المكتب</div>
      )}
      <div style={{ display: "flex", gap: 14 * u, marginTop: (land ? 26 : 18) * u, opacity: chips, transform: `translateY(${(1 - chips) * 12 * u}px)`, justifyContent: align === "center" ? "center" : "flex-start", direction: "rtl" }}>
        <PlatformChip label="Windows" glyph="win" u={u} color={FILM.ink} border="rgba(59,47,44,0.22)" />
        <PlatformChip label="macOS" glyph="mac" u={u} color={FILM.ink} border="rgba(59,47,44,0.22)" />
      </div>
    </div>
  );
};

/** Landscape guide: a table of contents whose active chapter expands with its points. */
export const SidePanel: React.FC<{ t: number; L: Layout; fade: number }> = ({ t, L, fade }) => {
  const u = L.u;
  const { panel } = L;
  if (fade <= 0) return null;
  const tocIn = (i: number) => prog(t, C("app", "جولة") + 0.15 + i * 0.12, C("app", "جولة") + 0.7 + i * 0.12, easeOutCubic);
  const rowH = 70 * u;
  const titleH = 76 * u;
  const bulletH = 52 * u;
  // expansion of each chapter (outgoing collapses as the next expands)
  const exp = CHAPTERS.map((ch, i) => prog(t, ch.t0 - 0.15, ch.t0 + 0.55, easeInOutCubic) * (i < CHAPTERS.length - 1 ? 1 - prog(t, ch.t1 - 0.15, ch.t1 + 0.55, easeInOutCubic) : 1));
  const heights = CHAPTERS.map((ch, i) => rowH + exp[i] * (titleH - rowH + 30 * u + 76 * u + ch.bullets.length * bulletH));
  const total = heights.reduce((a, b) => a + b, 0);
  const top = panel.y + (panel.h - total) / 2;
  const ink = inkAt(t);
  const soft = softAt(t);
  const acc = accentAt(t);
  let y = top;
  const centers: number[] = [];
  const rows = CHAPTERS.map((ch, i) => {
    const e = exp[i];
    const done = t >= ch.t1 + 0.2;
    const active = e > 0.01;
    const rowTop = y;
    y += heights[i];
    centers.push(rowTop + lerp(rowH, titleH, e) / 2);
    const ap = tocIn(i);
    return (
      <div key={ch.n} style={{ position: "absolute", left: panel.x, width: panel.w, top: rowTop, height: heights[i], opacity: ap, transform: `translateX(${(1 - ap) * -30 * u}px)` }}>
        <div style={{ position: "absolute", right: 0, top: 0, height: lerp(rowH, titleH, e), display: "flex", alignItems: "center", gap: 22 * u }}>
          <div
            style={{
              width: 52 * u,
              height: 52 * u,
              borderRadius: "50%",
              border: `${2 * u}px solid ${active || done ? acc : "rgba(140,120,110,0.35)"}`,
              background: active ? acc : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: LATIN_FONT,
              fontWeight: 600,
              fontSize: 20 * u,
              color: active ? "#fff" : done ? acc : soft,
              flexShrink: 0,
              direction: "ltr",
            }}
          >
            {done && !active ? <Icon name="check" size={24 * u} color={acc} strokeWidth={2.6} /> : `0${ch.n}`}
          </div>
          <div style={{ fontFamily: HEADING_FONT, fontSize: lerp(34, 52, e) * u, color: active ? ink : soft, whiteSpace: "nowrap" }}>{ch.title}</div>
        </div>
        {e > 0.02 ? (
          <div style={{ position: "absolute", right: 74 * u, left: 0, top: titleH + 6 * u, opacity: clamp((e - 0.35) / 0.65) }}>
            <div style={{ fontFamily: HEADING_FONT, fontSize: 40 * u, lineHeight: 1.3, color: acc }}>{ch.headline}</div>
            <div style={{ marginTop: 18 * u }}>
              {ch.bullets.map((b, k) => {
                const ba = prog(t, b.t - 0.25, b.t + 0.3, easeOutCubic);
                const latest = k === ch.bullets.length - 1 || t < ch.bullets[k + 1].t - 0.2;
                return (
                  <div key={k} style={{ height: bulletH, display: "flex", alignItems: "center", gap: 14 * u, opacity: 0.18 + 0.82 * ba, transform: `translateX(${(1 - ba) * -12 * u}px)` }}>
                    <div style={{ width: 10 * u, height: 10 * u, borderRadius: "50%", background: ba > 0.5 && latest ? acc : "rgba(140,120,110,0.45)", flexShrink: 0, boxShadow: ba > 0.5 && latest ? `0 0 0 ${5 * u}px rgba(174,71,33,0.15)` : undefined }} />
                    <div style={{ fontFamily: UI_FONT, fontSize: 28 * u, color: ink, whiteSpace: "nowrap" }}>{b.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  });
  // progress line: short segments between the number circles (radius 28) that fill in as chapters finish
  const ringGap = 28 * u + 9 * u;
  const segments = centers.slice(1).map((c1, i) => {
    const y0 = centers[i] + ringGap;
    const y1 = c1 - ringGap;
    const fill = prog(t, CHAPTERS[i].t1 - 0.1, CHAPTERS[i].t1 + 0.4, easeInOutCubic);
    return y1 - y0 > 2 * u ? (
      <div key={i} style={{ position: "absolute", left: panel.x + panel.w - 29 * u, width: 2 * u, top: y0, height: y1 - y0, borderRadius: u, background: "rgba(140,120,110,0.25)", overflow: "hidden", opacity: tocIn(i + 1) }}>
        <div style={{ width: "100%", height: `${fill * 100}%`, background: acc }} />
      </div>
    ) : null;
  });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade }}>
      <div style={{ position: "absolute", left: panel.x, width: panel.w, top: panel.y + panel.h / 2 - 300 * u }}>
        <TitleBlock t={t} L={L} align="start" />
      </div>
      {segments}
      {rows}
    </div>
  );
};

/** Portrait header: story-style chapter progress, chapter label and headline. */
export const PortraitHeader: React.FC<{ t: number; L: Layout; fade: number }> = ({ t, L, fade }) => {
  const u = L.u;
  const { panel } = L;
  if (fade <= 0) return null;
  const ink = inkAt(t);
  const soft = softAt(t);
  const acc = accentAt(t);
  const barsIn = prog(t, C("app", "جولة"), C("app", "جولة") + 0.6, easeOutCubic);
  const gap = 12 * u;
  const segW = (panel.w - gap * 4) / 5;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade }}>
      <div style={{ position: "absolute", left: panel.x, width: panel.w, top: panel.y - 10 * u }}>
        <TitleBlock t={t} L={L} align="center" />
      </div>
      <div style={{ position: "absolute", left: panel.x, width: panel.w, top: panel.y - 40 * u, height: 8 * u, display: "flex", flexDirection: "row", direction: "rtl", gap, opacity: barsIn }}>
        {CHAPTERS.map((ch) => {
          const f = prog(t, ch.t0, ch.t1, (x) => x);
          return (
            <div key={ch.n} style={{ width: segW, height: 8 * u, borderRadius: 8 * u, background: "rgba(140,120,110,0.22)", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${f * 100}%`, background: acc, borderRadius: 8 * u }} />
            </div>
          );
        })}
      </div>
      {CHAPTERS.map((ch, i) => {
        const a = prog(t, ch.t0 - 0.2, ch.t0 + 0.45, easeOutCubic) * (1 - prog(t, ch.t1 - 0.25, ch.t1 + 0.15, easeInOutCubic));
        if (a <= 0) return null;
        return (
          <div key={ch.n} style={{ position: "absolute", left: panel.x, width: panel.w, top: panel.y + 30 * u, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * 26 * u}px)` }}>
            <div style={{ fontFamily: UI_FONT, fontSize: 30 * u, color: acc, direction: "rtl" }}>
              <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: LATIN_FONT, fontWeight: 600, fontSize: 26 * u }}>{`0${ch.n} / 05`}</span>
              {`  ·  ${ch.title}`}
            </div>
            <div style={{ fontFamily: HEADING_FONT, fontSize: 84 * u, lineHeight: 1.25, color: ink, marginTop: 22 * u }}>{ch.headline}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Word-by-word captions (portrait). */
export const Captions: React.FC<{ t: number; L: Layout; y: number; dark: number }> = ({ t, L, y, dark }) => {
  const u = L.u;
  // merge very short chunks with their neighbour so lines don't flash
  const chunk = CAPTIONS.find((c) => t >= c.start - 0.12 && t <= c.end + 0.35);
  if (!chunk) return null;
  const a = prog(t, chunk.start - 0.12, chunk.start + 0.1, easeOutCubic) * (1 - prog(t, chunk.end + 0.15, chunk.end + 0.35));
  const words = chunk.text.split(/\s+/);
  const weights = words.map((w) => w.length + 1);
  const totalW = weights.reduce((x, y2) => x + y2, 0);
  let acc = 0;
  const ink = mixColor(FILM.ink, "#f6eee7", dark);
  return (
    <div style={{ position: "absolute", left: L.captions!.x, width: L.captions!.w, top: y, textAlign: "center", opacity: a }}>
      <div style={{ display: "inline", fontFamily: UI_FONT, fontSize: 52 * u, lineHeight: 1.55, fontWeight: 600, color: ink }}>
        {words.map((w, i) => {
          const w0 = chunk.start + ((chunk.end - chunk.start) * acc) / totalW;
          acc += weights[i];
          const on = prog(t, w0 - 0.05, w0 + 0.12, easeOutCubic);
          return (
            <span key={i} style={{ opacity: 0.32 + 0.68 * on }}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const GUIDE_TIMES = { appStart: S("app"), tourEnd: () => T.tourEnd, outroStart: S("outro1"), end: E("outro3") };
