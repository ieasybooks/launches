import React from "react";
import { BODY, MONO, TRANSCRIPT } from "../../lib/fonts";
import { clamp, ease, lerp, ramp, rand, spr, useStage, wipe } from "../../lib/motion";
import { voiceBar } from "../../lib/voice";
import { C } from "../../theme";
import transcript from "../../data/transcript.json";
import { Display, Icon, OUTLINE } from "../parts/kit";
import { T } from "../times";

// The first tool: sound in, text out. Bars leave the waveform and become the words of the
// transcript (the film's first line, as the site wrote it).

export const Formats: React.FC<{ size: number; color?: string }> = ({ size, color = C.faint }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.6, direction: "rtl", fontFamily: MONO, fontWeight: 500, fontSize: size, color, letterSpacing: "0.04em" }}>
    <span style={{ direction: "ltr" }}>MP3 · M4A</span>
    <Icon d={OUTLINE.arrowLeft} size={size * 1.05} color={C.gold} stroke={1.8} />
    <span style={{ direction: "ltr" }}>TXT · SRT</span>
  </div>
);

export const Tool: React.FC = () => {
  const { W, P, t } = useStage();
  if (t < T.tool - 0.6 || t > T.upload) return null;
  const exit = ramp(t, T.upload - 0.9, 0.45, ease.in);
  const brow = spr(t, T.first - 0.2, { damping: 18 });
  const title = ramp(t, T.toolName - 0.12, 0.6, ease.linear);
  const titleS = spr(t, T.toolName - 0.12, { damping: 18 });
  const fmt = spr(t, T.toolName + 0.45, { damping: 18 });
  const stage = spr(t, T.tool - 0.25, { damping: 20, stiffness: 110 });

  const n = 22;
  const barW = 10;
  const gap = 9;
  const waveW = n * barW + (n - 1) * gap;
  const L = P
    ? { brow: 430, title: 560, fmt: 740, waveX: W / 2, waveY: 990, arrowX: W / 2, arrowY: 1180, textX: W / 2, textY: 1400, textW: 880, font: 56 }
    : { brow: 165, title: 290, fmt: 468, waveX: 1440, waveY: 720, arrowX: 960, arrowY: 720, textX: 480, textY: 720, textW: 720, font: 54 };

  const reveal = ramp(t, T.toText - 0.05, 1.0, ease.inOut);
  const text = transcript.cues[0].text;

  // particles from the waveform to the writing edge of the text
  const particles = Array.from({ length: 30 }, (_, j) => {
    const t0 = T.toText - 0.3 + j * 0.035;
    const k = clamp((t - t0) / 0.6);
    if (k <= 0 || k >= 1) return null;
    const e = ease.inOut(k);
    const sx = L.waveX + (rand(j) - 0.5) * waveW * 0.9;
    const sy = L.waveY + (rand(j + 50) - 0.5) * 120;
    const front = clamp((t0 + 0.6 - (T.toText - 0.05)) / 1.0);
    const ex = P ? L.textX + L.textW / 2 - front * L.textW + (rand(j + 9) - 0.5) * 60 : L.textX + L.textW / 2 - front * L.textW;
    const ey = L.textY + (rand(j + 99) - 0.5) * (P ? 160 : 140);
    const cx = (sx + ex) / 2;
    const cy = Math.min(sy, ey) - (P ? 40 : 170);
    const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * cx + e * e * ex;
    const y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * cy + e * e * ey;
    const size = lerp(10, 4, e);
    return <div key={j} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: 3, background: j % 3 ? C.green : C.gold, opacity: Math.sin(k * Math.PI) }} />;
  });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exit, transform: `translateY(${-70 * exit}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: L.brow - 26, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: clamp(brow * 1.5), transform: `translateY(${(1 - brow) * 20}px)` }}>
        <svg width={12} height={12} viewBox="0 0 12 12"><path d="M6 0l6 6-6 6-6-6z" fill={C.gold} /></svg>
        <div style={{ fontFamily: BODY, fontSize: P ? 40 : 36, color: C.gold, fontWeight: 600 }}>الأداة الأولى</div>
        <svg width={12} height={12} viewBox="0 0 12 12"><path d="M6 0l6 6-6 6-6-6z" fill={C.gold} /></svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: L.title - 115, display: "flex", justifyContent: "center", transform: `translateY(${(1 - titleS) * 30}px)` }}>
        <Display size={P ? 168 : 170} color={C.green} style={wipe(title)}>
          تفريغ الصوت
        </Display>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: L.fmt - 24, display: "flex", justifyContent: "center", opacity: clamp(fmt * 1.5), transform: `translateY(${(1 - fmt) * 20}px)` }}>
        <Formats size={P ? 40 : 38} />
      </div>

      <div style={{ opacity: clamp(stage * 1.4), transform: `translateY(${(1 - stage) * 50}px)` }}>
        <div style={{ position: "absolute", left: L.waveX - waveW / 2, top: L.waveY - 110 }}>
          <div style={{ display: "flex", alignItems: "center", gap, height: 220, direction: "ltr" }}>
            {Array.from({ length: n }, (_, i) => (
              <div key={i} style={{ width: barW, height: Math.max(barW, voiceBar(t, i, n) * 210 * (1 - 0.8 * reveal)), borderRadius: barW, background: C.green }} />
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: L.arrowX - 40, top: L.arrowY - 40 }}>
          <Icon d={P ? OUTLINE.arrowDown : OUTLINE.arrowLeft} size={80} color={C.gold} stroke={1.4} draw={ramp(t, T.tool - 0.1, 0.6, ease.inOut)} />
        </div>
        <div style={{ position: "absolute", left: L.textX - L.textW / 2, top: L.textY - (P ? 130 : 120), width: L.textW, height: P ? 260 : 240, display: "flex", alignItems: "center" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: P ? 46 : 40, opacity: 1 - reveal }}>
            {[1, 0.85, 0.55].map((w, i) => (
              <div key={i} style={{ height: 16, width: `${w * 100}%`, marginInlineStart: "auto", borderRadius: 8, background: C.goldSoft, alignSelf: "flex-end" }} />
            ))}
          </div>
          <div style={{ position: "relative", fontFamily: TRANSCRIPT, fontSize: L.font, lineHeight: 1.75, color: C.text, direction: "rtl", textAlign: "right", width: "100%", ...wipe(reveal) }}>
            {text}
          </div>
        </div>
      </div>
      {particles}
    </div>
  );
};
