import React, { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";
import { buildTimeline, type Lang, type Timeline } from "../lib/timeline";
import { COPY } from "./copy";
import { makeTimes, type Times } from "./times";

export type FilmProps = { lang: Lang };

/** The app's phone screen in points (iPhone-sized logical canvas, scaled into the film). */
export const PHONE_W = 393;
export const PHONE_H = 852;

export const makeLayout = (W: number, H: number, lang: Lang) => {
  const P = H > W;
  const rtl = lang === "ar";
  if (!P) {
    const side = rtl ? 610 : W - 610;
    return {
      P, rtl, W, H,
      // where the phone opens (frame centre) and where it settles beside the words
      open: { cx: W / 2, cy: H / 2, s: 900 / PHONE_H },
      phone: { cx: side, cy: 545, s: 920 / PHONE_H, ry: rtl ? 14 : -14 },
      text: { x: rtl ? 990 : 150, w: 780, cy: 540, align: rtl ? ("right" as const) : ("left" as const), top: 0 },
      head: 150, sub: 44,
      wall: { cx: rtl ? 560 : W - 560 },
    };
  }
  return {
    P, rtl, W, H,
    open: { cx: W / 2, cy: H / 2 + 40, s: 1080 / PHONE_H },
    phone: { cx: W / 2, cy: 1278, s: 1030 / PHONE_H, ry: 0 },
    text: { x: 96, w: W - 192, cy: 0, align: rtl ? ("right" as const) : ("left" as const), top: 290 },
    head: 124, sub: 40,
    wall: { cx: W / 2 },
  };
};
export type Layout = ReturnType<typeof makeLayout>;

type FilmCtx = FilmProps & { tl: Timeline; L: Layout; copy: (typeof COPY)[Lang] } & Times;
const Ctx = createContext<FilmCtx | null>(null);

export const FilmProvider: React.FC<FilmProps & { children: React.ReactNode }> = ({ lang, children }) => {
  const { width, height } = useVideoConfig();
  const tl = buildTimeline(lang);
  const value: FilmCtx = { lang, tl, L: makeLayout(width, height, lang), copy: COPY[lang], ...makeTimes(tl) };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useFilm = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFilm outside FilmProvider");
  return v;
};
