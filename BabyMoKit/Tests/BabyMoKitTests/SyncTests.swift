import Testing
import Foundation
import SwiftData
@testable import BabyMoKit

@Suite("Profile sync & progress recording")
struct SyncTests {
    private let cal = Calendar(identifier: .gregorian)

    private func date(_ y: Int, _ m: Int, _ d: Int) -> Date {
        cal.date(from: DateComponents(year: y, month: m, day: d))!
    }

    private func makeContext() -> ModelContext {
        ModelContext(BabyMoModelContainer.make(inMemory: true))
    }

    @Test("Merge unions active days and keeps max totals")
    func mergeAggregates() {
        let context = makeContext()
        let profile = ChildProfile(name: "Aisha", age: 5)
        profile.activeDays = [date(2026, 11, 5)]
        profile.totalLearningSeconds = 600
        context.insert(profile)

        let snapshot = ProfileSyncSnapshot(
            profileID: UUID(),
            name: "Aisha",
            age: 5,
            buddy: "mo",
            totalLearningSeconds: 400,
            activeDays: [date(2026, 11, 5), date(2026, 11, 6)],
            achievements: [:],
            updatedAt: date(2026, 11, 6)
        )
        ProfileSync.merge(snapshot, into: profile, in: context, calendar: cal)

        #expect(profile.activeDays.count == 2)       // union
        #expect(profile.totalLearningSeconds == 600) // max, no double count
    }

    @Test("Merge unions achievements keeping earliest date")
    func mergeAchievements() {
        let context = makeContext()
        let profile = ChildProfile(name: "Umar", age: 6)
        context.insert(profile)
        let local = EarnedAchievement(achievementID: "first-step", earnedAt: date(2026, 11, 6))
        local.profile = profile
        context.insert(local)

        let snapshot = ProfileSyncSnapshot(
            profileID: UUID(), name: "Umar", age: 6, buddy: "mo",
            totalLearningSeconds: 0, activeDays: [],
            achievements: [
                "first-step": date(2026, 11, 4),   // earlier than local
                "streak-3": date(2026, 11, 6)      // new
            ],
            updatedAt: date(2026, 11, 6)
        )
        ProfileSync.merge(snapshot, into: profile, in: context, calendar: cal)

        let byID = Dictionary(uniqueKeysWithValues: profile.achievementsList.map { ($0.achievementID, $0.earnedAt) })
        #expect(byID.count == 2)
        #expect(byID["first-step"] == date(2026, 11, 4)) // earliest wins
        #expect(byID["streak-3"] != nil)
    }

    @Test("Watch placeholder identity is replaced; real identity is not")
    func mergeIdentity() {
        let context = makeContext()
        let placeholder = ChildProfile(name: "Teman Mo", age: 4)
        context.insert(placeholder)

        let snapshot = ProfileSyncSnapshot(
            profileID: UUID(), name: "Fatimah", age: 7, buddy: "mo",
            totalLearningSeconds: 0, activeDays: [], achievements: [:],
            updatedAt: date(2026, 11, 6)
        )
        ProfileSync.merge(snapshot, into: placeholder, in: context, calendar: cal)
        #expect(placeholder.name == "Fatimah")

        // A real name must never be overwritten by a later snapshot.
        let real = ChildProfile(name: "Hasan", age: 5)
        context.insert(real)
        ProfileSync.merge(snapshot, into: real, in: context, calendar: cal)
        #expect(real.name == "Hasan")
    }

    @Test("Snapshot round-trips through Codable")
    func snapshotCodable() throws {
        let original = ProfileSyncSnapshot(
            profileID: UUID(), name: "Zaid", age: 4, buddy: "mo",
            totalLearningSeconds: 120, activeDays: [date(2026, 11, 7)],
            achievements: ["first-step": date(2026, 11, 7)],
            updatedAt: date(2026, 11, 7)
        )
        let data = try JSONEncoder().encode(original)
        let decoded = try JSONDecoder().decode(ProfileSyncSnapshot.self, from: data)
        #expect(decoded == original)
    }

    @Test("Recording an activity updates totals, days, and awards first-step")
    func recordActivity() {
        let context = makeContext()
        let profile = ChildProfile(name: "Bilal", age: 5)
        context.insert(profile)

        ProgressRecorder.record(
            activityID: "hijaiyah",
            seconds: 120,
            for: profile,
            in: context,
            now: date(2026, 11, 7)
        )

        #expect(profile.totalLearningSeconds == 120)
        #expect(profile.activeDays.count == 1)
        let earned = Set(profile.achievementsList.map(\.achievementID))
        #expect(earned.contains("first-step"))
        #expect(earned.contains("hijaiyah-master"))
    }

    @Test("Achievements are not duplicated on repeat evaluation")
    func noDuplicateAchievements() {
        let context = makeContext()
        let profile = ChildProfile(name: "Noor", age: 5)
        context.insert(profile)

        ProgressRecorder.record(activityID: "puzzle", seconds: 60, for: profile, in: context, now: date(2026, 11, 7))
        ProgressRecorder.record(activityID: "puzzle", seconds: 60, for: profile, in: context, now: date(2026, 11, 7))

        let firstSteps = profile.achievementsList.filter { $0.achievementID == "first-step" }
        #expect(firstSteps.count == 1)
    }
}
