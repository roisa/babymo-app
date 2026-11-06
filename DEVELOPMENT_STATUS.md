# Baby Mo — Development Status

_Living document. Last updated: 2026-11-07_

Branch: `native-ecosystem` · Backup: `backup/pre-native-20261107` · Do **not** push to `main` without approval.

## Architecture (decided in Phase 1)
Hybrid native Apple ecosystem: native SwiftUI shell (iPhone/iPad) + standalone watchOS
app, sharing a `BabyMoKit` Swift package. Existing HTML games embedded via a native
`WKWebView` activity wrapper and nativized incrementally. Full rationale in
[`TECHNICAL_AUDIT.md`](TECHNICAL_AUDIT.md).

Native project is generated with **XcodeGen** from `native/project.yml` (run
`cd native && xcodegen generate`). This keeps the project file reproducible and
avoids hand-editing the Capacitor `pbxproj`.

## Build status (verified 2026-11-07)
| Target | State |
|---|---|
| Capacitor `App` (existing) | ✅ Builds (unchanged, preserved) |
| `BabyMoKit` package | ✅ Builds (iOS SDK) · ✅ **16/16 tests pass** (streaks, catalog, sync-merge, recorder) |
| Native iOS app `BabyMo` | ✅ Builds, installs, launches; Mo character art renders natively |
| watchOS app `BabyMo Watch App` | ✅ Builds, installs, **launches standalone** on unpaired Apple Watch Series 11 sim; Hijaiyah challenge verified on screen |
| Embedded web bundle | ✅ All 13 HTML activities packaged into app (`public/`) |
| UI tests (`BabyMoUITests`) | ✅ **3/3 pass on iPhone 17 Pro and iPad Pro 13″** (onboarding→home, parents' corner, games catalog) |

## Phases
- [x] **Phase 1 — Audit & architecture** — audit, branches, decision recorded.
- [x] **Phase 2 — Xcode project & targets** — `BabyMoKit` + XcodeGen project with iOS + watchOS targets, all building.
- [x] **Phase 3 — Shared design system & assets** — tokens, fonts, components in `BabyMoKit`. _(Character art integration deferred to Phase 8.)_
- [x] **Phase 4 — iPhone app** — Home, Learn/Games/Stories browser, Character Collection, onboarding, embedded-web activity wrapper, native Mo art. Kid tabs capped at 5; Parent Dashboard is a "parents' corner" sheet behind the Home toolbar button. _Further game nativization tracked under Phase 8._
- [x] **Phase 5 — iPad experience** — split-view sidebar (explicit-button rows with gold highlight), centered onboarding column, adaptive home grid; verified by screenshot + UI tests on iPad Pro 13″.
- [x] **Phase 6 — Apple Watch app** — daily Hijaiyah challenge, streak, rewards, contextual daily reminder, runs independently of the iPhone (`WKRunsIndependentlyOfCompanionApp`), WatchConnectivity sync. _Optional complications deferred to Phase 8._
- [x] **Phase 7 — Backend & sync (code complete)** — CloudKit-ready SwiftData models (no unique constraints, inline defaults, optional relationships), `BabyMoModelContainer` degrades CloudKit → local → memory, `ProfileSync` snapshot/merge (union days, max totals, earliest-achievement; identity never overwritten by Watch placeholder), `ConnectivityBridge` over `updateApplicationContext`. ⚠️ _End-to-end CloudKit sync unverified until the account holder enables the iCloud capability + signing; entitlements files are in place._
- [ ] **Phase 8–10 — Polish, testing, App Store prep**

## Completed
- Authenticated GitHub access; `backup/pre-native-20261107` preserves the shipping Capacitor app; work on `native-ecosystem`.
- Full repository audit → `TECHNICAL_AUDIT.md`; brand tokens extracted.
- `BabyMoKit`: color/typography/radii tokens, Button/Card/StreakBadge, SwiftData
  models (`ChildProfile`/`ActivityRecord`/`EarnedAchievement`), `ActivityCatalog`
  (all 11 HTML activities mapped), `AchievementCatalog`, `MoCharacter`/emotion/prayer
  enums, `StreakCalculator` (+10 tests), `HijaiyahQuiz`, `ProgressRecorder`.
- `native/` XcodeGen project: `BabyMo` (iOS/iPadOS) + `BabyMo Watch App` (watchOS).
- iPhone app: onboarding → tabbed Home/Belajar/Game/Cerita/Karakter/Orang Tua;
  WebView activity wrapper loading reused HTML games offline; progress → SwiftData.
- iPad: sidebar split layout. Watch: 3-page daily challenge / streak / rewards.
- Verified: iOS build + install + launch + on-brand onboarding screenshot; watch build.

## Known bugs / risks
- Characters Baby Ais / Adam / Abi have no art assets yet — collection shows
  "coming soon" states until art is provided.
- Mo character PNGs live in the web `public/` folder; native screens currently use
  SF Symbols. Native character art integration is Phase 8.
- `DEVELOPMENT_TEAM` is blank in `project.yml` — set it for device builds/signing.

## Needs the account holder (manual / cannot be automated)
- [ ] Set `DEVELOPMENT_TEAM` and signing in Xcode (or `project.yml`) for device/TestFlight.
- [ ] Enable iCloud/CloudKit + App Groups capabilities (Phase 7).
- [ ] App Store Connect records, real app icons, screenshots, review metadata.
- [ ] Physical-device testing for Watch connectivity & audio.

## Next steps
1. Phase 5: richer iPad surfaces (two-column home, larger game canvas).
2. Phase 8: intro audio on launch, celebration animations on achievement unlock,
   optional Watch complication / WidgetKit widget.
3. Phase 9: XCUIAutomation UI tests (onboarding → activity → dashboard), multi-size runs.
4. Phase 10: real app icons from brand art, App Store metadata, privacy manifest.
