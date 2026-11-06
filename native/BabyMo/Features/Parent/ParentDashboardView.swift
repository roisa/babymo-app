import SwiftUI
import SwiftData
import BabyMoKit

/// Parent dashboard: learning time, streak, completed activities, achievements.
struct ParentDashboardView: View {
    let profile: ChildProfile

    private var completed: [ActivityRecord] {
        profile.recordsList.filter(\.completed).sorted { $0.completedAt > $1.completedAt }
    }
    private var totalMinutes: Int { profile.totalLearningSeconds / 60 }
    private var streak: Int { ProgressService.currentStreak(for: profile) }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: BabyMoSpacing.xl) {
                statsRow
                achievementsSection
                historySection
            }
            .padding(BabyMoSpacing.lg)
        }
        .background(BabyMoColor.bg.ignoresSafeArea())
        .navigationTitle("Orang Tua")
    }

    private var statsRow: some View {
        HStack(spacing: BabyMoSpacing.md) {
            StatCard(value: "\(totalMinutes)", unit: "menit belajar", systemImage: "clock.fill")
            StatCard(value: "\(streak)", unit: "hari berturut", systemImage: "flame.fill")
            StatCard(value: "\(completed.count)", unit: "aktivitas", systemImage: "checkmark.seal.fill")
        }
    }

    private var achievementsSection: some View {
        VStack(alignment: .leading, spacing: BabyMoSpacing.md) {
            Text("Pencapaian").font(BabyMoFont.title(18)).foregroundStyle(BabyMoColor.cream)
            let earnedIDs = Set(profile.achievementsList.map(\.achievementID))
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 100), spacing: BabyMoSpacing.md)], spacing: BabyMoSpacing.md) {
                ForEach(AchievementCatalog.all) { achievement in
                    let unlocked = earnedIDs.contains(achievement.id)
                    VStack(spacing: BabyMoSpacing.xs) {
                        Image(systemName: achievement.systemImage)
                            .font(.system(size: 26))
                            .foregroundStyle(unlocked ? BabyMoColor.gold : BabyMoColor.creamFaint)
                        Text(achievement.titleID)
                            .font(BabyMoFont.caption(11)).foregroundStyle(unlocked ? BabyMoColor.cream : BabyMoColor.creamFaint)
                            .multilineTextAlignment(.center).lineLimit(2, reservesSpace: true)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(BabyMoSpacing.md)
                    .background(BabyMoColor.surface)
                    .clipShape(RoundedRectangle(cornerRadius: BabyMoRadius.card, style: .continuous))
                    .opacity(unlocked ? 1 : 0.55)
                }
            }
        }
    }

    private var historySection: some View {
        VStack(alignment: .leading, spacing: BabyMoSpacing.md) {
            Text("Riwayat Belajar").font(BabyMoFont.title(18)).foregroundStyle(BabyMoColor.cream)
            if completed.isEmpty {
                Text("Belum ada aktivitas selesai.")
                    .font(BabyMoFont.body(15)).foregroundStyle(BabyMoColor.creamDim)
            } else {
                ForEach(completed.prefix(15)) { record in
                    HStack {
                        Image(systemName: ActivityCatalog.activity(id: record.activityID)?.systemImage ?? "circle.fill")
                            .foregroundStyle(BabyMoColor.greenLt)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(ActivityCatalog.activity(id: record.activityID)?.titleID ?? record.activityID)
                                .font(BabyMoFont.body(15)).foregroundStyle(BabyMoColor.cream)
                            Text(record.completedAt.formatted(date: .abbreviated, time: .shortened))
                                .font(BabyMoFont.caption(12)).foregroundStyle(BabyMoColor.creamDim)
                        }
                        Spacer()
                        Text("\(record.durationSeconds / 60) mnt")
                            .font(BabyMoFont.caption(12)).foregroundStyle(BabyMoColor.creamDim)
                    }
                    .padding(BabyMoSpacing.md)
                    .background(BabyMoColor.surface)
                    .clipShape(RoundedRectangle(cornerRadius: BabyMoRadius.card, style: .continuous))
                }
            }
        }
    }
}

private struct StatCard: View {
    let value: String
    let unit: String
    let systemImage: String

    var body: some View {
        VStack(spacing: BabyMoSpacing.xs) {
            Image(systemName: systemImage).foregroundStyle(BabyMoColor.gold)
            Text(value).font(BabyMoFont.display(24)).foregroundStyle(BabyMoColor.cream)
            Text(unit).font(BabyMoFont.caption(11)).foregroundStyle(BabyMoColor.creamDim)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(BabyMoSpacing.md)
        .background(BabyMoColor.surface)
        .clipShape(RoundedRectangle(cornerRadius: BabyMoRadius.card, style: .continuous))
    }
}
