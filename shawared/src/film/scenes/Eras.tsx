import React from "react";
import { UI, UI_MEDIUM, VERSE_BOLD } from "../../lib/fonts";
import { clamp, ease, ramp, useStage } from "../../lib/motion";
import { DAY } from "../../theme";
import { useFilm } from "../context";
import { Diamond } from "../parts/Brand";

// Fifteen centuries in one column: the eras of Arabic poetry with poets from the library, from Imru' al-Qays at
// the top to Ahmad Shawqi at the bottom. A saffron thread runs down them between the two spoken names.
export const Eras: React.FC = () => {
  const { T, W, L, copy, lang, dir } = useFilm();
  const { t } = useStage();
  const [a, b] = W.eras;
  if (t < a || t > b + 0.4) return null;
  const rtl = lang === "ar";
  const vis = ramp(t, a, 0.35) * (1 - ramp(t, b - 0.3, 0.4));
  const eras = copy.eras;
  const n = eras.length;
  // 16:9: one line per era (the era, then its poets), the block centred in the frame
  const wide = L.wide;
  const blockW = rtl ? 1000 : 1340; // the thread to the end of the longest line
  const top = L.tall ? 330 : wide ? 98 : 120;
  const rowH = L.tall ? 202 : wide ? 150 : 186;
  const lineX = wide ? (rtl ? (L.W + blockW) / 2 : (L.W - blockW) / 2) : rtl ? (L.tall ? 870 : 900) : L.tall ? 210 : 180;
  const eraW = rtl ? 270 : 250;
  // the thread runs from the first era (on «امرئ القيس») to the last (on «أحمد شوقي»)
  const run = ramp(t, T.imru - 0.15, Math.max(0.6, T.shawqi - T.imru + 0.1), ease.inOut);
  const head = top + 40 + run * (n - 1) * rowH;
  const firstName = 0;
  const lastName = eras[n - 1].poets.length - 1;
  const sep = L.tall ? 12 : 11;
  const sepGap = L.tall ? 20 : wide ? 18 : 16;
  const nameSize = L.tall ? (rtl ? 52 : 42) : wide ? (rtl ? 48 : 36) : rtl ? 46 : 37;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: vis }}>
      {/* the thread */}
      <div style={{ position: "absolute", left: lineX - 1.5, top: top + 40, width: 3, height: (n - 1) * rowH, background: DAY.line2, borderRadius: 2 }} />
      <div style={{ position: "absolute", left: lineX - 1.5, top: top + 40, width: 3, height: head - top - 40, background: DAY.accent, borderRadius: 2 }} />
      {eras.map((e, i) => {
        const y = top + i * rowH;
        const reached = clamp((head - (y + 40)) / 60 + 1);
        const k = Math.max(i === 0 ? ramp(t, a + 0.1, 0.4) : 0, ramp(reached, 0, 1));
        return (
          <div key={i} style={{ position: "absolute", top: y, left: 0, right: 0, height: rowH }}>
            <Diamond cx={lineX} cy={40} r={14} color={k > 0.5 ? DAY.accent : DAY.line2} style={{ transform: `scale(${0.8 + 0.2 * k})` }} />
            <div style={{
              position: "absolute", direction: dir, textAlign: rtl ? "right" : "left", opacity: 0.35 + 0.65 * k,
              ...(wide ? { top: 0, height: 80, display: "flex", alignItems: "center" } : { top: 8 }),
              ...(rtl ? { right: L.W - lineX + 50, left: 60 } : { left: lineX + 50, right: 60 }),
            }}>
              <div style={{ fontFamily: UI_MEDIUM, fontSize: L.tall ? 34 : wide ? 32 : 30, color: DAY.muted, lineHeight: 1.2, ...(wide ? { width: eraW, flex: "none" } : {}) }}>{e.era}</div>
              {/* the names, apart: a small diamond between each two, and air under the era's name */}
              <div style={{ display: "flex", flexWrap: wide ? "nowrap" : "wrap", alignItems: "center", rowGap: 0, marginTop: wide ? 0 : L.tall ? (rtl ? 16 : 22) : rtl ? 12 : 18 }}>
                {e.poets.map((p, j) => {
                  const spoken = (i === 0 && j === firstName && t >= T.imru - 0.05) || (i === n - 1 && j === lastName && t >= T.shawqi - 0.05);
                  return (
                    <React.Fragment key={j}>
                      {j > 0 && (
                        <svg width={sep} height={sep} viewBox="-1 -1 2 2" style={{ flex: "none", margin: `0 ${sepGap}px`, transform: `translateY(${rtl ? sep * 0.35 : 0}px)` }}>
                          <path d="M0 -1L1 0L0 1L-1 0Z" fill={DAY.accent} fillOpacity={0.6} />
                        </svg>
                      )}
                      <span style={{ fontFamily: rtl ? VERSE_BOLD : UI_MEDIUM, fontSize: nameSize, lineHeight: rtl ? 1.55 : 1.35, color: spoken ? DAY.accent : DAY.fg, whiteSpace: "nowrap" }}>
                        {p}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ display: "none", fontFamily: UI }} />
    </div>
  );
};
