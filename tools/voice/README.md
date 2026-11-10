# Arabic voice clips (Pulau Hijaiyah + Doa Harian)

The games ship with empty manifests (`www/hijaiyah-voice/voice.js`, `www/doa-voice/voice.js` set to `null`), so they
fall back to the phone's text-to-speech. Filling them with real clips gives correct Arabic pronunciation on every device.

`clips.json` lists every Arabic sound the two games speak (181 items):
- 167 hijaiyah sounds: 28 letter names, 97 syllables (fathah / kasrah / dhammah, tanwin), 3 harakat names, 38 words, Bismillah
- 14 du'as, exactly as written in `www/babymo-doa-harian.html`

Each item's `id` is the clip filename, matching the recorder page (`www/tools/rekam-suara.html`), so human recordings
can replace any generated clip later with the same name.

## Generate with Google Cloud Text-to-Speech

Needs a Google Cloud API key with Text-to-Speech (and Speech-to-Text for `--check`) enabled, either as the
environment variable `GOOGLE_TTS_API_KEY` or as a network secret (`X-Goog-Api-Key`) for
`texttospeech.googleapis.com` and `speech.googleapis.com`.

```bash
python3 tools/voice/gen.py --test     # one clip — confirms the key works
python3 tools/voice/gen.py --check    # all 181 clips + a speech-to-text check (tools/voice/check-report.json)
```

Then bump `babymo-games-vNN` in `www/sw.js`, commit `www/hijaiyah-voice/` and `www/doa-voice/`, and listen to a few
clips (especially any marked CHECK) before shipping.
