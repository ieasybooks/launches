import React from "react";
import { DISPLAY } from "../../lib/fonts";
import { clamp, ease, lerp, rand, ramp, spr, useStage } from "../../lib/motion";
import { C } from "../../theme";
import { useFilm } from "../context";
import { Lockup } from "../parts/Brand";
import { FileCard, Wave } from "../parts/FileCard";
import { Icon } from "../parts/icons";
import { Land, timeRows } from "../parts/Kinetic";
import { FlyingNote, Staff, type NoteSpec } from "../parts/Notes";

/** Notes that stream along the staff. Their snap runs outwards from `origin` like a wave. Some are already there on
 *  the first frame (the film opens mid-song, so its first frame works as a feed thumbnail). */
export const streamNotes = (W: number, cy: number, gap: number, u: number, t: number, snap: number, origin: { x: number; y: number }, count: number, lead = 0): NoteSpec[] =>
  Array.from({ length: count }, (_, i) => {
    const line = i % 5;
    const span = W + 340 * u;
    const speed = (150 + 120 * rand(i * 1.3)) * u;
    const x0 = rand(i * 7.7 + 1) * span;
    // `lead` starts a staff further along its song
    const xAt = (tt: number) => ((((x0 - speed * (tt + lead)) % span) + span) % span) - 170 * u;
    const size = (70 + 60 * rand(i * 2.1)) * u;
    const y = cy + (line - 2) * gap - size * 0.28 + (rand(i * 4.2) - 0.5) * gap * 0.6;
    // the snap runs out from `origin` (from where the notes are as it starts); each note flows on until it is reached
    const snapAt = snap + Math.hypot(xAt(snap) - origin.x, y - origin.y) / (2600 * u);
    const x = xAt(Math.min(t, snapAt));
    return { x, y, size, rot: (rand(i * 5.5) - 0.5) * 30, seed: i + 1, born: i % 4 === 3 ? 0.05 + rand(i * 3.9) * 0.5 : -1, snapAt };
  });

export const Hook: React.FC = () => {
  const { T, W: win, L, copy, tl, lang, dir } = useFilm();
  const { t, W, H } = useStage();
  if (t > win.hook[1]) return null;
  const u = L.u;
  const G = L.hook;
  const s = G.cardW / 400; // the cards are drawn 400 CSS pixels wide
  const cardH = 132 * s;
  const gapY = G.cardGap;
  const stackH = 3 * cardH + 2 * gapY;
  const top0 = G.cardsY - stackH / 2;
  const cx = W / 2;

  // the cards make way for the brand as the website is named
  const away = ramp(t, T.site - 0.25, 0.55, ease.inOut);
  const notesCY = G.cardsY;
  const gap = G.staffGap;
  const notes = [
    ...streamNotes(W, notesCY - G.staff, gap, u, t, T.remove, { x: cx, y: G.cardsY }, 14),
    ...streamNotes(W, notesCY + G.staff, gap, u, t, T.remove, { x: cx, y: G.cardsY }, 14, 3.3).map((n) => ({ ...n, seed: n.seed + 40 })),
  ];
  const part = ramp(t, T.remove + 0.05, 0.75, ease.inOut);
  const staffFade = 1 - ramp(t, T.remove + 0.55, 0.3);
  // after the snap, each file's sound is the voices alone
  const music = 1 - ramp(t, T.remove + 0.1, 0.5, ease.inOut);

  // the question, then what the website now does
  const rows = timeRows(copy.hook, tl.words("hook1"));
  const q1 = 1 - ramp(t, T.remove - 0.1, 0.3, ease.inOut);
  const isMusic = (w: string) => /music|موسيقى/.test(w);
  const strike = ramp(t, T.remove + 0.02, 0.28, ease.out);
  const nowWords = copy.now.split(" ");
  const nowAt = (i: number) => lerp(T.remove + 0.15, T.files + 0.25, i / Math.max(1, nowWords.length - 1));
  const nowOut = ramp(t, T.site - 0.2, 0.3, ease.inOut);
  const headStyle: React.CSSProperties = {
    position: "absolute", left: 40 * u, right: 40 * u, top: G.headTop, fontFamily: DISPLAY, fontWeight: 600, fontSize: G.head, lineHeight: L.lh,
    letterSpacing: dir === "ltr" ? "-0.025em" : 0, color: C.paper, textAlign: "center", direction: dir,
  };

  // the brand and its address
  const lockIn = spr(t, T.site - 0.1, { stiffness: 220, damping: 16 });
  const snapK = ease.outQuint(ramp(t, T.site + 0.18, 0.56, ease.linear));
  const nameK = ramp(t, T.site + 0.04, 0.5, ease.out);
  const urlIn = spr(t, T.website - 0.05, { stiffness: 200, damping: 16 });
  const brandOut = ramp(t, T.paper + 0.2, 0.5, ease.inOut);
  const lockH = 150 * u;

  return (
    <div style={{ position: "absolute", inset: 0, background: C.ink, overflow: "hidden" }}>
      {/* two staves, with the notes riding them */}
      <div style={{ position: "absolute", inset: 0, opacity: staffFade * (1 - away) }}>
        <Staff y={notesCY - G.staff} gap={gap} width={W} part={part} color={C.paper} opacity={0.16} thickness={2.4 * u} />
        <Staff y={notesCY + G.staff} gap={gap} width={W} part={part} color={C.paper} opacity={0.16} thickness={2.4 * u} />
      </div>
      {notes.map((n) => (
        <FlyingNote key={n.seed} spec={n} t={t} color={C.paper} u={u} />
      ))}
      {/* the files, each arriving as it is named (the first is already there) */}
      {copy.files.map((f, i) => {
        const at = i === 0 ? Math.min(0, T.cards[0] - 0.1) : T.cards[i] - 0.1;
        const k = i === 0 ? lerp(0.92, 1, ramp(t, 0, 0.6, ease.out)) : spr(t, at, { stiffness: 230, damping: 17 });
        const y = top0 + i * (cardH + gapY);
        const leave = clamp(away * 1.4 - i * 0.18);
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: cx - G.cardW / 2, top: y, width: 400, transform: `translateY(${(1 - k) * 60 * u + leave * 120 * u}px) scale(${s * (0.9 + 0.1 * k) * (1 - 0.15 * leave)})`,
              transformOrigin: "0 0", opacity: clamp(k * 1.6) * (1 - leave), filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.45))",
            }}
          >
            <FileCard name={f.name} type={f.type} width={400} rtl={L.rtl}>
              <div style={{ marginTop: 6, display: "flex", justifyContent: "center" }}>
                <Wave width={360} height={40} t={t} music={music} seed={i * 2.7} />
              </div>
            </FileCard>
          </div>
        );
      })}
      {/* the question */}
      <div style={{ ...headStyle, opacity: q1 }}>
        {rows.map((row, i) => (
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
      {/* now for your audio files */}
      {t > T.remove && (
        <div style={{ ...headStyle, top: G.headTop + G.head * L.lh * 0.5, opacity: 1 - nowOut }}>
          {nowWords.map((w, i) => (
            <React.Fragment key={i}>
              {i > 0 && " "}
              <Land at={nowAt(i)} t={t}>{w}</Land>
            </React.Fragment>
          ))}
        </div>
      )}
      {/* the brand, and the website's address */}
      {t > T.site - 0.2 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: L.brandY - lockH * 0.62, display: "flex", justifyContent: "center", opacity: clamp(lockIn * 1.5) * (1 - brandOut), transform: `scale(${0.8 + 0.2 * lockIn})` }}>
            <Lockup lang={lang} height={lockH} k={snapK} name={nameK} color={C.paper} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: L.brandY + lockH * 0.62 + 40 * u, display: "flex", justifyContent: "center", opacity: clamp(urlIn * 1.5) * (1 - brandOut), transform: `translateY(${(1 - urlIn) * 24 * u}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 * u, height: 84 * u, padding: `0 ${34 * u}px`, borderRadius: 42 * u, border: `${2 * u}px solid ${C.inkLine}`, direction: "ltr" }}>
              <Icon name="globe" size={32 * u} color={C.paper} stroke={2} />
              <span style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 40 * u, color: C.paper }}>{copy.url}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
