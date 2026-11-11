#!/usr/bin/env python3
"""Generate the app's recorded voice clips with Google Cloud Text-to-Speech, then (optionally) check each clip
with Google Speech-to-Text.

Clip lists:
  tools/voice/clips.json      181 Arabic items: 167 hijaiyah sounds (sec "huruf") + 14 du'as (sec "doa")
  tools/voice/clips-app.json  every other Arabic string the games speak (sec "app") and every Cari Baby Mo
                              object name in Indonesian and English (sec "cari"); made by build-app-clips.js
  tools/voice/clips-lines.json every Indonesian and English line the games speak (instructions, praise, tips,
                              narration, greetings, story read-alouds; sec "lines"); made by build-lines-clips.js
  tools/voice/aliases.json    Latin transliterations the games speak ("Bismillah") -> the Arabic clip to play
Output:
  www/hijaiyah-voice/<id>.mp3 + voice.js  -> window.HIJ_VOICE = {arabic text: file}
  www/doa-voice/<id>.mp3      + voice.js  -> window.DOA_VOICE = {arabic text: file}
  www/voice/<id>.mp3          + manifest.js -> window.BM_VOICE = {"lang|text": file}  (all sections, incl. the
                              two above as ../hijaiyah-voice/…, ../doa-voice/…, and "tr|…" transliterations)
www/bm-voice.js plays these clips in place of the phone's text-to-speech (device TTS is only a fallback).

Voices: Arabic --voice (default ar-XA-Chirp3-HD-Algenib). English and Indonesian use the same voice family
(en-US-Chirp3-HD-Algenib, id-ID-Chirp3-HD-Algenib) unless --voice-en / --voice-id say otherwise.
Each link carries ?v=<voice> so phones fetch new audio after a voice change.

Auth (any one):
  - Google Cloud Shell / a signed-in gcloud: nothing to set (uses `gcloud auth print-access-token`
    and the current project for quota), or
  - GOOGLE_TTS_API_KEY environment variable (sent as ?key=), or
  - a network secret on the cloud environment that injects X-Goog-Api-Key for texttospeech/speech.googleapis.com.

Usage:
  python3 tools/voice/gen.py --test                 # one clip per language, prints what came back
  python3 tools/voice/gen.py                        # all clips (resumes: existing files are kept)
  python3 tools/voice/gen.py --check                # all clips + speech-to-text check report
  python3 tools/voice/gen.py --only hijaiyah,doa    # some sections: hijaiyah, doa, app, cari, lines
  python3 tools/voice/gen.py --check --only lines   # only the spoken lines; existing clips are kept, and only
                                                    # the clips made in this run are checked (--recheck: all)
  python3 tools/voice/gen.py --force                # remake clips that already exist
  python3 tools/voice/gen.py --voice ar-XA-Chirp3-HD-Kore [--voice-en en-US-…] [--voice-id id-ID-…]
  python3 tools/voice/gen.py --manifest             # only rewrite www/voice/manifest.js (+ the listening page's data)
  python3 tools/voice/gen.py --compare              # one short sample per Arabic voice (tools/voice/compare/)
  python3 tools/voice/gen.py --dry-run --only doa,lines   # list the clips a run would make (missing files), no API calls
"""
import argparse, base64, json, os, re, sys, time, unicodedata, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.join(ROOT, "tools", "voice")
DATA = os.path.join(HERE, "clips.json")
DATA_APP = os.path.join(HERE, "clips-app.json")
DATA_LINES = os.path.join(HERE, "clips-lines.json")
ALIASES = os.path.join(HERE, "aliases.json")
KEY = os.environ.get("GOOGLE_TTS_API_KEY", "").strip()
DEFAULT_VOICE = "ar-XA-Chirp3-HD-Algenib"
LANG_CODE = {"ar": "ar-XA", "en": "en-US", "id": "id-ID"}     # text-to-speech
STT_CODE = {"ar": "ar-SA", "en": "en-US", "id": "id-ID"}      # speech-to-text check

def _gcloud(*args):
    import subprocess
    try:
        return subprocess.run(["gcloud", *args], capture_output=True, text=True, timeout=60).stdout.strip()
    except Exception:
        return ""

# In Google Cloud Shell (or anywhere gcloud is signed in) no key is needed: use the signed-in account's token.
TOKEN = os.environ.get("GOOGLE_ACCESS_TOKEN", "").strip()
PROJECT = os.environ.get("GOOGLE_CLOUD_PROJECT", "").strip() or os.environ.get("DEVSHELL_PROJECT_ID", "").strip()
if not KEY and not TOKEN and os.environ.get("NO_GCLOUD") != "1" and "--dry-run" not in sys.argv:
    TOKEN = _gcloud("auth", "print-access-token")
    if TOKEN and not PROJECT:
        PROJECT = _gcloud("config", "get-value", "project")

def call(url, body):
    headers = {"Content-Type": "application/json"}
    if KEY:
        url += ("&" if "?" in url else "?") + "key=" + KEY
    elif TOKEN:
        headers["Authorization"] = "Bearer " + TOKEN
        if PROJECT:
            headers["x-goog-user-project"] = PROJECT
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers)
    for attempt in range(4):
        try:
            return json.load(urllib.request.urlopen(req, timeout=40))
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:400]
            if e.code in (429, 500, 503) and attempt < 3:
                time.sleep(2 ** attempt); continue
            # an API that was *just* enabled answers 403 for a few minutes while it switches on — wait and retry
            if e.code == 403 and ("has not been used" in msg or "disabled" in msg or "SERVICE_DISABLED" in msg) and attempt < 3:
                for w in range(12):
                    print(f"   …Google is still switching the API on, waiting ({(w+1)*15}s)", flush=True)
                    time.sleep(15)
                    try:
                        return json.load(urllib.request.urlopen(req, timeout=40))
                    except urllib.error.HTTPError as e2:
                        if e2.code != 403: raise
                continue
            raise SystemExit(f"HTTP {e.code} from {url.split('?')[0]}:\n{msg}")
        except urllib.error.URLError as e:
            if attempt < 3:
                time.sleep(2 ** attempt); continue
            raise SystemExit(f"Network error: {e}")

# speaking rate per kind: natural speed (slowing voices down makes them warble); du'as only slightly slower.
# Chirp voices take no speakingRate at all.
RATE = {"syl": 1.0, "name": 1.0, "harakat": 1.0, "word": 1.0, "phrase": 0.95, "doa": 0.92, "line": 1.0}

def synth(text, kind, voice, lang="ar"):
    ac = {"audioEncoding": "MP3", "sampleRateHertz": 24000}
    r_ = RATE.get(kind, 1.0)
    if r_ != 1.0 and "Chirp" not in voice: ac["speakingRate"] = r_
    body = {"input": {"text": speakable(text)}, "voice": {"languageCode": LANG_CODE[lang], "name": voice}, "audioConfig": ac}
    r = call("https://texttospeech.googleapis.com/v1/text:synthesize", body)
    return base64.b64decode(r["audioContent"])

def transcribe(mp3, lang="ar"):
    body = {"config": {"encoding": "MP3", "sampleRateHertz": 24000, "languageCode": STT_CODE[lang], "maxAlternatives": 3},
            "audio": {"content": base64.b64encode(mp3).decode()}}
    r = call("https://speech.googleapis.com/v1p1beta1/speech:recognize", body)
    alts = [a.get("transcript", "") for res in r.get("results", []) for a in res.get("alternatives", [])]
    return alts

def bare(s):  # strip harakat / tatweel for a loose comparison
    return re.sub(r"[ً-ٰٟـ\s]", "", s)

def loose(s):  # Latin: letters and digits only, lower case
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s).lower())

def heard_ok(text, alts, lang):
    f = bare if lang == "ar" else loose
    t = f(text)
    return any(f(a) and (f(a) in t or t in f(a)) for a in alts)

# --- keys: the same normalising as www/bm-voice.js and tools/voice/voicekey.js (tools/voice/test-keys.js) -----
EMO = re.compile("[\U0001F000-\U0001FAFF\U000E0020-\U000E007F\u2190-\u21FF\u2300-\u23FF\u25A0-\u25FF"
                 "\u2600-\u27BF\u2B00-\u2BFF\uFE00-\uFE0F\u200D\u20E3\u00A9\u00AE\u2122\u2139\u3030\u303D\u3297\u3299]")
EDGE = "\\s.,!?;:…،؛؟۔。'\"()\\[\\]\\-—•·*~_"
LEAD = re.compile("^[" + EDGE + "]+")
TRAIL = re.compile("[" + EDGE + "]+$")

def speakable(t):
    """the text as it is sent to text-to-speech: no emoji, tidy spaces and punctuation (case kept)"""
    s = EMO.sub("", unicodedata.normalize("NFC", str(t)))
    s = re.sub("[‘’ʼ`´]", "'", s); s = re.sub("[“”„«»]", '"', s); s = re.sub("[‒–―]", "—", s)
    s = re.sub(r"\s+", " ", s); s = re.sub(r" ([,.!?;:…])", r"\1", s); s = re.sub(r"\s*—\s*", " — ", s)
    s = re.sub("([.!?…؟])[.!?…؟]+", r"\1", s)
    return s.strip()

def norm(t, lang):
    s = speakable(t).replace("ـ", "")
    s = TRAIL.sub("", LEAD.sub("", s))
    return s if lang == "ar" else s.lower()

def tr_key(t):
    s = unicodedata.normalize("NFD", str(t))
    return "tr|" + re.sub(r"[^a-z0-9]", "", re.sub(r"[̀-ͯ]", "", s).lower())

def tag(voice):
    return voice.split("-")[-1].lower()   # new voice -> new URL (no stale cached audio)

def family(voice, lang):
    """ar-XA-Chirp3-HD-Algenib -> en-US-Chirp3-HD-Algenib / id-ID-Chirp3-HD-Algenib"""
    parts = voice.split("-")
    return "-".join([LANG_CODE[lang].split("-")[0], LANG_CODE[lang].split("-")[1]] + parts[2:]) if len(parts) > 2 else voice

# section -> (folder, manifest variable or None, title, clip-list file)
SECTIONS = {
    "huruf": ("www/hijaiyah-voice", "HIJ_VOICE", "Arabic clips for Pulau Hijaiyah", DATA),
    "doa":   ("www/doa-voice", "DOA_VOICE", "Recorded du'a clips for Doa Harian", DATA),
    "app":   ("www/voice", None, "", DATA_APP),
    "cari":  ("www/voice", None, "", DATA_APP),
    "lines": ("www/voice", None, "", DATA_LINES),
}
ONLY = {"hijaiyah": "huruf", "huruf": "huruf", "doa": "doa", "app": "app", "cari": "cari", "lines": "lines"}
BM_SECS = ("app", "cari", "lines")    # the sections whose clips live in www/voice/ (manifest.js)

def load_items():
    items = json.load(open(DATA, encoding="utf-8"))
    for extra in (DATA_APP, DATA_LINES):
        if os.path.exists(extra):
            items += json.load(open(extra, encoding="utf-8"))
    for x in items:
        x.setdefault("lang", "ar")
    return items

def read_js_manifest(path):
    try:
        s = open(path, encoding="utf-8").read()
        m = re.search(r"=\s*(\{.*\}|null)\s*;?\s*$", s, re.S)
        return json.loads(m.group(1)) or {} if m else {}
    except Exception:
        return {}

def human_tags():
    """clips recorded by a person (tools/voice/import-recordings.sh tags them ?v=humanN): "www/<folder>/<file>" -> tag.
    gen.py keeps these files and their tags, even with --force (only --replace-human remakes them with TTS)."""
    out = {}
    for folder, name in (("www/voice", "manifest.js"), ("www/hijaiyah-voice", "voice.js"), ("www/doa-voice", "voice.js")):
        for v in read_js_manifest(os.path.join(ROOT, folder, name)).values():
            f, _, t = str(v).partition("?v=")
            if t.startswith("human"):
                out[os.path.normpath(os.path.join(folder, f))] = t
    return out

def write_manifest(items, voices, human=None):
    """www/voice/manifest.js: every clip on disk, keyed "lang|text", plus the transliteration aliases."""
    human = human_tags() if human is None else human
    man = {}
    # the existing sections, read from their own manifests (keeps their ?v= tags)
    for sec, rel in (("huruf", "../hijaiyah-voice/"), ("doa", "../doa-voice/")):
        folder = SECTIONS[sec][0]
        for t, f in read_js_manifest(os.path.join(ROOT, folder, "voice.js")).items():
            if f and os.path.exists(os.path.join(ROOT, folder, f.split("?")[0])):
                man["ar|" + norm(t, "ar")] = rel + f
    for x in items:
        if x["sec"] not in BM_SECS:
            continue
        fn = x["id"] + ".mp3"
        fp = os.path.join(ROOT, "www", "voice", fn)
        if os.path.exists(fp) and os.path.getsize(fp) > 500:
            man[x["lang"] + "|" + norm(x["t"], x["lang"])] = fn + "?v=" + (human.get(os.path.normpath("www/voice/" + fn)) or tag(voices[x["lang"]]))
    if os.path.exists(ALIASES):
        for lat, ar in json.load(open(ALIASES, encoding="utf-8")).items():
            f = man.get("ar|" + norm(ar, "ar"))
            if f:
                man[tr_key(lat)] = f
    d = os.path.join(ROOT, "www", "voice"); os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "manifest.js"), "w", encoding="utf-8") as f:
        f.write("/* Recorded clips for the whole app: \"lang|text\" -> file (generated by tools/voice/gen.py; "
                f"voices {voices['ar']}, {voices['en']}, {voices['id']}) */\n")
        f.write("window.BM_VOICE=" + json.dumps(man, ensure_ascii=False, sort_keys=True) + ";\n")
    print(f"wrote www/voice/manifest.js ({len(man)} keys)")

def write_listen_data(items):
    """www/tools/dengar-data.js: the clip lists for the listening page (www/tools/dengar-suara.html)."""
    rows = [{"t": x["t"], "h": x.get("h", ""), "g": x.get("g", ""), "s": x["sec"], "l": x["lang"],
             "key": x["lang"] + "|" + norm(x["t"], x["lang"])} for x in items]
    with open(os.path.join(ROOT, "www", "tools", "dengar-data.js"), "w", encoding="utf-8") as f:
        f.write("/* Clip lists for dengar-suara.html (generated by tools/voice/gen.py from clips.json + clips-app.json + clips-lines.json) */\n")
        f.write("window.DENGAR=[\n" + ",\n".join(json.dumps(r, ensure_ascii=False) for r in rows) + "\n];\n")
    print(f"wrote www/tools/dengar-data.js ({len(rows)} rows)")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default=DEFAULT_VOICE, help="Arabic voice (default %(default)s)")
    ap.add_argument("--voice-en", help="English voice (default: the Arabic voice's family in en-US)")
    ap.add_argument("--voice-id", help="Indonesian voice (default: the Arabic voice's family in id-ID)")
    ap.add_argument("--only", help="comma list of sections: hijaiyah, doa, app, cari, lines")
    ap.add_argument("--check", action="store_true", help="speech-to-text check of the clips made in this run")
    ap.add_argument("--recheck", action="store_true", help="with --check: also check clips that were already on disk")
    ap.add_argument("--test", action="store_true")
    ap.add_argument("--manifest", action="store_true", help="only rewrite www/voice/manifest.js from the files on disk")
    ap.add_argument("--compare", action="store_true", help="make one short sample per Arabic voice in tools/voice/compare/")
    ap.add_argument("--force", action="store_true", help="remake clips that already exist (not the human recordings)")
    ap.add_argument("--replace-human", action="store_true", help="with --force: also replace the human recordings (?v=human…) with TTS")
    ap.add_argument("--dry-run", action="store_true", help="only list the clips that would be made (no API key needed)")
    a = ap.parse_args()
    voices = {"ar": a.voice, "en": a.voice_en or family(a.voice, "en"), "id": a.voice_id or family(a.voice, "id")}
    items = load_items()
    HUMAN = {} if a.replace_human else human_tags()
    if a.compare:
        req = urllib.request.Request("https://texttospeech.googleapis.com/v1/voices?languageCode=ar-XA" + ("&key=" + KEY if KEY else ""),
                                     headers=({"Authorization": "Bearer " + TOKEN, "x-goog-user-project": PROJECT} if TOKEN and not KEY else {}))
        allv = json.load(urllib.request.urlopen(req, timeout=40)).get("voices", [])
        names = [v["name"] for v in allv]
        pick = [n for n in names if "Wavenet" in n] + [n for n in names if "Neural2" in n]
        chirp = [v for v in allv if "Chirp3-HD" in v["name"] or "Chirp-HD" in v["name"]]
        fem = [v["name"] for v in chirp if v.get("ssmlGender") == "FEMALE"][:3]
        mal = [v["name"] for v in chirp if v.get("ssmlGender") == "MALE"][:3]
        pick += fem + mal
        d = os.path.join(HERE, "compare"); os.makedirs(d, exist_ok=True)
        lines = [("بَاء", "name"), ("بَ", "syl"), ("بِ", "syl"), ("بُ", "syl"), ("ضَاد", "name"), ("رَبِّ زِدْنِي عِلْمًا", "word")]
        print("voices:", ", ".join(pick))
        for v in pick:
            try:
                audio = b"".join(synth(t, k, v) for t, k in lines)
            except SystemExit as e:
                print("skip", v, str(e)[:120]); continue
            open(os.path.join(d, v + ".mp3"), "wb").write(audio)
            print("sample", v)
        return
    secs = None
    if a.only:
        secs = set()
        for s in a.only.split(","):
            s = s.strip()
            if s not in ONLY: raise SystemExit(f"--only: unknown section {s!r} (hijaiyah, doa, app, cari, lines)")
            secs.add(ONLY[s])
    if a.dry_run:
        n = 0
        for sec, (folder, var, title, _) in SECTIONS.items():
            if secs and sec not in secs:
                continue
            sel = [x for x in items if x["sec"] == sec]
            todo = [x for x in sel if (a.force and os.path.normpath(os.path.join(folder, x["id"] + ".mp3")) not in HUMAN) or not (os.path.exists(os.path.join(ROOT, folder, x["id"] + ".mp3")) and os.path.getsize(os.path.join(ROOT, folder, x["id"] + ".mp3")) > 500)]
            print(f"[{sec}] {len(sel)} clips, {len(sel) - len(todo)} already made, {len(todo)} to make")
            for x in todo:
                print(f"   + {folder}/{x['id']}.mp3  {x['lang']}  {voices[x['lang']]}  {x['t'][:70]}  ({x.get('h','')[:50]})")
            n += len(todo)
        print(f"dry run: {n} clips would be made (nothing was sent)")
        return
    if a.test:
        langs = ([] if secs == {"lines"} else ["ar"]) + [l for l in ("en", "id") if not secs or secs & set(BM_SECS)]
        sample = {"ar": "بَ", "en": "Teddy!", "id": "Beruang!"}
        if secs == {"lines"}: sample.update({"en": "Good morning!", "id": "Selamat pagi!"})
        for l in langs:
            mp3 = synth(sample[l], "name", voices[l], l)
            print(f"OK — {voices[l]}: got {len(mp3)} bytes of audio for {sample[l]}")
        return
    if a.manifest:
        write_manifest(items, voices); write_listen_data(items); return
    report, made = [], 0
    for sec, (folder, var, title, _) in SECTIONS.items():
        if secs and sec not in secs:
            continue
        d = os.path.join(ROOT, folder); os.makedirs(d, exist_ok=True)
        man = {}
        sel = [x for x in items if x["sec"] == sec]
        for i, x in enumerate(sel, 1):
            lang = x["lang"]; voice = voices[lang]
            fn = x["id"] + ".mp3"
            fp = os.path.join(d, fn)
            human = HUMAN.get(os.path.normpath(os.path.join(folder, fn)))
            old = os.path.exists(fp) and os.path.getsize(fp) > 500 and (not a.force or bool(human))
            if old:
                mp3 = open(fp, "rb").read()          # already made on an earlier run — resume
            else:
                mp3 = synth(x["t"], x["k"], voice, lang)
                open(fp, "wb").write(mp3); made += 1
            man[x["t"]] = fn + "?v=" + (human or tag(voice))
            line = f"[{sec} {i}/{len(sel)}] {lang} {x['t']}  ({x.get('h','')})  {len(mp3)}B"
            if a.check and (not old or a.recheck):
                alts = transcribe(mp3, lang)
                ok = heard_ok(x["t"], alts, lang)
                line += f"  heard={alts[:2]}  {'OK' if ok else 'CHECK'}"
                report.append({"text": x["t"], "lang": lang, "sec": sec, "hint": x.get("h"), "heard": alts, "ok": ok, "file": f"{folder}/{fn}"})
            print(line, flush=True)
        if var:
            with open(os.path.join(d, "voice.js"), "w", encoding="utf-8") as f:
                f.write(f"/* {title}: Arabic text -> file (generated by tools/voice/gen.py, voice {voices['ar']}) */\n")
                f.write(f"window.{var}=" + json.dumps(man, ensure_ascii=False) + ";\n")
            print(f"wrote {folder}/voice.js ({len(man)} clips)")
    write_manifest(items, voices, HUMAN)
    write_listen_data(items)
    print(f"made {made} new clips" + (f" (kept {len(HUMAN)} human recordings)" if HUMAN else ""))
    if report:
        p = os.path.join(HERE, "check-report.json")
        # keep the earlier results of clips that were not checked this time
        try:
            prev = [r for r in json.load(open(p, encoding="utf-8")) if r.get("file") not in {x["file"] for x in report}]
        except Exception:
            prev = []
        json.dump(prev + report, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        bad = [r for r in report if not r["ok"]]
        for r in bad:
            print(f"   CHECK {r['lang']} {r['text'][:70]}  heard={r['heard'][:1]}")
        print(f"\nspeech check: {len(report)-len(bad)} OK, {len(bad)} to listen to (see tools/voice/check-report.json)")
        print("Note: single syllables (بَ بِ بُ) and one-word names are often transcribed loosely; listen to the CHECK ones before shipping.")

if __name__ == "__main__":
    main()
