import React from "react";
import { Img, staticFile } from "remotion";
import { DISPLAY, LATIN } from "../../lib/fonts";
import { clamp, ramp, spr, useStage } from "../../lib/motion";
import { C } from "../../theme";
import { useFilm } from "../context";
import { Lockup } from "../parts/Brand";

// The end card, centred: mark and name, the tagline, the three official store badges (unmodified,
// App Store first, each arriving as its store is named) and the address.
const BADGES = {
  ar: [
    { file: "badges/app-store-ar.svg", ratio: 119.664 / 40, label: "App Store" },
    { file: "badges/google-play-ar.png", ratio: 564 / 168, label: "Google Play" },
    { file: "badges/appgallery-ar.png", ratio: 400 / 120, label: "AppGallery" },
  ],
  en: [
    { file: "badges/app-store-en.svg", ratio: 119.664 / 40, label: "App Store" },
    { file: "badges/google-play-en.png", ratio: 564 / 168, label: "Google Play" },
    { file: "badges/appgallery-en.png", ratio: 400 / 120, label: "AppGallery" },
  ],
};

export const Outro: React.FC = () => {
  const { T, W, L, copy, lang } = useFilm();
  const { t } = useStage();
  const [a] = W.outro;
  if (t < a) return null;
  const lock = spr(t, a + 0.02, { damping: 15, stiffness: 200 });
  const tag = spr(t, a + 0.25, { damping: 18, stiffness: 200 });
  const badgeAt = [T.appstore, T.google, T.gallery];
  const urlAt = T.web;
  const url = spr(t, urlAt, { damping: 16, stiffness: 130 });
  const dir = lang === "ar" ? "rtl" : "ltr";
  const badgeH = L.P ? 70 : 84;
  const main = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ opacity: clamp(lock * 1.4), transform: `scale(${0.88 + 0.12 * lock})` }}>
        <Lockup lang={lang} size={L.P ? 160 : 146} />
      </div>
      <div style={{ marginTop: L.P ? 44 : 34, fontFamily: DISPLAY, fontWeight: 500, fontSize: L.P ? 66 : 68, color: C.ink, direction: dir, opacity: clamp(tag * 1.4), transform: `translateY(${(1 - tag) * 22}px)` }}>
        {copy.tagline}
      </div>
      <div style={{ marginTop: L.P ? 64 : 54, display: "flex", gap: L.P ? 16 : 22, direction: dir }}>
        {BADGES[lang].map((b, i) => {
          const k = spr(t, badgeAt[i] - 0.12, { damping: 16, stiffness: 220 });
          return <Img key={b.file} src={staticFile(b.file)} style={{ height: badgeH, width: badgeH * b.ratio, display: "block", opacity: clamp(ramp(t, badgeAt[i] - 0.12, 0.2)), transform: `translateY(${(1 - k) * 18}px) scale(${0.9 + 0.1 * k})` }} />;
        })}
      </div>
      <div style={{ marginTop: L.P ? 54 : 44, fontFamily: LATIN, fontWeight: 700, fontSize: L.P ? 60 : 62, letterSpacing: "-0.01em", color: C.ink, opacity: clamp(url * 1.4), transform: `translateY(${(1 - url) * 20}px)` }}>
        mofied.com
      </div>
    </div>
  );
  // centred in the frame, in both shapes
  return <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{main}</div>;
};
