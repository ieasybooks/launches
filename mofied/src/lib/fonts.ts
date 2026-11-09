import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// The app's own fonts (packages/design/assets/fonts in the mofied repository): Thmanyah for titles,
// Noto Naskh Arabic UI for interface text, Kitab for Quran text and Gilroy for Latin and time labels.
export const DISPLAY = "'Thmanyah', 'Noto Naskh Arabic UI', serif";
export const UI = "'Noto Naskh Arabic UI', 'Gilroy', sans-serif";
export const LATIN = "'Gilroy', 'Noto Naskh Arabic UI', sans-serif";
export const QURAN = "'Kitab', 'Noto Naskh Arabic UI', serif";

const FACES: [string, string, string][] = [
  ["Thmanyah", "fonts/Thmanyah.ttf", "500"],
  ["Noto Naskh Arabic UI", "fonts/NotoNaskhArabicUI-400.ttf", "400"],
  ["Noto Naskh Arabic UI", "fonts/NotoNaskhArabicUI-600.ttf", "600"],
  ["Kitab", "fonts/Kitab-Regular.ttf", "400"],
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
    .catch((err) => cancelRender(err));
};
