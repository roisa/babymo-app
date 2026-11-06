import SwiftUI
import SwiftData
import BabyMoKit

@main
struct BabyMoApp: App {
    /// Shared SwiftData container for all Baby Mo models. CloudKit sync is added
    /// in Phase 7 by attaching a `ModelConfiguration(cloudKitDatabase:)`.
    let container: ModelContainer = {
        let schema = Schema([
            ChildProfile.self,
            ActivityRecord.self,
            EarnedAchievement.self
        ])
        let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        do {
            return try ModelContainer(for: schema, configurations: [config])
        } catch {
            // Fall back to in-memory so the app never hard-crashes on a store
            // migration problem; the user simply starts fresh.
            let mem = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
            return try! ModelContainer(for: schema, configurations: [mem])
        }
    }()

    var body: some Scene {
        WindowGroup {
            RootView()
                .tint(BabyMoColor.gold)
                .preferredColorScheme(.dark)
        }
        .modelContainer(container)
    }
}
