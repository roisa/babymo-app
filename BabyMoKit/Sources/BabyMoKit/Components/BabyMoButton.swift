import SwiftUI

/// Primary Baby Mo call-to-action button: warm gold, pill-shaped, soft shadow.
public struct BabyMoButton: View {
    public enum Style { case gold, green, ghost }

    private let title: String
    private let systemImage: String?
    private let style: Style
    private let action: () -> Void

    public init(_ title: String, systemImage: String? = nil, style: Style = .gold, action: @escaping () -> Void) {
        self.title = title
        self.systemImage = systemImage
        self.style = style
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            HStack(spacing: BabyMoSpacing.sm) {
                if let systemImage { Image(systemName: systemImage) }
                Text(title)
            }
            .font(BabyMoFont.title(17))
            .foregroundStyle(foreground)
            .frame(maxWidth: .infinity)
            .padding(.vertical, BabyMoSpacing.md)
            .padding(.horizontal, BabyMoSpacing.lg)
            .background(background)
            .clipShape(Capsule())
            .overlay(
                Capsule().strokeBorder(BabyMoColor.hairlineStrong, lineWidth: style == .ghost ? 1 : 0)
            )
            .shadow(color: .black.opacity(style == .ghost ? 0 : 0.35), radius: 12, y: 6)
        }
        .buttonStyle(.plain)
    }

    @ViewBuilder private var background: some View {
        switch style {
        case .gold:  BabyMoColor.goldGradient
        case .green: BabyMoColor.greenGradient
        case .ghost: BabyMoColor.surface
        }
    }

    private var foreground: Color {
        switch style {
        case .gold:  return BabyMoColor.bg
        case .green: return BabyMoColor.cream
        case .ghost: return BabyMoColor.cream
        }
    }
}
