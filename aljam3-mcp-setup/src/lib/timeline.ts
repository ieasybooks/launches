import voData from "../data/vo.json";

type VoClip = { duration: number; chars: string; starts: number[]; ends: number[]; caption: string };
const VO = voData as Record<string, VoClip>;

/**
 * Narration order and the silence (seconds) before each line. Everything on screen is timed from this;
 * the longer gaps leave room for what happens on screen between lines (typing, the assistant working).
 */
export const PLAN: [string, number][] = [
  ["intro1", 1.0],
  ["intro2", 0.7],
  ["link", 2.2],
  ["gpt1", 1.6],
  ["gpt2", 0.8],
  ["gpt3", 0.9],
  ["gpt4", 0.8],
  ["gpt5", 0.8],
  ["gpt6", 1.4],
  ["gpt7", 1.2],
  ["gpt8", 0.6],
  ["gpt9", 2.6],
  ["claude1", 2.2],
  ["claude2", 0.8],
  ["claude3", 1.0],
  ["claude4", 1.8],
  ["claude6", 2.2],
  ["claude7", 5.6],
  ["claude8", 2.6],
  ["verify", 1.0],
  ["tips", 2.0],
  ["outro1", 1.0],
  ["outro2", 0.9],
];
const END_HOLD = 3.0;

export type ClipTime = { id: string; start: number; end: number; dur: number; caption: string };
export const CLIPS: Record<string, ClipTime> = {};
export const ORDER: ClipTime[] = [];
let cursor = 0;
for (const [id, gap] of PLAN) {
  const clip = VO[id];
  if (!clip) throw new Error(`missing voice clip ${id}`);
  const start = cursor + gap;
  const entry = { id, start, end: start + clip.duration, dur: clip.duration, caption: clip.caption };
  CLIPS[id] = entry;
  ORDER.push(entry);
  cursor = entry.end;
}
export const DURATION = cursor + END_HOLD;

export const S = (id: string) => CLIPS[id].start;
export const E = (id: string) => CLIPS[id].end;

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

/** Absolute time at which `needle` (undiacritized) is spoken in clip `id`. */
export const cue = (id: string, needle: string, occurrence = 0, edge: "start" | "end" = "start") => {
  const clip = VO[id];
  const { plain, map } = plainIndex(clip.chars);
  let at = -1;
  for (let n = 0; n <= occurrence; n++) at = plain.indexOf(needle, at + 1);
  if (at < 0) throw new Error(`cue "${needle}" not found in ${id}: ${plain}`);
  const idx = edge === "start" ? map[at] : map[at + Array.from(needle).length - 1];
  return CLIPS[id].start + (edge === "start" ? clip.starts[idx] : clip.ends[idx]);
};
