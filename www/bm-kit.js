/* ============================================================
   Baby Mo Kit — shared helpers for play.babymo.id games.
   Add once per page:  <script src="/bm-kit.js" defer></script>

   Provides:
     1. Privacy-friendly analytics (no cookies, no PII)
     2. A branded Web-Share helper          → BabyMo.share(opts)
     3. A score/result share helper          → BabyMo.shareScore(score, stars, message)
        ...which attaches a generated branded result IMAGE so the share
        carries a rich card on WhatsApp / Instagram, not just text.
     4. A tiny toast fallback                → BabyMo.toast(msg)

   Everything is wrapped in try/catch so a kit failure can never
   break a game.
   ============================================================ */
(function () {
  "use strict";

  var PLAY_ORIGIN = "https://play.babymo.id";
  var MASCOT_SRC = "/Logo_Baby_Mo_Transparant.png";

  // ---- CONFIG ------------------------------------------------
  // Privacy-first analytics via Cloudflare Web Analytics — free, no
  // cookies, no PII, GDPR-friendly. It only loads on the real domain, so
  // local/in-app opens never pollute the numbers.
  //
  // To turn analytics ON: create a free site for "play.babymo.id" at
  //   Cloudflare dashboard → Web Analytics → add a site → copy the token,
  // then paste it below. No other change needed. Leave "" to keep it off.
  var CF_BEACON_TOKEN = ""; // e.g. "abc123...". Empty = analytics disabled.

  function isProd() {
    return location.hostname === "play.babymo.id";
  }

  // ---- Analytics --------------------------------------------
  function initAnalytics() {
    try {
      if (!CF_BEACON_TOKEN || !isProd()) return;
      var s = document.createElement("script");
      s.defer = true;
      s.src = "https://static.cloudflareinsights.com/beacon.min.js";
      s.setAttribute("data-cf-beacon", '{"token":"' + CF_BEACON_TOKEN + '"}');
      document.head.appendChild(s);
    } catch (e) {}
  }

  // Lightweight custom-event hook. Cloudflare Web Analytics is page-view
  // based (no custom events on the free tier), so this is a safe no-op
  // that still works if you later swap in an events-capable provider.
  function track(event, props) {
    try {
      if (typeof window.bmTrack === "function") window.bmTrack(event, props);
    } catch (e) {}
  }

  // ---- Offline support --------------------------------------
  // Registers the service worker so games load fast and work without
  // wifi. The browser only allows this in a secure context, so a
  // failure (file://, http) is harmless and swallowed.
  function initSW() {
    try {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(function () {});
      }
    } catch (e) {}
  }

  // ---- Identity ---------------------------------------------
  function gameName() {
    try {
      var t = (document.title || "").split("—")[0].split("|")[0].trim();
      return t || "Baby Mo";
    } catch (e) {
      return "Baby Mo";
    }
  }

  // Always share the branded play.babymo.id URL — never github.io,
  // never a localhost/in-app path.
  function gameUrl() {
    try {
      var file = (location.pathname.split("/").pop() || "").trim();
      if (!file || file === "index.html") return PLAY_ORIGIN + "/";
      return PLAY_ORIGIN + "/" + file;
    } catch (e) {
      return PLAY_ORIGIN + "/";
    }
  }

  function buildMessage(opts) {
    opts = opts || {};
    var name = opts.title || gameName();
    var lines = ["🌙 " + name + " — Baby Mo"];
    if (opts.score != null && opts.score !== "") {
      lines.push("Skorku: " + opts.score + (opts.stars ? " " + opts.stars : ""));
    }
    lines.push(opts.message || "Yuk main & belajar Islam bareng Baby Mo!");
    lines.push("");
    lines.push(opts.url || gameUrl());
    lines.push("#BabyMo #BelajarIslam");
    return lines.join("\n");
  }

  // ---- Result image -----------------------------------------
  // Mascot is preloaded at init so the whole image build stays
  // synchronous at share time — iOS Safari requires navigator.share()
  // to run inside the user gesture, so we cannot await anything.
  var mascotImg = null;
  function preloadMascot() {
    try {
      var i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = function () {
        mascotImg = i;
      };
      i.src = MASCOT_SRC;
    } catch (e) {}
  }

  function roundRect(x, rx, ry, w, h, r) {
    x.beginPath();
    x.moveTo(rx + r, ry);
    x.arcTo(rx + w, ry, rx + w, ry + h, r);
    x.arcTo(rx + w, ry + h, rx, ry + h, r);
    x.arcTo(rx, ry + h, rx, ry, r);
    x.arcTo(rx, ry, rx + w, ry, r);
    x.closePath();
  }

  // Returns a PNG dataURL string, or null. Fully synchronous.
  function buildResultDataURL(opts) {
    try {
      opts = opts || {};
      var W = 1080, H = 1080;
      var c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      var x = c.getContext("2d");

      // Background gradient (brand deep green)
      var g = x.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#0B1C12");
      g.addColorStop(1, "#1E3F2A");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);

      // Soft gold glow top-right
      var rg = x.createRadialGradient(W * 0.82, H * 0.16, 0, W * 0.82, H * 0.16, 520);
      rg.addColorStop(0, "rgba(200,144,64,0.28)");
      rg.addColorStop(1, "rgba(200,144,64,0)");
      x.fillStyle = rg;
      x.fillRect(0, 0, W, H);

      // Inner card
      x.fillStyle = "rgba(240,232,216,0.05)";
      roundRect(x, 70, 70, W - 140, H - 140, 56);
      x.fill();
      x.lineWidth = 2;
      x.strokeStyle = "rgba(200,144,64,0.35)";
      x.stroke();

      var cx = W / 2;
      x.textAlign = "center";

      // Eyebrow
      x.fillStyle = "#E8B060";
      x.font = "800 34px Nunito, system-ui, sans-serif";
      x.fillText("🌙  BABY MO", cx, 190);

      // Game name
      x.fillStyle = "#F0E8D8";
      x.font = "900 66px Nunito, system-ui, sans-serif";
      wrapText(x, opts.title || gameName(), cx, 280, W - 260, 74);

      // Mascot
      if (mascotImg) {
        var mw = 340, mh = 340;
        x.drawImage(mascotImg, cx - mw / 2, 360, mw, mh);
      }

      // Score — tightened so the stars line never collides with the footer
      var baseY = mascotImg ? 752 : 560;
      if (opts.score != null && opts.score !== "") {
        x.fillStyle = "#9EA89C";
        x.font = "800 34px Nunito, system-ui, sans-serif";
        x.fillText("SKORKU", cx, baseY);
        x.fillStyle = "#6DB882";
        x.font = "900 82px Nunito, system-ui, sans-serif";
        x.fillText(String(opts.score), cx, baseY + 84);
        if (opts.stars) {
          x.fillStyle = "#E8B060";
          x.font = "900 42px Nunito, system-ui, sans-serif";
          x.fillText(String(opts.stars), cx, baseY + 142);
        }
      } else if (opts.message) {
        x.fillStyle = "#F0E8D8";
        x.font = "800 42px Nunito, system-ui, sans-serif";
        wrapText(x, opts.message, cx, baseY + 20, W - 280, 56);
      }

      // Footer
      x.fillStyle = "#C89040";
      x.font = "900 40px Nunito, system-ui, sans-serif";
      x.fillText("play.babymo.id", cx, H - 130);

      return c.toDataURL("image/png");
    } catch (e) {
      return null;
    }
  }

  function wrapText(x, text, cx, y, maxW, lh) {
    var words = String(text).split(" ");
    var line = "";
    var lines = [];
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (x.measureText(test).width > maxW && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    for (var j = 0; j < lines.length; j++) {
      x.fillText(lines[j], cx, y + j * lh);
    }
  }

  function dataURLtoFile(dataURL, name) {
    try {
      var parts = dataURL.split(",");
      var mime = (parts[0].match(/:(.*?);/) || [])[1] || "image/png";
      var bstr = atob(parts[1]);
      var n = bstr.length;
      var u8 = new Uint8Array(n);
      while (n--) u8[n] = bstr.charCodeAt(n);
      return new File([u8], name, { type: mime });
    } catch (e) {
      return null;
    }
  }

  // ---- Share -------------------------------------------------
  function share(opts) {
    opts = opts || {};
    var text = buildMessage(opts);
    var url = opts.url || gameUrl();
    track("Share", { game: gameName() });

    // Try to attach a branded image (kept synchronous for the gesture).
    var file = null;
    if (opts.image !== false) {
      var dataURL = buildResultDataURL(opts);
      if (dataURL) file = dataURLtoFile(dataURL, "babymo.png");
    }

    try {
      if (
        file &&
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        navigator
          .share({ files: [file], text: text, title: opts.title || gameName() })
          .catch(function () {});
        return;
      }
      if (navigator.share) {
        navigator
          .share({ title: opts.title || gameName(), text: text, url: url })
          .catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          toast("📋 Tautan disalin!");
        });
        return;
      }
      window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
    } catch (e) {
      try {
        window.open(
          "https://wa.me/?text=" + encodeURIComponent(text),
          "_blank"
        );
      } catch (e2) {}
    }
  }

  function shareScore(score, stars, message) {
    share({ score: score, stars: stars, message: message });
  }

  // ---- Minimal toast (fallback only) ------------------------
  function toast(msg) {
    try {
      var el = document.createElement("div");
      el.textContent = msg;
      el.style.cssText =
        "position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));" +
        "transform:translateX(-50%);z-index:99999;background:#1A2519;color:#E8B060;" +
        "font:800 14px/1 'Nunito',system-ui,sans-serif;padding:12px 20px;border-radius:999px;" +
        "box-shadow:0 8px 28px rgba(0,0,0,.45);border:.5px solid rgba(240,232,216,.18);";
      document.body.appendChild(el);
      setTimeout(function () {
        el.remove();
      }, 1800);
    } catch (e) {}
  }

  // ---- Mo Companion (reactions) -----------------------------
  // Makes Baby Mo present across every game: a pose + speech bubble that
  // pops in on greet / correct / wrong / win, personalized with the
  // child's name. Reuses the existing emotional poses.
  // Rich 3D pose set — each reaction draws from several poses (picked at
  // random) so Mo feels varied & alive instead of one frozen image.
  var POSE = "/baby-mo-poses/";
  function moLang() {
    try { return localStorage.getItem("bm_lang") === "en" ? "en" : "id"; }
    catch (e) { return "id"; }
  }
  function childName() {
    try { return (localStorage.getItem("mo_child_name") || "").trim(); }
    catch (e) { return ""; }
  }
  var PHRASES = {
    greet: { poses: ["baby-mo-pose-01","baby-mo-pose-05","baby-mo-idea","baby-mo-ok","baby-mo-pose-19"],
      id: ["Halo{n}! Ayo main bareng Mo! 🌙", "Assalamu'alaikum{n}! ✨", "Senang ketemu kamu{n}! 💚"],
      en: ["Hi{n}! Let's play with Mo! 🌙", "Assalamu'alaikum{n}! ✨", "Happy to see you{n}! 💚"] },
    correct: { poses: ["baby-mo-yes","baby-mo-ok","baby-mo-alright","baby-mo-pose-08","baby-mo-pose-22"],
      id: ["Masya Allah, hebat! 🌟", "Betul sekali! 💚", "Pintar{n}! ⭐"],
      en: ["Masha Allah, great! 🌟", "That's right! 💚", "Smart{n}! ⭐"] },
    wrong: { poses: ["baby-mo-idea","baby-mo-pose-15","baby-mo-pose-27"],
      id: ["Coba lagi ya, kamu pasti bisa! 💪", "Hampir! Ayo sekali lagi 🌱"],
      en: ["Try again, you can do it! 💪", "Almost! Once more 🌱"] },
    win: { poses: ["baby-mo-yeyy","baby-mo-wow","baby-mo-thank-you","baby-mo-yes","baby-mo-pose-33"],
      id: ["Alhamdulillah, selesai! 🎉", "Masya Allah, kamu hebat{n}! 🏆", "Subhanallah, keren! ⭐⭐⭐"],
      en: ["Alhamdulillah, done! 🎉", "Masha Allah, great job{n}! 🏆", "Subhanallah, awesome! ⭐⭐⭐"] },
    pray: { poses: ["baby-mo-thank-you","baby-mo-pose-12"],
      id: ["Yuk sholat bareng Mo 🕌"], en: ["Let's pray with Mo 🕌"] },
  };
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  // No-repeat picker: never return the same item twice in a row (per key),
  // so Mo's pose and phrase feel dynamic rather than looping the same one.
  var _last = {};
  function pickNoRepeat(arr, key) {
    if (!arr || !arr.length) return undefined;
    if (arr.length === 1) return arr[0];
    var prev = _last[key], v;
    var guard = 0;
    do { v = arr[Math.floor(Math.random() * arr.length)]; } while (v === prev && ++guard < 8);
    _last[key] = v;
    return v;
  }

  // Preload every reaction pose during idle time so a pose never flashes
  // blank the first time a greet/correct/wrong/win fires (the swap is then
  // instant from cache). Runs once, low-priority, after the page settles.
  var posesPreloaded = false;
  function preloadPoses() {
    if (posesPreloaded) return;
    posesPreloaded = true;
    try {
      var seen = {}, list = [];
      for (var k in PHRASES) {
        var ps = PHRASES[k].poses || [];
        for (var i = 0; i < ps.length; i++) {
          if (!seen[ps[i]]) { seen[ps[i]] = 1; list.push(ps[i]); }
        }
      }
      list.forEach(function (name) {
        var im = new Image();
        im.decoding = "async";
        im.src = POSE + name + ".png";
      });
    } catch (e) {}
  }

  function fillName(s) {
    var n = childName();
    return n ? s.replace(/\{n\}/g, " " + n) : s.replace(/\{n\}/g, "");
  }
  function ensureMoStyle() {
    if (document.getElementById("bm-mo-style")) return;
    var st = document.createElement("style");
    st.id = "bm-mo-style";
    st.textContent =
      "#bm-mo{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom));" +
      "transform:translate(-50%,150%);z-index:99998;display:flex;align-items:flex-end;gap:10px;" +
      "pointer-events:none;transition:transform .42s cubic-bezier(.2,.9,.25,1.2);max-width:92vw;}" +
      "#bm-mo.show{transform:translate(-50%,0);}" +
      "#bm-mo .bm-pose{position:relative;flex:0 0 auto;width:78px;height:78px;border-radius:50%;" +
      "background:radial-gradient(circle at 50% 58%, rgba(63,208,140,.55), rgba(12,42,32,.55) 60%, rgba(12,42,32,0) 74%);" +
      "display:flex;align-items:flex-end;justify-content:center;overflow:hidden;" +
      "box-shadow:0 6px 16px rgba(0,0,0,.4), inset 0 0 0 1px rgba(255,255,255,.10);}" +
      "#bm-mo .bm-pose img{width:74px;height:74px;object-fit:contain;object-position:bottom;filter:drop-shadow(0 4px 10px rgba(0,0,0,.35));}" +
      "#bm-mo .bm-bub{background:#fff;color:#173a27;font:800 14px/1.3 'Nunito',system-ui,sans-serif;" +
      "padding:11px 15px;border-radius:16px;box-shadow:0 8px 26px rgba(0,0,0,.35);position:relative;max-width:240px;}" +
      "#bm-mo .bm-bub::after{content:'';position:absolute;left:-7px;bottom:16px;border:7px solid transparent;border-right-color:#fff;}";
    document.head.appendChild(st);
  }
  var moTimer = null;
  function react(type, opts) {
    try {
      opts = opts || {};
      var cfg = PHRASES[type] || PHRASES.greet;
      ensureMoStyle();
      var box = document.getElementById("bm-mo");
      if (!box) {
        box = document.createElement("div");
        box.id = "bm-mo";
        box.innerHTML = '<div class="bm-pose"><img alt=""></div><div class="bm-bub"></div>';
        document.body.appendChild(box);
      }
      var msg = opts.message || fillName(pickNoRepeat(cfg[moLang()] || cfg.id, type + "_msg"));
      var poseName = opts.pose ||
        (cfg.poses ? pickNoRepeat(cfg.poses, type + "_pose") : (cfg.pose || "baby-mo-pose-01"));
      box.querySelector("img").src = POSE + poseName + ".png";
      box.querySelector(".bm-bub").textContent = msg;
      void box.offsetWidth;
      box.classList.add("show");
      // Matching sound (silent if muted); win also drops a star in the jar
      // unless the caller opts out (opts.star === false).
      if (opts.sound !== false) playSfx(type === "greet" ? null : type);
      if (type === "win" && opts.star !== false) addStars(1);
      try { if (navigator.vibrate) navigator.vibrate(type === "win" ? [18, 40, 18] : 10); } catch (e) {}
      clearTimeout(moTimer);
      moTimer = setTimeout(function () { box.classList.remove("show"); },
        opts.duration || (type === "win" ? 2600 : 2000));
    } catch (e) {}
  }

  // Auto-celebrate when a known win/complete screen becomes visible (once).
  var WIN_SEL =
    "#completeScreen,#s-success,#gameover,#s-complete,#celebration,#celebOverlay,.complete-hero,#bdone,#pjdone";
  function watchWin() {
    try {
      var fired = false, obs;
      function vis(el) {
        if (!el) return false;
        var cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return false;
        var r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0; // works for position:fixed too
      }
      function check() {
        if (fired) return;
        var els = document.querySelectorAll(WIN_SEL);
        for (var i = 0; i < els.length; i++) {
          if (vis(els[i])) { fired = true; react("win"); if (obs) obs.disconnect(); return; }
        }
      }
      obs = new MutationObserver(check);
      obs.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style"] });
      check();
    } catch (e) {}
  }

  // Greet on game pages (skip the portal + pages that have their own Mo),
  // throttled so bouncing between games doesn't spam.
  function maybeGreet() {
    try {
      var p = location.pathname;
      if (p === "/" || /\/index\.html$/.test(p) || /companion|pray-with-mo/.test(p)) return;
      var last = parseInt(sessionStorage.getItem("bm_greet_t") || "0", 10);
      if (Date.now() - last < 45000) return;
      sessionStorage.setItem("bm_greet_t", String(Date.now()));
      setTimeout(function () { react("greet"); }, 700);
    } catch (e) {}
  }

  // ---- Sound (synthesized SFX, no asset files) ---------------
  // Gentle WebAudio chimes for tap / correct / wrong / win, with a parent
  // mute toggle persisted in localStorage. Synthesized so there's nothing
  // extra to download and it works offline.
  var _ac = null;
  function audioCtx() {
    try {
      if (_ac) return _ac;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      _ac = new AC();
      return _ac;
    } catch (e) { return null; }
  }
  function isMuted() {
    try { return localStorage.getItem("bm_muted") === "1"; } catch (e) { return false; }
  }
  function setMuted(on) {
    try { localStorage.setItem("bm_muted", on ? "1" : "0"); } catch (e) {}
  }
  // Play a short tone sequence: notes = [{f, t, d}] freq(Hz), start, dur (s)
  function tones(notes, type) {
    if (isMuted()) return;
    var ac = audioCtx(); if (!ac) return;
    try {
      if (ac.state === "suspended") ac.resume();
      var t0 = ac.currentTime;
      notes.forEach(function (n) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = type || "sine";
        o.frequency.value = n.f;
        var s = t0 + (n.t || 0), e = s + (n.d || 0.15);
        g.gain.setValueAtTime(0, s);
        g.gain.linearRampToValueAtTime(0.18, s + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, e);
        o.connect(g); g.connect(ac.destination);
        o.start(s); o.stop(e + 0.02);
      });
    } catch (e) {}
  }
  var SFX = {
    tap:     function () { tones([{ f: 660, d: 0.08 }], "triangle"); },
    correct: function () { tones([{ f: 660, t: 0 }, { f: 880, t: 0.09 }], "sine"); },
    wrong:   function () { tones([{ f: 300, d: 0.18 }], "sine"); },
    win:     function () { tones([{ f: 523, t: 0 }, { f: 659, t: 0.12 }, { f: 784, t: 0.24 }, { f: 1047, t: 0.36, d: 0.3 }], "sine"); },
    star:    function () { tones([{ f: 988, t: 0, d: 0.1 }, { f: 1319, t: 0.08, d: 0.16 }], "sine"); }
  };
  function playSfx(name) { try { (SFX[name] || function () {})(); } catch (e) {} }

  // ---- Reward jar (shared star total across all games) -------
  var JAR_KEY = "bm_star_jar";
  function getStars() {
    try { return parseInt(localStorage.getItem(JAR_KEY) || "0", 10) || 0; } catch (e) { return 0; }
  }
  function addStars(n) {
    n = n || 1;
    var total = getStars() + n;
    try { localStorage.setItem(JAR_KEY, String(total)); } catch (e) {}
    playSfx("star");
    return total;
  }

  // ---- Expose + init ----------------------------------------
  window.BabyMo = window.BabyMo || {};
  window.BabyMo.share = share;
  window.BabyMo.shareScore = shareScore;
  window.BabyMo.track = track;
  window.BabyMo.toast = toast;
  window.BabyMo.react = react;
  window.BabyMo.sfx = playSfx;
  window.BabyMo.isMuted = isMuted;
  window.BabyMo.setMuted = setMuted;
  window.BabyMo.getStars = getStars;
  window.BabyMo.addStars = addStars;
  // Exposed for the verification harness / previews.
  window.BabyMo._resultDataURL = buildResultDataURL;

  function initCompanion() {
    maybeGreet();
    watchWin();
    // Unlock WebAudio on the first user gesture (iOS/Safari requirement).
    var unlock = function () {
      var ac = audioCtx();
      if (ac && ac.state === "suspended") { try { ac.resume(); } catch (e) {} }
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
    document.addEventListener("pointerdown", unlock, { passive: true });
    document.addEventListener("touchstart", unlock, { passive: true });
    // Warm the reaction-pose cache without competing with the game's own
    // loading: wait for idle (or a short delay as a fallback).
    var warm = function () { preloadPoses(); };
    if (window.requestIdleCallback) requestIdleCallback(warm, { timeout: 3000 });
    else setTimeout(warm, 1800);
  }

  preloadMascot();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initAnalytics();
      initSW();
      initCompanion();
    });
  } else {
    initAnalytics();
    initSW();
    initCompanion();
  }
})();
