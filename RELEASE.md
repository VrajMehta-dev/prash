# Releasing PRASH (Android + iOS)

> **IMPORTANT: Android OTA is paused until the next Android store release.** `main` now contains a native Android change (`android:enableOnBackInvokedCallback="false"` in the manifest, versionCode 16: fixes the back gesture closing the app on Android 16+). `./scripts/ota-prod.sh` refuses to publish Android OTA while native files differ from the `prod-release-1.2.6` tag. To resume: build the Android release from `main` (versionCode 16, optional update in Play), upload it, then move the tag to the built commit: `git tag -f prod-release-1.2.6 <built commit> && git push -f origin prod-release-1.2.6`. Until then only iOS OTA (after the iOS release below) and server-side fixes are possible. If the OTA flexibility matters more than this fix right now, revert the merge commit `f70d992`.

> **IMPORTANT: next iOS release — what the iOS developer must do (all of this is already on `main`)**
> **You MUST run the two iOS tests below before archiving. If either fails, do NOT submit to the App Store: fix it or tell us.**
> `main` makes iOS able to receive OTA updates (`AppDelegate.mm` loads the Hot Updater bundle). Only iOS builds made from it can ever get OTA; the 1.3 to 1.5 builds in the field cannot.
> 1. Check out `main` (latest) and run `pod install` on a Mac with **full Xcode**. This adds the three missing pods (HotUpdater, clipboard, haptics) and updates `ios/Podfile.lock`. **Commit that file.**
> 2. Set the iOS version above the current **1.5 (build 2)** (`MARKETING_VERSION` / `CURRENT_PROJECT_VERSION`). No version was picked on the branch.
> 3. **Run the tests (required), ALL must pass, in this order:**
>    a. `pnpm test:ios-release` — static gate (2 s). It fails today on purpose (pods missing, version not bumped) and turns green after steps 1 and 2. After each App Store release update `LAST_RELEASED` at the top of `ios-release-tests/ios-release.check.js`.
>    b. `pnpm test` — unit tests, including the payment logic (`__tests__/paymentLogic.test.js`). `App.test.tsx` was already failing before this work: ignore that one.
>    c. `./scripts/ios-smoke.sh` — builds Release for the simulator, checks OTA/clipboard/haptics are linked in, launches it and watches it 30 s.
>    d. `pnpm test:ios-ota` (`./scripts/ios-ota-e2e.sh`, run after c; needs Maestro and `.env.hotupdater.prod`) — **the OTA test**: gives that build a private OTA channel, publishes a test bundle, and checks on the simulator that the update is offered, downloaded, applied and not offered again. Real users cannot receive it.
> d2. `pnpm test:ios-google` (`./scripts/ios-google-e2e.sh`, after c) — Google sign-in, automated part: the built app has the right Google URL scheme and client ID, the Google sheet opens and Google's page loads without a client-ID / redirect error, and the app survives Google's redirect URL. Google blocks automated logins, so **finishing a real sign-in is a manual check, see "Google sign-in, manual check" below**.
>    e. `pnpm e2e` (Maestro, app already installed by c): logs in with the demo account and walks Home, tabs, Pay and the checkout screen. Run as `maestro test -e E2E_EMAIL=reviewer@demo.prash.invalid -e E2E_PASSWORD=<demo password> e2e/app-flow.yaml`. Ask us for the demo password. Test gateway only, it never pays.
>    The simulator scripts and the Maestro flows were written without a simulator: fix small things (simulator name, labels) the first time and commit them.
> 4. Archive and submit to the App Store.
> 5. Tag the built commit as `prod-release-ios-<version>` and push the tag. OTA for iOS (`OTA_PLATFORM=ios ./scripts/ota-prod.sh "msg"`) only works after this tag exists.
> Not yet verified on a device: iOS OTA publish (try a harmless test bundle first) and Google sign-in on iOS. Apple may ask for Sign in with Apple (guideline 4.8) because Google login is offered.

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
bundle exec pod install        # Podfile.lock is missing the pods HotUpdater (OTA), RNCClipboard and RNReactNativeHapticFeedback: this adds them. Commit the updated Podfile.lock.
open phpl.xcworkspace
```
Before archiving run `pnpm test:ios-release` and `./scripts/ios-smoke.sh` (see the IMPORTANT note at the top). In Xcode: select the release scheme, set Version/Build, Signing with team `6AZ63MW8MQ`, Product > Archive > Distribute (App Store Connect), then TestFlight and submit. Text from `store-assets/listing/app-store.md`, screenshots from `store-assets/screenshots/appstore-6.9` and `appstore-6.5`, icon `store-assets/graphics/appstore-icon-1024.png`.
Known gaps on iOS: Google sign-in is prepared (URL scheme in `Info.plist`) but never built/tested; if it does not work, hide the line "Continue with Google" in the listing text. OTA on iOS works only for builds made from the commit that has `[HotUpdater bundleURL]` in `AppDelegate.mm` (older iOS builds can never receive OTA).

### Google sign-in, manual check (iOS, once per release, 2 minutes)
Automation cannot type a Google password (Google blocks it), so after `pnpm test:ios-google` passes do this on the simulator or a phone with the release build:
1. Login screen > "Continue with Google" > allow the "wants to use google.com" prompt > choose the Google account of a **test tenant whose email matches a tenant** (e.g. `parmardhruv800@gmail.com`, the demo tenant; ask us).
2. Expected: you land on Home with that tenant's outlets, no error toast. A Google account that is not a tenant must show "ask your property manager" and stay on the login screen.
3. Also kill the app and reopen: still signed in. Log out and sign in again once.
If step 1 fails with DEVELOPER_ERROR / invalid_client, the iOS client ID or bundle ID `com.app.phpl` is wrong in Google Cloud / Firebase (project `phpl-c97dc`); with "audience" errors, `authConfig.js` on the backend does not list the client ID.

## 5. After the builds are uploaded
```bash
git tag prod-release-<versionName> <commit that was built>   # Android, e.g. prod-release-1.2.6
git tag prod-release-ios-<MARKETING_VERSION> <commit that was built>   # iOS, e.g. prod-release-ios-1.6
git push origin --tags
```
This tag is the baseline the OTA script uses to decide whether a change needs a store release.

## 6. Smoke test the store build (before rolling out to 100%)
1. Log in with the reviewer account: Pay tab shows 3 sample dues in order; start a payment: the checkout opens in **test** mode (reviewer outlet only).
2. Log in with a real tenant (or ask one): dues, receipts, notifications open the right page. Do NOT pay with a real account unless you mean to.
3. Old tenants must still be able to sign in (password and Google).

## 7. Publishing JS-only fixes later (Android and iOS, no store review)
From `main`, after the store build above is live and tagged:
```bash
./scripts/ota-prod.sh "what changed"                    # Android
OTA_PLATFORM=ios ./scripts/ota-prod.sh "what changed"   # iOS (bundles are per platform: publish both for a change that affects both)
```
The script refuses if native files of that platform (android/ or ios/, plus package.json and the lockfile) changed since its `prod-release-<version>` / `prod-release-ios-<version>` tag: then ship a new store build instead. Only builds made from `main` after the OTA commit (`d7885f2`) can receive prod OTA.
Disable a bad bundle: `OTA_ENV=prod npx hot-updater bundle disable <bundle-id> -y` (app rolls back on next launch).

## 8. Backend / admin / ops facts
- Prod VM: `40.81.237.58` (key `Credentials/Azure/pu_key_prod.pem`), services `phpl-backend`, `phpl-web`, `prash-ota` (pm2). DB `phpl`. See `INFRA_NOTES.md`.
- Easebuzz direct-UPI is OFF (`EASEBUZZ_SEAMLESS_ENABLED` unset in the backend `.env`); enabling it needs Easebuzz to enable Seamless on the account first.
- Reviewer account lives in its OWN database (`phpl_demo`) and backend process (pm2 `phpl-backend-demo`, port 4010, no cron, Redis db 5, Easebuzz TEST gateway). The real backend forwards only that account's requests to it (`middlewares/client/demoRoute.js`, `DEMO_BACKEND_URL` in the prod `.env`). It is never in the real DB, counts, reports or the admin dashboard. If reviewers pay all three sample dues, re-seed `phpl_demo` (bills / additional_charges / container_charges rows for pr_id 160) or ask the backend owner.
- Full context of what shipped and why: `../CLAUDE.md` sections "PROD ROLLOUT", "Demo / app-store review account", "OTA on PRODUCTION".

## 9. Rollback
Stores: halt the staged rollout / promote the previous build (Play) or remove the build from review / phased release (App Store). Backend: previous code is in git (`phpl-backend` tag/commit `b653604` was prod before this release) and a DB backup was taken before the migrations (`~/backups/phpl_prebackup_prashrelease_*.dump` on the prod VM).
