import SwiftUI
import AVFoundation
import WatchKit

/// List of the five du'a moments.
struct DuaMomentsView: View {
    var body: some View {
        List(WatchDuas.all) { dua in
            NavigationLink {
                DuaPlayerView(dua: dua)
            } label: {
                HStack(spacing: 10) {
                    Image(systemName: dua.symbol)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(width: 32, height: 32)
                        .background(Circle().fill(dua.tint))
                    Text(dua.title)
                        .font(BM.display(14))
                        .lineLimit(2)
                }
                .padding(.vertical, 4)
            }
        }
        .navigationTitle(L("Doa", "Du'as"))
    }
}

/// Plays a bundled clip and reports progress (0…1) for the word highlight.
@MainActor
final class WatchClipPlayer: NSObject, ObservableObject, AVAudioPlayerDelegate {
    @Published var progress: Double = 0
    @Published var isPlaying = false
    private var player: AVAudioPlayer?
    private var timer: Timer?
    private var repeatsLeft = 0

    func play(_ name: String, times: Int = 1) {
        stop()
        guard let url = Bundle.main.url(forResource: name, withExtension: "mp3"),
              let p = try? AVAudioPlayer(contentsOf: url) else { return }
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio)
        try? AVAudioSession.sharedInstance().setActive(true)
        player = p
        p.delegate = self
        repeatsLeft = times - 1
        p.play()
        isPlaying = true
        timer = Timer.scheduledTimer(withTimeInterval: 0.08, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self, let p = self.player, p.duration > 0 else { return }
                self.progress = p.currentTime / p.duration
            }
        }
    }

    func stop() {
        timer?.invalidate(); timer = nil
        player?.stop(); player = nil
        isPlaying = false
    }

    nonisolated func audioPlayerDidFinishPlaying(_ p: AVAudioPlayer, successfully flag: Bool) {
        Task { @MainActor in
            if self.repeatsLeft > 0 {
                self.repeatsLeft -= 1
                p.currentTime = 0
                p.play()
                return
            }
            self.progress = 1
            self.timer?.invalidate(); self.timer = nil
            self.isPlaying = false
            WKInterfaceDevice.current().play(.success)
        }
    }
}

/// One du'a: Mo + title, Arabic with the word being read lit up, play and 2× buttons.
struct DuaPlayerView: View {
    let dua: WatchDua
    @StateObject private var audio = WatchClipPlayer()

    private var litIndex: Int {
        guard audio.isPlaying || audio.progress > 0 else { return -1 }
        return min(dua.words.count - 1, Int(audio.progress * Double(dua.words.count)))
    }

    /// Arabic as one Text so it wraps naturally right-to-left.
    private var arabicText: Text {
        dua.words.enumerated().reduce(Text("")) { acc, item in
            let (i, w) = item
            let color: Color = litIndex < 0 || audio.progress >= 1 ? .white
                : (i == litIndex ? BM.gold : (i < litIndex ? .white : .white.opacity(0.42)))
            return acc + Text(w + " ").foregroundColor(color)
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                HStack(spacing: 6) {
                    Image("mo-dua-up")
                        .resizable().scaledToFill()
                        .frame(width: 34, height: 34, alignment: .top)
                        .clipShape(Circle())
                        .background(Circle().fill(.white.opacity(0.22)))
                        .overlay(Circle().stroke(.white.opacity(0.5), lineWidth: 1.5))
                    Text(dua.title)
                        .font(BM.display(14))
                        .foregroundStyle(.white)
                        .lineLimit(2)
                    Spacer(minLength: 0)
                }

                arabicText
                    .font(BM.arabic(19))
                    .multilineTextAlignment(.center)
                    .environment(\.layoutDirection, .rightToLeft)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .padding(.horizontal, 6)
                    .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(.white.opacity(0.12)))
                    .animation(.easeOut(duration: 0.15), value: litIndex)

                HStack(spacing: 10) {
                    Button { audio.play(dua.audio, times: 2) } label: {
                        Text("2×").font(BM.display(13)).frame(width: 36, height: 36)
                    }
                    .buttonStyle(.plain)
                    .background(Circle().fill(.white.opacity(0.16)))
                    .accessibilityLabel(L("Ulangi 2 kali", "Repeat twice"))

                    Button { audio.isPlaying ? audio.stop() : audio.play(dua.audio) } label: {
                        Image(systemName: audio.isPlaying ? "pause.fill" : "play.fill")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundStyle(.white)
                            .frame(width: 50, height: 50)
                            .background(Circle().fill(LinearGradient(colors: [BM.greenHi, BM.green], startPoint: .top, endPoint: .bottom)))
                            .background(Circle().fill(BM.greenLo).offset(y: 3))
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(L("Dengarkan", "Listen"))
                }

                Text(dua.meaning)
                    .font(BM.body(12))
                    .foregroundStyle(.white.opacity(0.8))
                    .multilineTextAlignment(.center)
                    .padding(.top, 2)
            }
            .padding(.horizontal, 4)
        }
        .background(BM.sky(dua.skyTop, dua.skyMid))
        .navigationTitle(L("Doa", "Du'a"))
        .onDisappear { audio.stop() }
    }
}
