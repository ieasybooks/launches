import React from "react";
import { BODY } from "../../lib/fonts";
import { clamp, ease, lerp, ramp, rand, spr, useStage, wipe } from "../../lib/motion";
import { fileWave } from "../../lib/voice";
import { C } from "../../theme";
import { Display, FileCard, Icon, OUTLINE } from "../parts/kit";
import { T } from "../times";

// Free, with no account and nothing to install; then the audio file dissolving once it's done.

const Badge: React.FC<{ icon: string; label: string; at: number; size: number; extra?: string }> = ({ icon, label, at, size, extra }) => {
  const { t } = useStage();
  const s = spr(t, at - 0.15, { damping: 15, stiffness: 140 });
  const strike = ramp(t, at + 0.22, 0.35, ease.inOut);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.28, direction: "rtl", opacity: clamp(s * 1.5), transform: `translateY(${(1 - s) * 50}px) scale(${0.92 + 0.08 * s})` }}>
      <div style={{ position: "relative", width: size, height: size, borderRadius: 999, background: C.surface, boxShadow: `inset 0 0 0 1.5px ${C.line}, 0 16px 30px -18px rgba(74,52,30,0.45)`, display: "grid", placeItems: "center" }}>
        <Icon d={icon} size={size * 0.5} color={C.muted} />
        {extra && (
          <div style={{ position: "absolute", left: size * 0.56, top: size * 0.5 }}>
            <Icon d={extra} size={size * 0.28} color={C.muted} stroke={2} />
          </div>
        )}
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
          <path d="M80 20 L20 80" stroke={C.gold} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strike} />
        </svg>
      </div>
      <Display size={size * 0.52}>{label}</Display>
    </div>
  );
};

export const Free: React.FC = () => {
  const { P, t } = useStage();
  if (t < T.free - 0.7 || t > T.privacy) return null;
  const exit = ramp(t, T.privacy - 0.5, 0.4, ease.in);
  const gift = ramp(t, T.free - 0.15, 0.9, ease.inOut);
  const word = spr(t, T.freeWord - 0.12, { damping: 13, stiffness: 130 });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exit, transform: `translateY(${-70 * exit}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: P ? 430 : 165, display: "flex", justifyContent: "center" }}>
        <Icon d={OUTLINE.gift} size={P ? 120 : 104} color={C.gold} stroke={1.3} draw={gift} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: P ? 560 : 270, display: "flex", justifyContent: "center", opacity: clamp(word * 1.5), transform: `scale(${0.8 + 0.2 * word})` }}>
        <Display size={P ? 260 : 240} color={C.green}>
          مجانًا
        </Display>
      </div>
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: P ? 1060 : 690, display: "flex", flexDirection: P ? "column" : "row",
          alignItems: "center", justifyContent: "center", gap: P ? 70 : 150, direction: "rtl",
        }}
      >
        <Badge icon={OUTLINE.user} label="بلا حساب" at={T.account} size={P ? 160 : 140} />
        <Badge icon={OUTLINE.desktop} label="بلا تثبيت" at={T.install} size={P ? 160 : 140} />
      </div>
    </div>
  );
};

const FILE = "أدوات-العربية.mp3";

export const Privacy: React.FC = () => {
  const { P, W, t } = useStage();
  if (t < T.privacy - 0.6 || t > T.more) return null;
  const exit = ramp(t, T.more - 0.85, 0.45, ease.in);
  const cardW = P ? 860 : 780;
  const cy = P ? 900 : 420;
  const s = spr(t, T.privacy - 0.5, { damping: 17, stiffness: 120 });
  const go = T.remove + 0.05;
  const gone = ramp(t, go, 0.95, ease.inOut);
  const shieldAt = T.remove + 0.8;
  const shield = ramp(t, shieldAt, 0.9, ease.inOut);
  const head = ramp(t, shieldAt + 0.25, 0.65, ease.linear);
  const headS = spr(t, shieldAt + 0.25, { damping: 20 });
  const note = spr(t, shieldAt + 0.6, { damping: 20 });
  const cardH = P ? 250 : 220;
  const left = W / 2 - cardW / 2;
  const top = cy - cardH / 2;

  const dust = Array.from({ length: 90 }, (_, j) => {
    const ts = go + (j / 90) * 0.85;
    const k = clamp((t - ts) / 1.3);
    if (k <= 0 || k >= 1) return null;
    const x0 = left + cardW - (j / 90) * cardW;
    const y0 = top + rand(j) * cardH;
    const x = x0 - k * (40 + rand(j + 3) * 120);
    const y = y0 - ease.out(k) * (120 + rand(j + 7) * 200);
    const size = 5 + rand(j + 11) * 9;
    return <div key={j} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: 2, background: j % 3 ? C.gold : C.green, opacity: (1 - k) * 0.85, transform: `rotate(${k * 180 * (rand(j + 5) - 0.5)}deg)` }} />;
  });

  const m = gone * 125 - 15;
  const mask = gone > 0 ? `linear-gradient(to left, transparent ${m}%, #000 ${m + 12}%)` : undefined;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exit, transform: `translateY(${-60 * exit}px)` }}>
      {gone < 1 && (
        <div style={{ position: "absolute", left, top: top + (1 - s) * 100, width: cardW, opacity: clamp(s * 1.5), WebkitMaskImage: mask, maskImage: mask }}>
          <FileCard name={FILE} meta="MP3 · 0:58" width={cardW} scale={P ? 1.3 : 1.25} heights={fileWave(2.2, 48)} play={1} />
        </div>
      )}
      {dust}
      <div style={{ position: "absolute", left: 0, right: 0, top: (P ? 790 : 300) - 80, display: "flex", justifyContent: "center", transform: `scale(${lerp(0.85, 1, shield)})` }}>
        <Icon d={OUTLINE.shield} size={P ? 190 : 160} color={C.green} stroke={1.2} draw={shield} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: P ? 940 : 470, display: "flex", justifyContent: "center", transform: `translateY(${(1 - headS) * 30}px)` }}>
        <Display size={P ? 104 : 100} style={wipe(head)}>
          تُحذف ملفاتك تلقائيًا
        </Display>
      </div>
      <div
        style={{
          position: "absolute", left: P ? 110 : 0, right: P ? 110 : 0, top: P ? 1110 : 640, textAlign: "center", direction: "rtl",
          fontFamily: BODY, fontSize: P ? 40 : 36, lineHeight: 1.7, color: C.muted, opacity: clamp(note * 1.5), transform: `translateY(${(1 - note) * 24}px)`,
        }}
      >
        نحذف الملف الصوتي فور انتهاء التفريغ، ونحذف النص بعد 30 دقيقة.
      </div>
    </div>
  );
};
