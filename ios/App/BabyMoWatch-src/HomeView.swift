import SwiftUI

struct HomeView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 10) {
                // Mo greets from the top, upper body only (render 1, cut at the waist)
                HStack(alignment: .bottom, spacing: 0) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Baby Mo")
                            .font(BM.display(20))
                            .foregroundStyle(BM.gold)
                            .shadow(color: .black.opacity(0.35), radius: 3, y: 1.5)
                        Text("Assalamu'alaikum!")
                            .font(BM.display(13.5))
                            .foregroundStyle(Color(red: 0.14, green: 0.15, blue: 0.43))
                            .lineLimit(2)
                            .minimumScaleFactor(0.8)
                            .padding(.horizontal, 9).padding(.vertical, 5)
                            .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(.white))
                    }
                    .padding(.bottom, 8)
                    Spacer(minLength: 0)
                    Image("mo-wave-up")
                        .resizable().scaledToFit()
                        .frame(height: 86)
                }

                if Ramadan.day() != nil { ramadanTile }

                NavigationLink {
                    DuaPlayerView(dua: WatchDuas.now)
                } label: {
                    HomeTile(icon: "icon-doa",
                             title: L("Doa sekarang", "Du'a now"),
                             sub: WatchDuas.now.title)
                }
                .buttonStyle(.plain)

                NavigationLink {
                    DuaMomentsView()
                } label: {
                    HomeTile(icon: "icon-doa",
                             title: L("Semua doa", "All du'as"),
                             sub: L("5 momen bersama Mo", "5 moments with Mo"))
                }
                .buttonStyle(.plain)

                NavigationLink {
                    PrayerView()
                } label: {
                    HomeTile(icon: "icon-pray",
                             title: L("Sholat", "Prayer"),
                             sub: L("Waktu sholat · \(PrayerSettings.city.name)", "Prayer times · \(PrayerSettings.city.name)"))
                }
                .buttonStyle(.plain)

                NavigationLink {
                    TasbihView()
                } label: {
                    HomeTile(icon: "icon-tasbih",
                             title: "Tasbih",
                             sub: L("Sebelum tidur · 33 · 33 · 34", "Bedtime · 33 · 33 · 34"))
                }
                .buttonStyle(.plain)

                NavigationLink {
                    PetView()
                } label: {
                    HomeTile(icon: "icon-pet",
                             title: L("Hewan Mo", "Mo's pet"),
                             sub: L("Rawat Mimi si kucing", "Look after Mimi the cat"))
                }
                .buttonStyle(.plain)

                if Ramadan.day() == nil { ramadanTile }
            }
            .padding(.horizontal, 4)
        }
        .background(BM.sky(Color(red: 0.24, green: 0.27, blue: 0.72), Color(red: 0.10, green: 0.12, blue: 0.36)))
        .bmScreen()
    }
}

extension HomeView {
    var ramadanTile: some View {
        NavigationLink {
            RamadanView()
        } label: {
            HomeTile(icon: "icon-ramadan",
                     title: "Ramadan",
                     sub: Ramadan.day().map { L("Hari ke-\($0) · sahur & buka", "Day \($0) · suhoor & iftar") }
                        ?? L("\(Ramadan.daysUntil()) hari lagi", "\(Ramadan.daysUntil()) days to go"))
        }
        .buttonStyle(.plain)
    }
}

struct HomeTile: View {
    let icon: String
    let title: String
    let sub: String

    var body: some View {
        HStack(spacing: 10) {
            Image(icon)
                .resizable().scaledToFit()
                .frame(width: 42, height: 42)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            VStack(alignment: .leading, spacing: 1) {
                Text(title).font(BM.display(15)).foregroundStyle(.white)
                Text(sub).font(BM.body(11.5)).foregroundStyle(.white.opacity(0.75)).lineLimit(2)
            }
            Spacer(minLength: 0)
        }
        .padding(8)
        .background(RoundedRectangle(cornerRadius: 20, style: .continuous).fill(.white.opacity(0.14)))
        .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(.white.opacity(0.18), lineWidth: 1))
    }
}
