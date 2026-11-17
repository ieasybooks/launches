import React from "react";
import { DISPLAY } from "../../lib/fonts";
import { clamp, ease, life, rand, ramp, spr, useStage } from "../../lib/motion";
import { C, SHADOW } from "../../theme";
import { useFilm } from "../context";
import { Icon, type IconName } from "../parts/icons";
import { Land, timeRows } from "../parts/Kinetic";
import { FlyingNote, type NoteSpec } from "../parts/Notes";

const ICONS: IconName[] = ["mic", "film", "book", "chef"];

/** A paper (or ink) panel that rises over the scene before it. */
export const Rise: React.FC<{ t: number; at: number; color: string; children: React.ReactNode; H: number; u: number }> = ({ t, at, color, children, H, u }) => {
  const k = ramp(t, at, 0.6, ease.inOut);
  const r = (1 - k) * 80 * u;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: (1 - k) * H, height: H, background: color, borderRadius: `${r}px ${r}px 0 0`, overflow: "hidden" }}>
      {children}
    </div>
  );
};

export const Why: React.FC = () => {
  const { T, W: win, L, copy, tl, dir } = useFilm();
  const { t, W, H } = useStage();
  const [a, b] = win.why;
  if (t < a || t > b + 0.7) return null;
  const u = L.u;
  const rtl = L.rtl;
  const G = L.why;
  const c = G.cs * u; // the cards' own scale
  const cw = 380 * c;
  const ch = 350 * c;
  const total = G.cols * cw + (G.cols - 1) * G.gapX;
  const left = (W - total) / 2;
  // the cards wait in the middle while they are named, then make room for the headline
  const settle = ramp(t, T.much - 0.45, 0.65, ease.inOut);
  const top = G.solo + (G.top - G.solo) * settle;
  const out = ramp(t, b - 0.35, 0.35, ease.in);
  // reading order: left to right in English, right to left in Arabic, row by row
  const box = (i: number) => {
    const col = rtl ? G.cols - 1 - (i % G.cols) : i % G.cols;
    const row = Math.floor(i / G.cols);
    return { x: left + col * (cw + G.gapX), y: top + row * (ch + G.gapY) };
  };

  // each card carries its music: one note on its corner, then more as the line says so
  const notes: NoteSpec[] = [];
  const [up0, up1] = G.notesUp;
  ICONS.forEach((_, i) => {
    const { x, y } = box(i);
    // "Musicless helps you avoid music": the music goes on «avoid»
    const snapAt = T.avoid - 0.04 + i * 0.09;
    const corner = rtl ? x + 34 * c : x + cw - 34 * c;
    notes.push({ x: corner, y: y - 10 * c, size: 96 * c, rot: rtl ? -12 : 12, seed: 40 + i, born: T.cards[i] + 0.12, snapAt });
    [0, 1, 2].forEach((j) => {
      const s = 100 + i * 10 + j;
      notes.push({
        x: x + cw * (0.16 + 0.34 * j) + (rand(s) - 0.5) * 40 * c,
        y: y - (up0 + (up1 - up0) * rand(s * 1.7)) * u,
        size: (52 + 30 * rand(s * 2.3)) * c,
        rot: (rand(s * 3.1) - 0.5) * 34,
        seed: s,
        born: T.withMusic - 0.1 + (i * 3 + j) * 0.05,
        snapAt,
      });
    });
  });

  // the headline: the line about music, then what it does for you
  const headSize = (L.P ? 62 : 66) * u;
  const textRows = timeRows([copy.whyHead], tl.words("why1"), T.much, T.withMusic + 0.25);
  // the headline stays until the first pill takes its place; its "music" is struck through as the notes snap
  const head1 = life(t, T.much - 0.1, T.pill - 0.05, 0.2, 0.25);
  const strike = ramp(t, T.avoid + 0.02, 0.3, ease.out);
  const pills = clamp(ramp(t, T.pill - 0.2, 0.2, ease.inOut));
  // "…and hear every word": each card gets its voice
  const voiced = (i: number) => ramp(t, T.hear + 0.05 + i * 0.09, 0.5, ease.out);
  // the headline block sits centred in the band above the cards
  const band = L.P ? { top: G.headTop - 40 * u, h: G.top - 120 * u - (G.headTop - 40 * u) } : { top: G.headTop - 20 * u, h: 130 * u };

  return (
    <Rise t={t} at={a} color={C.paper} H={H} u={u}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - out, transform: `translateY(${out * 60 * u}px)` }}>
        {/* headline */}
        <div style={{ position: "absolute", left: 60 * u, right: 60 * u, top: band.top, height: band.h, display: "flex", alignItems: "center", justifyContent: "center", opacity: head1 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: headSize, color: C.ink, direction: dir, textAlign: "center", letterSpacing: dir === "ltr" ? "-0.025em" : 0, lineHeight: L.P ? L.lh : 1.3, textWrap: "balance" } as React.CSSProperties}>
            {textRows[0].map((w, j) => (
              <React.Fragment key={j}>
                {j > 0 && " "}
                <Land at={w.at} t={t}>
                  <span style={{ position: "relative", display: "inline-block" }}>
                    {w.text}
                    {/music|موسيقى/.test(w.text) && (
                      <span style={{ position: "absolute", left: "-3%", right: "-3%", top: "54%", height: Math.max(3, 6 * u), borderRadius: 4 * u, background: C.ink, transformOrigin: dir === "rtl" ? "right" : "left", transform: `scaleX(${strike})` }} />
                    )}
                  </span>
                </Land>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: band.top, height: band.h, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 * u, direction: dir, opacity: pills }}>
          {copy.pills.map((p, i) => {
            const at = i === 0 ? T.pill : T.word;
            const k = spr(t, at - 0.15, { stiffness: 260, damping: 15 });
            return (
              <div
                key={p}
                style={{
                  fontFamily: DISPLAY, fontWeight: 600, fontSize: (L.P ? 50 : 56) * u, color: C.paper, background: C.ink, borderRadius: 60 * u, padding: `${(dir === "rtl" ? 10 : 16) * u}px ${(L.P ? 34 : 40) * u}px`,
                  opacity: clamp(k * 1.5), transform: `scale(${0.7 + 0.3 * k})`, letterSpacing: dir === "ltr" ? "-0.02em" : 0, lineHeight: dir === "rtl" ? 1.45 : 1.15, whiteSpace: "nowrap",
                }}
              >
                {p}
              </div>
            );
          })}
        </div>
        {/* the cards */}
        {ICONS.map((icon, i) => {
          const { x, y } = box(i);
          const k = spr(t, T.cards[i] - 0.08, { stiffness: 230, damping: 16 });
          const v = voiced(i);
          return (
            <div
              key={icon}
              style={{
                position: "absolute", left: x, top: y, width: cw, height: ch, borderRadius: 32 * c, background: C.white, boxShadow: SHADOW,
                opacity: clamp(k * 1.6), transform: `translateY(${(1 - k) * 70 * u}px) scale(${0.9 + 0.1 * k})`,
              }}
            >
              <div style={{ position: "absolute", left: (cw - 176 * c) / 2, top: 44 * c, width: 176 * c, height: 176 * c, borderRadius: "50%", background: C.paper, display: "grid", placeItems: "center" }}>
                <Icon name={icon} size={92 * c} color={C.ink} stroke={1.7} />
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 248 * c, textAlign: "center", fontFamily: DISPLAY, fontWeight: 600, fontSize: 42 * c, color: C.ink, direction: dir, letterSpacing: dir === "ltr" ? "-0.02em" : 0 }}>
                {copy.cards[i]}
              </div>
              {/* once the music has gone: the voice */}
              <div style={{ position: "absolute", left: cw * 0.28, right: cw * 0.28, bottom: -26 * c, height: 52 * c, borderRadius: 26 * c, background: C.ink, opacity: v, transform: `scale(${0.6 + 0.4 * ease.outBack(v)})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 * c }}>
                {Array.from({ length: 9 }, (_, j) => {
                  const hgt = (8 + 22 * Math.abs(Math.sin(t * 7 + j * 1.3 + i))) * c * (j === 0 || j === 8 ? 0.5 : 1);
                  return <div key={j} style={{ width: 5 * c, height: hgt, borderRadius: 3 * c, background: C.paper }} />;
                })}
              </div>
            </div>
          );
        })}
        {notes.map((n) => (
          <FlyingNote key={n.seed} spec={n} t={t} color={C.ink} u={u} />
        ))}
      </div>
    </Rise>
  );
};
