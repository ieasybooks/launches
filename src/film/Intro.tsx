import React from "react";
import { Img, staticFile } from "remotion";
import { cue as C, S } from "../lib/timeline";
import { clamp, easeInOutCubic, easeOutBack, easeOutCubic, easeOutExpo, lerp, prog, rand } from "../lib/time";
import { FILM } from "../ui/theme";
import { HEADING_FONT, UI_FONT } from "../lib/fonts";
import { Layout } from "./layout";
import { Logo, sheenAt } from "./Logo";
import { T } from "./director";

export const I = {
  i1: S("intro1"),
  i2: S("intro2"),
  i3: S("intro3"),
  i4: S("intro4"),
  one: C("intro4", "مكان"),
  bloom: C("intro4", "واحد"),
  logo: C("intro4", "الجامع"),
  shrink: C("now", "يصل"),
  launch: T.launch,
};

const N = 170;
const PALETTE = ["#ae4721", "#e16e4a", "#c98a5c", "#8c5a43", "#dcb48e", "#f1ddc9", "#b8653d"];
const LIBS = [
  { name: "مكتبة المسجد النبوي", count: 48702, share: 0.62, r: 0.26 },
  { name: "المكتبة الوقفية", count: 10091, share: 0.24, r: 0.17 },
  { name: "المكتبة الشاملة الوقفية", count: 4646, share: 0.14, r: 0.125 },
];
const clusterOf = (i: number) => (i < N * LIBS[0].share ? 0 : i < N * (LIBS[0].share + LIBS[1].share) ? 1 : 2);

const clusterCenter = (k: number, L: Layout) =>
  L.format === "landscape" ? { x: [0.56, 0, -0.56][k], y: -0.08 } : { x: 0, y: [-0.5, -0.04, 0.34][k] };

/** Book-spine particles: scatter → push in → three libraries → gathered into one point. */
const Spines: React.FC<{ t: number; L: Layout }> = ({ t, L }) => {
  const { W, H, u } = L;
  const unitX = W / 2;
  const unitY = H / 2;
  const minU = Math.min(W, H) / 2;
  if (t > I.bloom + 0.3) return null;
  const items: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const depth = 0.35 + 0.65 * rand(i * 3.1);
    const w = (5 + 9 * rand(i * 7.7)) * u * (0.6 + 0.6 * depth);
    const h = (34 + 70 * rand(i * 5.3)) * u * (0.6 + 0.6 * depth);
    const color = PALETTE[Math.floor(rand(i * 11.9) * PALETTE.length)];
    // scatter field
    const bx = (rand(i * 1.37) * 2 - 1) * 1.15;
    const by = (rand(i * 2.71) * 2 - 1) * (L.format === "landscape" ? 0.95 : 1.0);
    const ph = rand(i * 9.1) * Math.PI * 2;
    const drift = { x: 0.03 * Math.sin(t * 0.35 + ph), y: -0.025 * t * (0.4 + depth) + 0.02 * Math.cos(t * 0.3 + ph) };
    const push = 1 + 0.32 * prog(t, I.i2 - 0.3, I.i3 + 0.4, easeInOutCubic) * depth;
    let x = (bx + drift.x) * push * unitX;
    let y = (by + drift.y) * push * unitY;
    // three libraries
    const k = clusterOf(i);
    const cc = clusterCenter(k, L);
    const a = rand(i * 4.4) * Math.PI * 2;
    const rr = Math.sqrt(rand(i * 6.6)) * LIBS[k].r * minU * (L.format === "portrait" ? 1.05 : 1);
    const spin = (t - I.i3) * 0.25;
    const cx = cc.x * unitX + Math.cos(a + spin) * rr;
    const cy = cc.y * unitY + Math.sin(a + spin) * rr * 0.62;
    const pc = prog(t, I.i3 - 0.2 + rand(i * 8.8) * 0.45, I.i3 + 1.0 + rand(i * 8.8) * 0.45, easeInOutCubic);
    x = lerp(x, cx, pc);
    y = lerp(y, cy, pc);
    // gathered into one place
    const g = prog(t, I.i4 + rand(i * 2.2) * 0.35, I.one + 0.55, easeInOutCubic);
    const ang = g * 2.1;
    const gx = x * Math.cos(ang) - y * Math.sin(ang);
    const gy = x * Math.sin(ang) + y * Math.cos(ang);
    x = gx * (1 - g);
    y = gy * (1 - g);
    const appear = prog(t, 0.1 + rand(i * 3.9) * 1.1, 0.9 + rand(i * 3.9) * 1.1, easeOutCubic);
    const op = appear * (0.25 + 0.65 * depth) * (1 - prog(t, I.bloom - 0.1, I.bloom + 0.15));
    const sc = (1 - 0.75 * g) * (1 + 0.15 * pc * (k === 0 ? 1 : 0.5));
    const rot = (rand(i * 12.3) - 0.5) * 18 * (1 - pc) + (pc * (1 - g)) * (rand(i) - 0.5) * 8;
    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: W / 2 + x - w / 2,
          top: H / 2 + y - h / 2,
          width: w,
          height: h,
          borderRadius: w * 0.35,
          background: `linear-gradient(90deg, ${color} 0%, ${color} 70%, rgba(0,0,0,0.25) 100%)`,
          opacity: op,
          transform: `rotate(${rot}deg) scale(${sc})`,
          boxShadow: depth > 0.8 ? `0 0 ${10 * u}px rgba(225,110,74,0.35)` : undefined,
        }}
      />,
    );
  }
  return <>{items}</>;
};

const Counter: React.FC<{ t: number; t0: number; t1: number; to: number; label: string; L: Layout; count: number }> = ({ t, t0, t1, to, label, L, count }) => {
  const enter = prog(t, t0 - 0.2, t0 + 0.45, easeOutCubic);
  const exit = prog(t, t1 - 0.1, t1 + 0.35, easeInOutCubic);
  if (enter <= 0 || exit >= 1) return null;
  const n = Math.round(to * easeOutExpo(clamp((t - t0) / count)));
  const size = (L.format === "landscape" ? 190 : 170) * L.u;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: L.H / 2 - size * 0.78,
        textAlign: "center",
        opacity: enter * (1 - exit),
        transform: `translateY(${(1 - enter) * 40 * L.u - exit * 50 * L.u}px)`,
        filter: `blur(${(1 - enter) * 8 + exit * 6}px)`,
      }}
    >
      <div style={{ fontFamily: HEADING_FONT, fontSize: size, lineHeight: 1, color: FILM.cream, direction: "ltr", fontVariantNumeric: "tabular-nums", letterSpacing: -2 * L.u, textShadow: "0 10px 60px rgba(225,110,74,0.35)" }}>
        {n.toLocaleString("en-US")}
        <span style={{ color: FILM.ember }}>+</span>
      </div>
      <div style={{ fontFamily: HEADING_FONT, fontSize: 64 * L.u, color: FILM.ember, marginTop: 18 * L.u }}>{label}</div>
    </div>
  );
};

const LibraryLabels: React.FC<{ t: number; L: Layout }> = ({ t, L }) => (
  <>
    {LIBS.map((lib, k) => {
      const a = prog(t, I.i3 + 0.45 + k * 0.28, I.i3 + 1.0 + k * 0.28, easeOutCubic) * (1 - prog(t, I.i4 - 0.05, I.i4 + 0.4));
      if (a <= 0) return null;
      const cc = clusterCenter(k, L);
      const minU = Math.min(L.W, L.H) / 2;
      const x = L.W / 2 + cc.x * (L.W / 2);
      const y = L.H / 2 + cc.y * (L.H / 2) + lib.r * minU * 0.62 + 46 * L.u;
      return (
        <div key={k} style={{ position: "absolute", left: x - 300 * L.u, width: 600 * L.u, top: y, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * 18 * L.u}px)` }}>
          <div style={{ fontFamily: HEADING_FONT, fontSize: 46 * L.u, color: FILM.cream, lineHeight: 1.2 }}>{lib.name}</div>
          <div style={{ fontFamily: UI_FONT, fontSize: 28 * L.u, color: FILM.ember, marginTop: 6 * L.u }}>{`${lib.count.toLocaleString("en-US")} كتاب`}</div>
        </div>
      );
    })}
  </>
);

/** Bloom: the gathered point flashes and paper spreads from it. Returns the paper circle radius. */
export const bloomRadius = (t: number, L: Layout) => prog(t, I.bloom - 0.05, I.bloom + 1.0, easeInOutCubic) * Math.hypot(L.W, L.H) * 0.66;

export const IntroForeground: React.FC<{ t: number; L: Layout }> = ({ t, L }) => {
  if (t > I.launch + 0.6) return null;
  const { W, H, u } = L;
  const flash = Math.max(0, 1 - Math.abs(t - I.bloom - 0.05) / 0.3);
  const point = prog(t, I.one, I.bloom, easeInOutCubic) * (1 - prog(t, I.bloom, I.bloom + 0.3));
  // logo → app icon
  const shrink = prog(t, I.shrink - 0.05, I.shrink + 0.8, easeInOutCubic);
  const logoW0 = (L.format === "landscape" ? 560 : 640) * u;
  const tile = L.win.s * 854 * 0.22;
  const logoW = lerp(logoW0, tile * 0.64, shrink);
  const winCx = L.win.x + L.win.w / 2;
  const winCy = L.win.y + L.win.h / 2;
  const cx = lerp(W / 2, winCx, shrink);
  const cy = lerp(H / 2 - (L.format === "landscape" ? 30 : 40) * u, winCy, shrink);
  const subtitle = prog(t, I.logo + 1.25, I.logo + 1.9, easeOutCubic) * (1 - prog(t, I.shrink - 0.1, I.shrink + 0.3));
  const logoVisible = t >= I.logo - 0.05;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Spines t={t} L={L} />
      <Counter t={t} t0={I.i1} t1={I.i2} to={63000} label="كتاب" L={L} count={1.7} />
      <Counter t={t} t0={I.i2 + 0.05} t1={I.i3} to={37000000} label="صفحة" L={L} count={1.9} />
      <LibraryLabels t={t} L={L} />
      {point > 0 ? (
        <div
          style={{
            position: "absolute",
            left: W / 2 - 160 * u,
            top: H / 2 - 160 * u,
            width: 320 * u,
            height: 320 * u,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,246,236,1) 0%, rgba(255,214,186,0.85) 10%, rgba(240,150,105,0.5) 26%, rgba(174,71,33,0.0) 62%)",
            opacity: point,
            transform: `scale(${0.5 + point * 0.7})`,
          }}
        />
      ) : null}
      {flash > 0 ? (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, rgba(255,246,236,${0.9 * flash}) 0%, rgba(255,230,210,${0.35 * flash}) 30%, rgba(255,230,210,0) 70%)` }} />
      ) : null}
      {logoVisible ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: H / 2 + (L.format === "landscape" ? 225 : 270) * u,
              textAlign: "center",
              fontFamily: HEADING_FONT,
              fontSize: 52 * u,
              color: FILM.ink,
              opacity: subtitle,
              transform: `translateY(${(1 - subtitle) * 14 * u}px)`,
              letterSpacing: 0.5 * u,
            }}
          >
            مكتبة المكتبات الإسلامية
          </div>
        </>
      ) : null}
    </div>
  );
};

export const AppIconImg: React.FC<{ size: number }> = ({ size }) => <Img src={staticFile("brand/app-icon.png")} style={{ width: size, height: size }} />;

/** The app icon (logo on a white tile). It rides the opening window and dissolves into it. */
export const IntroIcon: React.FC<{ t: number; L: Layout }> = ({ t, L }) => {
  if (t < I.logo - 0.05 || t > I.launch + 0.6) return null;
  const { W, H, u } = L;
  const shrink = prog(t, I.shrink - 0.05, I.shrink + 0.8, easeInOutCubic);
  const logoW0 = (L.format === "landscape" ? 560 : 640) * u;
  const tile = L.win.s * 854 * 0.22;
  const logoW = lerp(logoW0, tile * 0.64, shrink);
  const cx = lerp(W / 2, L.win.x + L.win.w / 2, shrink);
  const cy = lerp(H / 2 - (L.format === "landscape" ? 30 : 40) * u, L.win.y + L.win.h / 2, shrink);
  const tileIn = shrink <= 0 ? 0 : easeOutBack(1.3)(clamp((t - I.shrink - 0.1) / 0.6));
  const launchL = easeInOutCubic(prog(t, I.launch, I.launch + 0.95, (x) => x));
  const grow = (0.22 + 0.78 * launchL) / 0.22;
  const iconOut = 1 - prog(t, I.launch + 0.1, I.launch + 0.42, easeInOutCubic);
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: `${cx}px ${cy}px`, transform: `scale(${grow})`, opacity: iconOut }}>
      <div
        style={{
          position: "absolute",
          left: cx - tile / 2,
          top: cy - tile / 2,
          width: tile,
          height: tile,
          borderRadius: tile * 0.225,
          background: "#ffffff",
          transform: `scale(${tileIn})`,
          boxShadow: "0 30px 70px rgba(110,60,35,0.28), 0 8px 20px rgba(110,60,35,0.16)",
        }}
      />
      <div style={{ position: "absolute", left: cx - logoW / 2, top: cy - (logoW * 288) / 366 / 2 }}>
        <Logo id="intro-logo" width={logoW} color={FILM.terracotta} write={t - I.logo} sheen={sheenAt(t, I.logo + 1.35)} />
      </div>
    </div>
  );
};
