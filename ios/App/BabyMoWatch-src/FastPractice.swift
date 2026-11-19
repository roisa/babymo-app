import SwiftUI
import WatchKit

// Screens for the Ramadan practice fast. The saved data lives in FastStore.swift.

/// The 30 lanterns. Lit gold = until maghrib, soft orange = half a day, glowing ring = today.
struct LanternRow: View {
    let levels: [Int: FastPractice.Level]
    let length: Int
    var today: Int? = nil
    var onTap: ((Int) -> Void)? = nil

    var body: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 3), count: 6), spacing: 4) {
            ForEach(1...length, id: \.self) { d in
                let lv = levels[d] ?? .off
                let future = today.map { d > $0 } ?? false
                Button { onTap?(d) } label: {
                    Text("🏮")
                        .font(.system(size: lv == .half ? 12 : 14))
                        .grayscale(lv == .off ? 1 : 0)
                        .opacity(lv == .full ? 1 : lv == .half ? 0.8 : (future ? 0.2 : 0.4))
                        .frame(width: 24, height: 24)
                        .background(Circle().fill(lv == .off ? .white.opacity(0.06) : BM.gold.opacity(0.18)))
                        .overlay(Circle().stroke(d == today ? BM.gold : .clear, lineWidth: 1.5))
                }
                .buttonStyle(.plain)
                .disabled(onTap == nil || future)
                .accessibilityLabel(L("Hari \(d)", "Day \(d)") + (lv == .full ? L(", sampai maghrib", ", until maghrib") : lv == .half ? L(", setengah hari", ", half a day") : ""))
            }
        }
    }
}

/// Shown on the Ramadan screen during Ramadan.
struct FastCard: View {
    let day: Int
    @State private var levels = FastPractice.levels()
    @State private var cheer = false
    private let length = FastPractice.ramadanLength()

    var body: some View {
        VStack(spacing: 7) {
            HStack {
                Text(L("Puasa latihanku", "My practice fast")).font(BM.display(14)).foregroundStyle(.white)
                Spacer()
                Text("🏮 \(levels.values.filter { $0 != .off }.count)").font(BM.display(13)).foregroundStyle(BM.gold)
            }
            Text(cheer ? L("MasyaAllah, hebat! 🌟", "MashaAllah, well done! 🌟")
                       : L("Hari ini puasa sampai kapan?", "How long did you fast today?"))
                .font(BM.body(11)).foregroundStyle(.white.opacity(0.85))
                .frame(maxWidth: .infinity, alignment: .leading)
            HStack(spacing: 6) {
                choice(.half, L("Zuhur", "Midday"), "sun.max.fill")
                choice(.full, L("Maghrib", "Maghrib"), "sunset.fill")
            }
            LanternRow(levels: levels, length: length, today: day) { d in
                // tap an earlier lantern to fix a day: none → half → full → none
                let next: FastPractice.Level = { switch levels[d] ?? .off { case .off: return .half; case .half: return .full; case .full: return .off } }()
                update(next, day: d)
            }
            Text(L("Setiap usaha dihitung — tidak ada yang gagal.", "Every try counts — there's no failing."))
                .font(BM.body(9.5)).foregroundStyle(.white.opacity(0.6))
        }
        .padding(8)
        .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(.white.opacity(0.12)))
    }

    private func choice(_ lv: FastPractice.Level, _ label: String, _ symbol: String) -> some View {
        let on = levels[day] == lv
        return Button { update(on ? .off : lv, day: day) } label: {
            Label(label, systemImage: symbol)
                .font(BM.display(11.5))
                .frame(maxWidth: .infinity, minHeight: 32)
                .foregroundStyle(on ? .black : .white)
                .background(Capsule().fill(on ? BM.gold : .white.opacity(0.15)))
        }
        .buttonStyle(.plain)
    }

    private func update(_ lv: FastPractice.Level, day d: Int) {
        FastPractice.set(lv, day: d)
        levels = FastPractice.levels()
        if lv != .off {
            WKInterfaceDevice.current().play(lv == .full ? .success : .click)
            withAnimation { cheer = true }
        } else {
            cheer = false
        }
    }
}

/// Idul Fitri (1–3 Shawwal): the whole row of lanterns with a celebration.
struct EidCard: View {
    private let levels = FastPractice.levels()
    private let length = FastPractice.ramadanLength()

    var body: some View {
        let n = levels.values.filter { $0 != .off }.count
        VStack(spacing: 6) {
            Image("mo-happy-up").resizable().scaledToFit().frame(height: 58)
            Text(L("Selamat Idul Fitri! 🎉", "Eid Mubarak! 🎉")).font(BM.display(15)).foregroundStyle(BM.gold)
            Text(n > 0 ? L("Kamu berlatih puasa \(n) hari. MasyaAllah!", "You practised fasting for \(n) days. MashaAllah!")
                       : L("Mohon maaf lahir dan batin 🤲", "Let's hug the family and say sorry 🤗"))
                .font(BM.body(11.5)).foregroundStyle(.white).multilineTextAlignment(.center)
            if n > 0 { LanternRow(levels: levels, length: length) }
        }
        .padding(8)
        .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(.white.opacity(0.12)))
    }
}
