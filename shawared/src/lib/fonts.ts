import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Shawared's own faces, under the family names the app registers (so recorded screens draw with them as they
// are): Amiri for verses, Readex Pro for the interface in both scripts, Newsreader for English translations and
// Reem Kufi for the wordmark. All four are from Google Fonts (OFL).
export const VERSE = "Amiri_400Regular";
export const VERSE_BOLD = "Amiri_700Bold";
export const UI = "ReadexPro_400Regular";
export const UI_MEDIUM = "ReadexPro_500Medium";
export const UI_SEMI = "ReadexPro_600SemiBold";
export const SERIF = "Newsreader_400Regular";
export const SERIF_ITALIC = "Newsreader_400Regular_Italic";
export const KUFI = "ReemKufi_600SemiBold";

const FACES: [string, string][] = [
  [VERSE, "fonts/Amiri_400Regular.ttf"],
  [VERSE_BOLD, "fonts/Amiri_700Bold.ttf"],
  [UI, "fonts/ReadexPro_400Regular.ttf"],
  [UI_MEDIUM, "fonts/ReadexPro_500Medium.ttf"],
  [UI_SEMI, "fonts/ReadexPro_600SemiBold.ttf"],
  [SERIF, "fonts/Newsreader_400Regular.ttf"],
  [SERIF_ITALIC, "fonts/Newsreader_400Regular_Italic.ttf"],
  [KUFI, "fonts/ReemKufi_600SemiBold.ttf"],
];

let pending: Promise<void> | null = null;
let done = false;
/** True once every face has loaded (text measured before that would use a fallback font). */
export const fontsLoaded = () => done;
export const loadFonts = (): Promise<void> | null => {
  if (pending || typeof document === "undefined") return pending;
  const handle = delayRender("fonts");
  pending = Promise.all(
    FACES.map(async ([family, file]) => {
      const face = new FontFace(family, `url(${staticFile(file)})`);
      await face.load();
      document.fonts.add(face);
    }),
  )
    .then(() => {
      done = true;
      continueRender(handle);
    })
    .catch((err) => cancelRender(err));
  return pending;
};

/** Loads the faces and re-renders once they are in, holding the frame until then (so layouts that measure text
 *  measure it in the film's own fonts). */
export const useFontsReady = () => {
  const [ready, setReady] = useState(done);
  const [handle] = useState(() => (done ? null : delayRender("fonts ready")));
  useEffect(() => {
    if (ready) {
      if (handle !== null) continueRender(handle);
      return;
    }
    loadFonts()?.then(() => setReady(true));
  }, [ready, handle]);
  return ready;
};
