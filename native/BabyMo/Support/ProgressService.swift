import Foundation
import SwiftData
import BabyMoKit

/// iOS-side convenience over the shared `ProgressRecorder`, taking rich
/// `LearningActivity` values from the catalog.
enum ProgressService {
    static func record(
        activity: LearningActivity,
        seconds: Int,
        for profile: ChildProfile,
        completed: Bool = true,
        score: Int? = nil,
        in context: ModelContext
    ) {
        ProgressRecorder.record(
            activityID: activity.id,
            seconds: seconds,
            for: profile,
            completed: completed,
            score: score,
            in: context
        )
    }

    static func currentStreak(for profile: ChildProfile, now: Date = .now) -> Int {
        StreakCalculator.currentStreak(activeDays: profile.activeDays, today: now)
    }
}
