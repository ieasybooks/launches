import React from "react";
import content from "../../data/content.json";
import { DISPLAY, LATIN, QURAN, UI } from "../../lib/fonts";
import { clamp, ease, lerp, ramp, spr, useStage } from "../../lib/motion";
import { C } from "../../theme";
import { useFilm } from "../context";
import { APP } from "../copy";
import { Mark } from "../parts/Brand";
import { Icon } from "../parts/icons";
import { KineticRows, Land, timeRows } from "../parts/Kinetic";

// Full-frame moments: the reminder and the ending take the whole screen, as they do in the app.

/** The reminder between clips, at full size: the verse is revealed as if read, the countdown runs,
 *  and the frame then shrinks back into the phone. */
export const ReminderStage: React.FC = () => {
  const { T, W, L, lang, copy } = useFilm();
  const { t, H: FH } = useStage();
  const [a, b] = W.reminder;
  if (t < a || t > b) return null;
  const r = content.reminder[lang];
  const arabic = lang === "ar";
  const shrinkAt = b - 0.45;
  const sk = ramp(t, shrinkAt, 0.45, ease.inOut);
  const enter = ramp(t, a + 0.35, 0.5, ease.out);
  const push = 1.04 - 0.04 * enter + 0.04 * ramp(t, a + 0.85, shrinkAt - a - 0.85, ease.linear);
  const words = r.body.split(/\s+/);
  const readFrom = T.pause - 0.1;
  const readFor = Math.min(2.6, T.reminderEnd - readFrom);
  const chip = Math.max(0, 1 - Math.abs(t - T.verse - 0.2) / 0.7);
  const start = a + 0.2;
  const natural = (u: number) => r.durationMs - Math.max(0, u - start) * 1000;
  const quick = shrinkAt - 0.75;
  const remaining = t < quick ? natural(t) : lerp(natural(quick), 0, ramp(t, quick, 0.7, ease.inOut));
  const seconds = Math.ceil(Math.max(0, remaining) / 1000);
  const size = L.P ? (arabic ? 66 : 54) : arabic ? 78 : 62;
  const ui = arabic ? UI : LATIN;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${-sk * FH}px)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#1a1a1a, #070707)", opacity: ramp(t, a, 0.6, ease.inOut) }} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, opacity: ramp(t, a + 0.35, 0.45, ease.inOut) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: L.P ? 300 : 70, textAlign: "center", fontFamily: DISPLAY, fontWeight: 500, fontSize: L.P ? 64 : 56, color: "#9d9d9d", direction: arabic ? "rtl" : "ltr", opacity: clamp(ramp(t, a + 0.1, 0.3)) }}>
        {copy.reminderTop}
      </div>
      <div style={{ position: "absolute", left: L.P ? 80 : 210, right: L.P ? 80 : 210, top: L.P ? 420 : 150, bottom: L.P ? 560 : 210, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: arabic ? "row-reverse" : "row", alignItems: "center", gap: 14, borderRadius: 40, padding: L.P ? "10px 26px" : "10px 26px", border: `2px solid rgba(255,255,255,${0.2 + 0.6 * chip})`, boxShadow: `0 0 ${36 * chip}px rgba(255,255,255,${0.3 * chip})`, opacity: clamp(ramp(t, a + 0.15, 0.3)) }}>
          <Icon name="book" size={L.P ? 34 : 32} color="#d6d6d6" />
          <span style={{ fontFamily: ui, fontSize: L.P ? 34 : 32, color: C.text, lineHeight: 1.4 }}>{APP[lang].quran}</span>
        </div>
        <div style={{ marginTop: L.P ? 54 : 46, fontFamily: arabic ? QURAN : DISPLAY, fontWeight: arabic ? 400 : 500, fontSize: size, lineHeight: arabic ? 1.95 : 1.45, color: C.text, textAlign: "center", direction: arabic ? "rtl" : "ltr", textWrap: "balance" }}>
          {words.map((w, i) => {
            const at = readFrom + (readFor * i) / Math.max(1, words.length - 1);
            const o = 0.18 + 0.82 * clamp(ramp(t, at - 0.15, 0.35));
            return (
              <React.Fragment key={i}>
                {i > 0 && " "}
                <span style={{ opacity: o }}>{w}</span>
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ height: 2, width: 64, background: "#ffffff30", margin: L.P ? "42px 0 30px" : "36px 0 24px" }} />
        <div style={{ fontFamily: ui, fontSize: L.P ? 32 : 30, color: "#c4c4c4", direction: arabic ? "rtl" : "ltr" }}>{r.citation}</div>
      </div>
      <div style={{ position: "absolute", left: L.P ? 140 : 560, right: L.P ? 140 : 560, bottom: L.P ? 380 : 90, textAlign: "center" }}>
        <div style={{ fontFamily: ui, fontSize: L.P ? 34 : 30, color: "#d6d6d6", direction: arabic ? "rtl" : "ltr" }}>{APP[lang].countdown(seconds)}</div>
        <div style={{ height: 3, background: "#ffffff24", marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ height: 3, background: "#fff", width: `${(Math.max(0, remaining) / r.durationMs) * 100}%` }} />
        </div>
      </div>
      </div>
    </div>
  );
};

/** «حان وقت التوقّف»: the app's ending screen, at full size. */
export const EndingStage: React.FC = () => {
  const { T, W, L, lang } = useFilm();
  const { t } = useStage();
  const [a, b] = W.ending;
  if (t < a || t > b) return null;
  const e = content.ending[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const mark = spr(t, a + 0.02, { damping: 16, stiffness: 220 });
  const push = 1 + 0.05 * ramp(t, a, b - a, ease.linear);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.screen }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: L.P ? "0 90px" : "0 300px", transform: `scale(${push})` }}>
        <div style={{ transform: `scale(${1.6 - 0.6 * mark})`, opacity: clamp(mark * 2) }}>
          <Mark size={L.P ? 170 : 150} color={C.text} />
        </div>
        <div style={{ marginTop: L.P ? 64 : 50, fontFamily: DISPLAY, fontWeight: 500, fontSize: L.P ? 124 : 128, lineHeight: 1.25, color: C.text, direction: dir, textAlign: "center" }}>
          <Land at={T.stop + 0.02} t={t}>{e.title}</Land>
        </div>
        <div style={{ height: 2, width: 72, background: "#ffffff30", margin: L.P ? "52px 0" : "40px 0", opacity: clamp(ramp(t, T.stop + 0.3, 0.3)) }} />
        <div style={{ fontFamily: lang === "ar" ? UI : LATIN, fontSize: L.P ? 44 : 42, lineHeight: 1.75, color: "#c9c9c9", maxWidth: L.P ? 880 : 1180, textAlign: "center", direction: dir, opacity: clamp(ramp(t, T.stop + 0.45, 0.45)), transform: `translateY(${(1 - ramp(t, T.stop + 0.45, 0.45, ease.out)) * 20}px)` }}>
          {e.body}
        </div>
      </div>
    </div>
  );
};

/** «ثم عُد إلى يومك»: back to the day, in warm daylight. */
export const DayStage: React.FC = () => {
  const { W, L, copy, tl } = useFilm();
  const { t, W: FW, H: FH } = useStage();
  const [a, b] = W.day;
  if (t < a || t > b) return null;
  const rows = timeRows(copy.day, tl.words("session3"));
  const sun = ramp(t, a, 1.6, ease.out);
  const words = 1 - ramp(t, b - 0.55, 0.4, ease.inOut);
  const r = Math.max(FW, FH) * 0.9;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.paper, opacity: ramp(t, a, 0.45, ease.inOut) }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${r}px ${r * 0.8}px at ${FW * 0.78}px ${FH * (0.1 - 0.06 * sun)}px, rgba(255, 226, 180, ${0.75 * sun}), transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 80px", transform: `scale(${1 + 0.04 * ramp(t, a, b - a)})`, opacity: words, filter: words < 1 ? `blur(${(1 - words) * 8}px)` : undefined }}>
        <KineticRows rows={rows} size={L.P ? 150 : 176} dir={L.rtl ? "rtl" : "ltr"} t={t} lineHeight={1.1} />
      </div>
    </div>
  );
};

/** Free, no ads, no account: three hard cuts, ink and paper. */
export const freeCuts = (T: { free: number; ads: number; freeAccount: number }) => [T.free - 0.1, T.ads - 0.06, T.freeAccount - 0.06];

export const FreeStage: React.FC = () => {
  const { T, W, L, copy } = useFilm();
  const { t } = useStage();
  const [a, b] = W.free;
  if (t < a || t > b) return null;
  const cuts = freeCuts(T);
  let i = 0;
  while (i + 1 < cuts.length && t >= cuts[i + 1]) i++;
  const fadeIn = ramp(t, a, 0.45, ease.inOut);
  if (t < cuts[0]) return <div style={{ position: "absolute", inset: 0, background: C.ink, opacity: fadeIn }} />;
  const dark = i % 2 === 0;
  const k = ramp(t, cuts[i], (i + 1 < cuts.length ? cuts[i + 1] : b) - cuts[i], ease.linear);
  return (
    <div style={{ position: "absolute", inset: 0, background: dark ? C.ink : C.paper, opacity: i === 0 ? fadeIn : 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 60px" }}>
      <div style={{ transform: `scale(${1 + 0.05 * k})` }}>
        <KineticRows rows={[[{ text: copy.free[i], at: cuts[i] + 0.02 }]]} size={L.P ? (L.rtl ? 150 : 132) : 200} dir={L.rtl ? "rtl" : "ltr"} color={dark ? C.text : C.ink} t={t} lineHeight={1.2} />
      </div>
    </div>
  );
};
