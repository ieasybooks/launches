/**
 * Recorded screen clips and how they are laid on the film's timeline.
 *
 * A shot plays one clip between film times f0 and f1. Anchors pin a clip time (v) to a film time (f),
 * usually a click to the word that asks for it. Between two anchors the clip plays at real speed and
 * then holds just before the next action (`lead` seconds early, so the hover shows as the cursor
 * arrives); if there isn't enough film time it plays faster instead.
 */
import clipsData from "../data/clips.json";

export type Mark = { kind: string; t: number; x?: number; y?: number; label?: string; text?: string; key?: string; retry?: boolean };
export type ClipInfo = { src: string; fps: number; frames: number; duration: number; marks: Mark[] };
export const CLIP_DATA = clipsData as unknown as Record<string, ClipInfo>;

/** `from`: play only up to this clip time, hold, then jump to v at f (skips a stretch of the recording). */
export type Anchor = { f: number; v: number; lead: number; ff: boolean; from?: number };
/** Shots of one scene share a camera (a cut between them is seamless). */
export type Shot = { id: string; scene: string; clip: string; f0: number; f1: number; anchors: Anchor[]; url: (v: number) => string; cut?: boolean };

/** Clip time shown at film time t. */
export const videoAt = (s: Shot, t: number) => {
  const A = s.anchors;
  const dur = CLIP_DATA[s.clip].duration - 1 / 30;
  if (t <= A[0].f) return A[0].v;
  for (let i = 0; i < A.length - 1; i++) {
    const a = A[i];
    const b = A[i + 1];
    if (t > b.f) continue;
    if (b.from !== undefined) return Math.min(a.v + (t - a.f), b.from);
    const dv = b.v - a.v;
    const df = b.f - a.f;
    if (dv <= 0) return a.v;
    if (dv > df) return a.v + (t - a.f) * (dv / df);
    const hold = Math.max(a.v, b.v - b.lead);
    const tail = b.v - hold;
    if (t < b.f - tail) return Math.min(a.v + (t - a.f), hold);
    return hold + (t - (b.f - tail));
  }
  const last = A[A.length - 1];
  return Math.min(dur, last.v + (t - last.f));
};

/** Playback rate at film time t (1 while playing, 0 while holding, >1 when sped up). */
export const rateAt = (s: Shot, t: number) => {
  const A = s.anchors;
  for (let i = 0; i < A.length - 1; i++) {
    const a = A[i];
    const b = A[i + 1];
    if (t < a.f || t > b.f) continue;
    if (b.from !== undefined) return { rate: 1, ff: false };
    const dv = b.v - a.v;
    const df = b.f - a.f;
    return { rate: dv > df ? dv / df : 1, ff: b.ff };
  }
  return { rate: 1, ff: false };
};

/** First film time at which the shot reaches clip time v (inverse of videoAt). */
export const filmAt = (s: Shot, v: number) => {
  let lo = s.anchors[0].f;
  let hi = s.f1;
  if (videoAt(s, hi) < v - 1e-6) return Infinity;
  for (let k = 0; k < 50; k++) {
    const mid = (lo + hi) / 2;
    if (videoAt(s, mid) >= v - 1e-6) hi = mid;
    else lo = mid;
  }
  return hi;
};

/** The n-th mark of a kind whose label (or text) contains `needle`. */
export const mark = (clip: string, kind: string, needle = "", n = 0): Mark => {
  const all = CLIP_DATA[clip].marks.filter((m) => m.kind === kind && !m.retry && ((m.label ?? "") + (m.text ?? "") + (m.key ?? "")).includes(needle));
  const m = all[n];
  if (!m) throw new Error(`no ${kind} mark "${needle}" #${n} in ${clip}`);
  return m;
};
