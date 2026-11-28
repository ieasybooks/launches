import type React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const FPS = 60;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const ease = {
  out: (x: number) => 1 - Math.pow(1 - x, 3),
  outQuint: (x: number) => 1 - Math.pow(1 - x, 5),
  outQuad: (x: number) => 1 - (1 - x) * (1 - x),
  in: (x: number) => x * x * x,
  inOut: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outBack: (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2),
  linear: (x: number) => x,
  // gentle at both ends, and never fast in the middle: for long camera moves
  inOutSine: (x: number) => (1 - Math.cos(Math.PI * x)) / 2,
};

/** A CSS cubic-bezier(x1, y1, x2, y2) timing function. */
export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  const at = (a: number, b: number, s: number) => 3 * a * s * (1 - s) * (1 - s) + 3 * b * s * s * (1 - s) + s * s * s;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
};

/** 0 → 1 between `start` and `start + dur`, shaped by `fn`. */
export const ramp = (t: number, start: number, dur: number, fn = ease.out) => fn(clamp((t - start) / dur));

/** A spring that starts at `start` (0 before it). */
export const spr = (t: number, start: number, config: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  t <= start ? 0 : spring({ frame: (t - start) * FPS, fps: FPS, config: { damping: 16, stiffness: 150, mass: 1, ...config } });

/** Visibility of something that fades in at `a` and out at `b`. */
export const life = (t: number, a: number, b: number, fin = 0.4, fout = 0.4) =>
  Math.min(ramp(t, a, fin, ease.inOut), 1 - ramp(t, b - fout, fout, ease.inOut));

/** A damped horizontal shake ("no"), in pixels. */
export const shake = (t: number, start: number, amp = 14, dur = 0.45) => {
  if (t < start || t > start + dur) return 0;
  const k = (t - start) / dur;
  return Math.sin(k * Math.PI * 6) * amp * (1 - k);
};

/** Deterministic pseudo-random numbers in [0, 1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const useStage = () => {
  const { width: W, height: H, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  return { W, H, P: H > W, t: frame / fps, frame };
};

/** A soft-edged reveal that runs the way Arabic is read (right to left), as a style. */
export const wipe = (k: number, dir: "rtl" | "ltr" | "down" = "rtl"): React.CSSProperties => {
  if (k >= 1) return {};
  const p = k * 125 - 15;
  const to = dir === "rtl" ? "to left" : dir === "ltr" ? "to right" : "to bottom";
  const m = `linear-gradient(${to}, #000 ${p}%, transparent ${p + 15}%)`;
  return { WebkitMaskImage: m, maskImage: m };
};

type Ease = (x: number) => number;
/** Values that move from key to key: each key's values are reached over [at, at + dur], shaped by the key's own `fn`
 *  or the track's. Keys are in time order. */
export const track = <K extends Record<string, number>>(t: number, keys: ({ at: number; dur: number; fn?: Ease } & K)[], fn: Ease = ease.inOut): K => {
  const out: Record<string, number> = {};
  for (const [name, v] of Object.entries(keys[0])) if (typeof v === "number") out[name] = v;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    const p = ramp(t, k.at, k.dur, k.fn ?? fn);
    if (p <= 0) break;
    for (const [name, v] of Object.entries(k)) if (name !== "at" && name !== "dur" && typeof v === "number") out[name] = lerp(out[name], v, p);
  }
  return out as K;
};

/** A soft settle for things that pop in: 0 → 1 with a small overshoot. */
export const pop = (t: number, at: number, stiffness = 260, damping = 15) => spr(t, at, { stiffness, damping });
