# Recorded voice clips (one Google TTS voice for the whole app)

`www/bm-voice.js` (loaded on every page that speaks) wraps `speechSynthesis.speak`: when an utterance's text has a
recorded clip, the clip plays instead of the phone's voice and the utterance's `onstart` / `onend` / `onerror`
still fire, so each game's sequencing keeps working. No clip, or a clip that fails → the phone's text-to-speech,
as before. The manifests ship empty or partly filled, so the games work with or without clips.

## Clip lists

- `clips.json` — 181 Arabic items for Pulau Hijaiyah and Doa Harian: 167 hijaiyah sounds (sec `huruf`: letter names,
  syllables with harakat and tanwin, harakat names, 38 words, Bismillah) and 14 du'as (sec `doa`).
- `clips-app.json` — made by `build-app-clips.js` from the pages' own data:
  - sec `app`: every other Arabic string the games speak (Sholat Bareng Mo recitations and dzikir, Wudhu du'a,
    Kata Baik, Memory Match letters, Susun Huruf letter names and words, Doa Harian word-by-word read-along);
  - sec `cari`: every Cari Baby Mo object name, Baby Mo and the secret objects, in Indonesian (`lang: "id"`) and
    English (`lang: "en"`, from `www/i18n/find.js`).
  Each entry is `{id, t, lang, sec, k}` (+ `h` hint, `g` group, `p` pages). Ids are `<sec>-<sha1(lang|text)[:8]>`, so
  they stay the same across rebuilds.
- `aliases.json` — Latin transliterations the games speak on their own ("Bismillah", "Bismika Allahumma ahya wa
  amut", "Masya Allah"…) → the Arabic text whose clip should play.

Rebuild `clips-app.json` after changing a game's Arabic text or Cari objects:

```bash
(cd www && python3 -m http.server 8803) &
node tools/voice/build-app-clips.js        # needs Playwright
```

## Output

- `www/hijaiyah-voice/*.mp3` + `voice.js` (`window.HIJ_VOICE`) and `www/doa-voice/*.mp3` + `voice.js`
  (`window.DOA_VOICE`): Arabic text → file, as before.
- `www/voice/*.mp3` + `manifest.js` (`window.BM_VOICE`): one manifest for everything, keyed
  `"<lang>|<normalised text>"` (`ar` for any text with Arabic letters, else `en` / `id`), plus `"tr|<latin>"` for the
  aliases. It also points at the hijaiyah / du'a clips (`../doa-voice/…`), so every page reuses them.
  Normalising (same in `bm-voice.js` and `gen.py`): Unicode NFC, tatweel removed, whitespace collapsed, trailing
  punctuation trimmed, Latin lower-cased. Harakat are kept: different harakat are different sounds.
- Links carry `?v=<voice>` so phones fetch new audio after a voice change.

## Generate in Google Cloud Shell

```bash
bash tools/voice/cloudshell.sh ar-XA-Chirp3-HD-Algenib     # everything (518 clips), pushes a voice-clips-… branch
bash tools/voice/cloudshell.sh app                          # only the app Arabic + Cari names (keeps the 181)
bash tools/voice/cloudshell.sh compare                      # samples to choose an Arabic voice
```

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
python3 tools/voice/gen.py --only app,cari         # some sections: hijaiyah, doa, app, cari
python3 tools/voice/gen.py --voice ar-XA-Chirp3-HD-Kore --voice-en en-US-Chirp3-HD-Kore --voice-id id-ID-Chirp3-HD-Kore
python3 tools/voice/gen.py --manifest              # only rewrite www/voice/manifest.js from the files on disk
```

Existing files are kept (resume) unless `--force`. The speech-to-text check listens in `ar-SA`, `en-US` or `id-ID`.

Listen to the clips on `www/tools/dengar-suara.html` (tabs per section; it reads the manifests), especially any
marked CHECK, then bump `babymo-games-vNN` in `www/sw.js` before shipping.
