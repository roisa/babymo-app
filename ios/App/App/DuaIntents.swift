import Foundation
import AVFoundation
import AppIntents

// Baby Mo du'a moments as iPhone Shortcuts actions.
//
// "Putar Doa Baby Mo · Play Baby Mo Du'a" plays Mo's recorded du'a out loud
// (through the car speakers when the phone is on CarPlay or car Bluetooth) and
// then shows the du'a text. Parents attach it to a Shortcuts automation such as
// "When CarPlay connects" or "When I leave home", so the app needs no location
// permission of its own. Everything stays on the device.
//
// The voices are the same files the Doa Harian game uses
// (www/doa-voice/*.mp3, bundled under public/doa-voice by `npx cap sync ios`).
// The Arabic text is copied exactly from www/babymo-doa-harian.html.

@available(iOS 16.0, *)
enum DuaMoment: String, AppEnum {
    case vehicle
    case leaveHome = "leave_home"
    case enterHome = "enter_home"
    case sleep
    case wakeup

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Momen doa · Du'a moment"

    static var caseDisplayRepresentations: [DuaMoment: DisplayRepresentation] = [
        .vehicle: "Naik kendaraan · Riding",
        .leaveHome: "Keluar rumah · Leaving home",
        .enterHome: "Masuk rumah · Entering home",
        .sleep: "Sebelum tidur · Before sleeping",
        .wakeup: "Bangun tidur · Waking up",
    ]
}

struct BabyMoDua {
    let file: String
    let titleId: String
    let titleEn: String
    let arabic: String
    let meaningId: String
    let meaningEn: String
}

enum DuaLibrary {
    static var isIndonesian: Bool {
        (Locale.preferredLanguages.first ?? "").lowercased().hasPrefix("id")
    }

    static func dua(for id: String) -> BabyMoDua? { all[id] }

    static let all: [String: BabyMoDua] = [
        "vehicle": BabyMoDua(
            file: "d-vehicle",
            titleId: "Doa Naik Kendaraan",
            titleEn: "Du'a for Riding",
            arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
            meaningId: "Mahasuci Allah yang menundukkan kendaraan ini untuk kami, padahal kami tidak mampu menguasainya, dan sungguh kami akan kembali kepada Tuhan kami.",
            meaningEn: "Glory be to Allah who made this ride easy for us, which we could not have done ourselves, and to our Lord we will surely return."),
        "leave_home": BabyMoDua(
            file: "d-leave_home",
            titleId: "Doa Keluar Rumah",
            titleEn: "Du'a for Leaving Home",
            arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
            meaningId: "Dengan nama Allah, aku berserah diri kepada Allah. Tiada daya dan kekuatan kecuali dengan pertolongan Allah.",
            meaningEn: "In the name of Allah, I put my trust in Allah. There is no power and no strength except with Allah."),
        "enter_home": BabyMoDua(
            file: "d-enter_home",
            titleId: "Doa Masuk Rumah",
            titleEn: "Du'a for Entering Home",
            arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
            meaningId: "Dengan nama Allah kami masuk, dengan nama Allah kami keluar, dan kepada Allah Tuhan kami, kami berserah diri.",
            meaningEn: "In the name of Allah we enter, in the name of Allah we leave, and in Allah our Lord we put our trust."),
        "sleep": BabyMoDua(
            file: "d-sleep",
            titleId: "Doa Sebelum Tidur",
            titleEn: "Du'a Before Sleeping",
            arabic: "بِاسْمِكَ اللَّهُمَّ أَحْيَا وَبِاسْمِكَ أَمُوتُ",
            meaningId: "Dengan nama-Mu ya Allah aku hidup dan dengan nama-Mu aku mati.",
            meaningEn: "With Your name, O Allah, I live and with Your name I die."),
        "wakeup": BabyMoDua(
            file: "d-wakeup",
            titleId: "Doa Bangun Tidur",
            titleEn: "Du'a for Waking Up",
            arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَمَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
            meaningId: "Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami.",
            meaningEn: "All praise to Allah who revived us after death."),
    ]
}

/// Plays one du'a clip and waits until it ends. The app's own audio session
/// settings are put back afterwards so the games inside the web view sound
/// exactly as before.
@MainActor
final class DuaPlayer {
    static let shared = DuaPlayer()
    private var player: AVAudioPlayer?

    func play(_ url: URL) async {
        let session = AVAudioSession.sharedInstance()
        let oldCategory = session.category
        let oldMode = session.mode
        let oldOptions = session.categoryOptions
        do {
            // .playback so it is heard even with the silent switch on;
            // .duckOthers lowers car music or a podcast while Mo speaks.
            try session.setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
            try session.setActive(true)
        } catch {
            return
        }
        defer {
            try? session.setActive(false, options: .notifyOthersOnDeactivation)
            try? session.setCategory(oldCategory, mode: oldMode, options: oldOptions)
        }
        guard let p = try? AVAudioPlayer(contentsOf: url) else { return }
        player = p
        guard p.play() else { player = nil; return }
        // Clips are 4–10 s; stop waiting after 25 s in any case.
        let deadline = Date().addingTimeInterval(25)
        while p.isPlaying && Date() < deadline {
            try? await Task.sleep(nanoseconds: 200_000_000)
        }
        player = nil
    }
}

@available(iOS 16.0, *)
struct PlayDuaIntent: AppIntent {
    static var title: LocalizedStringResource = "Putar Doa Baby Mo · Play Baby Mo Du'a"
    static var description = IntentDescription("Baby Mo membacakan doa untuk momen ini. · Baby Mo says the du'a for this moment.")
    static var openAppWhenRun: Bool = false

    @Parameter(title: "Momen · Moment", default: .vehicle)
    var moment: DuaMoment

    static var parameterSummary: some ParameterSummary {
        Summary("Putar doa \(\.$moment) · Play du'a")
    }

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        guard let dua = DuaLibrary.dua(for: moment.rawValue) else {
            return .result(dialog: "Baby Mo")
        }
        if let url = Bundle.main.url(forResource: dua.file, withExtension: "mp3", subdirectory: "public/doa-voice") {
            await DuaPlayer.shared.play(url)
        }
        let id = DuaLibrary.isIndonesian
        let text = "\(id ? dua.titleId : dua.titleEn)\n\n\(dua.arabic)\n\n\(id ? dua.meaningId : dua.meaningEn)"
        return .result(dialog: "\(text)")
    }
}

/// Shows "Doa Baby Mo" in the Shortcuts app and in Siri without any setup.
@available(iOS 16.0, *)
struct BabyMoShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: PlayDuaIntent(),
            phrases: [
                "Doa \(.applicationName)",
                "Putar doa \(.applicationName)",
                "Play \(.applicationName) du'a",
            ]
        )
    }
}
