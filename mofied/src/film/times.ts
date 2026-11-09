import type { Lang, Timeline } from "../lib/timeline";

// The words each action waits for, per language. Every visual beat follows the narration.
const NEEDLES: Record<Lang, Record<string, string>> = {
  ar: {
    lost: "فضاعت", stay: "يبقى", name: "مفيد", open: "افتح", watch: "المشاهدة", account: "حساب", signup: "تسجيل", swipe: "اسحب",
    fresh: "جديدة", care: "بعناية", haram: "المحرمات", pause: "وقفة", verse: "آية", hadith: "حديث", end: "نهاية", stop: "حان",
    ads: "إعلانات", appstore: "آب ستور", google: "جوجل", gallery: "غاليري", dot: "دوت",
  },
  en: {
    lost: "lost", stay: "stayed", name: "مفيد", open: "Open", watch: "watching", account: "account", signup: "sign", swipe: "Swipe",
    fresh: "new", care: "care", haram: "haram", pause: "pause", verse: "verse", hadith: "hadith", end: "end", stop: "time for",
    ads: "ads", appstore: "App Store", google: "Google", gallery: "AppGallery", dot: "dot",
  },
};

export type Times = ReturnType<typeof makeTimes>;

export const makeTimes = (tl: Timeline) => {
  const n = NEEDLES[tl.lang];
  const { S, E, cue } = tl;
  const T = {
    lost: cue("hook", n.lost),
    hookEnd: E("hook"),
    cut: E("hook") + 0.06,
    turn: S("turn1"),
    stay: cue("turn1", n.stay),
    turnEnd: E("turn1"),
    brand: S("turn2"),
    name: cue("turn2", n.name),
    brandEnd: E("turn2"),
    open: S("easy1"),
    openWord: cue("easy1", n.open),
    watch: cue("easy1", n.watch),
    account: cue("easy2", n.account),
    signup: cue("easy2", n.signup),
    swipe1: cue("easy3", n.swipe),
    swipe2: cue("easy3", n.fresh),
    easyEnd: E("easy3"),
    curated: S("curated1"),
    care: cue("curated1", n.care),
    clean: S("curated2"),
    haram: cue("curated2", n.haram),
    curatedEnd: E("curated2"),
    reminder: S("reminder"),
    pause: cue("reminder", n.pause),
    verse: cue("reminder", n.verse),
    hadith: cue("reminder", n.hadith),
    reminderEnd: E("reminder"),
    session: S("session1"),
    endWord: cue("session1", n.end),
    sessionEnd: E("session1"),
    timeUp: S("session2"),
    stop: cue("session2", n.stop),
    day: S("session3"),
    dayEnd: E("session3"),
    free: S("free"),
    ads: cue("free", n.ads),
    freeAccount: cue("free", n.account),
    freeEnd: E("free"),
    cta: S("cta1"),
    appstore: cue("cta1", n.appstore),
    google: cue("cta1", n.google),
    gallery: cue("cta1", n.gallery),
    ctaEnd: E("cta1"),
    web: S("cta2"),
    dot: cue("cta2", n.dot),
    filmEnd: tl.duration,
  };
  // Scene windows (seconds).
  const wall = [T.curated - 0.35, T.reminder - 0.1] as const;
  const W = {
    hook: [0, T.cut] as const,
    turn: [T.cut, T.openWord + 0.1] as const,
    phoneA: [T.brandEnd + 0.04, wall[0] + 0.75] as const,
    wall,
    reminder: [T.reminder - 0.7, T.session - 0.45] as const,
    phoneB: [T.session - 0.9, T.stop - 0.2] as const,
    // gentle crossfades: each of these fades in over the scene before it
    ending: [T.stop - 0.2, T.day + 0.2] as const,
    day: [T.day - 0.45, T.free - 0.05] as const,
    free: [T.free - 0.55, T.cta - 0.2] as const,
    outro: [T.cta - 0.2, T.filmEnd] as const,
  };
  return { T, W };
};
