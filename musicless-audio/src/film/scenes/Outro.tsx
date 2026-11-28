import React from "react";
import { DISPLAY } from "../../lib/fonts";
import { clamp, ease, ramp, spr, useStage } from "../../lib/motion";
import { C } from "../../theme";
import { useFilm } from "../context";
import { Lockup } from "../parts/Brand";
import { Icon } from "../parts/icons";
import { VoiceLine } from "../parts/VoiceLine";

// The end card: the lockup, the tool's own line ("Remove music from your audio files."), the website's address typed
// out as "Try it now" is said, and the tool's privacy line. The voice line runs along the bottom to the last frame.
export const typingOf = (T: { outro: number; try: number }, url: string) => {
  const at = T.try - 0.05;
  return { at, step: Math.min(0.06, 1.1 / Array.from(url).length) };
};

export const Outro: React.FC = () => {
  const { T, W: win, L, copy, site, lang, dir } = useFilm();
  const { t, W } = useStage();
  const [a] = win.outro;
  if (t < a) return null;
  const u = L.u;
  const O = L.outro;
  const y = (off: number) => O.top + off;
  const lock = spr(t, a + 0.25, { stiffness: 200, damping: 16 });
  const snap = ease.outQuint(ramp(t, a + 0.52, 0.56, ease.linear));
  const name = ramp(t, a + 0.35, 0.5, ease.out);
  const line = spr(t, a + 0.7, { stiffness: 160, damping: 18 });
  const urlK = spr(t, T.try - 0.25, { stiffness: 200, damping: 16 });
  const typing = typingOf(T, copy.url);
  const typedN = Math.max(0, Math.floor((t - typing.at) / typing.step));
  const typed = Array.from(copy.url).slice(0, typedN).join("");
  const privK = spr(t, T.ctaSite + 0.2, { stiffness: 180, damping: 18 });
  return (
    <div style={{ position: "absolute", inset: 0, background: C.paper, opacity: clamp(ramp(t, a, 0.35, ease.inOut)) }}>
      <VoiceLine t={t} y={O.voiceY} width={W} u={u} at={a + 0.4} color={C.ink} amp={30} fade={1 - 0.55 * clamp(ramp(t, a + 0.4, 0.6))} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y(0), display: "flex", justifyContent: "center", opacity: clamp(lock * 1.5), transform: `scale(${0.85 + 0.15 * lock})` }}>
        <Lockup lang={lang} height={O.lockH} k={snap} name={name} color={C.ink} />
      </div>
      <div style={{ position: "absolute", left: 60 * u, right: 60 * u, top: y(O.line), textAlign: "center", direction: dir, fontFamily: DISPLAY, fontWeight: 500, fontSize: 48 * u, lineHeight: 1.35, color: C.muted, opacity: clamp(line * 1.4), transform: `translateY(${(1 - line) * 20 * u}px)` }}>
        {String(site.intro)}
      </div>
      {/* the address, typed */}
      <div style={{ position: "absolute", left: 0, right: 0, top: y(O.url), display: "flex", justifyContent: "center", opacity: clamp(urlK * 1.5), transform: `translateY(${(1 - urlK) * 24 * u}px)` }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 18 * u, height: 96 * u, minWidth: 820 * u, boxSizing: "border-box", padding: `0 ${36 * u}px`, borderRadius: 48 * u,
            background: C.white, boxShadow: "0 18px 40px -20px rgba(31,29,26,0.45), 0 2px 6px rgba(31,29,26,0.08)", direction: "ltr",
          }}
        >
          <Icon name="globe" size={36 * u} color={C.ink} stroke={2.2} />
          <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 44 * u, color: C.ink, whiteSpace: "nowrap" }}>
            {typed}
            <span style={{ display: "inline-block", width: 3 * u, height: 48 * u, marginInlineStart: 4 * u, verticalAlign: "-8%", background: C.ink, opacity: typedN >= Array.from(copy.url).length && Math.floor(t * 2.2) % 2 === 1 ? 0 : 1 }} />
          </span>
        </div>
      </div>
      {/* the tool's privacy line */}
      <div style={{ position: "absolute", left: 0, right: 0, top: y(O.privacy), display: "flex", justifyContent: "center", alignItems: "center", gap: 14 * u, direction: dir, opacity: clamp(privK * 1.4), transform: `translateY(${(1 - privK) * 16 * u}px)` }}>
        <Icon name="lock" size={36 * u} color={C.muted} stroke={2} />
        <span style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 38 * u, color: C.muted }}>{String(site.local)}</span>
      </div>
    </div>
  );
};
