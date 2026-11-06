import Foundation

/// A rewardable milestone. Rewards are small character moments, per the brief.
public struct Achievement: Identifiable, Codable, Sendable, Hashable {
    public let id: String
    public let titleID: String
    public let titleEN: String
    public let systemImage: String
    /// Mo's reaction when this is earned.
    public let celebration: MoEmotion

    public init(id: String, titleID: String, titleEN: String, systemImage: String, celebration: MoEmotion) {
        self.id = id
        self.titleID = titleID
        self.titleEN = titleEN
        self.systemImage = systemImage
        self.celebration = celebration
    }
}

public enum AchievementCatalog {
    public static let all: [Achievement] = [
        Achievement(id: "first-step", titleID: "Langkah Pertama", titleEN: "First Step",
                    systemImage: "star.fill", celebration: .excited),
        Achievement(id: "streak-3", titleID: "3 Hari Berturut", titleEN: "3-Day Streak",
                    systemImage: "flame.fill", celebration: .hopeful),
        Achievement(id: "streak-7", titleID: "Seminggu Penuh", titleEN: "7-Day Streak",
                    systemImage: "flame.circle.fill", celebration: .grateful),
        Achievement(id: "hijaiyah-master", titleID: "Jago Hijaiyah", titleEN: "Hijaiyah Master",
                    systemImage: "textformat.abc", celebration: .thankful),
        Achievement(id: "dua-devotee", titleID: "Rajin Berdoa", titleEN: "Dua Devotee",
                    systemImage: "moon.stars.fill", celebration: .praying),
        Achievement(id: "ten-activities", titleID: "10 Aktivitas", titleEN: "10 Activities",
                    systemImage: "10.circle.fill", celebration: .surprised)
    ]

    public static func achievement(id: String) -> Achievement? {
        all.first { $0.id == id }
    }
}
