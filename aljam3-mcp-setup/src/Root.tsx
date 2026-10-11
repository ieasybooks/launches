import React from "react";
import { Composition } from "remotion";
import { FILM_DURATION, Film } from "./film/Film";
import { Measure } from "./Measure";

export const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="McpSetup-16x9" component={Film} width={1920} height={1080} fps={FPS} durationInFrames={Math.ceil(FILM_DURATION * FPS)} />
    <Composition id="Measure" component={Measure} width={320} height={180} fps={FPS} durationInFrames={1} />
  </>
);
