#!/bin/bash
# Publish a JS-only OTA update to UAT:  ./scripts/ota.sh "what changed"   (OTA_FORCE=1 makes it mandatory)
# Refuses when native code changed since the last APK build: an OTA bundle that needs a native module
# missing from an installed build crashes it. Native changes ship as a new APK (./scripts/build-uat.sh),
# which also makes the update mandatory.
set -euo pipefail
cd "$(dirname "$0")/.."
[ "$(git branch --show-current)" = "uat" ] || { echo "run on the uat branch"; exit 1; }
grep -q 'IS_UAT = true' app/config/env.js || { echo "env.js is not UAT"; exit 1; }

VER=$(grep -oE 'versionName "[^"]+"' android/app/build.gradle | cut -d'"' -f2)
TAG="uat-apk-$VER"
git rev-parse -q --verify "refs/tags/$TAG" >/dev/null || {
  echo "No APK has been built for $VER yet ($TAG missing). Run ./scripts/build-uat.sh first."; exit 1; }

NATIVE_PATHS=(android ios package.json pnpm-lock.yaml)
CHANGED=$( { git diff --name-only "$TAG" -- "${NATIVE_PATHS[@]}"; git ls-files --others --exclude-standard -- android ios; } | grep -v '\.DS_Store' || true)
if [ -n "$CHANGED" ]; then
  echo "Native-affecting files changed since the $VER APK:"; echo "$CHANGED" | sed 's/^/  /'
  echo
  echo "An OTA bundle could crash installed builds that lack this. Instead: bump versionName/versionCode,"
  echo "commit, and run ./scripts/build-uat.sh (it forces the update on older builds)."
  exit 1
fi
npx hot-updater deploy -p android -t "$VER" ${OTA_FORCE:+-f} -m "${1:-OTA update}"
