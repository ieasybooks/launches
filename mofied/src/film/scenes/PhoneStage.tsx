import React from "react";
import { clamp, ease, lerp, life, ramp, useStage } from "../../lib/motion";
import { PHONE_H, PHONE_W, useFilm } from "../context";
import { HomeScreen, MediaScreen, Phone, media, type Media } from "../parts/app";
import { ICON } from "./Turn";
import { wallLayout } from "./Wall";

const SWIPE = 0.42;

/** Pages that slide up one after another; `swaps[i]` is when page i gives way to page i + 1. */
const Pager: React.FC<{ pages: React.ReactNode[]; swaps: number[]; t: number }> = ({ pages, swaps, t }) => {
  let idx = 0;
  let p = 0;
  for (let i = 0; i < swaps.length; i++) {
    if (t >= swaps[i] + SWIPE) idx = i + 1;
    else {
      if (t >= swaps[i]) p = ease.inOut((t - swaps[i]) / SWIPE);
      idx = i;
      break;
    }
  }
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${-p * PHONE_H}px)` }}>{pages[idx]}</div>
      {p > 0 && pages[idx + 1] && <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - p) * PHONE_H}px)` }}>{pages[idx + 1]}</div>}
    </>
  );
};

/** A fingertip for a swipe the viewer makes. */
const Finger: React.FC<{ at: number; t: number }> = ({ at, t }) => {
  const v = life(t, at - 0.24, at + 0.38, 0.14, 0.18);
  if (v <= 0) return null;
  const m = ramp(t, at - 0.06, 0.4, ease.inOut);
  return <div style={{ position: "absolute", left: PHONE_W / 2 - 26, top: lerp(610, 300, m), width: 52, height: 52, borderRadius: 26, background: "rgba(255,255,255,0.32)", border: "1.5px solid rgba(255,255,255,0.75)", opacity: v, boxShadow: "0 0 24px rgba(255,255,255,0.35)", zIndex: 8 }} />;
};

const minutesAt = (t: number, T: { session: number; endWord: number }) => (t < T.session + 0.3 ? 3 : t < T.endWord - 0.1 ? 2 : 1);
export const useSessionMinutes = () => {
  const { T } = useFilm();
  return (t: number) => minutesAt(t, T);
};

/** The opening: the icon opens into the app, the phone turns to the words, three clips go by, and the
 *  phone settles into the curated grid. */
export const PhoneOpen: React.FC = () => {
  const { T, W, L, lang } = useFilm();
  const { t } = useStage();
  const [a, b] = W.phoneA;
  if (t < a || t > b) return null;
  const clips: Media[] = [media("106478"), media("2047"), media("58197")];
  const swaps = [T.swipe1 + 0.04, T.swipe2 + 0.02];
  const from = [T.openWord - 0.05, swaps[0] - 0.1, swaps[1] - 0.1];
  const pages = clips.map((m, i) => <MediaScreen key={m.id} m={m} lang={lang} minutes={18} videoFrom={from[i]} t={t} />);
  // the iPhone arrives around the icon, opens it at the centre, then turns toward the words
  const appear = ramp(t, a, 0.45, ease.out);
  const side = ramp(t, T.watch - 0.45, 0.8, ease.inOut);
  let cx = lerp(L.open.cx, L.phone.cx, side);
  let cy = lerp(L.open.cy, L.phone.cy, side);
  let s = lerp(L.open.s, L.phone.s, side) * (1.08 - 0.08 * appear);
  let ry = lerp(0, L.phone.ry, side);
  const pump = Math.max(...swaps.map((sw) => Math.max(0, 1 - Math.abs(t - sw - SWIPE / 2) / 0.45)));
  s *= 1 + 0.045 * pump;
  ry *= 1 - 0.6 * pump;
  // into the grid's first cell
  const g = wallLayout(L);
  const into = ramp(t, W.wall[0], 0.7, ease.inOut);
  const cell = g.cell(1);
  cx = lerp(cx, cell.x, into);
  cy = lerp(cy, cell.y, into);
  s = lerp(s, g.phoneScale, into);
  ry = lerp(ry, 0, into);
  const opacity = appear * (1 - ramp(t, W.wall[0] + 0.55, 0.15));
  // iOS opens the app out of its icon
  const grow = ramp(t, T.openWord + 0.02, 0.5, ease.inOut);
  const iw = lerp(ICON, PHONE_W, grow), ih = lerp(ICON, PHONE_H, grow);
  const clip = grow >= 1 ? undefined : `inset(${(PHONE_H - ih) / 2}px ${(PHONE_W - iw) / 2}px round ${lerp(ICON * 0.225, 55, grow)}px)`;
  return (
    <Phone cx={cx} cy={cy} s={s} ry={ry} opacity={opacity} tone={grow > 0.5 ? "light" : "dark"} rtl={L.rtl}>
      {grow < 1 && <HomeScreen lang={lang} icon={ICON} iconOpacity={t >= T.openWord - 0.12 ? 1 : 0} />}
      {grow > 0 && (
        <div style={{ position: "absolute", inset: 0, clipPath: clip, opacity: clamp(grow * 2.5) }}>
          <Pager pages={pages} swaps={swaps} t={t} />
          {swaps.map((sw, i) => <Finger key={i} at={sw} t={t} />)}
        </div>
      )}
    </Phone>
  );
};

/** The session's last minutes: the reminder (just finished) gives way to one more clip, while the
 *  remaining time counts down. The ending itself takes the whole frame (Stages.tsx). */
export const PhoneSession: React.FC = () => {
  const { T, W, L, lang } = useFilm();
  const { t, H } = useStage();
  const [a, b] = W.phoneB;
  if (t < a || t > b) return null;
  const m = media("125605");
  // the reminder slides up out of the frame and the next clip comes up behind it, as in the app
  const enter = ramp(t, a, 0.45, ease.inOut);
  const push = ramp(t, a + 0.45, b - a - 0.45, ease.linear);
  const s = L.phone.s * (1 + 0.04 * push);
  return (
    <Phone cx={L.phone.cx} cy={L.phone.cy + (1 - enter) * H} s={s} ry={L.phone.ry} rtl={L.rtl}>
      <MediaScreen m={m} lang={lang} minutes={minutesAt(t, T)} videoFrom={a - 0.1} t={t} />
    </Phone>
  );
};
