/**
 * The tour's choreography: cursor path, clicks, camera, spotlights, sounds and the app state at any
 * time. Every time comes from the narration (cue/S/E), so regenerating the voice keeps it in sync.
 * Coordinates are in app pixels (1160 × 820, below the window title bar).
 */
import React from "react";
import { cue as C, E, S } from "../lib/timeline";
import { Key, Pt, clamp, easeInOutCubic, easeOutCubic, easeInCubic, keyTimes, prog, typed } from "../lib/time";
import { NavKey, Status } from "../ui/AppShell";
import { APP_W } from "../ui/theme";
import { CategoriesScreen, CategoryPage, DownloadsScreen, HomeScreen, ReaderProps, ReaderScreen, ResultsScreen, SearchUI } from "../ui/screens";
import { AuthorsDialog, BookSearchDialog, CategoryDownloadDialog, ExportDialog, FiltersDialog, ReaderMenu, SelectMenu, SettingsDialog, Toast } from "../ui/dialogs";
import demo from "../data/demo.json";

export type Cam = { z: number; x: number; y: number; zp?: number; xp?: number; portraitOnly?: boolean };
export type Sfx = { t: number; name: string; vol: number };
export type Spot = { t0: number; t1: number; x: number; y: number; w: number; h: number; r?: number };

export const CURSOR: Key<Pt>[] = [];
export const CLICKS: number[] = [];
export const CAMERA: Key<Cam>[] = [];
export const SFX: Sfx[] = [];
export const SPOTS: Spot[] = [];
export const TYPING: { t: number }[] = [];
/** Clicks that had to wait for the cursor (want = the spoken cue they belong to). */
export const LAG: { want: number; t: number; x: number; y: number }[] = [];

const move = (t: number, x: number, y: number, d = 0.5) => CURSOR.push({ t, v: { x, y }, d, e: easeInOutCubic });
const click = (t: number, vol = 0.42) => {
  CLICKS.push(t);
  SFX.push({ t, name: "ui_click", vol });
  return t;
};
/** Camera key; portrait zooms further (zp overrides the automatic boost) and can aim elsewhere (xp, e.g. at the
 * right edge so right-to-left text keeps its start in view). */
const cam = (t: number, z: number, x: number, y: number, d = 0.8, zp?: number, xp?: number) => CAMERA.push({ t, v: { z, x, y, zp, xp }, d, e: easeInOutCubic });
/** Camera key used by the portrait framing only (the landscape camera ignores it). */
const camPortrait = (t: number, z: number, x: number, y: number, d = 0.8) => CAMERA.push({ t, v: { z, x, y, zp: z, xp: x, portraitOnly: true }, d, e: easeInOutCubic });
const RIGHT = APP_W;
const LEFT = 0;
const sfx = (t: number, name: string, vol: number) => SFX.push({ t, name, vol });
const spot = (t0: number, t1: number, x: number, y: number, w: number, h: number, r = 8) => SPOTS.push({ t0, t1: Math.max(t1, t0 + 0.9), x, y, w, h, r });
const keys = (text: string, t0: number, cps: number) =>
  keyTimes(text, t0, cps).forEach((t, i) => {
    sfx(t - 0.012, `key${i % 4}`, 0.32);
    TYPING.push({ t });
  });
/** Click "press" amount: quick dip and release around the click time. */
export const press = (t: number, tc: number | undefined) => (tc === undefined ? 0 : clamp(1 - Math.abs(t - tc - 0.03) / 0.11));
const appear = (t: number, open: number, close = Infinity, din = 0.18, dout = 0.14) =>
  prog(t, open, open + din, easeOutCubic) * (1 - prog(t, close, close + dout, easeInCubic));

// ---------------------------------------------------------------- timings
export const T = {} as Record<string, number>;

// The cursor works through one action at a time: `free` is when it is available again.
let free = 0;
/** Move to (x, y) and click at `want` (a spoken cue), never before the cursor has arrived. */
const goClick = (want: number, x: number, y: number, d = 0.42) => {
  const start = Math.max(free, want - d - 0.06);
  move(start, x, y, d);
  const t = click(Math.max(want, start + d + 0.04));
  LAG.push({ want, t, x, y });
  free = t + 0.1;
  return t;
};
/** Move to (x, y) without clicking (hover). */
const goTo = (want: number, x: number, y: number, d = 0.35) => {
  const start = Math.max(free, want);
  move(start, x, y, d);
  free = start + d;
  return free;
};
/** Type `text` from `want` (or as soon as the cursor is free). Returns [start, end]. */
const typeText = (want: number, text: string, cps: number) => {
  const start = Math.max(free, want);
  keys(text, start, cps);
  const end = start + Array.from(text).length / cps;
  free = end + 0.05;
  return [start, end];
};

// Window launch (intro hands over to the tour)
T.launch = C("now", "جهازك") - 0.1;
T.tourStart = T.launch;
CURSOR.push({ t: 0, v: { x: 640, y: 600 }, d: 0.01 });
cam(0, 1, 580, 410, 0.01);

// Chapter 1 — search
T.ch1 = S("search1") - 0.8;
T.cursorIn = T.ch1 + 0.1;
free = T.ch1 + 0.15;
cam(T.ch1 + 0.05, 1.6, 900, 205, 0.9);
T.modeClick = goClick(C("search1", "عناوين") + 0.05, 1001, 158, 0.55);
T.modeChoose = goClick(C("search1", "نصوصها") + 0.06, 964, 256, 0.32);
T.fieldClick = goClick(S("search2"), 1010, 210, 0.36);
cam(T.fieldClick - 0.3, 1.6, 900, 212, 0.6);
T.typeCps = 22;
[T.typeStart, T.typeEnd] = typeText(T.fieldClick + 0.12, demo.query, T.typeCps);
cam(T.typeEnd + 0.02, 1, 580, 410, 0.55);
T.submit = goClick(C("search2", "لترى"), 70, 210, 0.42);
T.results = T.submit + 0.12;
T.resultsShown = T.submit + 0.45;
cam(T.submit + 0.3, 1.42, 760, 452, 0.8, undefined, RIGHT);
spot(Math.max(C("search2", "كل") - 0.1, T.resultsShown), C("search2", "مع"), 33, 401, 1094, 84);
spot(C("search2", "اسم") - 0.05, C("search2", "ورقم") - 0.02, 798, 328, 334, 74);
spot(C("search2", "ورقم") - 0.02, E("search2") + 0.45, 970, 513, 158, 34);
cam(E("search2") + 0.05, 1.08, 580, 470, 0.8);
// filters: author → Nawawi
T.filters = goClick(S("search3") + 0.05, 643, 158, 0.45);
cam(T.filters + 0.05, 1.55, 580, 420, 0.7);
spot(Math.max(C("search3", "المكتبة"), T.filters + 0.3), C("search3", "التصنيف") - 0.06, 386, 346, 388, 50);
spot(C("search3", "التصنيف"), C("search3", "المؤلف") - 0.06, 386, 394, 388, 50);
T.authorRow = goClick(C("search3", "المؤلف") + 0.1, 542, 468, 0.38);
T.authorsOpen = T.authorRow + 0.05;
[T.authorTypeStart, T.authorTypeEnd] = typeText(T.authorsOpen + 0.22, "النووي", 24);
T.authorResults = T.authorTypeEnd + 0.15;
T.authorPick = goClick(T.authorResults + 0.42, 600, 358, 0.32);
T.filtersBack = T.authorPick + 0.05;
T.apply = goClick(T.authorPick + 0.55, 444, 530, 0.36);
T.filtered = T.apply + 0.15;
cam(T.apply + 0.1, 1.08, 580, 470, 0.8, 1.12, 640);

// Chapter 2 — reading
T.ch2 = Math.max(S("read1") - 1.0, T.filtered + 0.25);
T.open = goClick(C("read1", "افتح") + 0.05, 147, 578, 0.5);
T.reader = T.open + 0.1;
cam(T.open + 0.15, 1, 580, 410, 0.6);
cam(Math.max(C("read1", "بجانب") - 0.1, T.reader + 0.5), 1.28, 585, 500, 0.85, 1.28, RIGHT);
// portrait can't fit both panes: it frames the text as it is named, then pans to the page image
camPortrait(Math.max(C("read1", "النص") - 0.3, T.reader + 0.4), 1.28, RIGHT, 500, 0.6);
cam(C("read1", "صورة") - 0.15, 1.28, 585, 500, 0.7, 1.28, LEFT);
spot(Math.max(C("read1", "النص"), T.reader + 0.55), C("read1", "صورة") - 0.05, 921, 432, 152, 50);
spot(C("read1", "صورة") + 0.05, E("read1") + 0.35, 37, 345, 524, 100);
T.pdfScroll0 = C("read1", "صورة") - 0.25;
cam(E("read1") + 0.25, 1, 580, 410, 0.6);
// search inside the book
T.bookSearch = goClick(S("read2") + 0.02, 1084, 168, 0.42);
cam(T.bookSearch + 0.1, 1.28, 580, 400, 0.7);
T.bsSelect = T.bookSearch + 0.22;
[T.bsTypeStart, T.bsTypeEnd] = typeText(T.bookSearch + 0.42, "الأعمال", 18);
T.bsSubmit = goClick(T.bsTypeEnd + 0.22, 281, 419, 0.2);
T.bsResults = T.bsSubmit + 0.28;
T.bsOpen = goClick(Math.max(C("read2", "مباشرة"), T.bsResults + 0.45), 316, 311, 0.36);
cam(T.bsOpen + 0.05, 1.12, 580, 440, 0.6, 1.06, 600);
T.next1 = goClick(T.bsOpen + 0.7, 78, 226, 0.4);
T.next2 = goClick(T.next1 + 0.55, 78, 226, 0.02);
T.readEnd = T.next2 + 0.5;

// Chapter 3 — download and export
T.ch3 = Math.max(S("dl1") - 1.0, T.next2 + 0.3);
T.menu2 = goClick(Math.max(S("dl1") - 0.3, T.ch3 + 0.25), 822, 168, 0.42);
goTo(T.menu2 + 0.12, 700, 266, 0.26);
T.exportOpen = goClick(T.menu2 + 0.45, 700, 266, 0.02);
cam(T.exportOpen + 0.05, 1.42, 600, 430, 0.7);
T.download = goClick(Math.max(C("dl1", "مرة"), T.exportOpen + 0.55), 580, 400, 0.36);
T.downloadDone = T.download + 1.9;
T.toast = T.downloadDone + 0.2;
sfx(T.toast, "pop", 0.3);
cam(T.downloadDone + 0.1, 1.22, 720, 500, 0.8);
cam(Math.max(S("dl2") + 0.15, T.toast + 0.6), 1.42, 600, 430, 0.7);
T.toastClose = Math.max(S("dl2") + 0.9, T.toast + 1.6);
const FMT = { pdf: 744, txt: 578, docx: 413 };
T.glowPdf = C("dl2", "PDF");
T.glowTxt = C("dl2", "نص");
T.glowDocx = C("dl2", "وورد");
goTo(T.glowPdf - 0.3, FMT.pdf, 476, 0.28);
goTo(T.glowTxt - 0.28, FMT.txt, 476, 0.26);
T.docx = goClick(T.glowDocx + 0.3, FMT.docx, 476, 0.24);
T.saved = T.docx + 0.7;
sfx(T.saved, "pop", 0.22);
// a whole category
T.exportClose = goClick(Math.max(T.saved + 0.2, S("dl3") - 1.1), 355, 348, 0.38);
cam(T.exportClose + 0.05, 1, 580, 410, 0.55);
T.navCats = goClick(T.exportClose + 0.5, 960, 30, 0.4);
T.cats = T.navCats + 0.1;
cam(T.cats + 0.1, 1.32, 760, 230, 0.65);
T.catField = goClick(T.navCats + 0.42, 700, 170, 0.28);
[T.catTypeStart, T.catTypeEnd] = typeText(T.catField + 0.08, "ابن القيم", 20);
T.catOpen = goClick(Math.max(C("dl3", "تصنيف"), T.catTypeEnd + 0.3), 865, 247, 0.3);
T.catPage = T.catOpen + 0.1;
cam(T.catOpen + 0.1, 1.12, 580, 300, 0.6);
T.catDownload = goClick(Math.max(C("dl3", "كامل"), T.catOpen + 0.5), 114, 94, 0.36);
T.catDialog = T.catDownload + 0.05;
cam(T.catDownload + 0.1, 1.42, 580, 410, 0.6);
T.catStart = goClick(Math.max(C("dl3", "كتبه"), T.catDownload + 0.9), 736, 498, 0.36);
T.downloads = T.catStart + 0.12;
cam(T.catStart + 0.15, 1.35, 760, 340, 0.7);

// Chapter 4 — offline
T.ch4 = Math.max(S("offline") - 0.9, T.downloads + 0.9);
T.offline = Math.max(C("offline", "انقطع") + 0.05, T.downloads + 0.6);
cam(T.offline - 0.35, 1.55, 860, 760, 0.7);
spot(T.offline + 0.1, Math.max(C("offline", "تبقى") - 0.15, T.offline + 1.0), 936, 788, 210, 32, 6);
cam(Math.max(C("offline", "الاتصال") + 0.45, T.offline + 0.9), 1, 580, 410, 0.65);
T.navSaved = goClick(Math.max(C("offline", "تبقى"), T.offline + 1.1), 240, 30, 0.5);
T.saved1 = T.navSaved + 0.1;
T.savedMode = goClick(T.navSaved + 0.45, 1001, 158, 0.36);
T.savedModePick = goClick(T.savedMode + 0.38, 964, 256, 0.26);
T.savedField = goClick(T.savedModePick + 0.32, 1010, 210, 0.24);
[T.savedTypeStart, T.savedTypeEnd] = typeText(T.savedField + 0.08, "النية", 20);
T.savedSubmit = goClick(Math.max(C("offline", "جاهزة") - 0.1, T.savedTypeEnd + 0.4), 70, 210, 0.38);
T.savedResults = T.savedSubmit + 0.12;
cam(T.savedSubmit + 0.3, 1.32, 760, 440, 0.7);
spot(T.savedSubmit + 0.45, T.savedSubmit + 1.4, 945, 246, 200, 32);
cam(T.savedSubmit + 1.3, 1.18, 520, 450, 0.7, 1.06, 590);
T.savedOpen = goClick(Math.max(E("offline") + 0.15, T.savedSubmit + 1.95), 147, 530, 0.45);
cam(T.savedOpen + 0.1, 1, 580, 410, 0.6);

// Chapter 5 — more
T.ch5 = Math.max(S("resume") - 0.9, T.savedOpen + 0.7);
T.reconnect = goClick(Math.max(T.ch5 - 0.15, T.savedOpen + 0.8), 413, 804, 0.48);
T.home = goClick(T.reconnect + 0.55, 1042, 30, 0.42);
T.homeShown = T.home + 0.1;
cam(T.homeShown + 0.2, 1.42, 862, 430, 0.8);
spot(Math.max(C("resume", "موضع"), T.homeShown + 0.6), C("resume", "لتكمل") - 0.05, 604, 410, 524, 62);
T.continue = goClick(Math.max(C("resume", "حيث") - 0.1, T.homeShown + 1.3), 1037, 509, 0.4);
T.reader2 = T.continue + 0.1;
cam(T.continue + 0.1, 1, 580, 410, 0.6);
T.dark = goClick(Math.max(C("theme", "بضغطة") + 0.15, T.reader2 + 0.6), 74, 30, 0.5);
sfx(T.dark + 0.02, "whoosh_long", 0.28);
T.badge = Math.max(S("updates") - 0.3, T.dark + 0.9);
sfx(T.badge, "pop", 0.25);
T.settings = goClick(Math.max(C("updates", "التحديثات") + 0.1, T.badge + 0.45), 38, 30, 0.42);
cam(T.settings + 0.15, 1.4, 580, 520, 0.7);
spot(T.settings + 0.45, Math.max(E("updates") + 0.4, T.settings + 1.5), 700, 537, 175, 34);
goTo(T.settings + 0.8, 398, 626, 0.45);
T.tourEnd = Math.max(E("updates") + 0.55, T.settings + 1.7);
cam(T.tourEnd - 0.3, 1, 580, 410, 0.6);

CURSOR.sort((a, b) => a.t - b.t);
CAMERA.sort((a, b) => a.t - b.t);
SFX.sort((a, b) => a.t - b.t);

/** Cursor visibility (fades in at chapter 1, out at the end of the tour). */
export const cursorOpacity = (t: number) => prog(t, T.cursorIn, T.cursorIn + 0.35) * (1 - prog(t, T.tourEnd - 0.2, T.tourEnd + 0.2));

// ---------------------------------------------------------------- chapters for the guide panel
export type Chapter = { n: number; title: string; headline: string; t0: number; t1: number; bullets: { text: string; t: number }[] };
export const CHAPTERS: Chapter[] = [
  {
    n: 1,
    title: "البحث",
    headline: "ابحث في 37 مليون صفحة",
    t0: T.ch1,
    t1: T.ch2,
    bullets: [
      { text: "في العناوين أو النصوص كاملة", t: C("search1", "عناوين") },
      { text: "كل موضع مع الكتاب والمؤلف والصفحة", t: C("search2", "لترى") },
      { text: "تصفية بالمكتبة والتصنيف والمؤلف", t: C("search3", "وضيق") },
    ],
  },
  {
    n: 2,
    title: "القراءة",
    headline: "النص بجانب الصفحة الأصلية",
    t0: T.ch2,
    t1: T.ch3,
    bullets: [
      { text: "النص وصورة الصفحة معًا", t: C("read1", "لتقرأ") },
      { text: "بحث داخل الكتاب", t: C("read2", "وابحث") },
    ],
  },
  {
    n: 3,
    title: "التنزيل والتصدير",
    headline: "كتبك على جهازك",
    t0: T.ch3,
    t1: T.ch4,
    bullets: [
      { text: "قراءة وبحث دون إنترنت", t: C("dl1", "نزل") },
      { text: "تصدير PDF وTXT وWord", t: C("dl2", "واحفظ") },
      { text: "تنزيل تصنيف كامل", t: C("dl3", "ويمكنك") },
    ],
  },
  {
    n: 4,
    title: "دون إنترنت",
    headline: "مكتبتك تعمل دون اتصال",
    t0: T.ch4,
    t1: T.ch5,
    bullets: [{ text: "كتبك المحمّلة جاهزة للقراءة والبحث", t: C("offline", "تبقى") }],
  },
  {
    n: 5,
    title: "وأكثر",
    headline: "تفاصيل صُمّمت لراحتك",
    t0: T.ch5,
    t1: T.tourEnd,
    bullets: [
      { text: "تابع من حيث توقفت", t: C("resume", "ويحفظ") },
      { text: "الوضع الداكن بضغطة", t: C("theme", "وبضغطة") },
      { text: "تحديثات تلقائية", t: C("updates", "وتصلك") },
    ],
  },
];

// ---------------------------------------------------------------- app state
type Seg = { t: number; key: string; nav: NavKey; render: (t: number) => React.ReactNode };
export const PAGE_FADE = 0.34;

const baseUI = (over: Partial<SearchUI>): SearchUI => ({ mode: "books", scope: "all", query: "", ...over });
const caretOn = (t: number, since: number) => Math.floor((t - since) * 1.8) % 2 === 0;
const marksQ = demo.query.split(" ");

// Text-pane scroll that brings a match into view (offsets measured with the Measure composition).
const HADITH_SCROLL = 264;
const MATCH_SCROLL = [0, 263, 926];

const readerBase = (t: number, over: Partial<ReaderProps>): ReaderProps => ({
  mode: "split",
  split: 0.5,
  textSize: 20,
  tashkeel: true,
  night: 0,
  query: demo.query,
  matchIndex: 0,
  matchCount: 1,
  bookmarked: false,
  availability: "متاح عبر الإنترنت",
  page: 29,
  textScroll: HADITH_SCROLL,
  pdfScroll: 0,
  ...over,
});

/** Reader in chapters 2 and 3: opened from search, then searched inside, then downloaded. */
const reader = (t: number): ReaderProps => {
  const inBookSearch = t >= T.bsOpen + 0.05;
  const matchIndex = !inBookSearch ? 0 : t < T.next1 ? 0 : t < T.next2 ? 1 : 2;
  let textScroll = HADITH_SCROLL * prog(t, T.reader + 0.15, T.reader + 0.6, easeInOutCubic);
  if (inBookSearch) {
    const at = [T.bsOpen + 0.05, T.next1, T.next2][matchIndex];
    const from = matchIndex === 0 ? HADITH_SCROLL : MATCH_SCROLL[matchIndex - 1];
    textScroll = from + (MATCH_SCROLL[matchIndex] - from) * prog(t, at, at + 0.45, easeInOutCubic);
  }
  return readerBase(t, {
    query: inBookSearch ? "الأعمال" : demo.query,
    matchCount: inBookSearch ? 3 : 1,
    matchIndex,
    availability: t >= T.downloadDone ? "متاح دون اتصال" : "متاح عبر الإنترنت",
    textScroll,
    pdfScroll: 230 * prog(t, T.pdfScroll0, T.pdfScroll0 + 0.9, easeInOutCubic),
    pressed: { search: press(t, T.bookSearch), next: Math.max(press(t, T.next1), press(t, T.next2)), menu: press(t, T.menu2) },
    focused: { menu: t >= T.menu2 && t < T.exportOpen },
  });
};

const SEGS: Seg[] = [
  {
    t: 0,
    key: "home",
    nav: "home",
    render: (t) => {
      const mode = t >= T.modeChoose + 0.04 ? "content" : "books";
      const focused = t >= T.fieldClick;
      return (
        <HomeScreen
          ui={baseUI({
            mode,
            query: typed(demo.query, t, T.typeStart, T.typeCps),
            focused,
            caret: focused && (t < T.typeEnd + 0.1 || caretOn(t, T.typeEnd)),
            pressed: { mode: press(t, T.modeClick), submit: press(t, T.submit) },
          })}
        />
      );
    },
  },
  {
    t: T.results,
    key: "results",
    nav: "home",
    render: (t) => {
      const filtered = t >= T.filtered;
      const loading = filtered ? 1 - prog(t, T.filtered, T.filtered + 0.35) : 1 - prog(t, T.results + 0.1, T.resultsShown);
      return (
        <ResultsScreen
          ui={baseUI({ mode: "content", query: demo.query, filterCount: filtered ? 1 : 0, pressed: { filters: press(t, T.filters) } })}
          count={filtered ? `${demo.authorCount} نتيجة · كل المكتبة` : `${demo.allCount.toLocaleString("en-US")} نتيجة · كل المكتبة`}
          chips={filtered ? ["ابو زكريا محي الدين يحيى بن شرف…"] : []}
          chipsIn={prog(t, T.filtered, T.filtered + 0.3)}
          hits={filtered ? demo.authorHits : demo.allHits}
          marks={marksQ}
          loading={loading}
          pressedOpen={press(t, T.open)}
        />
      );
    },
  },
  { t: T.reader, key: "reader", nav: null, render: (t) => <ReaderScreen {...reader(t)} /> },
  {
    t: T.cats,
    key: "categories",
    nav: "categories",
    render: (t) => {
      const focused = t >= T.catField;
      return (
        <CategoriesScreen
          filter={typed("ابن القيم", t, T.catTypeStart, 20)}
          focused={focused}
          caret={focused && (t < T.catTypeEnd + 0.1 || caretOn(t, T.catTypeEnd))}
          pressedRow={press(t, T.catOpen)}
        />
      );
    },
  },
  {
    t: T.catPage,
    key: "catpage",
    nav: "browse",
    render: (t) => <CategoryPage name="كتب ابن القيم" books={demo.qayyimBooks} pressedDownload={press(t, T.catDownload)} />,
  },
  {
    t: T.downloads,
    key: "downloads",
    nav: "downloads",
    render: (t) => {
      const active = Math.max(0, Math.min(t, T.offline) - T.downloads);
      const perBook = 1.05;
      const done = Math.min(45, Math.floor(active / perBook));
      const fraction = (active % perBook) / perBook;
      return (
        <DownloadsScreen done={done} total={45} fraction={fraction} current="جارٍ تنزيل الكتاب…" paused={false} ready={2 + done} />
      );
    },
  },
  {
    t: T.saved1,
    key: "saved",
    nav: "saved",
    render: (t) => {
      const mode = t >= T.savedModePick + 0.04 ? "content" : "books";
      const focused = t >= T.savedField;
      return (
        <ResultsScreen
          heading="كتبي المحمّلة"
          description="47 كتاب للقراءة والبحث دون اتصال."
          ui={baseUI({
            mode,
            scope: "downloaded",
            query: typed("النية", t, T.savedTypeStart, 20),
            focused,
            caret: focused && (t < T.savedTypeEnd + 0.1 || caretOn(t, T.savedTypeEnd)),
            pressed: { mode: press(t, T.savedMode), submit: press(t, T.savedSubmit) },
          })}
          count="47 نتيجة · المحفوظ على جهازك"
          hits={demo.qayyimBooks.slice(0, 4).map((b) => ({ page: b.pages, title: b.title, author: b.author, category: "كتب ابن القيم", excerpt: "" }))}
          marks={[]}
          availability="متاح دون اتصال"
          downloaded
          bookGrid
        />
      );
    },
  },
  {
    t: T.savedResults,
    key: "savedResults",
    nav: "saved",
    render: (t) => (
      <ResultsScreen
        heading="كتبي المحمّلة"
        description="47 كتاب للقراءة والبحث دون اتصال."
        ui={baseUI({ mode: "content", scope: "downloaded", query: "النية" })}
        count="2,416 نتيجة · المحفوظ على جهازك"
        sortable
        hits={demo.offlineHits}
        marks={["النية"]}
        availability="متاح دون اتصال"
        downloaded
        loading={1 - prog(t, T.savedResults + 0.05, T.savedResults + 0.35)}
        pressedOpen={press(t, T.savedOpen)}
      />
    ),
  },
  {
    t: T.savedOpen + 0.1,
    key: "reader-offline",
    nav: null,
    render: (t) => <ReaderScreen {...readerBase(t, { availability: "متاح دون اتصال", query: "النية", matchCount: 1, textScroll: 0 })} />,
  },
  {
    t: T.homeShown,
    key: "home-recent",
    nav: "home",
    render: (t) => <HomeScreen ui={baseUI({})} recent={{ fraction: (29 / 541) * prog(t, T.homeShown + 0.3, T.homeShown + 1.2), pressed: press(t, T.continue) }} />,
  },
  {
    t: T.reader2,
    key: "reader-resume",
    nav: null,
    render: (t) => <ReaderScreen {...readerBase(t, { availability: "متاح دون اتصال", query: "", pdfScroll: 230 })} />,
  },
];

export const screenAt = (t: number) => {
  let i = 0;
  for (let k = 0; k < SEGS.length; k++) if (SEGS[k].t <= t) i = k;
  const cur = SEGS[i];
  const prev = i > 0 && t - cur.t < PAGE_FADE ? SEGS[i - 1] : null;
  const p = prog(t, cur.t, cur.t + PAGE_FADE, easeInOutCubic);
  return { cur, prev, p };
};

export const navAt = (t: number): NavKey => screenAt(t).cur.nav;

export const statusAt = (t: number): Status => {
  const online = !(t >= T.offline && t < T.reconnect + 0.05);
  let activity: Status["activity"] = null;
  if (t >= T.download + 0.15 && t < T.downloadDone) {
    const f = prog(t, T.download + 0.15, T.downloadDone, easeInOutCubic);
    activity = { label: `جارٍ التنزيل · ${Math.floor(f * 100)}%`, fraction: f };
  } else if (t >= T.catStart && t < T.offline) {
    activity = { label: "جارٍ التنزيل · كتب ابن القيم", fraction: ((t - T.catStart) % 1.05) / 1.05 };
  }
  return { online, activity };
};

export const themeAt = (t: number) => (t >= T.dark ? "dark" : "light");

/** Overlays (menus, dialogs, toasts) for the current time. */
export const overlayAt = (t: number): React.ReactNode => {
  const out: React.ReactNode[] = [];
  // search mode menu (home) and saved-screen mode menu
  const m1 = appear(t, T.modeClick + 0.02, T.modeChoose + 0.06, 0.14, 0.12);
  if (m1 > 0) out.push(<SelectMenu key="m1" x={854} y={184} items={["عناوين الكتب", "نصوص الكتب"]} selected={t >= T.modeChoose ? 1 : 0} hover={t > T.modeChoose - 0.35 ? 1 : 0} pressed={press(t, T.modeChoose)} appear={m1} />);
  const m2 = appear(t, T.savedMode + 0.02, T.savedModePick + 0.06, 0.14, 0.12);
  if (m2 > 0) out.push(<SelectMenu key="m2" x={854} y={184} items={["عناوين الكتب", "نصوص الكتب"]} selected={t >= T.savedModePick ? 1 : 0} hover={t > T.savedModePick - 0.35 ? 1 : 0} pressed={press(t, T.savedModePick)} appear={m2} />);
  // filters → authors → filters
  const f1 = appear(t, T.filters + 0.03, T.authorsOpen, 0.2, 0.1) + appear(t, T.filtersBack, T.apply + 0.05, 0.16, 0.16);
  if (f1 > 0)
    out.push(
      <FiltersDialog key="f" appear={Math.min(1, f1)} author={t >= T.filtersBack ? "ابو زكريا محي الدين يحيى بن شرف بن حزم النووي" : undefined} pressed={{ author: press(t, T.authorRow), apply: press(t, T.apply) }} />,
    );
  const a1 = appear(t, T.authorsOpen, T.filtersBack, 0.16, 0.12);
  if (a1 > 0)
    out.push(
      <AuthorsDialog
        key="a"
        appear={a1}
        query={typed("النووي", t, T.authorTypeStart, 24)}
        caret={caretOn(t, T.authorsOpen)}
        results={prog(t, T.authorResults, T.authorResults + 0.2)}
        hover={t > T.authorPick - 0.35 ? 0 : -1}
        pressed={press(t, T.authorPick)}
      />,
    );
  // book search
  const b1 = appear(t, T.bookSearch + 0.03, T.bsOpen + 0.03, 0.2, 0.14);
  if (b1 > 0) {
    const selecting = t >= T.bsSelect && t < T.bsTypeStart;
    out.push(
      <BookSearchDialog
        key="bs"
        appear={b1}
        query={t < T.bsTypeStart ? demo.query : typed("الأعمال", t, T.bsTypeStart, 18)}
        selected={selecting}
        caret={!selecting && caretOn(t, T.bookSearch)}
        results={prog(t, T.bsResults, T.bsResults + 0.25)}
        grow={prog(t, T.bsSubmit + 0.05, T.bsResults + 0.15, easeInOutCubic)}
        pressedOpen={press(t, T.bsOpen)}
        pressedSubmit={press(t, T.bsSubmit)}
      />,
    );
  }
  // reader tools menu
  const r1 = appear(t, T.menu2 + 0.02, T.exportOpen + 0.03, 0.14, 0.1);
  if (r1 > 0) out.push(<ReaderMenu key="rm" appear={r1} hover={t > T.exportOpen - 0.4 ? 1 : -1} pressed={press(t, T.exportOpen)} />);
  // export / offline download
  const ex = appear(t, T.exportOpen + 0.03, T.exportClose + 0.03, 0.2, 0.16);
  if (ex > 0) {
    const dl = t < T.download + 0.15 ? -1 : t < T.downloadDone ? prog(t, T.download + 0.15, T.downloadDone, easeInOutCubic) : 2;
    const saving = t >= T.docx + 0.08 && t < T.saved ? prog(t, T.docx + 0.08, T.saved, easeInOutCubic) : -1;
    // one format at a time: each glow hands over to the next as it is spoken
    const glow = (g: number, next = Infinity) =>
      t >= g - 0.05 ? Math.min(prog(t, g - 0.05, g + 0.15), 1 - prog(t, Math.min(g + 0.75, next - 0.12), Math.min(g + 1.0, next + 0.03))) : 0;
    out.push(
      <ExportDialog
        key="ex"
        appear={ex}
        download={dl}
        feedback={t >= T.saved ? "تم حفظ الملف" : saving >= 0 ? "جارٍ حفظ الملف…" : "احفظ نسخة بصيغة PDF أو نص أو Word."}
        saving={saving}
        glow={{ pdf: glow(T.glowPdf, T.glowTxt), txt: glow(T.glowTxt, T.glowDocx), docx: t >= T.docx ? 0 : glow(T.glowDocx) }}
        pressed={{ download: press(t, T.download), docx: press(t, T.docx), close: press(t, T.exportClose) }}
      />,
    );
  }
  const toast = appear(t, T.toast, T.toastClose, 0.25, 0.2);
  if (toast > 0) out.push(<Toast key="toast" appear={toast} message="جاهز للقراءة والبحث دون اتصال" detail={demo.riyad.title} action="فتح الكتاب" inReader />);
  // category download
  const cd = appear(t, T.catDialog, T.catStart + 0.05, 0.2, 0.14);
  if (cd > 0) out.push(<CategoryDownloadDialog key="cd" appear={cd} scanned={Math.round(45 * prog(t, T.catDialog + 0.15, T.catDialog + 0.75, easeInOutCubic))} total={45} pressedStart={press(t, T.catStart)} />);
  // settings
  const st = appear(t, T.settings + 0.03, T.tourEnd + 0.4, 0.2, 0.2);
  if (st > 0) out.push(<SettingsDialog key="st" appear={st} />);
  return out;
};

export const pressedChrome = (t: number) => ({
  home: press(t, T.home),
  categories: press(t, T.navCats),
  saved: press(t, T.navSaved),
  theme: press(t, T.dark),
  settings: press(t, T.settings),
  reconnect: press(t, T.reconnect),
});

export const settingsBadge = (t: number) => t >= T.badge && t < T.settings + 0.4;
