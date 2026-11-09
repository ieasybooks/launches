import React from "react";
import { LATIN } from "../../lib/fonts";
import { clamp, ease, rand, useStage } from "../../lib/motion";
import { useFilm } from "../context";
import { Icon } from "../parts/icons";
import { KineticRows, timeRows } from "../parts/Kinetic";

// An abstract short-video feed that flicks faster and faster while a clock races, then stops dead.
// No real apps, logos, people or content: muted colour fields with the usual feed furniture.

/** Pages flicked by time t: dwell, then move; the dwell shrinks until the feed becomes a blur. */
export const feedPages = (t: number, end: number) => {
  const x = clamp(t / end);
  // integral of rate(t) = 0.9 + 9·x² pages per second
  return 0.9 * t + (9 * end * Math.pow(x, 3)) / 3;
};
const pageOffset = (pages: number) => {
  const i = Math.floor(pages);
  const f = pages - i;
  return i + ease.inOut(clamp((f - 0.25) / 0.75));
};
/** Times at which a new page starts moving (for the flick sounds). */
export const flickTimes = (end: number) => {
  const out: number[] = [];
  let last = 0;
  for (let t = 0; t < end; t += 0.002) {
    const p = feedPages(t, end) - 0.25;
    if (Math.floor(p) > last && p > 0) {
      last = Math.floor(p);
      out.push(t);
    }
  }
  return out;
};

const HUES = [[204, 18], [24, 22], [148, 14], [300, 12], [42, 26], [220, 10], [350, 16], [96, 12]];

export const FeedCard: React.FC<{ seed: number; w: number; h: number }> = ({ seed, w }) => {
  const [hue, sat] = HUES[Math.floor(rand(seed) * HUES.length)];
  const a = { x: 20 + rand(seed + 1) * 60, y: 20 + rand(seed + 2) * 50 };
  const b = { x: 20 + rand(seed + 3) * 60, y: 45 + rand(seed + 4) * 45 };
  const u = w / 393;
  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: `radial-gradient(60% 45% at ${a.x}% ${a.y}%, hsl(${hue} ${sat + 10}% 46%), transparent 70%), radial-gradient(55% 40% at ${b.x}% ${b.y}%, hsl(${(hue + 40) % 360} ${sat}% 34%), transparent 72%), linear-gradient(170deg, hsl(${hue} ${sat}% 24%), hsl(${hue} ${sat}% 9%))`,
      }}
    >
      <div style={{ position: "absolute", right: 16 * u, bottom: 150 * u, display: "flex", flexDirection: "column", gap: 26 * u, alignItems: "center", opacity: 0.9 }}>
        {(["heart", "comment", "share"] as const).map((n) => (
          <Icon key={n} name={n} size={30 * u} color="#fff" stroke={1.8} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 20 * u, bottom: 60 * u, width: w * 0.62 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 * u, marginBottom: 14 * u }}>
          <div style={{ width: 30 * u, height: 30 * u, borderRadius: "50%", background: "rgba(255,255,255,0.55)" }} />
          <div style={{ width: 110 * u, height: 10 * u, borderRadius: 99, background: "rgba(255,255,255,0.55)" }} />
        </div>
        <div style={{ width: "100%", height: 12 * u, borderRadius: 99, background: "rgba(255,255,255,0.4)", marginBottom: 10 * u }} />
        <div style={{ width: `${55 + rand(seed + 5) * 35}%`, height: 12 * u, borderRadius: 99, background: "rgba(255,255,255,0.4)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 24 * u, height: 3 * u, background: "rgba(255,255,255,0.25)" }}>
        <div style={{ height: "100%", width: `${30 + rand(seed + 6) * 60}%`, background: "rgba(255,255,255,0.8)" }} />
      </div>
    </div>
  );
};

export const Hook: React.FC = () => {
  const { T, W, L, copy, tl } = useFilm();
  const { W: FW, H: FH, t } = useStage();
  if (t >= W.hook[1]) return null;
  const end = W.hook[1];
  const pages = feedPages(t, end);
  const speed = (feedPages(t + 1 / 60, end) - pages) * 60; // pages per second
  const blur = clamp((speed - 2) / 7) * 9;
  const cols = L.P ? 1 : 5;
  const cardW = L.P ? FW : 300;
  const cardH = L.P ? FH : 650;
  const gap = L.P ? 0 : 28;
  const totalW = cols * cardW + (cols - 1) * gap;
  const left0 = (FW - totalW) / 2;
  // the camera pushes in, and shakes once when the hour is lost
  const push = 1 + 0.14 * ease.in(clamp(t / end));
  const hit = t >= T.lost ? Math.max(0, 1 - (t - T.lost) / 0.35) : 0;
  const shakeX = Math.sin(t * 90) * 10 * hit;
  // the clock: one minute becomes an hour
  const mins = Math.floor(61 * Math.pow(clamp(t / (T.hookEnd + 0.05)), 1.6));
  const h = (23 + Math.floor((58 + mins) / 60)) % 24;
  const m = (58 + mins) % 60;
  const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const rows = timeRows(copy.hook, tl.words("hook"));
  const dir = L.rtl ? "rtl" : "ltr";
  return (
    <div style={{ position: "absolute", inset: 0, background: "#050505", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push}) translateX(${shakeX}px)`, filter: blur > 0.4 ? `blur(${blur}px)` : undefined }}>
        {Array.from({ length: cols }, (_, c) => {
          const o = pageOffset(pages * (L.P ? 1 : 0.85 + 0.1 * c) + c * 0.37);
          const x = left0 + c * (cardW + gap);
          const yBase = L.P ? 0 : (FH - cardH) / 2 + (c % 2 ? 40 : -40);
          const first = Math.floor(o) - 1;
          return (
            <div key={c} style={{ position: "absolute", left: x, top: 0, width: cardW, height: FH }}>
              {[0, 1, 2, 3].map((j) => {
                const n = first + j;
                const y = yBase + (n - o) * (cardH + gap);
                if (y > FH || y + cardH < 0) return null;
                return (
                  <div key={n} style={{ position: "absolute", left: 0, top: y, width: cardW, height: cardH, borderRadius: L.P ? 0 : 28, overflow: "hidden" }}>
                    <FeedCard seed={n * 7 + c * 31 + 3} w={cardW} h={cardH} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(75% 60% at 50% 52%, rgba(0,0,0,0.35), rgba(0,0,0,0.82))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: L.P ? 300 : 60, textAlign: "center", fontFamily: LATIN, fontWeight: 700, fontSize: L.P ? 168 : 132, lineHeight: 1, color: "#fff", fontVariantNumeric: "tabular-nums", letterSpacing: "0.01em", opacity: 0.95, transform: `scale(${1 + 0.06 * hit})` }}>
        {time}
      </div>
      <div style={{ position: "absolute", left: L.P ? 90 : 120, right: L.P ? 90 : 120, top: L.P ? 560 : 250, bottom: L.P ? 520 : 60, display: "flex", flexDirection: "column", justifyContent: "center", textShadow: "0 6px 50px rgba(0,0,0,0.7)", transform: `translateX(${shakeX * 0.6}px)` }}>
        <KineticRows rows={[rows[0]]} size={L.P ? (L.rtl ? 104 : 88) : 110} dir={dir} color="#fff" t={t} lineHeight={1.2} />
        <KineticRows rows={[rows[1]]} size={L.P ? (L.rtl ? 150 : 120) : 176} dir={dir} color="#fff" t={t} lineHeight={1.25} style={{ marginTop: L.P ? 10 : 0 }} />
      </div>
    </div>
  );
};
