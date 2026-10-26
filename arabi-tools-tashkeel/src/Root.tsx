import React from "react";
import { Composition } from "remotion";
import { FILM_DURATION, Film } from "./film/Film";
import { FPS } from "./lib/motion";
import { Measure } from "./Measure";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ArabiToolsTashkeel-16x9" component={Film} width={1920} height={1080} fps={FPS} durationInFrames={Math.ceil(FILM_DURATION * FPS)} />
    <Composition id="ArabiToolsTashkeel-9x16" component={Film} width={1080} height={1920} fps={FPS} durationInFrames={Math.ceil(FILM_DURATION * FPS)} />
    <Composition id="Measure" component={Measure} width={64} height={64} fps={FPS} durationInFrames={1} />
  </>
);
