import SwiftUI
import SwiftData
import BabyMoKit

@main
struct BabyMoWatchApp: App {
    let container: ModelContainer = {
        let schema = Schema([ChildProfile.self, ActivityRecord.self, EarnedAchievement.self])
        let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        if let c = try? ModelContainer(for: schema, configurations: [config]) { return c }
        let mem = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        return try! ModelContainer(for: schema, configurations: [mem])
    }()

    var body: some Scene {
        WindowGroup {
            WatchRootView()
                .tint(BabyMoColor.gold)
        }
        .modelContainer(container)
    }
}
