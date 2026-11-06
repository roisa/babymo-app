# Baby Mo — Development Status

_Living document. Last updated: 2026-11-07_

Branch: `native-ecosystem` · Backup: `backup/pre-native-20261107` · Do **not** push to `main` without approval.

## Architecture (decided in Phase 1)
Hybrid native Apple ecosystem: native SwiftUI shell (iPhone/iPad) + standalone watchOS
app, sharing a `BabyMoKit` Swift package. Existing HTML games embedded via a native
`WKWebView` activity wrapper and nativized incrementally. Full rationale in
[`TECHNICAL_AUDIT.md`](TECHNICAL_AUDIT.md).

## Build status
| Target | State |
|---|---|
| Capacitor `App` (existing) | ✅ Builds (unchanged, preserved) |
| `BabyMoKit` package | ⏳ Starting |
| Native iOS app target | ⛔ Not yet created (needs Xcode target add) |
| watchOS app target | ⛔ Not yet created (needs Xcode target add) |

## Phases
- [~] **Phase 1 — Audit & architecture** — audit written, branches created, decision recorded. _In progress → wrapping up._
- [ ] **Phase 2 — Xcode project & targets** — `BabyMoKit` package + native/watch targets.
- [ ] **Phase 3 — Shared design system & assets**
- [ ] **Phase 4 — iPhone app**
- [ ] **Phase 5 — iPad experience**
- [ ] **Phase 6 — Apple Watch app**
- [ ] **Phase 7 — Backend, auth & sync**
- [ ] **Phase 8–10 — Polish, testing, App Store prep**

## Completed
- Authenticated GitHub access (`roisa/babymo-app`).
- Created `backup/pre-native-20261107` from `0a9b038` (preserves shipping Capacitor app).
- Created working branch `native-ecosystem`.
- Full repository audit → `TECHNICAL_AUDIT.md`.
- Extracted brand design tokens from `index.html`.

## Current task
- Scaffolding the `BabyMoKit` shared Swift package (design tokens + core models).

## Remaining (high level)
Everything in Phases 2–10.

## Known bugs / risks
- Adding app & watch targets to the Capacitor `pbxproj` by hand is risky; prefer the
  Xcode GUI "Add Target" flow (documented when reached).
- Characters Baby Ais / Adam / Abi have no art assets yet — collection will show
  "coming soon" states until art is provided.

## Needs the account holder (manual / cannot be automated)
- [ ] Add native SwiftUI app target + watchOS target in Xcode.
- [ ] Enable iCloud/CloudKit + App Groups capabilities & signing.
- [ ] App Store Connect records, screenshots, review metadata.
- [ ] Physical-device testing for Watch connectivity.

## Next steps
1. Create `BabyMoKit` package with design system (ported tokens) + SwiftData models.
2. Build the package to verify it compiles.
3. Document exact Xcode steps to add the native iOS + watchOS targets.
