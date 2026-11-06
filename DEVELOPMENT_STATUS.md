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
| `BabyMoKit` package | ✅ Builds (iOS SDK) · ✅ 10/10 tests pass |
| Native iOS app `BabyMo` | ✅ Builds, installs, **launches & renders** on iPhone 17 Pro sim |
| watchOS app `BabyMo Watch App` | ✅ Builds on Apple Watch Series 11 sim |
| Embedded web bundle | ✅ All 13 HTML activities packaged into app (`public/`) |

## Phases
- [x] **Phase 1 — Audit & architecture** — audit, branches, decision recorded.
- [x] **Phase 2 — Xcode project & targets** — `BabyMoKit` + XcodeGen project with iOS + watchOS targets, all building.
- [x] **Phase 3 — Shared design system & assets** — tokens, fonts, components in `BabyMoKit`. _(Character art integration deferred to Phase 8.)_
- [~] **Phase 4 — iPhone app** — Home, Learn/Games/Stories browser, Character Collection, Parent Dashboard, onboarding, embedded-web activity wrapper all built & running. _Remaining: native stories, polish, more game nativization._
- [~] **Phase 5 — iPad experience** — `NavigationSplitView` sidebar layout in place; needs richer tablet surfaces.
- [~] **Phase 6 — Apple Watch app** — daily Hijaiyah challenge, streak, rewards, standalone store. _Remaining: reminders, complications, WatchConnectivity._
- [ ] **Phase 7 — Backend, auth & sync** — SwiftData models done; CloudKit + WatchConnectivity sync pending.
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
1. Phase 7: attach CloudKit to the SwiftData container + WatchConnectivity bridge.
2. Phase 6: Watch reminders (notifications) + complication.
3. Phase 8: integrate Mo character PNGs into native SwiftUI screens; intro audio.
4. Add UI tests; wire CI build for both targets.
