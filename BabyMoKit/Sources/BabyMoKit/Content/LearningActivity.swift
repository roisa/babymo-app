import Foundation

/// Top-level sections of the app, mirroring the product brief's modules.
public enum LearningModule: String, CaseIterable, Identifiable, Codable, Sendable {
    case learning   // Islamic Learning: hijaiyah, quran foundations, knowledge
    case duas       // Daily duas (Doa)
    case prayer     // Sholat / companion
    case games      // Interactive learning games
    case stories    // Illustrated Islamic stories

    public var id: String { rawValue }

    public var titleID: String {   // Indonesian (primary product language)
        switch self {
        case .learning: return "Belajar"
        case .duas:     return "Doa"
        case .prayer:   return "Sholat"
        case .games:    return "Game"
        case .stories:  return "Cerita"
        }
    }

    public var titleEN: String {
        switch self {
        case .learning: return "Learning"
        case .duas:     return "Daily Duas"
        case .prayer:   return "Prayer"
        case .games:    return "Games"
        case .stories:  return "Stories"
        }
    }

    public var systemImage: String {
        switch self {
        case .learning: return "character.book.closed.fill"
        case .duas:     return "moon.stars.fill"
        case .prayer:   return "hands.and.sparkles.fill"
        case .games:    return "gamecontroller.fill"
        case .stories:  return "books.vertical.fill"
        }
    }
}

/// How a learning activity is implemented today.
public enum ActivityKind: Codable, Sendable, Equatable {
    /// Reuses an existing HTML activity from the web bundle, loaded in a WebView.
    /// The associated value is the html file name relative to the `public/` dir.
    case embeddedWeb(html: String)
    /// A fully native SwiftUI screen, referenced by a stable identifier.
    case native(screen: String)
}

/// A single learning activity shown in the native catalog.
public struct LearningActivity: Identifiable, Codable, Sendable, Hashable {
    public let id: String
    public let titleID: String
    public let titleEN: String
    public let module: LearningModule
    public let kind: ActivityKind
    public let systemImage: String
    /// Rough target age band (years), used for ordering/filtering.
    public let minAge: Int
    /// Whether the activity runs fully offline (all embedded web ones do).
    public let worksOffline: Bool
    /// Whether a scaled-down form is suitable for Apple Watch.
    public let watchFriendly: Bool

    public init(
        id: String,
        titleID: String,
        titleEN: String,
        module: LearningModule,
        kind: ActivityKind,
        systemImage: String,
        minAge: Int = 3,
        worksOffline: Bool = true,
        watchFriendly: Bool = false
    ) {
        self.id = id
        self.titleID = titleID
        self.titleEN = titleEN
        self.module = module
        self.kind = kind
        self.systemImage = systemImage
        self.minAge = minAge
        self.worksOffline = worksOffline
        self.watchFriendly = watchFriendly
    }

    public func hash(into hasher: inout Hasher) { hasher.combine(id) }
    public static func == (lhs: LearningActivity, rhs: LearningActivity) -> Bool { lhs.id == rhs.id }

    /// The embedded HTML file name, if this activity is web-backed.
    public var embeddedHTML: String? {
        if case let .embeddedWeb(html) = kind { return html }
        return nil
    }
}
