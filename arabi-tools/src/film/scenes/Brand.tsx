import React from "react";
import { BODY } from "../../lib/fonts";
import { clamp, ease, lerp, ramp, spr, useStage, wipe } from "../../lib/motion";
import { C } from "../../theme";
import { Logo } from "../parts/Logo";
import { Display, Ornament } from "../parts/kit";
import { T } from "../times";
import { waveGeometry } from "./Hook";

// The waveform's block becomes the logo tile; the name follows, then what the site is and who it is for.

const PEOPLE = ["طلاب العلم", "المشايخ", "المعلّمون", "الباحثون", "الدعاة", "الخطباء"];

export const brandLayout = (P: boolean) =>
  P
    ? { logoY: 760, logo: 240, titleY: 1010, title: 156, urlY: 1140, url: 58, ornY: 1225, dy: -300, sc: 0.74 }
    : { logoY: 270, logo: 190, titleY: 480, title: 150, urlY: 612, url: 52, ornY: 692, dy: -150, sc: 0.72 };

export const Brand: React.FC = () => {
  const { W, P, t } = useStage();
  const g = waveGeometry(W, P);
  const start = T.collapse + 0.5;
  if (t < start || t > T.tool) return null;
  const L = brandLayout(P);

  const glyph = ramp(t, start + 0.12, 0.6, ease.inOut);
  const diamond = spr(t, start + 0.6, { damping: 10, stiffness: 170 });
  const move = spr(t, T.name - 0.35, { damping: 19, stiffness: 105 });
  const logoSize = lerp(g.tile, L.logo, move);
  const logoY = lerp(g.cy, L.logoY, move);
  const pop = 1 + 0.07 * Math.sin(clamp((t - start) / 0.4) * Math.PI);

  const title = ramp(t, T.name - 0.12, 0.75, ease.linear);
  const titleRise = spr(t, T.name - 0.12, { damping: 20, stiffness: 120 });
  const url = spr(t, T.nameEnd - 0.15, { damping: 20 });
  const orn = ramp(t, T.nameEnd + 0.05, 0.9, ease.inOut);

  const up = spr(t, T.brand2 - 0.4, { damping: 21, stiffness: 95 });
  const exit = ramp(t, T.tool - 0.62, 0.5, ease.in);

  const word = (at: number) => ({ s: spr(t, at - 0.12, { damping: 15, stiffness: 140 }), line: ramp(t, at + 0.15, 0.5, ease.inOut) });
  const words = [
    { text: "بسيطة", ...word(T.simple) },
    { text: "مجانية", ...word(T.free0) },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exit, transform: `translateY(${-90 * exit}px)` }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${W / 2}px ${L.logoY}px`, transform: `translateY(${L.dy * up}px) scale(${lerp(1, L.sc, up)})` }}>
        <div style={{ position: "absolute", left: g.cx - logoSize / 2, top: logoY - logoSize / 2, transform: `scale(${pop})` }}>
          <Logo size={logoSize} glyph={glyph} diamond={diamond} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: L.titleY - L.title * 0.68, display: "flex", justifyContent: "center", transform: `translateY(${(1 - titleRise) * 30}px)` }}>
          <Display size={L.title} style={wipe(title)}>
            أدوات العربية
          </Display>
        </div>
        <div
          style={{
            position: "absolute", left: 0, right: 0, top: L.urlY - L.url * 0.6, textAlign: "center", fontFamily: BODY, fontWeight: 500,
            fontSize: L.url, color: C.muted, letterSpacing: "-0.01em", opacity: clamp(url * 1.4), transform: `translateY(${(1 - url) * 24}px)`,
          }}
        >
          arabi.tools
        </div>
        <div style={{ position: "absolute", left: W / 2 - 170, top: L.ornY - 7 }}>
          <Ornament width={340} draw={orn} />
        </div>
      </div>

      <div
        style={{
          position: "absolute", left: 0, right: 0, top: P ? 880 : 520, display: "flex", flexDirection: P ? "column" : "row",
          alignItems: "center", justifyContent: "center", gap: P ? 10 : 120, direction: "rtl",
        }}
      >
        {words.map((w, i) => (
          <div key={i} style={{ position: "relative", opacity: clamp(w.s * 1.5), transform: `translateY(${(1 - w.s) * 60}px) scale(${0.94 + 0.06 * w.s})` }}>
            <Display size={P ? 150 : 140} color={C.green}>
              {w.text}
            </Display>
            <svg width="100%" height={16} style={{ position: "absolute", left: 0, bottom: P ? 14 : 10, overflow: "visible" }} viewBox="0 0 100 16" preserveAspectRatio="none">
              <path d="M100 8 C 70 3, 30 13, 0 7" stroke={C.gold} strokeWidth={3.2} fill="none" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - w.line} strokeLinecap="round" />
            </svg>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute", left: P ? 90 : 120, right: P ? 90 : 120, top: P ? 1370 : 790, display: "flex", flexWrap: "wrap",
          justifyContent: "center", gap: P ? "22px 20px" : 20, direction: "rtl",
        }}
      >
        {PEOPLE.map((p, i) => {
          const s = spr(t, T.everyone - 0.1 + i * 0.09, { damping: 15, stiffness: 150 });
          return (
            <div
              key={p}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: P ? "16px 34px" : "14px 30px", borderRadius: 999,
                background: C.surface, boxShadow: `inset 0 0 0 1.5px ${C.line}, 0 10px 24px -14px rgba(74,52,30,0.35)`,
                fontFamily: BODY, fontSize: P ? 38 : 32, color: C.text, fontWeight: 500,
                opacity: clamp(s * 1.6), transform: `translateY(${(1 - s) * 40}px) scale(${0.9 + 0.1 * s})`,
              }}
            >
              <svg width={14} height={14} viewBox="0 0 12 12">
                <path d="M6 0l6 6-6 6-6-6z" fill={C.gold} />
              </svg>
              {p}
            </div>
          );
        })}
      </div>
    </div>
  );
};
