import Foundation
import AVFoundation

/// Owns the app-wide audio session and plays the bundled intro jingle.
@MainActor
final class AudioService {
    static let shared = AudioService()
    private var player: AVAudioPlayer?
    private var playedIntroThisSession = false

    private init() {}

    /// Configure the shared session for the web hub's games and stories.
    /// `.playback` keeps sound working when the hardware silent switch is on —
    /// kids' devices are usually muted, and "the app has no sound" is the top
    /// complaint for web-audio apps. `.mixWithOthers` stays polite: game sounds
    /// mix with, rather than interrupt, a parent's podcast or music.
    func configureForWebHub() {
        try? AVAudioSession.sharedInstance().setCategory(.playback, options: [.mixWithOthers])
    }

    /// Play the intro jingle once per app session (e.g. on onboarding).
    func playIntroOnce(volume: Float = 0.6) {
        guard !playedIntroThisSession else { return }
        guard let resourceURL = Bundle.main.resourceURL else { return }
        let url = resourceURL.appendingPathComponent("public/Intro_Baby_Mo_v001_5.mp3")
        guard FileManager.default.fileExists(atPath: url.path) else { return }

        configureForWebHub()
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
