import React, { useEffect } from "react";
import { FilmProvider, useFilm, type FilmProps } from "./film/context";
import { sfxFile, useSoundEvents } from "./film/sounds";

// Dumps the film's timing and sound events for the offline tools (scripts/measure.mjs).
const Dump: React.FC = () => {
  const { tl, T, W, lang } = useFilm();
  const sfx = useSoundEvents();
  useEffect(() => {
    const SOUND_EVENTS = [
      ...tl.order.map((c) => ({ t: c.start, file: `audio/vo/${lang}/${c.id}.wav`, vol: 1 })),
      ...sfx.map((e) => ({ t: e.t, file: sfxFile(e), vol: e.vol, fadeOut: e.fadeOut, loop: e.loop, from: e.from, dur: e.dur, fadeIn: e.fadeIn, tail: e.tail })),
    ];
    console.log("DIRECTOR:" + JSON.stringify({ lang: tl.lang, DURATION: tl.duration, ORDER: tl.order, T, W, SOUND_EVENTS }));
  }, [tl, T, W, lang, sfx]);
  return null;
};

export const Measure: React.FC<FilmProps> = (props) => (
  <FilmProvider {...props}>
    <Dump />
  </FilmProvider>
);
