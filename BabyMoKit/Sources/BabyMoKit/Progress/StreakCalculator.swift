import Foundation

/// Pure, dependency-free streak math so it can be unit-tested and reused
/// identically on iPhone, iPad, and Watch.
public enum StreakCalculator {

    /// Current consecutive-day streak ending today (or yesterday — a streak is
    /// still "alive" if the child was active yesterday but not yet today).
    ///
    /// - Parameters:
    ///   - activeDays: dates on which at least one activity was completed
    ///     (any time components are ignored).
    ///   - today: reference "now" (injected for testability).
    ///   - calendar: calendar used for day math.
    public static func currentStreak(
        activeDays: [Date],
        today: Date,
        calendar: Calendar = .current
    ) -> Int {
        let days = Set(activeDays.map { calendar.startOfDay(for: $0) })
        guard !days.isEmpty else { return 0 }

        let startToday = calendar.startOfDay(for: today)

        // Anchor: today if active today, else yesterday (grace day), else no streak.
        var cursor: Date
        if days.contains(startToday) {
            cursor = startToday
        } else if let yesterday = calendar.date(byAdding: .day, value: -1, to: startToday),
                  days.contains(yesterday) {
            cursor = yesterday
        } else {
            return 0
        }

        var streak = 0
        while days.contains(cursor) {
            streak += 1
            guard let prev = calendar.date(byAdding: .day, value: -1, to: cursor) else { break }
            cursor = prev
        }
        return streak
    }

    /// Longest streak ever recorded in the active-day set.
    public static func longestStreak(
        activeDays: [Date],
        calendar: Calendar = .current
    ) -> Int {
        let days = activeDays.map { calendar.startOfDay(for: $0) }.sorted()
        guard !days.isEmpty else { return 0 }

        var longest = 1
        var run = 1
        for i in 1..<days.count {
            if days[i] == days[i - 1] { continue } // duplicate day
            if let next = calendar.date(byAdding: .day, value: 1, to: days[i - 1]),
               next == days[i] {
                run += 1
            } else {
                run = 1
            }
            longest = max(longest, run)
        }
        return longest
    }
}
