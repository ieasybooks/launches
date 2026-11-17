import React from "react";
import { DISPLAY } from "../../lib/fonts";
import { clamp, ease, lerp, life, rand, ramp, spr, useStage } from "../../lib/motion";
import { C, SHADOW_DARK } from "../../theme";
import { useFilm } from "../context";
import { Lockup } from "../parts/Brand";
import { Cursor, cursorAt } from "../parts/Cursor";
import { Land, timeRows } from "../parts/Kinetic";
import { FlyingNote, Staff, type NoteSpec } from "../parts/Notes";
import { Player, playerButton } from "../parts/Player";
import { VoiceLine } from "../parts/VoiceLine";

/** The notes that stream along the staff before the click. Their snap runs outwards from the click like a wave.
 *  Some are already there on the first frame (the film opens mid-song). */
export const hookNotes = (W: number, cy: number, gap: number, u: number, t: number, snap: number, origin: { x: number; y: number }, count = 30): NoteSpec[] =>
  Array.from({ length: count }, (_, i) => {
    const line = i % 5;
    const span = W + 340 * u;
    const speed = (150 + 120 * rand(i * 1.3)) * u;
    const x0 = rand(i * 7.7 + 1) * span;
    const tt = Math.min(t, snap);
    const x = ((((x0 - speed * tt) % span) + span) % span) - 170 * u;
    const size = (78 + 64 * rand(i * 2.1)) * u;
    // the note's head sits on its line
    const y = cy + (line - 2) * gap - size * 0.28 + (rand(i * 4.2) - 0.5) * gap * 0.6;
    const dist = Math.hypot(x - origin.x, y - origin.y);
    return { x, y, size, rot: (rand(i * 5.5) - 0.5) * 30, seed: i + 1, born: -0.3 + rand(i * 3.9) * 0.8, snapAt: snap + dist / (2600 * u) };
  });

export const Hook: React.FC = () => {
  const { T, W: win, L, copy, tl, lang, dir } = useFilm();
  const { t, W, H } = useStage();
  if (t > win.meet[1] + 0.1) return null;
  const u = L.u;
  const { pw, cy, headTop, head, tallRows } = L.hook;
  const ph = (pw * 9) / 16;
  const px = (W - pw) / 2;
  const py = cy - ph / 2;
  const gap = 66 * u;
  const btn = playerButton(pw);
  const button = { x: px + btn.x, y: py + btn.y };
  const on = t >= T.snap - 0.04;

  // the player leaves as the brand arrives
  const leave = ramp(t, T.hookEnd + 0.05, 0.5, ease.inOut);
  // the first frame is already the scene (it is the thumbnail in a feed): only a slight settle
  const enter = ramp(t, 0, 0.6, ease.out);
  const playerScale = lerp(1.04, 1, enter) * lerp(1, 0.86, leave);

  // the cursor comes in for the click
  const cur = cursorAt(
    t,
    [
      { at: T.hook1End - 0.7, x: W + 60 * u, y: H + 40 * u },
      { at: T.snap - 0.06, x: button.x, y: button.y, move: 0.62 },
    ],
    [T.snap - 0.04],
  );
  const curOpacity = clamp(ramp(t, T.hook1End - 0.7, 0.2)) * (1 - ramp(t, T.snap + 0.45, 0.3));
  const hover = clamp(1 - Math.hypot(cur.x - button.x, cur.y - button.y) / (60 * u));

  const notes = hookNotes(W, cy, gap, u, t, T.snap, button, L.P ? 22 : 30);
  const part = ramp(t, T.snap + 0.05, 0.75, ease.inOut);
  const staffFade = 1 - ramp(t, T.snap + 0.55, 0.3);

  // the headline: the first question, then its answer
  const hookRows = tallRows ? copy.hookTall : copy.hook;
  const rows1 = timeRows(hookRows[0], tl.words("hook1"));
  const rows2 = timeRows(hookRows[1], tl.words("hook2"));
  const q1 = 1 - ramp(t, T.voicesLine - 0.12, 0.22, ease.inOut);
  const q2 = 1 - ramp(t, T.hookEnd + 0.05, 0.35, ease.inOut);
  const isMusic = (w: string) => /music|الموسيقى/.test(w);
  const isVoice = (w: string) => /voices|الأصوات|البشرية/.test(w);
  const strike = ramp(t, T.snap + 0.02, 0.28, ease.out);
  const headStyle: React.CSSProperties = {
    position: "absolute", left: 40 * u, right: 40 * u, top: headTop, fontFamily: DISPLAY, fontWeight: 600, fontSize: head, lineHeight: L.lh,
    letterSpacing: dir === "ltr" ? "-0.025em" : 0, color: C.paper, textAlign: "center", direction: dir,
  };

  // the brand
  const now = life(t, T.now - 0.1, T.name - 0.05, 0.2, 0.25);
  const lockIn = spr(t, T.name - 0.12, { stiffness: 220, damping: 16 });
  const snapK = ease.outQuint(ramp(t, T.name + 0.16, 0.56, ease.linear));
  const nameK = ramp(t, T.name + 0.02, 0.5, ease.out);
  const brandOut = ramp(t, win.meet[1] - 0.05, 0.3);
  const lockH = 132 * u;

  return (
    <div style={{ position: "absolute", inset: 0, background: C.ink, overflow: "hidden" }}>
      {/* the staff, with the notes riding it */}
      <div style={{ position: "absolute", inset: 0, opacity: staffFade }}>
        <Staff y={cy} gap={gap} width={W} part={part} color={C.paper} opacity={0.2} thickness={2.4 * u} />
      </div>
      {/* the voice that stays */}
      <VoiceLine t={t} y={lerp(cy, H * 0.8, ramp(t, T.hookEnd, 0.8, ease.inOut))} width={W} u={u} at={T.voicesLine - 0.1} color={C.paper} fade={brandOut} />
      {/* the video */}
      <div
        style={{
          position: "absolute", left: px, top: py, width: pw, height: ph, opacity: 1 - leave, transform: `scale(${playerScale})`,
          borderRadius: 18 * u, boxShadow: SHADOW_DARK,
        }}
      >
        <Player w={pw} t={t} playFrom={0} srcStart={0.3} on={on} hover={hover} lang={lang} radius={18 * u} />
      </div>
      {/* the music */}
      {notes.map((n) => (
        <FlyingNote key={n.seed} spec={n} t={t} color={C.paper} u={u} />
      ))}
      <Cursor x={cur.x} y={cur.y} size={44 * u} opacity={curOpacity} press={cur.press} ripple={cur.ripple} />
      {/* the question */}
      <div style={{ ...headStyle, opacity: q1 }}>
        {rows1.map((row, i) => (
          <div key={i}>
            {row.map((w, j) => (
              <React.Fragment key={j}>
                {j > 0 && " "}
                <Land at={w.at} t={t}>
                  <span style={{ position: "relative", display: "inline-block" }}>
                    {w.text}
                    {isMusic(w.text) && (
                      <span style={{ position: "absolute", left: "-4%", right: "-4%", top: "54%", height: Math.max(3, 7 * u), borderRadius: 4 * u, background: C.paper, transformOrigin: dir === "rtl" ? "right" : "left", transform: `scaleX(${strike})` }} />
                    )}
                  </span>
                </Land>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
      <div style={{ ...headStyle, top: headTop + ((rows1.length - rows2.length) * head * L.lh) / 2, opacity: q2 * clamp(ramp(t, T.voicesLine - 0.1, 0.1)) }}>
        {rows2.map((row, i) => (
          <div key={i}>
            {row.map((w, j) => (
              <React.Fragment key={j}>
                {j > 0 && " "}
                <Land at={w.at} t={t}>
                  <span style={isVoice(w.text) ? { background: C.paper, color: C.ink, padding: "0 0.18em", borderRadius: 10 * u, boxDecorationBreak: "clone" } : undefined}>{w.text}</span>
                </Land>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
      {/* now you can — then the brand */}
      {t > T.now - 0.2 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: L.brandY - 60 * u, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 104 * u, color: C.paper, direction: dir, opacity: now, letterSpacing: dir === "ltr" ? "-0.03em" : 0 }}>
            <Land at={T.now} t={t}>{copy.now}</Land>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: L.brandY - lockH * 0.62, display: "flex", justifyContent: "center", opacity: clamp(lockIn * 1.5) * (1 - brandOut), transform: `scale(${0.8 + 0.2 * lockIn})` }}>
            <Lockup lang={lang} height={lockH} k={snapK} name={nameK} color={C.paper} />
          </div>
        </>
      )}
    </div>
  );
};
