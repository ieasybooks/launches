import { SHOTS } from "../data/shots";
import type { Lang } from "../lib/timeline";
import { LABELS } from "./copy";
import { findAll, type AnyNode, type BoxNode, type ShotData, type TextNode } from "./parts/Shot";

// Lookups into the recorded screens: where a control sits, which nodes make bayt 1's words, the girih band.

export const shotOf = (lang: Lang, state: string): ShotData => {
  const s = SHOTS[`${lang}-${state}`];
  if (!s) throw new Error(`no recorded screen ${lang}-${state}`);
  return s;
};

export type Rect = { x: number; y: number; w: number; h: number; cx: number; cy: number; path: string };
const rect = (n: AnyNode, path: string): Rect => ({ x: n.x, y: n.y, w: n.w, h: n.h, cx: n.x + n.w / 2, cy: n.y + n.h / 2, path });

const memo = new Map<string, unknown>();
const once = <T,>(key: string, f: () => T): T => {
  if (!memo.has(key)) memo.set(key, f());
  return memo.get(key) as T;
};

/** The first box with this label (a control, a bayt's row), visible on the screen. */
export const labelled = (lang: Lang, state: string, label: string, prefix = false): Rect =>
  once(`l:${lang}:${state}:${label}:${prefix}`, () => {
    const s = shotOf(lang, state);
    const hits = findAll(s.root, (n) => n.t === "box" && !!n.label && (prefix ? n.label.startsWith(label) : n.label === label) && n.w > 0 && n.y + n.h > 0 && n.y < s.h);
    if (!hits.length) throw new Error(`no "${label}" in ${lang}-${state}`);
    return rect(hits[0].n, hits[0].path);
  });

/** The first text line that reads `text` (diacritics and tatweel ignored). */
export const textAt = (lang: Lang, state: string, text: string): Rect =>
  once(`t:${lang}:${state}:${text}`, () => {
    const s = shotOf(lang, state);
    const plain = (x: string) => x.replace(/[ً-ْٰـ]/g, "");
    const hits = findAll(s.root, (n) => n.t === "text" && plain(n.text).includes(plain(text)));
    if (!hits.length) throw new Error(`no text "${text}" in ${lang}-${state}`);
    return rect(hits[0].n, hits[0].path);
  });

/** The tinted card of a word's meaning in the open notes. */
export const meaningCard = (lang: Lang): Rect =>
  once(`card:${lang}`, () => {
    const s = shotOf(lang, "sheet");
    const hits = findAll(s.root, (n) => n.t === "box" && n.bg === "rgb(241, 223, 198)");
    if (!hits.length) throw new Error("no meaning card");
    return rect(hits[0].n, hits[0].path);
  });

export type VerseWord = { node: TextNode; path: string; index: number; half: 1 | 2 };
/** Bayt 1's row in a screen, its verse words in reading order (sadr, then ajuz), its other text (the number,
 *  English translations) and its dotted gloss marks. */
export const bayt1 = (lang: Lang, state: string) =>
  once(`b1:${lang}:${state}`, () => {
    const row = labelled(lang, state, LABELS[lang].row1);
    const s = shotOf(lang, state);
    const node = findAll(s.root, (n) => n.t === "box" && n.label === LABELS[lang].row1)[0].n as BoxNode;
    const texts = findAll(node, (n) => n.t === "text", row.path) as { n: TextNode; path: string }[];
    const verse = texts.filter((x) => x.n.font.fontFamily.startsWith("Amiri"));
    const top = Math.min(...verse.map((x) => x.n.y));
    const words: VerseWord[] = verse.map((x, i) => ({ node: x.n, path: x.path, index: i, half: x.n.y - top < 8 ? 1 : 2 }));
    const other = texts.filter((x) => !x.n.font.fontFamily.startsWith("Amiri")).map((x) => x.path);
    const marks = findAll(node, (n) => n.t === "box" && !!n.border && n.border.some((b) => b.style === "dotted"), row.path).map((x) => x.path);
    return { row, node, words, other, marks };
  });

/** The girih band's pattern (the app draws it as a CSS background), in day or night colours. */
export const girih = (night: boolean) =>
  once(`g:${night}`, () => {
    const s = shotOf("ar", night ? "night" : "p1");
    const hit = findAll(s.root, (n) => n.t === "box" && !!n.bgImage && n.bgImage.startsWith('url("data:image/svg'))[0];
    const n = hit.n as BoxNode;
    return { image: n.bgImage!, size: n.bgSize!, w: n.w, h: n.h };
  });
