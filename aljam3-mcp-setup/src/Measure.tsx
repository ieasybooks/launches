import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { CAMS, CLICKS, CURSOR, LAG, SFX, SHOTS, SPOTS, T, shotsAt } from "./film/director";
import { videoAt } from "./film/clips";
import { SOUND_EVENTS } from "./film/sounds";
import { DURATION } from "./lib/timeline";

/** Logs the director's data (timings, sounds, shots) for the offline mixer and the choreography check. */
export const Measure: React.FC = () => {
  const [handle] = useState(() => delayRender("measure"));
  useEffect(() => {
    const shots = SHOTS.map((s) => ({ id: s.id, scene: s.scene, clip: s.clip, f0: s.f0, f1: s.f1, anchors: s.anchors }));
    // each highlight with the recording frame it sits on (for scripts/check_boxes.py)
    const spots = SPOTS.map((sp) => {
      const tm = Math.min(sp.t0 + 0.45, (sp.t0 + sp.t1) / 2);
      const { cur } = shotsAt(tm);
      return { ...sp, tm, clip: cur.clip, v: videoAt(cur, tm) };
    });
    console.log("DIRECTOR:" + JSON.stringify({ T, SFX, CURSOR, CLICKS, CAMS, DURATION, SOUND_EVENTS, LAG, SHOTS: shots, SPOTS: spots }));
    continueRender(handle);
  }, [handle]);
  return <AbsoluteFill style={{ background: "#000" }} />;
};
