import SwiftUI
import UserNotifications
import WatchKit

/// Wake up with Mo: a gentle morning alert on the chosen days at the chosen time. Tapping it opens
/// the waking-up du'a and Mo reads it in his own voice (watchOS alerts can't play a custom voice, so
/// the alert itself uses the normal sound and wrist tap). Local notifications only; nothing leaves
/// the watch.
enum WakeUp {
    static let prefix = "bm-wake-"
    private static var store: UserDefaults { PrayerSettings.store }

    static var on: Bool {
        get { store.bool(forKey: "bm_wake_on") }
        set { store.set(newValue, forKey: "bm_wake_on") }
    }
    /// Minutes after midnight (default 05:30).
    static var minutes: Int {
        get { store.object(forKey: "bm_wake_min") as? Int ?? 5 * 60 + 30 }
        set { store.set(newValue, forKey: "bm_wake_min") }
    }
    /// Weekdays as Calendar numbers (1 = Sunday … 7 = Saturday). Default: every day.
    static var days: Set<Int> {
        get { Set((store.array(forKey: "bm_wake_days") as? [Int]) ?? Array(1...7)) }
        set { store.set(Array(newValue).sorted(), forKey: "bm_wake_days") }
    }

    static func enable(done: @escaping (Bool) -> Void) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { granted, _ in
            DispatchQueue.main.async {
                on = granted
                if granted { schedule() }
                done(granted)
            }
        }
    }

    static func disable() {
        on = false
        clear()
    }

    /// Re-applies the saved alarm (called at launch and after every change).
    static func refresh() { on ? schedule() : clear() }

    private static func clear() {
        let c = UNUserNotificationCenter.current()
        c.getPendingNotificationRequests { reqs in
            c.removePendingNotificationRequests(withIdentifiers: reqs.map(\.identifier).filter { $0.hasPrefix(prefix) })
        }
    }

    /// One repeating alert per chosen weekday.
    private static func schedule() {
        let center = UNUserNotificationCenter.current()
        let h = minutes / 60, m = minutes % 60, chosen = days
        center.getPendingNotificationRequests { reqs in
            center.removePendingNotificationRequests(withIdentifiers: reqs.map(\.identifier).filter { $0.hasPrefix(prefix) })
            for wd in chosen {
                let content = UNMutableNotificationContent()
                content.title = L("Selamat pagi! ☀️", "Good morning! ☀️")
                content.body = L("Bangun yuk! Ketuk untuk baca doa bangun tidur bareng Mo.",
                                 "Time to wake up! Tap to say the waking-up du'a with Mo.")
                content.sound = .default
                var comps = DateComponents()
                comps.weekday = wd
                comps.hour = h
                comps.minute = m
                let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: true)
                center.add(UNNotificationRequest(identifier: "\(prefix)\(wd)", content: content, trigger: trigger))
            }
        }
    }
}

struct WakeUpView: View {
    @State private var on = WakeUp.on
    @State private var hour = WakeUp.minutes / 60
    @State private var minute = (WakeUp.minutes % 60) / 5 * 5
    @State private var days = WakeUp.days
    @State private var denied = false

    /// Monday first, the way Indonesian calendars show the week.
    private let order = [2, 3, 4, 5, 6, 7, 1]
    private func dayLetter(_ wd: Int) -> String {
        let id = ["", "M", "S", "S", "R", "K", "J", "S"]   // Minggu, Senin, Selasa, Rabu, Kamis, Jumat, Sabtu
        let en = ["", "S", "M", "T", "W", "T", "F", "S"]
        return L(id[wd], en[wd])
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                BMTitle(text: L("Bangun bareng Mo", "Wake up with Mo"), icon: "icon-doa")
                HStack(alignment: .bottom, spacing: 4) {
                    Text(L("Mo membangunkan si kecil dengan doa bangun tidur.", "Mo wakes your little one with the waking-up du'a."))
                        .font(BM.body(11.5)).foregroundStyle(.white.opacity(0.85))
                        .fixedSize(horizontal: false, vertical: true)
                    Image("mo-wave-up").resizable().scaledToFit().frame(height: 52)
                }

                Toggle(isOn: $on) {
                    Text(L("Alarm pagi", "Morning alarm")).font(BM.display(13.5))
                }
                .tint(BM.green)
                .padding(.horizontal, 6)

                HStack(spacing: 2) {
                    Picker(L("Jam", "Hour"), selection: $hour) {
                        ForEach(3..<11) { Text(String(format: "%02d", $0)).tag($0) }
                    }
                    .pickerStyle(.wheel).labelsHidden()
                    Text(":").font(BM.display(18)).foregroundStyle(.white)
                    Picker(L("Menit", "Minute"), selection: $minute) {
                        ForEach(Array(stride(from: 0, to: 60, by: 5)), id: \.self) { Text(String(format: "%02d", $0)).tag($0) }
                    }
                    .pickerStyle(.wheel).labelsHidden()
                }
                .frame(height: 56)
                .opacity(on ? 1 : 0.5)

                HStack(spacing: 3) {
                    ForEach(order, id: \.self) { wd in
                        Button {
                            if days.contains(wd) { if days.count > 1 { days.remove(wd) } } else { days.insert(wd) }
                        } label: {
                            Text(dayLetter(wd))
                                .font(BM.display(11))
                                .frame(width: 21, height: 21)
                                .foregroundStyle(days.contains(wd) ? .black : .white)
                                .background(Circle().fill(days.contains(wd) ? BM.gold : .white.opacity(0.15)))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .opacity(on ? 1 : 0.5)

                if denied {
                    Text(L("Izinkan notifikasi Baby Mo di app Watch di iPhone.", "Allow Baby Mo notifications in the Watch app on iPhone."))
                        .font(BM.body(10.5)).foregroundStyle(BM.gold).multilineTextAlignment(.center)
                }

                NavigationLink {
                    DuaPlayerView(dua: WatchDuas.all[4], autoplay: true)
                } label: {
                    Label(L("Coba sekarang", "Try it now"), systemImage: "sun.max.fill")
                        .font(BM.display(13))
                }
                .buttonStyle(BMButtonStyle())
            }
            .padding(.horizontal, 4)
        }
        .background(BM.sky(Color(red: 1.0, green: 0.62, blue: 0.36), Color(red: 0.55, green: 0.26, blue: 0.40)))
        .bmScreen()
        .onChange(of: on) { _, v in
            if v { WakeUp.enable { ok in if !ok { on = false; denied = true } } } else { WakeUp.disable() }
        }
        .onChange(of: hour) { _, _ in save() }
        .onChange(of: minute) { _, _ in save() }
        .onChange(of: days) { _, v in WakeUp.days = v; WakeUp.refresh() }
    }

    private func save() {
        WakeUp.minutes = hour * 60 + minute
        WakeUp.refresh()
    }
}
