import extAr from "../data/ext-ar.json";
import extEn from "../data/ext-en.json";
import type { Lang } from "../lib/timeline";

/** The film's own words on screen. Arabic follows the extension's conventions (docs/translations.md in the
 *  musicless repository): the name is «بلا موسيقى», Latin names stay Latin, Western digits. */
export const COPY = {
  en: {
    dir: "ltr" as const,
    hook: [["What if you could remove", "the music from YouTube videos…"], ["…and keep the voices?"]],
    // narrower frames (9:16, 4:5) break the question into three rows
    hookTall: [["What if you could", "remove the music", "from YouTube videos…"], ["…and keep", "the voices?"]],
    now: "Now you can.",
    tagline: ["Removes most of the music.", "Keeps the voices."],
    cards: ["Lectures", "Documentaries", "Lessons", "Recipes"],
    whyHead: "So much of YouTube comes with music.",
    pills: ["Avoid the music.", "Hear every word."],
    clicks: "3 clicks",
    clicksSub: "That's all it takes.",
    done: "Done!",
    search: "Musicless",
    reasonsTitle: "Why you'll love it",
    reasons: [
      { head: "Works on every video", sub: "" },
      { head: "Completely free", sub: "No account. No ads." },
      { head: "Works offline", sub: "Right on your computer. Nothing is uploaded." },
      { head: "Light", sub: "Runs on an ordinary laptop. No graphics card." },
      { head: "Nothing else to install", sub: "Just the extension." },
      { head: "Works on every computer", sub: "" },
    ],
    systems: ["Windows", "Mac", "Linux", "ChromeOS"],
    formats: ["Videos", "Shorts", "Live streams"],
    live: "LIVE",
    browsers: "Chrome · Edge · Brave · Firefox",
    searchHint: "Search",
  },
  ar: {
    dir: "rtl" as const,
    hook: [["ماذا لو استطعتَ أن تُزيل", "الموسيقى من فيديوهات YouTube…"], ["…وتُبقي الأصوات البشرية؟"]],
    hookTall: [["ماذا لو استطعتَ", "أن تُزيل الموسيقى", "من فيديوهات YouTube…"], ["…وتُبقي", "الأصوات البشرية؟"]],
    now: "الآن تستطيع.",
    // the extension is feminine (الإضافة): تُزيل and تُبقي
    tagline: ["تُزيل معظم الموسيقى.", "وتُبقي الأصوات البشرية."],
    cards: ["محاضرات", "وثائقيات", "دروس", "وصفات الطبخ"],
    whyHead: "كثيرٌ من فيديوهات YouTube ترافقها موسيقى.",
    pills: ["تجنّب الموسيقى.", "سماع كل كلمة."],
    clicks: "3 نقرات",
    clicksSub: "وهذا كل شيء.",
    done: "انتهى!",
    search: "بلا موسيقى",
    reasonsTitle: "ما يميّزها",
    reasons: [
      { head: "تعمل على كل الفيديوهات", sub: "" },
      { head: "مجانية بالكامل", sub: "بلا حساب ولا إعلانات." },
      { head: "تعمل دون إنترنت", sub: "على حاسوبك نفسه، ولا يُرفع منه شيء." },
      { head: "خفيفة", sub: "تعمل على حاسوب محمول عادي، دون بطاقة رسوميات." },
      { head: "لا برامج إضافية", sub: "الإضافة وحدها تكفي." },
      { head: "على كل حاسوب", sub: "" },
    ],
    systems: ["Windows", "Mac", "Linux", "ChromeOS"],
    formats: ["الفيديوهات", "Shorts", "البث المباشر"],
    live: "مباشر",
    browsers: "Chrome · Edge · Brave · Firefox",
    searchHint: "ابحث",
  },
} satisfies Record<Lang, unknown>;

type Catalog = Record<string, { message: string }>;
const msg = (c: Catalog) => (key: string) => {
  const m = c[key]?.message;
  if (m === undefined) throw new Error(`missing extension string ${key}`);
  return m;
};

/** The interfaces the film redraws, in each language: the extension's own catalogs (extension/_locales), and
 *  Chrome's and the Web Store's own words (Chromium's extensions_strings and generated_resources translations;
 *  the live store listing, 16 November 2026). */
export const UIX = {
  en: {
    ext: msg(extEn as Catalog),
    storeTitle: "chrome web store",
    storeSearch: "Search extensions and themes",
    storeNav: ["Discover", "Extensions", "Themes"],
    name: "Musicless",
    addToChrome: "Add to Chrome",
    chips: ["Extension", "Accessibility"],
    tabStore: "Musicless - Chrome Web Store",
    dialogTitle: 'Add "Musicless"?',
    dialogCan: "It can:",
    dialogHosts: "Read and change your data on m.youtube.com, www.youtube-nocookie.com, and www.youtube.com",
    cancel: "Cancel",
    addExtension: "Add extension",
    // the demo's video: Kurzgesagt's "The Largest Star in the Universe", English upload
    videoTitle: "The Largest Star in the Universe – Size Comparison",
    channel: "Kurzgesagt – In a Nutshell",
    channelMark: "K",
    videoId: "3mnSDifDSxQ",
    upNext: "Up next",
    shotCaption: null as [string, string] | null,
  },
  ar: {
    ext: msg(extAr as Catalog),
    storeTitle: "سوق Chrome الإلكتروني",
    storeSearch: "البحث عن إضافات ومظاهر",
    storeNav: ["استكشاف", "الإضافات", "المظاهر"],
    name: "بلا موسيقى",
    addToChrome: "الإضافة إلى Chrome",
    chips: ["الإضافة", "تسهيل الاستخدام"],
    tabStore: "بلا موسيقى - سوق Chrome الإلكتروني",
    dialogTitle: "هل تريد إضافة \"بلا موسيقى\"؟",
    dialogCan: "يمكنه:",
    dialogHosts: "قراءة بياناتك وتغييرها في m.youtube.com، www.youtube-nocookie.com و www.youtube.com",
    cancel: "إلغاء",
    addExtension: "تثبيت الإضافة",
    // the same film's Arabic upload, on Kurzgesagt's Arabic channel (one picture with Arabic labels, an Arabic narrator)
    videoTitle: "النجم الأكبر في الكون - مقارنة الحجم",
    channel: "بكل بساطة – Kurzgesagt",
    channelMark: "K",
    videoId: "3eRqfiUoECQ",
    upNext: "التالي",
    // the store image's caption, redrawn over it: the image says «يزيل … ويُبقي»; the extension is feminine
    shotCaption: ["تُزيل معظم الموسيقى.", "وتُبقي الأصوات البشرية."] as [string, string] | null,
  },
} satisfies Record<Lang, unknown>;
