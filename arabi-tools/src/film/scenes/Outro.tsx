import React from "react";
import { BODY } from "../../lib/fonts";
import { clamp, ease, ramp, spr, useStage, wipe } from "../../lib/motion";
import { C } from "../../theme";
import { Logo } from "../parts/Logo";
import { Display, Icon, OUTLINE, Ornament, Ripple } from "../parts/kit";
import { T } from "../times";

// The end card: logo, name, the address to visit, and the initiative behind it.

export const Outro: React.FC = () => {
  const { W, P, t } = useStage();
  if (t < T.outro - 0.7) return null;
  const L = P
    ? { logoY: 560, logo: 230, titleY: 800, title: 150, tagY: 958, tag: 46, ornY: 1045, ctaY: 1200, cta: 64, footY: 1720, foot: 32 }
    : { logoY: 245, logo: 170, titleY: 435, title: 132, tagY: 575, tag: 40, ornY: 650, ctaY: 785, cta: 58, footY: 975, foot: 28 };
  const logo = spr(t, T.outro - 0.55, { damping: 13, stiffness: 120 });
  const glyph = ramp(t, T.outro - 0.4, 0.55, ease.inOut);
  const diamond = spr(t, T.outro + 0.05, { damping: 10, stiffness: 170 });
  const title = ramp(t, T.outro - 0.1, 0.7, ease.linear);
  const titleS = spr(t, T.outro - 0.1, { damping: 20 });
  const tag = spr(t, T.outro + 0.55, { damping: 20 });
  const orn = ramp(t, T.outro + 0.7, 0.9, ease.inOut);
  const cta = spr(t, T.tryIt - 0.2, { damping: 14, stiffness: 130 });
  const pressAt = T.tryIt + 0.45;
  const press = ramp(t, pressAt, 0.08) * (1 - ramp(t, pressAt + 0.1, 0.25));
  const foot = spr(t, T.outroEnd + 0.15, { damping: 20 });
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: W / 2 - L.logo / 2, top: L.logoY - L.logo / 2, transform: `scale(${0.6 + 0.4 * logo})`, opacity: clamp(logo * 2) }}>
        <Logo size={L.logo} glyph={glyph} diamond={diamond} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: L.titleY - L.title * 0.68, display: "flex", justifyContent: "center", transform: `translateY(${(1 - titleS) * 26}px)` }}>
        <Display size={L.title} style={wipe(title)}>
          أدوات العربية
        </Display>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: L.tagY - L.tag * 0.75, textAlign: "center", direction: "rtl", fontFamily: BODY, fontSize: L.tag, color: C.muted, opacity: clamp(tag * 1.5), transform: `translateY(${(1 - tag) * 20}px)` }}>
        أدوات مجانية للغة العربية
      </div>
      <div style={{ position: "absolute", left: W / 2 - 170, top: L.ornY - 7 }}>
        <Ornament width={340} draw={orn} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: L.ctaY - L.cta, display: "flex", justifyContent: "center", opacity: clamp(cta * 1.5), transform: `translateY(${(1 - cta) * 40}px) scale(${(0.9 + 0.1 * cta) * (1 - 0.04 * press)})` }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: L.cta * 0.4, direction: "rtl", padding: `${L.cta * 0.36}px ${L.cta * 0.9}px`, borderRadius: 999,
            background: C.green, color: C.paper, boxShadow: "0 24px 50px -22px rgba(31, 92, 73, 0.75)",
          }}
        >
          <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: L.cta, letterSpacing: "-0.01em", direction: "ltr" }}>arabi.tools</span>
          <Icon d={OUTLINE.arrowLeft} size={L.cta * 0.8} color={C.paper} stroke={2} />
        </div>
      </div>
      <Ripple x={W / 2} y={L.ctaY} k={ramp(t, pressAt, 0.8, ease.out)} size={P ? 760 : 680} />
      <div style={{ position: "absolute", left: 0, right: 0, top: L.footY - L.foot, textAlign: "center", direction: "rtl", fontFamily: BODY, fontSize: L.foot, color: C.faint, opacity: clamp(foot * 1.5) }}>
        مشروع من مبادرة <span style={{ color: C.green, fontWeight: 600 }}>الكتب الميسّرة</span>
      </div>
    </div>
  );
};
