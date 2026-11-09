import React from "react";
import { DISPLAY } from "../../lib/fonts";
import { clamp, ease, lerp, ramp, spr, useStage, wipe } from "../../lib/motion";
import { C } from "../../theme";
import { useFilm } from "../context";
import { Mark } from "../parts/Brand";
import { KineticRows, timeRows } from "../parts/Kinetic";

export const ICON = 120; // the app icon on the phone canvas, in points

// After the hard cut: the question lands word by word, the mark slams in with the name, and then the mark
// becomes the app icon, which is tapped open (the phone takes over from there).
export const Turn: React.FC = () => {
  const { T, W, L, copy, lang, tl } = useFilm();
  const { t, H } = useStage();
  const [a, b] = W.turn;
  if (t < a || t > b) return null;
  const dir = L.rtl ? "rtl" : "ltr";
  const rows = timeRows(copy.question, tl.words("turn1"));
  const qOut = ramp(t, T.brand - 0.14, 0.18, ease.in);
  // the lockup, stacked: mark, name, tagline
  const M = L.P ? 230 : 190;
  const markY = H / 2 - (L.P ? 150 : 120);
  const slam = spr(t, T.brand - 0.06, { damping: 15, stiffness: 230 });
  const nameK = ramp(t, T.name - 0.04, 0.32, ease.out);
  const tag = spr(t, T.name + 0.28, { damping: 18, stiffness: 180 });
  // the mark becomes the app icon
  const m0 = T.brandEnd + 0.04;
  const m1 = T.openWord - 0.12;
  const k = ramp(t, m0, Math.max(0.2, m1 - m0), ease.inOut);
  const words = 1 - ramp(t, m0 - 0.04, 0.2);
  const iconSize = ICON * L.open.s;
  const cy = lerp(markY, L.open.cy, k);
  const size = lerp(M, iconSize * 0.6, k);
  const press = ramp(t, T.openWord - 0.12, 0.08) * (1 - ramp(t, T.openWord - 0.02, 0.18));
  const ripple = ramp(t, T.openWord - 0.08, 0.6, ease.out);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {qOut < 1 && (
        <div style={{ position: "absolute", left: L.P ? 80 : 160, right: L.P ? 80 : 160, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 1 - qOut, transform: `scale(${1 - 0.08 * qOut})` }}>
          <KineticRows rows={rows} size={L.P ? (L.rtl ? 118 : 100) : L.rtl ? 146 : 128} dir={dir} t={t} lineHeight={1.2} />
        </div>
      )}
      {slam > 0.001 && (
        <>
          {/* black icon tile, growing behind the mark */}
          {k > 0 && (
            <div style={{ position: "absolute", left: L.open.cx - (iconSize * k) / 2, top: cy - (iconSize * k) / 2, width: iconSize * k, height: iconSize * k, borderRadius: ICON * 0.225 * L.open.s * k, background: C.screen, transform: `scale(${1 - 0.08 * press})`, boxShadow: `0 30px 60px -25px rgba(46,38,24,${0.55 * k})` }} />
          )}
          <div style={{ position: "absolute", left: L.open.cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: clamp(slam * 2), transform: `scale(${(2.3 - 1.3 * slam) * (1 - 0.08 * press)})` }}>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - k }}><Mark size={size} color={C.ink} /></div>
            {k > 0 && <div style={{ position: "absolute", inset: 0, opacity: k }}><Mark size={size} color={C.text} /></div>}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: markY + M / 2 + (L.P ? 30 : 22), textAlign: "center", opacity: words, direction: dir }}>
            <div style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 500, fontSize: L.P ? 150 : 128, lineHeight: 1.2, color: C.ink, letterSpacing: lang === "en" ? "-0.02em" : 0, ...wipe(nameK, L.rtl ? "rtl" : "ltr") }}>
              {copy.name}
            </div>
            <div style={{ marginTop: L.P ? 16 : 6, fontFamily: DISPLAY, fontWeight: 500, fontSize: L.P ? 60 : 54, color: C.muted, opacity: clamp(tag * 1.4), transform: `translateY(${(1 - tag) * 22}px)` }}>
              {copy.tagline}
            </div>
          </div>
          {ripple > 0 && ripple < 1 && (
            <div style={{ position: "absolute", left: L.open.cx - iconSize * 1.4, top: L.open.cy - iconSize * 1.4, width: iconSize * 2.8, height: iconSize * 2.8, borderRadius: "50%", border: `${3 * (1 - ripple)}px solid ${C.ink}`, transform: `scale(${0.4 + 0.6 * ripple})`, opacity: (1 - ripple) * 0.5 }} />
          )}
        </>
      )}
    </div>
  );
};
