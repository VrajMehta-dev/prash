# Releasing PRASH (Android + iOS)

Branches: **`main` = production** (store releases). **`uat` = UAT only** (test server, debug signing, `IS_UAT = true`). Never merge `main` into `uat`, never change `IS_UAT` on `main`.
Backend and admin dashboard for this release are already live on prod; this document covers the mobile apps.

## 0. Tools
Node >= 18 (24 works), **pnpm** (`corepack enable`; repo pins `pnpm@12.16.1`, hoisted layout), JDK 17, Android SDK. For iOS: a Mac with **full Xcode**, Ruby + Bundler + CocoaPods.

```bash
git checkout main && git pull
pnpm install --frozen-lockfile      # do not use npm/yarn: it resolves different versions and breaks the build
```

## 1. Things that are NOT in git (get them first)
Every secret and file below is collected in **`RELEASE-SECRETS.local.md`** (git-ignored on purpose: do not put secrets in this tracked file). Ask the project owner to share it with you securely, along with `villaVote.keystore`, `.env.hotupdater.prod` and your Apple signing access.

| What | Used for | Where from |
|---|---|---|
| `villaVote.keystore` (+ passwords already in `android/app/build.gradle`) | Signs the Android release. Must be the SAME key as the live Play app. | team password manager / previous release machine. Put it at `android/app/villaVote.keystore` (git-ignored). |
| Apple signing certificate + provisioning profile for team `6AZ63MW8MQ`, bundle id `com.app.phpl` | iOS archive | Apple Developer account |
| Reviewer account password | Store review forms | password manager (see `store-assets/listing/review-notes.md`) |
| `.env.hotupdater.prod` | Only to publish OTA updates | `/home/azureuser/prash/prash-ota/.env.hotupdater` on the prod VM (ask the infra owner) |

Firebase files are already committed (`android/app/google-services.json`, `ios/GoogleService-Info.plist`). For Google sign-in, the SHA-1/SHA-256 of `villaVote.keystore` (and the Play App Signing key) must be registered in Firebase project `phpl-c97dc`, otherwise sign-in fails with DEVELOPER_ERROR.

## 2. Pre-flight (both platforms)
- `app/config/env.js` must say `export const IS_UAT = false;` (it does on `main`).
- Pick the version. Android: `versionName` / `versionCode` in `android/app/build.gradle` (now 1.2.5 / 23; `versionCode` must be higher than what Play already has). iOS: `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` in Xcode (currently 1.5 / 2: decide, build number must increase).
- The build must come from `main` because the **demo/reviewer payments and prod OTA need the code that is on `main`**.

## 3. Android
```bash
cd android
./gradlew bundleRelease        # Play wants the AAB: app/build/outputs/bundle/release/app-release.aab
# ./gradlew assembleRelease    # APK if you need one
```
Check the output is signed with the right key: `keytool -printcert -jarfile app-release.apk` (SHA-1 must match the live app). Upload the AAB in Play Console: Internal testing first, then Production. Fill "What's new" from `store-assets/listing/play-store.md`, screenshots from `store-assets/screenshots/play`, feature graphic/icon from `store-assets/graphics`. App access: use the reviewer account.

## 4. iOS
```bash
cd ios
bundle install
bundle exec pod install        # NEVER run on the previous Mac: Podfile.lock is missing the clipboard pod. Commit the updated Podfile.lock.
open phpl.xcworkspace
```
In Xcode: select the release scheme, set Version/Build, Signing with team `6AZ63MW8MQ`, Product > Archive > Distribute (App Store Connect), then TestFlight and submit. Text from `store-assets/listing/app-store.md`, screenshots from `store-assets/screenshots/appstore-6.9` and `appstore-6.5`, icon `store-assets/graphics/appstore-icon-1024.png`.
Known gaps on iOS: Google sign-in is prepared (URL scheme in `Info.plist`) but never built/tested; if it does not work, hide the line "Continue with Google" in the listing text. OTA is Android-only.

## 5. After the builds are uploaded
```bash
git tag prod-release-<versionName> <commit that was built>   # e.g. prod-release-1.2.5
git push origin prod-release-<versionName>
```
This tag is the baseline the OTA script uses to decide whether a change needs a store release.

## 6. Smoke test the store build (before rolling out to 100%)
1. Log in with the reviewer account: Pay tab shows 3 sample dues in order; start a payment: the checkout opens in **test** mode (reviewer outlet only).
2. Log in with a real tenant (or ask one): dues, receipts, notifications open the right page. Do NOT pay with a real account unless you mean to.
3. Old tenants must still be able to sign in (password and Google).

## 7. Publishing JS-only fixes later (Android only, no store review)
From `main`, after the store build above is live and tagged:
```bash
./scripts/ota-prod.sh "what changed"
```
The script refuses if native files (android/, ios/, package.json, lockfile) changed since the `prod-release-<version>` tag: then ship a new store build instead. Only builds made from `main` after the OTA commit (`d7885f2`) can receive prod OTA.
Disable a bad bundle: `OTA_ENV=prod npx hot-updater bundle disable <bundle-id> -y` (app rolls back on next launch).

## 8. Backend / admin / ops facts
- Prod VM: `40.81.237.58` (key `Credentials/Azure/pu_key_prod.pem`), services `phpl-backend`, `phpl-web`, `prash-ota` (pm2). DB `phpl`. See `INFRA_NOTES.md`.
- Easebuzz direct-UPI is OFF (`EASEBUZZ_SEAMLESS_ENABLED` unset in the backend `.env`); enabling it needs Easebuzz to enable Seamless on the account first.
- Reviewer account lives in its OWN database (`phpl_demo`) and backend process (pm2 `phpl-backend-demo`, port 4010, no cron, Redis db 5, Easebuzz TEST gateway). The real backend forwards only that account's requests to it (`middlewares/client/demoRoute.js`, `DEMO_BACKEND_URL` in the prod `.env`). It is never in the real DB, counts, reports or the admin dashboard. If reviewers pay all three sample dues, re-seed `phpl_demo` (bills / additional_charges / container_charges rows for pr_id 160) or ask the backend owner.
- Full context of what shipped and why: `../CLAUDE.md` sections "PROD ROLLOUT", "Demo / app-store review account", "OTA on PRODUCTION".

## 9. Rollback
Stores: halt the staged rollout / promote the previous build (Play) or remove the build from review / phased release (App Store). Backend: previous code is in git (`phpl-backend` tag/commit `b653604` was prod before this release) and a DB backup was taken before the migrations (`~/backups/phpl_prebackup_prashrelease_*.dump` on the prod VM).
