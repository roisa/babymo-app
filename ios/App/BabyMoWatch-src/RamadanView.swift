import SwiftUI
import UserNotifications

private func clock(_ d: Date) -> String {
    let f = DateFormatter()
    f.locale = Locale(identifier: "en_US_POSIX")
    f.dateFormat = "HH:mm"
    return f.string(from: d)
}

private func left(_ now: Date, _ t: Date) -> String {
    let mins = max(0, Int(ceil(t.timeIntervalSince(now) / 60)))
    let h = mins / 60, m = mins % 60
    if h > 0 { return L("\(h) jam \(m) menit lagi", "in \(h)h \(m)m") }
    return L("\(m) menit lagi", "in \(m) min")
}

/// Ramadan: day N, countdown to iftar (or to imsak at night), the sahur and iftar du'as.
/// Outside Ramadan it shows how many days are left and still lets kids practise the du'as.
struct RamadanView: View {
    @State private var reminders = UserDefaults.standard.bool(forKey: "bm_watch_ramadan_rem")
    private let city = PrayerSettings.city

    var body: some View {
        TimelineView(.everyMinute) { ctx in
            let now = ctx.date
            let day = Ramadan.day(on: now)
            ScrollView {
                VStack(spacing: 8) {
                    if let day {
                        countdownCard(now: now, day: day)
                    } else {
                        VStack(spacing: 2) {
                            Text(L("Ramadan", "Ramadan")).font(BM.display(18))
                            Text(L("\(Ramadan.daysUntil(from: now)) hari lagi", "\(Ramadan.daysUntil(from: now)) days to go"))
                                .font(BM.display(13)).foregroundStyle(BM.gold)
                            Text(L("Yuk latihan doanya dulu bersama Mo!", "Let's practise the du'as with Mo!"))
                                .font(BM.body(11)).opacity(0.8).multilineTextAlignment(.center)
                        }
                        .foregroundStyle(.white)
                        .padding(.vertical, 6)
                    }

                    ForEach(WatchDuas.ramadan) { dua in
                        NavigationLink {
                            DuaPlayerView(dua: dua)
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: dua.symbol)
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundStyle(.white)
                                    .frame(width: 28, height: 28)
                                    .background(Circle().fill(dua.tint))
                                Text(dua.title).font(BM.display(13)).foregroundStyle(.white).lineLimit(2)
                                Spacer(minLength: 0)
                            }
                            .padding(7)
                            .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(.white.opacity(0.12)))
                        }
                        .buttonStyle(.plain)
                    }

                    if day != nil {
                        Toggle(isOn: $reminders) {
                            VStack(alignment: .leading, spacing: 1) {
                                Text(L("Ingatkan sahur & buka", "Suhoor & iftar reminders")).font(BM.display(12.5))
                                Text(city.name).font(BM.body(10.5)).opacity(0.75)
                            }
                        }
                        .tint(BM.green)
                        .padding(.horizontal, 6)
                    }
                }
                .padding(.horizontal, 4)
            }
        }
        .background(BM.sky(Color(red: 0.42, green: 0.36, blue: 0.86), Color(red: 0.14, green: 0.12, blue: 0.40)))
        .navigationTitle("Ramadan")
        .onChange(of: reminders) { _, on in
            UserDefaults.standard.set(on, forKey: "bm_watch_ramadan_rem")
            if on {
                UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { ok, _ in
                    DispatchQueue.main.async {
                        if ok { RamadanReminders.schedule(city: city) } else { reminders = false }
                    }
                }
            } else {
                RamadanReminders.clear()
            }
        }
        .onAppear { if reminders { RamadanReminders.schedule(city: city) } }
    }

    /// Daytime: "Iftar 17:48 · in 2h 14m". Night after iftar: "Imsak 03:53" for tomorrow.
    private func countdownCard(now: Date, day: Int) -> some View {
        let today = PrayerTimes.fastTimes(on: now, city: city)
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: now).flatMap { PrayerTimes.fastTimes(on: $0, city: city) }
        let fasting = today.map { now >= $0.imsak && now < $0.iftar } ?? false
        let target: (String, Date)? = {
            guard let today else { return nil }
            if now < today.imsak { return (L("Imsak", "Imsak"), today.imsak) }
            if now < today.iftar { return (L("Buka puasa", "Iftar"), today.iftar) }
            return tomorrow.map { (L("Imsak", "Imsak"), $0.imsak) }
        }()

        return ZStack(alignment: .bottomTrailing) {
            VStack(alignment: .leading, spacing: 1) {
                Text(L("RAMADAN HARI KE-\(day)", "RAMADAN DAY \(day)"))
                    .font(BM.display(10)).tracking(0.8).foregroundStyle(BM.gold)
                if let target {
                    Text(target.0).font(BM.display(17))
                    Text(clock(target.1)).font(BM.display(26)).monospacedDigit()
                    Text(left(now, target.1)).font(BM.body(11)).opacity(0.85)
                }
                Text(fasting ? L("Semangat puasanya!", "Keep going, you can do it!") : L("Selamat sahur!", "Time for suhoor!"))
                    .font(BM.body(10.5)).opacity(0.75)
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(10)

            Image(fasting ? "mo-wave-up" : "mo-dua-up")
                .resizable().scaledToFit()
                .frame(height: 76)
                .offset(x: 4)
        }
        .frame(minHeight: 112)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(LinearGradient(colors: fasting
                                     ? [Color(red: 0.98, green: 0.62, blue: 0.30), Color(red: 0.62, green: 0.25, blue: 0.30)]
                                     : [Color(red: 0.42, green: 0.36, blue: 0.86), Color(red: 0.20, green: 0.17, blue: 0.50)],
                                     startPoint: .top, endPoint: .bottom))
        )
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}

/// "Time for suhoor" 45 min before imsak and "Time to break the fast" at maghrib,
/// for the Ramadan days in the next week.
enum RamadanReminders {
    private static let prefix = "bm-ramadan-"

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
            for i in 0..<8 {
                guard let d = cal.date(byAdding: .day, value: i, to: now),
                      Ramadan.day(on: d) != nil,
                      let t = PrayerTimes.fastTimes(on: d, city: city) else { continue }
                let items: [(String, Date, String, String)] = [
                    ("sahur", t.imsak.addingTimeInterval(-45 * 60),
                     L("Waktunya sahur!", "Time for suhoor!"),
                     L("Imsak jam \(clock(t.imsak)). Jangan lupa niat puasa bersama Mo.", "Imsak at \(clock(t.imsak)). Don't forget the intention with Mo.")),
                    ("buka", t.iftar,
                     L("Waktunya berbuka!", "Time to break the fast!"),
                     L("Alhamdulillah! Baca doa berbuka bersama Mo.", "Alhamdulillah! Say the iftar du'a with Mo.")),
                ]
                for (key, fire, title, body) in items where fire > now {
                    let content = UNMutableNotificationContent()
                    content.title = title
                    content.body = body
                    content.sound = .default
                    let comps = cal.dateComponents([.year, .month, .day, .hour, .minute], from: fire)
                    let id = "\(prefix)\(comps.year!)-\(comps.month!)-\(comps.day!)-\(key)"
                    center.add(UNNotificationRequest(identifier: id, content: content,
                                                     trigger: UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)))
                }
            }
        }
    }
}
