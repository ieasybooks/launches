import React from "react";
import { LATIN, UI } from "../../lib/fonts";
import { clamp, ease, ramp, spr, useStage } from "../../lib/motion";
import { C } from "../../theme";
import { useFilm } from "../context";
import { BudgetPill } from "../parts/app";
import { KineticRows, Land, type Word } from "../parts/Kinetic";
import { useSessionMinutes } from "./PhoneStage";

// The big words beside the phone, landing on the narration.
const Block: React.FC<{ rows: Word[][]; out: number; children?: React.ReactNode }> = ({ rows, out, children }) => {
  const { L } = useFilm();
  const { t } = useStage();
  const first = rows[0][0].at;
  if (t < first - 0.1 || t > out) return null;
  const leave = ramp(t, out - 0.3, 0.3, ease.inOut);
  const box: React.CSSProperties = L.P
    ? { position: "absolute", left: L.text.x, width: L.text.w, top: L.text.top }
    : { position: "absolute", left: L.text.x, width: L.text.w, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" };
  return (
    <div style={{ ...box, opacity: 1 - leave, transform: `translateY(${-leave * 30}px)` }}>
      <KineticRows rows={rows} size={L.head} dir={L.rtl ? "rtl" : "ltr"} align={L.text.align} t={t} lineHeight={1.08} />
      {children}
    </div>
  );
};

const Pills: React.FC<{ items: Word[] }> = ({ items }) => {
  const { L } = useFilm();
  const { t } = useStage();
  return (
    <div style={{ display: "flex", gap: 16, marginTop: L.P ? 26 : 36, direction: L.rtl ? "rtl" : "ltr", justifyContent: "flex-start" }}>
      {items.map((p) => (
        <Land key={p.text} at={p.at} t={t} from={1.3}>
          <span style={{ display: "inline-block", padding: L.P ? "10px 26px" : "12px 30px", borderRadius: 999, background: C.ink, color: C.paper, fontFamily: L.rtl ? UI : LATIN, fontWeight: L.rtl ? 600 : 500, fontSize: L.P ? 38 : 40, lineHeight: 1.3 }}>
            {p.text}
          </span>
        </Land>
      ))}
    </div>
  );
};

const Sub: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const { L } = useFilm();
  const { t } = useStage();
  return (
    <div style={{ marginTop: L.P ? 22 : 30, fontFamily: L.rtl ? UI : LATIN, fontSize: L.sub, lineHeight: 1.5, color: C.muted, direction: L.rtl ? "rtl" : "ltr", textAlign: L.text.align }}>
      <Land at={at} t={t} from={1.08}>{text}</Land>
    </div>
  );
};

/** The app's remaining-time pill, enlarged, counting the session's last minutes. */
const BigPill: React.FC<{ from: number }> = ({ from }) => {
  const { L, lang, T } = useFilm();
  const { t } = useStage();
  const minutes = useSessionMinutes();
  const k = spr(t, from, { damping: 15, stiffness: 200 });
  const bump = (at: number) => Math.max(0, 1 - Math.abs(t - at) / 0.22);
  const pulse = Math.max(bump(T.session + 0.3), bump(T.endWord - 0.1));
  const scale = L.P ? 2.4 : 2.7;
  return (
    <div style={{ marginTop: L.P ? 30 : 46, height: 40 * scale, display: "flex", justifyContent: "flex-start", direction: L.rtl ? "rtl" : "ltr", opacity: clamp(ramp(t, from, 0.2)) }}>
      <div style={{ transform: `scale(${scale * (0.8 + 0.2 * k) * (1 + 0.07 * pulse)})`, transformOrigin: L.rtl ? "100% 0" : "0 0", filter: "drop-shadow(0 18px 30px rgba(10,10,10,0.28))" }}>
        <BudgetPill lang={lang} minutes={minutes(t)} style={{ background: C.ink, border: "1px solid #ffffff26" }} />
      </div>
    </div>
  );
};

export const Words: React.FC = () => {
  const { T, W, copy } = useFilm();
  const one = (text: string, at: number): Word[] => [{ text, at }];
  return (
    <>
      <Block rows={[[{ text: copy.easy[0], at: T.watch - 0.3 }, { text: copy.easy[1], at: T.watch + 0.12 }, { text: copy.easy[2], at: T.swipe1 }]]} out={W.wall[0] + 0.1}>
        <Pills items={[{ text: copy.pills[0], at: T.account }, { text: copy.pills[1], at: T.signup }]} />
      </Block>
      <Block rows={[one(copy.curated[0], T.curated + 0.02), one(copy.curated[1], T.care - 0.04)]} out={W.reminder[0] + 0.45}>
        <Sub text={copy.curatedSub} at={T.clean + 0.05} />
      </Block>
      <Block rows={[one(copy.session[0], T.session - 0.05), one(copy.session[1], T.endWord - 0.05)]} out={W.phoneB[1]}>
        <BigPill from={T.session - 0.35} />
      </Block>
    </>
  );
};
