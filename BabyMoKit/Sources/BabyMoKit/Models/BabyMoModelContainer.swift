import Foundation
import SwiftData

/// Builds the app's ModelContainer with graceful degradation:
/// CloudKit-synced → local-only → in-memory.
///
/// `.automatic` picks up the target's first iCloud container entitlement when
/// present; when the entitlement/capability is missing (e.g. before the account
/// holder enables iCloud in Signing & Capabilities) container creation throws
/// and we fall back to a local store, so the app always works offline-first.
public enum BabyMoModelContainer {
    public static let schema = Schema([
        ChildProfile.self,
        ActivityRecord.self,
        EarnedAchievement.self
    ])

    public static func make(inMemory: Bool = false) -> ModelContainer {
        if inMemory {
            return memoryContainer()
        }

        // 1. CloudKit-backed private database, if entitlements allow.
        if let synced = try? ModelContainer(
            for: schema,
            configurations: [ModelConfiguration(schema: schema, cloudKitDatabase: .automatic)]
        ) {
            return synced
        }

        // 2. Plain local store (offline-first).
        if let local = try? ModelContainer(
            for: schema,
            configurations: [ModelConfiguration(schema: schema, cloudKitDatabase: .none)]
        ) {
            return local
        }

        // 3. Last resort so the app never hard-crashes on a store problem.
        return memoryContainer()
    }

    private static func memoryContainer() -> ModelContainer {
        let mem = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
        return try! ModelContainer(for: schema, configurations: [mem])
    }
}
