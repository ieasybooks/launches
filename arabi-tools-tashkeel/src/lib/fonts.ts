import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// The site's own fonts (src/app/fonts in arabi.tools). Latin comes from Gilroy, Arabic from the
// fonts after it, exactly like the site's stacks.
export const BODY = "'Gilroy', 'Noto Naskh Arabic UI', sans-serif";
export const DISPLAY = "'Gilroy', 'Thmanyah Serif Display', 'Noto Naskh Arabic UI', serif";
export const TRANSCRIPT = "'Kitab', 'Noto Naskh Arabic UI', serif";
// Kitab split in two (scripts/split_font.py): the same shaping, drawing only letters or only marks.
export const LETTERS = "'KitabLetters', 'Noto Naskh Arabic UI', serif";
export const MARKS = "'KitabMarks', serif";
// Time codes: Gilroy's tabular figures keep them from jittering while they count.
export const MONO = "'Gilroy', sans-serif";

const FACES: [string, string, string][] = [
  ["Noto Naskh Arabic UI", "fonts/NotoNaskhArabicUI.ttf", "400 700"],
  ["Thmanyah Serif Display", "fonts/Thmanyah.ttf", "400 700"],
  ["Kitab", "fonts/Kitab.ttf", "400"],
  ["KitabLetters", "fonts/KitabLetters.ttf", "400"],
  ["KitabMarks", "fonts/KitabMarks.ttf", "400"],
  ["Gilroy", "fonts/Gilroy-Regular.woff2", "400"],
  ["Gilroy", "fonts/Gilroy-Medium.woff2", "500"],
  ["Gilroy", "fonts/Gilroy-Bold.woff2", "700"],
];

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("fonts");
  Promise.all(
    FACES.map(async ([family, file, weight]) => {
      const face = new FontFace(family, `url(${staticFile(file)})`, { weight });
      await face.load();
      document.fonts.add(face);
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      cancelRender(err);
    });
};
