/* Baby Mo — play-time limit + "time to pray" pop-up, on every page (loaded by bm-kit.js).

   Settings (parents change them in the hub's Parents tab, behind the parental gate):
     localStorage "bm_guard" = { timer: 0 | 10 | 20 | 30 (minutes, 0 = off), pray: true | false }
   Play time:
     "bm_play" = { used: ms played today, day: "YYYY-MM-DD", lockAt: ms | 0 }
     Only time with the page on screen counts. At the limit a friendly "time's up" card covers the game; it lifts
     after a 60-minute break, at a new day, or when a grown-up (gate) adds 10 minutes / resets.
   Prayer:
     Uses the hub's saved place ("mo_cached_loc") and the on-device prayer times (bm-prayertimes.js). From each
     prayer's time for 40 minutes a "time to pray" card covers the game; "I have prayed" opens after 5 minutes,
     a grown-up can close it any time (gate). Done prayers: "bm_pray_done" = { day, done: ["Maghrib", …] }.
   Nothing is spoken (no new voice lines) and nothing leaves the device. Exposes window.BMGuard. */
(function () {
  "use strict";
  if (window.BMGuard) return;
  if (/\/tools\//.test(location.pathname)) return;               // recording / tooling pages: no guard

  var LS = window.localStorage;
  function get(k, d) { try { var v = JSON.parse(LS.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function put(k, v) { try { LS.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function en() { try { return (window.BM_LANG || LS.getItem("bm_lang")) === "en"; } catch (e) { return false; } }
  function T(id, e) { return en() ? e : id; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function settings() { var s = get("bm_guard", {}); return { timer: [0, 10, 20, 30].indexOf(+s.timer) >= 0 ? +s.timer : 0, daily: [0, 60, 120].indexOf(+s.daily) >= 0 ? +s.daily : 0, pray: s.pray !== false }; }
  function saveSettings(s) { put("bm_guard", s); }

  var PR = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  var PNAME = { Fajr: ["Subuh", "Fajr"], Dhuhr: ["Dzuhur", "Dhuhr"], Asr: ["Ashar", "Asr"], Maghrib: ["Maghrib", "Maghrib"], Isha: ["Isya", "Isha"] };
  var WAIT = 5 * 60 * 1000, WINDOW = 40, BREAK = 30 * 60 * 1000;
  var POSE_PRAY = "/mo-pray-assets/mo-takbir-mat.webp", POSE_BYE = "/baby-mo-poses/baby-mo-ok.webp";

  /* ── look ── */
  function css() {
    if (document.getElementById("bm-guard-css")) return;
    var st = document.createElement("style"); st.id = "bm-guard-css";
    st.textContent =
      ".bmg{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;padding:20px;" +
      "background:rgba(28,22,70,.46);-webkit-backdrop-filter:blur(10px) saturate(1.1);backdrop-filter:blur(10px) saturate(1.1);font-family:'Fredoka','Nunito',system-ui,sans-serif;animation:bmgIn .35s ease-out}" +
      "@keyframes bmgIn{from{opacity:0}}" +
      ".bmg-card{position:relative;width:min(100%,400px);overflow:visible;border-radius:34px;padding:70px 22px 22px;text-align:center;" +
      "background:linear-gradient(180deg,#EAF6FF 0%,#FFFFFF 38%,#FFF8EE 100%);box-shadow:0 30px 60px -24px rgba(30,20,90,.6),inset 0 0 0 1.5px rgba(255,255,255,.9);" +
      "animation:bmgPop .55s cubic-bezier(.3,1.4,.5,1)}" +
      "@keyframes bmgPop{from{transform:translateY(24px) scale(.92);opacity:0}}" +
      ".bmg-mo{position:absolute;left:50%;top:-86px;width:170px;height:170px;transform:translateX(-50%);object-fit:contain;filter:drop-shadow(0 10px 12px rgba(30,40,90,.25));animation:bmgBob 3s ease-in-out infinite}" +
      "@keyframes bmgBob{50%{transform:translateX(-50%) translateY(-5px)}}" +
      ".bmg-card.has-mo{margin-top:86px}" +
      ".bmg-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;font-weight:700;font-size:14px;color:#fff;background:linear-gradient(180deg,#36C07A,#1E9E5E);box-shadow:0 6px 12px -8px rgba(20,120,70,.8)}" +
      ".bmg-pill.amber{background:linear-gradient(180deg,#FFB547,#F08A1C);box-shadow:0 6px 12px -8px rgba(200,110,0,.8)}" +
      ".bmg-ar{margin:12px 0 2px;font:700 clamp(30px,8vw,38px)/1.6 'Amiri','Scheherazade New','Noto Naskh Arabic',serif;color:#14965A;direction:rtl}" +
      ".bmg-title{margin:4px 0 6px;font-weight:700;font-size:clamp(24px,6.6vw,30px);line-height:1.12;color:#3A2A8C}" +
      ".bmg-title b{color:#F08A1C}" +
      ".bmg-text{margin:0 auto 14px;max-width:320px;font-weight:500;font-size:16px;line-height:1.4;color:#5A4E7A}" +
      ".bmg-wait{display:inline-flex;align-items:center;gap:8px;margin-bottom:14px;padding:7px 14px;border-radius:999px;background:#EEF8F1;color:#1E8A52;font-weight:700;font-size:15px}" +
      ".bmg-ring{width:22px;height:22px}" +
      ".bmg-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:60px;border:0;border-radius:22px;cursor:pointer;font:700 19px/1 'Fredoka','Nunito',sans-serif;color:#fff;" +
      "background:linear-gradient(180deg,#3FCF85,#1E9E5E);box-shadow:0 6px 0 #17804B,0 14px 22px -12px rgba(20,120,70,.6);-webkit-tap-highlight-color:transparent}" +
      ".bmg-btn:active{transform:translateY(3px);box-shadow:0 3px 0 #17804B}" +
      /* the main button matches the games' "Again!" button: green→teal→blue pill with a soft top gloss and a passing shine */
      ".bmg-btn.main{position:relative;overflow:hidden;isolation:isolate;border-radius:999px;min-height:58px;border:1px solid rgba(255,255,255,.22);font:800 18px/1.15 'Nunito','Fredoka',sans-serif;" +
      "background:linear-gradient(120deg,#16B46A 0%,#0A9C8C 52%,#0A84B8 100%);text-shadow:0 1px 1px rgba(0,70,45,.22);" +
      "box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 -1px 0 rgba(0,60,70,.18),0 10px 22px -12px rgba(10,143,160,.55)}" +
      ".bmg-btn.main::before{content:'';position:absolute;left:3%;right:3%;top:1px;height:50%;border-radius:999px 999px 40% 40%;z-index:-1;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.2),rgba(255,255,255,0))}" +
      ".bmg-btn.main::after{content:'';position:absolute;top:-20%;bottom:-20%;left:-40%;width:28%;z-index:-1;pointer-events:none;transform:skewX(-20deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);animation:bmgShine 7s ease-in-out 1.5s infinite}" +
      "@keyframes bmgShine{0%,62%{left:-40%}82%,100%{left:125%}}" +
      ".bmg-btn.main:active{transform:scale(.97);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 6px 14px -10px rgba(10,143,160,.5)}" +
      ".bmg-btn.main[disabled]{background:linear-gradient(120deg,#CFE3D8 0%,#C6DEDA 52%,#C3D8E2 100%);color:#F4FAF8;text-shadow:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}" +
      ".bmg-btn.main[disabled]::after{display:none}" +
      "html[data-bm-theme=classic] .bmg-btn.main[disabled]{background:linear-gradient(120deg,#46507F,#404A7A 52%,#3C4776);color:#8F96C6}" +
      ".bmg-btn[disabled]{background:linear-gradient(180deg,#D8E6DD,#C3D6CA);box-shadow:0 6px 0 #AFC4B7;color:#F4FAF6;cursor:default}" +
      ".bmg-grown{margin-top:14px;border:0;background:none;color:#8A80A8;font:600 14px 'Fredoka','Nunito',sans-serif;text-decoration:underline;cursor:pointer;padding:6px 10px}" +
      ".bmg-row{display:flex;gap:10px;margin-top:4px}.bmg-row .bmg-btn{flex:1;font-size:17px;min-height:54px}" +
      ".bmg-btn.soft{color:#4A2FA8;background:linear-gradient(180deg,#fff,#EFE7FF);box-shadow:0 6px 0 #D6C8F5}" +
      ".bmg-toast{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 14px);transform:translateX(-50%);z-index:2147483600;display:flex;align-items:center;gap:8px;padding:8px 16px 8px 8px;border-radius:999px;" +
      "background:#fff;color:#3A2A8C;font:700 15px 'Fredoka','Nunito',sans-serif;box-shadow:0 10px 24px -10px rgba(30,20,90,.5);animation:bmgPop .5s cubic-bezier(.3,1.4,.5,1)}" +
      ".bmg-toast img{width:34px;height:34px;object-fit:contain}" +
      "html[data-bm-theme=classic] .bmg-card{background:linear-gradient(180deg,#2E3570 0%,#262C60 45%,#20254F 100%);box-shadow:0 30px 60px -20px rgba(0,0,0,.7),inset 0 0 0 1.5px rgba(255,255,255,.1)}" +
      "html[data-bm-theme=classic] .bmg-title{color:#F1EBFF}html[data-bm-theme=classic] .bmg-text{color:#CFC7EE}html[data-bm-theme=classic] .bmg-ar{color:#6FE89B}" +
      "html[data-bm-theme=classic] .bmg-wait{background:rgba(111,232,155,.12);color:#8EF0B2}html[data-bm-theme=classic] .bmg-grown{color:#A9A2CC}" +
      "html[data-bm-theme=classic] .bmg-btn[disabled]{background:linear-gradient(180deg,#4A5288,#3E4578);box-shadow:0 6px 0 #2C3264;color:#8F96C6}" +
      "@media (prefers-reduced-motion:reduce){.bmg,.bmg-card,.bmg-mo,.bmg-toast,.bmg-btn.main::after{animation:none}}";
    document.head.appendChild(st);
  }

  var card = null, cardKind = "";
  function close() { if (card) { card.remove(); card = null; cardKind = ""; } }
  function show(kind, html, mo) {
    css();
    if (card && cardKind === kind) return card;
    close();
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
    card = document.createElement("div"); card.className = "bmg"; card.setAttribute("role", "dialog"); card.setAttribute("aria-modal", "true");
    card.innerHTML = '<div class="bmg-card has-mo"><img class="bmg-mo" alt="" draggable="false" src="' + mo + '">' + html + "</div>";
    // the card catches every tap so the game underneath can't be played
    ["pointerdown", "touchstart", "touchend", "click", "keydown"].forEach(function (ev) { card.addEventListener(ev, function (e) { e.stopPropagation(); }); });   // after the card's own buttons ran
    cardKind = kind; document.body.appendChild(card);
    return card;
  }
  function gate(fn) {
    var B = window.BabyMo;
    if (B && B.parentGate) B.parentGate(fn, null, true, ["Jawab dulu untuk melanjutkan.", "Answer to continue."]); else if (confirm(T("Untuk orang tua: lanjutkan?", "For grown-ups: continue?"))) fn();
  }

  /* ── play time: a session timer (break after 10/20/30 min) and a daily total (60/120 min) ── */
  function fresh0() { return { used: 0, dayUsed: 0, day: today(), lockAt: 0 }; }
  var play = get("bm_play", fresh0()), last = Date.now(), warned = "";
  if (play.dayUsed == null) play.dayUsed = play.used || 0;
  function savePlay() { put("bm_play", play); }
  function limitMs() { return settings().timer * 60000; }
  function dailyMs() { return settings().daily * 60000; }
  function grownUp(kind, title, buttons) {
    gate(function () {
      var g = show(kind + "-parent",
        '<span class="bmg-pill amber">' + T("Untuk orang tua", "For grown-ups") + "</span>" +
        '<h2 class="bmg-title">' + title + "</h2>" + '<div class="bmg-row">' + buttons + "</div>" +
        '<button class="bmg-grown" data-a="keep" type="button">' + T("Tetap istirahat", "Keep the break") + "</button>", POSE_BYE);
      g.querySelectorAll("[data-a]").forEach(function (b) {
        b.onclick = function () {
          var a = b.getAttribute("data-a"), d = dailyMs();
          if (a === "s10") { play.used = Math.max(0, limitMs() - 10 * 60000); play.lockAt = 0; }
          else if (a === "reset") { play.used = 0; play.lockAt = 0; }
          else if (a === "d15") { play.dayUsed = Math.max(0, d - 15 * 60000); play.used = 0; play.lockAt = 0; }
          savePlay(); close(); warned = ""; tick();
        };
      });
    });
  }
  function timeUp() {
    var c = show("time",
      '<span class="bmg-pill amber">' + T("Waktunya istirahat", "Break time") + "</span>" +
      '<h2 class="bmg-title">' + T("Hore, mainnya <b>seru!</b>", "What a <b>fun</b> play!") + "</h2>" +
      '<p class="bmg-text">' + T("Sekarang istirahat dulu ya. Istirahatkan mata, minum air, dan main di luar sebentar. Mo tunggu nanti!",
                                 "Now let's take a break. Rest your eyes, drink some water and play outside for a bit. Mo will see you later!") + "</p>" +
      '<button class="bmg-grown" type="button">' + T("Untuk orang tua", "For grown-ups") + "</button>", POSE_BYE);
    c.querySelector(".bmg-grown").onclick = function () {
      grownUp("time", T("Tambah waktu main?", "More play time?"),
        '<button class="bmg-btn soft" data-a="s10" type="button">+10 ' + T("menit", "min") + '</button><button class="bmg-btn" data-a="reset" type="button">' + T("Mulai lagi", "Start over") + "</button>");
    };
  }
  function dayDone() {
    var c = show("time-day",
      '<span class="bmg-pill amber">' + T("Waktu main hari ini selesai", "That's all for today") + "</span>" +
      '<h2 class="bmg-title">' + T("Sampai jumpa <b>besok!</b>", "See you <b>tomorrow!</b>") + "</h2>" +
      '<p class="bmg-text">' + T("Hari ini kamu sudah banyak main dan belajar bareng Mo. Sekarang waktunya main dengan Ayah, Bunda dan teman-teman. Besok kita main lagi ya!",
                                 "You played and learned a lot with Mo today. Now it's time to play with Mum, Dad and friends. Let's play again tomorrow!") + "</p>" +
      '<button class="bmg-grown" type="button">' + T("Untuk orang tua", "For grown-ups") + "</button>", POSE_BYE);
    c.querySelector(".bmg-grown").onclick = function () {
      grownUp("time-day", T("Tambah waktu hari ini?", "More time today?"),
        '<button class="bmg-btn" data-a="d15" type="button">+15 ' + T("menit", "min") + "</button>");
    };
  }
  function toast(text) {
    css(); var t = document.createElement("div"); t.className = "bmg-toast";
    t.innerHTML = '<img alt="" src="' + POSE_BYE + '"><span></span>'; t.lastChild.textContent = text;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 5000);
  }
  function tickPlay(now) {
    var lim = limitMs(), dl = dailyMs();
    if (play.day !== today()) { play = fresh0(); savePlay(); if (cardKind.indexOf("time") === 0) close(); }
    var f = get("bm_play", play); if (f && f.day === play.day) { play = f; if (play.dayUsed == null) play.dayUsed = play.used || 0; }   // other pages
    if (!lim && !dl) { if (cardKind.indexOf("time") === 0) close(); return; }
    if (dl && play.dayUsed >= dl) { if (cardKind.indexOf("time-day") !== 0) dayDone(); return; }       // the day is done
    if (cardKind.indexOf("time-day") === 0) close();
    if (lim && play.lockAt) {
      if (now - play.lockAt >= BREAK) { play.used = 0; play.lockAt = 0; savePlay(); if (cardKind.indexOf("time") === 0) close(); }
      else if (!card) timeUp();
      return;
    }
    if (!lim && play.lockAt) { play.lockAt = 0; savePlay(); if (cardKind.indexOf("time") === 0) close(); }
    if (!document.hidden) { var dt = Math.min(2000, Math.max(0, now - last)); play.used += dt; play.dayUsed += dt; savePlay(); }
    var left = Math.min(lim ? lim - play.used : Infinity, dl ? dl - play.dayUsed : Infinity);
    if (left <= 60000 && left > 0 && warned !== play.day + (play.lockAt || "") + Math.round((lim ? play.used : play.dayUsed) / 120000)) { warned = play.day + (play.lockAt || "") + Math.round((lim ? play.used : play.dayUsed) / 120000); toast(T("1 menit lagi, ya!", "1 more minute!")); }
    if (dl && play.dayUsed >= dl) { savePlay(); dayDone(); return; }
    if (lim && play.used >= lim) { play.lockAt = now; savePlay(); if (!card) timeUp(); }
  }

  /* ── prayer ── */
  function loadPT(cb) {
    if (window.BMPrayerTimes) return cb();
    if (loadPT.busy) return; loadPT.busy = true;
    var s = document.createElement("script"); s.src = "/bm-prayertimes.js"; s.onload = cb; document.head.appendChild(s);
  }
  function mins(hhmm) { var p = String(hhmm || "").split(":"); return p.length < 2 ? -1 : (+p[0]) * 60 + (+p[1]); }
  function dueNow() {
    var loc = get("mo_cached_loc", null); if (!loc || loc.lat == null || !window.BMPrayerTimes) return null;
    var t; try { t = BMPrayerTimes.timings(null, loc.lat, loc.lng); } catch (e) { return null; }
    var n = BMPrayerTimes.now(), m = n.getHours() * 60 + n.getMinutes();
    var done = get("bm_pray_done", { day: "", done: [] }); if (done.day !== today()) done = { day: today(), done: [] };
    for (var i = PR.length - 1; i >= 0; i--) {
      var k = PR[i], at = mins(t[k]);
      if (at >= 0 && m >= at && m < at + WINDOW) return done.done.indexOf(k) >= 0 ? null : k;
    }
    return null;
  }
  function markDone(k) {
    var done = get("bm_pray_done", { day: "", done: [] }); if (done.day !== today()) done = { day: today(), done: [] };
    if (done.done.indexOf(k) < 0) done.done.push(k); put("bm_pray_done", done);
  }
  function prayCard(k) {
    var nm = PNAME[k][en() ? 1 : 0];
    var shown = get("bm_pray_shown", {}), key = today() + "|" + k;
    if (!shown[key]) { shown = {}; shown[key] = Date.now(); put("bm_pray_shown", shown); }
    var c = show("pray-" + k,
      '<span class="bmg-pill">' + T("Waktunya sholat", "Time to pray") + "</span>" +
      '<div class="bmg-ar" lang="ar">حَيَّ عَلَى الصَّلَاةِ</div>' +
      '<h2 class="bmg-title">' + T("Sudah masuk waktu <b>" + nm + "</b>", "It's time for <b>" + nm + "</b>") + "</h2>" +
      '<p class="bmg-text">' + T("Yuk berhenti sebentar dan sholat " + nm + " dulu, di masjid atau di rumah. Mo menunggumu di sini!",
                                 "Let's stop for a moment and pray " + nm + " first, at the masjid or at home. Mo will wait for you here!") + "</p>" +
      '<div class="bmg-wait"><svg class="bmg-ring" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-opacity=".2" stroke-width="3"/>' +
      '<circle class="bmg-arc" cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="56.5" transform="rotate(-90 12 12)"/></svg><span class="bmg-left"></span></div>' +
      '<button class="bmg-btn main" type="button" disabled><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span></span></button>' +
      '<button class="bmg-grown" type="button">' + T("Untuk orang tua", "For grown-ups") + "</button>", POSE_PRAY);
    c.querySelector(".bmg-btn span").textContent = T("Aku sudah sholat " + nm, "I have prayed " + nm);
    c.querySelector(".bmg-btn").onclick = function () { markDone(k); close(); };
    c.querySelector(".bmg-grown").onclick = function () { gate(function () { markDone(k); close(); }); };
    var upd = function () {
      if (!card || cardKind !== "pray-" + k) return;
      var left = Math.max(0, WAIT - (Date.now() - shown[key])), s = Math.ceil(left / 1000);
      card.querySelector(".bmg-arc").setAttribute("stroke-dashoffset", String(56.5 * left / WAIT));
      var w = card.querySelector(".bmg-wait"), b = card.querySelector(".bmg-btn");
      if (left > 0) { w.style.display = ""; card.querySelector(".bmg-left").textContent = T("Tombol terbuka dalam ", "The button opens in ") + Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); b.disabled = true; setTimeout(upd, 500); }
      else { w.style.display = "none"; b.disabled = false; }
    };
    upd();
  }
  function tickPray() {
    if (!settings().pray) { if (cardKind.indexOf("pray") === 0) close(); return; }
    loadPT(function () { var k = dueNow(); if (k) { if (cardKind !== "pray-" + k) prayCard(k); } else if (cardKind.indexOf("pray") === 0) close(); });
  }

  /* ── loop ── */
  function tick() {
    var now = Date.now();
    tickPray();
    if (cardKind.indexOf("pray") !== 0) tickPlay(now);           // prayer comes first; play time pauses meanwhile
    last = now;
  }
  function start() { tick(); setInterval(tick, 1000); document.addEventListener("visibilitychange", function () { last = Date.now(); if (!document.hidden) tick(); }); }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);

  window.BMGuard = {
    settings: settings,
    set: function (patch) { var s = settings(); for (var k in patch) s[k] = patch[k]; saveSettings(s); if ("timer" in patch) { play.used = 0; play.lockAt = 0; savePlay(); } warned = ""; if ("timer" in patch || "daily" in patch) close(); tick(); },
    playLeft: function () { var lim = limitMs(); return lim ? Math.max(0, lim - play.used) : null; },
    dayLeft: function () { var d = dailyMs(); return d ? Math.max(0, d - (play.dayUsed || 0)) : null; },
    hasPlace: function () { var l = get("mo_cached_loc", null); return !!(l && l.lat != null); },
    place: function () { var c = get("mo_manual_city", null), l = get("mo_cached_loc", null); return (c && c.n) || (l && l.near) || ""; },
    _due: dueNow, _gate: gate
  };
})();
