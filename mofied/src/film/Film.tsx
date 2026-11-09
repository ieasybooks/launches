import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { loadFonts } from "../lib/fonts";
import { C } from "../theme";
import { Background } from "./Background";
import { FilmProvider, useFilm, type FilmProps } from "./context";
import { Hook } from "./scenes/Hook";
import { Outro } from "./scenes/Outro";
import { PhoneOpen, PhoneSession } from "./scenes/PhoneStage";
import { DayStage, EndingStage, FreeStage, ReminderStage } from "./scenes/Stages";
import { Turn } from "./scenes/Turn";
import { Wall } from "./scenes/Wall";
import { Words } from "./scenes/Words";
import { SFX_LEN, useSoundEvents } from "./sounds";

// Narration and sound design for the Studio preview; final renders are muted and mixed offline.
const AudioTrack: React.FC = () => {
  const { fps } = useVideoConfig();
  const { tl, lang } = useFilm();
  const sfx = useSoundEvents();
  return (
    <>
      {tl.order.map((c) => (
        <Sequence key={c.id} from={Math.round(c.start * fps)} durationInFrames={Math.ceil((c.dur + 0.2) * fps)}>
          <Html5Audio src={staticFile(`audio/vo/${lang}/${c.id}.wav`)} />
        </Sequence>
      ))}
      {sfx.map((e, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(e.t * fps))} durationInFrames={Math.ceil(((e.fadeOut ?? SFX_LEN[e.name] ?? 1) + 0.1) * fps)}>
          <Html5Audio src={staticFile(`audio/sfx/${e.name}.wav`)} volume={e.vol} loop={e.loop} />
        </Sequence>
      ))}
    </>
  );
};

export const Film: React.FC<FilmProps> = (props) => {
  loadFonts();
  return (
    <FilmProvider {...props}>
      <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
        <Background />
        <Wall />
        <PhoneOpen />
        <Turn />
        <PhoneSession />
        <Words />
        <ReminderStage />
        <EndingStage />
        <DayStage />
        <FreeStage />
        <Outro />
        <Hook />
        <AudioTrack />
      </AbsoluteFill>
    </FilmProvider>
  );
};
