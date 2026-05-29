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
  // Privacy-first analytics. Plausible is the default (no cookies,
  // GDPR-friendly). It only loads on the real domain, so local and
  // in-app opens never pollute the numbers.
  //
  // To turn analytics ON: create a site at https://plausible.io
  // (or self-host) for "play.babymo.id" — no code change needed.
  // To switch to GA4 instead: see the note at initAnalytics().
  // To disable entirely: set ANALYTICS_DOMAIN to "".
  var ANALYTICS_DOMAIN = "play.babymo.id";

  function isProd() {
    return location.hostname === "play.babymo.id";
  }

  // ---- Analytics --------------------------------------------
  function initAnalytics() {
    try {
      if (!ANALYTICS_DOMAIN || !isProd()) return;
      // Plausible (privacy-friendly). For GA4 instead, replace the two
      // lines below with the gtag.js snippet and your measurement ID.
      window.plausible =
        window.plausible ||
        function () {
          (window.plausible.q = window.plausible.q || []).push(arguments);
        };
      var s = document.createElement("script");
      s.defer = true;
      s.setAttribute("data-domain", ANALYTICS_DOMAIN);
      s.src = "https://plausible.io/js/script.outbound-links.js";
      document.head.appendChild(s);
    } catch (e) {}
  }

  function track(event, props) {
    try {
      if (window.plausible) {
        window.plausible(event, props ? { props: props } : undefined);
      }
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

      // Score
      var baseY = mascotImg ? 770 : 560;
      if (opts.score != null && opts.score !== "") {
        x.fillStyle = "#9EA89C";
        x.font = "800 36px Nunito, system-ui, sans-serif";
        x.fillText("SKORKU", cx, baseY);
        x.fillStyle = "#6DB882";
        x.font = "900 92px Nunito, system-ui, sans-serif";
        x.fillText(String(opts.score), cx, baseY + 96);
        if (opts.stars) {
          x.font = "900 64px Nunito, system-ui, sans-serif";
          x.fillText(String(opts.stars), cx, baseY + 176);
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

  // ---- Expose + init ----------------------------------------
  window.BabyMo = window.BabyMo || {};
  window.BabyMo.share = share;
  window.BabyMo.shareScore = shareScore;
  window.BabyMo.track = track;
  window.BabyMo.toast = toast;
  // Exposed for the verification harness / previews.
  window.BabyMo._resultDataURL = buildResultDataURL;

  preloadMascot();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initAnalytics();
      initSW();
    });
  } else {
    initAnalytics();
    initSW();
  }
})();
