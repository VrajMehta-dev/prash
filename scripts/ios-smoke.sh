#!/bin/bash
# iOS release smoke test. Needs a Mac with full Xcode and an iOS simulator.   ./scripts/ios-smoke.sh   [SIM_NAME="iPhone 15"]
# Run it before every App Store archive, after `pod install`. Exit code 0 = pass, anything else = a problem (the message says which).
#  1. static release gate (pnpm test:ios-release): pods installed, OTA wiring, permissions, Google config, version bumped
#  2. builds the Release configuration for the simulator (same JS bundling + native modules as the App Store build)
#  3. checks the built app: JS bundle inside, OTA native module linked in, version/build
#  4. installs it on the simulator, launches it and watches it for 30 s: it must still be running and must not crash
#  5. saves a screenshot to ios-smoke.png (look at it once: the PRASH splash / login screen, not a white or red screen)
set -euo pipefail
cd "$(dirname "$0")/.."
SIM="${SIM_NAME:-iPhone 15}"
BUNDLE_ID=com.app.phpl
fail() { echo "FAIL: $*" >&2; exit 1; }
command -v xcodebuild >/dev/null || fail "full Xcode is required (xcodebuild not found)"

echo "1/5 static release gate"
pnpm test:ios-release || fail "release gate failed (see the red tests above: usually pod install not run / version not bumped)"

echo "2/5 building Release for the simulator (takes a few minutes)"
rm -rf ios/build
xcodebuild -workspace ios/phpl.xcworkspace -scheme phpl -configuration Release \
  -sdk iphonesimulator -destination "platform=iOS Simulator,name=$SIM" \
  -derivedDataPath ios/build CODE_SIGNING_ALLOWED=NO build > ios/build.log 2>&1 || { tail -40 ios/build.log; fail "xcodebuild failed (full log: ios/build.log)"; }
APP=$(find ios/build/Build/Products/Release-iphonesimulator -maxdepth 1 -name '*.app' | head -1)
[ -n "$APP" ] || fail "no .app was produced"

echo "3/5 inspecting $APP"
EXEC=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$APP/Info.plist")
VER=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$APP/Info.plist")
BUILD=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$APP/Info.plist")
echo "   version $VER ($BUILD), executable $EXEC"
[ -f "$APP/main.jsbundle" ] || fail "main.jsbundle is not inside the app (Release build did not bundle the JS)"
strings "$APP/$EXEC" | grep -q "HotUpdater" || fail "the OTA module (HotUpdater) is not linked into the app: pod install / AppDelegate problem"
strings "$APP/$EXEC" | grep -q "RNCClipboard" || fail "clipboard module not linked into the app"
strings "$APP/$EXEC" | grep -qi "HapticFeedback" || fail "haptics module not linked into the app"

echo "4/5 installing and launching on '$SIM'"
xcrun simctl boot "$SIM" 2>/dev/null || true
xcrun simctl bootstatus "$SIM" -b >/dev/null
xcrun simctl uninstall "$SIM" "$BUNDLE_ID" 2>/dev/null || true
xcrun simctl install "$SIM" "$APP"
START=$(mktemp); sleep 1
xcrun simctl launch "$SIM" "$BUNDLE_ID" || fail "the app did not launch"
sleep 30
xcrun simctl spawn "$SIM" launchctl list | grep -q "UIKitApplication:$BUNDLE_ID" || fail "the app is no longer running after 30 s (it crashed or was killed)"
CRASH=$(find "$HOME/Library/Logs/DiagnosticReports" -name "$EXEC*.ips" -newer "$START" 2>/dev/null | head -1 || true)
[ -z "$CRASH" ] || fail "a crash report was written: $CRASH"

echo "5/5 screenshot"
xcrun simctl io "$SIM" screenshot ios-smoke.png >/dev/null
rm -f "$START"
echo "PASS: $VER ($BUILD) built, linked with OTA + clipboard + haptics, launched and stayed up for 30 s. Check ios-smoke.png by eye."
