import Foundation
import AVFoundation

/// Plays the bundled Baby Mo intro jingle. Uses the `.ambient` category so the
/// hardware silent switch is respected and other audio (e.g. a parent's
/// podcast) is mixed with, not interrupted — polite defaults for a kids' app.
@MainActor
final class AudioService {
    static let shared = AudioService()
    private var player: AVAudioPlayer?
    private var playedIntroThisSession = false

    private init() {}

    /// Play the intro jingle once per app session (e.g. on onboarding).
    func playIntroOnce(volume: Float = 0.6) {
        guard !playedIntroThisSession else { return }
        guard let resourceURL = Bundle.main.resourceURL else { return }
        let url = resourceURL.appendingPathComponent("public/Intro_Baby_Mo_v001_5.mp3")
        guard FileManager.default.fileExists(atPath: url.path) else { return }

        try? AVAudioSession.sharedInstance().setCategory(.ambient, options: [.mixWithOthers])
        try? AVAudioSession.sharedInstance().setActive(true)

        guard let player = try? AVAudioPlayer(contentsOf: url) else { return }
        player.volume = volume
        player.play()
        self.player = player
        playedIntroThisSession = true
    }

    func stop() {
        player?.stop()
        player = nil
    }
}
