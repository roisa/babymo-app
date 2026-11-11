# Recorded voice clips (one Google TTS voice for the whole app)

`www/bm-voice.js` (loaded on every page that speaks) wraps `speechSynthesis.speak`: when an utterance's text has a
recorded clip, the clip plays instead of the phone's voice and the utterance's `onstart` / `onend` / `onerror`
still fire, so each game's sequencing keeps working. No clip, or a clip that fails → the phone's text-to-speech,
as before. The manifests ship empty or partly filled, so the games work with or without clips.

## Clip lists

- `clips.json` — 192 Arabic items for Pulau Hijaiyah, Doa Harian and Doa Ramadan: 167 hijaiyah sounds (sec `huruf`: letter
  names, syllables with harakat and tanwin, harakat names, 38 words, Bismillah) and 25 du'as (sec `doa`): the 14 daily ones
  (`d-<id>`) and the 11 Ramadan ones (`d-r_<id>`, `g: "Doa Ramadan"`, texts copied exactly from `www/doa-ramadan.js`).
  Both series play them through `www/doa-voice/voice.js` (`window.DOA_VOICE`), so no page change is needed when they arrive.
- `clips-app.json` — made by `build-app-clips.js` from the pages' own data:
  - sec `app`: every other Arabic string the games speak (Sholat Bareng Mo recitations and dzikir, Wudhu du'a,
    Kata Baik, Memory Match letters, Susun Huruf letter names and words, Doa Harian word-by-word read-along);
  - sec `cari`: every Cari Baby Mo object name, Baby Mo and the secret objects, in Indonesian (`lang: "id"`) and
    English (`lang: "en"`, from `www/i18n/find.js`).
  Each entry is `{id, t, lang, sec, k}` (+ `h` hint, `g` group, `p` pages). Ids are `<sec>-<sha1(lang|text)[:8]>`, so
  they stay the same across rebuilds.
- `clips-lines.json` — made by `build-lines-clips.js`: every Indonesian (`lang: "id"`) and English (`lang: "en"`)
  line the games speak (sec `lines`): instructions, praise, tips, narration, greetings and the Dreamtime story
  read-alouds, so the whole app speaks in the one recorded voice, not the phone's. Same entry shape and id scheme
  (`lines-<sha1(lang|text)[:8]>`); `g` is the game and language, `h` what the line is. The builder reads each page's
  own data in a browser in both languages, enumerates template lines over their real values (crops × friends,
  animals, stations…), and takes the English text exactly as `bm-i18n.js` produces it for an Indonesian utterance.
  Lines that are only an Arabic transliteration ("Bismillah") are left out: `aliases.json` plays the Arabic clip.
  Mixed lines ("Alhamdulillah! Panen Tomat") are one Indonesian (or English) clip.
- `aliases.json` — Latin transliterations the games speak on their own ("Bismillah", "Bismika Allahumma ahya wa
  amut", "Masya Allah"…) → the Arabic text whose clip should play.

Rebuild `clips-app.json` after changing a game's Arabic text or Cari objects:

```bash
(cd www && python3 -m http.server 8803) &
node tools/voice/build-app-clips.js        # needs Playwright
```

Rebuild `clips-lines.json` after changing what a game says (Indonesian or English):

```bash
(cd www && python3 -m http.server 8815) &
node tools/voice/build-lines-clips.js http://127.0.0.1:8815/
node tools/voice/test-keys.js                         # bm-voice.js, gen.py and voicekey.js give the same keys
node tools/voice/test-lines-play.js fake              # plays the games: what would still use the phone's voice
```

## Output

- `www/hijaiyah-voice/*.mp3` + `voice.js` (`window.HIJ_VOICE`) and `www/doa-voice/*.mp3` + `voice.js`
  (`window.DOA_VOICE`): Arabic text → file, as before.
- `www/voice/*.mp3` + `manifest.js` (`window.BM_VOICE`): one manifest for everything, keyed
  `"<lang>|<normalised text>"` (`ar` for any text with Arabic letters, else `en` / `id`), plus `"tr|<latin>"` for the
  aliases. It also points at the hijaiyah / du'a clips (`../doa-voice/…`), so every page reuses them.
  Normalising (same in `bm-voice.js`, `gen.py` and `voicekey.js`; `test-keys.js` checks them): Unicode NFC, emoji /
  pictographs / arrows removed, curly quotes straightened, dashes unified, whitespace collapsed, no space before
  punctuation, repeated end marks folded ("!." → "!"), leading and trailing punctuation trimmed, tatweel removed,
  Latin lower-cased. Harakat are kept: different harakat are different sounds. So "☀️ Selamat pagi! … 💧" finds the
  same clip as the plain line, whatever voice, pitch or rate the page chose.
- Links carry `?v=<voice>` so phones fetch new audio after a voice change.

## Generate in Google Cloud Shell

```bash
bash tools/voice/cloudshell.sh ar-XA-Chirp3-HD-Algenib     # everything (518 clips), pushes a voice-clips-… branch
bash tools/voice/cloudshell.sh app                          # only the app Arabic + Cari names (keeps the 181)
bash tools/voice/cloudshell.sh lines                        # only the Indonesian + English lines not made yet
bash tools/voice/cloudshell.sh ramadan                      # only the missing Doa Ramadan du'as (11) + missing lines (22)
bash tools/voice/cloudshell.sh compare                      # samples to choose an Arabic voice
```

`lines` keeps every clip already made and checks only the new ones with speech-to-text (`id-ID` / `en-US`).
`ramadan` first prints a dry run (what is missing), then makes only the missing `doa` + `lines` clips (Arabic in
`ar-XA-Chirp3-HD-Algenib`, Mo's Indonesian / English "when" lines in the same family), checks only those with
speech-to-text, rewrites `www/doa-voice/voice.js`, `www/voice/manifest.js` and the listening page data, and pushes a
`voice-clips-…` branch. Until it has run, Doa Ramadan uses the phone's voice, as before.

### Doa Ramadan from Cloud Shell, step by step

1. Open https://shell.cloud.google.com (signed in to the Google account / project that already makes the clips).
2. Once: `git clone https://github.com/roisa/babymo-app.git && cd babymo-app` (afterwards just `cd babymo-app`), and make
   sure `gh auth status` is signed in (`gh auth login` if not) so the branch can be pushed.
3. `BASE=main bash tools/voice/cloudshell.sh ramadan` (use `BASE=doa-ramadan` while the series is not merged yet).
4. Listen to anything marked CHECK on `www/tools/dengar-suara.html`, then tell Claude the pushed branch name.

English and Indonesian use the same voice family as the Arabic voice (`en-US-Chirp3-HD-Algenib`,
`id-ID-Chirp3-HD-Algenib`); set `VOICE_EN=…` / `VOICE_ID=…` to choose others. Chirp voices take no
`speakingRate`, so all clips are at natural speed.

## Generate anywhere else

Needs a Google Cloud API key with Text-to-Speech (and Speech-to-Text for `--check`) enabled, either as the
environment variable `GOOGLE_TTS_API_KEY`, as a network secret (`X-Goog-Api-Key`) for
`texttospeech.googleapis.com` and `speech.googleapis.com`, or a signed-in `gcloud`.

```bash
python3 tools/voice/gen.py --test                  # one clip per language — confirms the key and the voices
python3 tools/voice/gen.py --check                 # all clips + speech-to-text check (tools/voice/check-report.json)
python3 tools/voice/gen.py --only app,cari         # some sections: hijaiyah, doa, app, cari, lines
python3 tools/voice/gen.py --voice ar-XA-Chirp3-HD-Kore --voice-en en-US-Chirp3-HD-Kore --voice-id id-ID-Chirp3-HD-Kore
python3 tools/voice/gen.py --manifest              # only rewrite www/voice/manifest.js from the files on disk
python3 tools/voice/gen.py --dry-run --only doa,lines   # list what would be made (missing files) — no key, no API calls
```

Existing files are kept (resume) unless `--force`. The speech-to-text check listens in `ar-SA`, `en-US` or `id-ID`.

Listen to the clips on `www/tools/dengar-suara.html` (tabs per section; it reads the manifests), especially any
marked CHECK, then bump `babymo-games-vNN` in `www/sw.js` before shipping.
