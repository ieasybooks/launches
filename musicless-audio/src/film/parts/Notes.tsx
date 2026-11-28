import React from "react";
import { clamp, ease, rand, ramp, spr } from "../../lib/motion";
import { C } from "../../theme";
import { NotePaths, topPieceTransform } from "./Brand";
import { LOGO } from "./logoPaths";

export type NoteSpec = {
  x: number; // centre, px in the parent
  y: number;
  size: number; // height, px
  rot: number; // degrees
  seed: number;
  born: number; // seconds: when it pops in
  snapAt: number; // seconds: when it snaps like the logo and falls apart
};

const G = 2600; // gravity, px/s² at the 1080p reference

/** A music note that pops in, bobs, then snaps exactly as the logo's note does and falls away in its two pieces. */
export const FlyingNote: React.FC<{ spec: NoteSpec; t: number; color?: string; u?: number; bob?: number }> = ({ spec, t, color = C.ink, u = 1, bob = 1 }) => {
  const { x, y, size, rot, seed, born, snapAt } = spec;
  if (t < born) return null;
  const since = t - snapAt;
  if (since > 1.1) return null;
  const s = size / 88; // px per note unit
  const appear = spr(t, born, { stiffness: 320, damping: 14 });
  const wob = Math.sin((t + seed * 3.1) * 2.6) * 7 * u * bob;
  const tilt = Math.sin((t + seed * 1.7) * 2.1) * 6 * bob;
  // the snap: the upper piece turns away (as in the extension), then the pieces fall apart
  const k = since < 0 ? 0 : ease.outQuint(clamp(since / 0.16));
  const fall = Math.max(0, since - 0.06);
  const dir = rand(seed * 7.3) > 0.5 ? 1 : -1;
  const top = {
    dx: dir * (140 + 160 * rand(seed * 3.3)) * u * fall,
    dy: (-(380 + 260 * rand(seed * 5.1)) * fall + 0.5 * G * fall * fall) * u,
    r: dir * (220 + 240 * rand(seed * 9.7)) * fall,
  };
  const low = {
    dx: -dir * (40 + 90 * rand(seed * 2.9)) * u * fall,
    dy: (-(120 + 140 * rand(seed * 4.4)) * fall + 0.5 * G * fall * fall) * u,
    r: -dir * (80 + 160 * rand(seed * 6.1)) * fall,
  };
  const fade = since > 0 ? 1 - ramp(since, 0.42, 0.4, ease.inOut) : 1;
  const flash = since > 0 && since < 0.1 ? 1 - since / 0.1 : 0;
  return (
    <div
      style={{
        position: "absolute", left: x, top: y + (since < 0 ? wob : 0), width: 0, height: 0,
        transform: `rotate(${rot + (since < 0 ? tilt : 0)}deg) scale(${appear})`, opacity: clamp(ramp(t, born, 0.12)) * fade,
      }}
    >
      <svg viewBox="12 6 68 88" width={68 * s} height={88 * s} style={{ position: "absolute", left: -34 * s, top: -44 * s, overflow: "visible" }}>
        {k <= 0 ? (
          <NotePaths k={0} fill={color} />
        ) : (
          <g fill={color} style={{ filter: flash ? `drop-shadow(0 0 ${8 * flash}px ${color})` : undefined }}>
            <g transform={`translate(${low.dx / s} ${low.dy / s}) rotate(${low.r} 34 76)`}>
              <path d={LOW_PATH} />
            </g>
            <g transform={`translate(${top.dx / s} ${top.dy / s}) rotate(${top.r} 58 38)`}>
              <NotesTop k={k} />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

// the two pieces, split out of NotePaths so each can move on its own
const LOW_PATH = LOGO.note.low;
const NotesTop: React.FC<{ k: number }> = ({ k }) => <path d={LOGO.note.top} transform={topPieceTransform(k)} />;

/** A row of staff lines (five), drawn across a width, that can part from the middle outwards. */
export const Staff: React.FC<{ y: number; gap: number; width: number; part: number; color: string; opacity?: number; thickness?: number }> = ({
  y, gap, width, part, color, opacity = 1, thickness = 2,
}) => {
  const half = width / 2;
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const top = y + (i - 2) * gap - thickness / 2;
        const lag = clamp(part * 1.15 - i * 0.03);
        const o = half * ease.inOut(lag);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: 0, top, width: Math.max(0, half - o), height: thickness, background: color, opacity }} />
            <div style={{ position: "absolute", left: half + o, top, width: Math.max(0, half - o), height: thickness, background: color, opacity }} />
          </React.Fragment>
        );
      })}
    </>
  );
};
