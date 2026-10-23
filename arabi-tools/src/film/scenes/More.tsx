import React from "react";
import { BODY } from "../../lib/fonts";
import { clamp, ease, lerp, ramp, spr, useStage } from "../../lib/motion";
import { C } from "../../theme";
import { Display, Icon, OUTLINE, Panel, SOLID } from "../parts/kit";
import { T } from "../times";
import { Formats } from "./Tool";

// The first tool takes its place in a grid that fills with tools to come.

export const More: React.FC = () => {
  const { W, P, t } = useStage();
  if (t < T.more - 0.6 || t > T.outro + 0.2) return null;
  const cols = P ? 2 : 4;
  const rows = P ? 4 : 2;
  const tw = P ? 450 : 390;
  const th = P ? 250 : 230;
  const gap = P ? 30 : 34;
  const gw = cols * tw + (cols - 1) * gap;
  const gh = rows * th + (rows - 1) * gap;
  const gx = (W - gw) / 2;
  const gy = P ? 470 : 330;
  const slot = (i: number) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    return { x: gx + gw - (c + 1) * tw - c * gap, y: gy + r * (th + gap), c, r };
  };

  const end = ramp(t, T.outro - 0.65, 0.55, ease.in);
  const head = spr(t, T.moreTools - 0.15, { damping: 20 });
  const first = spr(t, T.more - 0.38, { damping: 16, stiffness: 120 });
  const place = spr(t, T.start - 0.2, { damping: 19, stiffness: 100 });
  const s0 = slot(0);
  const big = P ? 1.7 : 1.6;
  const fx = lerp(W / 2 - tw / 2, s0.x, place);
  const fy = lerp(gy + gh / 2 - th / 2, s0.y, place);
  const shimmer = ramp(t, T.way - 0.35, 1.1, ease.inOut);

  const toCentre = (x: number, y: number) => ({ dx: (W / 2 - (x + tw / 2)) * end, dy: (gy + gh / 2 - (y + th / 2)) * end });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - ramp(t, T.outro - 0.3, 0.35) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: gy - (P ? 150 : 135), display: "flex", justifyContent: "center", opacity: clamp(head * 1.5) * (1 - end), transform: `translateY(${(1 - head) * 30}px)` }}>
        <Display size={P ? 76 : 70}>المزيد من الأدوات قريبًا</Display>
      </div>
      {Array.from({ length: cols * rows - 1 }, (_, k) => {
        const i = k + 1;
        const p = slot(i);
        const dist = p.c + p.r;
        const s = spr(t, T.moreTools - 0.12 + dist * 0.07 + k * 0.015, { damping: 15, stiffness: 140 });
        if (s <= 0) return null;
        const band = clamp(1 - Math.abs(shimmer * (cols + rows + 1) - dist - 0.5));
        const c = toCentre(p.x, p.y);
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: p.x + c.dx, top: p.y + c.dy, width: tw, height: th, borderRadius: 28,
              border: `2px dashed rgba(164, 130, 74, ${0.55 + 0.4 * band})`, background: `rgba(255, 252, 245, ${0.35 + 0.4 * band})`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, direction: "rtl",
              opacity: clamp(s * 1.5) * (1 - end), transform: `scale(${(0.85 + 0.15 * s) * (1 - 0.4 * end)})`,
            }}
          >
            <Icon d={OUTLINE.sparkles} size={46} color={C.gold} stroke={1.4} style={{ transform: `scale(${1 + 0.15 * band}) rotate(${band * 12}deg)` }} />
            <div style={{ fontFamily: BODY, fontSize: 32, color: C.faint }}>قريبًا</div>
          </div>
        );
      })}
      {first > 0 && (() => {
        const c = toCentre(fx, fy);
        return (
          <div style={{ position: "absolute", left: fx + c.dx, top: fy + c.dy, width: tw, height: th, opacity: clamp(first * 1.5) * (1 - end), transform: `scale(${lerp(big, 1, place) * (0.9 + 0.1 * first) * (1 - 0.4 * end)})`, zIndex: 2 }}>
            <Panel radius={28} style={{ width: "100%", height: "100%", padding: "26px 30px", direction: "rtl", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <Display size={52} color={C.green}>تفريغ الصوت</Display>
                <div style={{ marginTop: 4 }}>
                  <Formats size={22} />
                </div>
              </div>
              <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 14px", borderRadius: 999, background: C.greenSoft, color: C.green, fontFamily: BODY, fontSize: 24, fontWeight: 600 }}>
                <Icon d={SOLID.check} solid size={24} color={C.green} />
                متاحة الآن
              </div>
            </Panel>
          </div>
        );
      })()}
    </div>
  );
};
