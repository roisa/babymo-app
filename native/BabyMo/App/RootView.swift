import SwiftUI
import SwiftData
import WebKit
import UniformTypeIdentifiers
import BabyMoKit

/// The app's root. Hosts the latest web hub (public/index.html) full screen so
/// the app is identical to play.babymo.id and runs fully offline. The hub's own
/// navigation (language choice, themes, games, duas) lives in the web content.
/// The previous native tabbed experience is kept below as MainTabsView.
struct RootView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.scenePhase) private var scenePhase
    @Query(sort: \ChildProfile.createdAt) private var profiles: [ChildProfile]

    @State private var selectedProfileID: UUID?
    @StateObject private var hub = WebHubModel()

    private var activeProfile: ChildProfile? {
        profiles.first { $0.id == selectedProfileID } ?? profiles.first
    }

    var body: some View {
        ZStack {
            WebHubView(model: hub)
                .ignoresSafeArea()
                .background(Color.black)

            // The web hub needs a moment on cold start (web process spawn +
            // parse). Cover it with a branded loading screen instead of black.
            if !hub.isReady {
                LaunchLoadingView(progress: hub.progress)
                    .transition(.opacity)
            }
        }
        .animation(.easeOut(duration: 0.4), value: hub.isReady)
        .task {
            // Never trap the user behind the overlay if the load stalls.
            try? await Task.sleep(for: .seconds(12))
            hub.isReady = true
        }
        .onAppear {
            AudioService.shared.configureForWebHub()
            seedProfileIfRequested()
            startSync()
        }
        .onChange(of: scenePhase) { _, phase in
            // Push the latest aggregates to the Watch whenever we background —
            // applicationContext delivers it when the Watch next wakes.
            if phase == .background || phase == .inactive { pushSnapshot() }
        }
    }

    /// Test/demo hook: `--seed-profile` creates a default profile, used by UI
    /// tests and simulator verification to get past onboarding deterministically.
    private func seedProfileIfRequested() {
        guard ProcessInfo.processInfo.arguments.contains("--seed-profile"),
              profiles.isEmpty else { return }
        let profile = ChildProfile(name: "Mo Kecil", age: 5, buddy: .mo)
        context.insert(profile)
        try? context.save()
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

/// Publishes the hub's first-load state so RootView can show a branded
/// loading screen instead of a black webview during cold start.
@MainActor
final class WebHubModel: ObservableObject {
    @Published var progress: Double = 0
    @Published var isReady = false
}

/// Branded stand-in while the web hub boots: brand gradient, logo, and a real
/// progress bar fed by WKWebView.estimatedProgress.
struct LaunchLoadingView: View {
    let progress: Double

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.05, green: 0.06, blue: 0.16),
                    Color(red: 0.10, green: 0.06, blue: 0.24),
                ],
                startPoint: .top, endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 28) {
                BabyMoLogo()
                    .frame(width: 180)
                VStack(spacing: 10) {
                    ProgressView(value: min(1, max(0.05, progress)))
                        .progressViewStyle(.linear)
                        .tint(BabyMoColor.gold)
                        .frame(width: 180)
                    Text("Memuat… / Loading…")
                        .font(.footnote.weight(.bold))
                        .foregroundStyle(.white.opacity(0.7))
                }
            }
        }
    }
}

/// Full-screen WKWebView hosting the bundled web hub (public/index.html) — the
/// same build deployed to play.babymo.id. Content is served through a custom
/// URL scheme (babymo://localhost/) so site-root absolute paths like
/// "/bm-prayer.js" and same-origin fetch() work exactly as they do on the web —
/// they would silently break if the pages were loaded as plain file:// URLs.
/// External links open in Safari.
struct WebHubView: UIViewRepresentable {
    static let scheme = "babymo"
    @ObservedObject var model: WebHubModel

    func makeCoordinator() -> Coordinator { Coordinator(model: model) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.setURLSchemeHandler(LocalContentSchemeHandler(), forURLScheme: Self.scheme)

        // navigator.vibrate doesn't exist in WKWebView, so the games' haptic
        // calls are no-ops. Shim it to forward patterns to native haptics.
        let vibrateShim = WKUserScript(
            source: """
            navigator.vibrate = function (pattern) {
                try {
                    window.webkit.messageHandlers.bmHaptic.postMessage(
                        Array.isArray(pattern) ? pattern : [pattern || 0]
                    );
                } catch (e) {}
                return true;
            };
            // Tell native when real pixels are on screen (load + two frames),
            // so the launch overlay drops only after the hub is visible.
            window.addEventListener('load', function () {
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        try { window.webkit.messageHandlers.bmReady.postMessage(true); } catch (e) {}
                    });
                });
            });
            """,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        config.userContentController.addUserScript(vibrateShim)
        config.userContentController.add(context.coordinator, name: "bmHaptic")
        config.userContentController.add(context.coordinator, name: "bmReady")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.backgroundColor = .black
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.allowsBackForwardNavigationGestures = true

        context.coordinator.observeProgress(of: webView)
        if let url = URL(string: "\(Self.scheme)://localhost/index.html") {
            webView.load(URLRequest(url: url))
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        private let model: WebHubModel
        private var progressObservation: NSKeyValueObservation?

        init(model: WebHubModel) {
            self.model = model
        }

        func observeProgress(of webView: WKWebView) {
            progressObservation = webView.observe(\.estimatedProgress, options: [.new]) { [model] _, change in
                let value = change.newValue ?? 0
                Task { @MainActor in model.progress = value }
            }
        }

        /// Pages that play passive, watch-along content; the screen must not
        /// dim or lock in the middle of a bedtime story or guided prayer.
        private static let keepAwakePages: Set<String> = [
            "babymo-dreamtime.html", "babymo-pray-with-mo.html", "babymo-wudhu.html",
        ]

        func webView(_ webView: WKWebView,
                     decidePolicyFor navigationAction: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }
            if url.scheme == "http" || url.scheme == "https" {
                // Kids category: leaving the app requires an adult (parental gate).
                presentParentalGate(for: url)
                decisionHandler(.cancel)
            } else {
                decisionHandler(.allow)
            }
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            let page = webView.url?.lastPathComponent ?? ""
            UIApplication.shared.isIdleTimerDisabled = Self.keepAwakePages.contains(page)
        }

        func webView(_ webView: WKWebView,
                     didFailProvisionalNavigation navigation: WKNavigation!,
                     withError error: Error) {
            dismissOverlayUnlessCancelled(error)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            dismissOverlayUnlessCancelled(error)
        }

        /// The hub cancels navigations during boot (tab restore, our external
        /// link policy) — those raise NSURLErrorCancelled and must NOT drop
        /// the launch overlay; a genuine load failure must, so the user is
        /// never stuck behind it.
        private func dismissOverlayUnlessCancelled(_ error: Error) {
            guard (error as NSError).code != NSURLErrorCancelled else { return }
            Task { @MainActor in model.isReady = true }
        }

        /// The web process can be killed under memory pressure; without this
        /// the app shows a dead view until force-quit.
        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            webView.reload()
        }

        // MARK: Haptics (navigator.vibrate shim)

        private let lightImpact = UIImpactFeedbackGenerator(style: .light)
        private let mediumImpact = UIImpactFeedbackGenerator(style: .medium)
        private let heavyImpact = UIImpactFeedbackGenerator(style: .heavy)
        private let notification = UINotificationFeedbackGenerator()

        func userContentController(_ userContentController: WKUserContentController,
                                   didReceive message: WKScriptMessage) {
            if message.name == "bmReady" {
                Task { @MainActor in model.isReady = true }
                return
            }
            guard message.name == "bmHaptic",
                  let pattern = message.body as? [Any] else { return }
            let pulses = pattern.compactMap { ($0 as? NSNumber)?.doubleValue }
            // Multi-pulse patterns like [18, 40, 18] are win celebrations.
            if pulses.count > 1 {
                notification.notificationOccurred(.success)
            } else {
                switch pulses.first ?? 0 {
                case ..<16: lightImpact.impactOccurred()
                case ..<50: mediumImpact.impactOccurred()
                default: heavyImpact.impactOccurred()
                }
            }
        }

        // MARK: Parental gate

        /// Standard Kids-category gate: a multiplication question an under-6
        /// can't answer. Only on success does the link leave the app.
        private func presentParentalGate(for url: URL) {
            let a = Int.random(in: 3...9), b = Int.random(in: 2...9)
            let alert = UIAlertController(
                title: "Untuk Orang Tua · For Parents",
                message: "Tautan ini terbuka di luar aplikasi. Berapa \(a) × \(b)?\n"
                    + "This link opens outside the app. What is \(a) × \(b)?",
                preferredStyle: .alert
            )
            alert.addTextField { field in
                field.keyboardType = .numberPad
                field.placeholder = "?"
            }
            alert.addAction(UIAlertAction(title: "Batal", style: .cancel))
            alert.addAction(UIAlertAction(title: "Buka", style: .default) { [weak alert] _ in
                guard alert?.textFields?.first?.text == String(a * b) else { return }
                UIApplication.shared.open(url)
            })
            Self.topViewController()?.present(alert, animated: true)
        }

        private static func topViewController() -> UIViewController? {
            let root = UIApplication.shared.connectedScenes
                .compactMap { ($0 as? UIWindowScene)?.keyWindow }
                .first?.rootViewController
            var top = root
            while let presented = top?.presentedViewController { top = presented }
            return top
        }
    }
}

/// Serves files from the bundled `public/` folder for babymo://localhost/...
/// requests, mirroring how the GitHub Pages server exposes the same content.
final class LocalContentSchemeHandler: NSObject, WKURLSchemeHandler {
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url,
              let publicDir = Bundle.main.resourceURL?
                  .appendingPathComponent("public", isDirectory: true) else {
            urlSchemeTask.didFailWithError(URLError(.fileDoesNotExist))
            return
        }

        // URL.path drops the query string ("?view=dzikir") automatically.
        var relative = url.path
        if relative.isEmpty || relative == "/" { relative = "/index.html" }
        var fileURL = publicDir.appendingPathComponent(String(relative.dropFirst()))

        var isDirectory: ObjCBool = false
        if FileManager.default.fileExists(atPath: fileURL.path, isDirectory: &isDirectory),
           isDirectory.boolValue {
            fileURL.appendPathComponent("index.html")
        }

        guard let data = try? Data(contentsOf: fileURL) else {
            urlSchemeTask.didFailWithError(URLError(.fileDoesNotExist))
            return
        }

        let mime = Self.mimeType(for: fileURL.pathExtension)
        let response = URLResponse(url: url,
                                   mimeType: mime,
                                   expectedContentLength: data.count,
                                   textEncodingName: mime.hasPrefix("text/") ? "utf-8" : nil)
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

    private static func mimeType(for ext: String) -> String {
        // UTType misses a few web-specific types (woff2, webmanifest).
        switch ext.lowercased() {
        case "woff2": return "font/woff2"
        case "webmanifest": return "application/manifest+json"
        case "js", "mjs": return "text/javascript"
        default:
            return UTType(filenameExtension: ext)?.preferredMIMEType
                ?? "application/octet-stream"
        }
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
            // iPhone keeps ≤5 kid-facing tabs (6+ would overflow into a "More"
            // tab). The Parent Dashboard lives behind the toolbar button on
            // Home — the standard "parents' corner" pattern for kids' apps.
            TabView(selection: $selection) {
                ForEach(AppSection.tabSections) { section in
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

    /// Sections shown in the iPhone tab bar (parent moves to Home's toolbar).
    static var tabSections: [AppSection] { allCases.filter { $0 != .parent } }

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
