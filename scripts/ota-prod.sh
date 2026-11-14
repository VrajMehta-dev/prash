#!/bin/bash
# Publish a JS-only OTA update to PRODUCTION:  ./scripts/ota-prod.sh "what changed"            (Android)
#                                              OTA_PLATFORM=ios ./scripts/ota-prod.sh "what changed"  (iOS)
# Run on the `main` branch. Refuses when native code changed since the store build of this version (an OTA bundle
# that needs a native module missing from installed builds would crash them) and when no store build was marked.
# After you upload a store build, mark it (the commit that was built):
#   Android:  git tag prod-release-<versionName> <commit>        iOS:  git tag prod-release-ios-<MARKETING_VERSION> <commit>
# Each platform only checks ITS native folder, so an iOS-only native change does not block Android OTA and vice versa.
# Needs .env.hotupdater.prod (gitignored): admin token + S3 creds of the prod OTA server.
set -euo pipefail
cd "$(dirname "$0")/.."
[ "$(git branch --show-current)" = "main" ] || { echo "run on the main branch"; exit 1; }
grep -q 'IS_UAT = false' app/config/env.js || { echo "env.js is not the production setting"; exit 1; }
[ -f .env.hotupdater.prod ] || { echo ".env.hotupdater.prod is missing"; exit 1; }

PLATFORM=${OTA_PLATFORM:-android}
case "$PLATFORM" in
  android)
    VER=$(grep -oE 'versionName "[^"]+"' android/app/build.gradle | cut -d'"' -f2)
    TAG="prod-release-$VER"; NATIVE_DIR=android ;;
  ios)
    VER=$(grep -oE 'MARKETING_VERSION = [^;]+' ios/*.xcodeproj/project.pbxproj | head -1 | sed 's/.*= //')
    TAG="prod-release-ios-$VER"; NATIVE_DIR=ios ;;
  *) echo "OTA_PLATFORM must be android or ios"; exit 1 ;;
esac
[ -n "$VER" ] || { echo "could not read the $PLATFORM version"; exit 1; }
git rev-parse -q --verify "refs/tags/$TAG" >/dev/null || {
  echo "No store build is marked for $VER ($TAG missing). Tag the commit that was shipped: git tag $TAG <commit>"; exit 1; }

NATIVE_PATHS=("$NATIVE_DIR" package.json pnpm-lock.yaml)
CHANGED=$( { git diff --name-only "$TAG" -- "${NATIVE_PATHS[@]}"; git ls-files --others --exclude-standard -- "$NATIVE_DIR"; } | grep -v '\.DS_Store' || true)
if [ -n "$CHANGED" ]; then
  echo "Native-affecting files changed since the $PLATFORM $VER store build:"; echo "$CHANGED" | sed 's/^/  /'
  echo; echo "Ship a new store build instead (bump versionName/versionCode)."; exit 1
fi
OTA_ENV=prod npx hot-updater deploy -p "$PLATFORM" -t "$VER" ${OTA_FORCE:+-f} -m "${1:-OTA update}"
