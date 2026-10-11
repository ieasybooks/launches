import { DURATION, ORDER } from "../lib/timeline";
import { SFX } from "./director";
import { I } from "./Intro";
import { O } from "./Outro";

// Intro and outro sound design (the UI sounds come from the director).
export type FilmSfx = { t: number; name: string; vol: number; fadeOut?: number };
export const FILM_SFX: FilmSfx[] = [
  { t: 0.0, name: "air_bed", vol: 0.09, fadeOut: DURATION - 0.1 },
  { t: 0.15, name: "whoosh_long", vol: 0.2 },
  { t: I.chip, name: "pop", vol: 0.14 },
  { t: I.q - 0.2, name: "slide", vol: 0.3 },
  { t: I.title - 0.3, name: "whoosh", vol: 0.2 },
  { t: I.step, name: "pop", vol: 0.12 },
  { t: I.gpt, name: "pop", vol: 0.16 },
  { t: I.claude, name: "pop", vol: 0.16 },
  { t: I.bloom - 2.0, name: "air_riser", vol: 0.16 },
  { t: I.bloom + 0.05, name: "paper_gather", vol: 0.2 },
  { t: O.start(), name: "whoosh_long", vol: 0.22 },
  { t: O.gptCard, name: "pop", vol: 0.16 },
  { t: O.claudeCard, name: "pop", vol: 0.16 },
  { t: O.guide - 0.2, name: "slide", vol: 0.45 },
  { t: O.gather, name: "paper_gather", vol: 0.24 },
  { t: O.logo - 2.0, name: "air_riser", vol: 0.18 },
  { t: O.logo - 0.04, name: "impact", vol: 0.4 },
];
export const SFX_LEN: Record<string, number> = { air_bed: 180, whoosh_long: 1.8, page_flip: 1.2, paper_gather: 2.4, air_riser: 2.4, impact: 3, whoosh: 1, pop: 0.5, slide: 0.7, toggle: 0.5, ui_click: 0.12, key0: 0.09, key1: 0.09, key2: 0.09, key3: 0.09 };

/** Every sound in the film (narration, intro/outro design, UI sounds) for the offline mixer. */
export const SOUND_EVENTS = [
  ...ORDER.map((c) => ({ t: c.start, file: `audio/vo/${c.id}.wav`, vol: 1 })),
  ...[...FILM_SFX, ...SFX].map((e) => ({ t: e.t, file: `audio/sfx/${e.name}.wav`, vol: e.vol, fadeOut: (e as FilmSfx).fadeOut })),
];
