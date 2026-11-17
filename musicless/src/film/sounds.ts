import { useFilm } from "./context";

// Non-musical sound design: clicks, a wooden snap, paper, air, keystrokes. No bells, chimes or tones
// (scripts/qa_sfx.py checks every file for a sustained pitch). The film's only music is the demo's real video,
// heard for a few seconds before Musicless removes it (public/audio/demo, scripts/prepare_demo.py).
export type Sfx = { t: number; name: string; vol: number; fadeOut?: number; loop?: boolean; file?: string };
export const SFX_LEN: Record<string, number> = {
  click: 0.5, snap: 0.6, scatter: 1.2, thud: 0.8, whoosh: 1.2, zip: 0.6, card: 0.5, pop: 0.5, type: 1.2, air: 20,
  "key-0": 0.1, "key-1": 0.1, "key-2": 0.1, "key-3": 0.1,
};
/** The file a sound event plays, relative to public/. */
export const sfxFile = (e: Sfx) => e.file ?? `audio/sfx/${e.name}.wav`;

export const useSoundEvents = (): Sfx[] => {
  const { T, W, tl, lang, copy, typing } = useFilm();
  const ev: Sfx[] = [];
  const add = (t: number, name: string, vol: number) => ev.push({ t, name, vol });
  // one keystroke for each letter as it appears (a letter shows one step after the last)
  const keys = (at: number, step: number, text: string, vol: number) =>
    Array.from(text).forEach((ch, i) => add(at + (i + 1) * step - 0.012, `key-${ch === " " ? 3 : i % 3}`, ch === " " ? vol * 0.7 : vol * (0.85 + 0.15 * ((i * 7) % 3) / 2)));
  // a quiet room under everything
  ev.push({ t: 0, name: "air", vol: 0.16, fadeOut: tl.duration, loop: true });

  // the hook: the notes arrive, the click, every note snaps and falls
  [0.08, 0.2, 0.31, 0.45, 0.58].forEach((x, i) => add(x, "pop", 0.08 + 0.02 * i));
  add(T.snap - 0.05, "click", 0.7);
  add(T.snap, "snap", 0.85);
  add(T.snap + 0.07, "scatter", 0.5);
  add(T.voicesLine - 0.12, "whoosh", 0.14);
  // the brand
  add(T.name - 0.14, "thud", 0.5);
  add(T.name + 0.15, "snap", 0.42);

  // who it's for
  add(W.why[0] + 0.05, "whoosh", 0.22);
  T.cards.forEach((x) => add(x - 0.08, "card", 0.42));
  [0, 0.15, 0.3].forEach((d) => add(T.withMusic - 0.1 + d, "pop", 0.12));
  [0, 1, 2, 3].forEach((i) => add(T.avoid - 0.04 + i * 0.09, "snap", 0.38));
  add(T.avoid + 0.1, "scatter", 0.32);
  add(T.pill - 0.15, "card", 0.32);
  add(T.word - 0.15, "card", 0.32);

  // three clicks
  add(T.three - 0.05, "thud", 0.38);
  add(Math.max(T.three + 0.55, T.find - 0.55), "whoosh", 0.2);
  keys(typing.store.at, typing.store.step, copy.search, 0.3);
  add(T.click1 - 0.02, "click", 0.62);
  add(T.click1 + 0.16, "pop", 0.18);
  add(T.click2 - 0.02, "click", 0.62);
  add(T.click2 + 0.3, "zip", 0.12);
  add(T.click3 - 0.02, "click", 0.62);
  add(T.click3 + 0.14, "snap", 0.4);
  add(T.done - 0.08, "thud", 0.45);

  // the demo: the video's own sound, then Musicless, then the same video with the voices alone
  add(T.demo - 0.08, "zip", 0.14);
  ev.push({ t: T.sampleStart, name: "demo-a", vol: 1, file: `audio/demo/${lang}-a.wav` });
  add(T.sampleCut - 0.02, "click", 0.6);
  add(T.sampleCut + 0.3, "snap", 0.5);
  add(T.sampleCut + 0.38, "scatter", 0.34);
  ev.push({ t: T.sampleResume, name: "demo-b", vol: 1, file: `audio/demo/${lang}-b.wav` });
  add(T.clickIcon - 0.02, "click", 0.6);

  // why you'll love it
  add(W.reasons[0] + 0.05, "whoosh", 0.22);
  T.reasons.forEach((x) => add(x - 0.22, "card", 0.4));
  T.formats.slice(1).forEach((x) => add(x - 0.12, "pop", 0.14));
  T.systems.forEach((x) => add(x - 0.08, "pop", 0.14));

  // the end card
  add(W.outro[0] + 0.05, "whoosh", 0.22);
  add(W.outro[0] + 0.35, "thud", 0.4);
  add(W.outro[0] + 0.62, "snap", 0.36);
  add(T.chrome - 0.12, "card", 0.42);
  add(T.firefox - 0.12, "card", 0.42);
  keys(typing.end.at, typing.end.step, copy.search, 0.24);
  add(T.ctaWord - 0.05, "pop", 0.12);
  add(T.watch - 0.08, "thud", 0.42);
  return ev.sort((a, b) => a.t - b.t);
};
