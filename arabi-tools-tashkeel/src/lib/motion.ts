import type React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const FPS = 30;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const ease = {
  out: (x: number) => 1 - Math.pow(1 - x, 3),
  outQuint: (x: number) => 1 - Math.pow(1 - x, 5),
  in: (x: number) => x * x * x,
  inOut: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outBack: (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2),
  linear: (x: number) => x,
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
