import Foundation

/// The canonical catalog of Baby Mo learning activities.
///
/// Every embedded entry points at a real HTML file verified to exist in the web
/// bundle (`ios/App/App/public/`) during the Phase 1 audit. As activities are
/// rewritten in SwiftUI, flip their `kind` from `.embeddedWeb` to `.native`.
public enum ActivityCatalog {

    public static let all: [LearningActivity] = [
        // MARK: Daily Duas
        LearningActivity(
            id: "doa-harian",
            titleID: "Doa Harian",
            titleEN: "Daily Duas",
            module: .duas,
            kind: .embeddedWeb(html: "babymo-doa-harian.html"),
            systemImage: "moon.stars.fill",
            minAge: 3,
            watchFriendly: true
        ),
        LearningActivity(
            id: "dua-game",
            titleID: "Tebak Doa",
            titleEN: "Dua Match Game",
            module: .duas,
            kind: .embeddedWeb(html: "babymo-dua-game.html"),
            systemImage: "sparkle.magnifyingglass",
            minAge: 4
        ),

        // MARK: Islamic Learning
        LearningActivity(
            id: "hijaiyah",
            titleID: "Hijaiyah",
            titleEN: "Hijaiyah Letters",
            module: .learning,
            kind: .embeddedWeb(html: "babymo-hijaiyah.html"),
            systemImage: "textformat.abc",
            minAge: 3,
            watchFriendly: true
        ),
        LearningActivity(
            id: "arabic-spelling",
            titleID: "Eja Bahasa Arab",
            titleEN: "Arabic Spelling",
            module: .learning,
            kind: .embeddedWeb(html: "babymo-arabic-spelling.html"),
            systemImage: "character.book.closed.fill",
            minAge: 5
        ),
        LearningActivity(
            id: "forehand-beat",
            titleID: "Ketukan Mo",
            titleEN: "Beat with Mo",
            module: .learning,
            kind: .embeddedWeb(html: "baby-mo-forehand-beat.html"),
            systemImage: "music.note",
            minAge: 4
        ),

        // MARK: Prayer / Sholat
        LearningActivity(
            id: "pray-with-mo",
            titleID: "Sholat Bareng Mo",
            titleEN: "Pray with Mo",
            module: .prayer,
            kind: .embeddedWeb(html: "babymo-pray-with-mo.html"),
            systemImage: "hands.and.sparkles.fill",
            minAge: 4
        ),
        LearningActivity(
            id: "companion",
            titleID: "Teman Sholat",
            titleEN: "Prayer Companion",
            module: .prayer,
            kind: .embeddedWeb(html: "babymo-companion/index.html"),
            systemImage: "person.2.fill",
            minAge: 4
        ),

        // MARK: Games
        LearningActivity(
            id: "memory-match",
            titleID: "Tebak Pasangan",
            titleEN: "Memory Match",
            module: .games,
            kind: .embeddedWeb(html: "babymo-memory-match.html"),
            systemImage: "square.grid.2x2.fill",
            minAge: 4
        ),
        LearningActivity(
            id: "look-and-find",
            titleID: "Cari & Temukan",
            titleEN: "Look & Find",
            module: .games,
            kind: .embeddedWeb(html: "babymo-look-and-find.html"),
            systemImage: "magnifyingglass",
            minAge: 4
        ),
        LearningActivity(
            id: "puzzle",
            titleID: "Puzzle Mo",
            titleEN: "Mo Puzzle",
            module: .games,
            kind: .embeddedWeb(html: "babymo-puzzle.html"),
            systemImage: "puzzlepiece.fill",
            minAge: 4
        ),
        LearningActivity(
            id: "puzzle-katabaik",
            titleID: "Puzzle Kata Baik",
            titleEN: "Good Words Puzzle",
            module: .games,
            kind: .embeddedWeb(html: "babymo-puzzle-katabaik.html"),
            systemImage: "puzzlepiece.extension.fill",
            minAge: 5
        ),

        // MARK: Stories
        LearningActivity(
            id: "dreamtime",
            titleID: "Dreamtime",
            titleEN: "Dreamtime Stories",
            module: .stories,
            kind: .embeddedWeb(html: "babymo-dreamtime.html"),
            systemImage: "books.vertical.fill",
            minAge: 3
        )
    ]

    /// Activities belonging to a module, preserving catalog order.
    public static func activities(in module: LearningModule) -> [LearningActivity] {
        all.filter { $0.module == module }
    }

    /// Activities that make sense on Apple Watch (short, glanceable).
    public static var watchActivities: [LearningActivity] {
        all.filter(\.watchFriendly)
    }

    public static func activity(id: String) -> LearningActivity? {
        all.first { $0.id == id }
    }
}
