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
  var MASCOT_SRC = "/Logo_Baby_Mo_Transparant.webp";

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
        im.src = POSE + name + ".webp";
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
      "#bm-mo{position:fixed;left:max(12px,env(safe-area-inset-left));bottom:calc(var(--bm-mo-lift,0px) + 14px + env(safe-area-inset-bottom));" +
      "transform:translateY(170%);opacity:0;z-index:99998;display:flex;align-items:flex-end;gap:8px;" +
      "pointer-events:none;transition:transform .42s cubic-bezier(.2,.9,.25,1.2),opacity .25s ease;max-width:calc(100vw - 24px);}" +
      "#bm-mo.show{transform:translateY(0);opacity:1;}" +
      "@media(min-width:760px){#bm-mo{left:max(24px,calc(50vw - 360px));}}" +
      // Transparent Baby Mo: no circle behind him, just a soft shadow under
      // the cut-out so he reads on both bright and dark game backgrounds.
      "#bm-mo .bm-pose{position:relative;flex:0 0 auto;width:68px;height:72px;" +
      "background:none;display:flex;align-items:flex-end;justify-content:center;}" +
      "#bm-mo .bm-pose img{width:68px;height:72px;object-fit:contain;object-position:bottom;" +
      "filter:drop-shadow(0 6px 10px rgba(30,60,110,.28));}" +
      "#bm-mo .bm-bub{background:#fff;color:#173a27;font:800 13.5px/1.3 'Nunito',system-ui,sans-serif;" +
      "padding:9px 13px;border-radius:18px 18px 18px 6px;position:relative;max-width:min(260px,calc(100vw - 110px));margin-bottom:14px;" +
      "box-shadow:0 0 0 .5px rgba(21,34,48,.08),0 12px 26px -12px rgba(30,60,110,.45);}" +
      "#bm-mo .bm-bub::after{content:'';position:absolute;left:-6px;bottom:8px;border:6px solid transparent;border-right-color:#fff;border-bottom-color:#fff;}" +
      // On win screens Baby Mo drops in from the top so he never covers the
      // "Main Lagi" / "Bagikan" buttons at the bottom.
      "#bm-mo.top{top:calc(env(safe-area-inset-top) + 64px);bottom:auto;align-items:flex-start;transform:translateY(-220%);}" +
      "#bm-mo.top.show{transform:translateY(0);}" +
      "#bm-mo.top .bm-bub{margin-bottom:0;margin-top:16px;border-radius:6px 18px 18px 18px;}" +
      "#bm-mo.top .bm-bub::after{top:8px;bottom:auto;border-right-color:#fff;border-bottom-color:transparent;border-top-color:#fff;}";
    document.head.appendChild(st);
  }
  // Height of anything pinned to the bottom of the screen on the left side
  // (tab bars, sticky CTA bars, on-screen game controls) so Baby Mo pops up
  // above it instead of covering it.
  function bottomBarHeight(self) {
    var h = innerHeight, lift = 0;
    try {
      var xs = [24, 90, 170];
      for (var i = 0; i < xs.length; i++) {
        var stack = document.elementsFromPoint(xs[i], h - 6);
        for (var j = 0; j < stack.length; j++) {
          var el = stack[j];
          if (el === self || self.contains(el) || el === document.body || el === document.documentElement) continue;
          for (var n = el; n && n !== document.body; n = n.parentElement) {
            var pos = getComputedStyle(n).position;
            if (pos === "fixed" || pos === "sticky") {
              var r = n.getBoundingClientRect();
              if (r.bottom >= h - 2 && r.height < h * 0.45) lift = Math.max(lift, h - r.top);
              break;
            }
          }
        }
      }
    } catch (e) {}
    return Math.min(Math.round(lift), Math.round(h * 0.45));
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
      box.querySelector("img").src = POSE + poseName + ".webp";
      box.querySelector(".bm-bub").textContent = msg;
      var atTop = type === "win" || opts.top === true;
      box.classList.remove("show");
      box.classList.toggle("top", atTop);
      box.style.setProperty("--bm-mo-lift", atTop ? "0px" : bottomBarHeight(box) + "px");
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


  // ---- "Coba juga" — suggest a related game on the win screen ----
  var NEXT = {
    "babymo-puzzle":          ["doa-harian",   "babymo-doa-harian.html",     "Doa Harian",     "Doa dari pagi sampai malam 🤲"],
    "babymo-doa-harian":      ["dua-journey",  "babymo-dua-game.html",       "Dua Journey",    "Cocokkan doa dengan momennya 🃏"],
    "babymo-dua-game":        ["pray-with-mo", "babymo-pray-with-mo.html",   "Sholat Bareng Mo","Belajar gerakan sholat 🕌"],
    "babymo-arabic-spelling": ["hijaiyah",     "babymo-hijaiyah.html",       "Pulau Hijaiyah", "Cari 28 huruf di pulau 🏝️"],
    "babymo-dreamtime":       ["doa-harian",   "babymo-doa-harian.html",     "Doa Harian",     "Ulangi doa sebelum tidur 🌙"],
    "babymo-look-and-find":   ["memory-match", "babymo-memory-match.html",   "Memory Match",   "Balik kartu, ingat letaknya 🧠"],
    "babymo-memory-match":    ["cari-baby-mo", "babymo-look-and-find.html",  "Cari Baby Mo",   "Baby Mo sedang bersembunyi 🔍"],
    "baby-mo-forehand-beat":  ["tenis-adam",   "babymo-tenis-adam.html",     "Tenis Kak Adam", "Belajar tenis bareng Kak Adam 🎾"],
    "babymo-tenis-adam":      ["forehand-beat","baby-mo-forehand-beat.html", "Forehand Beat",  "Main forehand mengikuti irama 🎵"],
    "babymo-kebun-ais":       ["doa-harian",   "babymo-doa-harian.html",     "Doa Harian",     "Doa sebelum makan & tidur 🤲"],
    "babymo-puzzle-katabaik": ["kata-islam",   "babymo-arabic-spelling.html","Kata Islam",     "Susun kata Arab pertamamu 🔤"],
    "babymo-wudhu":           ["pray-with-mo", "babymo-pray-with-mo.html",   "Sholat Bareng Mo","Lanjut belajar sholat 🕌"],
    "babymo-pray-with-mo":    ["doa-harian",   "babymo-doa-harian.html",     "Doa Harian",     "Doa-doa harian si kecil 🤲"]
  };
  function addNextGame(winEl) {
    try {
      var key = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
      var n = NEXT[key];
      if (!n || !winEl || winEl.querySelector(".bm-next")) return;
      // Popups: put the card inside the popup card, not beside it
      var inner = winEl.querySelector(".modal, .modal-card, .modal-box, .success-card");
      if (inner) winEl = inner;
      // Hero blocks at the top of a results page: put the card at the end of the page
      if (winEl.classList.contains("complete-hero") && winEl.parentElement) winEl = winEl.parentElement;
      if (!document.getElementById("bm-next-style")) {
        var st = document.createElement("style"); st.id = "bm-next-style";
        st.textContent =
          ".bm-next{display:flex;align-items:center;gap:12px;width:100%;max-width:360px;box-sizing:border-box;margin:16px auto 8px;padding:10px 12px;" +
          "border-radius:20px;background:rgba(255,255,255,.9);border:1px solid #fff;text-decoration:none;color:#152230;text-align:left;" +
          "box-shadow:0 0 0 .5px rgba(21,34,48,.08),0 12px 24px -14px rgba(30,60,110,.45);font-family:'Nunito',system-ui,sans-serif;" +
          "animation:bmNext .5s .6s both cubic-bezier(.2,.9,.25,1.2);position:relative;z-index:2;}" +
          "@keyframes bmNext{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}" +
          ".bm-next:active{transform:scale(.97)}" +
          ".bm-next img{width:48px;height:48px;border-radius:12px;flex:0 0 48px;box-shadow:0 6px 12px -6px rgba(0,0,0,.4)}" +
          ".bm-next .t{flex:1;min-width:0}.bm-next .e{display:block;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#E8590C}" +
          ".bm-next .n{display:block;font-size:16px;font-weight:900;line-height:1.2}.bm-next .h{display:block;font-size:13px;font-weight:700;color:#5A6878}" +
          ".bm-next .c{font-size:22px;color:#8A97A6;font-weight:700}";
        document.head.appendChild(st);
      }
      var a = document.createElement("a");
      a.className = "bm-next"; a.href = "/" + n[1];
      a.innerHTML = '<img alt="" src="/icons/games/' + n[0] + '.svg"><span class="t"><span class="e">Coba juga</span>' +
        '<span class="n">' + n[2] + '</span><span class="h">' + n[3] + '</span></span><span class="c">›</span>';
      a.addEventListener("click", function () { track("next_game", { to: n[0] }); });
      winEl.appendChild(a);
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
          if (vis(els[i])) { fired = true; react("win"); addNextGame(els[i]); if (obs) obs.disconnect(); return; }
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


  // ---- First-time "how to play" card --------------------------
  // BabyMo.coach({key, title, steps:[{icon, text}], button, pose}, done)
  // Shows once per game (remembered in localStorage), then calls done().
  function coach(opts, done) {
    done = done || function () {};
    var k = "bm_coach_" + (opts.key || location.pathname);
    try { if (!opts.force && localStorage.getItem(k)) { done(); return false; } } catch (e) { done(); return false; }
    if (!document.getElementById("bm-coach-style")) {
      var st = document.createElement("style"); st.id = "bm-coach-style";
      st.textContent =
        "#bm-coach{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;" +
        "background:rgba(40,60,90,.32);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);animation:bmcIn .25s ease;}" +
        "@keyframes bmcIn{from{opacity:0}to{opacity:1}}" +
        "#bm-coach .c-card{width:100%;max-width:360px;background:#fff;border-radius:28px;padding:22px 20px 18px;text-align:center;color:#152230;" +
        "font-family:'Nunito',system-ui,sans-serif;box-shadow:0 30px 60px -20px rgba(20,40,80,.5);animation:bmcPop .4s cubic-bezier(.2,.9,.25,1.2);}" +
        "@keyframes bmcPop{from{transform:scale(.9);opacity:0}to{transform:none;opacity:1}}" +
        "#bm-coach .c-mo{width:84px;height:84px;object-fit:contain;margin:-58px auto 4px;display:block;filter:drop-shadow(0 8px 12px rgba(30,60,110,.3));}" +
        "#bm-coach h3{margin:0 0 4px;font-size:21px;font-weight:900;}" +
        "#bm-coach .c-sub{margin:0 0 14px;font-size:14px;color:#5A6878;font-weight:700;}" +
        "#bm-coach .c-steps{display:flex;flex-direction:column;gap:10px;text-align:left;}" +
        "#bm-coach .c-step{display:flex;align-items:center;gap:12px;background:#F4F7FC;border-radius:18px;padding:10px 12px;}" +
        "#bm-coach .c-ico{flex:0 0 52px;height:52px;border-radius:16px;display:grid;place-items:center;font-size:28px;background:#fff;" +
        "box-shadow:0 6px 14px -8px rgba(30,60,110,.45);animation:bmcBob 1.6s ease-in-out infinite;}" +
        "#bm-coach .c-step:nth-child(2) .c-ico{animation-delay:.3s}#bm-coach .c-step:nth-child(3) .c-ico{animation-delay:.6s}#bm-coach .c-step:nth-child(4) .c-ico{animation-delay:.9s}" +
        "@keyframes bmcBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px) scale(1.05)}}" +
        "#bm-coach .c-txt{font-size:15px;font-weight:800;line-height:1.3;}#bm-coach .c-txt small{display:block;font-size:13px;font-weight:700;color:#5A6878;margin-top:2px;}" +
        "#bm-coach .c-go{margin-top:16px;width:100%;min-height:54px;border:none;border-radius:20px;cursor:pointer;color:#fff;font:900 18px/1 'Nunito',system-ui,sans-serif;" +
        "background:linear-gradient(120deg,#10A765 0%,#0A9488 52%,#0A7FB0 100%);text-shadow:0 1px 1.5px rgba(0,70,35,.38);" +
        "box-shadow:inset 0 18px 16px -14px rgba(255,255,255,.45),0 12px 24px -12px rgba(10,143,160,.6);}" +
        "#bm-coach .c-go:active{transform:scale(.96)}" +
        "@media (prefers-reduced-motion:reduce){#bm-coach .c-ico{animation:none}}";
      document.head.appendChild(st);
    }
    var o = document.createElement("div"); o.id = "bm-coach"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true");
    var esc = function (t) { return String(t).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); };
    var steps = (opts.steps || []).map(function (x) {
      return '<div class="c-step"><div class="c-ico">' + esc(x.icon) + '</div><div class="c-txt">' + esc(x.text) +
        (x.sub ? "<small>" + esc(x.sub) + "</small>" : "") + "</div></div>";
    }).join("");
    o.innerHTML = '<div class="c-card"><img class="c-mo" alt="" src="' + POSE + (opts.pose || "baby-mo-idea") + '.webp">' +
      "<h3>" + esc(opts.title || "Cara main") + "</h3>" + (opts.sub ? '<p class="c-sub">' + esc(opts.sub) + "</p>" : "") +
      '<div class="c-steps">' + steps + '</div><button type="button" class="c-go">' + esc(opts.button || "Ayo mulai! ▶") + "</button></div>";
    document.body.appendChild(o);
    o.querySelector(".c-go").addEventListener("click", function (e) {
      e.stopPropagation();
      try { localStorage.setItem(k, "1"); } catch (er) {}
      o.remove(); done();
    });
    return true;
  }

  // ---- Expose + init ----------------------------------------
  window.BabyMo = window.BabyMo || {};
  window.BabyMo.share = share;
  window.BabyMo.shareScore = shareScore;
  window.BabyMo.track = track;
  window.BabyMo.toast = toast;
  window.BabyMo.react = react;
  window.BabyMo.coach = coach;
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
