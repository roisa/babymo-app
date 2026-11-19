import Foundation
import WidgetKit

/// Ramadan practice fast (puasa latihan): little ones practise fasting their own way — half a day
/// (until zuhur, "puasa bedug") or until maghrib. Each day lights a lantern in a row of 29–30, like
/// the "Ramadan day N" card in the app. Effort counts, not perfection: there is no "missed" mark.
/// Saved on the watch in the App Group, so the Ramadan complication can show the lanterns too.
enum FastPractice {
    enum Level: Int { case off = 0, half = 1, full = 2 }
    private static var store: UserDefaults { PrayerSettings.store }

    static func hijriYear(on date: Date = Date()) -> Int {
        Ramadan.hijri.component(.year, from: date)
    }
    private static func key(_ year: Int) -> String { "bm_fast_\(year)" }

    static func levels(year: Int = hijriYear()) -> [Int: Level] {
        let raw = store.dictionary(forKey: key(year)) as? [String: Int] ?? [:]
        var out: [Int: Level] = [:]
        for (k, v) in raw { if let d = Int(k), let l = Level(rawValue: v) { out[d] = l } }
        return out
    }

    static func set(_ level: Level, day: Int, year: Int = hijriYear()) {
        var raw = store.dictionary(forKey: key(year)) as? [String: Int] ?? [:]
        raw[String(day)] = level == .off ? nil : level.rawValue
        store.set(raw, forKey: key(year))
        WidgetCenter.shared.reloadAllTimelines()
    }

    /// Days practised this Ramadan (half or full).
    static func count(year: Int = hijriYear()) -> Int { levels(year: year).values.filter { $0 != .off }.count }

    /// Length of this year's Ramadan (29 or 30), from the Umm al-Qura calendar.
    static func ramadanLength(year: Int = hijriYear()) -> Int {
        var c = DateComponents()
        c.year = year; c.month = 9; c.day = 1
        guard let first = Ramadan.hijri.date(from: c),
              let range = Ramadan.hijri.range(of: .day, in: .month, for: first) else { return 30 }
        return range.count
    }
}

extension Ramadan {
    /// 1…3 during the first three days of Shawwal (Idul Fitri), nil otherwise.
    static func eidDay(on date: Date = Date()) -> Int? {
        let c = hijri.dateComponents([.month, .day], from: date)
        return c.month == 10 && (c.day ?? 99) <= 3 ? c.day : nil
    }
}
