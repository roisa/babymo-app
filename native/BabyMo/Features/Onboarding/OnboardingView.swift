import SwiftUI
import BabyMoKit

/// First-run flow: create a child profile and pick a buddy. Kept gentle and
/// large-tap-target for young users with a parent's help.
struct OnboardingView: View {
    var onComplete: (_ name: String, _ age: Int, _ buddy: BabyMoCharacter) -> Void

    @State private var name = ""
    @State private var age = 4
    @State private var buddy: BabyMoCharacter = .mo

    var body: some View {
        ScrollView {
            VStack(spacing: BabyMoSpacing.xl) {
                VStack(spacing: BabyMoSpacing.sm) {
                    MoImage(emotion: .waving)
                        .frame(height: 130)
                    Text("Assalamualaikum!")
                        .font(BabyMoFont.display(28))
                        .foregroundStyle(BabyMoColor.cream)
                    Text("Siapa yang mau belajar bareng Mo?")
                        .font(BabyMoFont.body(16))
                        .foregroundStyle(BabyMoColor.creamDim)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, BabyMoSpacing.xxl)

                BabyMoCard {
                    VStack(alignment: .leading, spacing: BabyMoSpacing.md) {
                        Text("Nama anak").font(BabyMoFont.caption()).foregroundStyle(BabyMoColor.creamDim)
                        TextField("Nama", text: $name)
                            .font(BabyMoFont.body(18))
                            .foregroundStyle(BabyMoColor.cream)
                            .textFieldStyle(.plain)
                            .padding(BabyMoSpacing.md)
                            .background(BabyMoColor.surface2)
                            .clipShape(RoundedRectangle(cornerRadius: BabyMoRadius.card, style: .continuous))

                        Text("Umur: \(age) tahun").font(BabyMoFont.caption()).foregroundStyle(BabyMoColor.creamDim)
                        Stepper("Umur", value: $age, in: 2...12)
                            .labelsHidden()
                            .tint(BabyMoColor.gold)
                    }
                }

                VStack(alignment: .leading, spacing: BabyMoSpacing.sm) {
                    Text("Pilih teman belajar")
                        .font(BabyMoFont.title(18)).foregroundStyle(BabyMoColor.cream)
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 90), spacing: BabyMoSpacing.md)], spacing: BabyMoSpacing.md) {
                        ForEach(BabyMoCharacter.allCases) { character in
                            BuddyChip(character: character, selected: buddy == character)
                                .onTapGesture { if character.hasArt { buddy = character } }
                                .opacity(character.hasArt ? 1 : 0.4)
                        }
                    }
                }

                BabyMoButton("Mulai Belajar", systemImage: "arrow.right") {
                    let trimmed = name.trimmingCharacters(in: .whitespaces)
                    onComplete(trimmed.isEmpty ? "Teman Mo" : trimmed, age, buddy)
                }
                .padding(.top, BabyMoSpacing.sm)
            }
            .padding(BabyMoSpacing.lg)
            // Keep a readable column on iPad instead of stretching edge-to-edge.
            .frame(maxWidth: 560)
            .frame(maxWidth: .infinity)
        }
        .background(BabyMoColor.heroGradient.ignoresSafeArea())
        .onAppear { AudioService.shared.playIntroOnce() }
        .onDisappear { AudioService.shared.stop() }
    }
}

private struct BuddyChip: View {
    let character: BabyMoCharacter
    let selected: Bool

    var body: some View {
        VStack(spacing: BabyMoSpacing.xs) {
            Circle()
                .fill(selected ? BabyMoColor.goldGradient : BabyMoColor.greenGradient)
                .frame(width: 64, height: 64)
                .overlay(Text(String(character.displayName.prefix(1)))
                    .font(BabyMoFont.display(26)).foregroundStyle(BabyMoColor.bg))
                .overlay(Circle().strokeBorder(selected ? BabyMoColor.gold : .clear, lineWidth: 3))
            Text(character.displayName)
                .font(BabyMoFont.caption(12)).foregroundStyle(BabyMoColor.creamDim)
                .lineLimit(1)
        }
    }
}
