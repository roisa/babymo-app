import SwiftUI
import SwiftData
import BabyMoKit

/// Standalone Watch experience. Works offline with its own local store; Phase 7
/// syncs with iPhone/iCloud. Uses vertical paging for simple one-thumb flow.
struct WatchRootView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.scenePhase) private var scenePhase
    @Query(sort: \ChildProfile.createdAt) private var profiles: [ChildProfile]

    private var profile: ChildProfile? { profiles.first }

    var body: some View {
        Group {
            if let profile {
                TabView {
                    DailyChallengeView(profile: profile)
                    StreakView(profile: profile)
                    RewardsView(profile: profile)
                }
                .tabViewStyle(.verticalPage)
            } else {
                ProgressView().onAppear(perform: ensureProfile)
            }
        }
        .background(BabyMoColor.bg)
        .onAppear(perform: startSync)
        .onChange(of: scenePhase) { _, phase in
            if phase == .background || phase == .inactive { pushSnapshot() }
        }
    }

    /// The Watch creates a lightweight local profile so it never depends on the
    /// phone being connected (brief §6). A later sync from the iPhone replaces
    /// the placeholder identity via `ProfileSync.merge`.
    private func ensureProfile() {
        guard profiles.isEmpty else { return }
        let p = ChildProfile(name: "Teman Mo", age: 4, buddy: .mo)
        context.insert(p)
        try? context.save()
    }

    // MARK: iPhone sync (Phase 7)

    private func startSync() {
        ConnectivityBridge.shared.onSnapshotReceived = { snapshot in
            guard let profile else { return }
            ProfileSync.merge(snapshot, into: profile, in: context)
        }
        ConnectivityBridge.shared.activate()
        pushSnapshot()
    }

    private func pushSnapshot() {
        guard let profile else { return }
        ConnectivityBridge.shared.push(ProfileSync.snapshot(of: profile))
    }
}

/// A short daily Hijaiyah-recognition challenge — intentionally tiny and fast,
/// no heavy web assets on the Watch (brief §8).
struct DailyChallengeView: View {
    let profile: ChildProfile
    @Environment(\.modelContext) private var context

    @State private var question = HijaiyahQuiz.random()
    @State private var answered: Bool? = nil

    var body: some View {
        VStack(spacing: BabyMoSpacing.sm) {
            Text("Huruf apa ini?")
                .font(BabyMoFont.caption(13)).foregroundStyle(BabyMoColor.creamDim)

            Text(question.letter)
                .font(.system(size: 56, design: .serif))
                .foregroundStyle(BabyMoColor.gold)
                .minimumScaleFactor(0.5)

            ForEach(question.options, id: \.self) { option in
                Button {
                    answer(option)
                } label: {
                    Text(option)
                        .font(BabyMoFont.body(16))
                        .foregroundStyle(BabyMoColor.cream)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(tint(for: option))
            }
        }
        .padding(.horizontal, 4)
        .padding(.top, 2)
        .navigationTitle("Hijaiyah")
    }

    private func tint(for option: String) -> Color {
        guard let answered, option == question.answer else {
            return answered == false ? BabyMoColor.surface2 : BabyMoColor.green
        }
        return answered ? BabyMoColor.greenMid : BabyMoColor.green
    }

    private func answer(_ option: String) {
        let correct = option == question.answer
        answered = correct
        if correct {
            ProgressRecorder.recordWatchChallenge(for: profile, in: context)
            ConnectivityBridge.shared.push(ProfileSync.snapshot(of: profile))
            // Contextual permission ask: only after the child has engaged once.
            Task { await ReminderService.scheduleDailyReminder() }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                question = HijaiyahQuiz.random()
                answered = nil
            }
        }
    }
}

struct StreakView: View {
    let profile: ChildProfile
    private var streak: Int { StreakCalculator.currentStreak(activeDays: profile.activeDays, today: .now) }

    var body: some View {
        VStack(spacing: BabyMoSpacing.sm) {
            Image(systemName: "flame.fill")
                .font(.system(size: 40)).foregroundStyle(BabyMoColor.gold)
            Text("\(streak)")
                .font(BabyMoFont.display(44)).foregroundStyle(BabyMoColor.cream)
            Text(streak == 1 ? "hari" : "hari berturut")
                .font(BabyMoFont.caption(13)).foregroundStyle(BabyMoColor.creamDim)
        }
        .navigationTitle("Streak")
    }
}

struct RewardsView: View {
    let profile: ChildProfile
    private var earned: [Achievement] {
        let ids = Set(profile.achievementsList.map(\.achievementID))
        return AchievementCatalog.all.filter { ids.contains($0.id) }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: BabyMoSpacing.sm) {
                if earned.isEmpty {
                    Text("Belajar untuk dapat hadiah!")
                        .font(BabyMoFont.body(14)).foregroundStyle(BabyMoColor.creamDim)
                        .multilineTextAlignment(.center)
                } else {
                    ForEach(earned) { achievement in
                        HStack(spacing: BabyMoSpacing.sm) {
                            Image(systemName: achievement.systemImage).foregroundStyle(BabyMoColor.gold)
                            Text(achievement.titleID).font(BabyMoFont.body(14)).foregroundStyle(BabyMoColor.cream)
                            Spacer()
                        }
                        .padding(BabyMoSpacing.sm)
                        .background(BabyMoColor.surface)
                        .clipShape(RoundedRectangle(cornerRadius: BabyMoRadius.card, style: .continuous))
                    }
                }
            }
        }
        .navigationTitle("Hadiah")
    }
}
