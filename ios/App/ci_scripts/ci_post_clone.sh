#!/bin/sh
# Xcode Cloud runs this right after cloning the repo.
# ios/App/App/public (the game files) and capacitor.config.json are not in git;
# `npx cap sync ios` makes them from www/, as it does on the Mac before archiving.
set -e
cd "$CI_PRIMARY_REPOSITORY_PATH"
if ! command -v node >/dev/null 2>&1; then
  export HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_INSTALL_CLEANUP=1
  brew install node
fi
node -v
npm ci --no-audit --no-fund
npx cap sync ios
ls ios/App/App/public | head
test -f ios/App/App/public/index.html
test -f ios/App/App/capacitor.config.json
