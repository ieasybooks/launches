import React from "react";
import { AbsoluteFill, getRemotionEnvironment, Html5Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { useFontsReady } from "../lib/fonts";
import { ease, ramp, useStage } from "../lib/motion";
import { DAY, NIGHT } from "../theme";
import { FilmProvider, useFilm, type FilmProps } from "./context";
import { GirihBand } from "./parts/Brand";
import { Eras } from "./scenes/Eras";
import { Overlays } from "./scenes/Overlays";
import { Free, Outro } from "./scenes/Outro";
import { Stage } from "./scenes/Stage";
import { SFX_LEN, sfxFile, useSoundEvents } from "./sounds";

// Narration, recitation and sound design for the Studio preview; final renders are muted and mixed offline.
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
        <Sequence key={i} from={Math.max(0, Math.round(e.t * fps))} durationInFrames={Math.ceil(((e.dur ?? e.fadeOut ?? SFX_LEN[e.name] ?? 8) + 0.1) * fps)}>
          <Html5Audio src={staticFile(sfxFile(e))} volume={e.vol} loop={e.loop} trimBefore={e.from !== undefined ? Math.round(e.from * fps) : undefined} />
        </Sequence>
      ))}
    </>
  );
};

const Backdrop: React.FC = () => {
  const { T, L } = useFilm();
  const { t, H } = useStage();
  // night falls from the top of the frame down, with a soft edge
  const k = ramp(t, T.night - 0.95, 0.9, ease.inOut);
  const edge = 0.35;
  const at = -edge + k * (1 + 2 * edge);
  const mask = `linear-gradient(to bottom, #000 ${(at - edge) * 100}%, transparent ${(at + edge) * 100}%)`;
  return (
    <>
      <AbsoluteFill style={{ background: DAY.bg }} />
      {k < 1 && <GirihBand height={L.band.h} cell={L.band.cell} />}
      {k > 0 && (
        <AbsoluteFill style={{ WebkitMaskImage: k < 1 ? mask : undefined, maskImage: k < 1 ? mask : undefined }}>
          <AbsoluteFill style={{ background: NIGHT.bg }} />
          <GirihBand height={L.band.h} cell={L.band.cell} night={1} />
        </AbsoluteFill>
      )}
      {/* the page darkens a little toward its edges (the middle stays the app's own paper) */}
      <AbsoluteFill style={{ background: `radial-gradient(125% 95% at 50% ${H > 1500 ? 46 : 50}%, rgba(26,32,54,0) 52%, rgba(26,32,54,${0.07 + 0.1 * k}) 100%)` }} />
    </>
  );
};

export const Film: React.FC<FilmProps> = (props) => {
  const ready = useFontsReady();
  return (
    <FilmProvider {...props}>
      <AbsoluteFill style={{ background: DAY.bg, overflow: "hidden" }}>
        {ready && <Backdrop />}
        {ready && (
          <>
            <Eras />
            <Stage />
            <Overlays />
            <Free />
            <Outro />
          </>
        )}
        {/* renders are muted and mixed offline (scripts/mix_audio.py): the audio elements are for the Studio only */}
        {!getRemotionEnvironment().isRendering && <AudioTrack />}
      </AbsoluteFill>
    </FilmProvider>
  );
};
