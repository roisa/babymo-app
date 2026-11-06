import SwiftUI
import BabyMoKit

/// Renders a Mo character pose from the PNGs bundled with the web content
/// (`public/babymo-companion/mo-assets/`, `public/mo-pray-assets/`), keeping
/// character art identical across the web games and native screens with zero
/// asset duplication. Falls back to a brand monogram if an asset is missing.
struct MoImage: View {
    private let assetName: String

    init(emotion: MoEmotion) { self.assetName = emotion.assetName }
    init(pose: MoPrayerPose) { self.assetName = pose.assetName }

    var body: some View {
        if let image = Self.load(named: assetName) {
            // The character PNGs carry a white backdrop, so present them as a
            // deliberate "sticker card": cream surface, continuous corners,
            // hairline border — consistent with the brand card language.
            Image(uiImage: image)
                .resizable()
                .scaledToFit()
                .padding(6)
                .background(BabyMoColor.cream)
                .clipShape(RoundedRectangle(cornerRadius: BabyMoRadius.icon, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: BabyMoRadius.icon, style: .continuous)
                        .strokeBorder(BabyMoColor.hairlineStrong, lineWidth: 1)
                )
                .accessibilityLabel("Baby Mo")
        } else {
            Circle()
                .fill(BabyMoColor.goldGradient)
                .overlay(
                    Text("M")
                        .font(BabyMoFont.display(32))
                        .foregroundStyle(BabyMoColor.bg)
                )
                .accessibilityLabel("Baby Mo")
        }
    }

    /// Cache decoded images — poses repeat across screens and PNGs are large.
    private static let cache = NSCache<NSString, UIImage>()

    static func load(named name: String) -> UIImage? {
        if let cached = cache.object(forKey: name as NSString) { return cached }
        guard let resourceURL = Bundle.main.resourceURL else { return nil }

        let candidates = [
            "public/babymo-companion/mo-assets/\(name).png",
            "public/mo-pray-assets/\(name).png",
            "public/\(name).png"
        ]
        for rel in candidates {
            let url = resourceURL.appendingPathComponent(rel)
            if let image = UIImage(contentsOfFile: url.path) {
                cache.setObject(image, forKey: name as NSString)
                return image
            }
        }
        return nil
    }
}

/// The transparent Baby Mo logo from the bundle, for headers/launch moments.
struct BabyMoLogo: View {
    var body: some View {
        if let image = MoImage.load(named: "Logo_Baby_Mo_Transparant") {
            Image(uiImage: image).resizable().scaledToFit()
                .accessibilityLabel("Baby Mo")
        } else {
            Image(systemName: "sparkles")
                .foregroundStyle(BabyMoColor.gold)
        }
    }
}
