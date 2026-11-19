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
- **Prayer**: today's five times for the chosen city (same list and the exact same
  calculation as the Sholat tab: Kemenag RI, Subuh 20°, Isya 18°, Ashar Shafi'i; checked
  minute-for-minute against `www/bm-prayertimes.js` for 7 cities × 730 days), the next prayer
  big with a countdown and Mo, and an optional **"Wudu reminder"** 10 minutes before each
  prayer (local notifications, asks permission once). No GPS: the parent picks the city.
- **Ramadan**: day N of Ramadan, a big countdown to iftar (or to imsak at night) with Mo, the
  four Ramadan du'as in Mo's voice (intention, "I'm fasting", breaking the fast, after iftar),
  and optional suhoor (45 min before imsak) and iftar reminders. Outside Ramadan the tile
  shows "N days to go" and kids can practise the du'as. Imsak and Maghrib are the app's own
  numbers (checked against the JS for 3 cities × 730 days); Ramadan is found with the Umm
  al-Qura calendar, like the app (1 Ramadan 1448 = 8 Feb 2027).
- **Mo's pet**: Mimi the cat from Sahabat Hewan Mo, a daily check-in: Food (with
  Bismillah) → Water → Clean → Pat, with the app's own adab lines, wrist taps and a daily
  streak. Cat art exported from `www/farm/farm-kit.js`.
- **Watch-face complication** (`../BabyMoWatchWidget-src/`): the next prayer, e.g.
  "Ashar 14:58", in the circular, corner, inline and rectangular spots.
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

### Update 13 Nov: titles, move-to-count tasbih, shake-to-feed pet

- Every screen now draws its own title (game icon + bold white title) instead of the grey
  system title; the toggles and back button use the Baby Mo green (`AccentColor` in
  `BabyMoArt.xcassets`).
- **Tasbih**: count by moving the wrist (tap and the Digital Crown still work), a sound on
  each count (Mo says the dhikr · bead click · none), wrist taps on/off, and bedtime
  33·33·34 or after-prayer 33·33·33 — all under the ⚙︎ button.
- **Mo's pet**: shake the wrist 3 times to give food, water and clean; patting stays a
  gentle tap.

New files to add to the **BabyMoWatch Watch App** target (drag them in like before, Copy
items off, target = the watch app): `WristMotion.swift`, and in `Audio/`:
`t-subhanallah.mp3`, `t-alhamdulillah.mp3`, `t-allahuakbar.mp3`, `t-bead.wav`, `pet-pop.wav`.

So counting keeps going when the screen dims: select the watch target → **Signing &
Capabilities → + Capability → Background Modes** → tick **Session type: Mindfulness**.
(Without it, counting by movement works while the screen is on.)

### Watch-face complication (optional, after the app runs)

7. **File → New → Target… → watchOS → Widget Extension** → Product Name
   **BabyMoWatchWidget**, embed in **BabyMoWatch Watch App**, untick "Include Configuration
   App Intent" → Finish.
8. Delete Xcode's sample Swift file in the new widget folder and drag in
   `../BabyMoWatchWidget-src/PrayerWidget.swift` (target: the widget only).
9. Select `PrayerTimes.swift` and `WatchTheme.swift` → File inspector → **Target Membership**
   → also tick **BabyMoWatchWidget**.
10. So the complication sees the city chosen in the app: for both the watch app and the widget
    target, **Signing & Capabilities → + Capability → App Groups → +** →
    `group.id.babymo.app`. (Without it the complication uses Jakarta.)

### Update 20 Nov (version 1.2): Qibla, Wake up with Mo, Ramadan practice fast, Du'a now

What's new
- **Qibla with Mo** (`QiblaView.swift`): a dial that turns with the watch's compass; the 🕋 marker
  sits at the Qibla bearing for the city chosen in Prayer (no GPS — magnetic heading needs no
  permission). Facing the Qibla (±6°) lights the dial gold, Mo cheers and the wrist gets a tap.
  Shows the distance to Makkah. Watches without a compass (before Series 5) see the bearing.
- **Wake up with Mo** (`WakeUp.swift`): a morning alert on chosen days at a chosen time
  (03:00–10:55). Tapping it opens the waking-up du'a and Mo reads it in his voice. watchOS alerts
  can't play a custom voice, so the alert itself uses the normal sound and tap.
- **Ramadan practice fast** (`FastPractice.swift` screens, `FastStore.swift` data): on the Ramadan
  screen, "Zuhur" (half a day) or "Maghrib" (full) lights today's 🏮; tap an earlier lantern to
  fix a day. On 1–3 Shawwal the Ramadan screen shows the Eid card with all the lanterns.
- **Complications / Smart Stack** (`../BabyMoWatchWidget-src/`):
  - `RamadanWidget.swift` — "Ramadan day 12 · Iftar 17:52 · 🏮 9/30", a countdown before
    Ramadan, the Eid greeting after; opens the Ramadan screen.
  - `DuaNowWidget.swift` — "Du'a now" (waking up · riding · before sleep); it rises in the
    Smart Stack when the moment changes and opens that du'a.
- Home has two new tiles (Qibla, Wake up with Mo). Widgets and the wake-up alert open the right
  screen (`babymo://dua/<id>`, `babymo://qibla`, `babymo://ramadan`).

Add in Xcode (once, after `git pull`)
1. Drag `QiblaView.swift`, `WakeUp.swift`, `FastPractice.swift` and `FastStore.swift` onto the
   **BabyMoWatch Watch App** group (Copy items off, target = the watch app).
2. Drag `../BabyMoWatchWidget-src/RamadanWidget.swift` and `DuaNowWidget.swift` onto the
   **BabyMoWatchWidget** group (target = the widget only).
3. Select `FastStore.swift` and `WatchDuas.swift` → File inspector → **Target Membership** → also
   tick **BabyMoWatchWidget** (next to `PrayerTimes.swift` and `WatchTheme.swift`, which are already
   there).
4. The App Group `group.id.babymo.app` must be on both targets (step 10 above) so the Ramadan
   complication sees the lanterns and the city.
5. Set Version **1.2** and the new build number on the iPhone app, the watch app and the widget.

To try it in the simulator: **Features → Location** isn't needed; the compass only works on a real
watch (the simulator shows "move your wrist in a figure 8"). To see Ramadan early, change the
simulator's date to 8 Feb 2027.

If Xcode shows build errors, copy them to Claude and they will be fixed.

When the watch app ships with the iPhone app (same archive), App Store Connect picks it up
automatically; add a couple of watch screenshots there.
