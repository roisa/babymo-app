import SwiftUI

/// Baby Mo brand color palette.
///
/// Values are ported verbatim from the brand design tokens defined in the web
/// app's `index.html` `:root` block (see `TECHNICAL_AUDIT.md` §4) so the native
/// apps stay pixel-consistent with the existing product identity.
public enum BabyMoColor {
    // MARK: Backgrounds
    public static let bg        = Color(hex: 0x0B1C12)
    public static let bgElev    = Color(hex: 0x0F2016)
    public static let bgElev2   = Color(hex: 0x162014)
    public static let surface   = Color(hex: 0x1A2519)
    public static let surface2  = Color(hex: 0x22301F)

    // MARK: Greens
    public static let green     = Color(hex: 0x2C5A3E)
    public static let greenMid  = Color(hex: 0x4A8860)
    public static let greenLt   = Color(hex: 0x6DB882)
    public static let greenDeep = Color(hex: 0x1E3F2A)

    // MARK: Gold
    public static let gold      = Color(hex: 0xC89040)
    public static let goldLt    = Color(hex: 0xE8B060)
    public static let goldSoft  = Color(hex: 0xB8843A)

    // MARK: Cream / text
    public static let cream      = Color(hex: 0xF0E8D8)
    public static let creamDim   = Color(hex: 0x9EA89C)
    public static let creamFaint = Color(hex: 0x5C6A5E)

    // MARK: Accents
    public static let red  = Color(hex: 0xE07060)
    public static let blue = Color(hex: 0x7AB8D8)

    // MARK: Hairlines
    public static let hairline       = Color.white.opacity(0.08)
    public static let hairlineStrong = Color.white.opacity(0.14)

    // MARK: Semantic gradients
    /// The signature deep-to-mid green background wash used behind hero areas.
    public static let heroGradient = LinearGradient(
        colors: [bgElev, bg],
        startPoint: .top,
        endPoint: .bottom
    )

    /// Warm gold gradient used for primary call-to-action surfaces.
    public static let goldGradient = LinearGradient(
        colors: [goldLt, goldSoft],
        startPoint: .top,
        endPoint: .bottom
    )

    /// Green gradient used for learning / progress surfaces.
    public static let greenGradient = LinearGradient(
        colors: [greenMid, greenDeep],
        startPoint: .top,
        endPoint: .bottom
    )
}

public extension Color {
    /// Create a `Color` from a 24-bit RGB hex literal, e.g. `Color(hex: 0xC89040)`.
    init(hex: UInt32, opacity: Double = 1.0) {
        let r = Double((hex >> 16) & 0xFF) / 255.0
        let g = Double((hex >> 8) & 0xFF) / 255.0
        let b = Double(hex & 0xFF) / 255.0
        self.init(.sRGB, red: r, green: g, blue: b, opacity: opacity)
    }
}
