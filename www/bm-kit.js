/* ============================================================
   Baby Mo Kit — shared helpers for play.babymo.id games.
   Add once per page:  <script src="/bm-kit.js" defer></script>

   Provides:
     1. Privacy-friendly analytics (no cookies, no PII)
     2. A branded Web-Share helper          → BabyMo.share(opts)
     3. A score/result share helper          → BabyMo.shareScore(score, stars, message)
     4. A tiny toast fallback                → BabyMo.toast(msg)

   Everything is wrapped in try/catch so a kit failure can never
   break a game.
   ============================================================ */
(function () {
  "use strict";

  var PLAY_ORIGIN = "https://play.babymo.id";

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

  // ---- Share -------------------------------------------------
  function share(opts) {
    opts = opts || {};
    var text = buildMessage(opts);
    var url = opts.url || gameUrl();
    track("Share", { game: gameName() });
    try {
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
      window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnalytics);
  } else {
    initAnalytics();
  }
})();
