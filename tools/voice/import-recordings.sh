#!/usr/bin/env bash
# Put real-voice recordings from the recording page (www/tools/rekam-suara.html → "Download ZIP") into the app.
#   bash tools/voice/import-recordings.sh ~/Downloads/babymo-rekaman-20261111-1530.zip
#   TAG=human3 bash tools/voice/import-recordings.sh <zip>     # force one ?v= tag for every clip
#   DRY_RUN=1 bash tools/voice/import-recordings.sh <zip>      # only list what would change
# For each take www/<folder>/<id>.wav in the ZIP (folder = voice, hijaiyah-voice or doa-voice) it
#   1. converts it to the app's file www/<folder>/<id>.mp3 (24 kHz mono 64 kbps MP3, overwriting the AI clip), with
#        ffmpeg -i <id>.wav -ac 1 -ar 24000 -codec:a libmp3lame -b:a 64k www/<folder>/<id>.mp3
#   2. bumps that file's ?v= tag in www/voice/manifest.js, www/hijaiyah-voice/voice.js and www/doa-voice/voice.js
#      (algenib → human1, human1 → human2, …) so phones fetch the new audio instead of a cached copy.
# Nothing else changes: the manifest keys stay the same, so a partly recorded set mixes human and AI clips.
# Needs ffmpeg (with libmp3lame) and python3.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ZIP="${1:-}"
[ -n "$ZIP" ] && [ -f "$ZIP" ] || { echo "usage: bash tools/voice/import-recordings.sh <babymo-rekaman-….zip>" >&2; exit 2; }
command -v ffmpeg >/dev/null || { echo "ffmpeg is needed (brew install ffmpeg / apt-get install ffmpeg)" >&2; exit 2; }
ZIP="$(cd "$(dirname "$ZIP")" && pwd)/$(basename "$ZIP")"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
python3 -I -m zipfile -e "$ZIP" "$TMP"          # zipfile drops absolute paths and ".." parts

IDS=(); N=0
while IFS= read -r -d '' F; do
  REL="${F#"$TMP"/}"; DIR="$(dirname "$REL")"; NAME="$(basename "$REL")"; ID="${NAME%.*}"
  case "$DIR" in www/voice|www/hijaiyah-voice|www/doa-voice) ;; *) echo "skip $REL (not in www/voice, www/hijaiyah-voice or www/doa-voice)"; continue ;; esac
  [[ "$ID" =~ ^[A-Za-z0-9_-]+$ ]] || { echo "skip $REL (odd file name)"; continue; }
  OUT="$ROOT/$DIR/$ID.mp3"
  [ -f "$OUT" ] || grep -q "\"$ID\"" "$ROOT/tools/voice/clips.json" "$ROOT/tools/voice/clips-app.json" "$ROOT/tools/voice/clips-lines.json" \
    || { echo "skip $REL (no such clip id in tools/voice/clips*.json)"; continue; }
  if [ -n "${DRY_RUN:-}" ]; then echo "would make $DIR/$ID.mp3 from $NAME"; else
    ffmpeg -nostdin -v error -y -i "$F" -ac 1 -ar 24000 -codec:a libmp3lame -b:a 64k "$OUT"
    echo "made $DIR/$ID.mp3"
  fi
  IDS+=("$ID"); N=$((N+1))
done < <(find "$TMP/www" -type f \( -name '*.wav' -o -name '*.m4a' -o -name '*.webm' -o -name '*.ogg' -o -name '*.mp3' \) -print0 2>/dev/null | sort -z)

[ "$N" -gt 0 ] || { echo "no recordings found in $ZIP"; exit 1; }

# bump the ?v= tags of exactly these files in the three manifests
ROOT="$ROOT" TAG="${TAG:-}" DRY_RUN="${DRY_RUN:-}" python3 -I - "${IDS[@]}" <<'PY'
import os, re, sys
root, force, dry = os.environ["ROOT"], os.environ.get("TAG", "").strip(), os.environ.get("DRY_RUN")
ids = sys.argv[1:]
files = [os.path.join(root, "www", p) for p in ("voice/manifest.js", "hijaiyah-voice/voice.js", "doa-voice/voice.js")]
text = {f: open(f, encoding="utf-8").read() for f in files}
changed = 0
for i in ids:
    pat = re.compile(r'(?<![A-Za-z0-9_-])(' + re.escape(i) + r'\.mp3)\?v=([A-Za-z0-9_.-]*)')
    olds = [m.group(2) for f in files for m in pat.finditer(text[f])]
    if force:
        new = force
    else:
        n = max([int(m.group(1)) for t in olds for m in [re.fullmatch(r"human(\d+)", t)] if m] or [0])
        new = "human%d" % (n + 1)
    for f in files:
        text[f], k = pat.subn(lambda m: m.group(1) + "?v=" + new, text[f])
        changed += k
    if not olds:
        print("  note: %s.mp3 is not in any manifest yet (run python3 tools/voice/gen.py --manifest)" % i)
    else:
        print("  %s.mp3  ?v=%s -> ?v=%s" % (i, olds[0], new))
if not dry:
    for f in files:
        open(f, "w", encoding="utf-8").write(text[f])
print(("would update" if dry else "updated") + " %d manifest links for %d clips" % (changed, len(ids)))
PY

echo ""
echo "✅ $N recording(s) ${DRY_RUN:+(dry run) }in place. Next:"
echo "   1. listen: (cd www && python3 -m http.server 8800) then open http://localhost:8800/tools/dengar-suara.html"
echo "   2. git add www/voice www/hijaiyah-voice www/doa-voice && git commit -m 'Voice: real-voice recordings' && git push"
echo "   3. bump babymo-games-vNN in www/sw.js before shipping (as for any release)"
