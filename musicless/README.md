# Musicless (بلا موسيقى): launch film

The launch film for **Musicless**, the free browser extension that removes most of the background music from
YouTube videos and keeps the voices. It is on the Chrome Web Store and Firefox Add-ons. One Remotion timeline
renders the film in **English (about 82 s)** and **Arabic (about 101 s)** at **60 fps**, in three frames:
**16:9** (1920×1080), **9:16** (1080×1920) and **4:5** (1080×1350).

The film uses the brand's ink and paper (`#1f1d1a`, `#f4ede0`), its logos and the snapped note, and Alexandria
for the film's own words in both languages. The extension already uses Alexandria for its Arabic headings. The
film's own sound has no music: the music is shown as notes, and every note breaks the way the logo's note does.
The only music heard is a few seconds of a real video in the demo, before Musicless removes it.

## Story

1. **Hook.** On ink, music notes stream along a staff across a playing video (*The Largest Star in the Universe*, below); the
   first frame is already this scene, so it works as a feed thumbnail.
   «What if you could remove the music from YouTube videos…». A click on Musicless's button in the player:
   every note snaps like the logo's note and falls apart, the staff parts, and "music" is struck through.
   «…and keep the voices?» A single voice line stays.
2. **Brand.** «Now you can.» The lockup arrives and its note snaps, as on the extension's first-run page (no
   tagline here: the owner dropped it from the opening).
3. **Why.** Paper rises. Lectures, documentaries, lessons and recipes land on their words, each with its music,
   centred until the headline arrives and they make room for it. «وإضافة «بلا موسيقى» تساعدك على تجنّب الاستماع
   إلى الموسيقى، وعلى سماع كل كلمة بوضوح.» On «تجنّب», every note snaps and «موسيقى» in the headline is struck
   through; «تجنّب الموسيقى.» lands on «الموسيقى» and «سماع كل كلمة.» on «كلمة», and on «سماع» each card gets a
   voice. English: "Musicless helps you avoid listening to music, and hear every word clearly.", with "Avoid the
   music." on "to music" and "Hear every word." on "every word".
4. **Three clicks.** «3 clicks», then a Chrome window with the camera of a screen recording:
   - search the Chrome Web Store, then **Add to Chrome** (1)
   - Chrome's own **Add extension** dialog (2)
   - the extension's first-run page opens in a new tab, then **Turn on Musicless** (3); the note snaps and the
     page says «Musicless is on». A «Done!» badge closes the setup.

   Each click's number stays only while its page is on screen, and a new tab's page dissolves in over the old one.
5. **Demo.** A real before and after. «Let's hear the difference. Here's a video with music.» A YouTube watch
   page plays *The Largest Star in the Universe* where Earth gives way to Jupiter, with its own sound (narrator
   and music about as loud as each other, notes over the picture) for 6 to 8 s. The
   cursor reaches the player's Musicless button (**Remove music**) and clicks; the video waits with the spinner and
   **Removing music** (about 1 s; the extension takes 2 to 4), the notes snap, and the same sentence goes on with
   the music removed, a voice line across the picture. The sound after the click is Musicless's own output
   (`scripts/prepare_demo.py`). «The music is gone, and the voices stay. Want the original sound? Just click the icon
   again.» The cursor shows **Restore original sound**, clicks, and the button flips back.
6. **Why you'll love it.** Ink rises; the title arrives large, then settles above the list. Six reasons land on
   their words into a list that stays: every video (Videos, Shorts, Live streams: the emblem's frame turns into a
   Short, then goes live), completely free, works offline, light, nothing else to install, and every computer
   (Windows, Mac, Linux, ChromeOS).
7. **End card.** The lockup, the tagline, then the official Chrome Web Store and Firefox badges as each store is
   named (both lift on «Install it now»), «Chrome · Edge · Brave · Firefox», what to search for, and «Watch
   YouTube without the music». The voice line from the opening runs along the bottom to the last frame.

Every visual action is timed from a spoken word (`src/film/times.ts`). The narrow frames reuse the same scenes
with their own placements (`makeLayout` in `src/film/context.tsx`): the question in three rows, the cards two by
two, the emblem above the list (beside the title in 4:5), the end card as one column, and a browser camera that
frames each step by how much of the window it shows across.

## Real interfaces

Nothing on screen is a screenshot except the store's own first image inside the listing. The interfaces are
redrawn with their real words:

- **The extension:** every string comes from its catalogs (`src/data/ext-{en,ar}.json`, copied from
  `extension/_locales` in the musicless repository): the first-run page, «Musicless is on» and its steps, the
  player button's tooltips and «Removing music». The first-run page's sizes and the note's snap follow
  `pages.css` and `welcome.html`; the player button is `player-on.svg` and `player-off.svg`.
- **Chrome:** the install dialog's title, «It can:», the host line and both buttons come from Chromium's
  `extensions_strings` and `generated_resources` translations. In Arabic: «هل تريد إضافة "بلا موسيقى"؟»,
  «يمكنه:» and «تثبيت الإضافة». Chrome lists the hosts sorted.
- **The Chrome Web Store:** the listing's name, chips, button and title, checked on the live store on
  16 November 2026. The Arabic store image's own caption says «يزيل … ويُبقي»; the film redraws that caption in
  the image's face and colours as «تُزيل … وتُبقي» (the extension is feminine, الإضافة), as on the film's own
  tagline. In Arabic the button reads «الإضافة إلى Chrome». Searching "Musicless" or «بلا موسيقى»
  returns the extension first. Ratings and user counts are left out.
- **YouTube:** a dark watch page without the site's logo, after the modern player in the store screenshots. The
  video is Kurzgesagt's *The Largest Star in the Universe – Size Comparison*: the English film shows the English
  upload (`3mnSDifDSxQ`, Kurzgesagt – In a Nutshell), the Arabic film the Arabic one («النجم الأكبر في الكون -
  مقارنة الحجم», `3eRqfiUoECQ`, بكل بساطة – Kurzgesagt), with their real titles and channels. Both share one
  picture, the Arabic with its labels in Arabic. It was chosen because its music is loud under the narrator, in
  both languages: by perceived loudness the music is within about 2 dB of the voice from Earth to Jupiter (0:18 to
  0:28), where *Why the Moon?* (the previous choice) kept it 9 to 14 dB under and most Arabic dubs keep it 9 to
  12 dB under. The store's own image inside the listing still shows NASA's *Tour of the Moon*, as on the live
  store.

## Narration

The narrator is **Mazen Lawand** (`rPNcQ53R703tTmtue1AT`, ElevenLabs voice library) on **`eleven_v4`**, stability
0.5, similarity 0.8, seed 2024, with the `[speaking quickly]` tag, as in the Faqieh film.

Each language is one continuous take (`data/script-{en,ar}.json`), cut into lines only at real silences
(`scripts/gen_take.py`); `src/lib/timeline.ts` adds the film's pauses.

- The Arabic script spells Latin names in Arabic letters for the narrator (يوتيوب، كروم، فايرفوكس، ويندوز…);
  captions and the screen keep them in Latin.
- The Arabic follows the extension's conventions (`docs/translations.md` in the musicless repository). The name is
  always «بلا موسيقى», as «إضافة «بلا موسيقى»» with feminine agreement. The glossary's الأصوات البشرية is used,
  digits are Western, and the button labels are quoted exactly.
- `scripts/qa_take.py` checks each take with ElevenLabs Scribe. English matches the script except "wanna" for
  "want to"; Arabic matches word for word. «ترافقها» replaced «تصحبها», which Scribe heard as «تسحبها».
- Lines recorded after the takes, each with `scripts/patch_line.py` (the lines around it as context, its level
  matched, every expected word heard by Scribe), and chosen by pitch to sit with the take (median about 140 to
  150 Hz):
  - «وإضافة «بلا موسيقى» تساعدك على تجنّب الاستماع إلى الموسيقى، وعلى سماع كل كلمة بوضوح.» (17 November, the
    owner's choice among four wordings) replaced «…حرصًا على دينك…», which felt cheap, which in turn had replaced
    «Whether you avoid music for your faith, or…», which sounded like a test of the viewer's religion. Mazen
    read «وإضافةٌ بلا موسيقى» ("an extension without music", -tun before b), and the damma alone did not cure it
    (the owner still heard -tun), nor did full vowel marks. Quoting the name, «وإضافةُ «بلا موسيقى» تساعدك…», did in
    all six seeds. Takes were scored with a phoneme model (wav2vec2-xlsr-53-espeak-cv-ft): the CTC likelihood of
    "…f a t u b i l…" against "…t u n b…"/"…t u m b…", not its greedy transcript, which missed the n the owner
    heard. Takes the owner heard as -tun score −2.9 and +0.2; the quoted ones +5.3 to +6.6. Arabic seed 2024 with
    the take's tag (median 135 Hz), spliced with `--take` so the checked file is the one used. English, "Musicless
    helps you avoid listening to music, and hear every word clearly.": seed 2029 with the tag (median 148 Hz; the
    plain takes came out slower and near 129 Hz, further from the line before it at 170 Hz), also with `--take`.
  - The demo's «Let's hear the difference. Here's a video with music.» / «لنسمع الفرق. هذا فيديو فيه موسيقى.» and
    «The music is gone, and the voices stay. Want the original sound? Just click the icon again.» / «اختفت
    الموسيقى، وبقيت الأصوات. تريد الصوت الأصلي؟ اضغط على أيقونة الإضافة مرة أخرى.» English with `--plain`,
    Arabic with the tag, seed 2024.
- The line about every video («It works on every video, even Shorts and live streams.» / «تعمل على كل
  الفيديوهات، حتى Shorts والبث المباشر.») came after the takes. `scripts/patch_line.py` recorded it with the
  lines around it as context and matched its level to the line before. Takes were chosen by pitch to sit with the
  rest (median about 150 Hz): Arabic seed 2031 with the take's tag, English seed 2031 with `--plain` (with the tag,
  English came out about 30 Hz higher).

```sh
uv run --with numpy python -I scripts/gen_take.py en     # or ar; --split-only re-cuts the existing take
uv run --with numpy python -I scripts/qa_take.py en
uv run --with numpy python -I scripts/qa_cuts.py en
uv run --with numpy python -I scripts/patch_line.py en every "It works on every video, even Shorts and live streams." shorts 2031 --plain
uv run --with numpy python -I scripts/prepare_audio.py
```

Rebuilding narration or sound reads `ELEVENLABS_API_KEY` from the ignored monorepo `.env`. Do not copy it.

## Sound

`scripts/gen_sfx.py` generates ten effects with ElevenLabs Sound Effects v3: a click, a wooden snap, scattering
pieces, a thud, air, paper, a pop, typing and a quiet room. `scripts/qa_sfx.py` rejects any effect with a sustained
pitch; all ten pass. `scripts/prepare_audio.py` also cuts single keystrokes out of the typing, so each letter typed
on screen (the store search, the end card's search box) gets its own, as it appears. The mix is narration-led and
mastered to −14 LUFS.

The demo's sound (`public/audio/demo/<lang>-{a,b}.wav`, times in `data/demo.json`) is the real video's audio:
before the click as published, after it the voices as Musicless separates them. `scripts/prepare_demo.py` runs
`tests/reference.py` from the musicless repository, which is exactly the extension's separation, with the model its
`setup.sh` builds (checked against the pinned hash). Both halves share one gain, so the voice does not jump; the
video's music-and-voice part is brought to −24 LUFS, about 1 dB under the narration, and the narrator never
speaks over it. The cuts fall in the video narrator's pauses: English 17.75 → 24.1 → 27.7 s, Arabic 17.6 → 25.3 →
27.7 s (Arabic has no clean pause earlier).

```sh
MUSICLESS_REPO=~/path/to/musicless uv run --with numpy==2.5.4 --with onnxruntime==1.31.0 python -I scripts/prepare_demo.py
```

## Rendering

Node 20+, ffmpeg and Python 3 with [uv](https://docs.astral.sh/uv/) are required. The narration, sound, fonts,
footage (`footage/largest-star-{en,ar}.mp4`, each upload's first 45 s at 1080p60) and data are included, so rendering needs no API key.

```sh
cd launches/musicless
npm ci
npm run typecheck
npm run studio                         # Musicless-{en,ar}-{16x9,9x16,4x5}
./scripts/render_all.sh                # or: ./scripts/render_all.sh ar, or SHAPES=9x16 ./scripts/render_all.sh
python3 scripts/gen_captions.py en && python3 scripts/gen_captions.py ar
uv run --with numpy python -I scripts/qa_video.py out/final/musicless-launch-en-16x9.mp4
uv run --with numpy python -I scripts/qa_delivery.py
```

`render_all.sh` extracts the footage's frames (`scripts/extract_frames.sh`, 30 fps, into the ignored
`public/media/clip-{en,ar}/`), measures each language (`scripts/measure.mjs`), mixes its soundtrack offline
(`scripts/mix_audio.py`), renders muted and remuxes with the mix (`scripts/finalize.py`). The final MP4s,
captions and mixes are written to the ignored `out/final/`.

The player shows the footage as JPEG stills, frame by frame, instead of decoding video: on a busy machine the
video decoder ran Chrome out of resources. `scripts/render.mjs --chunk=12` renders 12-second parts, each in a
fresh browser, retries a part whose tab dies (up to three times), cancels and retries a part that stops producing
frames for 90 s (a crashed browser once left a render waiting for two hours), resumes from the parts already done,
and joins them without re-encoding. Set `CONCURRENCY` to change the render workers (default 4 for 16:9 and 2 for
the narrow frames, where four tall tabs ran out of memory; on 17 November four ran out in 16:9 too, so use
`CONCURRENCY=2` when a part fails at its first frame). `/tmp` here is a RAM disk with a per-user quota; when it
filled, every tab crashed with "ran out of memory or disk space" and Chrome's GPU process failed, even on one
worker. `render_all.sh` therefore sets `TMPDIR` to `~/.cache/musicless-render-tmp` (or `RENDER_TMPDIR`), on the
main disk, for the bundle, the frames and Chrome's shared memory. A killed render leaves its bundle
(`remotion-webpack-bundle-*`) there; remove it after one.

Review stills: `node scripts/stills.mjs Musicless-en-9x16 out/stills/en 3.4 9.8 23.2 31.5 54.8 61` and
`uv run --with pillow python -I scripts/sheet.py out/stills/sheet.jpg 6 270 out/stills/en-*.png`. In zsh, pass a
list of times held in a variable as `${=TIMES}`.

## Code and credits

`src/lib/timeline.ts` sets narration order and pauses, and `src/film/times.ts` ties actions to spoken words.
`src/film/scenes/` holds Hook (with the brand), Why, BrowserStage (setup and demo), Reasons and Outro.
`src/film/parts/` redraws the player, the browser and its pages, the notes and the brand.
`scripts/brand_paths.py` writes `src/film/parts/logoPaths.ts` from `public/brand`.

- Brand: Musicless logos, icon and player glyphs (assets/brand and extension/icons in the musicless repository).
- Fonts: Alexandria, Roboto and Noto Sans Arabic (OFL).
- Icons: redrawn in the style of lucide (ISC).
- Footage and the demo's sound: *The Largest Star in the Universe – Size Comparison*, Kurzgesagt – In a
  Nutshell (English) and بكل بساطة – Kurzgesagt (Arabic).
- The store image inside the listing: Musicless's own, with NASA Goddard's *Tour of the Moon in 4K*.
- Store badges: Google's "Available in the Chrome Web Store" and Mozilla's "Get the add-on", unmodified.
- Narration and sound effects: ElevenLabs.

Code is MIT; see [LICENSE](LICENSE). Remotion has [its own license](https://www.remotion.dev/license).
