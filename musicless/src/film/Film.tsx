import React from "react";
import { AbsoluteFill, getRemotionEnvironment, Html5Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { loadFonts } from "../lib/fonts";
import { C } from "../theme";
import { FilmProvider, useFilm, type FilmProps } from "./context";
import { Hook } from "./scenes/Hook";
import { Why } from "./scenes/Why";
import { BrowserStage } from "./scenes/BrowserStage";
import { Reasons } from "./scenes/Reasons";
import { Outro } from "./scenes/Outro";
import { SFX_LEN, sfxFile, useSoundEvents } from "./sounds";

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
        <Sequence key={i} from={Math.max(0, Math.round(e.t * fps))} durationInFrames={Math.ceil(((e.fadeOut ?? SFX_LEN[e.name] ?? 8) + 0.1) * fps)}>
          <Html5Audio src={staticFile(sfxFile(e))} volume={e.vol} loop={e.loop} />
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
        <Hook />
        <Why />
        <BrowserStage />
        <Reasons />
        <Outro />
        {/* renders are muted and mixed offline (scripts/mix_audio.py): the audio elements are for the Studio only */}
        {!getRemotionEnvironment().isRendering && <AudioTrack />}
      </AbsoluteFill>
    </FilmProvider>
  );
};
