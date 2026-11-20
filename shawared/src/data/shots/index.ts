// The app's recorded screens (capture/capture.mjs), keyed <lang>-<state>. Written by scripts/shots_index.py.
import type { ShotData } from "../../film/parts/Shot";
import s_ar_b2a from "./ar-b2a.json";
import s_ar_b2ajuz from "./ar-b2ajuz.json";
import s_ar_b2b from "./ar-b2b.json";
import s_ar_b2c from "./ar-b2c.json";
import s_ar_night from "./ar-night.json";
import s_ar_open from "./ar-open.json";
import s_ar_p1 from "./ar-p1.json";
import s_ar_poets from "./ar-poets.json";
import s_ar_reciters from "./ar-reciters.json";
import s_ar_sheet from "./ar-sheet.json";
import s_en_b2a from "./en-b2a.json";
import s_en_b2ajuz from "./en-b2ajuz.json";
import s_en_b2b from "./en-b2b.json";
import s_en_b2c from "./en-b2c.json";
import s_en_night from "./en-night.json";
import s_en_open from "./en-open.json";
import s_en_p1 from "./en-p1.json";
import s_en_poets from "./en-poets.json";
import s_en_reciters from "./en-reciters.json";
import s_en_sheet from "./en-sheet.json";
export const SHOTS: Record<string, ShotData> = {
  "ar-b2a": s_ar_b2a as unknown as ShotData,
  "ar-b2ajuz": s_ar_b2ajuz as unknown as ShotData,
  "ar-b2b": s_ar_b2b as unknown as ShotData,
  "ar-b2c": s_ar_b2c as unknown as ShotData,
  "ar-night": s_ar_night as unknown as ShotData,
  "ar-open": s_ar_open as unknown as ShotData,
  "ar-p1": s_ar_p1 as unknown as ShotData,
  "ar-poets": s_ar_poets as unknown as ShotData,
  "ar-reciters": s_ar_reciters as unknown as ShotData,
  "ar-sheet": s_ar_sheet as unknown as ShotData,
  "en-b2a": s_en_b2a as unknown as ShotData,
  "en-b2ajuz": s_en_b2ajuz as unknown as ShotData,
  "en-b2b": s_en_b2b as unknown as ShotData,
  "en-b2c": s_en_b2c as unknown as ShotData,
  "en-night": s_en_night as unknown as ShotData,
  "en-open": s_en_open as unknown as ShotData,
  "en-p1": s_en_p1 as unknown as ShotData,
  "en-poets": s_en_poets as unknown as ShotData,
  "en-reciters": s_en_reciters as unknown as ShotData,
  "en-sheet": s_en_sheet as unknown as ShotData,
};
