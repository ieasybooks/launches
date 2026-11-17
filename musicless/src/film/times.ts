import type { Lang, Timeline } from "../lib/timeline";

// The words each action waits for, per language (as spoken: the Arabic script spells Latin names in Arabic
// letters for the narrator). Every visual beat follows the narration.
const NEEDLES: Record<Lang, Record<string, string>> = {
  ar: {
    music: "الموسيقى", youtube: "يوتيوب", voices: "الأصوات", now: "الآن", name: "بلا",
    c1: "محاضرات", c2: "ووثائقيات", c3: "ودروس", c4: "وصفات", much: "كثير", withMusic: "ترافقها",
    name2: "بلا", avoid: "تجنب", pill: "الموسيقى", hear: "سماع", word: "كلمة",
    three: "بثلاث", find: "ابحث", store: "سوق", click1: "الإضافة", add2: "تثبيت", turn: "تفعيل", done: "وانتهى",
    gone: "اختفت", stay: "وبقيت", original: "الأصلي", click: "اضغط", icon: "أيقونة",
    every: "الفيديوهات", shorts: "شورتس", live: "والبث",
    free: "مجانية", account: "حساب", offline: "إنترنت", computer: "حاسوبك", light: "خفيفة", laptop: "محمول",
    install: "برنامج", alone: "وحدها", win: "ويندوز", mac: "وماك", linux: "ولينكس", cros: "وكروم",
    chrome: "كروم", firefox: "فايرفوكس", cta: "ثبتها", watch: "وشاهد",
  },
  en: {
    music: "music", youtube: "YouTube", voices: "voices", now: "Now", name: "Musicless",
    c1: "Lectures", c2: "documentaries", c3: "lessons", c4: "recipes", much: "So much", withMusic: "with music",
    name2: "Musicless", avoid: "avoid", pill: "to music", hear: "hear", word: "every word",
    three: "three", find: "Find", store: "Chrome", click1: "Add to", add2: "Add", turn: "Turn", done: "Done",
    gone: "gone", stay: "stay", original: "original", click: "click", icon: "icon",
    every: "every video", shorts: "Shorts", live: "live",
    free: "free", account: "account", offline: "offline", computer: "computer", light: "light", laptop: "laptop",
    install: "install", alone: "extension", win: "Windows", mac: "Mac", linux: "Linux", cros: "Chrome",
    chrome: "Chrome", firefox: "Firefox", cta: "Install", watch: "watch",
  },
};

export type Times = ReturnType<typeof makeTimes>;

export const makeTimes = (tl: Timeline) => {
  const n = NEEDLES[tl.lang];
  const { S, E, cue } = tl;
  const T = {
    hook: S("hook1"),
    music: cue("hook1", n.music),
    youtube: cue("hook1", n.youtube),
    hook1End: E("hook1"),
    snap: E("hook1") + 0.32,
    voicesLine: S("hook2"),
    voices: cue("hook2", n.voices),
    hookEnd: E("hook2"),
    meet: S("meet"),
    now: cue("meet", n.now),
    name: cue("meet", n.name),
    meetEnd: E("meet"),
    why: S("why1"),
    cards: [cue("why1", n.c1), cue("why1", n.c2), cue("why1", n.c3), cue("why1", n.c4)],
    much: cue("why1", n.much),
    withMusic: cue("why1", n.withMusic),
    why2: S("why2"),
    name2: cue("why2", n.name2),
    avoid: cue("why2", n.avoid),
    pill: cue("why2", n.pill), // the first of the two pills lands on this word
    hear: cue("why2", n.hear),
    word: cue("why2", n.word),
    whyEnd: E("why2"),
    easy: S("easy1"),
    three: cue("easy1", n.three),
    find: cue("easy2", n.find),
    store: cue("easy2", n.store),
    click1: cue("easy2", n.click1),
    easy2End: E("easy2"),
    easy3: S("easy3"),
    click2: cue("easy3", n.add2),
    easy4: S("easy4"),
    click3: cue("easy4", n.turn),
    done: cue("easy4", n.done),
    easyEnd: E("easy4"),
    demo: S("demo1"),
    demo1End: E("demo1"),
    // the real sound: the video plays with its music, the click, the wait, then the voices alone
    sampleStart: tl.sample.start,
    sampleCut: tl.sample.cutAt,
    sampleResume: tl.sample.resume,
    sampleEnd: tl.sample.end,
    demo2: S("demo2"),
    gone: cue("demo2", n.gone),
    stay: cue("demo2", n.stay),
    original: cue("demo2", n.original),
    clickIcon: cue("demo2", n.click),
    icon: cue("demo2", n.icon),
    demoEnd: E("demo2"),
    diff: S("diff"),
    reasons: [cue("every", n.every), cue("free", n.free), cue("offline", n.offline), cue("light", n.light), cue("install", n.install), cue("os", n.win)],
    reasonStarts: [S("every"), S("free"), S("offline"), S("light"), S("install"), S("os")],
    formats: [cue("every", n.every), cue("every", n.shorts), cue("every", n.live)],
    account: cue("free", n.account),
    computer: cue("offline", n.computer),
    laptop: cue("light", n.laptop),
    alone: cue("install", n.alone),
    systems: [cue("os", n.win), cue("os", n.mac), cue("os", n.linux), cue("os", n.cros)],
    reasonsEnd: E("os"),
    stores: S("stores"),
    chrome: cue("stores", n.chrome),
    firefox: cue("stores", n.firefox),
    cta: S("cta"),
    ctaWord: cue("cta", n.cta),
    watch: cue("cta", n.watch),
    filmEnd: tl.duration,
  };
  // typing: the store search and the end card's search box, one letter per step (each with its own keystroke)
  const typing = { store: { at: T.find, step: 0.085 }, end: { at: T.firefox + 0.95, step: 0.1 } };
  // Scene windows (seconds): each fades or wipes in over the scene before it.
  const W = {
    hook: [0, T.meet + 0.3] as const,
    meet: [T.hookEnd + 0.15, T.why - 0.1] as const,
    why: [T.why - 0.5, T.easy - 0.05] as const,
    browser: [T.easy - 0.45, T.diff + 0.05] as const,
    reasons: [T.diff - 0.45, T.stores + 0.05] as const,
    outro: [T.stores - 0.45, T.filmEnd] as const,
  };
  return { T, W, typing };
};
