// Shawared's palette (packages/design in the shawared repository): day paper and ink, night blue, saffron for
// the nuqta and what is active. The film's own frames use the app's colours, so a frame and the app's page
// are the same paper.
export const DAY = {
  bg: "#F3F0E8",
  raise: "#FBF9F4",
  fold: "#EAE5D8",
  fg: "#1A2036",
  muted: "#5A6283",
  accent: "#B8650C",
  accentSoft: "#F1DFC6",
  line: "#E0D9CB",
  line2: "#CDC5B4",
};
export const NIGHT = {
  bg: "#12151F",
  raise: "#1D2231",
  fold: "#181C29",
  fg: "#ECE7DC",
  muted: "#B3B7C8",
  accent: "#E0A458",
  accentSoft: "#3D2C18",
  line: "#2A3042",
  line2: "#3B4259",
};
/** The cover tile keeps its night blue and girih in both themes. */
export const TILE = { bg: "#1A2036", fg: "#F3F0E8", girih: "#E0A458" };
/** A verse word not yet heard: the ink at a low strength on paper. */
export const UNHEARD = "rgba(26, 32, 54, 0.22)";

/** Mixes two hex colours (k = 0 gives a, 1 gives b). */
export const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * Math.min(1, Math.max(0, k))));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};
