import React from "react";
import { useStage } from "../lib/motion";
import { C } from "../theme";

// Warm paper: a soft vignette, two slow pools of light and a fine grain.
export const Background: React.FC = () => {
  const { W, H, t } = useStage();
  const a = { x: W * (0.28 + 0.05 * Math.sin(t * 0.21)), y: H * (0.3 + 0.06 * Math.cos(t * 0.17)) };
  const b = { x: W * (0.74 + 0.05 * Math.cos(t * 0.19)), y: H * (0.72 + 0.05 * Math.sin(t * 0.23)) };
  const r = Math.max(W, H) * 0.55;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.paper, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${r}px ${r}px at ${a.x}px ${a.y}px, rgba(228, 237, 230, 0.75), transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${r}px ${r}px at ${b.x}px ${b.y}px, rgba(241, 230, 207, 0.7), transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 110% at 50% 45%, transparent 55%, rgba(120, 90, 50, 0.13) 100%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "multiply" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 1.2 -0.1" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </div>
  );
};
