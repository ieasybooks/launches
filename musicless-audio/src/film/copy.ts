import audioCopy from "../data/audio-copy.json";
import type { Lang } from "../lib/timeline";

/** The film's own words on screen. Arabic follows Musicless's conventions (docs/translations.md in the musicless
 *  repository): the name is «بلا موسيقى», Latin names and formats stay Latin, Western digits. */
export const COPY = {
  en: {
    dir: "ltr" as const,
    hook: ["Have a lecture,", "a podcast or", "an audiobook", "with music in it?"],
    // the three kinds of file in the question, each landing on its word
    files: [
      { name: "lecture.mp3", type: "MP3", cue: "lecture" },
      { name: "podcast.m4a", type: "M4A", cue: "podcast" },
      { name: "audiobook.mp3", type: "MP3", cue: "audiobook" },
    ],
    now: "Now for your audio files",
    url: "musicless.ieasybooks.com",
    free: [
      { text: "Free", cue: "free" },
      { text: "No account", cue: "account" },
      { text: "Nothing to install", cue: "install" },
      { text: "Desktop and mobile", cue: "desktop" },
    ],
  },
  ar: {
    dir: "rtl" as const,
    hook: ["هل لديك محاضرةٌ", "أو بودكاست", "أو كتابٌ مسموع", "ترافقه موسيقى؟"],
    files: [
      { name: "محاضرة.mp3", type: "MP3", cue: "محاضرة" },
      { name: "بودكاست.m4a", type: "M4A", cue: "بودكاست" },
      { name: "كتاب مسموع.mp3", type: "MP3", cue: "كتاب" },
    ],
    now: "والآن لملفاتك الصوتية",
    url: "musicless.ieasybooks.com",
    free: [
      { text: "مجانية", cue: "مجانية" },
      { text: "بلا حساب", cue: "حساب" },
      { text: "دون تثبيت أي شيء", cue: "تثبيت" },
      { text: "على الحاسوب والهاتف", cue: "الحاسوب" },
    ],
  },
} satisfies Record<Lang, unknown>;

/** The website's own words (landing/audio/copy.js in the musicless repository, copied by scripts/site_snapshot.mjs). */
export const SITE = audioCopy as Record<Lang, typeof audioCopy.en & Record<string, unknown>>;
