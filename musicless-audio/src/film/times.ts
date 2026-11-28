import type { Lang, Timeline } from "../lib/timeline";

/** Every word that moves something on screen, per language: [clip, needle]. */
const CUES: Record<Lang, Record<string, [string, string]>> = {
  en: {
    music: ["hook1", "music"], remove: ["hook2", "remove"], files: ["hook2", "audio"], site: ["hook2", "Musicless"], website: ["hook2", "website"],
    tab: ["site1", "Audio"], choose: ["site1", "choose"], formats: ["site1", "MP3"], run: ["site2", "Remove"],
    device: ["local", "device"], never: ["local", "never"], original: ["demo1", "original"],
    gone: ["diff", "gone"], voices: ["diff", "voices"], download: ["save", "download"], same: ["save", "same"],
    try: ["cta", "Try"], ctaSite: ["cta", "website"],
  },
  ar: {
    music: ["hook1", "موسيقى"], remove: ["hook2", "تزيل"], files: ["hook2", "ملفاتك"], site: ["hook2", "موقع"], website: ["hook2", "بلا"],
    tab: ["site1", "ملفات"], choose: ["site1", "اختر"], formats: ["site1", "إم"], run: ["site2", "أزل"],
    device: ["local", "جهازك"], never: ["local", "يرفع"], original: ["demo1", "الأصلي"],
    gone: ["diff", "اختفت"], voices: ["diff", "الأصوات"], download: ["save", "نزل"], same: ["save", "بصيغته"],
    try: ["cta", "جرب"], ctaSite: ["cta", "موقع"],
  },
};

export const makeTimes = (tl: Timeline, cards: string[], free: string[]) => {
  const c = (k: string) => tl.cue(...CUES[tl.lang][k]);
  const s = tl.sample;
  const T = {
    cards: cards.map((needle) => tl.cue("hook1", needle)),
    music: c("music"),
    hookEnd: tl.E("hook1"),
    remove: c("remove"),
    files: c("files"),
    site: c("site"),
    website: c("website"),
    // paper rises with the phone on it, just before the first step is spoken
    paper: tl.S("site1") - 0.8,
    tab: c("tab"),
    choose: c("choose"),
    formats: c("formats"),
    run: c("run"),
    device: c("device"),
    never: c("never"),
    // the tool finishes as the line about privacy ends
    done: tl.E("local") + 0.18,
    original: c("original"),
    play: s.start - 0.06,
    cut: s.cutAt,
    pause: s.end + 0.12,
    gone: c("gone"),
    voices: c("voices"),
    download: c("download"),
    same: c("same"),
    free: free.map((needle) => tl.cue("free", needle)),
    outro: tl.S("cta") - 0.4,
    try: c("try"),
    ctaSite: c("ctaSite"),
  };
  // the file arrives a moment after the tap on "Choose audio file"; the tool checks it, then it is ready. The checking
  // state comes in as the file settles, so the workspace is never empty under it.
  const file = { tap: T.choose, land: T.choose + 0.72, checking: T.choose + 0.46, ready: T.choose + 1.2 };
  // what the tool shows while it works: the real order, compressed (a 2:30 file took about 85 s on a desktop)
  const work = { preflight: T.run + 0.1, processing: T.run + 0.42, end: T.done - 0.1, done: T.done };
  // scene windows: [start, end]
  const W = {
    hook: [0, T.paper + 0.9],
    site: [T.paper, tl.S("free") + 0.4],
    free: [tl.S("free") - 0.7, T.outro + 0.6],
    outro: [T.outro, tl.duration],
  } as Record<string, [number, number]>;
  return { T, W, file, work };
};
export type Times = ReturnType<typeof makeTimes>;
