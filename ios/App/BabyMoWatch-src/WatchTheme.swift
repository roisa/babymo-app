import SwiftUI

/// Indonesian when the watch's first language is Indonesian, English otherwise.
func L(_ id: String, _ en: String) -> String {
    (Locale.preferredLanguages.first ?? "").lowercased().hasPrefix("id") ? id : en
}

enum BM {
    static let green = Color(red: 0.13, green: 0.63, blue: 0.29)        // #22A04B
    static let greenHi = Color(red: 0.34, green: 0.86, blue: 0.53)      // #56DB86
    static let greenLo = Color(red: 0.08, green: 0.50, blue: 0.24)      // #15803D
    static let gold = Color(red: 1.0, green: 0.82, blue: 0.36)          // #FFD15C
    static let night = Color(red: 0.03, green: 0.04, blue: 0.14)        // #080A24

    static func display(_ size: CGFloat) -> Font { .system(size: size, weight: .heavy, design: .rounded) }
    static func body(_ size: CGFloat) -> Font { .system(size: size, weight: .semibold, design: .rounded) }
    static func arabic(_ size: CGFloat) -> Font { .system(size: size, weight: .semibold) }

    /// Soft glow from the top, like the mockup (each du'a moment has its own colour).
    static func sky(_ top: Color, _ mid: Color) -> some View {
        RadialGradient(colors: [top, mid, night], center: .top, startRadius: 0, endRadius: 300)
            .ignoresSafeArea()
    }
}

/// The app's green 3D button.
struct BMButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(BM.display(15))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, minHeight: 40)
            .background(
                Capsule().fill(LinearGradient(colors: [BM.greenHi, BM.green], startPoint: .top, endPoint: .bottom))
            )
            .background(Capsule().fill(BM.greenLo).offset(y: 3))
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
    }
}

/// Screen title in the Baby Mo style: the game's icon + a bold rounded white title.
/// Replaces the grey system navigation title, which was hard to read on the colourful skies.
struct BMTitle: View {
    let text: String
    var icon: String? = nil
    var trailing: AnyView? = nil

    var body: some View {
        HStack(spacing: 7) {
            if let icon {
                Image(icon)
                    .resizable().scaledToFit()
                    .frame(width: 24, height: 24)
                    .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))
                    .shadow(color: .black.opacity(0.3), radius: 2, y: 1)
            }
            Text(text)
                .font(BM.display(19))
                .foregroundStyle(.white)
                .shadow(color: .black.opacity(0.35), radius: 3, y: 1.5)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Spacer(minLength: 0)
            if let trailing { trailing }
        }
        .padding(.horizontal, 4)
        .accessibilityAddTraits(.isHeader)
    }
}

extension View {
    /// Hide the grey system title (the back button stays) — the screen draws its own BMTitle.
    func bmScreen() -> some View {
        self.navigationTitle("")
    }
}
