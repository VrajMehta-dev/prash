#!/bin/bash
# Build the UAT APK (run on the `uat` branch) and publish it to the UAT download URL.
set -euo pipefail
cd "$(dirname "$0")/.."
[ "$(git branch --show-current)" = "uat" ] || { echo "run on the uat branch"; exit 1; }
grep -q 'IS_UAT = true' app/config/env.js || { echo "env.js is not UAT"; exit 1; }
KEY="${UAT_SSH_KEY:-$HOME/Documents/Projects/PRASH/Credentials/AWS/prash-aws.pem}"
HOST=ubuntu@13.235.67.156
DEST=/home/ubuntu/updater-uat/prash
(cd android && ./gradlew assembleRelease)
APK=android/app/build/outputs/apk/release/app-release.apk
ssh -i "$KEY" $HOST "[ -f $DEST/PRASH-UAT.apk ] && cp $DEST/PRASH-UAT.apk $DEST/PRASH-UAT.apk.bak_\$(date +%Y%m%d_%H%M%S) || true"
scp -i "$KEY" "$APK" $HOST:$DEST/PRASH-UAT.apk
curl -s -o /tmp/uat-check.apk https://test-prash.aystera.com/mobile/PRASH-UAT.apk
[ "$(shasum -a 256 < $APK)" = "$(shasum -a 256 < /tmp/uat-check.apk)" ] && echo "LIVE: https://test-prash.aystera.com/mobile/PRASH-UAT.apk (hash verified)"
