/* Baby Mo — prayer tools inside the game hub's Sholat tab.
   Prayer times (next prayer + countdown), the daily prayer streak, and
   Kiblat / Mutiara / Kalender as bottom sheets — no separate page.
   Shares storage with the old companion page (babymo-companion/), so a
   child's location, cached times and streak carry over:
     mo_cached_loc, mo_manual_city, mo_prayer_streaks_v1
   Prayer times and the qibla are computed ON THE DEVICE
   (bm-prayertimes.js, Kemenag RI parameters) — nothing is sent anywhere. */
(function () {
  "use strict";
  var root = document.getElementById("prayerHub"); if (!root) return;

  /* ── language ── */
  var L = function () { return (window.curLang || localStorage.getItem("bm_lang")) === "en" ? "en" : "id"; };
  var T = function (id, en) { return L() === "en" ? en : id; };

  var KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  var NAMES = { id: ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"], en: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] };
  var ICONS = ["🌅", "☀️", "🌤️", "🌇", "🌙"];
  var KAABA = { lat: 21.4225, lng: 39.8262 };
  var CITIES = [
    { n: "Jakarta", i: "🏙️", lat: -6.2088, lng: 106.8456 }, { n: "Bandung", i: "🌋", lat: -6.9175, lng: 107.6191 },
    { n: "Surabaya", i: "🦈", lat: -7.2575, lng: 112.7521 }, { n: "Malang", i: "🍎", lat: -7.9778, lng: 112.5347 },
    { n: "Yogyakarta", i: "🏛️", lat: -7.7956, lng: 110.3695 }, { n: "Semarang", i: "⛵", lat: -6.9667, lng: 110.4167 },
    { n: "Medan", i: "🌴", lat: 3.5952, lng: 98.6722 }, { n: "Makassar", i: "⛵", lat: -5.1477, lng: 119.4327 },
    { n: "Denpasar", i: "🌺", lat: -8.65, lng: 115.2167 }, { n: "Palembang", i: "🌉", lat: -2.9909, lng: 104.7566 },
    { n: "Banjarmasin", i: "🛶", lat: -3.3186, lng: 114.5944 }
  ];
  var Q = [
    ["إِنَّ مَعَ الْعُسْرِ يُسْرًا", "Sesungguhnya sesudah kesulitan itu ada kemudahan.", "Indeed, with hardship comes ease.", "QS. Al-Insyirah: 6"],
    ["وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", "Barangsiapa bertakwa kepada Allah, niscaya Dia akan memberinya jalan keluar.", "Whoever is mindful of Allah, He will make a way out for them.", "QS. At-Talaq: 2"],
    ["إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", "Sesungguhnya setiap amalan tergantung pada niatnya.", "Actions are judged by their intentions.", "HR. Bukhari & Muslim"],
    ["فَاذْكُرُونِي أَذْكُرْكُمْ", "Maka ingatlah Aku, niscaya Aku akan ingat kepadamu.", "So remember Me; I will remember you.", "QS. Al-Baqarah: 152"],
    ["وَاللَّهُ مَعَ الصَّابِرِينَ", "Dan Allah bersama orang-orang yang sabar.", "And Allah is with those who are patient.", "QS. Al-Baqarah: 153"],
    ["حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", "Cukuplah Allah menjadi penolong kami.", "Allah is enough for us as a helper.", "QS. Ali Imran: 173"],
    ["لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", "Allah tidak membebani seseorang melainkan sesuai kesanggupannya.", "Allah does not burden a soul beyond what it can bear.", "QS. Al-Baqarah: 286"],
    ["مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ", "Barangsiapa menempuh jalan menuntut ilmu, Allah mudahkan jalan ke surga.", "Whoever takes a path to seek knowledge, Allah makes easy a path to Paradise.", "HR. Muslim"],
    ["ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ", "Sayangilah yang di bumi, niscaya yang di langit menyayangimu.", "Be merciful to those on earth, and the One above will be merciful to you.", "HR. Tirmidzi"],
    ["خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ", "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lain.", "The best of people are those most helpful to others.", "HR. Ahmad"],
    ["تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", "Senyummu di hadapan saudaramu adalah sedekah.", "Your smile to your brother is charity.", "HR. Tirmidzi"],
    ["وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ", "Janganlah berputus asa dari rahmat Allah.", "Never lose hope in Allah's mercy.", "QS. Yusuf: 87"],
    ["الدُّعَاءُ مُخُّ الْعِبَادَةِ", "Doa adalah inti dari ibadah.", "Du'a is the heart of worship.", "HR. Tirmidzi"],
    ["مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", "Berkata baik atau diam.", "Speak good or stay silent.", "HR. Bukhari & Muslim"],
    ["الجَنَّةُ تَحْتَ أَقْدَامِ الأُمَّهَاتِ", "Surga di bawah telapak kaki ibu.", "Paradise lies at the feet of mothers.", "HR. An-Nasa'i"],
    ["إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ", "Allah Maha Indah dan menyukai keindahan.", "Allah is Beautiful and loves beauty.", "HR. Muslim"],
    ["الطَّهُورُ شَطْرُ الإِيمَانِ", "Kebersihan adalah sebagian dari iman.", "Cleanliness is part of faith.", "HR. Muslim"],
    ["إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ", "Allah tidak mengubah keadaan suatu kaum sehingga mereka mengubah diri sendiri.", "Allah does not change a people's condition until they change what is in themselves.", "QS. Ar-Ra'd: 11"],
    ["وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ", "Sholat mencegah dari perbuatan keji dan mungkar.", "Prayer keeps us away from wrongdoing.", "QS. Al-Ankabut: 45"],
    ["وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ", "Tidaklah aku mendapat taufiq melainkan dari Allah.", "My success comes only from Allah.", "QS. Hud: 88"]
  ];
  var EVENTS = [
    [1, 1, "Tahun Baru Hijriah", "Islamic New Year", "🌙", "Tahun baru, niat baru.", "New year, new intentions."],
    [1, 10, "Hari Asyura", "Day of Ashura", "✨", "Puasa Asyura menghapus dosa setahun lalu.", "Fasting on Ashura wipes away the past year's sins."],
    [3, 12, "Maulid Nabi", "Mawlid an-Nabi", "🌸", "Perbanyak sholawat menjelang Maulid Nabi ﷺ.", "Send lots of salawat as the Mawlid approaches ﷺ."],
    [7, 27, "Isra Mi'raj", "Isra Mi'raj", "🌌", "Renungkan makna sholat lima waktu.", "Reflect on the meaning of the five daily prayers."],
    [8, 15, "Nisfu Sya'ban", "Nisfu Sha'ban", "🤲", "Malam pengampunan. Perbanyak istighfar.", "A night of forgiveness. Say lots of istighfar."],
    [9, 1, "Awal Ramadhan", "Start of Ramadan", "🌙", "Ramadhan tiba! Siapkan sahur & tarawih.", "Ramadan is here! Get ready for suhoor & tarawih."],
    [9, 17, "Nuzulul Qur'an", "Nuzulul Qur'an", "📖", "Tingkatkan tilawah hari ini.", "Read more Qur'an today."],
    [9, 21, "Lailatul Qadar", "Laylatul Qadr", "⭐", "Lebih baik dari 1000 bulan.", "Better than 1,000 months."],
    [10, 1, "Idul Fitri", "Eid al-Fitr", "🎉", "Hari kemenangan! Sudah siapkan zakat fitrah?", "The day of victory! Is your zakat al-fitr ready?"],
    [12, 1, "Awal Dzulhijjah", "Start of Dhul Hijjah", "🐑", "10 hari pertama Dzulhijjah penuh amal.", "The first 10 days of Dhul Hijjah are full of good deeds."],
    [12, 9, "Hari Arafah", "Day of Arafah", "🏔️", "Puasa Arafah menghapus dosa 2 tahun.", "Fasting on Arafah wipes away 2 years of sins."],
    [12, 10, "Idul Adha", "Eid al-Adha", "🕋", "Hari Raya Qurban.", "The Festival of Sacrifice."]
  ];

  /* ── storage (shared with babymo-companion) ── */
  var get = function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  var put = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var dkey = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  var today = function () { return dkey(new Date()); };
  var yesterday = function () { var d = new Date(); d.setDate(d.getDate() - 1); return dkey(d); };

  function refreshStreaks() {
    var s = get("mo_prayer_streaks_v1", {}), t = today(), y = yesterday(), c = false;
    KEYS.forEach(function (k) { var r = s[k]; if (r && r.lastDate && r.lastDate !== t && r.lastDate !== y) { r.count = 0; c = true; } });
    if (c) put("mo_prayer_streaks_v1", s);
  }
  function checkIn(k) {
    var s = get("mo_prayer_streaks_v1", {}), c = s[k] || { count: 0, lastDate: null, best: 0, total: 0 }, t = today();
    if (c.lastDate === t) return null;
    c.count = c.lastDate === yesterday() ? c.count + 1 : 1;
    c.lastDate = t; c.total = (c.total || 0) + 1; c.best = Math.max(c.best || 0, c.count);
    s[k] = c; put("mo_prayer_streaks_v1", s); return c;
  }
  function stats() {
    var s = get("mo_prayer_streaks_v1", {}), t = today(), tot = 0, best = 0, td = 0, cur = 0;
    KEYS.forEach(function (k) { var c = s[k] || {}; tot += c.total || 0; best = Math.max(best, c.best || 0); cur = Math.max(cur, c.count || 0); if (c.lastDate === t) td++; });
    return { tot: tot, best: best, td: td, cur: cur, s: s };
  }

  /* ── prayer times ── */
  var times = null, mins = null, loc = get("mo_cached_loc", null), qibla = null, heading = null;
  function locName() {
    var m = get("mo_manual_city", null);
    if (m && loc && Math.abs(m.lat - loc.lat) < .01) return m.n;
    /* no reverse geocoding (that would send the location off the device):
       label GPS spots by the device's time zone instead — WIB/WITA/WIT. */
    var z = ""; try { z = window.BMPrayerTimes ? BMPrayerTimes.zoneLabel() : ""; } catch (e) {}
    return loc ? T("Lokasimu", "Your location") + (z ? " · " + z : "") : null;
  }
  function apply(t) {
    times = t; mins = KEYS.map(function (k) { var p = t[k].slice(0, 5).split(":"); return +p[0] * 60 + +p[1]; });
    render();
  }
  function fetchTimes() {
    if (!loc) { render(); return; }
    try { apply(BMPrayerTimes.timings(new Date(), loc.lat, loc.lng)); } catch (e) { render(); }
    render._d = dkey(new Date());
    computeQibla();
  }
  function setLoc(l, name) {
    loc = { lat: l.lat, lng: l.lng }; put("mo_cached_loc", loc);
    if (name) put("mo_manual_city", { n: name, lat: l.lat, lng: l.lng });
    if (!name) { try { localStorage.removeItem("mo_manual_city"); } catch (e) {} }
    try { localStorage.removeItem("mo_reverse_city"); localStorage.removeItem("mo_prayer_cache_v1"); } catch (e) {}
    times = null; fetchTimes();
  }
  function useMyLocation() {
    if (!navigator.geolocation) { toast(T("Lokasi tidak didukung di perangkat ini", "Location isn't supported on this device")); openCities(); return; }
    toast(T("⏳ Mencari lokasi…", "⏳ Finding your location…"));
    navigator.geolocation.getCurrentPosition(function (p) { setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }); toast(T("🎉 Lokasi aktif!", "🎉 Location on!")); },
      function () { toast(T("Lokasi tidak bisa dipakai — pilih kota saja ya", "Couldn't use your location — pick a city instead")); openCities(); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
  }

  /* index of the prayer whose time has started (-1 = before Subuh) */
  function curIdx() { if (!mins) return -1; var n = new Date(), nm = n.getHours() * 60 + n.getMinutes(); for (var i = 4; i >= 0; i--) if (mins[i] <= nm) return i; return -1; }

  /* ── UI ── */
  var css = '' +
    '#prayerHub{margin:0 16px 8px}' +
    '.ph-card{position:relative;overflow:hidden;border-radius:26px;padding:16px 16px 14px;color:#152230;' +
      'background:linear-gradient(150deg,#D9F7E6 0%,#C6F0F2 45%,#DDE9FF 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 18px 36px -22px rgba(20,80,120,.55)}' +
    '.ph-card.night{background:linear-gradient(150deg,#2B2F66 0%,#3A3F8A 60%,#4B3E8F 100%);color:#F2F5FA}' +
    '.ph-top{display:flex;align-items:center;justify-content:space-between;gap:8px}' +
    '.ph-loc{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border-radius:18px;border:none;cursor:pointer;font:800 13.5px/1 inherit;font-family:inherit;color:inherit;background:rgba(255,255,255,.7)}' +
    '.ph-card.night .ph-loc{background:rgba(255,255,255,.14)}' +
    '.ph-hijri{font-size:12.5px;font-weight:800;opacity:.75;text-align:right}' +
    '.ph-next{display:flex;align-items:center;gap:12px;margin-top:12px}' +
    '.ph-next img{width:76px;height:76px;object-fit:contain;flex:0 0 76px;filter:drop-shadow(0 6px 10px rgba(20,40,70,.25))}' +
    '.ph-next .lbl{font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;opacity:.7}' +
    '.ph-next .nm{font-family:Fredoka,Nunito,sans-serif;font-size:30px;font-weight:700;line-height:1.05}' +
    '.ph-next .cd{font-size:14px;font-weight:800;opacity:.85;margin-top:2px}' +
    '.ph-bar{height:7px;border-radius:5px;background:rgba(21,34,48,.1);overflow:hidden;margin-top:10px}' +
    '.ph-card.night .ph-bar{background:rgba(255,255,255,.15)}' +
    '.ph-bar i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,#10A765,#0A9488,#0A7FB0);transition:width .6s}' +
    '.ph-cells{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:12px}' +
    '.ph-cell{position:relative;border:none;cursor:pointer;border-radius:16px;padding:8px 2px 7px;text-align:center;font-family:inherit;color:inherit;background:rgba(255,255,255,.62);transition:transform .2s}' +
    '.ph-card.night .ph-cell{background:rgba(255,255,255,.1)}' +
    '.ph-cell .e{font-size:18px;line-height:1}.ph-cell .n{display:block;font-size:11.5px;font-weight:900;margin-top:3px}.ph-cell .t{display:block;font-size:13px;font-weight:800;opacity:.8}' +
    '.ph-cell .s{display:block;min-height:15px;font-size:11px;font-weight:900;color:#E8590C;margin-top:1px}' +
    '.ph-card.night .ph-cell .s{color:#FDBA74}' +
    '.ph-cell.passed{opacity:.6}' +
    '.ph-cell.current{opacity:1;background:#fff;box-shadow:0 0 0 2px #10A765,0 10px 18px -10px rgba(16,167,101,.7)}' +
    '.ph-card.night .ph-cell.current{background:rgba(255,255,255,.22)}' +
    '.ph-cell.done::after{content:"✓";position:absolute;top:-5px;right:-3px;width:20px;height:20px;border-radius:50%;background:#10A765;color:#fff;font:900 12px/20px Nunito,sans-serif}' +
    '.ph-cell:active{transform:scale(.94)}' +
    '.ph-check{margin-top:12px;width:100%;min-height:52px;border:none;border-radius:20px;cursor:pointer;font:900 16px/1 inherit;font-family:inherit;color:#fff;' +
      'background:linear-gradient(120deg,#10A765 0%,#0A9488 52%,#0A7FB0 100%);text-shadow:0 1px 1.5px rgba(0,70,35,.38);box-shadow:inset 0 18px 16px -14px rgba(255,255,255,.45),0 12px 24px -12px rgba(10,143,160,.6)}' +
    '.ph-check[disabled]{background:rgba(255,255,255,.7);color:#4A5A6B;text-shadow:none;box-shadow:none;cursor:default}' +
    '.ph-card.night .ph-check[disabled]{background:rgba(255,255,255,.14);color:#D7DCEB}' +
    '.ph-check:active{transform:scale(.97)}' +
    '.ph-streak{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}' +
    '.ph-streak div{border-radius:16px;padding:9px 4px;text-align:center;background:rgba(255,255,255,.55)}' +
    '.ph-card.night .ph-streak div{background:rgba(255,255,255,.1)}' +
    '.ph-streak b{display:block;font-family:Fredoka,Nunito,sans-serif;font-size:21px;line-height:1.1}.ph-streak span{font-size:11.5px;font-weight:800;opacity:.75}' +
    '.ph-empty{text-align:center;padding:6px 4px 2px}.ph-empty img{width:96px;height:96px;object-fit:contain}' +
    '.ph-empty h3{font-size:18px;margin:4px 0}.ph-empty p{font-size:13.5px;font-weight:700;opacity:.8;margin:0 0 12px}' +
    '.ph-empty .row{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
    '.ph-empty button{min-height:48px;border:none;border-radius:18px;cursor:pointer;font:900 14.5px/1 inherit;font-family:inherit}' +
    '.ph-empty .pri{color:#fff;background:linear-gradient(120deg,#10A765,#0A9488 52%,#0A7FB0)}.ph-empty .sec{background:rgba(255,255,255,.8);color:#152230}' +
    '.ph-tools{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 16px 4px}' +
    '.ph-tool{border:none;cursor:pointer;border-radius:22px;padding:14px 6px 12px;text-align:center;font-family:inherit;color:var(--cream);background:var(--bg-elev);box-shadow:var(--card-shadow)}' +
    '.ph-tool .ic{width:46px;height:46px;margin:0 auto 6px;border-radius:23%;display:grid;place-items:center;overflow:hidden;box-shadow:0 6px 12px -7px rgba(30,60,110,.55)}' +
    '.ph-tool .ic img{width:100%;height:100%;display:block}' +
    '.ph-tool b{display:block;font-size:14px;font-weight:900}.ph-tool span{display:block;font-size:11.5px;font-weight:700;color:var(--cream-dim);margin-top:2px}' +
    '.ph-tool:active{transform:scale(.95)}' +
    /* bottom sheet */
    '.ph-sheet-bg{position:fixed;inset:0;z-index:9000;background:rgba(20,30,50,.32);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:opacity .25s}' +
    '.ph-sheet-bg.open{opacity:1;pointer-events:auto}' +
    '.ph-sheet{position:fixed;left:0;right:0;bottom:0;z-index:9001;max-width:560px;margin:0 auto;max-height:86vh;overflow:auto;border-radius:28px 28px 0 0;padding:10px 18px calc(22px + env(safe-area-inset-bottom));' +
      'background:var(--bg-elev);color:var(--cream);transform:translateY(105%);transition:transform .38s cubic-bezier(.2,.9,.25,1);box-shadow:0 -20px 50px -20px rgba(0,0,0,.4)}' +
    '.ph-sheet.open{transform:none}' +
    '.ph-grab{width:44px;height:5px;border-radius:3px;background:var(--hairline-strong);margin:0 auto 10px}' +
    '.ph-sh-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}' +
    '.ph-sh-head h3{font-size:20px;margin:0}.ph-x{width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;background:var(--surface-2);color:var(--cream);font-size:16px}' +
    '.ph-cities{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}' +
    '.ph-city{min-height:48px;border:none;border-radius:16px;cursor:pointer;display:flex;align-items:center;gap:8px;padding:0 12px;font:800 14.5px/1 inherit;font-family:inherit;color:var(--cream);background:var(--surface-2)}' +
    '.ph-city.on{box-shadow:0 0 0 2px #10A765}' +
    '.ph-gps{width:100%;margin-bottom:10px;min-height:50px;border:none;border-radius:18px;cursor:pointer;color:#fff;font:900 15px/1 inherit;font-family:inherit;background:linear-gradient(120deg,#10A765,#0A9488 52%,#0A7FB0)}' +
    '.ph-compass{position:relative;width:240px;height:240px;margin:6px auto 10px}' +
    '.ph-dial{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,#fff 0%,#F2F6FC 70%,#E3EBF6 100%);box-shadow:inset 0 0 0 5px #0A9488,inset 0 0 0 9px #fff,0 14px 30px -14px rgba(20,60,110,.5);transition:transform .25s linear}' +
    'html[data-theme="dark"] .ph-dial{background:radial-gradient(circle,#2A3350 0%,#1E2540 75%,#161C2F 100%)}' +
    '.ph-dial .m{position:absolute;left:50%;top:50%;font:900 15px/1 Nunito,sans-serif;color:var(--cream-dim)}' +
    '.ph-dial .kb{position:absolute;left:50%;top:50%;font-size:30px;line-height:1}' +
    '.ph-arrow{position:absolute;left:50%;top:14px;margin-left:-11px;width:0;height:0;border-left:11px solid transparent;border-right:11px solid transparent;border-bottom:20px solid #E8590C}' +
    '.ph-compass.ok .ph-dial{box-shadow:inset 0 0 0 5px #10A765,inset 0 0 0 9px #fff,0 0 0 6px rgba(16,167,101,.25)}' +
    '.ph-qinfo{text-align:center;font-weight:800;font-size:14px;color:var(--cream-dim)}' +
    '.ph-qinfo b{display:block;font-family:Fredoka,Nunito,sans-serif;font-size:26px;color:var(--cream)}' +
    '.ph-quote{border-radius:24px;padding:22px 18px;color:#fff;text-align:center;background:linear-gradient(135deg,#10A765 0%,#0A9488 52%,#0A7FB0 100%)}' +
    '.ph-quote .ar{font-family:"Amiri Quran",Amiri,serif;font-size:24px;line-height:1.9;direction:rtl}' +
    '.ph-quote .tx{font-size:16px;font-weight:800;line-height:1.45;margin-top:10px}.ph-quote .src{font-size:12.5px;font-weight:900;letter-spacing:.06em;opacity:.85;margin-top:10px;text-transform:uppercase}' +
    '.ph-qnav{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px}' +
    '.ph-qnav button{min-height:46px;border:none;border-radius:16px;cursor:pointer;font:900 14px/1 inherit;font-family:inherit;color:var(--cream);background:var(--surface-2)}' +
    '.ph-hj{text-align:center;margin-bottom:12px}.ph-hj b{display:block;font-family:Fredoka,Nunito,sans-serif;font-size:24px}.ph-hj span{font-size:13px;font-weight:800;color:var(--cream-dim)}' +
    '.ph-ev{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:18px;background:var(--surface-2);margin-bottom:8px}' +
    '.ph-ev .i{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;font-size:20px;background:var(--bg-elev);flex:0 0 40px}' +
    '.ph-ev .b{flex:1;min-width:0}.ph-ev .b b{display:block;font-size:14.5px}.ph-ev .b span{display:block;font-size:12.5px;font-weight:700;color:var(--cream-dim)}' +
    '.ph-ev .d{text-align:right;font-family:Fredoka,Nunito,sans-serif;font-size:19px;font-weight:700;color:#0A9488;line-height:1}.ph-ev .d small{display:block;font-family:Nunito,sans-serif;font-size:11px;font-weight:800;color:var(--cream-dim)}' +
    '.ph-ev.first{background:linear-gradient(135deg,#FFF3D6,#FFE3EC);color:#152230}.ph-ev.first .b span{color:#5A6878}' +
    '.ph-ev .tip{display:block;margin-top:4px;font-size:12.5px;font-weight:700;color:#9A5A00}' +
    '.ph-burst{position:fixed;z-index:9500;pointer-events:none;font-size:20px;animation:phBurst 1s ease-out forwards}' +
    '@keyframes phBurst{to{transform:translate(var(--dx),var(--dy)) rotate(260deg);opacity:0}}';
  var st = document.createElement("style"); st.id = "bm-prayer-css"; st.textContent = css; document.head.appendChild(st);

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  function hijri(d, numeric) {
    try {
      if (numeric) { var p = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }).formatToParts(d); var g = function (t) { return +p.find(function (x) { return x.type === t; }).value; }; return { d: g("day"), m: g("month"), y: g("year") }; }
      var s = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(d);
      if (L() === "en") return s.replace(" AH", " AH");
      return s.replace("Rabiʻ I", "Rabiul Awwal").replace("Rabiʻ II", "Rabiul Akhir").replace("Jumada I", "Jumadil Awwal").replace("Jumada II", "Jumadil Akhir")
        .replace("Shaʻban", "Sya'ban").replace("Ramadan", "Ramadhan").replace("Shawwal", "Syawal").replace("Dhuʻl-Qiʻdah", "Dzulqa'dah").replace("Dhuʻl-Hijjah", "Dzulhijjah").replace(" AH", " H");
    } catch (e) { return numeric ? null : ""; }
  }
  var isNight = function () { var h = new Date().getHours(); return h >= 18 || h < 5; };

  function render() {
    refreshStreaks();
    var names = NAMES[L()], card = '<div class="ph-card' + (isNight() ? " night" : "") + '">';
    var name = locName();
    card += '<div class="ph-top"><button class="ph-loc" data-act="city">📍 ' + esc(name || T("Pilih kota", "Choose city")) + ' ▾</button><div class="ph-hijri">' + esc(hijri(new Date())) + "</div></div>";
    if (!loc || !times) {
      card += '<div class="ph-empty"><img src="baby-mo-poses/baby-mo-pose-05.webp" alt=""><h3>' +
        (loc ? T("Memuat waktu sholat…", "Loading prayer times…") : T("Kapan waktu sholat?", "When is it time to pray?")) + "</h3><p>" +
        T("Aktifkan lokasi atau pilih kota, biar Mo tahu waktu sholatmu 🕌", "Turn on location or pick a city so Mo knows your prayer times 🕌") +
        '</p><div class="row"><button class="pri" data-act="gps">📍 ' + T("Pakai lokasiku", "Use my location") + '</button><button class="sec" data-act="city">🏙️ ' + T("Pilih kota", "Pick a city") + "</button></div></div></div>";
      root.innerHTML = card; return;
    }
    var now = new Date(), nm = now.getHours() * 60 + now.getMinutes(), ci = curIdx(), s = stats(), t = today();
    var nx = -1, nmin = Infinity;
    mins.forEach(function (m, i) { if (m > nm && m < nmin) { nmin = m; nx = i; } });
    var after = nx === -1; if (after) { nx = 0; nmin = mins[0] + 1440; }
    var diff = nmin - nm, hh = Math.floor(diff / 60), mm = diff % 60;
    var prev = nx === 0 ? 4 : nx - 1, pm = mins[prev]; if (pm >= nmin) pm -= 1440; var n2 = nm < pm ? nm + 1440 : nm;
    var pct = Math.max(0, Math.min(100, 100 * (n2 - pm) / Math.max(1, nmin - pm)));
    card += '<div class="ph-next"><img src="baby-mo-poses/' + (isNight() ? "baby-mo-pose-05" : "baby-mo-idea") + '.webp" alt=""><div style="flex:1;min-width:0">' +
      '<div class="lbl">' + T("Sholat berikutnya", "Next prayer") + '</div><div class="nm">' + ICONS[nx] + " " + names[nx] + " · " + times[KEYS[nx]].slice(0, 5) + "</div>" +
      '<div class="cd">' + T("dalam ", "in ") + (hh > 0 ? hh + T(" jam ", "h ") : "") + mm + T(" menit", " min") + '</div><div class="ph-bar"><i style="width:' + pct.toFixed(1) + '%"></i></div></div></div>';
    card += '<div class="ph-cells">';
    KEYS.forEach(function (k, i) {
      var r = s.s[k] || {}, done = r.lastDate === t, cls = "ph-cell";
      if (done) cls += " done";
      if (i === ci) cls += " current"; else if (mins[i] <= nm || after) cls += " passed";
      card += '<button class="' + cls + '" data-act="cell" data-i="' + i + '"><span class="e">' + ICONS[i] + '</span><span class="n">' + names[i] + '</span><span class="t">' + times[k].slice(0, 5) +
        '</span><span class="s">' + (r.count > 0 ? "🔥" + r.count : "") + "</span></button>";
    });
    card += "</div>";
    if (ci === -1) card += '<button class="ph-check" disabled>⏳ ' + T("Tunggu waktu Subuh", "Wait for Fajr time") + "</button>";
    else if ((s.s[KEYS[ci]] || {}).lastDate === t) card += '<button class="ph-check" disabled>✓ ' + names[ci] + T(" sudah dicentang — MasyaAllah!", " checked — MashaAllah!") + "</button>";
    else card += '<button class="ph-check" data-act="check">✦ ' + T("Aku sudah sholat ", "I prayed ") + names[ci] + "</button>";
    card += '<div class="ph-streak"><div><b>' + s.td + '/5</b><span>' + T("Hari ini", "Today") + '</span></div><div><b>🔥 ' + s.cur + '</b><span>' + T("Streak (hari)", "Streak (days)") +
      '</span></div><div><b>' + s.tot + '</b><span>' + T("Total sholat", "Total prayers") + "</span></div></div></div>";
    root.innerHTML = card;
  }

  function burst(x, y) {
    var em = ["⭐", "✨", "🌟", "💚", "🎉"];
    for (var i = 0; i < 14; i++) {
      var b = document.createElement("span"); b.className = "ph-burst"; b.textContent = em[i % em.length];
      b.style.left = x + "px"; b.style.top = y + "px";
      b.style.setProperty("--dx", (Math.random() * 220 - 110) + "px"); b.style.setProperty("--dy", (Math.random() * -170 - 30) + "px");
      document.body.appendChild(b); setTimeout(function (n) { return function () { n.remove(); }; }(b), 1100);
    }
  }
  function doCheck(el) {
    var ci = curIdx(); if (ci < 0) return;
    var c = checkIn(KEYS[ci]); if (!c) return;
    var r = (el || root).getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2);
    var ms = [3, 7, 14, 30, 50, 100].indexOf(c.count) >= 0, nm = NAMES[L()][ci];
    toast(ms ? T("MasyaAllah! Streak " + nm + " " + c.count + " hari 🔥", "MashaAllah! " + c.count + "-day " + nm + " streak 🔥")
             : T("Alhamdulillah! " + nm + " ✓ · streak " + c.count + " hari", "Alhamdulillah! " + nm + " ✓ · " + c.count + "-day streak"));
    try { if (window.BabyMo) { BabyMo.react(ms ? "win" : "correct"); } } catch (e) {}
    try { if (navigator.vibrate) navigator.vibrate(ms ? [18, 40, 18] : 12); } catch (e) {}
    render();
  }
  function toast(m) { if (typeof window.showToast === "function") window.showToast(m); }

  /* ── sheets ── */
  var bg = document.createElement("div"); bg.className = "ph-sheet-bg";
  var sh = document.createElement("div"); sh.className = "ph-sheet"; sh.setAttribute("role", "dialog"); sh.setAttribute("aria-modal", "true");
  document.body.appendChild(bg); document.body.appendChild(sh);
  var onClose = null;
  function openSheet(title, html, after) {
    sh.innerHTML = '<div class="ph-grab"></div><div class="ph-sh-head"><h3>' + title + '</h3><button class="ph-x" data-act="close" aria-label="' + T("Tutup", "Close") + '">✕</button></div>' + html;
    bg.classList.add("open"); sh.classList.add("open"); if (after) after();
  }
  function closeSheet() { bg.classList.remove("open"); sh.classList.remove("open"); if (onClose) { onClose(); onClose = null; } }
  bg.addEventListener("click", closeSheet);

  function openCities() {
    var m = get("mo_manual_city", null);
    openSheet("📍 " + T("Lokasi sholat", "Prayer location"),
      '<button class="ph-gps" data-act="gps">📍 ' + T("Pakai lokasiku sekarang", "Use my current location") + '</button><div class="ph-cities">' +
      CITIES.map(function (c, i) { return '<button class="ph-city' + (m && m.n === c.n ? " on" : "") + '" data-act="pick" data-i="' + i + '"><span>' + c.i + "</span>" + c.n + "</button>"; }).join("") + "</div>");
  }
  function computeQibla() {
    if (!loc) { qibla = null; return; }
    var pk = KAABA.lat * Math.PI / 180, lk = KAABA.lng * Math.PI / 180, p = loc.lat * Math.PI / 180, l = loc.lng * Math.PI / 180;
    qibla = (Math.atan2(Math.sin(lk - l), Math.cos(p) * Math.tan(pk) - Math.sin(p) * Math.cos(lk - l)) * 180 / Math.PI + 360) % 360;
  }
  var compassOn = false;
  function onOrient(e) {
    var h = typeof e.webkitCompassHeading === "number" ? e.webkitCompassHeading : (typeof e.alpha === "number" && e.absolute !== false ? 360 - e.alpha : null);
    if (h == null) return; heading = h; drawCompass();
  }
  function startCompass() {
    var go = function () { if (compassOn) return; compassOn = true; window.addEventListener("deviceorientationabsolute", onOrient, true); window.addEventListener("deviceorientation", onOrient, true); drawCompass(); };
    try {
      if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission().then(function (r) { if (r === "granted") go(); else toast(T("Izin kompas ditolak", "Compass permission denied")); }).catch(function () {});
      } else go();
    } catch (e) {}
  }
  function stopCompass() { compassOn = false; window.removeEventListener("deviceorientationabsolute", onOrient, true); window.removeEventListener("deviceorientation", onOrient, true); }
  function dirName(b) { var ids = ["utara", "timur laut", "timur", "tenggara", "selatan", "barat daya", "barat", "barat laut"], en = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"]; var i = Math.round(b / 45) % 8; return T(ids[i], en[i]); }
  function drawCompass() {
    var dial = sh.querySelector(".ph-dial"); if (!dial || qibla == null) return;
    var h = heading || 0; dial.style.transform = "rotate(" + (-h) + "deg)";
    var rel = ((qibla - h) % 360 + 360) % 360, ok = heading != null && (rel < 6 || rel > 354);
    sh.querySelector(".ph-compass").classList.toggle("ok", ok);
    var info = sh.querySelector(".ph-qhint");
    if (info) info.textContent = heading == null ? T("Ketuk “Aktifkan kompas”, lalu putar HP pelan-pelan.", "Tap “Turn on compass”, then turn your phone slowly.")
      : ok ? T("✓ Kiblat tepat di depan kamu — siap sholat!", "✓ The qibla is right in front of you — ready to pray!") : T("Putar HP sampai 🕋 ada di atas panah", "Turn your phone until 🕋 is at the arrow");
  }
  function openQibla() {
    if (!loc) { openCities(); toast(T("Pilih lokasi dulu ya", "Pick a location first")); return; }
    computeQibla();
    var marks = "", r = 92;
    [["N", 0], ["E", 90], ["S", 180], ["W", 270]].forEach(function (m) {
      var a = (m[1] - 90) * Math.PI / 180, lab = L() === "en" ? m[0] : { N: "U", E: "T", S: "S", W: "B" }[m[0]];
      marks += '<span class="m" style="transform:translate(-50%,-50%) translate(' + (Math.cos(a) * r).toFixed(1) + "px," + (Math.sin(a) * r).toFixed(1) + 'px)">' + lab + "</span>";
    });
    var qa = (qibla - 90) * Math.PI / 180, rk = 72;
    marks += '<span class="kb" style="transform:translate(-50%,-50%) translate(' + (Math.cos(qa) * rk).toFixed(1) + "px," + (Math.sin(qa) * rk).toFixed(1) + 'px)">🕋</span>';
    openSheet("🧭 " + T("Arah Kiblat", "Qibla Direction"),
      '<div class="ph-compass"><div class="ph-dial">' + marks + '</div><div class="ph-arrow"></div></div>' +
      '<div class="ph-qinfo"><b>' + qibla.toFixed(0) + "° " + T("dari utara", "from north") + "</b>" + T("Arah ", "Towards ") + dirName(qibla) + " · " + esc(locName() || "") + "</div>" +
      '<p class="ph-qinfo ph-qhint" style="margin-top:8px"></p><button class="ph-gps" data-act="compass" style="margin-top:6px">📱 ' + T("Aktifkan kompas", "Turn on compass") + "</button>",
      function () { onClose = stopCompass; drawCompass(); });
  }
  var qi = 0;
  function quoteHtml() {
    var q = Q[qi];
    return '<div class="ph-quote"><div class="ar">' + q[0] + '</div><div class="tx">“' + esc(L() === "en" ? q[2] : q[1]) + '”</div><div class="src">' + q[3] + "</div></div>" +
      '<div class="ph-qnav"><button data-act="qprev">‹ ' + T("Sebelumnya", "Previous") + '</button><button data-act="qshare">🔗 ' + T("Bagikan", "Share") + '</button><button data-act="qnext">' + T("Lainnya", "Next") + " ›</button></div>";
  }
  function openQuotes() {
    var n = new Date(), s0 = new Date(n.getFullYear(), 0, 0); qi = Math.floor((n - s0) / 864e5) % Q.length;
    openSheet("💎 " + T("Mutiara Hari Ini", "Today's Pearl"), '<div id="phQ">' + quoteHtml() + "</div>");
  }
  function openCalendar() {
    var now = new Date(), h = hijri(now, true), list = [];
    if (h) {
      var dayH = function (d) { return hijri(d, true); };
      [h.y, h.y + 1].forEach(function (y) {
        EVENTS.forEach(function (ev) {
          for (var i = 0; i < 400; i++) {
            var d = new Date(now.getTime() + i * 864e5), x = dayH(d);
            if (x.y === y && x.m === ev[0] && x.d === ev[1]) { list.push({ ev: ev, d: d, da: i }); break; }
            if (x.y > y || (x.y === y && x.m > ev[0])) break;
          }
        });
      });
    }
    list.sort(function (a, b) { return a.da - b.da; });
    var fmt = function (d) { return d.toLocaleDateString(L() === "en" ? "en-GB" : "id-ID", { day: "numeric", month: "long", year: "numeric" }); };
    var html = '<div class="ph-hj"><b>' + esc(hijri(now)) + "</b><span>" + fmt(now) + "</span></div>";
    list.slice(0, 7).forEach(function (o, i) {
      var e = o.ev, when = o.da === 0 ? T("Hari ini!", "Today!") : o.da === 1 ? T("Besok", "Tomorrow") : "";
      html += '<div class="ph-ev' + (i === 0 ? " first" : "") + '"><div class="i">' + e[4] + '</div><div class="b"><b>' + esc(L() === "en" ? e[3] : e[2]) + "</b><span>" + fmt(o.d) + "</span>" +
        (i === 0 ? '<span class="tip">💡 ' + esc(L() === "en" ? e[6] : e[5]) + "</span>" : "") + '</div><div class="d">' + (when || o.da) + (when ? "" : "<small>" + T("hari lagi", "days to go") + "</small>") + "</div></div>";
    });
    openSheet("📅 " + T("Kalender Hijriah", "Hijri Calendar"), html);
  }

  /* ── tools row + events ── */
  var tools = document.getElementById("prayerTools");
  function renderTools() {
    if (!tools) return;
    tools.innerHTML =
      '<button class="ph-tool" data-act="qibla"><div class="ic"><img src="icons/ui/qibla.svg" alt="" draggable="false"></div><b>' + T("Kiblat", "Qibla") + "</b><span>" + T("Arah Ka'bah", "Ka'bah direction") + "</span></button>" +
      '<button class="ph-tool" data-act="quote"><div class="ic"><img src="icons/ui/pearl.svg" alt="" draggable="false"></div><b>' + T("Mutiara", "Pearls") + "</b><span>" + T("Ayat & hadis", "Verses & hadith") + "</span></button>" +
      '<button class="ph-tool" data-act="cal"><div class="ic"><img src="icons/ui/calendar.svg" alt="" draggable="false"></div><b>' + T("Kalender", "Calendar") + "</b><span>" + T("Hari besar Islam", "Islamic holidays") + "</span></button>";
  }
  function onClick(e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var a = b.dataset.act;
    if (a === "city") openCities();
    else if (a === "gps") { closeSheet(); useMyLocation(); }
    else if (a === "pick") { var c = CITIES[+b.dataset.i]; setLoc(c, c.n); closeSheet(); toast("📍 " + c.n + T(" dipilih!", " selected!")); }
    else if (a === "cell") { if (+b.dataset.i === curIdx() && !b.classList.contains("done")) doCheck(b); }
    else if (a === "check") doCheck(b);
    else if (a === "qibla") openQibla();
    else if (a === "quote") openQuotes();
    else if (a === "cal") openCalendar();
    else if (a === "close") closeSheet();
    else if (a === "compass") startCompass();
    else if (a === "qnext" || a === "qprev") { qi = (qi + (a === "qnext" ? 1 : Q.length - 1)) % Q.length; document.getElementById("phQ").innerHTML = quoteHtml(); }
    else if (a === "qshare") {
      var q = Q[qi], tx = q[0] + '\n\n"' + (L() === "en" ? q[2] : q[1]) + '"\n— ' + q[3] + "\n\nvia Baby Mo · play.babymo.id";
      var doShare = function () { if (navigator.share) navigator.share({ text: tx }).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(tx).then(function () { toast(T("✓ Tersalin", "✓ Copied")); }); };
      if (window.BabyMo && BabyMo.parentGate) BabyMo.parentGate(doShare); else if (!window.Capacitor) doShare();
    }
  }
  root.addEventListener("click", onClick); sh.addEventListener("click", onClick); if (tools) tools.addEventListener("click", onClick);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sh.classList.contains("open")) closeSheet(); });

  /* re-render when the hub switches language, and every 30 s for the countdown */
  window.bmPrayerRender = function () { render(); renderTools(); };
  setInterval(function () { if (times) render(); }, 30000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { if (times && dkey(new Date()) !== (render._d || "")) fetchTimes(); else render(); } });

  renderTools(); render(); fetchTimes();
  render._d = dkey(new Date());
})();
