import Foundation
import SwiftData

// CloudKit compatibility rules (Phase 7): SwiftData models that sync through
// CloudKit must not use `@Attribute(.unique)`, must give every attribute an
// inline default, and must keep relationships optional. The `id` fields remain
// logically unique — merge code matches on them explicitly.

/// A child's profile. A family (device/iCloud account) can have several.
@Model
public final class ChildProfile {
    public var id: UUID = UUID()
    public var name: String = ""
    /// Age in years at profile creation; used to tune difficulty/ordering.
    public var age: Int = 4
    /// Which cast member the child picked as their buddy.
    public var buddyRaw: String = "mo"
    public var createdAt: Date = Date.now
    /// Total seconds spent in learning activities (durable, cross-device).
    public var totalLearningSeconds: Int = 0
    /// Calendar dates (startOfDay) on which the child completed ≥1 activity.
    public var activeDays: [Date] = []

    @Relationship(deleteRule: .cascade, inverse: \ActivityRecord.profile)
    public var records: [ActivityRecord]? = []

    @Relationship(deleteRule: .cascade, inverse: \EarnedAchievement.profile)
    public var achievements: [EarnedAchievement]? = []

    public init(
        id: UUID = UUID(),
        name: String,
        age: Int,
        buddy: BabyMoCharacter = .mo,
        createdAt: Date = .now
    ) {
        self.id = id
        self.name = name
        self.age = age
        self.buddyRaw = buddy.rawValue
        self.createdAt = createdAt
        self.totalLearningSeconds = 0
        self.activeDays = []
        self.records = []
        self.achievements = []
    }

    public var buddy: BabyMoCharacter {
        get { BabyMoCharacter(rawValue: buddyRaw) ?? .mo }
        set { buddyRaw = newValue.rawValue }
    }

    /// Non-optional conveniences over the CloudKit-required optional relationships.
    public var recordsList: [ActivityRecord] { records ?? [] }
    public var achievementsList: [EarnedAchievement] { achievements ?? [] }
}

/// One completed (or attempted) run of a learning activity.
@Model
public final class ActivityRecord {
    public var id: UUID = UUID()
    /// Stable id from `ActivityCatalog` (e.g. "hijaiyah").
    public var activityID: String = ""
    public var completedAt: Date = Date.now
    public var durationSeconds: Int = 0
    public var completed: Bool = false
    /// Optional score for games (0–100), nil for non-scored activities.
    public var score: Int?

    public var profile: ChildProfile?

    public init(
        id: UUID = UUID(),
        activityID: String,
        completedAt: Date = .now,
        durationSeconds: Int,
        completed: Bool,
        score: Int? = nil
    ) {
        self.id = id
        self.activityID = activityID
        self.completedAt = completedAt
        self.durationSeconds = durationSeconds
        self.completed = completed
        self.score = score
    }
}

/// An achievement the child has unlocked.
@Model
public final class EarnedAchievement {
    public var id: UUID = UUID()
    /// Stable id from `AchievementCatalog`.
    public var achievementID: String = ""
    public var earnedAt: Date = Date.now

    public var profile: ChildProfile?

    public init(id: UUID = UUID(), achievementID: String, earnedAt: Date = .now) {
        self.id = id
        self.achievementID = achievementID
        self.earnedAt = earnedAt
    }
}
