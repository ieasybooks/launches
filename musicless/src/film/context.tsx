import React, { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";
import { buildTimeline, type Lang, type Timeline } from "../lib/timeline";
import { COPY, UIX } from "./copy";
import { makeTimes, type Times } from "./times";

export type FilmProps = { lang: Lang };

/** The browser's own size in CSS pixels (a laptop window), scaled into the film. */
export const BROWSER_W = 1280;
export const BROWSER_H = 800;

/** Where things sit in each shape. 16:9 is the reference; 9:16 and 4:5 reuse the same scenes with their own
 *  placements (a uniform scale `u` from the 1080-pixel short side keeps type the same size in every shape). */
export const makeLayout = (W: number, H: number, lang: Lang) => {
  const rtl = lang === "ar";
  const P = H > W;
  const shape = (!P ? "16x9" : H / W > 1.5 ? "9x16" : "4x5") as "16x9" | "9x16" | "4x5";
  const tall = shape === "9x16";
  const u = P ? W / 1080 : H / 1080;
  // the display face's line height: Arabic needs room for its marks
  const lh = rtl ? 1.42 : 1.14;

  // the hook's player and its question (three rows when the frame is narrow)
  const hook = (() => {
    if (!P) return { pw: 1060 * u, cy: 600 * u, head: 70 * u, headTop: 150 * u - 70 * u * 0.9, tallRows: false };
    const pw = W - 80 * u;
    const cy = tall ? H * 0.53 : H * 0.6;
    const head = (tall ? 80 : 68) * u;
    const headTop = cy - (pw * 9) / 16 / 2 - (tall ? 70 : 40) * u - 3 * head * lh;
    return { pw, cy, head, headTop, tallRows: true };
  })();

  // the cards: one row in 16:9, two by two in the narrow frames; they wait centred until the headline arrives
  const why = (() => {
    if (!P) return { cols: 4, cs: 1, gapX: 44 * u, gapY: 0, top: 455 * u, solo: 365 * u, headTop: 200 * u, notesUp: [70, 140] };
    const cs = tall ? 1.12 : 1.0;
    const gapY = (tall ? 150 : 120) * u;
    const gridH = 2 * 350 * cs * u + gapY;
    const top = tall ? 690 * u : 450 * u;
    return { cols: 2, cs, gapX: 44 * u, gapY, top, solo: (H - gridH) / 2 + 30 * u, headTop: tall ? 330 * u : 140 * u, notesUp: [40, 95] };
  })();

  // why you'll love it: a list of six with an emblem for the reason being spoken
  const reasons = (() => {
    if (!P) {
      const listW = 1020 * u;
      return {
        listX: rtl ? W - 150 * u - listW : 150 * u, listW, titleTop: 92 * u, top: 196 * u, rowH: 136 * u,
        em: { cx: rtl ? 420 * u : W - 420 * u, cy: 560 * u, d: 440 * u }, head: 56 * u, sub: 32 * u, bigTitle: 104 * u,
      };
    }
    const listW = W - 180 * u;
    return tall
      ? { listX: 90 * u, listW, titleTop: 150 * u, top: 760 * u, rowH: 168 * u, em: { cx: W / 2, cy: 500 * u, d: 380 * u }, head: 54 * u, sub: 31 * u, bigTitle: 96 * u }
      : { listX: 90 * u, listW, titleTop: 104 * u, top: 280 * u, rowH: 164 * u, em: { cx: rtl ? 175 * u : W - 175 * u, cy: 158 * u, d: 224 * u }, head: 54 * u, sub: 31 * u, bigTitle: 92 * u };
  })();

  // the end card's column: its top, and how far down each part sits
  const outro = P
    ? { top: (H - 760 * u) / 2 - 20 * u, lockH: 140 * u, tag: 200 * u, badges: 420 * u, browsers: 580 * u, search: 660 * u, voiceY: H - (tall ? 330 : 120) * u }
    : { top: 190 * u, lockH: 128 * u, tag: 205 * u, badges: 345 * u, browsers: 500 * u, search: 585 * u, voiceY: H - 105 * u };

  return {
    rtl, P, W, H, shape, tall, u, lh, hook, why, reasons, outro,
    // the brand reveal's centre line
    brandY: H * (P ? 0.42 : 0.43),
    // the browser window, at rest (the camera frames each shot from there)
    browser: { w: P ? W - 48 * u : 1560 * u },
  };
};
export type Layout = ReturnType<typeof makeLayout>;

type FilmCtx = FilmProps & { tl: Timeline; L: Layout; copy: (typeof COPY)[Lang]; ui: (typeof UIX)[Lang]; dir: "rtl" | "ltr" } & Times;
const Ctx = createContext<FilmCtx | null>(null);

export const FilmProvider: React.FC<FilmProps & { children: React.ReactNode }> = ({ lang, children }) => {
  const { width, height } = useVideoConfig();
  const tl = buildTimeline(lang);
  const value: FilmCtx = {
    lang, tl, L: makeLayout(width, height, lang), copy: COPY[lang], ui: UIX[lang], dir: lang === "ar" ? "rtl" : "ltr", ...makeTimes(tl),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useFilm = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFilm outside FilmProvider");
  return v;
};
