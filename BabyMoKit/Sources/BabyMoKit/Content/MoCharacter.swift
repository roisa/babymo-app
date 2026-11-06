import Foundation

/// The Baby Mo cast. Only `mo` has art assets today (see `TECHNICAL_AUDIT.md` §3);
/// the others are declared so the Character Collection can show "coming soon"
/// states and so progress/rewards can reference them before art arrives.
public enum BabyMoCharacter: String, CaseIterable, Identifiable, Codable, Sendable {
    case mo
    case ais
    case adam
    case abi

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .mo:   return "Baby Mo"
        case .ais:  return "Baby Ais"
        case .adam: return "Adam"
        case .abi:  return "Abi"
        }
    }

    /// Whether illustrated assets currently exist for this character.
    public var hasArt: Bool { self == .mo }
}

/// Mo's emotional poses. Raw values are the on-disk asset file stems found under
/// `public/babymo-companion/mo-assets/` so apps can resolve them from whichever
/// bundle the images are copied into.
public enum MoEmotion: String, CaseIterable, Identifiable, Codable, Sendable {
    case waving       = "mo-waving"
    case excited      = "mo-excited"
    case grateful     = "mo-grateful"
    case hopeful      = "mo-hopeful"
    case praying      = "mo-praying"
    case sad          = "mo-sad"
    case sujood       = "mo-sujood"
    case surprised    = "mo-surprised"
    case thankful     = "mo-thankful"
    case astagfirullah = "mo-astagfirullah"

    public var id: String { rawValue }
    public var assetName: String { rawValue }
}

/// Mo's prayer (sholat) positions, from `public/mo-pray-assets/`.
public enum MoPrayerPose: String, CaseIterable, Identifiable, Codable, Sendable {
    case takbir     = "mo-takbir"
    case qiyam      = "mo-qiyam"
    case ruku       = "mo-ruku"
    case itidal     = "mo-itidal"
    case sujud      = "mo-sujud"
    case sitting    = "mo-sitting"
    case tashahhud  = "mo-tashahhud"

    public var id: String { rawValue }
    public var assetName: String { rawValue }

    /// Ordered sequence of a single rak'ah for guided-prayer features.
    public static var rakahSequence: [MoPrayerPose] {
        [.takbir, .qiyam, .ruku, .itidal, .sujud, .sitting, .sujud, .tashahhud]
    }
}
