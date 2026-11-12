# Baby Mo for Apple Watch — version 1 sources

Ready-to-use code and art for the watch app, written from the mockup. It is **not part of
the Xcode project yet**, so the iPhone app builds exactly as before.

What's inside
- **Home**: Mo (upper body) says Assalamu'alaikum; tiles for *Du'a now* (picked by time
  of day), *All du'as* and *Tasbih*.
- **Du'as**: riding, leaving home, entering home, before sleeping, waking up. Mo's real
  voice (`Audio/*.mp3`, same files as the Doa Harian game), the word being read lights up
  gold, 2× repeat, meaning in ID/EN, a success tap on the wrist at the end.
- **Tasbih**: 33 Subḥānallāh · 33 Alḥamdulillāh · 34 Allāhu akbar (same as Doa Harian).
  Tap or turn the Digital Crown; beads light up around Mo, a click on the wrist each count,
  a stronger tap between sets, Mo cheers at the end.
- Indonesian when the watch language is Indonesian, English otherwise. Offline, no data
  leaves the watch, no permissions.
- Art: Baby Mo render 1 cut at the waist (`BabyMoArt.xcassets`), game icons from the app.

## Add it in Xcode (about 5 minutes)

1. Open `ios/App/App.xcodeproj`.
2. **File → New → Target… → watchOS → App** → Next.
   - Product Name: **BabyMoWatch**
   - Choose **Watch App for Existing iOS App**, iOS App: **App**
   - Interface SwiftUI, language Swift, no tests → Finish (Activate the scheme if asked).
3. In the new **BabyMoWatch Watch App** folder, **delete** Xcode's `ContentView.swift`,
   `BabyMoWatchApp.swift` and `Assets.xcassets` (Move to Trash).
4. Drag everything in this folder (`*.swift`, `BabyMoArt.xcassets`, `Audio`) onto the
   **BabyMoWatch Watch App** group. In the dialog: **Copy items if needed** off,
   **Create groups**, target **BabyMoWatch Watch App** only.
5. Select the watch target → **General** → Minimum Deployments **watchOS 10.0**.
   App Icon should be **AppIcon** (from `BabyMoArt.xcassets`).
6. Pick the **BabyMoWatch Watch App** scheme with a watch simulator and Run.

If Xcode shows build errors, copy them to Claude and they will be fixed.

When the watch app ships with the iPhone app (same archive), App Store Connect picks it up
automatically; add a couple of watch screenshots there.
