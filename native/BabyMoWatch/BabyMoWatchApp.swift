import SwiftUI
import SwiftData
import BabyMoKit

@main
struct BabyMoWatchApp: App {
    /// CloudKit-synced when entitlements allow, else local — the Watch always
    /// works standalone (brief §6).
    let container = BabyMoModelContainer.make()

    var body: some Scene {
        WindowGroup {
            WatchRootView()
                .tint(BabyMoColor.gold)
        }
        .modelContainer(container)
    }
}
