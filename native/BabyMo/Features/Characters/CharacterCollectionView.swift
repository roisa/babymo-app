import SwiftUI
import BabyMoKit

/// The Baby Mo cast. Mo is playable now; others show a "coming soon" state until
/// art is provided (audit §3).
struct CharacterCollectionView: View {
    let profile: ChildProfile
    private let columns = [GridItem(.adaptive(minimum: 150), spacing: BabyMoSpacing.lg)]

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: BabyMoSpacing.lg) {
                ForEach(BabyMoCharacter.allCases) { character in
                    CharacterCard(character: character, isBuddy: character == profile.buddy)
                }
            }
            .padding(BabyMoSpacing.lg)
        }
        .background(BabyMoColor.bg.ignoresSafeArea())
        .navigationTitle("Karakter")
    }
}

private struct CharacterCard: View {
    let character: BabyMoCharacter
    let isBuddy: Bool

    var body: some View {
        BabyMoCard {
            VStack(spacing: BabyMoSpacing.sm) {
                if character == .mo {
                    MoImage(emotion: .excited)
                        .frame(width: 88, height: 88)
                } else {
                    Circle()
                        .fill(BabyMoColor.greenGradient)
                        .frame(width: 88, height: 88)
                        .overlay(
                            Text(String(character.displayName.prefix(1)))
                                .font(BabyMoFont.display(36)).foregroundStyle(BabyMoColor.bg)
                        )
                        .opacity(0.5)
                }

                Text(character.displayName)
                    .font(BabyMoFont.title(17)).foregroundStyle(BabyMoColor.cream)

                if isBuddy {
                    Label("Teman kamu", systemImage: "star.fill")
                        .font(BabyMoFont.caption(12)).foregroundStyle(BabyMoColor.gold)
                } else if !character.hasArt {
                    Text("Segera hadir")
                        .font(BabyMoFont.caption(12)).foregroundStyle(BabyMoColor.creamFaint)
                }
            }
            .frame(maxWidth: .infinity)
        }
    }
}
