import React from "react";
import { Composition } from "remotion";
import { UITest } from "./UITest";
import { APP_W, WIN_H } from "./ui/theme";
import { FILM_DURATION, Film } from "./film/Film";
import { Measure } from "./Measure";

export const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Aljam3Launch-16x9" component={Film} width={1920} height={1080} fps={FPS} durationInFrames={Math.ceil(FILM_DURATION * FPS)} />
    <Composition id="Aljam3Launch-9x16" component={Film} width={1080} height={1920} fps={FPS} durationInFrames={Math.ceil(FILM_DURATION * FPS)} />
    <Composition id="Measure" component={Measure} width={APP_W} height={WIN_H} fps={30} durationInFrames={1} defaultProps={{ t: 30 }} />
    <Composition id="UITest" component={UITest} width={APP_W} height={WIN_H} fps={30} durationInFrames={1} defaultProps={{ screen: "home" }} />
  </>
);
