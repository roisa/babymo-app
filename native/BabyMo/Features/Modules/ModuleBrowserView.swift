import SwiftUI
import BabyMoKit

/// Lists activities grouped by module. Reused by Learn, Games, and Stories tabs.
struct ModuleBrowserView: View {
    let profile: ChildProfile
    let modules: [LearningModule]
    let title: String

    private let columns = [GridItem(.adaptive(minimum: 150), spacing: BabyMoSpacing.md)]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: BabyMoSpacing.xl) {
                ForEach(modules) { module in
                    let items = ActivityCatalog.activities(in: module)
                    if !items.isEmpty {
                        VStack(alignment: .leading, spacing: BabyMoSpacing.md) {
                            HStack(spacing: BabyMoSpacing.sm) {
                                Image(systemName: module.systemImage)
                                    .foregroundStyle(BabyMoColor.gold)
                                Text(module.titleID)
                                    .font(BabyMoFont.title(20)).foregroundStyle(BabyMoColor.cream)
                            }
                            LazyVGrid(columns: columns, spacing: BabyMoSpacing.md) {
                                ForEach(items) { activity in
                                    NavigationLink {
                                        ActivityScreen(activity: activity, profile: profile)
                                    } label: {
                                        ActivityTile(activity: activity)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                }
            }
            .padding(BabyMoSpacing.lg)
        }
        .background(BabyMoColor.bg.ignoresSafeArea())
        .navigationTitle(title)
    }
}
