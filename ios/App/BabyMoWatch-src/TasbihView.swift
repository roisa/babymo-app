import SwiftUI
import WatchKit

/// Bedtime tasbih, same as the Doa Harian game: 33 Subḥānallāh, 33 Alḥamdulillāh, 34 Allāhu akbar.
/// Tap the screen or turn the Digital Crown; each count lights the next bead around Mo.
struct TasbihView: View {
    private let phrases = ["سُبْحَانَ اللَّهِ", "الْحَمْدُ لِلَّهِ", "اللَّهُ أَكْبَرُ"]
    private let latin = ["Subḥānallāh", "Alḥamdulillāh", "Allāhu akbar"]
    private let goals = [33, 33, 34]
    private let beadColors: [(Color, Color)] = [
        (Color(red: 0.49, green: 0.94, blue: 0.64), Color(red: 0.13, green: 0.63, blue: 0.29)),  // green
        (Color(red: 1.0, green: 0.90, blue: 0.54), Color(red: 0.95, green: 0.70, blue: 0.11)),   // gold
        (Color(red: 1.0, green: 0.75, blue: 0.54), Color(red: 0.94, green: 0.44, blue: 0.16)),   // orange
    ]

    @State private var set = 0
    @State private var count = 0
    @State private var done = false
    @State private var crown = 0.0
    @State private var lastCrownStep = 0
    @State private var bob = false

    var body: some View {
        GeometryReader { geo in
            let side = min(geo.size.width, geo.size.height) * 0.82
            ZStack {
                VStack(spacing: 2) {
                    Text(phrases[set])
                        .font(BM.arabic(18))
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
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)

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
        .navigationTitle("Tasbih")
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(latin[set]) \(count) / \(goals[set])")
        .accessibilityAddTraits(.isButton)
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
        withAnimation(.spring(response: 0.25, dampingFraction: 0.5)) {
            count += 1
            bob.toggle()
        }
        if count >= goals[set] {
            if set == 2 {
                WKInterfaceDevice.current().play(.success)
                withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) { done = true }
            } else {
                WKInterfaceDevice.current().play(.notification)
                withAnimation { set += 1; count = 0 }
            }
        } else {
            WKInterfaceDevice.current().play(.click)
        }
    }
}
