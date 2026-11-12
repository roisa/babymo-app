import SwiftUI

/// The five du'a moments. Arabic and meanings are copied exactly from
/// www/babymo-doa-harian.html (same as ios/App/App/DuaIntents.swift).
struct WatchDua: Identifiable {
    let id: String
    let audio: String          // file in Audio/, without .mp3
    let symbol: String         // SF Symbol for the list
    let tint: Color
    let skyTop: Color
    let skyMid: Color
    let titleId: String
    let titleEn: String
    let subId: String
    let subEn: String
    let arabic: String
    let meaningId: String
    let meaningEn: String

    var title: String { L(titleId, titleEn) }
    var sub: String { L(subId, subEn) }
    var meaning: String { L(meaningId, meaningEn) }
    var words: [String] { arabic.split(separator: " ").map(String.init) }
}

enum WatchDuas {
    static let all: [WatchDua] = [
        WatchDua(
            id: "vehicle", audio: "d-vehicle", symbol: "car.fill",
            tint: Color(red: 0.31, green: 0.44, blue: 0.88),
            skyTop: Color(red: 0.31, green: 0.48, blue: 0.91), skyMid: Color(red: 0.16, green: 0.24, blue: 0.62),
            titleId: "Doa Naik Kendaraan", titleEn: "Du'a for Riding",
            subId: "Mau jalan-jalan? Baca doa dulu yuk!", subEn: "Off we go! Let's say the riding du'a.",
            arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
            meaningId: "Mahasuci Allah yang menundukkan kendaraan ini untuk kami, padahal kami tidak mampu menguasainya, dan sungguh kami akan kembali kepada Tuhan kami.",
            meaningEn: "Glory be to Allah who made this ride easy for us, which we could not have done ourselves, and to our Lord we will surely return."),
        WatchDua(
            id: "leave_home", audio: "d-leave_home", symbol: "door.left.hand.open",
            tint: Color(red: 0.13, green: 0.63, blue: 0.42),
            skyTop: Color(red: 0.25, green: 0.75, blue: 0.54), skyMid: Color(red: 0.11, green: 0.43, blue: 0.38),
            titleId: "Doa Keluar Rumah", titleEn: "Du'a for Leaving Home",
            subId: "Mau berangkat? Baca doa dulu sebelum keluar rumah!", subEn: "Heading out? Say the du'a before leaving home!",
            arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
            meaningId: "Dengan nama Allah, aku berserah diri kepada Allah. Tiada daya dan kekuatan kecuali dengan pertolongan Allah.",
            meaningEn: "In the name of Allah, I put my trust in Allah. There is no power and no strength except with Allah."),
        WatchDua(
            id: "enter_home", audio: "d-enter_home", symbol: "house.fill",
            tint: Color(red: 0.91, green: 0.47, blue: 0.16),
            skyTop: Color(red: 0.94, green: 0.64, blue: 0.29), skyMid: Color(red: 0.63, green: 0.32, blue: 0.18),
            titleId: "Doa Masuk Rumah", titleEn: "Du'a for Entering Home",
            subId: "Sudah sampai! Baca doa, lalu ucapkan salam.", subEn: "We're home! Say the du'a, then salam.",
            arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
            meaningId: "Dengan nama Allah kami masuk, dengan nama Allah kami keluar, dan kepada Allah Tuhan kami, kami berserah diri.",
            meaningEn: "In the name of Allah we enter, in the name of Allah we leave, and in Allah our Lord we put our trust."),
        WatchDua(
            id: "sleep", audio: "d-sleep", symbol: "moon.fill",
            tint: Color(red: 0.36, green: 0.37, blue: 0.84),
            skyTop: Color(red: 0.36, green: 0.37, blue: 0.84), skyMid: Color(red: 0.15, green: 0.16, blue: 0.43),
            titleId: "Doa Sebelum Tidur", titleEn: "Du'a Before Sleeping",
            subId: "Sudah waktunya tidur. Doa dulu, lalu tasbih bersama Mo.", subEn: "Bedtime! Say the du'a, then tasbih with Mo.",
            arabic: "بِاسْمِكَ اللَّهُمَّ أَحْيَا وَبِاسْمِكَ أَمُوتُ",
            meaningId: "Dengan nama-Mu ya Allah aku hidup dan dengan nama-Mu aku mati.",
            meaningEn: "With Your name, O Allah, I live and with Your name I die."),
        WatchDua(
            id: "wakeup", audio: "d-wakeup", symbol: "sun.max.fill",
            tint: Color(red: 0.95, green: 0.66, blue: 0.23),
            skyTop: Color(red: 1.0, green: 0.76, blue: 0.42), skyMid: Color(red: 0.88, green: 0.48, blue: 0.35),
            titleId: "Doa Bangun Tidur", titleEn: "Du'a for Waking Up",
            subId: "Selamat pagi! Ayo baca doa bangun tidur.", subEn: "Good morning! Let's say the waking-up du'a.",
            arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَمَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
            meaningId: "Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami.",
            meaningEn: "All praise to Allah who revived us after death."),
    ]

    /// Ramadan du'as (from www/doa-ramadan.js, voices d-r_*.mp3).
    static let ramadan: [WatchDua] = [
        WatchDua(
            id: "r_niat", audio: "d-r_niat", symbol: "moon.stars.fill",
            tint: Color(red: 0.42, green: 0.36, blue: 0.86),
            skyTop: Color(red: 0.42, green: 0.36, blue: 0.86), skyMid: Color(red: 0.16, green: 0.14, blue: 0.42),
            titleId: "Niat Puasa Ramadan", titleEn: "Intention to Fast Ramadan",
            subId: "Waktunya sahur! Mo berniat puasa untuk besok.", subEn: "Suhoor time! Mo makes the intention to fast tomorrow.",
            arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى",
            meaningId: "Aku berniat puasa besok untuk menunaikan kewajiban bulan Ramadan tahun ini karena Allah Ta'ala.",
            meaningEn: "I intend to fast tomorrow, to do the duty of Ramadan this year, for Allah the Most High."),
        WatchDua(
            id: "r_shaim", audio: "d-r_shaim", symbol: "face.smiling.inverse",
            tint: Color(red: 0.13, green: 0.63, blue: 0.42),
            skyTop: Color(red: 0.25, green: 0.75, blue: 0.54), skyMid: Color(red: 0.11, green: 0.43, blue: 0.38),
            titleId: "Aku Sedang Puasa", titleEn: "I'm Fasting",
            subId: "Teman mengejek? Mo tetap tenang dan bilang: aku sedang puasa!", subEn: "Someone teasing? Mo stays calm and says: I'm fasting!",
            arabic: "إِنِّي صَائِمٌ",
            meaningId: "Sesungguhnya aku sedang berpuasa.",
            meaningEn: "I am fasting."),
        WatchDua(
            id: "r_buka", audio: "d-r_buka", symbol: "sunset.fill",
            tint: Color(red: 0.91, green: 0.47, blue: 0.16),
            skyTop: Color(red: 0.98, green: 0.62, blue: 0.30), skyMid: Color(red: 0.62, green: 0.25, blue: 0.30),
            titleId: "Doa Berbuka Puasa", titleEn: "Du'a for Breaking the Fast",
            subId: "Bedug maghrib berbunyi! Baca doa ini saat berbuka.", subEn: "The maghrib drum! Say this when you break your fast.",
            arabic: "اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
            meaningId: "Ya Allah, untuk-Mu aku berpuasa dan dengan rezeki-Mu aku berbuka.",
            meaningEn: "O Allah, for You I fasted, and with Your provision I break my fast."),
        WatchDua(
            id: "r_after", audio: "d-r_after", symbol: "drop.fill",
            tint: Color(red: 0.20, green: 0.55, blue: 0.85),
            skyTop: Color(red: 0.31, green: 0.60, blue: 0.91), skyMid: Color(red: 0.16, green: 0.28, blue: 0.62),
            titleId: "Doa Sesudah Berbuka", titleEn: "Du'a After Iftar",
            subId: "Alhamdulillah, segar! Setelah minum dan makan kurma, baca doa ini.", subEn: "Alhamdulillah, fresh! After a drink and a date, say this du'a.",
            arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
            meaningId: "Telah hilang rasa haus, urat-urat telah basah, dan pahala telah tetap, insya Allah.",
            meaningEn: "The thirst is gone, the veins are moist again, and the reward is sure, if Allah wills."),
    ]

    /// The du'a that fits the time of day best (shown first on the home screen).
    static var now: WatchDua {
        let h = Calendar.current.component(.hour, from: Date())
        switch h {
        case 4..<9: return all[4]          // waking up
        case 19..<24, 0..<4: return all[3] // before sleeping
        default: return all[0]             // riding
        }
    }
}
