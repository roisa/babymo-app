import WidgetKit
import SwiftUI

// Watch-face complication: the next prayer for the city chosen in the watch app.
// Also add ../BabyMoWatch-src/PrayerTimes.swift and ../BabyMoWatch-src/WatchTheme.swift to this
// widget target (Target Membership) — see ../BabyMoWatch-src/README.md.

struct PrayerEntry: TimelineEntry {
    let date: Date
    let prayer: Prayer
    let time: Date
    let city: String
}

struct PrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(date: Date(), prayer: .asr, time: Date().addingTimeInterval(2 * 3600), city: "Jakarta")
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(entry(at: Date()))
    }

    /// One entry now and one at every prayer time today and tomorrow, so the
    /// complication flips to the following prayer right on time.
    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let city = PrayerSettings.city
        let now = Date()
        var entries = [entry(at: now)]
        for day in 0...1 {
            guard let d = Calendar.current.date(byAdding: .day, value: day, to: now) else { continue }
            for (_, t) in PrayerTimes.times(on: d, city: city) where t > now {
                entries.append(entry(at: t))
            }
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }

    private func entry(at d: Date) -> PrayerEntry {
        let city = PrayerSettings.city
        let next = PrayerTimes.next(after: d, city: city) ?? (.fajr, d)
        return PrayerEntry(date: d, prayer: next.0, time: next.1, city: city.name)
    }
}

private func hhmm(_ d: Date) -> String {
    let f = DateFormatter()
    f.locale = Locale(identifier: "en_US_POSIX")
    f.dateFormat = "HH:mm"
    return f.string(from: d)
}

struct PrayerComplicationView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PrayerEntry

    var body: some View {
        switch family {
        case .accessoryCircular:
            VStack(spacing: 0) {
                Image(systemName: entry.prayer.symbol).font(.system(size: 13, weight: .bold))
                Text(hhmm(entry.time)).font(.system(size: 12, weight: .heavy, design: .rounded)).minimumScaleFactor(0.7)
            }
            .widgetAccentable()
        case .accessoryCorner:
            Image(systemName: entry.prayer.symbol)
                .font(.system(size: 18, weight: .bold))
                .widgetLabel("\(entry.prayer.name) \(hhmm(entry.time))")
        case .accessoryInline:
            Text("\(entry.prayer.name) \(hhmm(entry.time))")
        default: // .accessoryRectangular
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 4) {
                    Image(systemName: entry.prayer.symbol)
                    Text("Baby Mo · \(entry.city)").lineLimit(1)
                }
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .widgetAccentable()
                Text("\(entry.prayer.name) \(hhmm(entry.time))")
                    .font(.system(size: 19, weight: .heavy, design: .rounded))
                Text(entry.time, style: .relative)
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

struct PrayerWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "BabyMoPrayer", provider: PrayerProvider()) { entry in
            PrayerComplicationView(entry: entry)
                .containerBackground(for: .widget) { Color.clear }
        }
        .configurationDisplayName(L("Baby Mo · Sholat", "Baby Mo · Prayer"))
        .description(L("Sholat berikutnya untuk kotamu.", "The next prayer for your city."))
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline, .accessoryCorner])
    }
}

@main
struct BabyMoWidgets: WidgetBundle {
    var body: some Widget {
        PrayerWidget()
    }
}
