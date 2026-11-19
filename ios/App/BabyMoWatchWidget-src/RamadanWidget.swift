import WidgetKit
import SwiftUI

// Ramadan complication: "Ramadan day 12 · Iftar 17:52 · 🏮 9", a countdown before Ramadan and
// the Eid greeting with the practice-fast lanterns on 1–3 Shawwal. Tapping opens the Ramadan screen.
// Target Membership: also needs PrayerTimes.swift, WatchTheme.swift and FastStore.swift.

struct RamadanEntry: TimelineEntry {
    let date: Date
    let day: Int?          // 1…30 during Ramadan
    let eid: Bool
    let daysUntil: Int
    let imsak: Date?
    let iftar: Date?
    let lit: Int           // practice-fast days so far
    let length: Int
}

struct RamadanProvider: TimelineProvider {
    func placeholder(in context: Context) -> RamadanEntry {
        RamadanEntry(date: Date(), day: 12, eid: false, daysUntil: 0, imsak: nil,
                     iftar: Date().addingTimeInterval(3 * 3600), lit: 9, length: 30)
    }

    func getSnapshot(in context: Context, completion: @escaping (RamadanEntry) -> Void) {
        completion(entry(at: Date()))
    }

    /// Now, today's imsak and iftar, and midnight, so the text changes right on time.
    func getTimeline(in context: Context, completion: @escaping (Timeline<RamadanEntry>) -> Void) {
        let now = Date()
        var dates = [now]
        if let f = PrayerTimes.fastTimes(on: now, city: PrayerSettings.city) {
            dates += [f.imsak, f.iftar].filter { $0 > now }
        }
        let midnight = Calendar.current.startOfDay(for: now).addingTimeInterval(24 * 3600 + 60)
        dates.append(midnight)
        completion(Timeline(entries: dates.sorted().map { entry(at: $0) }, policy: .after(midnight)))
    }

    private func entry(at d: Date) -> RamadanEntry {
        let day = Ramadan.day(on: d)
        let f = day != nil ? PrayerTimes.fastTimes(on: d, city: PrayerSettings.city) : nil
        let year = FastPractice.hijriYear(on: d)
        return RamadanEntry(date: d, day: day, eid: Ramadan.eidDay(on: d) != nil,
                            daysUntil: Ramadan.daysUntil(from: d),
                            imsak: f?.imsak, iftar: f?.iftar,
                            lit: FastPractice.count(year: year), length: FastPractice.ramadanLength(year: year))
    }
}

private func hm(_ d: Date) -> String {
    let f = DateFormatter()
    f.locale = Locale(identifier: "en_US_POSIX")
    f.dateFormat = "HH:mm"
    return f.string(from: d)
}

struct RamadanComplicationView: View {
    @Environment(\.widgetFamily) private var family
    let entry: RamadanEntry

    /// "Buka 17:52" while fasting, "Sahur s/d 04:20" before imsak, nothing after iftar.
    private var nextLine: String? {
        if let im = entry.imsak, entry.date < im { return L("Sahur s/d \(hm(im))", "Suhoor until \(hm(im))") }
        if let ift = entry.iftar, entry.date < ift { return L("Buka \(hm(ift))", "Iftar \(hm(ift))") }
        return nil
    }
    private var title: String {
        if let d = entry.day { return L("Ramadan hari ke-\(d)", "Ramadan day \(d)") }
        if entry.eid { return L("Selamat Idul Fitri", "Eid Mubarak") }
        return L("Ramadan \(entry.daysUntil) hari lagi", "Ramadan in \(entry.daysUntil) days")
    }

    private var inlineText: String {
        let head: String
        if let d = entry.day { head = L("Hari \(d)", "Day \(d)") } else { head = title }
        if let n = nextLine { return "🌙 \(head) · \(n)" }
        return "🌙 \(title)"
    }

    var body: some View {
        switch family {
        case .accessoryCircular:
            VStack(spacing: 0) {
                Image(systemName: entry.eid ? "sparkles" : "moon.stars.fill").font(.system(size: 13, weight: .bold))
                Text(entry.day.map { "\($0)" } ?? (entry.eid ? "🎉" : "\(entry.daysUntil)"))
                    .font(.system(size: 15, weight: .heavy, design: .rounded)).minimumScaleFactor(0.6)
            }
            .widgetAccentable()
        case .accessoryCorner:
            Image(systemName: "moon.stars.fill")
                .font(.system(size: 18, weight: .bold))
                .widgetLabel(nextLine.map { "\(title) · \($0)" } ?? title)
        case .accessoryInline:
            Text(inlineText)
        default: // .accessoryRectangular
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 4) {
                    Image(systemName: "moon.stars.fill")
                    Text("Baby Mo · Ramadan").lineLimit(1)
                }
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .widgetAccentable()
                Text(title)
                    .font(.system(size: 17, weight: .heavy, design: .rounded))
                    .lineLimit(1).minimumScaleFactor(0.7)
                HStack(spacing: 6) {
                    if let n = nextLine { Text(n) }
                    if (entry.day != nil || entry.eid) && entry.lit > 0 { Text("🏮 \(entry.lit)/\(entry.length)") }
                    if entry.day == nil && !entry.eid { Text(L("Yuk siapkan doanya", "Get the du'as ready")) }
                }
                .font(.system(size: 12, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)
                .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

struct RamadanWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "BabyMoRamadan", provider: RamadanProvider()) { entry in
            RamadanComplicationView(entry: entry)
                .containerBackground(for: .widget) { Color.clear }
                .widgetURL(URL(string: "babymo://ramadan"))
        }
        .configurationDisplayName("Baby Mo · Ramadan")
        .description(L("Hari Ramadan, waktu sahur & buka, dan lentera puasa latihan.", "Ramadan day, suhoor & iftar times and the practice-fast lanterns."))
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline, .accessoryCorner])
    }
}
