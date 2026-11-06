#if canImport(WatchConnectivity)
import Foundation
import WatchConnectivity

/// Thin WatchConnectivity wrapper shared by the iPhone and Watch apps.
///
/// Uses `updateApplicationContext` (latest-state semantics, delivered when the
/// counterpart wakes) so neither device ever needs the other to be reachable —
/// per the brief, the Watch must never depend on a continuously connected phone.
public final class ConnectivityBridge: NSObject, @unchecked Sendable {
    public static let shared = ConnectivityBridge()

    private static let contextKey = "profileSnapshot"

    /// Called on the main queue whenever the counterpart sends a snapshot.
    public var onSnapshotReceived: ((ProfileSyncSnapshot) -> Void)?

    private override init() { super.init() }

    /// Activate the session. Safe to call repeatedly.
    public func activate() {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        session.delegate = self
        if session.activationState != .activated {
            session.activate()
        }
    }

    /// Push the latest profile snapshot to the counterpart (fire-and-forget).
    public func push(_ snapshot: ProfileSyncSnapshot) {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        guard session.activationState == .activated else { return }
        guard let data = try? JSONEncoder().encode(snapshot) else { return }
        // updateApplicationContext throws only for malformed payloads/session
        // state; a failed push is fine — the next push supersedes it anyway.
        try? session.updateApplicationContext([Self.contextKey: data])
    }

    private func handle(context: [String: Any]) {
        guard let data = context[Self.contextKey] as? Data,
              let snapshot = try? JSONDecoder().decode(ProfileSyncSnapshot.self, from: data)
        else { return }
        DispatchQueue.main.async { [weak self] in
            self?.onSnapshotReceived?(snapshot)
        }
    }
}

extension ConnectivityBridge: WCSessionDelegate {
    public func session(
        _ session: WCSession,
        activationDidCompleteWith activationState: WCSessionActivationState,
        error: Error?
    ) {
        // On (re)activation, consume any context delivered while inactive.
        if activationState == .activated, !session.receivedApplicationContext.isEmpty {
            handle(context: session.receivedApplicationContext)
        }
    }

    public func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        handle(context: applicationContext)
    }

    #if os(iOS)
    public func sessionDidBecomeInactive(_ session: WCSession) {}
    public func sessionDidDeactivate(_ session: WCSession) {
        // Re-activate for a newly paired watch.
        session.activate()
    }
    #endif
}
#endif
