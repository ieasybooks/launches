import voAr from "../data/vo-ar.json";
import voEn from "../data/vo-en.json";

export type Lang = "ar" | "en";
type VoClip = { duration: number; chars: string; starts: number[]; ends: number[]; caption: string };
const VO: Record<Lang, Record<string, VoClip>> = { ar: voAr as Record<string, VoClip>, en: voEn as Record<string, VoClip> };

/** Stretches of Osama Al-Waaedh's recitation (the app's recording of «عيون المها», public/audio/rec/osama.wav,
 *  which starts at the recording's time 0), in the recording's own seconds. */
export const RECS = {
  // cut where his voice dips between lines (he runs the halves together; the dips are tens of milliseconds)
  b1: { from: 0.42, to: 10.8, fadeIn: 0.03, tail: 0.12 }, // bayt 1, the opening
  b2: { from: 10.93, to: 21.3, fadeIn: 0.03, tail: 0.05 }, // bayt 2, both halves, in the app (bayt 3 starts at 21.38)
} as const;
export type RecId = keyof typeof RECS;

/** The film in order: narration lines (one continuous take) and recitation, each with the silence (seconds)
 *  before it. Everything on screen is timed from this. */
export const PLAN: [string, number][] = [
  ["read", 0.75],
  ["listen", 2.15], // a moment to read the verse
  ["rec:b1", 0.45],
  ["age", 0.65],
  ["ask", 0.2],
  ["brand", 0.75], // the diamond flies up and the mark takes it
  ["hear", 0.6], // into the app
  ["rec:b2", 0.75], // play is tapped
  ["tap", 0.5],
  ["meaning", 0.7], // the notes are up; a moment to see them
  ["poets1", 1.0], // the oryx goes, the phone sinks away to the eras
  ["poets2", 0.55], // from the eras to the library
  ["night2", 1.2], // night falls, and the app turns to its night theme
  ["free", 0.9], // offline: airplane mode
  ["cta1", 0.75],
  ["cta2", 0.12],
];
const END_HOLD = 2.3;

export type ClipTime = { id: string; start: number; end: number; dur: number; caption: string };
export type RecTime = { id: RecId; start: number; end: number; from: number; to: number };
export type Timeline = {
  lang: Lang;
  clips: Record<string, ClipTime>;
  order: ClipTime[];
  recs: Record<RecId, RecTime>;
  duration: number;
  has: (id: string) => boolean;
  S: (id: string) => number;
  E: (id: string) => number;
  cue: (id: string, needle: string, edge?: "start" | "end") => number;
  /** 0–1: how much of clip `id` has been spoken at time t (by characters). */
  spoken: (id: string, t: number) => number;
  /** The film time at which the recitation stretch `id` reaches the recording's time `at`. */
  recAt: (id: RecId, at: number) => number;
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
  const recs = {} as Record<RecId, RecTime>;
  let cursor = 0;
  for (const [id, gap] of PLAN) {
    const start = cursor + gap;
    if (id.startsWith("rec:")) {
      const rid = id.slice(4) as RecId;
      const r = RECS[rid];
      recs[rid] = { id: rid, start, end: start + r.to - r.from, from: r.from, to: r.to };
      cursor = recs[rid].end;
      continue;
    }
    const clip = vo[id];
    if (!clip) throw new Error(`missing voice clip ${lang}/${id}`);
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
  const recAt = (id: RecId, at: number) => recs[id].start + (at - recs[id].from);
  const tl: Timeline = { lang, clips, order, recs, duration: cursor + END_HOLD, has, S, E, cue, spoken, recAt };
  cache.set(lang, tl);
  return tl;
};
