import { WIN_H, WIN_W } from "../ui/theme";

/** Landscape stage: the browser on the left, the step guide on the right (1920 × 1080). */
export const W = 1920;
export const H = 1080;
const S = 0.93;
export const WIN = { x: 70, y: (H - WIN_H * S) / 2, s: S, w: WIN_W * S, h: WIN_H * S };
export const PANEL = { x: WIN.x + WIN.w + 58, y: 120, w: W - (WIN.x + WIN.w + 58) - 72, h: H - 240 };
