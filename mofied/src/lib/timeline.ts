import voAr from "../data/vo-ar.json";
import voEn from "../data/vo-en.json";

export type Lang = "ar" | "en";
type VoClip = { duration: number; chars: string; starts: number[]; ends: number[]; caption: string };
const VO: Record<Lang, Record<string, VoClip>> = { ar: voAr as Record<string, VoClip>, en: voEn as Record<string, VoClip> };

/** Narration order and the silence (seconds) before each line. Everything on screen is timed from this. */
/** Narration order and the extra silence (seconds) added before each line. The narration is one continuous
 *  take; everything on screen is timed from this. */
export const PLAN: [string, number][] = [
  ["hook", 0.3],
  ["turn1", 0.75], // the hard cut after the hook
  ["turn2", 0.15],
  ["easy1", 0.6], // the mark becomes the app icon
  ["easy2", 0],
  ["easy3", 0.1],
  ["curated1", 0.35],
  ["curated2", 0.1],
  ["reminder", 0.45],
  ["session1", 1.6], // a moment to read the verse
  ["session2", 0.1],
  ["session3", 0.45],
  ["free", 0.45],
  ["cta1", 0.6],
  ["cta2", 0.1],
];
const END_HOLD = 2.6;

export type ClipTime = { id: string; start: number; end: number; dur: number; caption: string };
export type Timeline = {
  lang: Lang;
  clips: Record<string, ClipTime>;
  order: ClipTime[];
  duration: number;
  has: (id: string) => boolean;
  S: (id: string) => number;
  E: (id: string) => number;
  cue: (id: string, needle: string, edge?: "start" | "end") => number;
  /** 0–1: how much of clip `id` has been spoken at time t (by characters). */
  spoken: (id: string, t: number) => number;
  /** The clip's words with the absolute time each one starts. */
  words: (id: string) => { word: string; at: number }[];
};

const DIACRITIC = /[ً-ْٰـ]/;
const plainIndex = (chars: string) => {
  const map: number[] = [];
  let plain = "";
  Array.from(chars).forEach((c, i) => {
    if (!DIACRITIC.test(c)) {
      plain += c;
      map.push(i);
    }
  });
  return { plain, map };
};

const cache = new Map<string, Timeline>();

export const buildTimeline = (lang: Lang): Timeline => {
  const hit = cache.get(lang);
  if (hit) return hit;
  const vo = VO[lang];
  const clips: Record<string, ClipTime> = {};
  const order: ClipTime[] = [];
  let cursor = 0;
  for (const [id, gap] of PLAN) {
    const clip = vo[id];
    if (!clip) throw new Error(`missing voice clip ${lang}/${id}`);
    const start = cursor + gap;
    const entry = { id, start, end: start + clip.duration, dur: clip.duration, caption: clip.caption };
    clips[id] = entry;
    order.push(entry);
    cursor = entry.end;
  }
  const has = (id: string) => id in clips;
  const S = (id: string) => (has(id) ? clips[id].start : NaN);
  const E = (id: string) => (has(id) ? clips[id].end : NaN);
  const cue = (id: string, needle: string, edge: "start" | "end" = "start") => {
    if (!has(id)) return NaN;
    const clip = vo[id];
    const { plain, map } = plainIndex(clip.chars);
    const at = plain.indexOf(needle);
    if (at < 0) throw new Error(`cue "${needle}" not found in ${lang}/${id}: ${plain}`);
    const idx = edge === "start" ? map[at] : map[at + Array.from(needle).length - 1];
    return clips[id].start + (edge === "start" ? clip.starts[idx] : clip.ends[idx]);
  };
  const spoken = (id: string, t: number) => {
    if (!has(id)) return 0;
    const clip = vo[id];
    const local = t - clips[id].start;
    const letters = clip.starts.filter((_, i) => !/\s/.test(clip.chars[i] ?? ""));
    if (!letters.length) return 0;
    return letters.filter((s) => s <= local).length / letters.length;
  };
  const words = (id: string) => {
    if (!has(id)) return [];
    const clip = vo[id];
    const chars = Array.from(clip.chars);
    const out: { word: string; at: number }[] = [];
    let cur = "";
    let at = 0;
    chars.forEach((ch, i) => {
      if (/\s/.test(ch)) {
        if (cur) out.push({ word: cur, at: clips[id].start + at });
        cur = "";
      } else {
        if (!cur) at = clip.starts[i];
        cur += ch;
      }
    });
    if (cur) out.push({ word: cur, at: clips[id].start + at });
    return out;
  };
  const tl: Timeline = { lang, clips, order, duration: cursor + END_HOLD, has, S, E, cue, spoken, words };
  cache.set(lang, tl);
  return tl;
};
