import Foundation
import CoreMotion
import AVFoundation
import WatchKit

/// Counts wrist flicks / shakes from the watch's accelerometer (no permission needed).
/// Used by the tasbih ("move your hand to count") and by Mo's pet ("shake to feed").
@MainActor
final class WristShake: ObservableObject {
    enum Sensitivity: Int, CaseIterable, Identifiable {
        case gentle, normal, strong
        var id: Int { rawValue }
        /// Peak user acceleration (in g) that counts as one movement.
        var threshold: Double { [0.75, 1.05, 1.45][rawValue] }
        var label: String {
            switch self {
            case .gentle: return L("Pelan", "Gentle")
            case .normal: return L("Sedang", "Normal")
            case .strong: return L("Kuat", "Strong")
            }
        }
    }

    private let manager = CMMotionManager()
    private var lastHit = Date.distantPast
    private var armed = true
    private var onShake: (() -> Void)?
    var sensitivity: Sensitivity = .normal

    var isAvailable: Bool { manager.isDeviceMotionAvailable }

    func start(_ handler: @escaping () -> Void) {
        onShake = handler
        guard manager.isDeviceMotionAvailable, !manager.isDeviceMotionActive else { return }
        manager.deviceMotionUpdateInterval = 1.0 / 50
        manager.startDeviceMotionUpdates(to: .main) { [weak self] motion, _ in
            guard let self, let a = motion?.userAcceleration else { return }
            let g = (a.x * a.x + a.y * a.y + a.z * a.z).squareRoot()
            // one count per movement: fire on the peak, re-arm once the wrist settles
            if self.armed, g > self.sensitivity.threshold, Date().timeIntervalSince(self.lastHit) > 0.32 {
                self.armed = false
                self.lastHit = Date()
                self.onShake?()
            } else if g < self.sensitivity.threshold * 0.45 {
                self.armed = true
            }
        }
    }

    func stop() {
        if manager.isDeviceMotionActive { manager.stopDeviceMotionUpdates() }
        onShake = nil
    }
}

/// Keeps the app running with the wrist moving (a mindfulness session), so counting does not
/// stop when the screen dims. Needs the "Mindfulness" background mode (see README); without it
/// the app still counts while the screen is on.
final class DhikrSession: NSObject, WKExtendedRuntimeSessionDelegate {
    static let shared = DhikrSession()
    private var session: WKExtendedRuntimeSession?

    func begin() {
        guard session == nil || session?.state == .invalid else { return }
        let s = WKExtendedRuntimeSession()
        s.delegate = self
        s.start()
        session = s
    }

    func end() {
        session?.invalidate()
        session = nil
    }

    func extendedRuntimeSessionDidStart(_ s: WKExtendedRuntimeSession) {}
    func extendedRuntimeSessionWillExpire(_ s: WKExtendedRuntimeSession) {}
    func extendedRuntimeSession(_ s: WKExtendedRuntimeSession, didInvalidateWith reason: WKExtendedRuntimeSessionInvalidationReason, error: Error?) {
        session = nil
    }
}

/// Short sounds that must start instantly (bead click, phrase voice, pet pop).
@MainActor
final class QuickSounds {
    static let shared = QuickSounds()
    private var players: [String: AVAudioPlayer] = [:]

    func play(_ name: String) {
        if players[name] == nil {
            let url = Bundle.main.url(forResource: name, withExtension: "mp3")
                ?? Bundle.main.url(forResource: name, withExtension: "wav")
            guard let url, let p = try? AVAudioPlayer(contentsOf: url) else { return }
            p.prepareToPlay()
            players[name] = p
        }
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
        try? AVAudioSession.sharedInstance().setActive(true)
        guard let p = players[name] else { return }
        p.currentTime = 0
        p.play()
    }
}

/// Wrist tap, if haptics are on.
func bmHaptic(_ type: WKHapticType, enabled: Bool = true) {
    if enabled { WKInterfaceDevice.current().play(type) }
}
