import voice from "../data/voice.json";
import { clamp } from "./motion";

// Per-frame loudness and 16-band spectrum of the narration (scripts/voice_track.py).
const V = voice as { fps: number; env: number[]; bands: number[][] };
const BANDS = V.bands[0].length;

const at = (series: (i: number) => number, t: number) => {
  const f = t * V.fps;
  const i = Math.floor(f);
  const k = f - i;
  const get = (j: number) => (j >= 0 && j < V.env.length ? series(j) : 0);
  return get(i) * (1 - k) + get(i + 1) * k;
};

export const loudness = (t: number) => at((i) => V.env[i], t);

/** Height (0–1) of bar `i` of `n` in a waveform that radiates from its centre with the voice. */
export const voiceBar = (t: number, i: number, n: number) => {
  const d = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2);
  const lag = d * 0.12;
  const band = Math.min(BANDS - 1, Math.floor(d * (BANDS - 1) * 0.85 + ((i * 7) % 3)));
  const spectrum = at((j) => V.bands[j][band], t - lag);
  const level = at((j) => V.env[j], t - lag);
  const shape = Math.cos(d * Math.PI * 0.42);
  const idle = 0.07 + 0.035 * Math.sin(t * 2.4 + i * 0.7) + 0.02 * Math.sin(t * 5.1 + i * 1.9);
  return clamp(Math.max(idle, (0.25 * spectrum + 0.75 * spectrum * clamp(level * 1.4)) * shape * 1.15), 0, 1);
};

/** A fixed, natural-looking waveform shape for an audio file (no voice). */
export const fileWave = (seed: number, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const s = Math.sin(i * 0.9 + seed) * 0.5 + Math.sin(i * 0.37 + seed * 2.1) * 0.35 + Math.sin(i * 2.3 + seed * 0.7) * 0.25;
    return clamp(0.3 + 0.5 * Math.abs(s), 0.12, 1);
  });
