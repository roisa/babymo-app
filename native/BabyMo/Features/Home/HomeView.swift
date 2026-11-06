import SwiftUI
import SwiftData
import BabyMoKit

/// Personalized home: welcome, streak, a daily activity, and quick access to
/// learning. Mirrors the web home tab but native.
struct HomeView: View {
    let profile: ChildProfile

    private var streak: Int { ProgressService.currentStreak(for: profile) }

    /// A stable "activity of the day" chosen from the catalog by day-of-year so
    /// it changes daily without needing randomness.
    private var daily: LearningActivity {
        let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: .now) ?? 1
        let pool = ActivityCatalog.all
        return pool[dayOfYear % pool.count]
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: BabyMoSpacing.xl) {
                header
                dailyCard
                quickLinks
            }
            .padding(BabyMoSpacing.lg)
        }
        .background(BabyMoColor.heroGradient.ignoresSafeArea())
        .navigationTitle("Baby Mo")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var header: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: BabyMoSpacing.xs) {
                Text("Assalamualaikum,")
                    .font(BabyMoFont.body(16)).foregroundStyle(BabyMoColor.creamDim)
                Text(profile.name)
                    .font(BabyMoFont.display(30)).foregroundStyle(BabyMoColor.cream)
            }
            Spacer()
            StreakBadge(days: streak)
        }
        .padding(.top, BabyMoSpacing.sm)
    }

    private var dailyCard: some View {
        NavigationLink {
            ActivityScreen(activity: daily, profile: profile)
        } label: {
            BabyMoCard(padding: 0) {
                VStack(alignment: .leading, spacing: 0) {
                    ZStack {
                        BabyMoColor.goldGradient
                        Image(systemName: daily.systemImage)
                            .font(.system(size: 52))
                            .foregroundStyle(BabyMoColor.bg.opacity(0.85))
                    }
                    .frame(height: 140)

                    VStack(alignment: .leading, spacing: BabyMoSpacing.xs) {
                        Text("Aktivitas Hari Ini")
                            .font(BabyMoFont.caption()).foregroundStyle(BabyMoColor.gold)
                        Text(daily.titleID)
                            .font(BabyMoFont.title(20)).foregroundStyle(BabyMoColor.cream)
                        Text(daily.titleEN)
                            .font(BabyMoFont.caption(13)).foregroundStyle(BabyMoColor.creamDim)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(BabyMoSpacing.lg)
                }
            }
        }
        .buttonStyle(.plain)
    }

    private var quickLinks: some View {
        VStack(alignment: .leading, spacing: BabyMoSpacing.md) {
            Text("Lanjut Belajar")
                .font(BabyMoFont.title(18)).foregroundStyle(BabyMoColor.cream)
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: BabyMoSpacing.md) {
                ForEach(Array(ActivityCatalog.all.prefix(6))) { activity in
                    NavigationLink {
                        ActivityScreen(activity: activity, profile: profile)
                    } label: {
                        ActivityTile(activity: activity)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

/// Compact tile for an activity, used on Home and in module grids.
struct ActivityTile: View {
    let activity: LearningActivity

    var body: some View {
        BabyMoCard {
            VStack(alignment: .leading, spacing: BabyMoSpacing.sm) {
                Image(systemName: activity.systemImage)
                    .font(.system(size: 26))
                    .foregroundStyle(BabyMoColor.gold)
                Text(activity.titleID)
                    .font(BabyMoFont.title(15)).foregroundStyle(BabyMoColor.cream)
                    .lineLimit(2, reservesSpace: true)
                    .multilineTextAlignment(.leading)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}
