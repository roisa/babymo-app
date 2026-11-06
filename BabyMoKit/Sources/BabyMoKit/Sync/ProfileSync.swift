import Foundation
import SwiftData

/// Compact, codable snapshot of a profile exchanged between iPhone and Watch.
/// Intentionally aggregate-only (days, totals, achievements) — individual
/// activity records stay on the device that produced them; CloudKit is the
/// durable cross-device store for full history.
public struct ProfileSyncSnapshot: Codable, Sendable, Equatable {
    public var profileID: UUID
    public var name: String
    public var age: Int
    public var buddy: String
    public var totalLearningSeconds: Int
    public var activeDays: [Date]
    /// achievementID → earnedAt
    public var achievements: [String: Date]
    public var updatedAt: Date

    public init(
        profileID: UUID,
        name: String,
        age: Int,
        buddy: String,
        totalLearningSeconds: Int,
        activeDays: [Date],
        achievements: [String: Date],
        updatedAt: Date
    ) {
        self.profileID = profileID
        self.name = name
        self.age = age
        self.buddy = buddy
        self.totalLearningSeconds = totalLearningSeconds
        self.activeDays = activeDays
        self.achievements = achievements
        self.updatedAt = updatedAt
    }
}

public enum ProfileSync {

    public static func snapshot(of profile: ChildProfile, now: Date = .now) -> ProfileSyncSnapshot {
        var achievements: [String: Date] = [:]
        for a in profile.achievementsList {
            achievements[a.achievementID] = a.earnedAt
        }
        return ProfileSyncSnapshot(
            profileID: profile.id,
            name: profile.name,
            age: profile.age,
            buddy: profile.buddyRaw,
            totalLearningSeconds: profile.totalLearningSeconds,
            activeDays: profile.activeDays,
            achievements: achievements,
            updatedAt: now
        )
    }

    /// Merge a received snapshot into a local profile. Conflict policy:
    /// - activeDays: set union (a day active anywhere is active everywhere)
    /// - totalLearningSeconds: max (monotonic counter, avoids double-count)
    /// - achievements: union, keeping the earliest earn date
    /// - name/age/buddy: taken from the snapshot only if it is newer than the
    ///   local profile's creation and non-empty (the iPhone is authoritative
    ///   for identity; the Watch's auto-created "Teman Mo" never overwrites it).
    public static func merge(
        _ snapshot: ProfileSyncSnapshot,
        into profile: ChildProfile,
        in context: ModelContext,
        calendar: Calendar = .current
    ) {
        // Identity: only adopt if the local profile is a placeholder.
        if profile.name.isEmpty || profile.name == "Teman Mo", !snapshot.name.isEmpty {
            profile.name = snapshot.name
            profile.age = snapshot.age
            profile.buddyRaw = snapshot.buddy
        }

        // Active days: union at day granularity.
        var days = Set(profile.activeDays.map { calendar.startOfDay(for: $0) })
        for d in snapshot.activeDays { days.insert(calendar.startOfDay(for: d)) }
        profile.activeDays = days.sorted()

        // Totals: monotonic max.
        profile.totalLearningSeconds = max(profile.totalLearningSeconds, snapshot.totalLearningSeconds)

        // Achievements: union, earliest date wins.
        let existing = Dictionary(
            uniqueKeysWithValues: profile.achievementsList.map { ($0.achievementID, $0) }
        )
        for (id, earnedAt) in snapshot.achievements {
            if let current = existing[id] {
                if earnedAt < current.earnedAt { current.earnedAt = earnedAt }
            } else {
                let earned = EarnedAchievement(achievementID: id, earnedAt: earnedAt)
                earned.profile = profile
                context.insert(earned)
            }
        }

        try? context.save()
    }
}
