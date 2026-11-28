import React, { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";
import { buildTimeline, type Lang, type Timeline } from "../lib/timeline";
import { COPY, SITE } from "./copy";
import { makeTimes, type Times } from "./times";

export type FilmProps = { lang: Lang };

/** The phone's screen in CSS pixels (a Pixel 8: 412 × 915, less the system bars below). */
export const SCREEN = { w: 412, h: 892, status: 32, toolbar: 56, nav: 22 };
export const VIEW_H = SCREEN.h - SCREEN.status - SCREEN.toolbar - SCREEN.nav;

/** Where things sit, in 9:16 (1080 × 1920) and 4:5 (1080 × 1350); `u` scales from the 1080-pixel short side. */
export const makeLayout = (W: number, H: number, lang: Lang) => {
  const rtl = lang === "ar";
  const shape = (H / W > 1.5 ? "9x16" : "4x5") as "9x16" | "4x5";
  const tall = shape === "9x16";
  const u = Math.min(W, H) / 1080;
  const lh = rtl ? 1.42 : 1.14;
  // the phone at rest: its scale (CSS px → film px) and where its screen's centre sits. In 4:5 it is a little larger
  // than the whole phone would allow, its top in the frame and its foot below it.
  const restS = (tall ? 2.0 : 1.7) * u;
  return {
    rtl, W, H, u, lh, shape, tall,
    // the question and the three files; `staff` is how far each staff sits from the files' centre
    hook: tall
      ? { headTop: 130 * u, head: 84 * u, cardsY: 1190 * u, cardW: 760 * u, cardGap: 44 * u, staff: 330 * u, staffGap: 70 * u }
      : { headTop: 64 * u, head: 68 * u, cardsY: 906 * u, cardW: 600 * u, cardGap: 30 * u, staff: 250 * u, staffGap: 56 * u },
    brandY: H * (tall ? 0.43 : 0.44),
    phone: { s: restS, cx: W / 2, cy: tall ? H * 0.5 : 92 * u + (SCREEN.h / 2) * restS },
    // the camera close on the tool (its scale, and where the workspace's centre and the result's card sit)
    close: { s: 2.3 * u, toolY: H * (tall ? 0.59 : 0.56), cardY: H * (tall ? 0.58 : 0.6) },
    // the downloaded file, above the phone
    dlY: H * (tall ? 0.17 : 0.2),
    outro: tall
      ? { top: H * 0.3, lockH: 150 * u, line: 215 * u, url: 365 * u, privacy: 520 * u, voiceY: H - 300 * u }
      : { top: (H - 570 * u) / 2 - 50 * u, lockH: 150 * u, line: 215 * u, url: 365 * u, privacy: 520 * u, voiceY: H - 150 * u },
  };
};
export type Layout = ReturnType<typeof makeLayout>;

type FilmCtx = FilmProps & { tl: Timeline; L: Layout; copy: (typeof COPY)[Lang]; site: (typeof SITE)[Lang]; dir: "rtl" | "ltr" } & Times;
const Ctx = createContext<FilmCtx | null>(null);

export const FilmProvider: React.FC<FilmProps & { children: React.ReactNode }> = ({ lang, children }) => {
  const { width, height } = useVideoConfig();
  const tl = buildTimeline(lang);
  const copy = COPY[lang];
  const value: FilmCtx = {
    lang, tl, L: makeLayout(width, height, lang), copy, site: SITE[lang], dir: lang === "ar" ? "rtl" : "ltr",
    ...makeTimes(tl, copy.files.map((f) => f.cue), copy.free.map((f) => f.cue)),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useFilm = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFilm outside FilmProvider");
  return v;
};
