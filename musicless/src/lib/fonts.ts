import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Alexandria (OFL, Latin and Arabic) is the film's voice in both languages: the extension already uses it for
// its Arabic headings, and its letters match the Arabic logo. Roboto and Noto Sans Arabic (OFL) stand in for the
// system fonts that Chrome, the Web Store, YouTube and the extension's own pages use.
export const DISPLAY = "'Alexandria', sans-serif";
export const UI = "'Roboto', 'Noto Sans Arabic', sans-serif";
export const UI_AR = "'Noto Sans Arabic', 'Roboto', sans-serif";
/** The extension's Arabic headings: Alexandria at its size-adjust of 84% (pages.css). */
export const PAGE_HEAD_AR = "'Alexandria Page', 'Noto Sans Arabic', sans-serif";

const FACES: [string, string, FontFaceDescriptors][] = [
  ["Alexandria", "fonts/Alexandria.ttf", { weight: "100 900" }],
  ["Alexandria Page", "fonts/Alexandria.ttf", { weight: "100 900", sizeAdjust: "84%" } as FontFaceDescriptors],
  ["Roboto", "fonts/Roboto.ttf", { weight: "100 900" }],
  ["Noto Sans Arabic", "fonts/NotoSansArabic.ttf", { weight: "100 900" }],
];

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("fonts");
  Promise.all(
    FACES.map(async ([family, file, desc]) => {
      const face = new FontFace(family, `url(${staticFile(file)})`, desc);
      await face.load();
      document.fonts.add(face);
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => cancelRender(err));
};
