import { DURATION, ORDER } from "../lib/timeline";
import { T } from "./times";

// The film's sound design, timed from the same moments as the picture. Rendering is muted;
// scripts/mix_audio.py mixes these events (and the narration) offline.
type Sfx = { t: number; name: string; vol: number; fadeOut?: number };

const QUERY_LEN = "المفعول به".length;
const keys = Array.from({ length: QUERY_LEN }, (_, k) => ({ t: T.search - 0.1 + (k / QUERY_LEN) * 0.6, name: `key${k % 4}`, vol: 0.13 }));
const dropAt = T.yours + 0.05;
const go = T.uploadEnd + 0.05;
const txtAt = T.txt - 0.05;
const srtAt = T.srt - 0.1;

export const FILM_SFX: Sfx[] = [
  { t: 0, name: "air_bed", vol: 0.08, fadeOut: DURATION },
  { t: 0.1, name: "whoosh_long", vol: 0.16 },
  { t: T.lesson - 0.12, name: "pop", vol: 0.15 },
  { t: T.lecture - 0.12, name: "pop", vol: 0.15 },
  { t: T.interview - 0.12, name: "pop", vol: 0.15 },
  { t: T.trapped - 0.05, name: "whoosh", vol: 0.12 },
  { t: T.hook2 - 0.45, name: "whoosh", vol: 0.16 },
  { t: T.search - 0.48, name: "pop", vol: 0.13 },
  ...keys,
  { t: T.search + 0.68, name: "denied", vol: 0.3 },
  { t: T.quote - 0.15, name: "whoosh", vol: 0.15 },
  { t: T.quote + 0.72, name: "denied", vol: 0.28 },
  { t: T.collapse - 1.85, name: "air_riser", vol: 0.15 },
  { t: T.collapse + 0.48, name: "impact", vol: 0.42 },
  { t: T.name - 0.2, name: "whoosh", vol: 0.12 },
  { t: T.brand2 - 0.42, name: "slide", vol: 0.2 },
  { t: T.simple - 0.12, name: "pop", vol: 0.14 },
  { t: T.free0 - 0.12, name: "pop", vol: 0.14 },
  { t: T.everyone - 0.1, name: "pop", vol: 0.08 },
  { t: T.everyone + 0.17, name: "pop", vol: 0.07 },
  { t: T.everyone + 0.35, name: "pop", vol: 0.06 },
  { t: T.tool - 0.62, name: "whoosh", vol: 0.18 },
  { t: T.toText - 0.3, name: "whoosh_long", vol: 0.14 },
  { t: T.upload - 0.78, name: "whoosh", vol: 0.18 },
  { t: T.raise - 0.15, name: "slide", vol: 0.3 },
  { t: dropAt, name: "drop", vol: 0.45 },
  { t: T.mp3 - 0.05, name: "pop", vol: 0.07 },
  { t: T.m4a - 0.05, name: "pop", vol: 0.07 },
  { t: T.hours - 0.05, name: "pop", vol: 0.07 },
  { t: go, name: "ui_click", vol: 0.4 },
  { t: T.download - 0.6, name: "pop", vol: 0.2 },
  { t: txtAt, name: "ui_click", vol: 0.4 },
  { t: txtAt + 0.05, name: "paper", vol: 0.32 },
  { t: srtAt, name: "ui_click", vol: 0.4 },
  { t: srtAt + 0.05, name: "slide", vol: 0.3 },
  { t: T.free - 0.66, name: "whoosh", vol: 0.2 },
  { t: T.freeWord - 0.12, name: "pop", vol: 0.2 },
  { t: T.account - 0.15, name: "pop", vol: 0.13 },
  { t: T.account + 0.22, name: "whoosh", vol: 0.08 },
  { t: T.install - 0.15, name: "pop", vol: 0.13 },
  { t: T.install + 0.22, name: "whoosh", vol: 0.08 },
  { t: T.privacy - 0.5, name: "slide", vol: 0.24 },
  { t: T.remove + 0.05, name: "dissolve", vol: 0.38 },
  { t: T.remove + 0.8, name: "pop", vol: 0.14 },
  { t: T.more - 0.85, name: "whoosh", vol: 0.16 },
  { t: T.more - 0.38, name: "pop", vol: 0.14 },
  { t: T.start - 0.2, name: "slide", vol: 0.16 },
  { t: T.moreTools - 0.12, name: "pop", vol: 0.08 },
  { t: T.moreTools + 0.05, name: "pop", vol: 0.07 },
  { t: T.moreTools + 0.22, name: "pop", vol: 0.06 },
  { t: T.outro - 0.66, name: "whoosh_long", vol: 0.18 },
  { t: T.outro - 0.5, name: "impact", vol: 0.3 },
  { t: T.tryIt - 0.2, name: "pop", vol: 0.16 },
  { t: T.tryIt + 0.45, name: "ui_click", vol: 0.32 },
];

export const SFX_LEN: Record<string, number> = {
  air_bed: 80, whoosh: 1, whoosh_long: 1.8, pop: 0.5, slide: 0.7, denied: 0.6, air_riser: 2.4, impact: 3, drop: 0.6, paper: 0.8, dissolve: 1.4,
  ui_click: 0.12, key0: 0.09, key1: 0.09, key2: 0.09, key3: 0.09,
};

/** Every sound in the film, for the offline mixer. */
export const SOUND_EVENTS = [
  ...ORDER.map((c) => ({ t: c.start, file: `audio/vo/${c.id}.wav`, vol: 1 })),
  ...FILM_SFX.map((e) => ({ t: e.t, file: `audio/sfx/${e.name}.wav`, vol: e.vol, fadeOut: e.fadeOut })),
];
