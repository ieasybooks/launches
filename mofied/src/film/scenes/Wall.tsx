import React from "react";
import { Img, staticFile } from "remotion";
import content from "../../data/content.json";
import { DISPLAY, UI } from "../../lib/fonts";
import { clamp, ease, lerp, ramp, spr, useStage } from "../../lib/motion";
import { C } from "../../theme";
import { PHONE_H, PHONE_W, useFilm, type Layout } from "../context";
import { Phone } from "../parts/app";
import { FeedCard } from "./Hook";

// "Every clip is chosen with care": the phone settles into a grid of clips. On «بعناية» the generic
// feed cards (the hook's endless scroll) drop away, and the real Mofied material from the session
// (src/data/content.json) closes ranks.
const REAL = content.wall; // the first is the clip the phone is showing
const REAL_CELLS = [1, 2, 4, 7];
const COLS = 4;
const ROWS = 2;

export const wallLayout = (L: Layout) => {
  const cw = L.P ? 196 : 172; // the screen; each iPhone adds its frame around it
  const ch = cw * (PHONE_H / PHONE_W);
  const gap = L.P ? 30 : 34;
  const gw = COLS * cw + (COLS - 1) * gap;
  const gh = ROWS * ch + (ROWS - 1) * gap;
  const cx = L.wall.cx;
  const cy = L.P ? 1250 : 540;
  const cell = (i: number) => {
    const r = Math.floor(i / COLS);
    const c = i % COLS;
    const col = L.rtl ? COLS - 1 - c : c;
    return { x: cx - gw / 2 + col * (cw + gap) + cw / 2, y: cy - gh / 2 + r * (ch + gap) + ch / 2, s: 1 };
  };
  // where the four real clips settle: a row in landscape, a 2 × 2 block in portrait
  const fs = L.P ? 1.2 : 1.04;
  const fw = cw * fs, fh = ch * fs, fg = L.P ? 40 : 36;
  const final = (k: number) => {
    if (L.P) {
      const c = k % 2, r = Math.floor(k / 2);
      const col = L.rtl ? 1 - c : c;
      return { x: cx - (2 * fw + fg) / 2 + col * (fw + fg) + fw / 2, y: cy - (2 * fh + fg) / 2 + r * (fh + fg) + fh / 2, s: fs };
    }
    const col = L.rtl ? 3 - k : k;
    return { x: cx - (4 * fw + 3 * fg) / 2 + col * (fw + fg) + fw / 2, y: cy, s: fs };
  };
  return { cw, ch, cell, final, phoneScale: cw / PHONE_W };
};

const RealCard: React.FC<{ i: number }> = ({ i }) => {
  const r = REAL[i];
  const u = 1;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.screen }}>
      <Img src={staticFile(r.frame)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.62) 35%, rgba(0,0,0,0.7))" }} />
      <div style={{ position: "absolute", left: 20 * u, right: 20 * u, bottom: 40 * u, direction: "rtl", textAlign: "right" }}>
        <div style={{ fontFamily: UI, fontSize: 18 * u, color: "#e2e2e2", lineHeight: 1.5 }}>{r.speaker}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 30 * u, lineHeight: 1.45, color: C.text, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.title}</div>
      </div>
    </div>
  );
};

export const Wall: React.FC = () => {
  const { W: win, L, T } = useFilm();
  const { t } = useStage();
  if (!win.wall) return null;
  const [a, b] = win.wall;
  if (t < a + 0.1 || t > b + 0.05) return null;
  const g = wallLayout(L);
  const select = T.care - 0.1;
  const arrange = ramp(t, T.care + 0.3, 0.6, ease.inOut);
  const exit = ramp(t, b - 0.65, 0.65, ease.inOut);
  const cards: React.ReactNode[] = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    const c = g.cell(i);
    const realIdx = REAL_CELLS.indexOf(i);
    const dist = Math.abs(i - REAL_CELLS[0]);
    const born = spr(t, a + 0.25 + dist * 0.07, { damping: 16, stiffness: 140 });
    if (realIdx >= 0) {
      const f = g.final(realIdx);
      const x = lerp(c.x, f.x, arrange), y = lerp(c.y, f.y, arrange), s = lerp(1, f.s, arrange);
      // the first card is the phone itself: it hands over to the phone at both ends
      const phoneHere = realIdx === 0 && t < a + 0.62;
      if (phoneHere) continue;
      const appear = realIdx === 0 ? 1 : clamp(born * 1.3);
      const fade = 1 - exit;
      const ring = Math.max(0, 1 - Math.abs(t - (T.clean + 0.2 + realIdx * 0.22)) / 0.3) * 0.9;
      cards.push(
        <Phone key={i} cx={x} cy={y} s={g.phoneScale * s * (realIdx === 0 ? 1 : 0.86 + 0.14 * born) * (1 + 0.05 * ring)} opacity={appear * fade} rtl={L.rtl} style={{ zIndex: 2 }}>
          <RealCard i={realIdx} />
        </Phone>,
      );
    } else {
      const k = ramp(t, select + dist * 0.04, 0.4, ease.inOut);
      if (k >= 1) continue;
      cards.push(
        <Phone key={i} cx={c.x} cy={c.y + k * 70} s={g.phoneScale * (0.86 + 0.14 * born) * (1 - 0.12 * k)} opacity={clamp(born * 1.3) * (1 - k)} rtl={L.rtl} style={{ filter: k > 0 ? `grayscale(${0.5 + 0.5 * k}) blur(${k * 8}px)` : undefined, zIndex: 1 }}>
          <FeedCard seed={i * 13 + 5} w={PHONE_W} h={PHONE_H} />
        </Phone>,
      );
    }
  }
  return <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + 0.08 * exit})` }}>{cards}</div>;
};
