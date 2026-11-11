#!/usr/bin/env bash
# Make the app's recorded voice clips in Google Cloud Shell and push them to a new branch.
#   bash tools/voice/cloudshell.sh                 -> ALL clips (hijaiyah + du'a + app Arabic + Cari names), default voice
#   bash tools/voice/cloudshell.sh <voice-name>    -> remake ALL clips with that voice (e.g. ar-XA-Chirp3-HD-Algenib);
#                                                     English / Indonesian use the same family (en-US-…, id-ID-…)
#   bash tools/voice/cloudshell.sh all [voice]     -> same as above
#   bash tools/voice/cloudshell.sh app [voice]     -> only the app Arabic + Cari name clips (keeps the 181 existing ones)
#   bash tools/voice/cloudshell.sh lines [voice]   -> only the Indonesian + English spoken lines (clips-lines.json) that
#                                                     are not made yet; everything already made is kept
#   bash tools/voice/cloudshell.sh ramadan [voice] -> only the Doa Ramadan du'a clips (doa-voice/d-r_*.mp3) and the spoken
#                                                     lines that are not made yet; everything already made is kept
#   bash tools/voice/cloudshell.sh compare         -> one short sample per Arabic voice (to choose a voice)
# Optional: VOICE_EN=en-US-… VOICE_ID=id-ID-… to pick other English / Indonesian voices; BASE=<branch> to start
# from a branch other than main.
set -euo pipefail
MODE="${1:-}"; VOICE="${2:-}"
case "$MODE" in all|app|lines|ramadan|compare|"") ;; *) VOICE="$MODE"; MODE="all" ;; esac
[ -z "$MODE" ] && MODE="all"
echo "▶ Project: $(gcloud config get-value project 2>/dev/null)"
gcloud services enable texttospeech.googleapis.com speech.googleapis.com >/dev/null
git fetch -q origin && git checkout -q "${BASE:-main}" && git pull -q
LOGIN="$(gh api user -q .login 2>/dev/null || echo babymo)"; UID_="$(gh api user -q .id 2>/dev/null || echo 0)"
G=(-c user.name="$LOGIN" -c user.email="${UID_}+${LOGIN}@users.noreply.github.com")
if [ "$MODE" = "compare" ]; then
  python3 tools/voice/gen.py --compare
  BR="voice-compare-$(date +%Y%m%d-%H%M)"; git checkout -q -b "$BR"
  git "${G[@]}" add tools/voice/compare && git "${G[@]}" commit -q -m "Voice: samples to choose an Arabic voice"
else
  ARGS=()
  [ -n "$VOICE" ] && ARGS+=(--voice "$VOICE")
  [ -n "${VOICE_EN:-}" ] && ARGS+=(--voice-en "$VOICE_EN")
  [ -n "${VOICE_ID:-}" ] && ARGS+=(--voice-id "$VOICE_ID")
  N_ALL="$(python3 -c 'import json;print(sum(len(json.load(open("tools/voice/"+f))) for f in ("clips.json","clips-app.json","clips-lines.json")))')"
  N_APP="$(python3 -c 'import json;print(len(json.load(open("tools/voice/clips-app.json"))))')"
  N_LINES="$(python3 -c 'import json,os;print(sum(1 for x in json.load(open("tools/voice/clips-lines.json")) if not os.path.exists("www/voice/"+x["id"]+".mp3")))')"
  if [ "$MODE" = "ramadan" ]; then
    python3 tools/voice/gen.py --dry-run --only doa,lines "${ARGS[@]}"
    python3 tools/voice/gen.py --test --only doa,lines "${ARGS[@]}"
    echo "▶ Making the missing Doa Ramadan du'a clips + spoken lines (a few minutes)…"
    python3 tools/voice/gen.py --check --only doa,lines "${ARGS[@]}"
  elif [ "$MODE" = "lines" ]; then
    python3 tools/voice/gen.py --test --only lines "${ARGS[@]}"
    echo "▶ Making the $N_LINES missing Indonesian + English line clips (about $(( N_LINES / 90 + 1 )) minutes)…"
    python3 tools/voice/gen.py --check --only lines "${ARGS[@]}"
  elif [ "$MODE" = "app" ]; then
    python3 tools/voice/gen.py --test --only app,cari "${ARGS[@]}"
    echo "▶ Making the $N_APP app + Cari clips (about 5–8 minutes)…"
    python3 tools/voice/gen.py --check --force --only app,cari "${ARGS[@]}"
  else
    python3 tools/voice/gen.py --test "${ARGS[@]}"
    echo "▶ Making all $N_ALL clips (about 15–20 minutes)…"
    python3 tools/voice/gen.py --check --force "${ARGS[@]}"
  fi
  BR="voice-clips-$(date +%Y%m%d-%H%M)"; git checkout -q -b "$BR"
  git "${G[@]}" add www/hijaiyah-voice www/doa-voice www/voice www/tools/dengar-data.js tools/voice/check-report.json
  git "${G[@]}" commit -q -m "Voice: recorded clips for the app — hijaiyah, du'a, app Arabic, Cari names, spoken lines (Google TTS ${VOICE:-default voice}, $MODE)"
fi
git push -q -u origin "$BR"
echo ""
echo "✅ Done — pushed branch: $BR"
echo "   Tell Claude: \"pushed $BR\""
