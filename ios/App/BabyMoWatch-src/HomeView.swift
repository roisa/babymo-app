import SwiftUI

struct HomeView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 10) {
                // Mo greets from the top, upper body only (render 1, cut at the waist)
                ZStack(alignment: .bottomLeading) {
                    Image("mo-wave-up")
                        .resizable().scaledToFit()
                        .frame(height: 92)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                    Text("Assalamu'alaikum!")
                        .font(BM.display(16))
                        .foregroundStyle(.white)
                        .shadow(color: .black.opacity(0.4), radius: 4, y: 2)
                        .padding(.bottom, 6)
                }

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
            }
            .padding(.horizontal, 4)
        }
        .background(BM.sky(Color(red: 0.24, green: 0.27, blue: 0.72), Color(red: 0.10, green: 0.12, blue: 0.36)))
        .navigationTitle("Baby Mo")
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
