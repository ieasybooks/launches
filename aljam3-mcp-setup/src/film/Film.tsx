import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { loadFonts } from "../lib/fonts";
import { DURATION, ORDER } from "../lib/timeline";
import { easeInOutCubic, easeOutCubic, prog, useT } from "../lib/time";
import { WIN_H, WIN_W } from "../ui/theme";
import { NightBg, StageBg } from "./Backgrounds";
import { BrowserWindow } from "./Browser";
import { SFX, T } from "./director";
import { I, IntroForeground, bloomRadius } from "./Intro";
import { W, WIN } from "./layout";
import { O, OutroForeground, outroFrame, outroNight } from "./Outro";
import { Panel } from "./Panel";
import { FILM_SFX, FilmSfx, SFX_LEN } from "./sounds";

loadFonts();

const AudioTrack: React.FC = () => {
  const { fps } = useVideoConfig();
  const events: FilmSfx[] = [...FILM_SFX, ...SFX];
  return (
    <>
      {ORDER.map((c) => (
        <Sequence key={c.id} from={Math.round(c.start * fps)} durationInFrames={Math.ceil((c.dur + 0.1) * fps)} layout="none">
          <Html5Audio src={staticFile(`audio/vo/${c.id}.wav`)} />
        </Sequence>
      ))}
      {events.map((e, i) => {
        const len = SFX_LEN[e.name] ?? 1;
        const fadeOut = e.fadeOut ?? null;
        return (
          <Sequence key={`s${i}`} from={Math.max(0, Math.round(e.t * fps))} durationInFrames={Math.ceil((fadeOut ?? len) * fps) + 2} layout="none">
            <Html5Audio
              src={staticFile(`audio/sfx/${e.name}.wav`)}
              volume={(f) => {
                if (fadeOut === null) return e.vol;
                const s = f / fps;
                return e.vol * Math.min(1, s / 2) * (1 - prog(s, fadeOut - 3, fadeOut));
              }}
            />
          </Sequence>
        );
      })}
    </>
  );
};

export const Film: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const t = useT();
  const bloom = bloomRadius(t);
  const night = outroNight(t);
  const stageVisible = t >= I.bloom - 0.05 && night < 1;
  // the browser rises onto the stage, and leaves for the outro
  const launch = prog(t, T.launch, T.launch + 0.9, easeOutCubic);
  const frame = outroFrame(t);
  const panelIn = prog(t, T.launch + 0.3, T.launch + 1.3, (x) => x);
  const panelOut = 1 - prog(t, O.start() - 0.2, O.start() + 0.4, easeInOutCubic);
  const scale = WIN.s * (0.92 + 0.08 * launch) * frame.scale;
  const cx = WIN.x + WIN.w / 2 + frame.dx;
  const cy = WIN.y + WIN.h / 2 + frame.dy + (1 - launch) * 80;
  const drift = t * 6;
  const mask = t < I.bloom + 1 ? `radial-gradient(circle at 50% 50%, #000 ${Math.max(0, bloom - 90)}px, transparent ${bloom + 40}px)` : undefined;
  return (
    <AbsoluteFill style={{ background: "#000", direction: "rtl", overflow: "hidden" }}>
      <NightBg u={1} glow={0.75} glowX={50} glowY={50} pattern={t < I.bloom ? 0 : night} drift={drift} />
      {stageVisible ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - night, maskImage: mask, WebkitMaskImage: mask }}>
          <StageBg u={1} drift={drift} />
        </div>
      ) : null}
      <IntroForeground t={t} />
      {launch > 0 && frame.opacity > 0 ? (
        <div
          style={{
            position: "absolute",
            left: cx - (WIN_W * scale) / 2,
            top: cy - (WIN_H * scale) / 2,
            width: WIN_W,
            height: WIN_H,
            transformOrigin: "0 0",
            transform: `scale(${scale})`,
            opacity: frame.opacity * Math.min(1, launch * 1.8),
            borderRadius: 14,
            boxShadow: "0 50px 140px rgba(90,48,30,0.26), 0 14px 36px rgba(90,48,30,0.16)",
            direction: "ltr",
          }}
        >
          <BrowserWindow t={t} />
        </div>
      ) : null}
      <Panel t={t} appear={panelIn} fade={panelOut} />
      <OutroForeground t={t} />
      {audio ? <AudioTrack /> : null}
    </AbsoluteFill>
  );
};

export const FILM_DURATION = DURATION;
export const FILM_W = W;
