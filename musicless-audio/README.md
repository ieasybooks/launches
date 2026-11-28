# Musicless audio files (بلا موسيقى): announcement film

The announcement for the **audio files** tool on the Musicless website (`musicless.ieasybooks.com`, the **Audio
files** tab): choose an MP3 or M4A file, and the page removes the music in the browser, on the device, with the
website's own model. One Remotion timeline renders the film in **English (about 49 s)** and **Arabic (about 56 s)**
at **60 fps**, in **9:16** (1080×1920) and **4:5** (1080×1350).

It continues the Musicless launch film (`../musicless`): the brand's ink and paper, its lockup and snapped note,
Alexandria for the film's own words, the same narrator, no music in the film's own sound, and notes that snap the way
the logo's note does.

## Story

1. **Hook.** On ink, three files stream music: notes ride two staves around `lecture.mp3`, `podcast.m4a` and
   `audiobook.mp3` (each with a strip of its sound, music and speech together); the first frame is already this
   scene. «Have a lecture, a podcast or an audiobook with music in it?» On "remove", every note snaps, the staves
   part and each file's strip becomes speech alone: "Now for your audio files". The lockup arrives on "Musicless" and
   the address on "website".
2. **The website.** Paper rises with an Android phone in Chrome on the website's YouTube tab. "Audio files" is
   tapped, then "Choose audio file"; the file rises into the workspace as the tool's own file row and lands on it (it
   checks the file, then it is ready). "Remove music": the tool's real stages, compressed ("Getting ready", then
   "Removing music" with "Less than a minute left" as the bar fills). While «It all happens on your device» is said,
   the page's own line "Your files stay on your device." is marked.
3. **Demo.** "Your audio is ready". «Let's hear the original.» "Original" is tapped, then play: the original plays for
   about 6 s while notes rise out of the result's card; "Music removed" is tapped and the same moment goes on without
   the music for about 4 s (the notes snap from the button outwards; a voice line runs behind the phone). The sound
   after the tap is the website's own output for this file. Pause. «The music is gone, and the voices stay.»
4. **Download.** "Download MP3" is tapped and the new file (`…-musicless.mp3`, the tool's own name for it) comes out
   with a check.
5. **Free.** Free, no account, nothing to install, on desktop and mobile, each landing on its word as the phone
   leaves.
6. **End card.** The lockup, the tool's own line "Remove music from your audio files.", the address typed out on
   «Try it now», the tool's privacy line, and the voice line to the last frame.

Every visual action is timed from a spoken word (`src/film/times.ts`).

**4:5.** The same film, laid out again in `makeLayout` (`src/film/context.tsx`): the question, the files and their
staves are smaller and closer; the phone rests a little larger than the whole phone would allow, its top in the frame
and its foot below it; the close shots on the tool keep the 9:16 zoom; the downloaded file lands under the phone's
address bar; the end card's column is centred, with the voice line near the bottom.

## The website, as it is

Nothing on the phone is a screenshot or a redrawing: it is the website itself. `scripts/site_snapshot.mjs` copies, from
a local build of the musicless repository (`npm run build:landing`), the built page's markup in both languages, its
two stylesheets and the audio tool's words (`landing/audio/copy.js`). The film puts the page in a shadow root
(`src/film/parts/Site.tsx`), so its styles and the film's never meet, and draws the tool's states with the same
templates as `landing/audio/app.js` (`render()`, `row()`, `button()`, its icons). The stylesheets are flattened for a
412-pixel-wide phone (a Pixel 8): the narrow-screen media rules always on, the rest off, viewport units at the phone's
width, and Android's own fonts in place of the system stacks (Roboto, Noto Naskh Arabic, Noto Sans Mono). The page's
Arabic headings keep its own Alexandria subset and unicode-range.

- The toolbar is tinted by the page's own `theme-color` (#f4ede0), as Chrome on Android does. In Arabic the status bar
  and the toolbar mirror; the address stays left to right.
- On a phone the page shows no preferred store button (`site.js`), and the tabs, file row and progress bar are the
  page's own. The preview's switch keeps the position and plays on, as the tool's does.
- The progress follows the real run, 0 to 94 % and then the result, with "Less than a minute left". The real run took
  about 85 s for the 2:30 file on a desktop, in 13 windows (0, 7, 15 … 94 %); the film shows it in about 4 s, so the
  bar fills steadily instead of in those steps, which would stutter at that speed.
- The tab switch is drawn the same way, as pages sliding: the files panel comes in from the side of its tab and
  pushes the YouTube panel out the other way, in step with the underline (two more copies of the page, one in each
  mode, clipped below the tabs). The camera's move to the tool starts as the slide settles and lands as the next tap
  comes, gently (sine), so the tap, the slide and the move read as one motion. The phone is placed by its transform,
  not left/top, so slow moves glide by fractions of a pixel.
- The tool switches from one state to the next at once; the film fades each change (the old contents out, the new
  ones in) and lets the workspace grow or shrink to its new height. The file row never fades with them: it stays
  where it is, and only what changes in it fades (its format and length once the file is checked, the "Change"
  button). The arriving file is the tool's own row (`SiteFileCard`): it comes up from below the frame at an even pace
  and brakes steadily (0.66 s, no burst at the start and no crawl at the end), lands exactly on the row the page then
  shows, and the checking state comes in under it as it settles, so the workspace is never empty.

## The demo file

The first 2:30 of the audio of Kurzgesagt's *The Largest Star in the Universe* (the English upload `3mnSDifDSxQ`, the
Arabic one `3eRqfiUoECQ`, as in the launch film), from the narrator's pause before "The smallest things…" / «أصغر
الأجسام…» (17.75 s and 17.6 s into the uploads), as a 192 kbps stereo MP3: "The Largest Star in the Universe.mp3" /
«النجم الأكبر في الكون.mp3», 2:30 · 3.4 MB. Its music is about as loud as the narrator.

`scripts/run_site.mjs` ran each file through the real website (Chrome, a phone-sized page) and saved the tool's own
download; `scripts/prepare_demo.py` cuts the film's sound from the original and that output (`data/demo.json`): the
original from 0 to the switch, then the website's output from the switch to the end, in the narrator's pauses
(Scribe's word times on the output): English 6.23 s and 10.05 s, Arabic 6.25 s and 10.15 s. Both halves share one
gain (the original's part at −24 LUFS, about 1 dB under the narration), and the narrator never speaks over them.
The output and the original line up to the sample.

```sh
# in the musicless repository: npm ci && npm run build:landing && PORT=8841 npm run preview:landing
MUSICLESS_REPO=~/path/to/musicless node scripts/site_snapshot.mjs
node scripts/run_site.mjs en footage/en-original.mp3 footage/en-musicless.mp3
uv run --with numpy python -I scripts/prepare_demo.py
```

`footage/` is ignored; the cut sound in `public/audio/demo` is committed.

## Narration

**Mazen Lawand** (`rPNcQ53R703tTmtue1AT`) on **`eleven_v4`**, stability 0.5, similarity 0.8, seed 2024, with the
`[speaking quickly]` tag, as in the launch film. Each language is one continuous take (`data/script-{en,ar}.json`),
cut into lines at real silences (`scripts/gen_take.py`); `src/lib/timeline.ts` adds the film's pauses. Scribe hears
the English take word for word and the Arabic one word for word except «بودكاست», which it writes as "podcast"
(`scripts/qa_take.py`).

- The Arabic script spells MP3 and M4A in Arabic letters for the narrator (إم بي ثري، إم فور إيه); captions and the
  screen keep them in Latin. It quotes the website's labels exactly («ملفات صوتية»، «أزل الموسيقى») and the name as
  «بلا موسيقى», and carries the case endings the narrator might guess wrong («أن تُزيلَ»، «ملفَّ»، «نزّلِ الملفَّ»).
- The Arabic wording was checked with the sibawayh Arabic-writing checker (no findings).
- The free line was re-recorded later to add desktop and mobile («وتعمل على الحاسوب والهاتف»), with the lines around
  it as context, and spliced in with `scripts/patch_line.py --take=…`. Of eight candidates per language, the English
  one keeps the take's tag (seed 2027: its pace, 14.9 letters/s against the take's 14.6, and a pitch within the take's
  range); the Arabic one is without the tag (seed 2026: 8.8 letters/s against 8.9, and the take's pitch; with the tag
  every Arabic candidate came out higher than any line of the take).

```sh
uv run --with numpy python -I scripts/gen_take.py en     # or ar; --split-only re-cuts the existing take
uv run --with numpy python -I scripts/qa_take.py en
uv run --with numpy python -I scripts/prepare_audio.py
```

Rebuilding narration reads `ELEVENLABS_API_KEY` from the ignored monorepo `.env`. Do not copy it.

## Sound

The launch film's effects (`audio/sfx_raw`, ElevenLabs Sound Effects; `scripts/qa_sfx.py` rejects any with a
sustained pitch): a soft click for each tap on the glass, the wooden snap and scattering pieces when the music goes, a
card for each arrival, keystrokes for the address. The mix is narration-led and mastered to −14 LUFS.

## Render

```sh
npm ci
npm run studio
./scripts/render_all.sh            # en and ar, 9:16 and 4:5 → out/final/musicless-audio-<lang>-<shape>.mp4
uv run --with numpy python -I scripts/gen_captions.py en   # and ar: SRT and WebVTT in out/final
python3 scripts/qa_delivery.py
```

## Credits

- Demo audio: *The Largest Star in the Universe – Size Comparison*, Kurzgesagt – In a Nutshell, and its Arabic
  version on بكل بساطة – Kurzgesagt.
- Fonts: Alexandria, Roboto, Noto Sans Arabic, Noto Naskh Arabic and Noto Sans Mono (SIL Open Font License).
- Musicless's logo, website and words: the musicless repository.
