import React from "react";
import { DISPLAY } from "../../lib/fonts";
import { clamp, ease, ramp, spr, useStage } from "../../lib/motion";
import { C } from "../../theme";
import { useFilm } from "../context";
import { Icon, type IconName } from "../parts/icons";

// Free, no account, nothing to install, on desktop and mobile: four lines, each landing on its word, as the phone leaves.
const ICONS: IconName[] = ["gift", "userX", "puzzle", "devices"];

export const Free: React.FC = () => {
  const { T, W: win, L, copy, dir } = useFilm();
  const { t, W, H } = useStage();
  const [a, b] = win.free;
  if (t < a || t > b) return null;
  const u = L.u;
  const rowH = 190 * u;
  const top = H * 0.5 - (copy.free.length * rowH) / 2;
  const out = ramp(t, T.outro - 0.05, 0.45, ease.inOut);
  return (
    <div style={{ position: "absolute", inset: 0, direction: dir, opacity: 1 - out }}>
      {copy.free.map((f, i) => {
        const at = T.free[i] - 0.12;
        const k = spr(t, at, { stiffness: 230, damping: 17 });
        const o = clamp(ramp(t, at, 0.16));
        return (
          <div key={i} style={{ position: "absolute", left: (W - 920 * u) / 2, width: 920 * u, top: top + i * rowH, height: rowH, display: "flex", alignItems: "center", gap: 40 * u, opacity: o, transform: `translateY(${(1 - k) * 40 * u - out * 30 * u}px)` }}>
            <div style={{ width: 120 * u, height: 120 * u, borderRadius: 60 * u, background: C.ink, display: "grid", placeItems: "center", flex: "none", transform: `scale(${0.6 + 0.4 * k})` }}>
              <Icon name={ICONS[i]} size={60 * u} color={C.paper} stroke={1.9} />
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 72 * u, lineHeight: L.lh, color: C.ink, letterSpacing: dir === "ltr" ? "-0.025em" : 0 }}>{f.text}</div>
          </div>
        );
      })}
    </div>
  );
};
