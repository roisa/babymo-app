# Baby Mo — App Store Preparation

_Updated 2026-11-08 for the v1 submission build: the app fronts the Baby Mo web
hub (the play.babymo.id build) inside a native shell, fully offline. Steps
marked **[YOU]** require the Apple Developer account holder._

## Identifiers & versions

| Item | Value |
|---|---|
| iOS bundle ID | `id.babymo.app` *(matches the original Capacitor app — reuses its App Store record if one exists)* |
| Marketing version | `1.0` (set in `native/project.yml`) |
| Deployment target | iOS 17.0 |
| Devices | iPhone, iPad (`1,2`) |

Parked for v1 (restore from git history when ready):
- **Apple Watch app** — it displays progress fed by the native ProgressService,
  which is dormant while the app fronts the web hub. Shipping an empty watch
  app is an App Review rejection risk, so the target is removed from v1.
- **iCloud/CloudKit** — nothing syncs in v1 (progress lives in the web hub's
  local storage), so the capability and entitlements are omitted. This also
  keeps the privacy story a clean "no accounts, no cloud".

## What is already in place

- ✅ All content bundled in the binary (`ios/App/App/public`, byte-identical to
  play.babymo.id) and served via a local custom URL scheme — **the app is fully
  functional in airplane mode**. The only network feature is prayer *times*
  (see privacy below).
- ✅ App icons (1024 px, opaque, generated from brand logo).
- ✅ Branded native loading screen with real progress bar (no blank webview).
- ✅ Privacy manifest (`PrivacyInfo.xcprivacy`): no tracking, no data collection;
  UserDefaults declared with reason `CA92.1`.
- ✅ **Parental gate** (bilingual multiplication question) before any external
  link leaves the app — required for the Kids category.
- ✅ Native haptics bridged into every game; native audio session so sound works
  with the hardware silent switch on; keep-awake during bedtime stories and
  guided prayer; automatic recovery if the web process is killed.
- ✅ No camera/mic/contacts usage; **no location permission is requested** — the
  prayer-times feature uses a manually chosen city.
- ✅ UI tests covering the hub, Prayer tab rendering, and in-game safe-area
  regression (`BabyMoUITests`).

## Guideline 4.2.2 — put this in the App Review notes

> This app is not a repackaged website. All HTML/JS/image/audio content ships
> inside the binary and the app is fully functional offline (airplane mode).
> Native integrations include haptic feedback in games, a native audio session,
> a parental gate on external links, screen keep-awake during stories, and a
> native loading experience. The optional prayer-times feature fetches daily
> times from aladhan.com for a city the parent selects manually.

## [YOU] Signing (one-time, in Xcode)

1. `cd native && open BabyMo.xcodeproj`
2. Target **BabyMo** → Signing & Capabilities → select your Team.
   (Or set `DEVELOPMENT_TEAM: <TEAMID>` in `native/project.yml` and run
   `xcodegen generate`.) No extra capabilities are needed for v1.
3. Build to a device once to confirm provisioning.

## [YOU] App Store Connect

1. App record: reuse the existing `id.babymo.app` app if the Capacitor release
   ever shipped; otherwise create a new iOS app record.
2. **Kids Category**: select it with the 5-and-under or 6–8 band. The app has
   no ads, no tracking, no third-party analytics, and external links are behind
   a parental gate.
3. Privacy questionnaire: nothing is linked to identity and there is no
   tracking. If you want to be maximally conservative, declare
   **Coarse Location → App Functionality → Not linked to you** for the
   user-chosen prayer-times city sent to aladhan.com; otherwise "Data Not
   Collected" is defensible since the city is user-selected content, not
   device location.
4. Privacy policy URL: the babymo.id policy page — add one line disclosing the
   prayer-times API (city coordinates sent to aladhan.com, no identifiers).
5. Export compliance on upload: "only standard HTTPS" → exempt.

## Suggested metadata

**Name:** Baby Mo — Belajar Islami
**Subtitle (ID):** Belajar islami seru bareng Mo
**Subtitle (EN):** Fun Islamic learning with Mo

**Description (ID):**
> Baby Mo adalah teman belajar islami untuk anak-anak! Belajar huruf hijaiyah,
> doa harian, sholat bareng Mo, dan bermain game edukatif yang seru — dalam
> Bahasa Indonesia atau English.
> • Pulau Hijaiyah & ejaan bahasa Arab
> • Doa harian dengan audio
> • Sholat & wudhu bareng Mo langkah demi langkah, waktu sholat & streak
> • Puzzle, memory match, cari & temukan
> • Cerita sebelum tidur (Dreamtime)
> • 100% offline, tanpa iklan, tanpa pelacakan

**Description (EN):**
> Baby Mo is your child's Islamic learning companion! Learn Hijaiyah letters,
> daily duas, pray along with Mo, and play joyful educational games — in
> English or Bahasa Indonesia.
> • Hijaiyah Island & Arabic spelling · Daily duas with audio
> • Step-by-step "Pray with Mo" & wudhu, prayer times & streaks
> • Puzzles, memory match, look & find · Bedtime stories
> • 100% offline, no ads, no tracking

**Keywords:** islam,anak,hijaiyah,doa,sholat,quran,belajar,kids,muslim,edukasi

## [YOU] Screenshots (current app — the web hub)

Capture from the simulators (fully navigable):
- iPhone 6.9″ / 6.5″: Home (hub), Pulau Hijaiyah in-game, Sholat tab
  (prayer hub), Doa tab, Dreamtime.
- iPad 13″: Home and one full-screen game.

## Release checklist

- [ ] Team selected (above)
- [ ] `xcodebuild -project native/BabyMo.xcodeproj -scheme BabyMo archive` succeeds signed
- [ ] TestFlight build on a physical iPhone (verifies haptics, silent-switch
      audio, and the parental gate — simulators cannot)
- [ ] Kids Category questionnaire + privacy answers
- [ ] Screenshots uploaded
- [ ] Review notes include the 4.2.2 paragraph above
- [ ] Submit for review

## Explicitly not fabricated

No certificates, provisioning profiles, team IDs, or App Store Connect records
were created or guessed; all signing is Automatic and awaits your team selection.
