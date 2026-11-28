import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

// Alexandria (OFL, Latin and Arabic) is the film's voice in both languages: the website already uses it for its
// Arabic headings, and its letters match the Arabic logo. The phone draws the website with Android's own fonts:
// Roboto for Latin, Noto Naskh Arabic for Arabic and Noto Sans Mono for monospace (all OFL), and the website's own
// Alexandria subset for its Arabic headings, with the same unicode-range as its @font-face.
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
  ["Noto Naskh Arabic", "fonts/NotoNaskhArabic.ttf", { weight: "400 700" }],
  ["Noto Sans Mono", "fonts/NotoSansMono.ttf", { weight: "100 900" }],
  ["Alexandria Site", "site/alexandria-arabic.woff2", { weight: "100 900", unicodeRange: "U+0020, U+00A0, U+00AB, U+00BB, U+0600-06FF, U+FB50-FDFF, U+FE70-FEFF" }],
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
