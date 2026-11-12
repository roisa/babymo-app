import SwiftUI
import WatchKit

/// Mimi the cat from "Sahabat Hewan Mo", as a 10-second daily check-in on the wrist:
/// food (with Bismillah) → water → clean → a gentle stroke. Resets every morning;
/// caring every day builds a streak. The cat art is the app's own (www/farm/farm-kit.js).
final class PetState: ObservableObject {
    enum Step: Int { case feed, water, clean, pet, done }

    @Published private(set) var step: Step = .feed
    @Published private(set) var streak = 0
    private let store = UserDefaults.standard

    init() { load() }

    private static func dayKey(_ d: Date = Date()) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: d)
    }

    func load() {
        streak = store.integer(forKey: "bm_pet_streak")
        if store.string(forKey: "bm_pet_day") == Self.dayKey() {
            step = Step(rawValue: store.integer(forKey: "bm_pet_step")) ?? .feed
        } else {
            step = .feed
            // the streak survives only if yesterday was completed
            let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: Date()).map { Self.dayKey($0) }
            if store.string(forKey: "bm_pet_last_done") != yesterday && store.string(forKey: "bm_pet_last_done") != Self.dayKey() {
                streak = 0
                store.set(0, forKey: "bm_pet_streak")
            }
        }
    }

    func advance() {
        guard let next = Step(rawValue: step.rawValue + 1) else { return }
        step = next
        store.set(Self.dayKey(), forKey: "bm_pet_day")
        store.set(next.rawValue, forKey: "bm_pet_step")
        if next == .done {
            streak += 1
            store.set(streak, forKey: "bm_pet_streak")
            store.set(Self.dayKey(), forKey: "bm_pet_last_done")
        }
    }
}

struct PetView: View {
    @StateObject private var pet = PetState()
    @State private var busy: PetState.Step? = nil   // the action being animated
    @State private var bubble: String? = nil
    @State private var hop = false
    @StateObject private var shake = WristShake()
    @State private var shakes = 0          // shakes so far for this step (3 needed)
    @State private var wiggle = false
    private let shakesNeeded = 3

    /// Food, water and clean are done by shaking the wrist (like shaking the food bag);
    /// patting stays a gentle tap: "stroke gently, no rough play".
    private var shakeStep: Bool { [.feed, .water, .clean].contains(pet.step) }

    private var name: String { L("Mimi", "Mimi") }

    private var catImage: String {
        if busy == .feed { return "cat-eat" }
        switch pet.step {
        case .feed: return "cat-hungry"
        case .water: return "cat-thirsty"
        case .clean: return "cat-dirty"
        case .pet: return "cat-idle"
        case .done:
            let h = Calendar.current.component(.hour, from: Date())
            return (h >= 20 || h < 5) ? "cat-sleep" : "cat-happy"
        }
    }

    private var hint: String {
        switch pet.step {
        case .feed: return L("\(name) lapar. Ketuk Makan.", "\(name) is hungry. Tap Food.")
        case .water: return L("\(name) haus. Ketuk Minum.", "\(name) is thirsty. Tap Water.")
        case .clean: return L("\(name) kotor. Ketuk Bersih.", "\(name) is dirty. Tap Clean.")
        case .pet: return L("Ajak \(name) bermain!", "Play with \(name)!")
        case .done: return L("\(name) senang!", "\(name) is happy!")
        }
    }

    /// The lesson shown after each step (same lines as the app).
    private var lesson: String? {
        switch pet.step {
        case .water: return L("Memberi makan hewan dengan Bismillah adalah kebaikan yang Allah cintai.", "Feeding an animal with Bismillah is a kindness Allah loves.")
        case .clean: return L("Jangan biarkan hewan kehausan, ya.", "Never leave an animal thirsty.")
        case .pet: return L("Bersih itu sehat dan disukai Allah.", "Clean is healthy, and Allah loves it.")
        case .done: return L("Elus pelan-pelan. Tidak memukul, tidak mengejar, tidak menarik ekor.", "Stroke gently. No hitting, no chasing, no pulling tails.")
        case .feed: return nil
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 6) {
                BMTitle(text: name, icon: "icon-pet", trailing: AnyView(
                    HStack(spacing: 3) {
                        Image(systemName: "flame.fill").foregroundStyle(.orange)
                        Text("\(pet.streak)").font(BM.display(13)).foregroundStyle(.white)
                    }
                    .padding(.horizontal, 8).padding(.vertical, 3)
                    .background(Capsule().fill(.black.opacity(0.22)))
                    .accessibilityLabel(L("\(pet.streak) hari berturut-turut", "\(pet.streak)-day streak"))
                ))

                ZStack(alignment: .bottom) {
                    Ellipse().fill(Color(red: 0.42, green: 0.78, blue: 0.40)).frame(height: 30).offset(y: 6)
                    if busy == .feed {
                        Image("prop-mangkuk").resizable().scaledToFit().frame(width: 44).offset(x: 46, y: 2)
                    }
                    if busy == .water {
                        Image("prop-minum").resizable().scaledToFit().frame(width: 52).offset(x: 46, y: 2)
                    }
                    Image(catImage)
                        .resizable().scaledToFit()
                        .frame(height: 104)
                        .offset(y: hop ? -6 : 0)
                        .rotationEffect(.degrees(wiggle ? 4 : 0), anchor: .bottom)
                    if busy == .clean {
                        Image(systemName: "sparkles").font(.system(size: 30)).foregroundStyle(.yellow).offset(x: -30, y: -60)
                    }
                    if let bubble {
                        Text(bubble)
                            .font(BM.display(13))
                            .foregroundStyle(Color(red: 0.17, green: 0.13, blue: 0.25))
                            .padding(.horizontal, 10).padding(.vertical, 4)
                            .background(Capsule().fill(.white))
                            .offset(x: -34, y: -92)
                            .transition(.scale.combined(with: .opacity))
                    }
                }
                .frame(height: 118)

                Text(hint).font(BM.display(12.5)).foregroundStyle(.white).multilineTextAlignment(.center)

                if shakeStep && busy == nil {
                    HStack(spacing: 5) {
                        Image(systemName: "hand.wave.fill")
                        Text(L("Goyangkan tangan!", "Shake your hand!")).font(BM.display(11.5))
                        ForEach(0..<shakesNeeded, id: \.self) { i in
                            Circle().fill(i < shakes ? BM.gold : .white.opacity(0.3)).frame(width: 7, height: 7)
                        }
                    }
                    .foregroundStyle(BM.gold)
                }

                HStack(spacing: 6) {
                    action(.feed, "fish.fill", L("Makan", "Food"))
                    action(.water, "drop.fill", L("Minum", "Water"))
                    action(.clean, "sparkles", L("Bersih", "Clean"))
                    action(.pet, "heart.fill", L("Elus", "Pat"))
                }

                if let lesson {
                    Text(lesson)
                        .font(BM.body(10.5))
                        .foregroundStyle(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .padding(.top, 2)
                }
            }
            .padding(.horizontal, 4)
        }
        .background(BM.sky(Color(red: 0.45, green: 0.70, blue: 0.98), Color(red: 0.18, green: 0.42, blue: 0.62)))
        .bmScreen()
        .onAppear {
            pet.load()
            shake.start { shook() }
        }
        .onDisappear { shake.stop() }
    }

    private func action(_ s: PetState.Step, _ symbol: String, _ label: String) -> some View {
        let isNext = pet.step == s
        let done = pet.step.rawValue > s.rawValue
        return Button {
            tap(s)
        } label: {
            VStack(spacing: 2) {
                Image(systemName: done ? "checkmark" : symbol)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(.white)
                    .frame(width: 36, height: 36)
                    .background(Circle().fill(isNext
                                              ? AnyShapeStyle(LinearGradient(colors: [BM.greenHi, BM.green], startPoint: .top, endPoint: .bottom))
                                              : AnyShapeStyle(Color.white.opacity(done ? 0.3 : 0.14))))
                    .background(Circle().fill(isNext ? BM.greenLo : .clear).offset(y: 2.5))
                Text(label).font(BM.body(9.5)).foregroundStyle(.white.opacity(isNext ? 1 : 0.7))
            }
        }
        .buttonStyle(.plain)
        .disabled(busy != nil)
        .accessibilityLabel(label)
    }

    /// One wrist shake: three of them finish the food / water / clean step.
    private func shook() {
        guard busy == nil, shakeStep else { return }
        shakes += 1
        QuickSounds.shared.play("pet-pop")
        WKInterfaceDevice.current().play(.click)
        withAnimation(.spring(response: 0.15, dampingFraction: 0.35)) { wiggle = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
            withAnimation(.spring(response: 0.2, dampingFraction: 0.5)) { wiggle = false }
        }
        if shakes >= shakesNeeded {
            shakes = 0
            tap(pet.step)
        }
    }

    private func tap(_ s: PetState.Step) {
        guard busy == nil else { return }
        guard s == pet.step else {
            WKInterfaceDevice.current().play(.directionDown)
            return
        }
        busy = s
        withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
            bubble = s == .feed ? "Bismillah" : (s == .pet ? "♥" : nil)
            hop = s == .pet
        }
        WKInterfaceDevice.current().play(.click)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.6)) {
                pet.advance()
                busy = nil
                bubble = pet.step == .done ? L("Alhamdulillah!", "Alhamdulillah!") : nil
                hop = false
            }
            WKInterfaceDevice.current().play(pet.step == .done ? .success : .click)
        }
    }
}
