import { useFilm } from "./context";
import { typingOf } from "./scenes/Outro";

// Non-musical sound design: taps, a wooden snap, paper, air, keystrokes. No bells, chimes or tones
// (scripts/qa_sfx.py checks every file for a sustained pitch). The film's only music is the demo file's own,
// heard for a few seconds before the preview switches to "Music removed" (public/audio/demo, scripts/prepare_demo.py).
export type Sfx = { t: number; name: string; vol: number; fadeOut?: number; loop?: boolean; file?: string };
export const SFX_LEN: Record<string, number> = {
  click: 0.5, snap: 0.6, scatter: 1.2, thud: 0.8, whoosh: 1.2, zip: 0.6, card: 0.5, pop: 0.5, type: 1.2, air: 20,
  "key-0": 0.1, "key-1": 0.1, "key-2": 0.1, "key-3": 0.1,
};
/** The file a sound event plays, relative to public/. */
export const sfxFile = (e: Sfx) => e.file ?? `audio/sfx/${e.name}.wav`;

export const useSoundEvents = (): Sfx[] => {
  const { T, W, tl, lang, copy, file: F } = useFilm();
  const ev: Sfx[] = [];
  const add = (t: number, name: string, vol: number) => ev.push({ t, name, vol });
  // a tap on the phone's glass: the click, softer than a mouse's
  const tap = (t: number) => add(t - 0.015, "click", 0.38);
  const keys = (at: number, step: number, text: string, vol: number) =>
    Array.from(text).forEach((ch, i) => add(at + (i + 1) * step - 0.012, `key-${ch === " " ? 3 : i % 3}`, ch === "." ? vol * 0.7 : vol * (0.85 + (0.15 * ((i * 7) % 3)) / 2)));
  ev.push({ t: 0, name: "air", vol: 0.16, fadeOut: tl.duration, loop: true });

  // the hook: the files, their music, the snap, the brand
  [0.08, 0.22, 0.36].forEach((x, i) => add(x, "pop", 0.08 + 0.02 * i));
  T.cards.slice(1).forEach((x) => add(x - 0.1, "card", 0.4));
  add(T.remove, "snap", 0.8);
  add(T.remove + 0.07, "scatter", 0.45);
  add(T.site - 0.12, "thud", 0.48);
  add(T.site + 0.17, "snap", 0.4);
  add(T.website - 0.05, "pop", 0.14);

  // the website on the phone
  add(T.paper + 0.02, "whoosh", 0.22);
  tap(T.tab);
  tap(T.choose);
  add(F.land - 0.12, "card", 0.38);
  tap(T.run);
  add(T.device - 0.1, "pop", 0.1);
  add(T.done - 0.02, "pop", 0.16);

  // the demo: the file's own sound, then the website's output from the same moment
  tap(T.original);
  tap(T.play);
  ev.push({ t: tl.sample.start, name: "demo-a", vol: 1, file: `audio/demo/${lang}-a.wav` });
  tap(T.cut);
  ev.push({ t: tl.sample.cutAt, name: "demo-b", vol: 1, file: `audio/demo/${lang}-b.wav` });
  add(T.cut + 0.06, "snap", 0.42);
  add(T.cut + 0.14, "scatter", 0.28);
  tap(T.pause);

  // the download
  tap(T.download);
  add(T.download + 0.12, "zip", 0.14);
  add(T.download + 0.55, "pop", 0.14);

  // free, no account, nothing to install, desktop and mobile
  add(tl.S("free") - 0.1, "whoosh", 0.2);
  T.free.forEach((x) => add(x - 0.14, "card", 0.38));

  // the end card
  add(W.outro[0] + 0.02, "whoosh", 0.18);
  add(W.outro[0] + 0.25, "thud", 0.4);
  add(W.outro[0] + 0.52, "snap", 0.34);
  const typing = typingOf(T, copy.url);
  keys(typing.at, typing.step, copy.url, 0.22);
  add(T.ctaSite + 0.2, "pop", 0.1);
  return ev.sort((a, b) => a.t - b.t);
};
