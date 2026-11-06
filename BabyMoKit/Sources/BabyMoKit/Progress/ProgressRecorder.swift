import Foundation
import SwiftData

/// Shared progress + achievement writing used by every platform (iPhone, iPad,
/// Watch) so the rules stay identical everywhere.
public enum ProgressRecorder {

    /// Record a completed activity session and update the profile's totals,
    /// active days, and achievements.
    @discardableResult
    public static func record(
        activityID: String,
        seconds: Int,
        for profile: ChildProfile,
        completed: Bool = true,
        score: Int? = nil,
        in context: ModelContext,
        now: Date = .now
    ) -> ActivityRecord {
        let record = ActivityRecord(
            activityID: activityID,
            completedAt: now,
            durationSeconds: seconds,
            completed: completed,
            score: score
        )
        record.profile = profile
        context.insert(record)

        profile.totalLearningSeconds += seconds
        let day = Calendar.current.startOfDay(for: now)
        if !profile.activeDays.contains(day) { profile.activeDays.append(day) }

        evaluateAchievements(for: profile, in: context, now: now)
        try? context.save()
        return record
    }

    /// A tiny Watch challenge counts as a short completed "hijaiyah" session.
    public static func recordWatchChallenge(
        for profile: ChildProfile,
        in context: ModelContext,
        now: Date = .now
    ) {
        record(activityID: "hijaiyah", seconds: 30, for: profile, completed: true, in: context, now: now)
    }

    /// Award any milestone the profile now qualifies for but hasn't earned yet.
    public static func evaluateAchievements(for profile: ChildProfile, in context: ModelContext, now: Date = .now) {
        let earned = Set(profile.achievementsList.map(\.achievementID))
        let completedRecords = profile.recordsList.filter(\.completed)
        let completedCount = completedRecords.count
        let streak = StreakCalculator.currentStreak(activeDays: profile.activeDays, today: now)

        var toAward: [String] = []
        if completedCount >= 1 { toAward.append("first-step") }
        if streak >= 3 { toAward.append("streak-3") }
        if streak >= 7 { toAward.append("streak-7") }
        if completedCount >= 10 { toAward.append("ten-activities") }
        if completedRecords.contains(where: { $0.activityID == "hijaiyah" }) {
            toAward.append("hijaiyah-master")
        }
        if completedRecords.filter({ $0.activityID == "doa-harian" }).count >= 3 {
            toAward.append("dua-devotee")
        }

        for id in toAward where !earned.contains(id) {
            let achievement = EarnedAchievement(achievementID: id, earnedAt: now)
            achievement.profile = profile
            context.insert(achievement)
        }
    }
}
