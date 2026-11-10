/* Baby Mo — on-device prayer times (no network).
   Replaces the old api.aladhan.com call: the same numbers aladhan gives
   for method=20 (Kementerian Agama RI), computed here from the standard
   low-precision solar position formulas (the same approach aladhan's own
   PrayTimes-based engine uses):

     Fajr    sun 20° below the horizon (morning)
     Sunrise / Sunset  0.833° below the horizon (refraction + solar radius)
     Dhuhr   solar transit
     Asr     shadow = object length × 1 + noon shadow (Shafi'i)
     Maghrib sunset (+0 min)
     Isha    sun 18° below the horizon (evening)
     Imsak   Fajr − 10 min
   High latitudes use aladhan's default "angle based" rule (Fajr/Isha are
   never further from sunrise/sunset than angle/60 of the night).
   Times are rounded to the nearest minute and formatted "HH:MM", exactly
   like aladhan's `data.timings`, in the device's local time zone (the
   same clock the countdowns use).

   API:
     BMPrayerTimes.timings(date, lat, lng[, tzHours])
       → { Imsak, Fajr, Sunrise, Dhuhr, Asr, Sunset, Maghrib, Isha, Midnight }
     BMPrayerTimes.qibla(lat, lng)          → bearing in degrees from north
     BMPrayerTimes.zoneLabel(lang)          → "WIB" / "WITA" / "WIT" or the
                                               device time-zone city, e.g. "London"
   Nothing here touches the network or storage. */
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

  /* Kemenag RI (aladhan method 20) */
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

  function compute(y, mo, d, lat, lng, tz) {
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
      fajr: angleTime(PARAMS.fajr, g.fajr, true),
      sunrise: angleTime(RISE_SET, g.sunrise, true),
      dhuhr: midDay(g.dhuhr),
      asr: asrTime(PARAMS.asrFactor, g.asr),
      sunset: angleTime(RISE_SET, g.sunset),
      isha: angleTime(PARAMS.isha, g.isha)
    };
    var k;
    for (k in t) t[k] += tz - lng / 15;

    /* high-latitude rule: angle based */
    var night = fixHour(t.sunrise - t.sunset);
    var fajrMax = PARAMS.fajr / 60 * night, ishaMax = PARAMS.isha / 60 * night;
    if (isNaN(t.fajr) || fixHour(t.sunrise - t.fajr) > fajrMax) t.fajr = t.sunrise - fajrMax;
    if (isNaN(t.isha) || fixHour(t.isha - t.sunset) > ishaMax) t.isha = t.sunset + ishaMax;

    t.dhuhr += PARAMS.dhuhrMin / 60;
    t.maghrib = t.sunset + PARAMS.maghribMin / 60;
    t.imsak = t.fajr - PARAMS.imsakMin / 60;
    t.midnight = t.sunset + fixHour(t.sunrise - t.sunset) / 2;
    return t;
  }

  function fmt(h) {
    if (isNaN(h)) return "--:--";
    h = fixHour(h + 0.5 / 60); /* round to the nearest minute */
    var hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
    return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
  }

  function timings(date, lat, lng, tz) {
    date = date || new Date();
    var y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    if (tz == null) tz = -new Date(y, m - 1, d, 12).getTimezoneOffset() / 60;
    var t = compute(y, m, d, +lat, +lng, tz);
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

  root.BMPrayerTimes = { timings: timings, qibla: qibla, zoneLabel: zoneLabel, _compute: compute, PARAMS: PARAMS };
})(typeof window !== "undefined" ? window : globalThis);
