import { RECS } from "../lib/timeline";
import { useFilm } from "./context";

// Non-musical sound design: taps, paper, air, a page, a quiet room and the night. No bells,
// chimes or tones (scripts/qa_sfx.py checks every file for a sustained pitch). The only voice besides the
// narrator is Osama Al-Waaedh's recitation, from the app's own recording.
export type Sfx = { t: number; name: string; vol: number; fadeOut?: number; loop?: boolean; file?: string; from?: number; dur?: number; fadeIn?: number; tail?: number };
export const SFX_LEN: Record<string, number> = {
  tap: 0.5, swipe: 0.8, paper: 0.6, breath: 1.5, thud: 0.8, whoosh: 1.6, zip: 0.6, card: 0.5, wind: 3.0, page: 1.2, air: 22, night: 22,
};
/** The file a sound event plays, relative to public/. */
export const sfxFile = (e: Sfx) => e.file ?? `audio/sfx/${e.name}.wav`;
export const REC_FILE = "audio/rec/osama.wav";

export const useSoundEvents = (): Sfx[] => {
  const { T, W, tl } = useFilm();
  const ev: Sfx[] = [];
  const add = (t: number, name: string, vol: number) => ev.push({ t, name, vol });
  // a quiet room under the day, the night air under the night
  ev.push({ t: 0, name: "air", vol: 0.16, fadeOut: T.night - 0.2, loop: true });
  ev.push({ t: T.night - 1.1, name: "night", vol: 0.2, fadeOut: tl.duration - T.night + 1.1, loop: true });

  // the recitation: bayt 1 in the opening, bayt 2 in the app
  for (const r of Object.values(tl.recs)) {
    const cut = RECS[r.id];
    ev.push({ t: r.start, name: `rec-${r.id}`, vol: 1, file: REC_FILE, from: r.from, dur: r.to - r.from, fadeIn: cut.fadeIn, tail: cut.tail });
  }

  // the opening
  add(0.05, "paper", 0.32);
  add(T.maha + 0.2, "card", 0.22);
  add(T.brand - 0.15, "whoosh", 0.2);
  add(T.name - 0.05, "thud", 0.42);
  // into the app
  add(T.hearStart - 0.45, "breath", 0.5);
  add(T.play - 0.03, "tap", 0.55);
  add(T.tapWord - 0.03, "tap", 0.55);
  add(T.tapWord + 0.05, "swipe", 0.22);
  add(T.oryx - 0.3, "card", 0.3);
  // the eras: a page turned, then the library
  add(W.eras[0], "page", 0.35);
  add(T.byPoet - 0.35, "whoosh", 0.16);
  add(T.byReciter - 0.03, "tap", 0.5);
  // the night: download
  add(T.download - 0.35, "swipe", 0.2);
  add(T.download + 0.32, "tap", 0.5);
  // free, and the end card
  [T.free, T.ads, T.account].forEach((x) => add(x - 0.12, "card", 0.32));
  add(W.outro[0] + 0.3, "whoosh", 0.18);
  add(W.outro[0] + 0.5, "thud", 0.36);
  [T.appstore, T.google, T.gallery].forEach((x) => add(x - 0.12, "card", 0.34));
  return ev.sort((a, b) => a.t - b.t);
};
