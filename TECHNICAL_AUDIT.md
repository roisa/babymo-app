# Baby Mo — Technical Audit (Phase 1)

_Date: 2026-11-07 · Branch: `native-ecosystem` · Backup: `backup/pre-native-20261107`_

## 1. What the repository is today

Baby Mo currently ships as a **Capacitor-wrapped web app** — a native iOS WebView
shell that loads a self-contained HTML/CSS/JS bundle. There is no native UI beyond
the Capacitor bridge and a hand-written splash overlay.

| Aspect | Finding |
|---|---|
| Native wrapper | Capacitor (SPM flavor: `CapApp-SPM`, `capacitor-swift-pm`) |
| Xcode project | `ios/App/App.xcodeproj` (single `App` target) |
| Bundle identifier | `id.babymo.app` |
| Marketing version | `1.0` |
| Deployment target | iOS 15.0 |
| Device family | `1,2` (iPhone + iPad) — iPad is _not_ specifically designed, just allowed |
| Swift version | 5.0 |
| watchOS target | **None** |
| Widgets / complications | **None** |
| Backend / API | **None found** — fully offline, no accounts, no network calls |
| Auth | **None** |
| Persistence | Browser `localStorage` only (inside the WebView); no SwiftData/CoreData |
| Primary language | Indonesian (`lang="id"`), with `data-i18n` hooks present but not fully wired |

### Native code
- `ios/App/App/AppDelegate.swift` — standard Capacitor delegate **plus** a custom
  animated native splash overlay (dark-green bg, pulsing logo, gold dots). This is
  the only meaningful piece of native UI and encodes the brand palette in UIKit.
- Storyboards: `Main.storyboard` (Capacitor bridge VC), `LaunchScreen.storyboard`.

## 2. The web app (the real product)

`ios/App/App/public/` (~7.6 MB) is the actual application:

### Home shell — `index.html` (5-tab PWA)
A polished, iOS-styled single-page app with a bottom tab bar:
1. **Home** — hero + daily dua CTA, quick cards, learning rows
2. **Game** — grid of game "app icons"
3. **Companion / Sholat** — pray-with-Mo prayer companion
4. **Doa** — daily duas list
5. **About / Tentang**

It already defines a **complete brand design system** in CSS custom properties
(see §4) and apes Apple conventions (blur tab bar, squircle radii, safe-area insets).

### Content modules (11 HTML activities + companion)
| File | Module | Size |
|---|---|---|
| `babymo-doa-harian.html` | Daily duas (audio) | 51 KB |
| `babymo-dua-game.html` | Dua matching game | 31 KB |
| `babymo-hijaiyah.html` | Hijaiyah letter learning | 55 KB |
| `babymo-arabic-spelling.html` | Arabic spelling | 60 KB |
| `baby-mo-forehand-beat.html` | Rhythm/beat activity | 370 KB |
| `babymo-dreamtime.html` | Bedtime/story activity | 50 KB |
| `babymo-look-and-find.html` | Look-and-find game | 235 KB |
| `babymo-memory-match.html` | Memory match game | 281 KB |
| `babymo-puzzle.html` / `-puzzle2` / `-puzzle-katabaik` | Jigsaw puzzles | 0.4–1.0 MB |
| `babymo-pray-with-mo.html` | Guided prayer | 72 KB |
| `babymo-companion/index.html` | Prayer companion | — |

These are large, finished, interactive games. Rewriting them 1:1 in SwiftUI would be
a multi-month effort with high regression risk — they are the reuse opportunity.

## 3. Assets (brand & characters)

- **Logo**: `Logo_Baby_Mo_Transparant.png`, `Baby_Mo_Menyapa.png`, `babymo_running.png`
- **Mo character — emotions** (`babymo-companion/mo-assets/`): astagfirullah, excited,
  grateful, hopeful, praying, sad, sujood, surprised, thankful, waving (10 poses)
- **Mo character — prayer positions** (`mo-pray-assets/`): takbir, qiyam, ruku, itidal,
  sujud, sitting, tashahhud, + mat variants (11 poses)
- **Audio**: `Intro_Baby_Mo_v001_5.mp3` (intro music)
- **Fonts**: Nunito (UI) + Scheherazade New (Arabic), plus others, as `.woff2`
- Characters named in product brief (Baby Mo, Baby Ais, Adam, Abi) — only **Mo**
  has art assets present today.

## 4. Brand design tokens (extracted from `index.html`)

```
Background:  #0B1C12 (bg)  #0F2016 (elev)  #162014 (elev2)
Surface:     #1A2519       #22301F
Green:       #2C5A3E (green) #4A8860 (mid) #6DB882 (light) #1E3F2A (deep)
Gold:        #C89040 (gold) #E8B060 (light) #B8843A (soft)
Cream/text:  #F0E8D8 (cream) #9EA89C (dim) #5C6A5E (faint)
Accent:      #E07060 (red)  #7AB8D8 (blue)
Radii:       card 18 · card-lg 22 · icon 22 (squircle) · pill 999
Fonts:       Nunito (UI), Scheherazade New (Arabic)
```

This palette is the single source of truth for the native design system (§Phase 3).

## 5. Gaps vs. the target native ecosystem

| Needed | Status |
|---|---|
| Native SwiftUI iPhone app | Missing (WebView only) |
| Dedicated iPad experience | Missing |
| watchOS app | Missing |
| Shared Swift package (models/design/content) | Missing |
| SwiftData persistence | Missing |
| CloudKit / sync | Missing |
| WatchConnectivity | Missing |
| WidgetKit widgets / complications | Missing |
| Accounts / child profiles | Missing |
| Progress / streaks / achievements (durable) | Missing |
| Localization infrastructure (native) | Missing (web `data-i18n` only) |

## 6. Architectural decision

**Hybrid native ecosystem** (chosen):

- Build a **native SwiftUI shell** for iPhone & iPad — native Home, Islamic Learning
  hub, Games catalog, Stories, Character Collection, and Parent Dashboard — with a
  native design system, navigation, SwiftData models (profiles, progress, streaks,
  achievements), CloudKit sync, and WidgetKit widgets.
- **Embed the existing, finished HTML activities** through a native `WKWebView`
  "activity" wrapper (local bundle, offline). This preserves 100% of current
  functionality with zero regression and lets us replace individual activities with
  native SwiftUI versions incrementally where it adds value.
- Build a **standalone watchOS app** (native SwiftUI, no WebView) sharing the models
  and design tokens, syncing via WatchConnectivity + CloudKit, working offline.
- Shared code lives in a Swift package **`BabyMoKit`** (design tokens, SwiftData
  models, content catalog, localization, reusable components) consumed by every target.

Rationale: maximizes reuse of a large, polished web codebase; delivers genuine native
value (ecosystem, offline-durable data, Watch, widgets, parental controls) fast;
avoids a risky big-bang rewrite; keeps the Capacitor build intact as a fallback.

### Why not full SwiftUI rewrite now
The 11 games total several MB of mature interactive JS. Rewriting all of them before
shipping anything native would delay the ecosystem by months and risk regressions.
The hybrid path lets each game be nativized on its own schedule.

## 7. Preservation guarantees

- Original Capacitor app untouched on `backup/pre-native-20261107` (and `main`).
- Web assets reused as-is; nothing deleted or overwritten.
- New work isolated on `native-ecosystem`.
- No push to `main` without explicit approval.

## 8. Manual steps that will require the account holder

These cannot be fabricated and will be flagged in `DEVELOPMENT_STATUS.md`:
- Adding the native SwiftUI app target and watchOS target in Xcode (GUI action).
- Signing, provisioning, capabilities (CloudKit/iCloud/App Groups), App Store Connect.
- Physical-device testing where required (WatchConnectivity, haptics, audio).
