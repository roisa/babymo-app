import SwiftUI
import UserNotifications
import WatchKit

// Baby Mo for Apple Watch.
// Home → Du'a moments (Mo's real voice, word-by-word highlight), tasbih, prayer, Ramadan,
// Mo's pet, Qibla with Mo and Wake up with Mo.
// Everything is bundled and offline; no data leaves the watch.

/// Where the app should go when it opens from a notification or a widget.
enum Route: Hashable {
    case dua(String, autoplay: Bool)
    case qibla
    case ramadan
}

/// Shared navigation state: widgets open babymo://dua/<id>, babymo://qibla, babymo://ramadan;
/// the wake-up notification opens the waking-up du'a and plays it.
final class AppRouter: ObservableObject {
    static let shared = AppRouter()
    @Published var path: [Route] = []

    func open(_ url: URL) {
        guard url.scheme == "babymo" else { return }
        switch url.host {
        case "dua":
            let id = url.lastPathComponent
            if WatchDuas.byId(id) != nil { path = [.dua(id, autoplay: false)] }
        case "qibla": path = [.qibla]
        case "ramadan": path = [.ramadan]
        default: break
        }
    }
}

final class AppDelegate: NSObject, WKApplicationDelegate, UNUserNotificationCenterDelegate {
    func applicationDidFinishLaunching() {
        UNUserNotificationCenter.current().delegate = self
        WakeUp.refresh()
    }

    // Show the wake-up alert even when the app is open.
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound])
    }

    // Tapping the wake-up alert opens the waking-up du'a and Mo reads it.
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        if response.notification.request.identifier.hasPrefix(WakeUp.prefix) {
            DispatchQueue.main.async { AppRouter.shared.path = [.dua("wakeup", autoplay: true)] }
        }
        completionHandler()
    }
}

@main
struct BabyMoWatchApp: App {
    @WKApplicationDelegateAdaptor(AppDelegate.self) private var delegate
    @StateObject private var router = AppRouter.shared

    var body: some Scene {
        WindowGroup {
            NavigationStack(path: $router.path) {
                HomeView()
                    .navigationDestination(for: Route.self) { route in
                        switch route {
                        case let .dua(id, autoplay):
                            if let d = WatchDuas.byId(id) { DuaPlayerView(dua: d, autoplay: autoplay) }
                        case .qibla: QiblaView()
                        case .ramadan: RamadanView()
                        }
                    }
            }
            .onOpenURL { router.open($0) }
        }
    }
}
