import Testing
import Foundation
@testable import BabyMoKit

@Suite("Catalog")
struct CatalogTests {
    @Test("Every activity has a unique id")
    func uniqueIDs() {
        let ids = ActivityCatalog.all.map(\.id)
        let unique = Set(ids).count
        #expect(unique == ids.count)
    }

    @Test("Every embedded activity names a web file")
    func embeddedHaveHTML() {
        for activity in ActivityCatalog.all {
            if case .embeddedWeb(let html) = activity.kind {
                let ok = !html.isEmpty && html.hasSuffix(".html")
                #expect(ok)
            }
        }
    }

    @Test("Watch activities are a subset flagged watchFriendly")
    func watchSubset() {
        let allFlagged = ActivityCatalog.watchActivities.allSatisfy(\.watchFriendly)
        let nonEmpty = !ActivityCatalog.watchActivities.isEmpty
        #expect(allFlagged)
        #expect(nonEmpty)
    }

    @Test("Prayer sequence covers a full rak'ah")
    func rakah() {
        let seq = MoPrayerPose.rakahSequence
        let startsWithTakbir = seq.first == .takbir
        let hasRuku = seq.contains(.ruku)
        let hasTashahhud = seq.contains(.tashahhud)
        #expect(startsWithTakbir)
        #expect(hasRuku)
        #expect(hasTashahhud)
    }
}

@Suite("Streaks")
struct StreakTests {
    private let cal = Calendar(identifier: .gregorian)

    private func date(_ y: Int, _ m: Int, _ d: Int) -> Date {
        cal.date(from: DateComponents(year: y, month: m, day: d))!
    }

    @Test("No active days means no streak")
    func empty() {
        let n = StreakCalculator.currentStreak(activeDays: [], today: date(2026, 11, 7), calendar: cal)
        #expect(n == 0)
    }

    @Test("Consecutive days ending today count fully")
    func consecutiveToday() {
        let days = [date(2026, 11, 5), date(2026, 11, 6), date(2026, 11, 7)]
        let n = StreakCalculator.currentStreak(activeDays: days, today: date(2026, 11, 7), calendar: cal)
        #expect(n == 3)
    }

    @Test("Yesterday-only still counts as a live streak (grace day)")
    func graceDay() {
        let days = [date(2026, 11, 5), date(2026, 11, 6)]
        let n = StreakCalculator.currentStreak(activeDays: days, today: date(2026, 11, 7), calendar: cal)
        #expect(n == 2)
    }

    @Test("A gap breaks the streak")
    func gap() {
        let days = [date(2026, 11, 1), date(2026, 11, 2), date(2026, 11, 7)]
        let n = StreakCalculator.currentStreak(activeDays: days, today: date(2026, 11, 7), calendar: cal)
        #expect(n == 1)
    }

    @Test("Duplicate days do not inflate the streak")
    func duplicates() {
        let days = [date(2026, 11, 7), date(2026, 11, 7), date(2026, 11, 6)]
        let n = StreakCalculator.currentStreak(activeDays: days, today: date(2026, 11, 7), calendar: cal)
        #expect(n == 2)
    }

    @Test("Longest streak is found across history")
    func longest() {
        let days = [date(2026, 10, 1), date(2026, 10, 2), date(2026, 10, 3), date(2026, 10, 10)]
        let n = StreakCalculator.longestStreak(activeDays: days, calendar: cal)
        #expect(n == 3)
    }
}
