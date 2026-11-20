# Shawared (شوارد): launch film

The launch film for **Shawared** at [shawared.com](https://shawared.com) and on the App Store, Google Play and
AppGallery: Arabic poetry as it is recited, with each verse lighting up as it is heard, and its explanation and
word meanings a tap away. One Remotion timeline renders the film in **Arabic (about 80 s)** and **English (about
75 s)** at **60 fps**, in three frames: **9:16** (1080×1920, for Shorts, Reels, TikTok and stories), **4:5**
(1080×1350, for feeds) and **16:9** (1920×1080, for YouTube, X and the web).

It is a sibling of the Mofied film (same narrator, one continuous take, every action on a spoken word, no music,
the app on a drawn iPhone, the store badges named one by one) with its own idea: Mofied's film is about time;
this one is about **voice and meaning**. A famous verse waits silent on the page, a reciter's real voice brings it
to life, and the film asks whether you know what it means; the app answers.

## Story

1. **Read, then hear.** Paper and the app's girih band. Bayt 1 of «عيون المها» (Ali ibn al-Jahm), in ink:
   «اقرأ هذا البيت…» and a pause to read it. «ثم اسمعه.» Osama Al-Waaedh recites it, from the app's own recording,
   and each word fills with saffron as he says it (his words' real timings), the half being recited lit as the app
   lights it. The first frame is already this verse, so it works as a feed thumbnail.
2. **The question.** «بيتٌ يردّده العرب منذ أكثر من ألف عام… لكن، هل تعرف ما «المها»؟» Every word steps back but
   «المها», its dotted gloss mark draws in, and a saffron diamond rises from it. In English: "Quoted for over a
   thousand years. But do you know what it says?"
3. **The name.** The diamond flies up and lands as the first of the mark's three roaming dots; the square-Kufic ش
   draws in, the other two dots follow, then the wordmark and «الشعر العربي كما يُلقى».
4. **Into the app.** The camera pulls back: the verse on the film's paper *is* bayt 1's row on the app's paper,
   and the iPhone closes around it. «اسمع.» and «اقرأ.» land on their words; play is tapped and the whole of bayt 2
   is recited, its first half lit, then its second, as the app lights them.
5. **Understand.** «افهم.» «المس الكلمة لعرض معناها، والبيت لشرحه.» A tap on «المها» opens the bayt's notes with the
   word's meaning picked out; the camera goes in on it. «المها: البقرة الوحشية، والعرب تشبّه بعيونها العيونَ الواسعة الجميلة.» A photograph of an
   Arabian oryx arrives, and the camera pushes in to its eyes. English: "Maha: the oryx…" over the app's English
   notes and translation.
6. **From Imru' al-Qays to Ahmad Shawqi.** Six eras with poets from the library, a small saffron diamond between
   each two names; a saffron thread runs from the first spoken name to the last. «تصفّح الشعراء والمُلقين.» ("browse
   by poet and reciter."): the Poets tab, then Reciters, with the poem still playing in the mini player.
7. **Night.** Night falls down the frame on «ونزّل القصائد لتسمعها دون اتصال.» ("Download any poem to listen
   offline."): download, its ring, the downloaded mark, and airplane mode: «دون اتصال».
8. **Free.** «مجانيٌّ بالكامل. بلا إعلانات. بلا حساب.», each on its spoken word.
9. **End card.** The lockup at night, the three official store badges as each store is named, and shawared.com.

The film never mentions meters (the app is drawn as it is, so its meter chip and tab are on screen, but nothing
points at them).

## The app on screen is the real app

Nothing in the phone is a screenshot and nothing is redrawn by hand. `capture/capture.mjs` opens the live site
(shawared.com, the apps' own Expo code) in Chrome at an iPhone's 393 × 852 pt with its safe areas (59 / 34 pt,
through the DevTools safe-area override, so the layout is the native one) and records every state the film shows:
paused at the end of bayt 1, bayt 2 playing (each half lit), the notes open on «المها», the night theme, and the
Poets and Reciters tabs with the mini player, in both languages. `capture/dom.js` flattens each screen into
boxes, text lines and icons with their exact geometry and styles (including the kashida the app sets, the gloss
marks, the girih and the ellipses), into `src/data/shots/<lang>-<state>.json`. `src/film/parts/Shot.tsx` redraws
them with the app's own fonts; compared with Chrome's screenshots of the same states, under 1% of pixels differ,
all at glyph edges. Scenes change single nodes (a word's colour, the notes' sheet sliding up, the verse list's
scroll, the equalizer bars) and switch between recorded states as the app does.

- The apps' download button (the web has none) is added where `Meta.tsx` puts it, as a copy of the playlist button
  with the app's download icon, so the actions wrap as they do on a phone; its progress ring and downloaded icon
  follow `DownloadButton.tsx`.
- The status bar is iOS, drawn.
- Words: the bayt's text, the notes, the meaning («جمع مهاة، وهي البقرة الوحشية…») and the English translation and
  notes are the app's content (`content/poems/uyun-al-maha` in the shawared repository).

Re-record after the app changes (needs Google Chrome): `node capture/capture.mjs [ar|en] [state…]`, then
`python3 scripts/shots_index.py`.

## Sound

- **Narration:** Mazen Lawand (`rPNcQ53R703tTmtue1AT`, ElevenLabs library) on `eleven_v4`, stability 0.5,
  similarity 0.8, seed 2024, as in Mofied: one continuous take per language, cut into lines at its real silences
  (`scripts/gen_take.py`). The English script writes the name in Arabic letters («شَوارِد») so he says it natively.
  Lines that changed or were said wrongly were re-recorded and spliced in (`scripts/patch_line.py --take`), each
  checked with Scribe, a phoneme model (wav2vec2 espeak, forced alignment and the likelihood of each reading) and
  its pitch against its neighbours, and, where a short vowel was in doubt, that vowel's formants (Praat): Arabic
  «اِلْمِسِ الكلمةَ لِعَرْضِ معناها، والبيتَ لشرحه.» (one take said «ألمس», another a closed «لعِرض»),
  «تَصَفَّحِ الشُّعَراءَ والمُلْقِين.» (a take said «تصفِّح») and «ونزّلِ القصائدَ لتسمعها دون اتصال.»; English
  "Mahaa: the oryx…" (the take swallowed the final vowel) and "Download any poem to listen offline." Fully marking
  the word in doubt («لِعَرْضِ», «تَصَفَّحِ») is what moved the vowel.
- **Recitation:** Osama Al-Waaedh's «عيون المها», the recording the app plays, taken from its source at higher
  quality (`public/audio/rec/osama.wav`, the app's time 0 to 22.5 s, at −22 LUFS). Word timings come from the
  app's forced alignment (`src/data/recitation.json`). He runs his halves together, so each stretch is cut in the
  tens of milliseconds where his voice dips (`RECS` in `src/lib/timeline.ts`). The narrator never speaks over him.
- **Effects:** non-musical only (a page, paper, taps, air, a room, the night); Mofied's set plus
  three new ones (`scripts/gen_sfx.py`, ElevenLabs Sound Effects v3), every one checked for sustained pitch by
  `scripts/qa_sfx.py`. No music.
- The master is −14 LUFS with true peaks under −1.5 dBTP.

```sh
python scripts/gen_take.py ar            # or en; --split-only re-cuts the existing take
python scripts/qa_take.py ar
python scripts/patch_line.py ar tap "اِلْمِسِ الكلمةَ لِعَرْضِ معناها، والبيتَ لشرحه." لعرض --take=<checked take>.mp3
python scripts/patch_line.py en meaning "Mahaa: the oryx, whose wide dark eyes the poets gave to the women they loved." oryx --take=<checked take>.mp3
python scripts/prepare_audio.py
```

Rebuilding narration or sound reads `ELEVENLABS_API_KEY` from the ignored `.env` at the repository root.

## Rendering

Node 20+, ffmpeg and Python 3 with [uv](https://docs.astral.sh/uv/). Narration, recitation, sound, fonts and the
recorded screens are included, so rendering needs no key and no network.

```sh
cd launches/shawared
npm ci
npm run typecheck
npm run studio                       # Shawared-<ar|en>-<9x16|4x5|16x9>
./scripts/draft.sh ar                # half-size drafts with sound in out/draft/
./scripts/render_all.sh              # or: ./scripts/render_all.sh ar ; SHAPES="9x16" limits the frames
python scripts/gen_captions.py ar && python scripts/gen_captions.py en
python scripts/qa_video.py out/final/shawared-launch-ar-9x16.mp4
python scripts/qa_delivery.py
```

`render_all.sh` measures each language (`scripts/measure.mjs`), mixes its soundtrack offline
(`scripts/mix_audio.py`, which also cuts the recitation's stretches), renders the three frames muted and remuxes them
with the mix (`scripts/finalize.py`). Final MP4s, SRT/VTT captions (narration and the recited halves) and
`delivery.json` go to the ignored `out/final/`. Review: `node scripts/stills.mjs Shawared-ar-9x16 out/stills/a
$(python3 scripts/keytimes.py ar)` and `uv run --with pillow python scripts/sweep.py ar 9x16` (a frame sweep of a
draft around every key moment).

## Layout

9:16 is the reference: the words above the phone, inside what Shorts, Reels and TikTok leave clear at the top;
the phone below them is the picture. 4:5 and 16:9 put the phone to one side and the words in the middle of the
space beside it, on the reading side (right in Arabic, left in English), and their camera keeps the phone clear of
them (`makeLayout` in `src/film/context.tsx`, `stageCam` in `src/film/scenes/Stage.tsx`). In 16:9 each era is one
line (the era, then its poets) and the block is centred in the frame.

## Code and credits

`src/lib/timeline.ts` orders narration and recitation; `src/film/times.ts` ties actions to spoken words;
`src/film/scenes/Stage.tsx` is the phone from the opening verse to the night; `Overlays.tsx` the credit, the
diamond, the name, the verbs, the oryx and the night's captions; `Eras.tsx`, and `Outro.tsx` for free and the end
card. `src/film/sounds.ts` drives both the Studio preview and the offline mix.

- Fonts: Amiri, Readex Pro, Newsreader and Reem Kufi (Google Fonts, OFL), the app's own.
- Mark, wordmark, girih and palette: Shawared (`packages/design`).
- Recitation: Osama Al-Waaedh. Poem: Ali ibn al-Jahm. Notes, meanings and translation: Shawared.
- Photograph of an Arabian oryx in the King Salman bin Abdulaziz Royal Reserve: Saudi Press Agency (SPA), via
  Wikimedia Commons, CC BY-SA 4.0.
- Narration and sound effects: ElevenLabs. Store badges: Apple, Google and Huawei.

Code is MIT; see [LICENSE](LICENSE). Remotion has [its own license](https://www.remotion.dev/license).
