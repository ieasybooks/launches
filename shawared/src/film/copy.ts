import type { Lang } from "../lib/timeline";

// The film's own words on screen. Everything inside the phone is the app's, recorded from shawared.com.
export const COPY = {
  ar: {
    poet: "عليّ بن الجَهم",
    when: "القرن الثالث الهجري",
    reciter: "إلقاء أسامة الواعظ",
    tagline: "الشعر العربي كما يُلقى",
    verbs: ["اسمع.", "اقرأ.", "افهم."],
    maha: "المَها",
    oryx: "البقرة الوحشية",
    eras: [
      { era: "الجاهلية", poets: ["اِمرُؤُ القَيس", "عَنتَرَة بن شَدّاد"] },
      { era: "صدر الإسلام", poets: ["كَعب بن زُهَير", "حَسّان بن ثابِت", "الخَنساء"] },
      { era: "العصر الأموي", poets: ["جَرير", "مَجنون لَيلى"] },
      { era: "العصر العباسي", poets: ["أَبو تَمّام", "عَليّ بن الجَهم", "المُتَنَبّي", "أَبو فِراس"] },
      { era: "الأندلس", poets: ["اِبنُ زَيدون", "أَبو البَقاء الرُّندي"] },
      { era: "العصر الحديث", poets: ["حافِظ إِبراهيم", "أَحمَد شَوقي"] },
    ],
    offline: "دون اتصال",
    free: ["مجانيٌّ بالكامل.", "بلا إعلانات.", "بلا حساب."],
    url: "shawared.com",
  },
  en: {
    poet: "Ali ibn al-Jahm",
    when: "9th century",
    reciter: "Recited by Osama Al-Waaedh",
    tagline: "Arabic poetry, as it's recited",
    verbs: ["Listen.", "Read.", "Understand."],
    maha: "Maha",
    oryx: "the oryx",
    eras: [
      { era: "Before Islam", poets: ["Imru' al-Qays", "Antara ibn Shaddad"] },
      { era: "Early Islam", poets: ["Ka'b ibn Zuhayr", "Hassan ibn Thabit", "al-Khansa'"] },
      { era: "Umayyad", poets: ["Jarir", "Majnun Layla"] },
      { era: "Abbasid", poets: ["Abu Tammam", "Ali ibn al-Jahm", "al-Mutanabbi", "Abu Firas"] },
      { era: "Al-Andalus", poets: ["Ibn Zaydun", "Abu al-Baqa' al-Rundi"] },
      { era: "Modern", poets: ["Hafiz Ibrahim", "Ahmad Shawqi"] },
    ],
    offline: "Offline",
    free: ["Completely free.", "No ads.", "No account."],
    url: "shawared.com",
  },
} satisfies Record<Lang, unknown>;
export type Copy = (typeof COPY)["ar"];

/** Labels the app gives its controls (apps/app/src/lib/i18n.ts), to find them in the recorded screens. */
export const LABELS = {
  ar: { row1: "البيت ١", row2: "البيت ٢", maha: "المَها", play: "تشغيل", pause: "إيقاف مؤقت", repeat: "التكرار", download: "نزّل", reciters: "المُلقون", poets: "الشعراء", meanings: "معاني الكلمات" },
  en: { row1: "Verse 1", row2: "Verse 2", maha: "المَها", play: "Play", pause: "Pause", repeat: "Repeat", download: "Download", reciters: "Reciters", poets: "Poets", meanings: "Word meanings" },
};
