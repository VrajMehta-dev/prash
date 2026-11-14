#!/bin/bash
# Google sign-in test for iOS:  ./scripts/ios-google-e2e.sh   (Mac + Xcode + simulator + Maestro; run ./scripts/ios-smoke.sh first: it builds the app)
#  1. the built app registers the Google redirect URL scheme and its client ID is the one the backend accepts
#  2. Maestro (e2e/google-signin.yaml): the Google sheet opens and Google's page loads without a client-ID / redirect error
#  3. a fake Google redirect is delivered to the app through its URL scheme: the app must stay up (handler wired, no crash)
# NOT automated, do it by hand once per iOS release (2 minutes): see "Google sign-in, manual check" in RELEASE.md.
set -euo pipefail
cd "$(dirname "$0")/.."
SIM="${SIM_NAME:-iPhone 15}"
BUNDLE_ID=com.app.phpl
fail() { echo "FAIL: $*" >&2; exit 1; }
command -v maestro >/dev/null || fail "Maestro is required: curl -Ls https://get.maestro.mobile.dev | bash"
APP=$(find ios/build/Build/Products/Release-iphonesimulator -maxdepth 1 -name '*.app' 2>/dev/null | head -1)
[ -n "$APP" ] || fail "no built app: run ./scripts/ios-smoke.sh first"

echo "1/3 URL scheme and client ID in the BUILT app"
REVERSED=$(/usr/libexec/PlistBuddy -c 'Print :REVERSED_CLIENT_ID' "$APP/GoogleService-Info.plist" 2>/dev/null) || fail "GoogleService-Info.plist is not inside the app"
CLIENT=$(/usr/libexec/PlistBuddy -c 'Print :CLIENT_ID' "$APP/GoogleService-Info.plist")
/usr/libexec/PlistBuddy -c 'Print :CFBundleURLTypes' "$APP/Info.plist" | grep -q "$REVERSED" || fail "Info.plist has no URL scheme $REVERSED (Google cannot return to the app)"
case "$CLIENT" in
  204197144339-ja46a381qlvr5n2bk0kr5up5fsg5d8hl.apps.googleusercontent.com) echo "   client $CLIENT (accepted by the backend)";;
  *) fail "iOS client ID $CLIENT is not in the backend's accepted list (phpl-backend/src/config/authConfig.js): Google login would be rejected";;
esac

echo "2/3 Google sheet and page (Maestro)"
xcrun simctl boot "$SIM" 2>/dev/null || true
xcrun simctl bootstatus "$SIM" -b >/dev/null
xcrun simctl uninstall "$SIM" "$BUNDLE_ID" 2>/dev/null || true
xcrun simctl install "$SIM" "$APP"
maestro test e2e/google-signin.yaml || fail "the Google sign-in sheet / page did not load as expected (see the Maestro output and the screenshot)"

echo "3/3 redirect back into the app through its URL scheme"
xcrun simctl launch "$SIM" "$BUNDLE_ID" >/dev/null
sleep 5
xcrun simctl openurl "$SIM" "$REVERSED:/oauth2callback?error=access_denied" || fail "the simulator could not hand the Google redirect to the app"
sleep 5
xcrun simctl spawn "$SIM" launchctl list | grep -q "UIKitApplication:$BUNDLE_ID" || fail "the app crashed when Google's redirect URL arrived"
echo "PASS (automated part). Now do the manual check from RELEASE.md: sign in with a real Google account once."
