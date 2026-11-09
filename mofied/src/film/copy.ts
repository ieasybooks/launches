import type { Lang } from "../lib/timeline";

/** The film's own words on screen. Arabic headlines follow the approved store listing. */
export const COPY = {
  ar: {
    dir: "rtl" as const,
    name: "مفيد",
    hook: ["فتحتَ هاتفك لدقيقة…", "فضاعت ساعة."],
    question: ["ماذا لو كان", "ما تشاهده يبقى معك؟"],
    tagline: "شاهد ما يبقى معك.",
    easy: ["افتح.", "شاهد.", "اسحب."],
    pills: ["بلا حساب", "بلا تسجيل"],
    curated: ["مختار", "بعناية."],
    curatedSub: "محتوى نظيف، بلا محرّمات.",
    reminderTop: "وقفة بين المقاطع",
    session: ["لكلّ جلسة", "نهاية."],
    day: ["ثم عُد", "إلى يومك."],
    free: ["مجاني بالكامل.", "بلا إعلانات.", "بلا حساب."],
  },
  en: {
    dir: "ltr" as const,
    name: "Mofied",
    hook: ["You opened your phone for a minute…", "and lost an hour."],
    question: ["What if what you watched", "stayed with you?"],
    tagline: "Watch what stays with you.",
    easy: ["Open.", "Watch.", "Swipe."],
    pills: ["No account", "No sign-up"],
    curated: ["Carefully", "chosen."],
    curatedSub: "Clean content. Nothing haram.",
    reminderTop: "A pause between clips",
    session: ["Every session", "ends."],
    day: ["Then get back", "to your day."],
    free: ["Completely free.", "No ads.", "No account."],
  },
} satisfies Record<Lang, unknown>;

// The app's interface copy and number formatting (packages/design/src/index.ts). On native, the
// store captures show Latin digits in these labels, so the film does the same.
export const APP = {
  ar: {
    quran: "من القرآن الكريم",
    pauseRead: "أوقف العدّ لمواصلة القراءة",
    remaining: (minutes: number) =>
      minutes === 1 ? "بقيت دقيقة واحدة" : minutes === 2 ? "بقيت دقيقتان" : minutes % 100 >= 3 && minutes % 100 <= 10 ? `بقيت ${minutes} دقائق` : `بقيت ${minutes} دقيقة`,
    countdown: (s: number) =>
      s <= 0
        ? "تُستأنف المواد الآن"
        : `تُستأنف المواد بعد ${s === 1 ? "ثانية واحدة" : s === 2 ? "ثانيتين" : s % 100 >= 3 && s % 100 <= 10 ? `${s} ثوانٍ` : `${s} ثانية`}`,
  },
  en: {
    quran: "From the Quran",
    pauseRead: "Pause the countdown to read",
    remaining: (minutes: number) => `${minutes} ${minutes === 1 ? "minute" : "minutes"} left`,
    countdown: (s: number) => (s <= 0 ? "Media resumes now" : `Media resumes in ${s} ${s === 1 ? "second" : "seconds"}`),
  },
} satisfies Record<Lang, unknown>;

export const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
