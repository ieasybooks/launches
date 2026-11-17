import React from "react";
import { Composition } from "remotion";
import { Film } from "./film/Film";
import { FPS } from "./lib/motion";
import { buildTimeline, type Lang } from "./lib/timeline";
import { Measure } from "./Measure";

// One timeline, three frames: 16:9 (YouTube, the web), 9:16 (Shorts, Reels, TikTok, stories) and 4:5 (feeds).
const SHAPES = [["16x9", 1920, 1080], ["9x16", 1080, 1920], ["4x5", 1080, 1350]] as const;
const LANGS: Lang[] = ["en", "ar"];

export const RemotionRoot: React.FC = () => (
  <>
    {LANGS.flatMap((lang) =>
      SHAPES.map(([shape, width, height]) => (
        <Composition
          key={`Musicless-${lang}-${shape}`}
          id={`Musicless-${lang}-${shape}`}
          component={Film}
          width={width}
          height={height}
          fps={FPS}
          durationInFrames={Math.ceil(buildTimeline(lang).duration * FPS)}
          defaultProps={{ lang }}
        />
      )),
    )}
    <Composition id="Measure" component={Measure} width={64} height={64} fps={FPS} durationInFrames={1} defaultProps={{ lang: "en" as Lang }} />
  </>
);
