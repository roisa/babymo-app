/* Baby Mo — Doa Ramadan: the Ramadan du'a series for the Doa Harian engine.
   Loaded by babymo-doa-harian.html only with ?series=ramadan (before the page's own script), it hands the
   engine its du'as, groups, journey stages, icons and storage key (window.DOA_SERIES_DATA), and adds the
   Ramadan touches through SER.init(): the start-screen night scene and the sliding Ramadan journey, Mo's
   spoken "when" line on each du'a page with his speaking wave, a Ramadan finish card and sharing.
   Arabic texts are kept exactly as given (with harakat); scenes live in doa-ramadan-scenes.js. */
(function () {
  "use strict";
  if (window.DOA_SERIES !== "ramadan") return;
  var EN = window.BM_LANG === "en";
  function L(a, b) { return EN ? b : a; }
  try { document.documentElement.classList.add("doa-rm"); } catch (e) {}

  /* ───────── the 11 du'as ───────── */
  var DUAS = [
    { id: "r_hilal", waktu: "puasa", stage: "hilal", icon: "🌙", prop: "🌙",
      title: "Doa Melihat Hilal", desc: "Bulan sabit kecil muncul di langit! Itu hilal, tanda bulan baru.",
      arabic: "اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللَّهُ",
      latin: "Allāhumma ahillahu 'alainā bil-yumni wal-īmān, was-salāmati wal-islām, rabbī wa rabbukallāh",
      meaningId: "Ya Allah, terbitkanlah bulan ini untuk kami dengan keberkahan dan iman, keselamatan dan Islam. Tuhanku dan Tuhanmu (wahai bulan) adalah Allah.",
      meaningEn: "O Allah, let this new moon rise over us with blessings and faith, with safety and Islam. My Lord and your Lord (O moon) is Allah.",
      quizPrompt: "Doa ini dibaca saat...?", quizLabel: "Melihat Hilal", act: ["Ketuk bulan sabitnya! 🌙", "Tap the crescent! 🌙"], short: ["Hilal", "Crescent"],
      src: ["HR. Tirmidzi · dibaca saat melihat bulan sabit pertama, juga hilal Ramadan", "Reported by at-Tirmidhi · said when seeing the first crescent, like Ramadan's"] },
    { id: "r_niat", waktu: "puasa", stage: "sahur", icon: "🌌", prop: "🏮",
      title: "Niat Puasa Ramadan", desc: "Waktunya sahur! Mo berniat puasa untuk besok.",
      arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى",
      latin: "Nawaitu ṣauma ghadin 'an adā'i farḍi syahri Ramaḍāna hādhihis-sanati lillāhi ta'ālā",
      meaningId: "Aku berniat puasa besok untuk menunaikan kewajiban bulan Ramadan tahun ini karena Allah Ta'ala.",
      meaningEn: "I intend to fast tomorrow, to do the duty of Ramadan this year, for Allah the Most High.",
      quizPrompt: "Doa ini dibaca saat...?", quizLabel: "Niat Puasa", act: ["Nyalakan lampu sahur! 🏮", "Light the sahur lamp! 🏮"], short: ["Niat", "Intention"],
      src: ["Lafaz niat yang biasa diajarkan di Indonesia · niat yang sebenarnya ada di dalam hati", "The wording commonly taught in Indonesia · the real intention is in the heart"] },
    { id: "r_shaim", waktu: "puasa", stage: "puasa", icon: "😊", prop: "😊",
      title: "Aku Sedang Puasa", desc: "Teman mengejek saat puasa? Mo tetap tenang dan bilang: aku sedang puasa!",
      arabic: "إِنِّي صَائِمٌ",
      latin: "Innī ṣā'im",
      meaningId: "Sesungguhnya aku sedang berpuasa.", meaningEn: "I am fasting.",
      quizPrompt: "Doa ini dibaca saat...?", quizLabel: "Saat Diejek", act: ["Tetap tenang ya, Mo! 😊", "Stay calm, Mo! 😊"], short: ["Puasa", "Fasting"],
      src: ["HR. Bukhari & Muslim · kalau ada yang mengajak bertengkar, jawab dengan tenang", "Reported by al-Bukhari & Muslim · if someone wants to quarrel, answer calmly"] },
    { id: "r_buka", waktu: "buka", stage: "buka", icon: "🥁", prop: "🥁",
      title: "Doa Berbuka Puasa", desc: "Bedug maghrib berbunyi! Baca doa ini saat berbuka puasa.",
      arabic: "اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
      latin: "Allāhumma laka ṣumtu wa 'alā rizqika afṭartu",
      meaningId: "Ya Allah, untuk-Mu aku berpuasa dan dengan rezeki-Mu aku berbuka.",
      meaningEn: "O Allah, for You I fasted, and with Your provision I break my fast.",
      quizPrompt: "Doa ini dibaca saat...?", quizLabel: "Berbuka Puasa", act: ["Maghrib! Pukul bedugnya 🥁", "Maghrib! Beat the drum 🥁"], short: ["Berbuka", "Iftar"],
      src: ["HR. Abu Dawud", "Reported by Abu Dawud"] },
    { id: "r_after", waktu: "buka", stage: "buka", icon: "💧", prop: "🥛",
      title: "Doa Sesudah Berbuka", desc: "Alhamdulillah, segar! Setelah minum dan makan kurma, baca doa ini.",
      arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
      latin: "Dhahabaẓ-ẓama'u wabtallatil-'urūqu wa thabatal-ajru in syā' Allāh",
      meaningId: "Telah hilang rasa haus, urat-urat telah basah, dan pahala telah tetap, insya Allah.",
      meaningEn: "The thirst is gone, the veins are moist again, and the reward is sure, if Allah wills.",
      quizPrompt: "Doa ini dibaca saat...?", quizLabel: "Sesudah Berbuka", act: ["Makan kurma, minum air! 🥛", "Eat a date, sip some water! 🥛"], short: ["Segar", "Refreshed"],
      src: ["HR. Abu Dawud · Nabi ﷺ membacanya ketika berbuka", "Reported by Abu Dawud · the Prophet ﷺ said it when breaking his fast"] },
    { id: "r_host", waktu: "buka", stage: "buka", icon: "🏠", prop: "💛",
      title: "Doa untuk Tuan Rumah", desc: "Ada yang memberi kita makanan berbuka? Doakan dia dengan doa ini!",
      arabic: "أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الْأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلَائِكَةُ",
      latin: "Afṭara 'indakumuṣ-ṣā'imūn, wa akala ṭa'āmakumul-abrār, wa ṣallat 'alaikumul-malā'ikah",
      meaningId: "Semoga orang-orang yang berpuasa berbuka di tempatmu, orang-orang baik memakan makananmu, dan para malaikat mendoakanmu.",
      meaningEn: "May fasting people break their fast with you, may good people eat your food, and may the angels pray for you.",
      quizPrompt: "Doa ini dibaca untuk...?", quizLabel: "Untuk Tuan Rumah", act: ["Ucapkan terima kasih! 💛", "Say thank you! 💛"], short: ["Tuan rumah", "Host"],
      src: ["HR. Abu Dawud · doa tamu untuk yang menjamu", "Reported by Abu Dawud · a guest's du'a for the host"] },
    { id: "r_witr", waktu: "rmalam", stage: "tarawih", icon: "🕌", prop: "🏮", times: 3,
      title: "Dzikir Sesudah Witir", desc: "Selesai sholat tarawih dan witir, ucapkan dzikir ini tiga kali.",
      arabic: "سُبْحَانَ الْمَلِكِ الْقُدُّوسِ",
      latin: "Subḥānal-malikil-quddūs (3×)",
      meaningId: "Maha Suci Allah, Raja Yang Maha Suci.", meaningEn: "Glory be to Allah, the King, the Most Pure.",
      quizPrompt: "Dzikir ini dibaca saat...?", quizLabel: "Sesudah Witir", act: ["Nyalakan lenteranya! 🏮", "Light the lanterns! 🏮"], short: ["Witir", "Witr"],
      src: ["HR. An-Nasa'i · dibaca 3× — Mo membacanya tiga kali", "Reported by an-Nasa'i · said 3× — Mo reads it three times"] },
    { id: "r_qadr", waktu: "rmalam", stage: "qadr", icon: "✨", prop: "✨",
      title: "Doa Lailatul Qadar", desc: "Malam-malam terakhir Ramadan, cari Lailatul Qadar dengan doa ini.",
      arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
      latin: "Allāhumma innaka 'afuwwun tuḥibbul-'afwa fa'fu 'annī",
      meaningId: "Ya Allah, Engkau Maha Pemaaf dan suka memaafkan, maka maafkanlah aku.",
      meaningEn: "O Allah, You are the Most Forgiving and You love to forgive, so forgive me.",
      quizPrompt: "Doa ini dibaca saat...?", quizLabel: "Lailatul Qadar", act: ["Lihat langit yang tenang ✨", "Look at the calm sky ✨"], short: ["Lailatul Qadar", "Qadr Night"],
      src: ["HR. Tirmidzi · diajarkan Nabi ﷺ kepada Aisyah", "Reported by at-Tirmidhi · the Prophet ﷺ taught it to Aishah"] },
    { id: "r_zakat", waktu: "lebaran", stage: "zakat", icon: "🌾", prop: "🌾",
      title: "Niat Zakat Fitrah", desc: "Sebelum sholat Idul Fitri, Mo memberi zakat fitrah berupa beras untuk yang membutuhkan.",
      arabic: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ نَفْسِي فَرْضًا لِلَّهِ تَعَالَى",
      latin: "Nawaitu an ukhrija zakātal-fiṭri 'an nafsī farḍan lillāhi ta'ālā",
      meaningId: "Aku berniat mengeluarkan zakat fitrah untuk diriku sendiri, wajib karena Allah Ta'ala.",
      meaningEn: "I intend to give the Zakat al-Fitr for myself, as a duty for Allah the Most High.",
      quizPrompt: "Doa ini dibaca saat...?", quizLabel: "Zakat Fitrah", act: ["Berikan berasnya! 🌾", "Give the rice! 🌾"], short: ["Zakat", "Zakat"],
      src: ["Lafaz niat yang biasa diajarkan di Indonesia · untuk diri sendiri", "The wording commonly taught in Indonesia · for oneself"] },
    { id: "r_eid_greet", waktu: "lebaran", stage: "ied", icon: "🤗", prop: "✨",
      title: "Ucapan Idul Fitri", desc: "Selamat Idul Fitri! Saling mendoakan dengan ucapan ini.",
      arabic: "تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ",
      latin: "Taqabbalallāhu minnā wa minkum",
      meaningId: "Semoga Allah menerima (amal ibadah) kami dan kalian.", meaningEn: "May Allah accept (our good deeds) from us and from you.",
      quizPrompt: "Ucapan ini dibaca saat...?", quizLabel: "Ucapan Lebaran", act: ["Ketuk ketupatnya! ✨", "Tap the ketupat! ✨"], short: ["Lebaran", "Eid"],
      src: ["Ucapan para sahabat Nabi ﷺ saat hari raya", "How the Prophet's ﷺ companions greeted each other on Eid"] },
    { id: "r_takbir", waktu: "lebaran", stage: "ied", icon: "🥁", prop: "🥁",
      title: "Takbir Idul Fitri", desc: "Pagi Idul Fitri, kita bertakbir bersama-sama!",
      arabic: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ",
      latin: "Allāhu akbar, Allāhu akbar, lā ilāha illallāh, wallāhu akbar, Allāhu akbar, wa lillāhil-ḥamd",
      meaningId: "Allah Maha Besar, Allah Maha Besar, tiada Tuhan selain Allah, Allah Maha Besar, Allah Maha Besar, dan segala puji bagi Allah.",
      meaningEn: "Allah is the Greatest, Allah is the Greatest, there is no god but Allah, Allah is the Greatest, Allah is the Greatest, and all praise is for Allah.",
      quizPrompt: "Takbir ini dibaca saat...?", quizLabel: "Takbir Idul Fitri", act: ["Pukul bedug takbiran! 🥁", "Beat the Eid drum! 🥁"], short: ["Takbir", "Takbir"],
      src: ["Takbir hari raya · dari malam Idul Fitri sampai sholat Id", "The Eid takbir · from Eid night until the Eid prayer"] }
  ];
  DUAS.forEach(function (d) { d.time = ""; d.bg = "linear-gradient(160deg,#5A4AB0 0%,#1E2466 100%)"; d.quizEmoji = d.icon; });

  /* ───────── home groups (tabs) and journey stages (the strip) ───────── */
  var SKY = "linear-gradient(180deg,#2C2378 0%,#4A3A9E 26%,#9C8BD8 48%,#ECE6FF 70%,#F6F2FF 100%)",
    DARK = "linear-gradient(180deg,#0E0C2E 0%,#1C1850 40%,#141236 70%,#0E1228 100%)";
  var WAKTU = [
    { k: "puasa", id: "Puasa", en: "Fasting", e: "🌙", sky: SKY, dark: DARK, mo: "pose-12",
      hi: ["Marhaban ya Ramadan! 🌙", "Marhaban ya Ramadan! 🌙"], sub: ["Lihat hilal, sahur, lalu puasa dengan tenang.", "See the crescent, eat sahur, then fast calmly."] },
    { k: "buka", id: "Berbuka", en: "Iftar", e: "🍵", sky: SKY, dark: DARK, mo: "pose-12",
      hi: ["Waktunya berbuka! 🍵", "Time for iftar! 🍵"], sub: ["Doa berbuka, sesudah berbuka, dan untuk yang menjamu.", "Du'as for iftar, after iftar and for the host."] },
    { k: "rmalam", id: "Malam", en: "Nights", e: "🕌", sky: SKY, dark: DARK, mo: "pose-12",
      hi: ["Malam Ramadan ✨", "Ramadan nights ✨"], sub: ["Tarawih, witir, dan Lailatul Qadar.", "Tarawih, witr and Laylatul Qadr."] },
    { k: "lebaran", id: "Lebaran", en: "Eid", e: "🎉", sky: SKY, dark: DARK, mo: "pose-12",
      hi: ["Selamat Idul Fitri! 🎉", "Eid Mubarak! 🎉"], sub: ["Zakat fitrah, ucapan, dan takbir.", "Zakat al-Fitr, the greeting and the takbir."] }
  ];
  var STAGES = {
    hilal: { e: "🌙", id: "Hilal", en: "Crescent" }, sahur: { e: "🌌", id: "Sahur", en: "Sahur" }, puasa: { e: "☀️", id: "Puasa", en: "Fasting" },
    buka: { e: "🍵", id: "Berbuka", en: "Iftar" }, tarawih: { e: "🕌", id: "Tarawih & Witir", en: "Tarawih & Witr" }, qadr: { e: "✨", id: "Lailatul Qadar", en: "Laylatul Qadr" },
    zakat: { e: "🌾", id: "Zakat Fitrah", en: "Zakat al-Fitr" }, ied: { e: "🎉", id: "Idul Fitri", en: "Eid" }
  };
  var STAGE_ORDER = ["hilal", "sahur", "puasa", "buka", "tarawih", "qadr", "zakat", "ied"];

  /* the tab pictures (48×48, coloured like the daily ones) */
  var TICON = {
    puasa: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="22" r="17" fill="#FFF3B8" opacity=".55"/><path d="M30.5 7.5a15 15 0 1 0 9 24.5 12.5 12.5 0 0 1-9-24.5z" fill="#FFD866" stroke="#F2B232" stroke-width="1.6"/><path d="M38 9l1.4 3 3.2.4-2.4 2.2.6 3.2-2.8-1.6-2.8 1.6.6-3.2-2.4-2.2 3.2-.4z" fill="#FFF3B0" stroke="#F2B232" stroke-width="1" stroke-linejoin="round"/><path d="M4 41c8-4 14-4 20-1s12 3 20-1v5H4z" fill="#3FB58A"/></svg>',
    buka: '<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="40" rx="19" ry="4" fill="#F7C96A"/><path d="M6 37h36q-3 7-18 7T6 37z" fill="#E8B046"/><ellipse cx="15" cy="34" rx="6.5" ry="4" fill="#9A4A26" transform="rotate(-18 15 34)"/><ellipse cx="25" cy="33" rx="6.5" ry="4" fill="#7E3418" transform="rotate(10 25 33)"/><path d="M29 8h12l-1.6 26a2 2 0 0 1-2 1.8h-4.8a2 2 0 0 1-2-1.8z" fill="#BFE8FF" stroke="#7CC4EA" stroke-width="1.4"/><path d="M30 15h10l-1.2 18h-7.6z" fill="#6CC2F0"/><path d="M32.5 11l-.6 18" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/></svg>',
    rmalam: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="28" r="17" fill="#FFE29A" opacity=".45"/><path d="M24 2v6" stroke="#B9781C" stroke-width="1.6"/><circle cx="24" cy="9.5" r="2" fill="none" stroke="#B9781C" stroke-width="1.4"/><path d="M17 15Q24 7 31 15z" fill="#E8B046"/><rect x="15" y="14" width="18" height="3.4" rx="1.7" fill="#E8B046"/><path d="M16 17.4h16l3 8-3 13H16l-3-13z" fill="#FFB43D"/><path d="M16 17.4h16l3 8-3 13H16l-3-13z" fill="none" stroke="#B9781C" stroke-width="1.6" stroke-linejoin="round"/><path d="M21 17.4v21M27 17.4v21M13 25.4h22" stroke="#B9781C" stroke-width="1.2" opacity=".7"/><path d="M17 38.4h14l-3.4 4h-7.2z" fill="#E8B046"/><path d="M18.6 20l-1.6 6 1.6 9" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/></svg>',
    lebaran: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 2v7" stroke="#5FA53A" stroke-width="1.8"/><path d="M21 36q-6 6-3 10M27 36q7 5 4 10" stroke="#7CC64E" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M24 8L39 22 24 37 9 22z" fill="#6DBB3E"/><path d="M16.5 14.5l15 15M20 11l15 15M13 18l15 15M31.5 14.5l-15 15M28 11l-15 15M35 18l-15 15" stroke="#C6EE8A" stroke-width="2.2"/><path d="M24 8L39 22 24 37 9 22z" fill="none" stroke="#3E8F2A" stroke-width="1.4" stroke-linejoin="round"/><path d="M40 5l1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.4-2.5 1.4.5-2.8-2-2 2.8-.4z" fill="#FFD25A"/></svg>'
  };
  /* the du'a icons: white glyphs on the coloured tile (same system as the daily icons) */
  function cres(cx, cy, r) { return '<path class="w" d="M' + (cx + r * 0.3) + " " + (cy - r * 0.95) + "A" + r + " " + r + " 0 1 0 " + (cx + r) + " " + (cy + r * 0.35) + "A" + (r * 0.8) + " " + (r * 0.8) + " 0 0 1 " + (cx + r * 0.3) + " " + (cy - r * 0.95) + 'z"/>'; }
  function spk(x, y, r, c) { return '<path class="' + (c || "y") + '" d="M' + x + " " + (y - r) + "Q" + x + " " + y + " " + (x + r) + " " + y + "Q" + x + " " + y + " " + x + " " + (y + r) + "Q" + x + " " + y + " " + (x - r) + " " + y + "Q" + x + " " + y + " " + x + " " + (y - r) + 'z"/>'; }
  var ICONS = {
    r_hilal: cres(22, 25, 15) + spk(38, 11, 5.5) + spk(37, 34, 3.6, "w"),
    r_niat: '<path class="w" d="M24 41S8 31.6 8 19.8A8.6 8.6 0 0 1 24 15a8.6 8.6 0 0 1 16 4.8C40 31.6 24 41 24 41z"/><path class="k" d="M26.5 18.5a7.5 7.5 0 1 0 5 12.4 6 6 0 0 1-5-12.4z"/>',
    r_shaim: '<path class="w" d="M9 10h30a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H22l-8 7v-7H9a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z"/><path class="ks" d="M17 24q7 6 14 0"/><circle class="k" cx="18" cy="18.5" r="2"/><circle class="k" cx="30" cy="18.5" r="2"/>',
    r_buka: '<path class="w" d="M26 7h14l-1.8 30a2.4 2.4 0 0 1-2.4 2.2h-5.6a2.4 2.4 0 0 1-2.4-2.2z"/><path class="k" d="M28 17h10l-1.2 18h-7.6z" opacity=".35"/><ellipse class="w" cx="13" cy="33" rx="8" ry="5" transform="rotate(-20 13 33)"/><ellipse class="k" cx="12" cy="32" rx="3" ry="1.4" opacity=".4" transform="rotate(-20 12 32)"/>',
    r_after: '<path class="w" d="M22 6S9 20 9 28.6a13 13 0 0 0 26 0C35 20 22 6 22 6z"/><path class="ks" d="M15.6 30a6.6 6.6 0 0 0 5.4 6.2"/>' + spk(38, 12, 6) + spk(40, 30, 3.6, "w"),
    r_host: '<path class="w" d="M24 7L6 22h5v18h26V22h5z"/><path class="k" d="M24 36s-7-4.2-7-9a3.6 3.6 0 0 1 7-1.4 3.6 3.6 0 0 1 7 1.4c0 4.8-7 9-7 9z"/>',
    r_witr: '<circle class="w" cx="11" cy="30" r="6"/><circle class="w" cx="24" cy="22" r="6"/><circle class="w" cx="37" cy="30" r="6"/><path class="ws" d="M11 30Q24 46 37 30" stroke-width="2.4"/>' + spk(24, 8, 5),
    r_qadr: spk(18, 20, 12, "y") + spk(35, 11, 6, "w") + spk(36, 33, 5, "w") + spk(14, 39, 3.4, "w"),
    r_zakat: '<path class="w" d="M13 41q-5-14 2-25 3-4 7-5h4q4 1 7 5 7 11 2 25z"/><path class="ks" d="M18 13q6 4 12 0"/><ellipse class="k" cx="20" cy="27" rx="2.2" ry="4" transform="rotate(-25 20 27)"/><ellipse class="k" cx="25" cy="25" rx="2.2" ry="4"/><ellipse class="k" cx="30" cy="27" rx="2.2" ry="4" transform="rotate(25 30 27)"/>',
    r_eid_greet: '<path class="w" d="M17 38S5 30.8 5 21.6a6.6 6.6 0 0 1 12-3.8 6.6 6.6 0 0 1 12 3.8C29 30.8 17 38 17 38z"/><path class="y" d="M33 30s-9-5.4-9-12.2a5 5 0 0 1 9-2.9 5 5 0 0 1 9 2.9C42 24.6 33 30 33 30z"/>',
    r_takbir: '<rect class="w" x="9" y="16" width="26" height="18" rx="5"/><ellipse class="k" cx="9" cy="25" rx="3.4" ry="9" opacity=".5"/><path class="ws" d="M38 15q4 4 0 9M41.5 11q7 8 0 17" stroke-width="2.6"/><path class="ws" d="M14 41l-4 4M30 41l4 4" stroke-width="3"/>'
  };

  function nowWaktu() { var h = new Date().getHours(); return (h >= 16 && h < 19) ? "buka" : (h >= 19 || h < 3) ? "rmalam" : "puasa"; }

  /* ───────── the start screen's Ramadan night ───────── */
  function lanternArt(x, top, len, s, c1, c2) {
    var y = top + len;
    return '<path d="M' + x + " " + top + "V" + (y - 7 * s) + '" stroke="#C9B6F2" stroke-width="1.2" opacity=".8"/><g transform="translate(' + x + " " + y + ") scale(" + s + ')"><g class="rm-sw">' +
      '<circle cx="0" cy="18" r="30" fill="url(#rmSGlow)" class="rm-gl"/><circle cx="0" cy="-7" r="2.6" fill="none" stroke="#E8B046" stroke-width="1.4"/><path d="M-8 4Q0-6 8 4z" fill="#E8B046"/><rect x="-10" y="3" width="20" height="3.4" rx="1.7" fill="#F2C35A"/>' +
      '<path d="M-9 6.4h18l3 9-3 15h-18l-3-15z" fill="' + c1 + '"/><path d="M-9 6.4h18l3 9-3 15h-18l-3-15z" fill="none" stroke="#C98612" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M-3 6.4v24M3 6.4v24M-12 15.4h24" stroke="#C98612" stroke-width="1.1" opacity=".7"/><path d="M-6.5 8.5l-2 7 2 11" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>' +
      '<path d="M-8 30.4h16l-4 5h-8z" fill="#E8B046"/><path d="M0 35.4v6" stroke="' + c2 + '" stroke-width="1.6"/><circle cx="0" cy="42.6" r="2.2" fill="' + c2 + '"/></g></g>';
  }
  function starsArt() {
    var h = "";
    for (var i = 0; i < 40; i++) { var x = (i * 97 + 13) % 400, y = 8 + ((i * 61) % 210); h += '<circle cx="' + x + '" cy="' + y + '" r="' + (i % 6 ? 1.2 : 2) + '"' + (i % 3 ? "" : ' class="b"') + "/>"; }
    return h;
  }
  var START = '<svg viewBox="0 0 400 560" preserveAspectRatio="xMidYMin slice"><defs>' +
    '<linearGradient id="rmSSky" x1="0" y1="0" x2="0" y2="1"><stop class="s1" offset="0"/><stop class="s2" offset=".42"/><stop class="s3" offset=".62"/><stop class="s4" offset="1"/></linearGradient>' +
    '<radialGradient id="rmSGlow"><stop offset="0" stop-color="#FFE9A6" stop-opacity=".9"/><stop offset=".45" stop-color="#FFC94A" stop-opacity=".35"/><stop offset="1" stop-color="#FFB020" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="rmSMoon" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFF8D6"/><stop offset=".5" stop-color="#FFD866"/><stop offset="1" stop-color="#F2A516"/></radialGradient>' +
    '<linearGradient id="rmSH1" x1="0" y1="0" x2="0" y2="1"><stop class="h1a" offset="0"/><stop class="h1b" offset="1"/></linearGradient>' +
    '<linearGradient id="rmSH2" x1="0" y1="0" x2="0" y2="1"><stop class="h2a" offset="0"/><stop class="h2b" offset="1"/></linearGradient>' +
    '<linearGradient id="rmSH3" x1="0" y1="0" x2="0" y2="1"><stop class="h3a" offset="0"/><stop class="h3b" offset="1"/></linearGradient>' +
    '<linearGradient id="rmSDome" x1="0" y1="0" x2="1" y2=".3"><stop offset="0" stop-color="#FFE58A"/><stop offset=".55" stop-color="#F2B232"/><stop offset="1" stop-color="#C98612"/></linearGradient>' +
    '<linearGradient id="rmSWall" x1="0" y1="0" x2="0" y2="1"><stop class="w1" offset="0"/><stop class="w2" offset="1"/></linearGradient></defs>' +
    '<rect width="400" height="560" fill="url(#rmSSky)"/>' +
    '<g class="rm-stars">' + starsArt() + "</g>" +
    // the big crescent and its glow, top left (below the Hub button)
    '<circle class="rm-gl" cx="64" cy="104" r="64" fill="url(#rmSGlow)" opacity=".75"/>' +
    '<path d="M74 72a33 33 0 1 0 26 50 27 27 0 0 1-26-50z" fill="url(#rmSMoon)"/><path d="M60 84a20 20 0 0 0-6 22" stroke="#fff" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>' +
    '<path class="rm-tw" d="M112 70l2 4.6 5 .6-3.7 3.4 1 5-4.3-2.4-4.3 2.4 1-5-3.7-3.4 5-.6z" fill="#FFF3B0"/>' +
    // a garland of crescents and stars across the top, lanterns hanging between the buttons
    '<g class="rm-sw2"><path d="M-10 4Q200 46 410 4" fill="none" stroke="#C9B6F2" stroke-width="1.4" opacity=".8"/>' +
    [30, 72, 114, 156, 198, 240, 282, 324, 366].map(function (x, i) { var t = (x + 10) / 420, y = 4 + 84 * t * (1 - t); return '<path d="M' + x + " " + y.toFixed(1) + 'v5" stroke="#C9B6F2" stroke-width="1"/>' + (i % 2 ? '<path d="M' + x + " " + (y + 8).toFixed(1) + 'l1.8 3.8 4.2.6-3 2.9.7 4.2-3.7-2-3.7 2 .7-4.2-3-2.9 4.2-.6z" fill="#FFD866"/>' : '<path d="M' + (x + 2) + " " + (y + 7).toFixed(1) + 'a7 7 0 1 0 6 10 5.6 5.6 0 0 1-6-10z" fill="#FFD866"/>'); }).join("") + "</g>" +
    lanternArt(232, 24, 46, 0.95, "#FFB43D", "#FF6FAE") + lanternArt(276, 22, 86, 1.1, "#3CC7B5", "#FFB43D") + lanternArt(326, 18, 44, 0.9, "#FF7DB8", "#3CC7B5") +
    // hills, the mosque with lit windows, little ground lanterns
    '<path d="M-10 236Q50 200 120 214T250 206T420 196V560H-10z" fill="url(#rmSH1)"/>' +
    '<g transform="translate(348 252) scale(.66)"><ellipse cx="0" cy="3" rx="78" ry="7" fill="rgba(10,10,40,.25)"/>' +
    '<rect x="-62" y="-112" width="12" height="112" rx="3" fill="url(#rmSWall)"/><path d="M-64-112q8-20 16 0z" fill="url(#rmSDome)"/><rect x="-58.2" y="-70" width="4.4" height="8" rx="2.2" class="rm-win"/>' +
    '<rect x="50" y="-112" width="12" height="112" rx="3" fill="url(#rmSWall)"/><path d="M48-112q8-20 16 0z" fill="url(#rmSDome)"/><rect x="53.8" y="-70" width="4.4" height="8" rx="2.2" class="rm-win"/>' +
    '<rect x="-42" y="-48" width="84" height="48" rx="5" fill="url(#rmSWall)"/><rect x="-45" y="-53" width="90" height="7" rx="3" fill="url(#rmSDome)"/>' +
    '<path d="M-28-53C-34-82-12-96 0-110 12-96 34-82 28-53z" fill="url(#rmSDome)"/><path d="M-18-60C-22-76-10-86-3-94" fill="none" stroke="#FFF3C2" stroke-width="3" opacity=".7" stroke-linecap="round"/>' +
    '<path d="M0-110v-12" stroke="#D9951A" stroke-width="2.4"/><path d="M2.4-132a5.6 5.6 0 1 0 3.8 8.6 4.5 4.5 0 0 1-3.8-8.6z" fill="#F5B82E"/>' +
    '<path class="rm-win" d="M-11 0v-22a11 11 0 0 1 22 0V0z"/><g class="rm-win"><path d="M-33-18v-12a5 5 0 0 1 10 0v12z"/><path d="M23-18v-12a5 5 0 0 1 10 0v12z"/></g></g>' +
    '<path d="M-10 266Q90 226 200 254T420 240V560H-10z" fill="url(#rmSH2)"/>' +
    '<g class="rm-gl"><circle cx="40" cy="250" r="16" fill="url(#rmSGlow)"/><circle cx="214" cy="252" r="14" fill="url(#rmSGlow)"/></g>' +
    '<g fill="#FFC94A"><rect x="35" y="243" width="10" height="14" rx="3"/><rect x="209.5" y="245" width="9" height="13" rx="3"/></g><g fill="#E8B046"><path d="M34 243q6-6 12 0z"/><path d="M208.5 245q5.5-6 11 0z"/></g>' +
    '<path d="M-10 300Q120 262 230 286T420 276V560H-10z" fill="url(#rmSH3)"/>' +
    '<g class="rm-tw2" fill="#FFF3B0"><circle cx="60" cy="296" r="1.8"/><circle cx="150" cy="286" r="1.6"/><circle cx="300" cy="292" r="1.8"/><circle cx="352" cy="284" r="1.4"/></g></svg>';

  /* ───────── Mo's speaking wave: where his mouth is in each pose (fractions of the image), wave side ───────── */
  var MOUTH = {
    "baby-mo-pose-15": [0.67, 0.33, 1], "baby-mo-pose-06": [0.66, 0.45, 1], "baby-mo-pose-14": [0.64, 0.31, 1], "baby-mo-pose-12": [0.66, 0.47, 1],
    "baby-mo-pose-36": [0.68, 0.46, 1], "baby-mo-thank-you": [0.64, 0.32, 1], "baby-mo-dua-smile": [0.97, 0.25, 1], "baby-mo-yes": [0.68, 0.32, 1],
    "baby-mo-pose-41": [0.66, 0.33, 1]
  };
  var WAVE = '<svg viewBox="0 0 40 48"><path class="mt1" d="M6 17.5a8.5 8.5 0 0 1 0 13"/><path class="mt2" d="M13 11a17 17 0 0 1 0 26"/><path class="mt3" d="M20 4.5a26 26 0 0 1 0 39"/></svg>';

  var API = null;
  function muted() { try { return localStorage.getItem("bm_muted") === "1"; } catch (e) { return false; } }
  function still() { try { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }

  function talk(on) {
    var c = document.getElementById("sceneCard"); if (c) c.classList.toggle("mo-speaking", !!on && !muted());
  }
  function placeWave(d) {
    var wrap = document.querySelector("#sceneCard .scene-mo-wrap"); if (!wrap) return;
    var t = wrap.querySelector(".mo-talk");
    if (!t) { t = document.createElement("span"); t.className = "mo-talk"; t.setAttribute("aria-hidden", "true"); t.innerHTML = WAVE; wrap.appendChild(t); }
    var p = MOUTH[window.doaScenePose ? doaScenePose(d.id) : ""] || [0.56, 0.33, 1];
    t.style.left = (p[0] * 100) + "%"; t.style.top = (p[1] * 100) + "%"; t.classList.toggle("flip", p[2] < 0);
  }
  /* Mo says when we read this du'a (the "when" line) as the page opens — one recorded voice via bm-voice.js;
     in English bm-i18n speaks the English line. Never when muted; the child's tap or a read cancels it. */
  var sayTimer = 0, saySeq = 0, saying = false;
  function narrate(text) {
    clearTimeout(sayTimer);
    if (muted() || !window.speechSynthesis || !text) return;
    var my = ++saySeq;
    sayTimer = setTimeout(function () {
      var ab = document.getElementById("actBtn");
      if (my !== saySeq || !document.getElementById("learnScreen").classList.contains("active") || (ab && ab.classList.contains("done")) || (typeof isSpeaking !== "undefined" && isSpeaking)) return;
      try {
        var u = new SpeechSynthesisUtterance(text); u.lang = "id-ID"; u.rate = 0.95; u.pitch = 1.05;
        u.onstart = function () { if (my === saySeq) talk(true); };
        u.onend = u.onerror = function () { saying = false; if (my === saySeq) talk(false); };
        saying = true;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      } catch (e) {}
    }, 450);
  }

  /* ───────── the Ramadan journey on the start screen: 8 stops, slides to where you are ───────── */
  function renderJourney() {
    var ws = document.getElementById("welcomeScreen"); if (!ws || !API) return;
    var box = document.getElementById("rmJr");
    if (!box) {
      box = document.createElement("div"); box.id = "rmJr"; box.className = "rm-jr";
      var day = document.getElementById("dhDay"); ws.insertBefore(box, day);
      var head = document.createElement("div"); head.className = "rm-head";
      head.innerHTML = '<div class="rm-title"><span class="rm-t1">' + L("Doa Ramadan", "Ramadan Du'as") + '</span><span class="rm-t2">' + L("11 doa dari hilal sampai Lebaran", "11 du'as from the crescent to Eid") + "</span></div>";
      ws.insertBefore(head, box);
    }
    var ST = API.ST, cur = -1, h = '<div class="rm-jr-h"><b>' + L("Perjalanan Ramadan", "Ramadan Journey") + "</b><span id=\"rmJrN\"></span></div><div class=\"rm-jr-row\" id=\"rmJrRow\" role=\"list\">", done = 0;
    STAGE_ORDER.forEach(function (k, i) {
      var ix = DUAS.map(function (d, j) { return d.stage === k ? j : -1; }).filter(function (j) { return j >= 0; });
      var got = ix.filter(function (j) { return ST.learned[DUAS[j].id]; }).length, full = got === ix.length;
      if (full) done++; else if (cur < 0) cur = i;
      var s = STAGES[k], stars = ix.reduce(function (a, j) { return a + API.starsOf(DUAS[j].id); }, 0);
      h += '<button type="button" role="listitem" class="rm-st' + (full ? " done" : "") + '" data-k="' + k + '" style="--i:' + i + '">' +
        '<span class="rm-st-ic">' + window.doaIcon(DUAS[ix[0]]) + (full ? '<span class="rm-ck" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9.5 16.6 5.4 12.5l-1.6 1.6 5.7 5.7L20.6 8.7 19 7.1z"/></svg></span>' : "") + "</span>" +
        '<b>' + L(s.id, s.en) + "</b><small>" + (i + 1) + " · " + ix.length + " " + L("doa", ix.length > 1 ? "du'as" : "du'a") + "</small>" + window.doaStars(Math.min(3, Math.round(stars / ix.length))) + "</button>";
    });
    h += "</div>";
    box.innerHTML = h;
    document.getElementById("rmJrN").textContent = done + " / " + STAGE_ORDER.length;
    var row = document.getElementById("rmJrRow"), stops = row.querySelectorAll(".rm-st");
    if (cur < 0) cur = STAGE_ORDER.length - 1;
    var me = stops[cur]; me.classList.add("now");
    me.insertAdjacentHTML("afterbegin", '<img class="rm-me" src="baby-mo-poses/baby-mo-dua-smile.webp" alt="" aria-hidden="true">');
    stops.forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.k, ix = DUAS.map(function (d, j) { return d.stage === k ? j : -1; }).filter(function (j) { return j >= 0; });
        API.sfx("tap"); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
        setTimeout(function () { b.classList.remove("pop"); API.startList(ix); }, 260);
      };
    });
    // slide the strip to the stop you are on (smoothly, unless reduced motion)
    requestAnimationFrame(function () {
      var x = me.offsetLeft + me.offsetWidth / 2 - row.clientWidth / 2;
      row.scrollLeft = 0;
      try { row.scrollTo({ left: Math.max(0, x), behavior: still() ? "auto" : "smooth" }); } catch (e) { row.scrollLeft = Math.max(0, x); }
    });
  }

  /* ───────── finish card: a Ramadan banner ───────── */
  var BANNER = '<svg viewBox="0 0 320 70" aria-hidden="true"><path d="M0 6Q160 40 320 6" fill="none" stroke="#C9A27A" stroke-width="1.4"/>' +
    [40, 100, 160, 220, 280].map(function (x, i) { var y = 6 + 34 * (1 - Math.pow((x - 160) / 160, 2)) * 0.5; return '<path d="M' + x + " " + y.toFixed(1) + 'v' + (i % 2 ? 14 : 8) + '" stroke="#C9A27A" stroke-width="1"/>' +
      '<g class="rm-sw" style="transform-origin:' + x + "px " + y.toFixed(1) + 'px"><g transform="translate(' + x + " " + (y + (i % 2 ? 14 : 8)).toFixed(1) + ') scale(.7)"><path d="M-8 4Q0-6 8 4z" fill="#E8B046"/><path d="M-9 6.4h18l3 9-3 15h-18l-3-15z" fill="' + ["#FFB43D", "#3CC7B5", "#FF7DB8", "#3CC7B5", "#FFB43D"][i] + '" stroke="#C98612" stroke-width="1.8"/><path d="M-8 30.4h16l-4 5h-8z" fill="#E8B046"/></g></g>'; }).join("") + "</svg>";

  window.DOA_SERIES_DATA = {
    duas: DUAS, waktu: WAKTU, stages: STAGES, icons: ICONS, ticon: TICON, key: "bm_doa_ramadan_v1", heroMo: "pose-12", nowWaktu: nowWaktu,
    init: function (api) {
      API = api;
      var sc = document.querySelector("#welcomeScreen .pd-scene"); if (sc) sc.innerHTML = START;
      var t = document.querySelector("#welcomeScreen .w-title"); if (t) t.textContent = L("Doa Ramadan 🌙", "Ramadan Du'as 🌙");
      var bk = document.getElementById("dhBook"); if (bk) bk.setAttribute("data-rm", "1");
      // the start screen: journey after every visit
      var _show = window.showScreen;
      window.showScreen = function (id) { _show(id); if (id === "welcomeScreen") renderJourney(); };
      setTimeout(renderJourney, 0);
      // one du'a page: Mo's wave sits at his mouth; he says when we read this du'a
      var _load = window.loadDua;
      window.loadDua = function (idx) {
        talk(false); _load(idx);
        var d = DUAS[idx]; placeWave(d); narrate(d.desc);
      };
      var _ss = window.setSoundState;
      window.setSoundState = function (st) { _ss(st); if (st === "playing") { saySeq++; clearTimeout(sayTimer); } talk(st === "playing"); };
      var _stop = window.stopSpeech;
      window.stopSpeech = function () { if (saying) saySeq++; talk(false); _stop(); };   // (showScreen stops speech right after a du'a loads: keep the line that is about to start)
      // a tap on the action stops Mo's line (the action has its own sound)
      var act = document.getElementById("actBtn");
      if (act) act.addEventListener("click", function () { saySeq++; clearTimeout(sayTimer); talk(false); try { speechSynthesis.cancel(); } catch (e) {} }, true);
      // the finish card
      var _sc = window.showComplete;
      window.showComplete = function () {
        _sc();
        var card = document.querySelector("#completeScreen .c-card");
        if (card && !card.querySelector(".rm-banner")) card.insertAdjacentHTML("afterbegin", '<div class="rm-banner">' + BANNER + '<span class="rm-rib">Ramadan Mubarak! 🌙</span></div>');
        var all = DUAS.every(function (d) { return API.ST.learned[d.id]; });
        document.getElementById("cSub").textContent = L("Kamu sudah belajar " + API.play().length + " doa Ramadan bersama Mo! 🏅 " + API.nLearned() + " / " + DUAS.length + " stiker",
          "You learned " + API.play().length + " Ramadan du'as with Mo! 🏅 " + API.nLearned() + " / " + DUAS.length + " stickers") + (all ? L(" · Semua doa Ramadan sudah kamu baca!", " · You've read every Ramadan du'a!") : "");
      };
      window.shareResult = function () {
        var stars = document.getElementById("cStarsDisp").textContent, score = document.getElementById("cQuizScore").textContent;
        if (window.BabyMo && BabyMo.shareScore) {
          BabyMo.shareScore(score, stars, ["Aku belajar doa Ramadan bersama Baby Mo! Yuk coba juga 🌙", "I learned Ramadan du'as with Baby Mo! Come try it 🌙"], {
            headline: [DUAS.length + " doa Ramadan!", DUAS.length + " Ramadan du'as!"], stats: [[["Kuis", "Quiz"], score]] });
          return;
        }
        if (window.Capacitor) return;   // iOS app: sharing only through the kit's parental gate
        var url = "https://play.babymo.id/babymo-doa-harian.html?series=ramadan";
        var text = L("🌙 Doa Ramadan — Baby Mo\nHasil kuis: ", "🌙 Ramadan Du'as — Baby Mo\nQuiz: ") + score + " " + stars + "\n\n" + url;
        if (navigator.share) navigator.share({ title: "Baby Mo — " + L("Doa Ramadan", "Ramadan Du'as"), text: text, url: url }).catch(function () {});
        else if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { window.showToast && showToast("📤", L("Disalin!", "Copied!")); });
      };
    }
  };

  // tab title + description
  try {
    document.title = "Doa Ramadan Anak — 11 Doa Ramadan + Audio Arab | Baby Mo";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", "Belajar 11 doa Ramadan — melihat hilal, niat puasa, berbuka, Lailatul Qadar, zakat fitrah sampai takbir Idul Fitri — dengan suara Arab, animasi, dan kuis bersama Baby Mo.");
  } catch (e) {}
})();
