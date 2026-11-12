import SwiftUI

// Baby Mo for Apple Watch — version 1.
// Home → Du'a moments (Mo's real voice, word-by-word highlight) and the bedtime tasbih.
// Everything is bundled and offline; no data leaves the watch.

@main
struct BabyMoWatchApp: App {
    var body: some Scene {
        WindowGroup {
            NavigationStack {
                HomeView()
            }
        }
    }
}
