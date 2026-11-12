import SwiftUI
import WatchKit

/// Tasbih settings (kept on the watch, changeable any time from the gear button).
enum TasbihPrefs {
    static let motion = "bm_tasbih_motion"      // count by moving the wrist (tap always works)
    static let sens = "bm_tasbih_sens"          // WristShake.Sensitivity
    static let sound = "bm_tasbih_sound"        // 0 off · 1 bead click · 2 Mo says the phrase
    static let haptic = "bm_tasbih_haptic"      // wrist tap on every count
    static let mode = "bm_tasbih_mode"          // 0 bedtime 33·33·34 · 1 after prayer 33·33·33
}

/// Bedtime tasbih, same as the Doa Harian game: 33 Subḥānallāh, 33 Alḥamdulillāh, 34 Allāhu akbar
/// (or 33·33·33 after prayer). Count by moving the wrist, tapping the screen or turning the
/// Digital Crown; each count lights the next bead around Mo, with the chosen sound and a wrist tap.
struct TasbihView: View {
    private let phrases = ["سُبْحَانَ اللَّهِ", "الْحَمْدُ لِلَّهِ", "اللَّهُ أَكْبَرُ"]
    private let latin = ["Subḥānallāh", "Alḥamdulillāh", "Allāhu akbar"]
    private let voices = ["t-subhanallah", "t-alhamdulillah", "t-allahuakbar"]
    private let beadColors: [(Color, Color)] = [
        (Color(red: 0.49, green: 0.94, blue: 0.64), Color(red: 0.13, green: 0.63, blue: 0.29)),  // green
        (Color(red: 1.0, green: 0.90, blue: 0.54), Color(red: 0.95, green: 0.70, blue: 0.11)),   // gold
        (Color(red: 1.0, green: 0.75, blue: 0.54), Color(red: 0.94, green: 0.44, blue: 0.16)),   // orange
    ]

    @AppStorage(TasbihPrefs.motion) private var useMotion = true
    @AppStorage(TasbihPrefs.sens) private var sens = WristShake.Sensitivity.normal.rawValue
    @AppStorage(TasbihPrefs.sound) private var sound = 2
    @AppStorage(TasbihPrefs.haptic) private var haptic = true
    @AppStorage(TasbihPrefs.mode) private var mode = 0

    @StateObject private var shake = WristShake()
    @State private var set = 0
    @State private var count = 0
    @State private var done = false
    @State private var crown = 0.0
    @State private var lastCrownStep = 0
    @State private var bob = false

    private var goals: [Int] { mode == 1 ? [33, 33, 33] : [33, 33, 34] }

    var body: some View {
        GeometryReader { geo in
            let side = min(geo.size.width * 0.8, geo.size.height * 0.62)
            ZStack {
                VStack(spacing: 1) {
                    BMTitle(text: "Tasbih", icon: "icon-tasbih", trailing: AnyView(
                        NavigationLink { TasbihSettingsView() } label: {
                            Image(systemName: "gearshape.fill")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundStyle(.white)
                                .frame(width: 28, height: 28)
                                .background(Circle().fill(.white.opacity(0.18)))
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel(L("Pengaturan tasbih", "Tasbih settings"))
                    ))
                    .opacity(done ? 0 : 1)

                    Text(phrases[set])
                        .font(BM.arabic(17))
                        .foregroundStyle(BM.gold)
                        .opacity(done ? 0 : 1)

                    ZStack {
                        beads(side: side)
                        // Mo in a glowing disc in the middle (upper body, render 1)
                        Image("mo-dua-up")
                            .resizable().scaledToFill()
                            .frame(width: side * 0.52, height: side * 0.52, alignment: .top)
                            .offset(y: bob ? -3 : 0)
                            .clipShape(Circle())
                            .background(Circle().fill(RadialGradient(colors: [Color(red: 0.56, green: 0.61, blue: 1), Color(red: 0.23, green: 0.25, blue: 0.66)], center: .top, startRadius: 0, endRadius: side * 0.4)))
                            .overlay(Circle().stroke(.white.opacity(0.2), lineWidth: 2))
                            .opacity(done ? 0 : 1)
                        Text("\(count)")
                            .font(BM.display(20))
                            .foregroundStyle(Color(red: 0.12, green: 0.13, blue: 0.40))
                            .padding(.horizontal, 12)
                            .background(Capsule().fill(LinearGradient(colors: [beadColors[set].0, beadColors[set].1], startPoint: .top, endPoint: .bottom)))
                            .offset(y: side * 0.27)
                            .opacity(done ? 0 : 1)
                    }
                    .frame(width: side, height: side)

                    Text("\(latin[set]) · \(count)/\(goals[set])")
                        .font(BM.display(12))
                        .foregroundStyle(.white)
                        .opacity(done ? 0 : 1)
                    if useMotion && !done {
                        Label(L("Gerakkan tanganmu", "Move your hand"), systemImage: "hand.wave.fill")
                            .font(BM.body(10))
                            .foregroundStyle(.white.opacity(0.7))
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)

                if done { finished }
            }
        }
        .background(BM.sky(Color(red: 0.36, green: 0.37, blue: 0.84), Color(red: 0.15, green: 0.16, blue: 0.43)))
        .contentShape(Rectangle())
        .onTapGesture { step() }
        .focusable(true)
        .digitalCrownRotation($crown, from: 0, through: 10_000, by: 1, sensitivity: .low, isContinuous: false, isHapticFeedbackEnabled: false)
        .onChange(of: crown) { _, value in
            let s = Int(value)
            if s > lastCrownStep { step() }
            lastCrownStep = s
        }
        .onAppear(perform: startMotion)
        .onDisappear(perform: stopMotion)
        .onChange(of: useMotion) { _, _ in stopMotion(); startMotion() }
        .onChange(of: sens) { _, v in shake.sensitivity = WristShake.Sensitivity(rawValue: v) ?? .normal }
        .onChange(of: mode) { _, _ in withAnimation { done = false; set = 0; count = 0 } }
        .bmScreen()
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(latin[set]) \(count) / \(goals[set])")
        .accessibilityAddTraits(.isButton)
    }

    private func startMotion() {
        guard useMotion else { return }
        shake.sensitivity = WristShake.Sensitivity(rawValue: sens) ?? .normal
        shake.start { step() }
        DhikrSession.shared.begin()
    }

    private func stopMotion() {
        shake.stop()
        DhikrSession.shared.end()
    }

    private func beads(side: CGFloat) -> some View {
        let n = goals[set]
        let r = side * 0.42
        let gap = 46.0 * Double.pi / 180
        let span = 2 * Double.pi - gap
        return ZStack {
            // tassel at the bottom, like real prayer beads
            Capsule().fill(BM.gold).frame(width: 2.5, height: side * 0.08).offset(y: r + side * 0.06)
            Circle().fill(LinearGradient(colors: [beadColors[set].0, beadColors[set].1], startPoint: .topLeading, endPoint: .bottomTrailing))
                .frame(width: side * 0.09, height: side * 0.09).offset(y: r)
            ForEach(0..<n, id: \.self) { i in
                let a: Double = Double.pi / 2 + gap / 2 + span * Double(i) / Double(n - 1)
                let on = i < count || done
                let current = i == count - 1 && !done
                Circle()
                    .fill(on
                          ? AnyShapeStyle(RadialGradient(colors: [.white, beadColors[set].0, beadColors[set].1], center: UnitPoint(x: 0.35, y: 0.3), startRadius: 0, endRadius: 6))
                          : AnyShapeStyle(Color.white.opacity(0.16)))
                    .frame(width: current ? side * 0.085 : side * 0.06, height: current ? side * 0.085 : side * 0.06)
                    .shadow(color: current ? beadColors[set].0 : .clear, radius: 4)
                    .offset(x: r * CGFloat(cos(a)), y: r * CGFloat(sin(a)))
            }
        }
    }

    private var finished: some View {
        VStack(spacing: 4) {
            Text(L("Masya Allah!", "Masha Allah!"))
                .font(BM.display(19))
                .foregroundStyle(.white)
            Text(L("Tasbih selesai", "Tasbih done"))
                .font(BM.display(12))
                .foregroundStyle(Color(red: 0.23, green: 0.16, blue: 0))
                .padding(.horizontal, 10).padding(.vertical, 2)
                .background(Capsule().fill(BM.gold))
            Spacer(minLength: 0)
            Image("mo-happy-up")
                .resizable().scaledToFit()
                .frame(height: 110)
                .transition(.move(edge: .bottom))
        }
        .padding(.top, 6)
        .ignoresSafeArea(edges: .bottom)
    }

    private func step() {
        if done {
            withAnimation { done = false; set = 0; count = 0 }
            return
        }
        let phrase = set
        withAnimation(.spring(response: 0.25, dampingFraction: 0.5)) {
            count += 1
            bob.toggle()
        }
        switch sound {
        case 1: QuickSounds.shared.play("t-bead")
        case 2: QuickSounds.shared.play(voices[phrase])
        default: break
        }
        if count >= goals[set] {
            if set == 2 {
                bmHaptic(.success, enabled: haptic)
                withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) { done = true }
            } else {
                bmHaptic(.notification, enabled: haptic)
                withAnimation { set += 1; count = 0 }
            }
        } else {
            bmHaptic(.click, enabled: haptic)
        }
    }
}

/// Gear button on the tasbih: how to count, which sound, wrist taps, which tasbih.
struct TasbihSettingsView: View {
    @AppStorage(TasbihPrefs.motion) private var useMotion = true
    @AppStorage(TasbihPrefs.sens) private var sens = WristShake.Sensitivity.normal.rawValue
    @AppStorage(TasbihPrefs.sound) private var sound = 2
    @AppStorage(TasbihPrefs.haptic) private var haptic = true
    @AppStorage(TasbihPrefs.mode) private var mode = 0

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                BMTitle(text: L("Pengaturan", "Settings"), icon: "icon-tasbih")

                Toggle(isOn: $useMotion) {
                    VStack(alignment: .leading, spacing: 1) {
                        Text(L("Hitung dengan gerakan", "Count by moving")).font(BM.display(13))
                        Text(L("Gerakkan tangan, satu gerakan = satu hitungan", "Flick your wrist, one move = one count")).font(BM.body(10)).opacity(0.75)
                    }
                }
                .tint(BM.green)

                if useMotion {
                    Text(L("Kekuatan gerakan", "How strong a move")).font(BM.display(12)).opacity(0.85)
                    Picker(L("Kekuatan", "Strength"), selection: $sens) {
                        ForEach(WristShake.Sensitivity.allCases) { s in Text(s.label).tag(s.rawValue) }
                    }
                    .pickerStyle(.navigationLink)
                }

                Text(L("Suara tiap hitungan", "Sound on each count")).font(BM.display(12)).opacity(0.85)
                Picker(L("Suara", "Sound"), selection: $sound) {
                    Text(L("Suara Mo (dzikir)", "Mo says the dhikr")).tag(2)
                    Text(L("Bunyi tasbih", "Bead click")).tag(1)
                    Text(L("Tanpa suara", "No sound")).tag(0)
                }
                .pickerStyle(.navigationLink)

                Toggle(isOn: $haptic) {
                    Text(L("Getar tiap hitungan", "Wrist tap on each count")).font(BM.display(13))
                }
                .tint(BM.green)

                Text(L("Jenis tasbih", "Which tasbih")).font(BM.display(12)).opacity(0.85)
                Picker(L("Tasbih", "Tasbih"), selection: $mode) {
                    Text(L("Sebelum tidur · 33·33·34", "Bedtime · 33·33·34")).tag(0)
                    Text(L("Sesudah sholat · 33·33·33", "After prayer · 33·33·33")).tag(1)
                }
                .pickerStyle(.navigationLink)
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 4)
        }
        .background(BM.sky(Color(red: 0.36, green: 0.37, blue: 0.84), Color(red: 0.15, green: 0.16, blue: 0.43)))
        .bmScreen()
    }
}
