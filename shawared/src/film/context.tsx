import React, { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";
import { buildTimeline, type Lang, type Timeline } from "../lib/timeline";
import { COPY, LABELS } from "./copy";
import { makeTimes, type Times } from "./times";

export type FilmProps = { lang: Lang };

/** Where things sit in each shape. 9:16 (Shorts, Reels, TikTok, stories) is the reference; 4:5 (feeds) and 16:9
 *  (YouTube, X, the web) put the phone to one side and the words beside it (the reading side: right in Arabic, left
 *  in English). Text in 9:16 stays inside what the platforms leave clear (288 px top, 672 px bottom, 192 px sides)
 *  except where the phone itself is the picture. */
export const makeLayout = (W: number, H: number, lang: Lang) => {
  const rtl = lang === "ar";
  const tall = H / W > 1.5;
  const wide = W / H > 1.5;
  const shape = tall ? "9x16" : wide ? "16x9" : "4x5";
  const cx = W / 2;
  // the phone at rest, and the column beside it
  const phone = tall ? { X: 540, Y: 1200, s: 1.47 } : wide ? { X: rtl ? 660 : 1260, Y: 540, s: 1.06 } : { X: rtl ? 330 : 750, Y: 690, s: 1.33 };
  const side = tall ? null : wide ? { x: rtl ? 1020 : 220, w: 680, cx: rtl ? 1360 : 560 } : { x: rtl ? 640 : 70, w: 370, cx: rtl ? 825 : 255 };
  return {
    rtl, W, H, cx, tall, wide, shape, phone, side,
    // the opening's verse: bayt 1's row, enlarged, at the frame's centre; then lower while the name arrives
    hook: { X: cx, Y: tall ? 940 : wide ? 470 : 640, s: wide ? 3.5 : 2.98 },
    brandVerse: { X: cx, Y: tall ? 1330 : wide ? 830 : 1020, s: wide ? 2.2 : 2.45 },
    lockY: tall ? 400 : wide ? 70 : 110, // the lockup's top
    lockMark: tall ? 270 : wide ? 170 : 200,
    // the words above (9:16) or beside (4:5, 16:9) the phone
    verbs: tall ? { top: 300, size: rtl ? 84 : 70 } : wide ? { top: 0, size: rtl ? 112 : 84 } : { top: 0, size: rtl ? 96 : 66 },
    band: { h: tall ? 360 : wide ? 230 : 260, cell: tall ? 92 : wide ? 76 : 80 },
  };
};
export type Layout = ReturnType<typeof makeLayout>;

type FilmCtx = FilmProps & { tl: Timeline; L: Layout; copy: (typeof COPY)["ar"]; labels: (typeof LABELS)["ar"]; dir: "rtl" | "ltr" } & Times;
const Ctx = createContext<FilmCtx | null>(null);

export const FilmProvider: React.FC<FilmProps & { children: React.ReactNode }> = ({ lang, children }) => {
  const { width, height } = useVideoConfig();
  const tl = buildTimeline(lang);
  const value: FilmCtx = {
    lang, tl, L: makeLayout(width, height, lang), copy: COPY[lang] as (typeof COPY)["ar"], labels: LABELS[lang], dir: lang === "ar" ? "rtl" : "ltr", ...makeTimes(tl),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useFilm = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFilm outside FilmProvider");
  return v;
};
