#!/usr/bin/env bash
# Make the Arabic voice clips in Google Cloud Shell and push them to a new branch.
#   bash tools/voice/cloudshell.sh                 -> all clips with the default voice
#   bash tools/voice/cloudshell.sh compare         -> one short sample per Arabic voice (to choose a voice)
#   bash tools/voice/cloudshell.sh <voice-name>    -> remake ALL clips with that voice (e.g. ar-XA-Chirp3-HD-Kore)
set -euo pipefail
MODE="${1:-}"
echo "▶ Project: $(gcloud config get-value project 2>/dev/null)"
gcloud services enable texttospeech.googleapis.com speech.googleapis.com >/dev/null
git checkout -q main && git pull -q
LOGIN="$(gh api user -q .login 2>/dev/null || echo babymo)"; UID_="$(gh api user -q .id 2>/dev/null || echo 0)"
G=(-c user.name="$LOGIN" -c user.email="${UID_}+${LOGIN}@users.noreply.github.com")
if [ "$MODE" = "compare" ]; then
  python3 tools/voice/gen.py --compare
  BR="voice-compare-$(date +%Y%m%d-%H%M)"; git checkout -q -b "$BR"
  git "${G[@]}" add tools/voice/compare && git "${G[@]}" commit -q -m "Voice: samples to choose an Arabic voice"
else
  VOICE_ARGS=(); [ -n "$MODE" ] && VOICE_ARGS=(--voice "$MODE")
  python3 tools/voice/gen.py --test "${VOICE_ARGS[@]}"
  echo "▶ Making all 181 clips (about 3–5 minutes)…"
  python3 tools/voice/gen.py --check --force "${VOICE_ARGS[@]}"
  BR="voice-clips-$(date +%Y%m%d-%H%M)"; git checkout -q -b "$BR"
  git "${G[@]}" add www/hijaiyah-voice www/doa-voice tools/voice/check-report.json
  git "${G[@]}" commit -q -m "Voice: Arabic clips for Pulau Hijaiyah + Doa Harian (Google TTS ${MODE:-default voice})"
fi
git push -q -u origin "$BR"
echo ""
echo "✅ Done — pushed branch: $BR"
echo "   Tell Claude: \"pushed $BR\""
