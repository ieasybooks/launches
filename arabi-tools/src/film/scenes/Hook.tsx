import React from "react";
import { BODY } from "../../lib/fonts";
import { clamp, ease, lerp, life, ramp, shake, spr, useStage, wipe } from "../../lib/motion";
import { fileWave, voiceBar } from "../../lib/voice";
import { C } from "../../theme";
import { Display, FileCard, Icon, OUTLINE, Panel } from "../parts/kit";
import { T } from "../times";

// Recordings: lessons, lectures and interviews that can't be searched or quoted. The narrator's
// own voice drives the waveform, which finally gathers into the logo's tile.

export const waveGeometry = (W: number, P: boolean) => {
  const n = P ? 34 : 54;
  const barW = 12;
  const gap = P ? 11 : 10;
  return { n, barW, gap, maxH: 300, cx: W / 2, cy: P ? 1250 : 600, width: n * barW + (n - 1) * gap, tile: P ? 300 : 260 };
};

const CARDS = [
  { name: "درس في النحو", meta: "MP3 · 1:12:40", at: () => T.lesson, seed: 1.3 },
  { name: "محاضرة في السيرة", meta: "M4A · 2:05:13", at: () => T.lecture, seed: 4.1 },
  { name: "حوار مع الشيخ", meta: "MP3 · 0:48:09", at: () => T.interview, seed: 7.7 },
];

const QUERY = "المفعول به";

export const Hook: React.FC = () => {
  const { W, H, P, t } = useStage();
  if (t > T.collapse + 0.75) return null;
  const g = waveGeometry(W, P);
  const col = ramp(t, T.collapse, 0.55, ease.inOut);
  const mid = (g.n - 1) / 2;

  // Quoting: a highlighted stretch of the waveform between two marks that can't close on it.
  const hlW = (P ? 12 : 16) * (g.barW + g.gap) + 30;
  const quoteIn = spr(t, T.quote - 0.12, { damping: 13, stiffness: 120 });
  const quoteLife = life(t, T.quote - 0.15, T.collapse + 0.05, 0.25, 0.3);
  const quoteShake = shake(t, T.quote + 0.72, 12, 0.45);
  const markSize = P ? 120 : 140;

  // Waveform → solid block the size of the logo tile.
  const bars = Array.from({ length: g.n }, (_, i) => {
    const d = Math.abs(i - mid) / mid;
    const grow = ramp(t, T.waveIn + d * 0.7, 0.55, ease.outBack);
    const h = voiceBar(t, i, g.n) * g.maxH * grow;
    const slot = g.tile / g.n;
    const x = g.cx + (i - mid) * lerp(g.barW + g.gap, slot, col);
    const w = lerp(g.barW, slot + 1.5, col);
    // bars outside the quoted stretch step back so the marks stand in clear space
    const outside = Math.abs(x - g.cx) > hlW / 2 - 8 ? quoteLife : 0;
    const height = lerp(Math.max(g.barW * grow, h * (1 - 0.55 * outside)), g.tile, col);
    return { x, w, height, radius: lerp(g.barW / 2, 0, col), opacity: clamp(grow * 3) * (1 - 0.82 * outside) };
  });
  const blockFade = 1 - ramp(t, T.collapse + 0.5, 0.2);

  // The frame that closes around the recording ("حبيسة الصوت").
  const frameW = g.width + 110;
  const frameH = g.maxH + 90;
  const perimeter = 2 * (frameW + frameH);
  const frameDraw = ramp(t, T.trapped - 0.05, 0.85, ease.inOut);
  const frameLife = life(t, T.trapped - 0.1, T.search - 0.1, 0.2, 0.35);

  const cardW = P ? 820 : 540;
  const cardScale = P ? 1.15 : 1.1;
  const cardPos = (i: number) => (P ? { x: g.cx, y: 430 + i * 235 } : { x: [1550, 960, 370][i], y: 255 });

  // Search, then quoting: neither works on sound.
  const pill = spr(t, T.search - 0.5, { damping: 15 });
  const pillOut = ramp(t, T.quote - 0.3, 0.35, ease.in);
  const typed = Math.round(clamp((t - (T.search - 0.1)) / 0.6) * QUERY.length);
  const typedEnd = T.search + 0.5;
  const noResult = spr(t, typedEnd + 0.1, { damping: 18 });
  const pillY = P ? 720 : 250;
  const pillW = P ? 860 : 800;


  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* highlight behind the "quoted" part of the waveform */}
      <div
        style={{
          position: "absolute", left: g.cx - hlW / 2, top: g.cy - (g.maxH + 40) / 2, width: hlW, height: g.maxH + 40,
          borderRadius: 22, background: C.goldSoft, opacity: quoteLife * 0.9, transform: `scaleX(${quoteIn})`,
        }}
      />
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute", left: b.x - b.w / 2, top: g.cy - b.height / 2, width: b.w, height: b.height,
            borderRadius: b.radius, background: C.green, opacity: b.opacity * blockFade,
          }}
        />
      ))}

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: frameLife }}>
        <rect
          x={g.cx - frameW / 2} y={g.cy - frameH / 2} width={frameW} height={frameH} rx={40}
          fill="none" stroke={C.gold} strokeWidth={2.5} strokeDasharray={perimeter} strokeDashoffset={perimeter * (1 - frameDraw)}
        />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: g.cy + frameH / 2 + (P ? 70 : 40), display: "flex", justifyContent: "center", opacity: frameLife }}>
        <Display size={P ? 104 : 92} style={wipe(ramp(t, T.trapped - 0.05, 0.7, ease.linear))}>
          حبيسةُ الصوت
        </Display>
      </div>

      {CARDS.map((c, i) => {
        const at = c.at();
        const s = spr(t, at - 0.15, { damping: 14, stiffness: 130 });
        const out = ramp(t, T.hook2 - 0.45 + i * 0.07, 0.5, ease.in);
        if (s <= 0 || out >= 1) return null;
        const p = cardPos(i);
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: p.x - cardW / 2, top: p.y - 100 * cardScale, width: cardW,
              opacity: clamp(s * 1.6) * (1 - out),
              transform: `translateY(${(1 - s) * 70 - out * 140 + Math.sin(t * 1.3 + i * 2) * 5}px) scale(${0.9 + 0.1 * s})`,
            }}
          >
            <FileCard name={c.name} meta={c.meta} width={cardW} scale={cardScale} heights={fileWave(c.seed, P ? 64 : 40)} play={ramp(t, at, 9, ease.linear)} />
          </div>
        );
      })}

      {pill > 0 && pillOut < 1 && (
        <div style={{ position: "absolute", left: g.cx - pillW / 2, top: pillY - 52, width: pillW, opacity: clamp(pill * 1.5) * (1 - pillOut), transform: `translateY(${(1 - pill) * 40 - pillOut * 60}px)` }}>
          <div style={{ transform: `translateX(${shake(t, typedEnd + 0.18, 16, 0.5)}px)` }}>
            <Panel radius={52} style={{ height: 104, display: "flex", alignItems: "center", gap: 22, padding: "0 38px", direction: "rtl" }}>
              <Icon d={OUTLINE.search} size={44} color={C.gold} stroke={1.8} />
              <div style={{ fontFamily: BODY, fontSize: 40, color: typed ? C.text : C.faint, fontWeight: 500 }}>
                {typed ? QUERY.slice(0, typed) : "ابحث في التسجيلات"}
                <span style={{ display: "inline-block", width: 3, height: 44, marginInlineStart: 4, verticalAlign: "middle", background: C.green, opacity: Math.sin(t * 9) > 0 || typed < QUERY.length ? 1 : 0 }} />
              </div>
            </Panel>
          </div>
          {noResult > 0 && (
            <Panel radius={26} style={{ marginTop: 16, padding: "22px 38px", display: "flex", alignItems: "center", gap: 18, direction: "rtl", opacity: clamp(noResult * 2), transform: `translateY(${(1 - noResult) * -16}px)` }}>
              <div style={{ fontFamily: BODY, fontSize: 32, color: C.muted }}>لا توجد نتائج</div>
            </Panel>
          )}
        </div>
      )}

      {quoteLife > 0 &&
        [1, -1].map((side) => {
          const x = g.cx + side * (hlW / 2 + markSize * 0.62 + (1 - Math.min(1, quoteIn)) * 260) + quoteShake;
          return (
            <svg
              key={side}
              width={markSize} height={markSize} viewBox="0 0 100 100"
              style={{ position: "absolute", left: x - markSize / 2, top: g.cy - markSize / 2, opacity: quoteLife * clamp(quoteIn * 1.5), transform: side > 0 ? "scaleX(-1)" : undefined }}
            >
              {/* « pointing outward on the left, » (mirrored) on the right */}
              <path d="M46 20 18 50l28 30M82 20 54 50l28 30" fill="none" stroke={C.gold} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          );
        })}
    </div>
  );
};
