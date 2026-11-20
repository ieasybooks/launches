import React from "react";
import { Img, staticFile } from "remotion";
import { UI_SEMI } from "../../lib/fonts";
import { clamp, ramp, spr, useStage } from "../../lib/motion";
import { NIGHT } from "../../theme";
import { useFilm } from "../context";
import { Lockup } from "../parts/Brand";

// Free, then the end card at night: the lockup, the three official store badges (App Store first, each as its
// store is named) and the address.

export const Free: React.FC = () => {
  const { T, W, L, copy, dir } = useFilm();
  const { t } = useStage();
  const [a, b] = W.free;
  if (t < a || t > b + 0.4) return null;
  const out = ramp(t, b - 0.3, 0.35);
  // the phone has left by the time the first words land (they wait for their spoken words)
  const at = [T.free, T.ads, T.account];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: L.tall ? 36 : 26, opacity: 1 - out, direction: dir }}>
      {copy.free.map((line, i) => {
        const k = spr(t, at[i] - 0.1, { damping: 15, stiffness: 190 });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, opacity: clamp(k * 1.5), transform: `translateY(${(1 - k) * 30}px)` }}>
            <svg width={30} height={30} viewBox="-1 -1 2 2"><path d="M0 -1L1 0L0 1L-1 0Z" fill={NIGHT.accent} /></svg>
            <span style={{ fontFamily: UI_SEMI, fontSize: i === 0 ? (L.tall ? 98 : 88) : L.tall ? 84 : 74, color: NIGHT.fg, whiteSpace: "nowrap" }}>{line}</span>
          </div>
        );
      })}
    </div>
  );
};

const BADGES = {
  ar: [
    { file: "badges/app-store-ar.svg", ratio: 119.664 / 40 },
    { file: "badges/google-play-ar.png", ratio: 564 / 168 },
    { file: "badges/appgallery-ar.png", ratio: 400 / 120 },
  ],
  en: [
    { file: "badges/app-store-en.svg", ratio: 119.664 / 40 },
    { file: "badges/google-play-en.png", ratio: 564 / 168 },
    { file: "badges/appgallery-en.png", ratio: 400 / 120 },
  ],
};

export const Outro: React.FC = () => {
  const { T, W, L, copy, lang, dir } = useFilm();
  const { t } = useStage();
  const [a] = W.outro;
  if (t < a) return null;
  const badgeAt = [T.appstore, T.google, T.gallery];
  const url = spr(t, T.dot - 0.35, { damping: 16, stiffness: 140 });
  const badgeH = L.tall ? 68 : 70;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: L.tall ? 330 : L.wide ? 230 : 90, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Lockup t={t} at={a + 0.3} tagAt={a + 0.75} mark={L.tall ? 250 : L.wide ? 180 : 170} lang={lang} tagline={copy.tagline} night />
        <div style={{ marginTop: L.tall ? 74 : L.wide ? 52 : 44, display: "flex", gap: L.tall ? 18 : 22, direction: dir, flexWrap: "nowrap", justifyContent: "center", width: 1000 }}>
          {BADGES[lang].map((bd, i) => {
            const k = spr(t, badgeAt[i] - 0.12, { damping: 16, stiffness: 220 });
            return <Img key={bd.file} src={staticFile(bd.file)} style={{ height: badgeH, width: badgeH * bd.ratio, display: "block", opacity: clamp(ramp(t, badgeAt[i] - 0.12, 0.2)), transform: `translateY(${(1 - k) * 18}px) scale(${0.9 + 0.1 * k})` }} />;
          })}
        </div>
        <div style={{ marginTop: L.tall ? 56 : 40, fontFamily: UI_SEMI, fontSize: L.tall ? 64 : 56, letterSpacing: "-0.01em", color: NIGHT.fg, opacity: clamp(url * 1.4), transform: `translateY(${(1 - url) * 20}px)` }}>
          {copy.url}
        </div>
      </div>
    </div>
  );
};
