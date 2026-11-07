# Baby Mo — App Store Preparation (Phase 10)

_Prepared 2026-11-07. Everything here is ready except the steps marked **[YOU]**,
which require the Apple Developer account holder._

## Identifiers & versions

| Item | Value |
|---|---|
| iOS bundle ID | `id.babymo.app` *(matches the existing Capacitor app — reuses its App Store record if one exists)* |
| watchOS bundle ID | `id.babymo.app.watchkitapp` |
| iCloud container | `iCloud.id.babymo.app` |
| Marketing version | `1.0` (set in `native/project.yml`) |
| Deployment targets | iOS 17.0 · watchOS 10.0 |
| Devices | iPhone, iPad (`1,2`), Apple Watch (`4`) |

## What is already in place

- ✅ App icons (1024 px, opaque, generated from brand logo) for iOS + watchOS.
- ✅ Launch screen (generated, brand background).
- ✅ Privacy manifests (`PrivacyInfo.xcprivacy`, both targets): **no tracking, no
  data collection**; UserDefaults declared with reason `CA92.1`.
- ✅ No camera/mic/location/contacts usage → no permission strings needed.
- ✅ Watch notifications: standard local-notification permission prompt, asked
  contextually (no `Info.plist` string required).
- ✅ iCloud/CloudKit entitlements files wired into both targets.
- ✅ Offline-first: app is fully functional with no network and no account.

## [YOU] Signing & capabilities (one-time, in Xcode)

1. `cd native && xcodegen generate && open BabyMo.xcodeproj`
2. For **both** targets (BabyMo, BabyMo Watch App): Signing & Capabilities →
   select your Team. (Or set `DEVELOPMENT_TEAM: <TEAMID>` once in
   `native/project.yml` and regenerate.)
3. Press the "+ Capability" button → **iCloud** → check **CloudKit** → container
   `iCloud.id.babymo.app` (both targets). The entitlements files already exist;
   Xcode just needs the capability registered with your team.
4. Build to a device once to confirm provisioning.

## [YOU] App Store Connect

1. App record: reuse the existing `id.babymo.app` app (the Capacitor release) —
   this native build is an update, not a new app. Add the watchOS platform.
2. **Kids Category**: Baby Mo targets children — select the Kids category and
   the 5-and-under or 6–8 age band. The app contains no ads, no tracking, no
   third-party analytics, and no external links, which satisfies the Kids
   Category requirements. The parents' corner (dashboard) is behind a toolbar
   action; consider adding a parental gate if App Review requests one.
3. Privacy questionnaire: "Data Not Collected" (nothing leaves the device
   except the user's own iCloud private database, which is exempt).
4. Privacy policy URL: link the existing Baby Mo website policy.

## Suggested metadata

**Name:** Baby Mo — Belajar Islami
**Subtitle (ID):** Belajar islami seru bareng Mo
**Subtitle (EN):** Fun Islamic learning with Mo

**Description (ID):**
> Baby Mo adalah teman belajar islami untuk anak-anak! Belajar huruf hijaiyah,
> doa harian, sholat bareng Mo, dan bermain game edukatif yang seru. Dengan
> tampilan hangat dan karakter Mo yang menggemaskan, belajar jadi menyenangkan.
> • Hijaiyah dan ejaan bahasa Arab
> • Doa harian dengan audio
> • Sholat bareng Mo langkah demi langkah
> • Puzzle, memory match, cari & temukan
> • Cerita sebelum tidur (Dreamtime)
> • Aplikasi Apple Watch mandiri dengan tantangan harian
> • Dasbor orang tua: progres, streak, pencapaian
> • 100% offline, tanpa iklan, tanpa pelacakan

**Description (EN):**
> Baby Mo is your child's Islamic learning companion! Learn Hijaiyah letters,
> daily duas, pray along with Mo, and play joyful educational games. Warm,
> magical design with the lovable Mo character.
> • Hijaiyah & Arabic spelling · Daily duas with audio
> • Step-by-step "Pray with Mo" · Puzzles, memory match, look & find
> • Bedtime stories · Standalone Apple Watch app with daily challenges
> • Parent dashboard: progress, streaks, achievements
> • 100% offline, no ads, no tracking

**Keywords:** islam,anak,hijaiyah,doa,sholat,quran,belajar,kids,muslim,edukasi

## [YOU] Screenshots

Capture from the simulators (the app is fully navigable):
- iPhone 6.9″ / 6.5″: onboarding, Home, a game, Doa Harian, parents' corner.
- iPad 13″: sidebar Home, a full-screen game.
- Watch: Hijaiyah challenge, streak page.
Reference shots from this session: onboarding, iPad Home, and Watch challenge
were verified working on 2026-11-07.

## Release checklist

- [ ] Team + capabilities set (above)
- [ ] `xcodebuild -project native/BabyMo.xcodeproj -scheme BabyMo archive` succeeds
- [ ] TestFlight build on a physical iPhone + paired Watch (verifies
      WatchConnectivity + CloudKit end-to-end, which simulators cannot fully)
- [ ] Kids Category questionnaire + privacy answers
- [ ] Screenshots uploaded
- [ ] Submit for review

## Explicitly not fabricated

No certificates, provisioning profiles, team IDs, or App Store Connect records
were created or guessed; all signing is Automatic and awaits your team selection.
