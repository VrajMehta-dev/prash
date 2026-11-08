#!/bin/bash
# Build the UAT APK (run on the `uat` branch) and publish it to the UAT download URL.
set -euo pipefail
cd "$(dirname "$0")/.."
[ "$(git branch --show-current)" = "uat" ] || { echo "run on the uat branch"; exit 1; }
grep -q 'IS_UAT = true' app/config/env.js || { echo "env.js is not UAT"; exit 1; }
KEY="${UAT_SSH_KEY:-$HOME/Documents/Projects/PRASH/Credentials/AWS/prash-aws.pem}"
HOST=ubuntu@13.235.67.156
DEST=/home/ubuntu/updater-uat/prash
NATIVE_PATHS=(android ios package.json pnpm-lock.yaml)
VER=$(grep -oE 'versionName "[^"]+"' android/app/build.gradle | cut -d'"' -f2)

# Mandatory update: if native code changed since the previous APK, older builds must update before
# using the app (an OTA bundle for them could crash). Override with --mandatory / --optional.
MODE="${1:-auto}"
PREV=$(git tag --list 'uat-apk-*' --sort=-v:refname | head -1)
if [ "$MODE" = "auto" ]; then
  MODE=optional
  if [ -n "$PREV" ] && [ -n "$( { git diff --name-only "$PREV" -- "${NATIVE_PATHS[@]}"; git ls-files --others --exclude-standard -- android ios; } | grep -v '\.DS_Store' || true)" ]; then
    MODE=mandatory; echo "Native changes since $PREV -> this release will be a MANDATORY update."
  fi
elif [ "$MODE" = "--mandatory" ]; then MODE=mandatory; else MODE=optional; fi

# The tag records which commit the APK came from, so make sure native files are committed.
DIRTY=$(git status --porcelain -- "${NATIVE_PATHS[@]}" | grep -v '\.DS_Store' || true)
[ -z "$DIRTY" ] || { echo "Commit native changes before building:"; echo "$DIRTY"; exit 1; }

(cd android && ./gradlew assembleRelease)
APK=android/app/build/outputs/apk/release/app-release.apk
ssh -i "$KEY" $HOST "[ -f $DEST/PRASH-UAT.apk ] && cp $DEST/PRASH-UAT.apk $DEST/PRASH-UAT.apk.bak_\$(date +%Y%m%d_%H%M%S) || true"
scp -i "$KEY" "$APK" $HOST:$DEST/PRASH-UAT.apk
curl -s -o /tmp/uat-check.apk https://test-prash.aystera.com/mobile/PRASH-UAT.apk
[ "$(shasum -a 256 < $APK)" = "$(shasum -a 256 < /tmp/uat-check.apk)" ] && echo "LIVE: https://test-prash.aystera.com/mobile/PRASH-UAT.apk (hash verified)"
git tag -f "uat-apk-$VER" HEAD >/dev/null && echo "tagged uat-apk-$VER"

if [ "$MODE" = "mandatory" ]; then
  # Builds below $VER now show the full-screen "Update required" until they install this one.
  ssh -i "$KEY" $HOST "echo '{\"android\":{\"min\":\"$VER\"},\"ios\":{\"min\":\"1.0.0\"}}' > $DEST/app-version.json"
  echo "Mandatory update enabled: android min = $VER"
fi
