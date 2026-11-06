import SwiftUI
import WebKit
import BabyMoKit

/// Hosts an existing HTML activity from the reused web bundle inside a native
/// WKWebView. Loads from the app bundle's copied `public/` folder so every
/// relative asset (fonts, images, scripts) resolves and the activity runs fully
/// offline — preserving 100% of the current functionality (audit §6).
struct WebActivityView: UIViewRepresentable {
    let activity: LearningActivity
    /// Called when the activity screen is dismissed, with elapsed seconds.
    var onFinish: ((Int) -> Void)?

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = UIColor(BabyMoColor.bg)
        webView.scrollView.backgroundColor = UIColor(BabyMoColor.bg)
        webView.scrollView.bounces = false

        if let (fileURL, readAccess) = Self.resolveURL(for: activity) {
            webView.loadFileURL(fileURL, allowingReadAccessTo: readAccess)
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    /// Resolve the on-disk URL of the activity's HTML within the bundled
    /// `public/` folder, plus the directory to grant read access to.
    static func resolveURL(for activity: LearningActivity) -> (file: URL, readAccess: URL)? {
        guard let rel = activity.embeddedHTML,
              let resourceURL = Bundle.main.resourceURL else { return nil }
        // The web bundle is copied as a folder reference named "public".
        let publicDir = resourceURL.appendingPathComponent("public", isDirectory: true)
        let fileURL = publicDir.appendingPathComponent(rel)
        if FileManager.default.fileExists(atPath: fileURL.path) {
            return (fileURL, publicDir)
        }
        // Fallback: some build setups flatten the folder into the bundle root.
        let flat = resourceURL.appendingPathComponent(rel)
        if FileManager.default.fileExists(atPath: flat.path) {
            return (flat, resourceURL)
        }
        return nil
    }

    final class Coordinator: NSObject {}
}

/// Full-screen container that presents a web activity with a native nav bar and
/// records the session to SwiftData on dismiss.
struct ActivityScreen: View {
    let activity: LearningActivity
    let profile: ChildProfile
    @Environment(\.modelContext) private var context
    @State private var startedAt = Date()
    @State private var recorded = false

    var body: some View {
        WebActivityView(activity: activity)
            .ignoresSafeArea(edges: .bottom)
            .background(BabyMoColor.bg)
            .navigationTitle(activity.titleID)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Tutup") { finish() }
                        .tint(BabyMoColor.gold)
                }
            }
            .onDisappear { finish() }
    }

    private func finish() {
        guard !recorded else { return }
        recorded = true
        let seconds = Int(Date().timeIntervalSince(startedAt))
        guard seconds > 1 else { return }
        ProgressService.record(activity: activity, seconds: seconds, for: profile, in: context)
    }
}
