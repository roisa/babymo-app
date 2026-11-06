import SwiftUI
import BabyMoKit

/// iPad layout: a persistent sidebar + large detail pane. Deliberately different
/// from the iPhone tab bar so the tablet feels native, not stretched (Phase 5).
struct iPadSidebar: View {
    let profile: ChildProfile
    @Binding var selection: AppSection

    /// NavigationSplitView sidebar single-selection requires an optional binding.
    private var optionalSelection: Binding<AppSection?> {
        Binding(get: { selection }, set: { if let new = $0 { selection = new } })
    }

    var body: some View {
        NavigationSplitView {
            List(selection: optionalSelection) {
                ForEach(AppSection.allCases) { section in
                    Label(section.title, systemImage: section.systemImage)
                        .font(BabyMoFont.body(17))
                        .tag(section)
                }
            }
            .navigationTitle("Baby Mo")
            .scrollContentBackground(.hidden)
            .background(BabyMoColor.bgElev)
        } detail: {
            selection.destination(profile: profile)
        }
        .tint(BabyMoColor.gold)
    }
}
