#!/usr/bin/env python3
"""Generate the Arabic voice clips for Pulau Hijaiyah and Doa Harian with Google Cloud Text-to-Speech,
then (optionally) check each clip with Google Speech-to-Text.

Clip list: tools/voice/clips.json (181 items: 167 hijaiyah sounds + 14 du'as; built from the games' own text).
Output:
  www/hijaiyah-voice/<id>.mp3 + voice.js  -> window.HIJ_VOICE = {arabic text: file}
  www/doa-voice/<id>.mp3      + voice.js  -> window.DOA_VOICE = {arabic text: file}
The games already play these clips when the manifests are filled (device TTS is only a fallback).

Auth (any one):
  - Google Cloud Shell / a signed-in gcloud: nothing to set (uses `gcloud auth print-access-token`
    and the current project for quota), or
  - GOOGLE_TTS_API_KEY environment variable (sent as ?key=), or
  - a network secret on the cloud environment that injects X-Goog-Api-Key for texttospeech/speech.googleapis.com.

Usage:
  python3 tools/voice/gen.py --test               # one clip, prints the API response status
  python3 tools/voice/gen.py                      # all clips
  python3 tools/voice/gen.py --check              # all clips + speech-to-text check report
  python3 tools/voice/gen.py --only hijaiyah|doa  # one section
  python3 tools/voice/gen.py --voice ar-XA-Wavenet-B
"""
import argparse, base64, json, os, sys, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, "tools", "voice", "clips.json")
KEY = os.environ.get("GOOGLE_TTS_API_KEY", "").strip()

def _gcloud(*args):
    import subprocess
    try:
        return subprocess.run(["gcloud", *args], capture_output=True, text=True, timeout=60).stdout.strip()
    except Exception:
        return ""

# In Google Cloud Shell (or anywhere gcloud is signed in) no key is needed: use the signed-in account's token.
TOKEN = os.environ.get("GOOGLE_ACCESS_TOKEN", "").strip()
PROJECT = os.environ.get("GOOGLE_CLOUD_PROJECT", "").strip() or os.environ.get("DEVSHELL_PROJECT_ID", "").strip()
if not KEY and not TOKEN and os.environ.get("NO_GCLOUD") != "1":
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

# speaking rate per kind: syllables short and clear, du'as slow (tartil)
RATE = {"syl": 0.8, "name": 0.85, "harakat": 0.85, "word": 0.8, "phrase": 0.8, "doa": 0.72}

def synth(text, kind, voice):
    body = {"input": {"text": text},
            "voice": {"languageCode": "ar-XA", "name": voice},
            "audioConfig": {"audioEncoding": "MP3", "speakingRate": RATE.get(kind, 0.85), "sampleRateHertz": 24000,
                            "effectsProfileId": ["handset-class-device"]}}
    r = call("https://texttospeech.googleapis.com/v1/text:synthesize", body)
    return base64.b64decode(r["audioContent"])

def transcribe(mp3):
    body = {"config": {"encoding": "MP3", "sampleRateHertz": 24000, "languageCode": "ar-SA", "maxAlternatives": 3},
            "audio": {"content": base64.b64encode(mp3).decode()}}
    r = call("https://speech.googleapis.com/v1p1beta1/speech:recognize", body)
    alts = [a.get("transcript", "") for res in r.get("results", []) for a in res.get("alternatives", [])]
    return alts

def bare(s):  # strip harakat / tatweel for a loose comparison
    import re
    return re.sub(r"[ً-ٰٟـ\s]", "", s)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="ar-XA-Wavenet-B")
    ap.add_argument("--only", choices=["hijaiyah", "doa"])
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--test", action="store_true")
    ap.add_argument("--force", action="store_true", help="remake clips that already exist")
    a = ap.parse_args()
    items = json.load(open(DATA, encoding="utf-8"))
    if a.test:
        mp3 = synth("بَ", "syl", a.voice)
        print("OK — got", len(mp3), "bytes of audio for بَ"); return
    out = {"huruf": ("www/hijaiyah-voice", "HIJ_VOICE", "Arabic clips for Pulau Hijaiyah"),
           "doa": ("www/doa-voice", "DOA_VOICE", "Recorded du'a clips for Doa Harian")}
    report = []
    for sec, (folder, var, title) in out.items():
        if a.only and {"hijaiyah": "huruf", "doa": "doa"}[a.only] != sec:
            continue
        d = os.path.join(ROOT, folder); os.makedirs(d, exist_ok=True)
        man = {}
        sel = [x for x in items if x["sec"] == sec]
        for i, x in enumerate(sel, 1):
            fn = x["id"] + ".mp3"
            fp = os.path.join(d, fn)
            if os.path.exists(fp) and os.path.getsize(fp) > 1000 and not a.force:
                mp3 = open(fp, "rb").read()          # already made on an earlier run — resume
            else:
                mp3 = synth(x["t"], x["k"], a.voice)
                open(fp, "wb").write(mp3)
            man[x["t"]] = fn
            line = f"[{sec} {i}/{len(sel)}] {x['t']}  ({x.get('h','')})  {len(mp3)}B"
            if a.check:
                alts = transcribe(mp3)
                ok = any(bare(t) and (bare(t) in bare(x["t"]) or bare(x["t"]) in bare(t)) for t in alts)
                line += f"  heard={alts[:2]}  {'OK' if ok else 'CHECK'}"
                report.append({"text": x["t"], "hint": x.get("h"), "heard": alts, "ok": ok, "file": f"{folder}/{fn}"})
            print(line, flush=True)
        with open(os.path.join(d, "voice.js"), "w", encoding="utf-8") as f:
            f.write(f"/* {title}: Arabic text -> file (generated by tools/voice/gen.py, voice {a.voice}) */\n")
            f.write(f"window.{var}=" + json.dumps(man, ensure_ascii=False) + ";\n")
        print(f"wrote {folder}/voice.js ({len(man)} clips)")
    if report:
        p = os.path.join(ROOT, "tools", "voice", "check-report.json")
        json.dump(report, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        bad = [r for r in report if not r["ok"]]
        print(f"\nspeech check: {len(report)-len(bad)} OK, {len(bad)} to listen to (see tools/voice/check-report.json)")
        print("Note: single syllables (بَ بِ بُ) are often transcribed loosely; listen to the CHECK ones before shipping.")

if __name__ == "__main__":
    main()
