import SwiftUI
import SwiftData
import BabyMoKit

@main
struct BabyMoApp: App {
    /// Shared container: CloudKit-synced when the iCloud capability is enabled,
    /// otherwise a local offline store (see BabyMoModelContainer).
    let container = BabyMoModelContainer.make()

    var body: some Scene {
        WindowGroup {
            RootView()
                .tint(BabyMoColor.gold)
                .preferredColorScheme(.dark)
        }
        .modelContainer(container)
    }
}
