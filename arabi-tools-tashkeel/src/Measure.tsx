import React, { useEffect } from "react";
import { DURATION } from "./lib/timeline";
import { SOUND_EVENTS } from "./film/sounds";
import { T } from "./film/times";

// Dumps the film's timing and sound events for the offline tools (scripts/measure.mjs).
export const Measure: React.FC = () => {
  useEffect(() => {
    console.log("DIRECTOR:" + JSON.stringify({ T, DURATION, SOUND_EVENTS }));
  }, []);
  return null;
};
