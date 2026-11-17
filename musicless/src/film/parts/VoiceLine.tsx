import React from "react";
import { ease, ramp } from "../../lib/motion";

/** One line of speech across the frame: the voice that stays when the music's staff is gone. It opens from the
 *  middle outwards at `at`, and moves like words: bursts and short gaps. */
export const VoiceLine: React.FC<{ t: number; y: number; width: number; u: number; at: number; color: string; fade?: number; amp?: number }> = ({
  t, y, width, u, at, color, fade = 0, amp = 46,
}) => {
  if (t < at) return null;
  const open = ramp(t, at, 0.7, ease.inOut);
  const N = 220;
  const half = width / 2;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * width;
    const d = Math.abs(x - half) / half;
    if (d > open) continue;
    const edge = Math.min(1, (open - d) * 6) * Math.min(1, (1 - d) * 5);
    // words: bursts that drift past, with gaps between them
    const words = Math.max(0, Math.sin(x / (95 * u) - t * 4.1) * 0.6 + Math.sin(x / (41 * u) + t * 2.3) * 0.25 + 0.35);
    const phrase = 0.55 + 0.45 * Math.sin(x / (420 * u) - t * 1.4);
    const a = amp * u * edge * words * phrase;
    const yy = y + Math.sin(x / (7.5 * u) + t * 26) * a;
    pts.push(`${x.toFixed(1)},${yy.toFixed(1)}`);
  }
  if (pts.length < 2) return null;
  return (
    <svg width={width} height={y * 2} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - fade }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={3.2 * u} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};
