import Foundation

// On-device prayer times, a line-by-line port of www/bm-prayertimes.js so the watch shows
// exactly the same minutes as the Sholat tab: Kementerian Agama RI (aladhan method 20) —
// Fajr 20°, Isha 18°, Asr Shafi'i (factor 1), Maghrib = sunset, sunrise/sunset 0.833°,
// angle-based high-latitude rule, times rounded to the nearest minute.
// No network, no location: the parent picks a city (same list as the app).

struct PrayerCity: Codable, Equatable, Identifiable, Hashable {
    let name: String
    let lat: Double
    let lng: Double
    var id: String { name }

    /// Same cities as www/bm-prayer.js.
    static let all: [PrayerCity] = [
        PrayerCity(name: "Jakarta", lat: -6.2088, lng: 106.8456),
        PrayerCity(name: "Bandung", lat: -6.9175, lng: 107.6191),
        PrayerCity(name: "Surabaya", lat: -7.2575, lng: 112.7521),
        PrayerCity(name: "Malang", lat: -7.9778, lng: 112.5347),
        PrayerCity(name: "Yogyakarta", lat: -7.7956, lng: 110.3695),
        PrayerCity(name: "Semarang", lat: -6.9667, lng: 110.4167),
        PrayerCity(name: "Medan", lat: 3.5952, lng: 98.6722),
        PrayerCity(name: "Makassar", lat: -5.1477, lng: 119.4327),
        PrayerCity(name: "Denpasar", lat: -8.65, lng: 115.2167),
        PrayerCity(name: "Palembang", lat: -2.9909, lng: 104.7566),
        PrayerCity(name: "Banjarmasin", lat: -3.3186, lng: 114.5944),
    ]
}

enum Prayer: Int, CaseIterable, Identifiable {
    case fajr, dhuhr, asr, maghrib, isha
    var id: Int { rawValue }

    /// Same names as the Sholat tab.
    var name: String {
        switch self {
        case .fajr: return L("Subuh", "Fajr")
        case .dhuhr: return L("Dzuhur", "Dhuhr")
        case .asr: return L("Ashar", "Asr")
        case .maghrib: return L("Maghrib", "Maghrib")
        case .isha: return L("Isya", "Isha")
        }
    }

    var symbol: String {
        switch self {
        case .fajr: return "sunrise.fill"
        case .dhuhr: return "sun.max.fill"
        case .asr: return "sun.haze.fill"
        case .maghrib: return "sunset.fill"
        case .isha: return "moon.stars.fill"
        }
    }
}

/// The city choice is kept on the device. When an App Group is set up (see README) the
/// watch-face widget reads the same choice.
enum PrayerSettings {
    static let appGroup = "group.id.babymo.app"
    static var store: UserDefaults { UserDefaults(suiteName: appGroup) ?? .standard }

    static var city: PrayerCity {
        get {
            if let data = store.data(forKey: "bm_watch_city"),
               let c = try? JSONDecoder().decode(PrayerCity.self, from: data) { return c }
            return PrayerCity.all[0]
        }
        set {
            if let data = try? JSONEncoder().encode(newValue) { store.set(data, forKey: "bm_watch_city") }
        }
    }

    static var remindersOn: Bool {
        get { store.bool(forKey: "bm_watch_reminders") }
        set { store.set(newValue, forKey: "bm_watch_reminders") }
    }
}

enum PrayerTimes {
    private static let d2r = Double.pi / 180, r2d = 180 / Double.pi
    private static func sin(_ d: Double) -> Double { Foundation.sin(d * d2r) }
    private static func cos(_ d: Double) -> Double { Foundation.cos(d * d2r) }
    private static func tan(_ d: Double) -> Double { Foundation.tan(d * d2r) }
    private static func asin(_ x: Double) -> Double { Foundation.asin(x) * r2d }
    private static func acos(_ x: Double) -> Double { Foundation.acos(x) * r2d }
    private static func atan2(_ y: Double, _ x: Double) -> Double { Foundation.atan2(y, x) * r2d }
    private static func acot(_ x: Double) -> Double { Foundation.atan(1 / x) * r2d }
    private static func fix(_ a: Double, _ b: Double) -> Double { let r = a - b * floor(a / b); return r < 0 ? r + b : r }
    private static func fixAngle(_ a: Double) -> Double { fix(a, 360) }
    private static func fixHour(_ h: Double) -> Double { fix(h, 24) }

    // Kemenag RI (aladhan method 20)
    private static let fajrAngle = 20.0, ishaAngle = 18.0, asrFactor = 1.0, riseSet = 0.833

    private static func julian(_ year: Int, _ month: Int, _ day: Int) -> Double {
        var y = Double(year), m = Double(month)
        if m <= 2 { y -= 1; m += 12 }
        let a = floor(y / 100), b = 2 - a + floor(a / 4)
        return floor(365.25 * (y + 4716)) + floor(30.6001 * (m + 1)) + Double(day) + b - 1524.5
    }

    private static func sunPos(_ jd: Double) -> (decl: Double, eqt: Double) {
        let d = jd - 2451545.0
        let g = fixAngle(357.529 + 0.98560028 * d)
        let q = fixAngle(280.459 + 0.98564736 * d)
        let l = fixAngle(q + 1.915 * sin(g) + 0.020 * sin(2 * g))
        let e = 23.439 - 0.00000036 * d
        let ra = atan2(cos(e) * sin(l), cos(l)) / 15
        return (asin(sin(e) * sin(l)), q / 15 - fixHour(ra))
    }

    /// Hours (local clock, may be outside 0…24 before rounding) for one day.
    static func hours(year: Int, month: Int, day: Int, lat: Double, lng: Double, tz: Double) -> [String: Double] {
        let jDate = julian(year, month, day) - lng / (15 * 24)
        func midDay(_ t: Double) -> Double { fixHour(12 - sunPos(jDate + t).eqt) }
        func angleTime(_ angle: Double, _ t: Double, _ ccw: Bool = false) -> Double {
            let decl = sunPos(jDate + t).decl, noon = midDay(t)
            let h = acos((-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat))) / 15
            return noon + (ccw ? -h : h)
        }
        func asrTime(_ factor: Double, _ t: Double) -> Double {
            let decl = sunPos(jDate + t).decl
            return angleTime(-acot(factor + tan(abs(lat - decl))), t)
        }

        var t: [String: Double] = [
            "fajr": angleTime(fajrAngle, 5.0 / 24, true),
            "sunrise": angleTime(riseSet, 6.0 / 24, true),
            "dhuhr": midDay(12.0 / 24),
            "asr": asrTime(asrFactor, 13.0 / 24),
            "sunset": angleTime(riseSet, 18.0 / 24),
            "isha": angleTime(ishaAngle, 18.0 / 24),
        ]
        for k in Array(t.keys) { t[k]! += tz - lng / 15 }

        // high-latitude rule: angle based
        let night = fixHour(t["sunrise"]! - t["sunset"]!)
        let fajrMax = fajrAngle / 60 * night, ishaMax = ishaAngle / 60 * night
        if t["fajr"]!.isNaN || fixHour(t["sunrise"]! - t["fajr"]!) > fajrMax { t["fajr"] = t["sunrise"]! - fajrMax }
        if t["isha"]!.isNaN || fixHour(t["isha"]! - t["sunset"]!) > ishaMax { t["isha"] = t["sunset"]! + ishaMax }
        t["maghrib"] = t["sunset"]!
        return t
    }

    /// Minutes after local midnight, rounded to the nearest minute like the app's "HH:MM".
    static func minutes(_ h: Double) -> Int? {
        guard !h.isNaN else { return nil }
        let x = fixHour(h + 0.5 / 60)
        let hh = Int(floor(x)), mm = Int(floor((x - Double(hh)) * 60))
        return hh * 60 + mm
    }

    /// The five prayer times for the calendar day that contains `date`, in the watch's time zone.
    static func times(on date: Date, city: PrayerCity, calendar: Calendar = .current) -> [(Prayer, Date)] {
        let comps = calendar.dateComponents([.year, .month, .day], from: date)
        guard let y = comps.year, let m = comps.month, let d = comps.day,
              let startOfDay = calendar.date(from: comps),
              let noon = calendar.date(byAdding: .hour, value: 12, to: startOfDay) else { return [] }
        let tz = Double(calendar.timeZone.secondsFromGMT(for: noon)) / 3600
        let h = hours(year: y, month: m, day: d, lat: city.lat, lng: city.lng, tz: tz)
        let keys: [(Prayer, String)] = [(.fajr, "fajr"), (.dhuhr, "dhuhr"), (.asr, "asr"), (.maghrib, "maghrib"), (.isha, "isha")]
        return keys.compactMap { p, k in
            guard let mins = minutes(h[k]!),
                  let when = calendar.date(byAdding: .minute, value: mins, to: startOfDay) else { return nil }
            return (p, when)
        }
    }

    /// The next prayer from `now` (looks into tomorrow after Isha).
    static func next(after now: Date, city: PrayerCity, calendar: Calendar = .current) -> (Prayer, Date)? {
        if let n = times(on: now, city: city, calendar: calendar).first(where: { $0.1 > now }) { return n }
        guard let tomorrow = calendar.date(byAdding: .day, value: 1, to: now) else { return nil }
        return times(on: tomorrow, city: city, calendar: calendar).first
    }

    /// The prayer whose time has started (nil before Subuh).
    static func current(at now: Date, city: PrayerCity, calendar: Calendar = .current) -> Prayer? {
        times(on: now, city: city, calendar: calendar).last(where: { $0.1 <= now })?.0
    }
}
