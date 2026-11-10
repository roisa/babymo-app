#!/usr/bin/env bash
# Make the Arabic voice clips in Google Cloud Shell and push them to a new branch.
# Run from the babymo-app folder:  bash tools/voice/cloudshell.sh
set -euo pipefail
echo "▶ Project: $(gcloud config get-value project 2>/dev/null)"
echo "▶ Turning on Text-to-Speech and Speech-to-Text…"
gcloud services enable texttospeech.googleapis.com speech.googleapis.com
echo "▶ Test clip…"
python3 tools/voice/gen.py --test
echo "▶ Making all 181 clips (about 3–5 minutes)…"
python3 tools/voice/gen.py --check
BR="voice-clips-$(date +%Y%m%d-%H%M)"
git checkout -b "$BR"
LOGIN="$(gh api user -q .login 2>/dev/null || echo babymo)"; UID_="$(gh api user -q .id 2>/dev/null || echo 0)"
git -c user.name="$LOGIN" -c user.email="${UID_}+${LOGIN}@users.noreply.github.com" add www/hijaiyah-voice www/doa-voice tools/voice/check-report.json
git -c user.name="$LOGIN" -c user.email="${UID_}+${LOGIN}@users.noreply.github.com" commit -q -m "Voice: Arabic clips for Pulau Hijaiyah + Doa Harian (Google TTS)"
git push -q -u origin "$BR"
echo ""
echo "✅ Done — pushed branch: $BR"
echo "   Tell Claude: \"clips pushed to $BR\""
