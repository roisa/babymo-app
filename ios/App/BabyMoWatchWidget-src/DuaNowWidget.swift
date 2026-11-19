import WidgetKit
import SwiftUI

// "Du'a for now" for the Smart Stack and watch faces: the waking-up du'a in the morning, the riding
// du'a during the day, the bedtime du'a in the evening (same rule as "Du'a now" in the app). It rises
// in the Smart Stack when the moment changes; tapping it opens that du'a.
// Target Membership: also needs WatchDuas.swift and WatchTheme.swift.

struct DuaNowEntry: TimelineEntry {
    let date: Date
    let duaId: String
    let relevance: TimelineEntryRelevance?
}

struct DuaNowProvider: TimelineProvider {
    func placeholder(in context: Context) -> DuaNowEntry {
        DuaNowEntry(date: Date(), duaId: "wakeup", relevance: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (DuaNowEntry) -> Void) {
        completion(DuaNowEntry(date: Date(), duaId: WatchDuas.forTime(Date()).id, relevance: nil))
    }

    /// One entry now and one at each switch (04:00, 09:00, 19:00) for the next 24 hours. Each new
    /// moment is relevant for its first hour, so the Smart Stack brings it to the top then.
    func getTimeline(in context: Context, completion: @escaping (Timeline<DuaNowEntry>) -> Void) {
        let cal = Calendar.current
        let now = Date()
        var entries = [DuaNowEntry(date: now, duaId: WatchDuas.forTime(now).id, relevance: TimelineEntryRelevance(score: 10))]
        for dayOffset in 0...1 {
            guard let base = cal.date(byAdding: .day, value: dayOffset, to: cal.startOfDay(for: now)) else { continue }
            for h in [4, 9, 19] {
                guard let t = cal.date(byAdding: .hour, value: h, to: base), t > now,
                      t < now.addingTimeInterval(24 * 3600) else { continue }
                entries.append(DuaNowEntry(date: t, duaId: WatchDuas.forTime(t).id,
                                           relevance: TimelineEntryRelevance(score: 60, duration: 3600)))
            }
        }
        entries.sort { $0.date < $1.date }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

struct DuaNowView: View {
    @Environment(\.widgetFamily) private var family
    let entry: DuaNowEntry
    private var dua: WatchDua { WatchDuas.byId(entry.duaId) ?? WatchDuas.all[0] }

    var body: some View {
        switch family {
        case .accessoryCircular:
            ZStack {
                AccessoryWidgetBackground()
                Image(systemName: dua.symbol).font(.system(size: 20, weight: .bold))
            }
            .widgetAccentable()
        case .accessoryInline:
            Text("🤲 \(dua.title)")
        default: // .accessoryRectangular (Smart Stack)
            VStack(alignment: .leading, spacing: 1) {
                HStack(spacing: 4) {
                    Image(systemName: dua.symbol)
                    Text(L("Doa sekarang", "Du'a now")).lineLimit(1)
                }
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .widgetAccentable()
                Text(dua.title)
                    .font(.system(size: 15, weight: .heavy, design: .rounded))
                    .lineLimit(1).minimumScaleFactor(0.7)
                Text(dua.arabic)
                    .font(.system(size: 13, weight: .semibold))
                    .lineLimit(1)
                    .environment(\.layoutDirection, .rightToLeft)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

struct DuaNowWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "BabyMoDuaNow", provider: DuaNowProvider()) { entry in
            DuaNowView(entry: entry)
                .containerBackground(for: .widget) { Color.clear }
                .widgetURL(URL(string: "babymo://dua/\(entry.duaId)"))
        }
        .configurationDisplayName(L("Baby Mo · Doa sekarang", "Baby Mo · Du'a now"))
        .description(L("Doa yang pas untuk saat ini: bangun tidur, naik kendaraan, atau sebelum tidur.", "The right du'a for now: waking up, riding, or before sleep."))
        .supportedFamilies([.accessoryRectangular, .accessoryCircular, .accessoryInline])
    }
}
