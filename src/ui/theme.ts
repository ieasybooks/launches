// Aljam3 palettes, copied from aljam3-desktop lib/aljam3/ui/theme.rb.
export type Palette = {
  paper: string;
  card: string;
  ink: string;
  muted: string;
  primary: string;
  accent: string;
  surface: string;
  line: string;
  mark: string;
  dark: boolean;
};

export const LIGHT: Palette = {
  paper: "#ffffff",
  card: "#ffffff",
  ink: "#4e3f3b",
  muted: "#827b78",
  primary: "#ae4721",
  accent: "#f5e9e1",
  surface: "#f9f8f8",
  line: "#ede6dc",
  mark: "#f5e9e1",
  dark: false,
};

export const DARK: Palette = {
  paper: "#1e1b1a",
  card: "#2c2828",
  ink: "#ffffff",
  muted: "#b6b2b0",
  primary: "#e16e4a",
  accent: "#284d53",
  surface: "#2c2828",
  line: "#4a4543",
  mark: "#284d53",
  dark: true,
};

// Film palette around the app: warm paper stage and a deep warm night for the intro/outro.
export const FILM = {
  night: "#151110",
  night2: "#221a17",
  stage: "#f5eee6",
  stage2: "#efe4d8",
  terracotta: "#ae4721",
  ember: "#e16e4a",
  sand: "#f5e9e1",
  ink: "#3b2f2c",
  inkSoft: "#7d716c",
  cream: "#fbf7f2",
};

// App metrics from lib/aljam3/ui/components.rb.
export const APP_W = 1160;
export const APP_H = 820;
export const TITLE_H = 34;
export const WIN_H = APP_H + TITLE_H;
export const PAGE_MARGIN = 24;
export const PAGE_TOP = 76;
export const STATUS_H = 32;
export const RADIUS = 6;
