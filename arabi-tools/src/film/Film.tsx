import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { loadFonts } from "../lib/fonts";
import { DURATION, ORDER } from "../lib/timeline";
import { Background } from "./Background";
import { Brand } from "./scenes/Brand";
import { Free, Privacy } from "./scenes/Free";
import { Hook } from "./scenes/Hook";
import { More } from "./scenes/More";
import { Outro } from "./scenes/Outro";
import { Site } from "./scenes/Site";
import { Tool } from "./scenes/Tool";
import { FILM_SFX, SFX_LEN } from "./sounds";

export const FILM_DURATION = DURATION;

// Narration and sound design for the Studio preview; final renders are muted and mixed offline.
const AudioTrack: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {ORDER.map((c) => (
        <Sequence key={c.id} from={Math.round(c.start * fps)} durationInFrames={Math.ceil((c.dur + 0.2) * fps)}>
          <Html5Audio src={staticFile(`audio/vo/${c.id}.wav`)} />
        </Sequence>
      ))}
      {FILM_SFX.map((e, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(e.t * fps))} durationInFrames={Math.ceil(((e.fadeOut ?? SFX_LEN[e.name] ?? 1) + 0.1) * fps)}>
          <Html5Audio src={staticFile(`audio/sfx/${e.name}.wav`)} volume={e.vol} />
        </Sequence>
      ))}
    </>
  );
};

export const Film: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{ background: "#f8f4ea", overflow: "hidden" }}>
      <Background />
      <Hook />
      <Brand />
      <Tool />
      <Site />
      <Free />
      <Privacy />
      <More />
      <Outro />
      <AudioTrack />
    </AbsoluteFill>
  );
};
