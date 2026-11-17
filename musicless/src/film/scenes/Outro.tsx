import React from "react";
import { Img, staticFile } from "remotion";
import { DISPLAY } from "../../lib/fonts";
import { clamp, ease, ramp, spr, useStage } from "../../lib/motion";
import { C } from "../../theme";
import { useFilm } from "../context";
import { Lockup } from "../parts/Brand";
import { Icon } from "../parts/icons";
import { VoiceLine } from "../parts/VoiceLine";
import { Rise } from "./Why";

// The end card: the lockup, the tagline (then the call to watch YouTube without the music), the two official
// store badges (unmodified, each arriving as its store is named, both nudged on "Install it now"), the browsers,
// what to search for, and the voice line from the opening, which stays to the last frame.
const BADGES = [
  { file: "badges/chrome-web-store.png", ratio: 496 / 150, scale: 1 },
  { file: "badges/firefox-add-ons.svg", ratio: 172 / 60, scale: 0.86 },
];

export const Outro: React.FC = () => {
  const { T, W: win, L, copy, ui, lang, dir, typing } = useFilm();
  const { t, W, H } = useStage();
  const [a] = win.outro;
  if (t < a) return null;
  const u = L.u;
  const O = L.outro;
  const y = (off: number) => O.top + off;
  const lock = spr(t, a + 0.35, { stiffness: 200, damping: 16 });
  const snap = ease.outQuint(ramp(t, a + 0.62, 0.56, ease.linear));
  const name = ramp(t, a + 0.45, 0.5, ease.out);
  const tag = spr(t, a + 0.8, { stiffness: 160, damping: 18 });
  const swap = ramp(t, T.watch - 0.15, 0.3, ease.inOut);
  const cta = spr(t, T.watch - 0.05, { stiffness: 200, damping: 15 });
  const badgeAt = [T.chrome, T.firefox];
  const badgeH = 124 * u;
  // "Install it now": both badges lift a little, one after the other
  const nudge = (i: number) => {
    const s = t - (T.ctaWord - 0.05 + i * 0.1);
    return s > 0 && s < 0.6 ? Math.sin((s / 0.6) * Math.PI) * (1 - s / 0.6) : 0;
  };
  const browsers = ramp(t, T.firefox + 0.45, 0.4);
  const searchK = spr(t, T.firefox + 0.7, { stiffness: 200, damping: 16 });
  const typedN = Math.max(0, Math.floor((t - typing.end.at) / typing.end.step));
  const typed = Array.from(copy.search).slice(0, typedN).join("");
  const tagH = (L.P ? 150 : 90) * u;

  return (
    <Rise t={t} at={a} color={C.paper} H={H} u={u}>
      {/* the voice that stayed */}
      <VoiceLine t={t} y={O.voiceY} width={W} u={u} at={a + 0.5} color={C.ink} amp={30} fade={1 - 0.55 * clamp(ramp(t, a + 0.5, 0.6))} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y(0), display: "flex", justifyContent: "center", opacity: clamp(lock * 1.5), transform: `scale(${0.85 + 0.15 * lock})` }}>
        <Lockup lang={lang} height={O.lockH} k={snap} name={name} color={C.ink} />
      </div>
      {/* tagline, then the call */}
      <div style={{ position: "absolute", left: 50 * u, right: 50 * u, top: y(O.tag), height: tagH, textAlign: "center", direction: dir }}>
        <div
          style={{
            position: "absolute", left: 0, right: 0, top: 10 * u, fontFamily: DISPLAY, fontWeight: 500, fontSize: 46 * u, lineHeight: 1.3,
            display: "flex", flexDirection: L.P ? "column" : "row", justifyContent: "center", alignItems: "center", gap: L.P ? 2 * u : "0.28em",
            opacity: clamp(tag * 1.4) * (1 - swap), transform: `translateY(${(1 - tag) * 20 * u - swap * 20 * u}px)`,
          }}
        >
          <span style={{ color: C.ink }}>{copy.tagline[0]}</span>
          <span style={{ color: C.muted }}>{copy.tagline[1]}</span>
        </div>
        <div
          style={{
            position: "absolute", left: 0, right: 0, top: 0, height: tagH, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700,
            fontSize: 64 * u, color: C.ink, opacity: clamp(cta * 1.5), transform: `scale(${0.9 + 0.1 * cta})`, letterSpacing: dir === "ltr" ? "-0.03em" : 0, lineHeight: L.P ? 1.25 : 1.3,
          }}
        >
          <span style={{ maxWidth: L.P ? 900 * u : undefined, textWrap: "balance" } as React.CSSProperties}>{ui.ext("setup_heading")}</span>
        </div>
      </div>
      {/* the stores */}
      <div style={{ position: "absolute", left: 0, right: 0, top: y(O.badges), display: "flex", justifyContent: "center", alignItems: "center", gap: 40 * u, direction: dir }}>
        {BADGES.map((bd, i) => {
          const k = spr(t, badgeAt[i] - 0.12, { stiffness: 240, damping: 15 });
          const h = badgeH * bd.scale;
          const lift = nudge(i);
          return (
            <Img
              key={bd.file}
              src={staticFile(bd.file)}
              style={{
                height: h, width: h * bd.ratio, display: "block", opacity: clamp(ramp(t, badgeAt[i] - 0.12, 0.18)),
                transform: `translateY(${(1 - k) * 26 * u - lift * 16 * u}px) scale(${(0.85 + 0.15 * k) * (1 + 0.06 * lift)})`,
                filter: lift > 0.01 ? `drop-shadow(0 ${10 * lift * u}px ${16 * lift * u}px rgba(31, 29, 26, ${0.25 * lift}))` : undefined,
              }}
            />
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: y(O.browsers), textAlign: "center", fontFamily: DISPLAY, fontWeight: 400, fontSize: 32 * u, color: C.muted, opacity: browsers, direction: "ltr" }}>
        {copy.browsers}
      </div>
      {/* what to search for */}
      <div style={{ position: "absolute", left: 0, right: 0, top: y(O.search), display: "flex", justifyContent: "center", opacity: clamp(searchK * 1.5), transform: `translateY(${(1 - searchK) * 24 * u}px)` }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 18 * u, height: 84 * u, minWidth: 460 * u, boxSizing: "border-box", padding: `0 ${34 * u}px`, borderRadius: 42 * u,
            background: C.white, boxShadow: "0 18px 40px -20px rgba(31,29,26,0.45), 0 2px 6px rgba(31,29,26,0.08)", direction: dir,
          }}
        >
          <Icon name="search" size={34 * u} color={C.ink} stroke={2.4} />
          <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 40 * u, color: C.ink }}>
            {typed}
            <span style={{ display: "inline-block", width: 3 * u, height: 44 * u, marginInlineStart: 4 * u, verticalAlign: "-8%", background: C.ink, opacity: Math.floor(t * 2.2) % 2 === 0 ? 1 : 0 }} />
          </span>
        </div>
      </div>
    </Rise>
  );
};
