import React from "react";
import { ease, ramp } from "../../lib/motion";

/** A new sheet rising over the last scene from the bottom, its top corners rounding off as it settles. */
export const Rise: React.FC<{ t: number; at: number; color: string; children: React.ReactNode; H: number; u: number }> = ({ t, at, color, children, H, u }) => {
  const k = ramp(t, at, 0.6, ease.inOut);
  const r = (1 - k) * 80 * u;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: (1 - k) * H, height: H, background: color, borderRadius: `${r}px ${r}px 0 0`, overflow: "hidden" }}>
      {children}
    </div>
  );
};
