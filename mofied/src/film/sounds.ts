import { useFilm } from "./context";
import { flickTimes } from "./scenes/Hook";
import { freeCuts } from "./scenes/Stages";

// Non-musical sound design: glass, paper, air, wood and a quiet room. No bells, chimes or tones
// (scripts/qa_sfx.py checks every file for a sustained pitch).
export type Sfx = { t: number; name: string; vol: number; fadeOut?: number; loop?: boolean };
export const SFX_LEN: Record<string, number> = {
  flick: 0.5, swipe: 0.8, tap: 0.5, breath: 1.5, room: 22, cards: 2.5, card: 0.5, tick: 0.5, wind: 3, paper: 0.6, whoosh: 1.6, thud: 0.8, zip: 0.6, rush: 1.5,
};

export const useSoundEvents = (): Sfx[] => {
  const { T, W, tl } = useFilm();
  const ev: Sfx[] = [];
  const add = (t: number, name: string, vol: number) => ev.push({ t, name, vol });
  // The feed speeds up, the hour is lost, then everything stops on the cut.
  const flicks = flickTimes(W.hook[1]).filter((x) => x < T.hookEnd);
  flicks.forEach((x, i) => add(x, "flick", 0.08 + 0.1 * (i / Math.max(1, flicks.length - 1))));
  add(T.lost - 0.02, "thud", 0.5);
  // A quiet room under everything after the cut.
  const roomFrom = T.cut + 0.35;
  ev.push({ t: roomFrom, name: "room", vol: 0.18, fadeOut: tl.duration - roomFrom, loop: true });
  // The question, then the mark lands.
  add(T.brand - 0.08, "thud", 0.6);
  add(T.name - 0.05, "breath", 0.4);
  add(T.brandEnd + 0.04, "whoosh", 0.07);
  add(T.openWord - 0.1, "tap", 0.55);
  add(T.openWord + 0.02, "zip", 0.12);
  add(T.account - 0.02, "card", 0.32);
  add(T.signup - 0.02, "card", 0.32);
  add(T.swipe1 + 0.02, "swipe", 0.2);
  add(T.swipe2, "swipe", 0.2);
  // the grid
  add(W.wall[0] + 0.05, "zip", 0.09);
  add(W.wall[0] + 0.4, "cards", 0.3);
  add(T.care + 0.32, "card", 0.25);
  add(T.clean + 0.2, "card", 0.18);
  // Into the dark: a rush of air, then quiet for the verse; back out into the phone.
  add(W.reminder[0] - 0.15, "rush", 0.08);
  add(W.reminder[1] - 0.47, "swipe", 0.2);
  // The last minutes: slow wooden ticks until the ending lands.
  let tick = T.session - 0.05;
  let gap = 0.4;
  while (tick < W.ending[0] - 0.08) {
    add(tick, "tick", 0.24);
    tick += gap;
    gap *= 1.08;
  }
  add(W.ending[0] - 0.02, "thud", 0.6);
  add(W.day[0], "wind", 0.42);
  const cuts = freeCuts(T);
  add(cuts[0] - 0.02, "thud", 0.55);
  add(cuts[1] - 0.04, "zip", 0.12);
  add(cuts[2] - 0.02, "thud", 0.5);
  add(W.outro[0] + 0.02, "breath", 0.45);
  [T.appstore, T.google, T.gallery].forEach((x) => add(x - 0.13, "card", 0.22));
  return ev.sort((a, b) => a.t - b.t);
};
