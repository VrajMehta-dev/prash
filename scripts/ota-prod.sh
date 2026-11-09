#!/bin/bash
# Publish a JS-only OTA update to PRODUCTION:  ./scripts/ota-prod.sh "what changed"
# Run on the `main` branch. Refuses when native code changed since the store build of this version (an OTA bundle
# that needs a native module missing from installed builds would crash them) and when no store build was marked.
# After you upload a store build, mark it:  git tag prod-release-<versionName> <commit>   (the commit that was built)
# Needs .env.hotupdater.prod (gitignored): admin token + S3 creds of the prod OTA server.
set -euo pipefail
cd "$(dirname "$0")/.."
[ "$(git branch --show-current)" = "main" ] || { echo "run on the main branch"; exit 1; }
grep -q 'IS_UAT = false' app/config/env.js || { echo "env.js is not the production setting"; exit 1; }
[ -f .env.hotupdater.prod ] || { echo ".env.hotupdater.prod is missing"; exit 1; }

VER=$(grep -oE 'versionName "[^"]+"' android/app/build.gradle | cut -d'"' -f2)
TAG="prod-release-$VER"
git rev-parse -q --verify "refs/tags/$TAG" >/dev/null || {
  echo "No store build is marked for $VER ($TAG missing). Tag the commit that was shipped: git tag $TAG <commit>"; exit 1; }

NATIVE_PATHS=(android ios package.json pnpm-lock.yaml)
CHANGED=$( { git diff --name-only "$TAG" -- "${NATIVE_PATHS[@]}"; git ls-files --others --exclude-standard -- android ios; } | grep -v '\.DS_Store' || true)
if [ -n "$CHANGED" ]; then
  echo "Native-affecting files changed since the $VER store build:"; echo "$CHANGED" | sed 's/^/  /'
  echo; echo "Ship a new store build instead (bump versionName/versionCode)."; exit 1
fi
OTA_ENV=prod npx hot-updater deploy -p android -t "$VER" -m "${1:-OTA update}"
