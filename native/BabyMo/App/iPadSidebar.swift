import SwiftUI
import BabyMoKit

/// iPad layout: a persistent sidebar + large detail pane. Deliberately different
/// from the iPhone tab bar so the tablet feels native, not stretched (Phase 5).
///
/// Rows are explicit Buttons (not `List(selection:)`) so taps always update the
/// selection, with a manual gold highlight for the active section.
struct iPadSidebar: View {
    let profile: ChildProfile
    @Binding var selection: AppSection

    var body: some View {
        NavigationSplitView {
            List {
                ForEach(AppSection.allCases) { section in
                    Button {
                        selection = section
                    } label: {
                        Label(section.title, systemImage: section.systemImage)
                            .font(BabyMoFont.body(17))
                            .foregroundStyle(selection == section ? BabyMoColor.gold : BabyMoColor.cream)
                    }
                    .buttonStyle(.plain)
                    .listRowBackground(
                        RoundedRectangle(cornerRadius: BabyMoRadius.card, style: .continuous)
                            .fill(selection == section ? BabyMoColor.surface2 : .clear)
                    )
                    .accessibilityIdentifier("sidebar-\(section.rawValue)")
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
