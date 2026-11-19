/* Baby Mo — on-device prayer times (no network).
   Computed here from the standard low-precision solar position formulas
   (the same PrayTimes approach aladhan.com uses), so the numbers match
   aladhan for the same method.

   Methods (fajr° / isha° or minutes after maghrib):
     kemenag  Kementerian Agama RI 20 / 18            (Indonesia — the default)
     jakim    JAKIM Malaysia 20 / 18                  muis  MUIS Singapore 20 / 18
     mwl      Muslim World League 18 / 17             isna  ISNA, North America 15 / 15
     egypt    Egyptian Authority 19.5 / 17.5          umm   Umm al-Qura 18.5 / 90 min (120 in Ramadan)
     karachi  Univ. of Islamic Sciences, Karachi 18 / 18
     gulf     Gulf region 19.5 / 90 min               kuwait 18 / 17.5     qatar 18 / 90 min
     dubai    18.2 / 18.2 (+ the official minute offsets)
     diyanet  Turkey 18 / 17 (+ the official temkin offsets)
     uoif     France (UOIF) 12 / 12                   russia 16 / 15
     algeria  18 / 17     tunisia 18 / 18     morocco 19 / 17     jordan 18 / 18, maghrib +5 min
     tehran   Univ. of Tehran 17.7 / 14, maghrib 4.5°, midnight sunset→fajr
   "auto" picks the method from the place's country (METHOD_BY_COUNTRY);
   Asr is Shafi'i (shadow ×1) unless set to Hanafi (×2) — "auto" uses Hanafi
   in Pakistan, India, Bangladesh, Afghanistan and Central Asia.
   Sunrise/sunset 0.833° below the horizon; high latitudes use aladhan's
   default "angle based" rule; times are rounded to the nearest minute and
   formatted "HH:MM" in the place's own time zone (mo_cached_loc.tz, from the
   city list; else the device's). BMPrayerTimes.now() gives "now" on that same
   clock for countdowns.

   API:
     BMPrayerTimes.timings(date, lat, lng[, tzHours[, opts]])
       → { Imsak, Fajr, Sunrise, Dhuhr, Asr, Sunset, Maghrib, Isha, Midnight }
       opts = { method, asr, cc }; without opts the saved choice
       (localStorage "mo_prayer_settings" + the country in "mo_cached_loc") is used.
     BMPrayerTimes.settings()               → { method, asr, cc, auto }  (resolved)
     BMPrayerTimes.saveSettings({method, asr})
     BMPrayerTimes.METHODS / methodFor(cc) / asrFor(cc) / methodName(key, lang)
     BMPrayerTimes.qibla(lat, lng)          → bearing in degrees from north
     BMPrayerTimes.zoneLabel(lang)          → "WIB" / "WITA" / "WIT" or the
                                               device time-zone city, e.g. "London"
   Nothing here touches the network; it only reads the saved settings. */
(function (root) {
  "use strict";

  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  var sin = function (d) { return Math.sin(d * D2R); };
  var cos = function (d) { return Math.cos(d * D2R); };
  var tan = function (d) { return Math.tan(d * D2R); };
  var asin = function (x) { return Math.asin(x) * R2D; };
  var acos = function (x) { return Math.acos(x) * R2D; };
  var atan2 = function (y, x) { return Math.atan2(y, x) * R2D; };
  var acot = function (x) { return Math.atan(1 / x) * R2D; };
  var fix = function (a, b) { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };
  var fixAngle = function (a) { return fix(a, 360); };
  var fixHour = function (h) { return fix(h, 24); };

  /* fajr / isha angles; ishaMin = isha that many minutes after maghrib;
     maghribAngle = maghrib when the sun is that far below the horizon */
  var METHODS = {
    kemenag: { fajr: 20, isha: 18, id: "Kemenag RI (Indonesia)", en: "Kemenag RI (Indonesia)" },
    jakim:   { fajr: 20, isha: 18, id: "JAKIM (Malaysia)", en: "JAKIM (Malaysia)" },
    muis:    { fajr: 20, isha: 18, id: "MUIS (Singapura)", en: "MUIS (Singapore)" },
    mwl:     { fajr: 18, isha: 17, id: "Liga Muslim Dunia (MWL)", en: "Muslim World League (MWL)" },
    isna:    { fajr: 15, isha: 15, id: "ISNA (Amerika Utara)", en: "ISNA (North America)" },
    egypt:   { fajr: 19.5, isha: 17.5, id: "Otoritas Survei Mesir", en: "Egyptian General Authority" },
    umm:     { fajr: 18.5, ishaMin: 90, ramadanIshaMin: 120, id: "Umm al-Qura (Makkah)", en: "Umm al-Qura (Makkah)" },
    karachi: { fajr: 18, isha: 18, id: "Univ. Ilmu Islam Karachi", en: "Univ. of Islamic Sciences, Karachi" },
    gulf:    { fajr: 19.5, ishaMin: 90, id: "Kawasan Teluk", en: "Gulf Region" },
    kuwait:  { fajr: 18, isha: 17.5, id: "Kuwait", en: "Kuwait" },
    qatar:   { fajr: 18, ishaMin: 90, id: "Qatar", en: "Qatar" },
    dubai:   { fajr: 18.2, isha: 18.2, adj: { sunrise: -3, dhuhr: 3, asr: 3, maghrib: 3 }, id: "Dubai (UEA)", en: "Dubai (UAE)" },
    diyanet: { fajr: 18, isha: 17, adj: { sunrise: -7, dhuhr: 5, asr: 4, maghrib: 7 }, id: "Diyanet (Turki)", en: "Diyanet (Turkey)" },
    uoif:    { fajr: 12, isha: 12, id: "UOIF (Prancis)", en: "UOIF (France)" },
    russia:  { fajr: 16, isha: 15, id: "Rusia", en: "Russia" },
    algeria: { fajr: 18, isha: 17, id: "Aljazair", en: "Algeria" },
    tunisia: { fajr: 18, isha: 18, id: "Tunisia", en: "Tunisia" },
    morocco: { fajr: 19, isha: 17, id: "Maroko", en: "Morocco" },
    jordan:  { fajr: 18, isha: 18, maghribMin: 5, id: "Yordania", en: "Jordan" },
    tehran:  { fajr: 17.7, isha: 14, maghribAngle: 4.5, jafari: true, id: "Univ. Teheran", en: "University of Tehran" }
  };
  var METHOD_ORDER = ["kemenag", "jakim", "muis", "mwl", "umm", "egypt", "karachi", "isna", "diyanet", "dubai", "qatar", "kuwait", "gulf", "jordan", "morocco", "algeria", "tunisia", "uoif", "russia", "tehran"];
  var BY_CC = {
    ID: "kemenag", MY: "jakim", SG: "muis", BN: "muis",
    SA: "umm", YE: "umm", AE: "dubai", QA: "qatar", KW: "kuwait", BH: "gulf", OM: "gulf",
    EG: "egypt", SD: "egypt", SS: "egypt", LY: "egypt", SY: "egypt", LB: "egypt", IQ: "egypt", PS: "egypt",
    JO: "jordan", DZ: "algeria", TN: "tunisia", MA: "morocco", TR: "diyanet", FR: "uoif", RU: "russia", IR: "tehran",
    PK: "karachi", IN: "karachi", BD: "karachi", AF: "karachi", LK: "karachi", NP: "karachi",
    US: "isna", CA: "isna"
  };
  var HANAFI_CC = { PK: 1, IN: 1, BD: 1, AF: 1, UZ: 1, TJ: 1, TM: 1, KG: 1, KZ: 1 };
  function methodFor(cc) { return BY_CC[cc] || "mwl"; }
  function asrFor(cc) { return HANAFI_CC[cc] ? "hanafi" : "shafii"; }
  /* old saved spots have no country: the 20°/18° region (Indonesia, Malaysia,
     Singapore, Brunei) keeps Kemenag exactly as before; elsewhere → MWL */
  function guessCC(lat, lng) { return lat > -11.5 && lat < 7.5 && lng > 94 && lng < 141.5 ? "ID" : ""; }
  /* no place yet: an Indonesian phone clock means Indonesia */
  function deviceCC() { var z = ""; try { z = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {} return ZONES[z] ? "ID" : ""; }
  function store(k, d) { try { var v = root.localStorage && localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function settings(lat, lng) {
    var s = store("mo_prayer_settings", {}) || {}, loc = store("mo_cached_loc", null) || {};
    var cc = loc.cc || (lat != null ? guessCC(+lat, +lng) : loc.lat != null ? guessCC(loc.lat, loc.lng) : deviceCC());
    var m = METHODS[s.method] ? s.method : methodFor(cc);
    var a = s.asr === "hanafi" || s.asr === "shafii" ? s.asr : asrFor(cc);
    return { method: m, asr: a, cc: cc, auto: !METHODS[s.method], autoAsr: !(s.asr === "hanafi" || s.asr === "shafii") };
  }
  function saveSettings(o) {
    var s = store("mo_prayer_settings", {}) || {};
    for (var k in o) { if (o[k] == null || o[k] === "auto") delete s[k]; else s[k] = o[k]; }
    try { localStorage.setItem("mo_prayer_settings", JSON.stringify(s)); } catch (e) {}
  }
  function methodName(k, lang) { var m = METHODS[k]; return m ? m[lang === "en" ? "en" : "id"] : k; }
  function isRamadan(date) {
    try { return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { month: "numeric" }).format(date) === "9"; } catch (e) { return false; }
  }
  var PARAMS = { fajr: 20, isha: 18, asrFactor: 1, maghribMin: 0, dhuhrMin: 0, imsakMin: 10 };
  var RISE_SET = 0.833;

  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    var A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }

  /* declination + equation of time (hours) for a Julian date */
  function sunPos(jd) {
    var D = jd - 2451545.0;
    var g = fixAngle(357.529 + 0.98560028 * D);
    var q = fixAngle(280.459 + 0.98564736 * D);
    var L = fixAngle(q + 1.915 * sin(g) + 0.020 * sin(2 * g));
    var e = 23.439 - 0.00000036 * D;
    var RA = atan2(cos(e) * sin(L), cos(L)) / 15;
    return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - fixHour(RA) };
  }

  function compute(y, mo, d, lat, lng, tz, P) {
    P = P || PARAMS;
    var jDate = julian(y, mo, d) - lng / (15 * 24);
    var midDay = function (t) { return fixHour(12 - sunPos(jDate + t).eqt); };
    /* time (hours, UT-ish solar) at which the sun is `angle`° below the horizon */
    var angleTime = function (angle, t, ccw) {
      var decl = sunPos(jDate + t).decl, noon = midDay(t);
      var h = acos((-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat))) / 15;
      return noon + (ccw ? -h : h);
    };
    var asrTime = function (factor, t) {
      var decl = sunPos(jDate + t).decl;
      return angleTime(-acot(factor + tan(Math.abs(lat - decl))), t);
    };

    /* one pass from the usual first guesses (day portions), as PrayTimes does */
    var g = { fajr: 5 / 24, sunrise: 6 / 24, dhuhr: 12 / 24, asr: 13 / 24, sunset: 18 / 24, isha: 18 / 24 };
    var t = {
      fajr: angleTime(P.fajr, g.fajr, true),
      sunrise: angleTime(RISE_SET, g.sunrise, true),
      dhuhr: midDay(g.dhuhr),
      asr: asrTime(P.asrFactor || 1, g.asr),
      sunset: angleTime(RISE_SET, g.sunset),
      maghrib: P.maghribAngle ? angleTime(P.maghribAngle, g.sunset) : 0,
      isha: P.ishaMin ? 0 : angleTime(P.isha, g.isha)
    };
    var k;
    for (k in t) t[k] += tz - lng / 15;

    /* high-latitude rule: angle based */
    var night = fixHour(t.sunrise - t.sunset);
    var fajrMax = P.fajr / 60 * night;
    if (isNaN(t.fajr) || fixHour(t.sunrise - t.fajr) > fajrMax) t.fajr = t.sunrise - fajrMax;
    if (P.maghribAngle) {
      var mMax = P.maghribAngle / 60 * night;
      if (isNaN(t.maghrib) || fixHour(t.maghrib - t.sunset) > mMax) t.maghrib = t.sunset + mMax;
    } else t.maghrib = t.sunset + (P.maghribMin || 0) / 60;
    if (P.ishaMin) t.isha = t.maghrib + P.ishaMin / 60;
    else {
      var ishaMax = P.isha / 60 * night;
      if (isNaN(t.isha) || fixHour(t.isha - t.sunset) > ishaMax) t.isha = t.sunset + ishaMax;
    }

    t.dhuhr += (P.dhuhrMin || 0) / 60;
    t.imsak = t.fajr - (P.imsakMin == null ? 10 : P.imsakMin) / 60;
    if (P.adj) for (k in P.adj) t[k] += P.adj[k] / 60;
    t.midnight = P.jafari ? t.sunset + fixHour(t.fajr - t.sunset) / 2 : t.sunset + fixHour(t.sunrise - t.sunset) / 2;
    return t;
  }

  function fmt(h) {
    if (isNaN(h)) return "--:--";
    h = fixHour(h + 0.5 / 60); /* round to the nearest minute */
    var hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
    return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
  }

  function params(date, o) {
    var M = METHODS[o.method] || METHODS.kemenag, P = { imsakMin: 10, dhuhrMin: 0 };
    for (var k in M) P[k] = M[k];
    if (P.ramadanIshaMin && isRamadan(date)) P.ishaMin = P.ramadanIshaMin;
    P.asrFactor = o.asr === "hanafi" ? 2 : 1;
    return P;
  }
  /* the saved place's own clock: its IANA zone (from the city list) when that
     differs from the phone's, so a family in Jakarta looking at Makkah sees
     Makkah's times and Makkah's countdown */
  function placeZone() { var l = store("mo_cached_loc", null); return l && l.tz ? l.tz : ""; }
  function zoneParts(tz, d) {
    var f = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" }).formatToParts(d);
    var g = function (t) { return +f.filter(function (x) { return x.type === t; })[0].value; };
    return { y: g("year"), m: g("month"), d: g("day"), h: g("hour") % 24, mi: g("minute"), s: g("second") };
  }
  /* a Date whose local fields read the place's wall clock (the device's own clock
     when no other zone is saved) — use it for "now" in countdowns */
  function now() {
    var d = new Date(), tz = placeZone(); if (!tz) return d;
    try { var p = zoneParts(tz, d); return new Date(p.y, p.m - 1, p.d, p.h, p.mi, p.s, d.getMilliseconds()); } catch (e) { return d; }
  }
  /* UTC offset (hours) of the place on that calendar day, or null for the device's */
  function placeOffset(y, m, d) {
    var tz = placeZone(); if (!tz) return null;
    try { var u = Date.UTC(y, m - 1, d, 12), p = zoneParts(tz, new Date(u)); return (Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi) - u) / 36e5; } catch (e) { return null; }
  }
  function differsFromDevice() {
    var a = now(), b = new Date(); return Math.abs(a - b) > 60000;
  }
  function timings(date, lat, lng, tz, opts) {
    date = date || now();
    var y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    if (tz == null && !opts) tz = placeOffset(y, m, d);
    if (tz == null) tz = -new Date(y, m - 1, d, 12).getTimezoneOffset() / 60;
    var o = opts || settings(lat, lng);
    if (!o.method) o.method = methodFor(o.cc || guessCC(+lat, +lng));
    var t = compute(y, m, d, +lat, +lng, tz, params(date, o));
    return {
      Imsak: fmt(t.imsak), Fajr: fmt(t.fajr), Sunrise: fmt(t.sunrise), Dhuhr: fmt(t.dhuhr),
      Asr: fmt(t.asr), Sunset: fmt(t.sunset), Maghrib: fmt(t.maghrib), Isha: fmt(t.isha), Midnight: fmt(t.midnight)
    };
  }

  var KAABA = { lat: 21.4225, lng: 39.8262 };
  function qibla(lat, lng) {
    var p = lat * D2R, l = lng * D2R, pk = KAABA.lat * D2R, lk = KAABA.lng * D2R;
    return (Math.atan2(Math.sin(lk - l), Math.cos(p) * Math.tan(pk) - Math.sin(p) * Math.cos(lk - l)) * R2D + 360) % 360;
  }

  /* A place label that needs no reverse geocoding: the Indonesian zone
     (WIB/WITA/WIT) or the device time-zone's city. */
  var ZONES = {
    "Asia/Jakarta": "WIB", "Asia/Pontianak": "WIB",
    "Asia/Makassar": "WITA", "Asia/Ujung_Pandang": "WITA",
    "Asia/Jayapura": "WIT"
  };
  function zoneLabel() {
    var tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    if (ZONES[tz]) return ZONES[tz];
    var city = tz.split("/").pop().replace(/_/g, " ");
    if (city && !/^(UTC|GMT|Etc|Universal|Zulu)/i.test(city) && tz.indexOf("/") > 0) return city;
    var off = -new Date().getTimezoneOffset(), s = off < 0 ? "-" : "+";
    off = Math.abs(off);
    return "UTC" + s + Math.floor(off / 60) + (off % 60 ? ":" + String(off % 60).padStart(2, "0") : "");
  }

  root.BMPrayerTimes = {
    timings: timings, qibla: qibla, zoneLabel: zoneLabel, _compute: compute, PARAMS: PARAMS,
    METHODS: METHODS, METHOD_ORDER: METHOD_ORDER, methodFor: methodFor, asrFor: asrFor, methodName: methodName,
    settings: settings, saveSettings: saveSettings, now: now, placeZone: placeZone, differsFromDevice: differsFromDevice
  };
})(typeof window !== "undefined" ? window : globalThis);
