import SwiftUI
import SwiftData
import BabyMoKit

/// The app's root. Shows onboarding until at least one child profile exists,
/// then the main tabbed experience. iPad gets a sidebar layout (Phase 5).
struct RootView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.scenePhase) private var scenePhase
    @Query(sort: \ChildProfile.createdAt) private var profiles: [ChildProfile]
    @Environment(\.horizontalSizeClass) private var sizeClass

    @State private var selectedProfileID: UUID?

    private var activeProfile: ChildProfile? {
        profiles.first { $0.id == selectedProfileID } ?? profiles.first
    }

    var body: some View {
        ZStack {
            BabyMoColor.bg.ignoresSafeArea()

            if let profile = activeProfile {
                MainTabsView(profile: profile, useSidebar: sizeClass == .regular)
            } else {
                OnboardingView { name, age, buddy in
                    let profile = ChildProfile(name: name, age: age, buddy: buddy)
                    context.insert(profile)
                    try? context.save()
                    selectedProfileID = profile.id
                    pushSnapshot()
                }
            }
        }
        .onAppear(perform: startSync)
        .onChange(of: scenePhase) { _, phase in
            // Push the latest aggregates to the Watch whenever we background —
            // applicationContext delivers it when the Watch next wakes.
            if phase == .background || phase == .inactive { pushSnapshot() }
        }
    }

    // MARK: Watch sync (Phase 7)

    private func startSync() {
        ConnectivityBridge.shared.onSnapshotReceived = { snapshot in
            guard let profile = activeProfile else { return }
            ProfileSync.merge(snapshot, into: profile, in: context)
        }
        ConnectivityBridge.shared.activate()
        pushSnapshot()
    }

    private func pushSnapshot() {
        guard let profile = activeProfile else { return }
        ConnectivityBridge.shared.push(ProfileSync.snapshot(of: profile))
    }
}

/// Main tab container. Compact (iPhone) uses a bottom TabView; regular (iPad)
/// uses a NavigationSplitView sidebar — not a stretched phone UI.
struct MainTabsView: View {
    let profile: ChildProfile
    let useSidebar: Bool

    @State private var selection: AppSection = .home

    var body: some View {
        if useSidebar {
            iPadSidebar(profile: profile, selection: $selection)
        } else {
            TabView(selection: $selection) {
                ForEach(AppSection.allCases) { section in
                    section.destination(profile: profile)
                        .tabItem { Label(section.title, systemImage: section.systemImage) }
                        .tag(section)
                }
            }
        }
    }
}

/// Top-level sections of the native app (product brief modules A–F).
enum AppSection: String, CaseIterable, Identifiable {
    case home, learn, games, stories, characters, parent
    var id: String { rawValue }

    var title: String {
        switch self {
        case .home: return "Home"
        case .learn: return "Belajar"
        case .games: return "Game"
        case .stories: return "Cerita"
        case .characters: return "Karakter"
        case .parent: return "Orang Tua"
        }
    }

    var systemImage: String {
        switch self {
        case .home: return "house.fill"
        case .learn: return "character.book.closed.fill"
        case .games: return "gamecontroller.fill"
        case .stories: return "books.vertical.fill"
        case .characters: return "person.3.fill"
        case .parent: return "figure.and.child.holdinghands"
        }
    }

    @ViewBuilder
    func destination(profile: ChildProfile) -> some View {
        NavigationStack {
            switch self {
            case .home:       HomeView(profile: profile)
            case .learn:      ModuleBrowserView(profile: profile, modules: [.learning, .duas, .prayer], title: "Belajar")
            case .games:      ModuleBrowserView(profile: profile, modules: [.games], title: "Game")
            case .stories:    ModuleBrowserView(profile: profile, modules: [.stories], title: "Cerita")
            case .characters: CharacterCollectionView(profile: profile)
            case .parent:     ParentDashboardView(profile: profile)
            }
        }
    }
}
