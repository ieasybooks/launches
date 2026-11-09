import React from "react";
import { useStage } from "../lib/motion";
import { C } from "../theme";

// Ivory paper with a slow pool of light and fine grain.
export const Background: React.FC = () => {
  const { W, H, t } = useStage();
  const a = { x: W * (0.3 + 0.06 * Math.sin(t * 0.19)), y: H * (0.32 + 0.05 * Math.cos(t * 0.15)) };
  const r = Math.max(W, H) * 0.6;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.paper, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${r}px ${r}px at ${a.x}px ${a.y}px, rgba(255, 253, 247, 0.85), transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 110% at 50% 45%, transparent 58%, rgba(90, 76, 52, 0.12) 100%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.06, mixBlendMode: "multiply" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={5} stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.22  0 0 0 0 0.16  0 0 0 1.2 -0.1" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </div>
  );
};
