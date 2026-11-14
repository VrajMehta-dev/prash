#!/bin/bash
# The ONE iOS OTA test:  ./scripts/ios-ota-e2e.sh      (Mac + Xcode + simulator + Maestro; run ./scripts/ios-smoke.sh first: it builds the app)
# Proves, on a real simulator, that a build of this app can receive an OTA update end to end:
#   1. takes the Release build ios-smoke.sh made and gives it a PRIVATE OTA channel (ios-e2e-<time>) via Info.plist HOT_UPDATER_CHANNEL,
#      so real users (channel "production") can never receive the test bundle
#   2. publishes a test bundle for that channel and this iOS version to the prod OTA server (needs .env.hotupdater.prod, like ota-prod.sh)
#   3. installs the app on the simulator and drives the update with Maestro (e2e/ota.yaml): offered -> download -> restart -> not offered again
#   4. checks the files: the new bundle is in the app's Documents/bundle-store on the simulator
#   5. disables the test bundle on the server again
# Costs one small bundle upload per run. Exit code 0 = OTA works for this build.
set -euo pipefail
cd "$(dirname "$0")/.."
SIM="${SIM_NAME:-iPhone 15}"
BUNDLE_ID=com.app.phpl
CHANNEL="ios-e2e-$(date +%s)"
fail() { echo "FAIL: $*" >&2; exit 1; }
command -v xcrun >/dev/null || fail "Xcode is required"
command -v maestro >/dev/null || fail "Maestro is required: curl -Ls https://get.maestro.mobile.dev | bash"
[ -f .env.hotupdater.prod ] || fail ".env.hotupdater.prod is missing (same file ota-prod.sh needs)"
APP=$(find ios/build/Build/Products/Release-iphonesimulator -maxdepth 1 -name '*.app' 2>/dev/null | head -1)
[ -n "$APP" ] || fail "no built app: run ./scripts/ios-smoke.sh first"
VER=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$APP/Info.plist")
echo "iOS version $VER, test channel $CHANNEL"

echo "1/5 private channel"
WORK=$(mktemp -d); cp -R "$APP" "$WORK/app.app"
/usr/libexec/PlistBuddy -c "Add :HOT_UPDATER_CHANNEL string $CHANNEL" "$WORK/app.app/Info.plist"

echo "2/5 publishing the test bundle (channel $CHANNEL, iOS $VER)"
OUT=$(OTA_ENV=prod npx hot-updater deploy -p ios -c "$CHANNEL" -t "$VER" -m "ios ota e2e $CHANNEL" 2>&1) || { echo "$OUT" | tail -20; fail "publishing the test bundle failed"; }
echo "$OUT" | tail -5
BUNDLE=$(echo "$OUT" | grep -oiE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tail -1 || true)
cleanup() { [ -n "${BUNDLE:-}" ] && OTA_ENV=prod npx hot-updater bundle disable "$BUNDLE" -y >/dev/null 2>&1 && echo "test bundle $BUNDLE disabled" || echo "note: disable the test bundle by hand if it is still listed (channel $CHANNEL)"; rm -rf "$WORK"; }
trap cleanup EXIT

echo "3/5 installing and driving the update on '$SIM'"
xcrun simctl boot "$SIM" 2>/dev/null || true
xcrun simctl bootstatus "$SIM" -b >/dev/null
xcrun simctl uninstall "$SIM" "$BUNDLE_ID" 2>/dev/null || true
xcrun simctl install "$SIM" "$WORK/app.app"
maestro test e2e/ota.yaml || fail "the app did not offer / download / apply the OTA update (see the Maestro output above)"

echo "4/5 checking the files on the simulator"
DATA=$(xcrun simctl get_app_container "$SIM" "$BUNDLE_ID" data)
STORE="$DATA/Documents/bundle-store"
[ -d "$STORE" ] || fail "no bundle-store folder: the OTA bundle was not stored"
[ -n "$(find "$STORE" -mindepth 1 -maxdepth 1 -type d | head -1)" ] || fail "bundle-store is empty: the OTA bundle was not stored"
echo "   stored: $(ls "$STORE" | head -3 | tr '\n' ' ')"

echo "5/5 PASS: iOS $VER received, downloaded and applied an OTA bundle on channel $CHANNEL."
