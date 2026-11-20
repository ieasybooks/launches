import rec from "../data/recitation.json";
import type { Lang, Timeline } from "../lib/timeline";

// The words each action waits for, per language (as the narrator says them; the English script writes the name
// in Arabic letters, so he says it natively). Every visual beat follows the narration or the recitation.
const NEEDLES: Record<Lang, Record<string, string>> = {
  ar: {
    read: "اقرأ", listen: "اسمعه", age: "ألف", maha: "المها", name: "شوارد", tagline: "الشعر",
    hear: "اسمع", follow: "واقرأ", recited: "يلقى", word: "الكلمة", verse: "والبيت",
    oryx: "البقرة", eyes: "بعيونها", beautiful: "الجميلة",
    imru: "امرئ", shawqi: "شوقي", byPoet: "الشعراء", byReciter: "والملقين",
    download: "ونزل", offline: "اتصال", free: "مجاني", ads: "إعلانات", account: "حساب",
    appstore: "آب ستور", google: "جوجل", gallery: "غاليري", web: "دوت",
  },
  en: {
    read: "Read", listen: "hear", age: "thousand", maha: "says", name: "شوارد", tagline: "Arabic",
    hear: "Hear", follow: "follow", recited: "recited", word: "word", verse: "verse",
    oryx: "oryx", eyes: "eyes", beautiful: "loved",
    imru: "Imru", shawqi: "Shawqi", byPoet: "poet", byReciter: "reciter",
    download: "Download", offline: "offline", free: "free", ads: "ads", account: "account",
    appstore: "App Store", google: "Google", gallery: "AppGallery", web: "dot",
  },
};

export type Times = ReturnType<typeof makeTimes>;

export const makeTimes = (tl: Timeline) => {
  const n = NEEDLES[tl.lang];
  const { S, E, cue, recs, recAt } = tl;
  // the verse words as Osama says them (film time), bayt 1 then bayt 2
  const words = rec.words.map((w) => ({ a: w.a, w: w.w, s: recAt(w.a.startsWith("1.") ? "b1" : "b2", w.s), e: recAt(w.a.startsWith("1.") ? "b1" : "b2", w.e) }));
  const T = {
    read: cue("read", n.read),
    listen: S("listen"),
    listenWord: cue("listen", n.listen),
    rec1: recs.b1.start,
    rec1End: recs.b1.end,
    words1: words.filter((w) => w.a.startsWith("1.")),
    age: S("age"),
    thousand: cue("age", n.age),
    ask: S("ask"),
    maha: cue("ask", n.maha),
    askEnd: E("ask"),
    brand: S("brand"),
    name: cue("brand", n.name),
    tagline: cue("brand", n.tagline),
    brandEnd: E("brand"),
    hear: cue("hear", n.hear),
    hearStart: S("hear"),
    follow: cue("hear", n.follow),
    recited: cue("hear", n.recited),
    hearEnd: E("hear"),
    // play is tapped just before bayt 2 is heard
    play: recs.b2.start - 0.32,
    rec2: recs.b2.start,
    rec2End: recs.b2.end,
    /** bayt 2's second half begins (its first half goes back to ink, the second lights) */
    rec2Ajuz: recAt("b2", 16.06),
    tap: S("tap"),
    word: cue("tap", n.word),
    verse: cue("tap", n.verse),
    tapEnd: E("tap"),
    // the word is tapped as it is named, and its notes rise
    tapWord: cue("tap", n.word) + 0.12,
    meaning: S("meaning"),
    oryx: cue("meaning", n.oryx),
    eyes: cue("meaning", n.eyes),
    beautiful: cue("meaning", n.beautiful),
    meaningEnd: E("meaning"),
    poets: S("poets1"),
    imru: cue("poets1", n.imru),
    shawqi: cue("poets1", n.shawqi),
    poets2: S("poets2"),
    byPoet: cue("poets2", n.byPoet),
    byReciter: cue("poets2", n.byReciter),
    poetsEnd: E("poets2"),
    night: S("night2"),
    download: cue("night2", n.download),
    offline: cue("night2", n.offline),
    nightEnd: E("night2"),
    free: cue("free", n.free),
    freeStart: S("free"),
    ads: cue("free", n.ads),
    account: cue("free", n.account),
    freeEnd: E("free"),
    cta: S("cta1"),
    appstore: cue("cta1", n.appstore),
    google: cue("cta1", n.google),
    gallery: cue("cta1", n.gallery),
    web: S("cta2"),
    dot: cue("cta2", n.web),
    filmEnd: tl.duration,
  };
  // Scene windows (seconds): each comes in over the one before it.
  const W = {
    opening: [0, T.hear + 0.2] as const, // the verse on paper, the question, the name, then into the app
    app: [T.hearStart - 0.6, T.poets + 0.35] as const,
    eras: [T.poets - 0.25, T.byPoet + 0.25] as const,
    browse: [T.byPoet - 0.35, T.night + 0.3] as const,
    night: [T.night - 1.0, T.freeStart + 0.05] as const,
    free: [T.freeStart - 0.4, T.cta + 0.05] as const,
    outro: [T.cta - 0.4, T.filmEnd] as const,
  };
  return { T, W };
};
