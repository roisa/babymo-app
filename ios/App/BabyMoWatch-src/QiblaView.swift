import SwiftUI
import CoreLocation
import WatchKit

/// Qibla with Mo: the Kaaba direction for the city chosen in Prayer (no GPS), shown on a dial that
/// turns with the watch's compass. When the watch faces the Qibla the dial glows gold, Mo cheers and
/// the wrist gets a tap. Watches without a compass (before Series 5) see the bearing in degrees.
enum Qibla {
    static let kaaba = (lat: 21.422487, lng: 39.826206)

    /// Great-circle bearing from the city to the Kaaba, degrees clockwise from true north.
    static func bearing(from c: PrayerCity) -> Double {
        let φ1 = c.lat * .pi / 180, φ2 = kaaba.lat * .pi / 180
        let Δλ = (kaaba.lng - c.lng) * .pi / 180
        let y = sin(Δλ) * cos(φ2)
        let x = cos(φ1) * sin(φ2) - sin(φ1) * cos(φ2) * cos(Δλ)
        return (atan2(y, x) * 180 / .pi + 360).truncatingRemainder(dividingBy: 360)
    }

    /// Distance to Makkah in km (haversine), a fun fact for kids.
    static func distanceKm(from c: PrayerCity) -> Int {
        let r = 6371.0
        let φ1 = c.lat * .pi / 180, φ2 = kaaba.lat * .pi / 180
        let dφ = φ2 - φ1, dλ = (kaaba.lng - c.lng) * .pi / 180
        let a = sin(dφ / 2) * sin(dφ / 2) + cos(φ1) * cos(φ2) * sin(dλ / 2) * sin(dλ / 2)
        return Int((2 * r * atan2(sqrt(a), sqrt(1 - a))).rounded())
    }
}

/// Compass heading only — magnetic heading needs no location permission. (True heading would need
/// location, which Baby Mo never asks for; in Indonesia and Malaysia the difference is about 1°.)
final class HeadingWatcher: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var heading: Double? = nil
    let available = CLLocationManager.headingAvailable()
    private let manager = CLLocationManager()

    override init() {
        super.init()
        manager.delegate = self
        manager.headingFilter = 2
    }
    func start() { if available { manager.startUpdatingHeading() } }
    func stop() { manager.stopUpdatingHeading() }

    func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        guard newHeading.headingAccuracy >= 0 else { return }
        let h = newHeading.trueHeading >= 0 ? newHeading.trueHeading : newHeading.magneticHeading
        DispatchQueue.main.async { self.heading = h }
    }
}

struct QiblaView: View {
    @StateObject private var compass = HeadingWatcher()
    @State private var wasFacing = false
    private let city = PrayerSettings.city

    private var qibla: Double { Qibla.bearing(from: city) }
    /// How far the Qibla is from where the watch points (−180…180; 0 = facing it).
    private var offset: Double? {
        guard let h = compass.heading else { return nil }
        var d = qibla - h
        while d > 180 { d -= 360 }
        while d < -180 { d += 360 }
        return d
    }
    private var facing: Bool { offset.map { abs($0) <= 6 } ?? false }

    var body: some View {
        ScrollView {
            VStack(spacing: 6) {
                BMTitle(text: L("Arah Kiblat", "Qibla"), icon: "icon-pray")
                dial
                    .frame(width: 138, height: 138)
                    .padding(.top, 2)
                hint
                Text(L("\(city.name) · \(Int(qibla.rounded()))° dari utara", "\(city.name) · \(Int(qibla.rounded()))° from north"))
                    .font(BM.body(11)).foregroundStyle(.white.opacity(0.75))
                Text(L("Makkah \(Qibla.distanceKm(from: city).formatted()) km dari sini", "Makkah is \(Qibla.distanceKm(from: city).formatted()) km away"))
                    .font(BM.body(11)).foregroundStyle(BM.gold.opacity(0.9))
                Text(L("Ganti kota di menu Sholat.", "Change the city in Prayer."))
                    .font(BM.body(10)).foregroundStyle(.white.opacity(0.55))
            }
            .padding(.horizontal, 4)
        }
        .background(BM.sky(Color(red: 0.13, green: 0.55, blue: 0.42), Color(red: 0.06, green: 0.26, blue: 0.24)))
        .bmScreen()
        .onAppear { compass.start() }
        .onDisappear { compass.stop() }
        .onChange(of: facing) { _, now in
            if now && !wasFacing { WKInterfaceDevice.current().play(.success) }
            wasFacing = now
        }
    }

    /// A dial with N at the top that turns with the watch; the gold Kaaba marker sits at the Qibla
    /// bearing. Without a compass the dial stays still with north up.
    private var dial: some View {
        let rotation = -(compass.heading ?? 0)
        return ZStack {
            Circle().fill(.white.opacity(facing ? 0.22 : 0.10))
            Circle().stroke(facing ? BM.gold : .white.opacity(0.35), lineWidth: facing ? 4 : 2)
            ZStack {
                ForEach(0..<12) { i in
                    Capsule()
                        .fill(.white.opacity(i % 3 == 0 ? 0.7 : 0.3))
                        .frame(width: 2, height: i % 3 == 0 ? 9 : 5)
                        .offset(y: -60)
                        .rotationEffect(.degrees(Double(i) * 30))
                }
                Text("N").font(BM.display(12)).foregroundStyle(.white).offset(y: -46)
                // Kaaba marker at the Qibla bearing
                VStack(spacing: 0) {
                    Text("🕋").font(.system(size: 22))
                    Image(systemName: "arrowtriangle.down.fill")
                        .font(.system(size: 9)).foregroundStyle(BM.gold)
                }
                .offset(y: -40)
                .rotationEffect(.degrees(qibla))
            }
            .rotationEffect(.degrees(rotation))
            .animation(.easeOut(duration: 0.25), value: rotation)
            // Mo in the middle, always upright: he cheers when the watch faces the Qibla
            Image(facing ? "mo-happy-up" : "mo-dua-up")
                .resizable().scaledToFill()
                .frame(width: 54, height: 54, alignment: .top)
                .clipShape(Circle())
                .background(Circle().fill(.white.opacity(0.25)))
            // the watch's "forward" pointer
            Image(systemName: "arrowtriangle.up.fill")
                .font(.system(size: 10)).foregroundStyle(.white)
                .offset(y: -74)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(accessibilityText)
    }

    private var hint: some View {
        Group {
            if !compass.available {
                Text(L("Jam ini belum punya kompas. Kiblat ada di \(Int(qibla.rounded()))° dari utara.",
                       "This watch has no compass. The Qibla is \(Int(qibla.rounded()))° from north."))
            } else if let d = offset {
                if facing {
                    Text(L("Sudah menghadap kiblat! 🤲", "Facing the Qibla! 🤲")).foregroundStyle(BM.gold)
                } else {
                    Text(d > 0 ? L("Putar ke kanan ↻", "Turn right ↻") : L("Putar ke kiri ↺", "Turn left ↺"))
                }
            } else {
                Text(L("Gerakkan tangan membentuk angka 8 agar kompas siap.", "Move your wrist in a figure 8 to wake the compass."))
            }
        }
        .font(BM.display(13))
        .foregroundStyle(.white)
        .multilineTextAlignment(.center)
        .lineLimit(3)
        .minimumScaleFactor(0.8)
    }

    private var accessibilityText: String {
        if facing { return L("Sudah menghadap kiblat", "Facing the Qibla") }
        guard let d = offset else { return L("Kiblat \(Int(qibla.rounded())) derajat dari utara", "Qibla \(Int(qibla.rounded())) degrees from north") }
        return d > 0 ? L("Putar ke kanan \(Int(abs(d))) derajat", "Turn right \(Int(abs(d))) degrees")
                     : L("Putar ke kiri \(Int(abs(d))) derajat", "Turn left \(Int(abs(d))) degrees")
    }
}
