import SwiftUI

/// Corner radii, spacing, and typography tokens for the Baby Mo design system.
/// Radii mirror the Apple-style continuous corner values from the web app.
public enum BabyMoRadius {
    public static let card: CGFloat   = 18
    public static let cardLg: CGFloat = 22
    public static let icon: CGFloat   = 22   // squircle look
    public static let pill: CGFloat   = 999
}

public enum BabyMoSpacing {
    public static let xs: CGFloat  = 4
    public static let sm: CGFloat  = 8
    public static let md: CGFloat  = 14
    public static let lg: CGFloat  = 18
    public static let xl: CGFloat  = 24
    public static let xxl: CGFloat = 32
}

/// Typography. Baby Mo's brand UI font is Nunito (friendly, rounded). When the
/// custom font is not registered in a given target we fall back to the system
/// rounded design, which closely matches Nunito's character, so the package
/// always renders correctly regardless of font bundling.
public enum BabyMoFont {
    private static let nunito = "Nunito"

    public static func display(_ size: CGFloat) -> Font {
        custom(weight: .heavy, size: size, fallback: .rounded)
    }

    public static func title(_ size: CGFloat) -> Font {
        custom(weight: .bold, size: size, fallback: .rounded)
    }

    public static func body(_ size: CGFloat = 16) -> Font {
        custom(weight: .semibold, size: size, fallback: .rounded)
    }

    public static func caption(_ size: CGFloat = 13) -> Font {
        custom(weight: .medium, size: size, fallback: .rounded)
    }

    /// Arabic text uses Scheherazade New where available, else the system serif.
    public static func arabic(_ size: CGFloat) -> Font {
        if fontIsAvailable("Scheherazade New") {
            return .custom("Scheherazade New", size: size)
        }
        return .system(size: size, weight: .regular, design: .serif)
    }

    private static func custom(weight: Font.Weight, size: CGFloat, fallback: Font.Design) -> Font {
        if fontIsAvailable(nunito) {
            return .custom(nunito, size: size).weight(weight)
        }
        return .system(size: size, weight: weight, design: fallback)
    }

    private static func fontIsAvailable(_ name: String) -> Bool {
        #if canImport(UIKit)
        return UIFont(name: name, size: 12) != nil
        #else
        return false
        #endif
    }
}
