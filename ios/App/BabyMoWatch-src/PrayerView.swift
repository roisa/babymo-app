import SwiftUI
import UserNotifications
import WidgetKit

private func hhmm(_ d: Date) -> String {
    let f = DateFormatter()
    f.locale = Locale(identifier: "en_US_POSIX")
    f.dateFormat = "HH:mm"
    return f.string(from: d)
}

private func countdown(from now: Date, to t: Date) -> String {
    let mins = max(0, Int(ceil(t.timeIntervalSince(now) / 60)))
    let h = mins / 60, m = mins % 60
    if h > 0 { return L("\(h) jam \(m) menit lagi", "in \(h)h \(m)m") }
    return L("\(m) menit lagi", "in \(m) min")
}

/// Prayer times for the chosen city: the next prayer big (with Mo), then all five.
struct PrayerView: View {
    @State private var city = PrayerSettings.city
    @State private var reminders = PrayerSettings.remindersOn

    var body: some View {
        TimelineView(.everyMinute) { ctx in
            let now = ctx.date
            let today = PrayerTimes.times(on: now, city: city)
            let next = PrayerTimes.next(after: now, city: city)
            let current = PrayerTimes.current(at: now, city: city)

            ScrollView {
                VStack(spacing: 8) {
                    BMTitle(text: L("Sholat", "Prayer"), icon: "icon-pray")
                    NavigationLink {
                        CityPickerView(city: $city)
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "mappin.circle.fill")
                            Text(city.name).font(BM.display(13))
                            Image(systemName: "chevron.down").font(.system(size: 9, weight: .bold))
                        }
                        .foregroundStyle(.white)
                        .padding(.horizontal, 10).padding(.vertical, 5)
                        .background(Capsule().fill(.white.opacity(0.16)))
                    }
                    .buttonStyle(.plain)

                    if let next {
                        NextPrayerCard(prayer: next.0, time: next.1, now: now)
                    }

                    VStack(spacing: 0) {
                        ForEach(today.indices, id: \.self) { i in
                            let p = today[i].0
                            let t = today[i].1
                            let isCurrent = p == current
                            HStack(spacing: 8) {
                                Image(systemName: p.symbol)
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundStyle(isCurrent ? BM.gold : .white.opacity(0.85))
                                    .frame(width: 22)
                                Text(p.name).font(BM.display(14))
                                Spacer()
                                Text(hhmm(t)).font(BM.display(14)).monospacedDigit()
                            }
                            .foregroundStyle(.white)
                            .opacity(t < now && !isCurrent ? 0.55 : 1)
                            .padding(.horizontal, 10).padding(.vertical, 7)
                            .background(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .fill(isCurrent ? BM.green.opacity(0.45) : .clear)
                            )
                        }
                    }
                    .padding(4)
                    .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(.white.opacity(0.12)))

                    Toggle(isOn: $reminders) {
                        VStack(alignment: .leading, spacing: 1) {
                            Text(L("Ingatkan wudhu", "Wudu reminder")).font(BM.display(13))
                            Text(L("10 menit sebelum sholat", "10 min before each prayer")).font(BM.body(10.5)).opacity(0.75)
                        }
                    }
                    .tint(BM.green)
                    .padding(.horizontal, 6)
                }
                .padding(.horizontal, 4)
            }
        }
        .background(BM.sky(Color(red: 0.24, green: 0.27, blue: 0.72), Color(red: 0.10, green: 0.12, blue: 0.36)))
        .bmScreen()
        .onChange(of: city) { _, c in
            PrayerSettings.city = c
            WidgetCenter.shared.reloadAllTimelines()
            if reminders { PrayerReminders.schedule(city: c) }
        }
        .onChange(of: reminders) { _, on in
            PrayerSettings.remindersOn = on
            if on {
                PrayerReminders.enable(city: city) { granted in if !granted { reminders = false } }
            } else {
                PrayerReminders.clear()
            }
        }
        .onAppear { if reminders { PrayerReminders.schedule(city: city) } }
    }
}

/// Big card: "Up next · Ashar 14:58 · in 2h 14m" with Mo leaning in.
struct NextPrayerCard: View {
    let prayer: Prayer
    let time: Date
    let now: Date

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            VStack(alignment: .leading, spacing: 1) {
                Text(L("SEBENTAR LAGI", "UP NEXT"))
                    .font(BM.display(10)).tracking(0.8)
                    .foregroundStyle(BM.gold)
                Text(prayer.name).font(BM.display(20))
                Text(hhmm(time)).font(BM.display(26)).monospacedDigit()
                Text(countdown(from: now, to: time)).font(BM.body(11)).opacity(0.85)
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(10)

            Image("mo-wave-up")
                .resizable().scaledToFit()
                .frame(height: 78)
                .offset(x: 4)
        }
        .frame(height: 100)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(LinearGradient(colors: [Color(red: 0.43, green: 0.45, blue: 0.87), Color(red: 0.23, green: 0.25, blue: 0.66)],
                                     startPoint: .top, endPoint: .bottom))
        )
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}

struct CityPickerView: View {
    @Binding var city: PrayerCity
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 6) {
                BMTitle(text: L("Pilih kota", "Choose city"), icon: "icon-pray")
                ForEach(PrayerCity.all) { c in
                    Button {
                        city = c
                        dismiss()
                    } label: {
                        HStack {
                            Text(c.name).font(BM.display(14)).foregroundStyle(.white)
                            Spacer()
                            if c == city { Image(systemName: "checkmark.circle.fill").foregroundStyle(BM.greenHi) }
                        }
                        .padding(.horizontal, 10).padding(.vertical, 9)
                        .background(RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(c == city ? BM.green.opacity(0.45) : .white.opacity(0.13)))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 4)
        }
        .background(BM.sky(Color(red: 0.24, green: 0.27, blue: 0.72), Color(red: 0.10, green: 0.12, blue: 0.36)))
        .bmScreen()
    }
}

/// Local "Wudu with Mo?" notifications, 10 minutes before each prayer, for the next 7 days.
enum PrayerReminders {
    private static let prefix = "bm-pray-"

    static func enable(city: PrayerCity, done: @escaping (Bool) -> Void) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { granted, _ in
            DispatchQueue.main.async {
                if granted { schedule(city: city) }
                done(granted)
            }
        }
    }

    static func clear() {
        let c = UNUserNotificationCenter.current()
        c.getPendingNotificationRequests { reqs in
            c.removePendingNotificationRequests(withIdentifiers: reqs.map(\.identifier).filter { $0.hasPrefix(prefix) })
        }
    }

    static func schedule(city: PrayerCity) {
        let center = UNUserNotificationCenter.current()
        center.getPendingNotificationRequests { reqs in
            center.removePendingNotificationRequests(withIdentifiers: reqs.map(\.identifier).filter { $0.hasPrefix(prefix) })
            let cal = Calendar.current
            let now = Date()
            for day in 0..<7 {
                guard let d = cal.date(byAdding: .day, value: day, to: now) else { continue }
                for (p, t) in PrayerTimes.times(on: d, city: city) {
                    let fire = t.addingTimeInterval(-10 * 60)
                    guard fire > now else { continue }
                    let content = UNMutableNotificationContent()
                    content.title = L("Sebentar lagi \(p.name)", "\(p.name) is soon")
                    content.body = L("Yuk wudhu dulu bersama Mo! \(p.name) jam \(hhmm(t)).",
                                     "Let's do wudu with Mo! \(p.name) at \(hhmm(t)).")
                    content.sound = .default
                    let comps = cal.dateComponents([.year, .month, .day, .hour, .minute], from: fire)
                    let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)
                    let id = "\(prefix)\(comps.year!)-\(comps.month!)-\(comps.day!)-\(p.rawValue)"
                    center.add(UNNotificationRequest(identifier: id, content: content, trigger: trigger))
                }
            }
        }
    }
}
