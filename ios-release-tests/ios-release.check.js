// iOS release gate. Run before every iOS archive:  pnpm test:ios-release   (static checks, any machine, ~2 s)
// A failure here means the iOS build would be missing something (OTA wiring, a native pod, a permission, a version bump).
// The same checks run again on the build itself by  scripts/ios-smoke.sh  (needs a Mac with Xcode + a simulator).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

// ---- bump these two after each App Store release (they are the version/build that is already live) ----
const LAST_RELEASED = {version: '1.5', build: 2};
// Google OAuth client IDs the backend accepts (phpl-backend/src/config/authConfig.js, project phpl-c97dc)
const BACKEND_GOOGLE_AUDIENCES = [
  '204197144339-net2b77rf6d4jndu7nv6r2uj1fmrd1cq.apps.googleusercontent.com',
  '204197144339-ja46a381qlvr5n2bk0kr5up5fsg5d8hl.apps.googleusercontent.com',
];

// ---- minimal plist reader (no dependencies): returns {key: value} for the top-level dict, plus the list of top-level keys ----
function parsePlist(xml) {
  const tokens = xml.replace(/<\?xml[^>]*\?>|<!DOCTYPE[^>]*>/g, '').replace(/<(true|false)><\/\1>/g, '<$1/>').match(/<[^>]+>|[^<]+/g).map(t => t.trim().replace(/\s*\/>$/, '/>')).filter(Boolean);
  let i = 0;
  const topKeys = [];
  function value(depth) {
    const t = tokens[i++];
    if (t === '<true/>') return true;
    if (t === '<false/>') return false;
    if (t === '<dict/>') return {};
    if (t === '<array/>') return [];
    if (t === '<dict>') {
      const o = {};
      while (tokens[i] !== '</dict>') {
        i++; const k = tokens[i++]; i++;   // <key> text </key>
        if (depth === 0) topKeys.push(k);
        o[k] = value(depth + 1);
      }
      i++; return o;
    }
    if (t === '<array>') {
      const a = [];
      while (tokens[i] !== '</array>') a.push(value(depth + 1));
      i++; return a;
    }
    const m = /^<(string|integer|real|date|data)>$/.exec(t);
    if (m) { let text = ''; if (tokens[i] !== `</${m[1]}>`) text = tokens[i++]; i++; return text; }
    if (/^<(string|integer|real|date|data)\/>$/.test(t)) return '';
    throw new Error('plist: unexpected ' + t);
  }
  while (tokens[i] !== '<dict>') i++;
  const dict = value(0);
  return {dict, topKeys};
}
const info = parsePlist(read('ios/phpl/Info.plist'));
const google = parsePlist(read('ios/GoogleService-Info.plist')).dict;
const entitlements = parsePlist(read('ios/phpl/phpl.entitlements')).dict;

const versionParts = v => v.split('.').map(Number);
const newerThan = (a, b) => { const x = versionParts(a), y = versionParts(b); for (let n = 0; n < Math.max(x.length, y.length); n++) { if ((x[n] || 0) !== (y[n] || 0)) return (x[n] || 0) > (y[n] || 0); } return false; };

describe('OTA wiring', () => {
  const appDelegate = read('ios/phpl/AppDelegate.mm');
  test('AppDelegate imports HotUpdater', () => expect(appDelegate).toMatch(/#import <HotUpdater\/HotUpdater\.h>/));
  test('release builds load the OTA bundle', () => {
    const release = appDelegate.split('#else')[1].split('#endif')[0];
    expect(release).toMatch(/\[HotUpdater bundleURL\]/);
    expect(release).not.toMatch(/URLForResource:@"main"/);
  });
  test('JS side registers Hot Updater', () => expect(read('app/utils/hotUpdater.js')).toMatch(/@hot-updater\/react-native/));
  test('OTA targets by app version (iOS MARKETING_VERSION)', () => expect(read('hot-updater.config.ts')).toMatch(/updateStrategy: 'appVersion'/));
  test('ota-prod.sh can publish iOS', () => expect(read('scripts/ota-prod.sh')).toMatch(/OTA_PLATFORM/));
});

describe('native pods are installed (run `pod install` and commit ios/Podfile.lock)', () => {
  const lock = read('ios/Podfile.lock');
  const pkg = JSON.parse(read('package.json'));
  const needed = [];
  for (const dep of Object.keys({...pkg.dependencies, ...pkg.devDependencies})) {
    const dir = path.join(root, 'node_modules', dep);
    if (!fs.existsSync(dir)) continue;
    // the package's own podspec: in the package root or in its ios/ folder (not vendored sub-specs deeper down)
    for (const d of [dir, path.join(dir, 'ios')]) {
      if (!fs.existsSync(d)) continue;
      for (const f of fs.readdirSync(d)) if (f.endsWith('.podspec')) needed.push([dep, f.replace('.podspec', '')]);
    }
  }
  test('node_modules is installed', () => expect(needed.length).toBeGreaterThan(10));
  test.each(needed)('%s -> pod %s is in Podfile.lock', (dep, pod) => expect(lock.includes(`- ${pod} (`) || lock.includes(`- "${pod} (`)).toBe(true));
  test('the three pods that were missing', () => {
    for (const pod of ['HotUpdater', 'RNCClipboard', 'RNReactNativeHapticFeedback']) expect(lock).toMatch(new RegExp(`- ${pod} \\(`));
  });
});

describe('version', () => {
  const pbx = read('ios/phpl.xcodeproj/project.pbxproj');
  const marketing = [...new Set([...pbx.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map(m => m[1].trim()))];
  const builds = [...new Set([...pbx.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)].map(m => Number(m[1].trim())))];
  test('one marketing version and one build number everywhere', () => { expect(marketing).toHaveLength(1); expect(builds).toHaveLength(1); });
  test(`is newer than the released ${LAST_RELEASED.version} (${LAST_RELEASED.build})`, () => {
    const v = marketing[0];
    expect(newerThan(v, LAST_RELEASED.version) || (v === LAST_RELEASED.version && builds[0] > LAST_RELEASED.build)).toBe(true);
  });
});

describe('Info.plist', () => {
  const p = info.dict;
  test('no duplicate top-level keys', () => { const d = info.topKeys.filter((k, n) => info.topKeys.indexOf(k) !== n); expect(d).toEqual([]); });
  test.each(['NSCameraUsageDescription', 'NSPhotoLibraryUsageDescription', 'NSMicrophoneUsageDescription'])('%s is a real sentence', k => expect((p[k] || '').length).toBeGreaterThan(10));
  test('push notifications background mode', () => expect(p.UIBackgroundModes).toContain('remote-notification'));
  test('UPI apps can be detected', () => expect(p.LSApplicationQueriesSchemes).toEqual(expect.arrayContaining(['tez', 'phonepe', 'paytm', 'gpay'])));
  test('bundle version keys come from the project', () => { expect(p.CFBundleShortVersionString).toBe('$(MARKETING_VERSION)'); expect(p.CFBundleVersion).toBe('$(CURRENT_PROJECT_VERSION)'); });
});

describe('Google sign-in (iOS)', () => {
  const schemes = (info.dict.CFBundleURLTypes || []).flatMap(t => t.CFBundleURLSchemes || []);
  test('URL scheme = REVERSED_CLIENT_ID of GoogleService-Info.plist', () => expect(schemes).toContain(google.REVERSED_CLIENT_ID));
  test('iOS client id is accepted by the backend', () => expect(BACKEND_GOOGLE_AUDIENCES).toContain(google.CLIENT_ID));
  test('GoogleService-Info bundle id is the app', () => expect(google.BUNDLE_ID).toBe('com.app.phpl'));
  test('web client id in the app is accepted by the backend', () => {
    const m = /googleWebClientId: '([^']+)'/.exec(read('app/config/setting.js'));
    expect(BACKEND_GOOGLE_AUDIENCES).toContain(m && m[1]);
  });
  test('no other Google project left in the app code (a second configure() would change the token audience)', () => {
    const files = require('child_process').execSync('git ls-files app', {cwd: root}).toString().split('\n').filter(f => f.endsWith('.js'));
    expect(files.filter(f => /478218184444/.test(read(f)))).toEqual([]);
  });
  test('AppDelegate hands the Google redirect URL back', () => expect(read('ios/phpl/AppDelegate.mm')).toMatch(/GIDSignIn\.sharedInstance handleURL/));
});

describe('entitlements', () => {
  test('push', () => expect(entitlements['aps-environment']).toBeDefined());
  test('Sign in with Apple capability', () => expect(entitlements['com.apple.developer.applesignin']).toBeDefined());
  test('Firebase config present', () => expect(fs.existsSync(path.join(root, 'ios/GoogleService-Info.plist'))).toBe(true));
});
