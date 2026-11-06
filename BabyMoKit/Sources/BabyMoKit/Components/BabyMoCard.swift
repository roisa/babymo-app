import SwiftUI

/// Elevated surface card with the brand's rounded corners and hairline border.
public struct BabyMoCard<Content: View>: View {
    private let padding: CGFloat
    private let content: Content

    public init(padding: CGFloat = BabyMoSpacing.lg, @ViewBuilder content: () -> Content) {
        self.padding = padding
        self.content = content()
    }

    public var body: some View {
        content
            .padding(padding)
            .background(BabyMoColor.surface)
            .clipShape(RoundedRectangle(cornerRadius: BabyMoRadius.card, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: BabyMoRadius.card, style: .continuous)
                    .strokeBorder(BabyMoColor.hairline, lineWidth: 1)
            )
    }
}

/// A small flame + number streak indicator used across all platforms.
public struct StreakBadge: View {
    private let days: Int
    public init(days: Int) { self.days = days }

    public var body: some View {
        HStack(spacing: BabyMoSpacing.xs) {
            Image(systemName: "flame.fill")
                .foregroundStyle(BabyMoColor.gold)
            Text("\(days)")
                .font(BabyMoFont.title(16))
                .foregroundStyle(BabyMoColor.cream)
        }
        .padding(.horizontal, BabyMoSpacing.md)
        .padding(.vertical, BabyMoSpacing.xs)
        .background(BabyMoColor.surface2)
        .clipShape(Capsule())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Learning streak: \(days) days")
    }
}
