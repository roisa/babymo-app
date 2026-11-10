/* ============================================================
   Baby Mo Kit — shared helpers for play.babymo.id games.
   Add once per page:  <script src="/bm-kit.js" defer></script>

   Provides:
     1. Privacy-friendly analytics (no cookies, no PII)
     2. A branded Web-Share helper          → BabyMo.share(opts)
     3. A score/result share helper          → BabyMo.shareScore(score, stars, message, extra)
        ...which attaches a generated branded 1080×1350 result IMAGE
        (per-game theme + icon, celebrating character, headline, stars,
        optional child name) so the share carries a rich card on
        WhatsApp / Instagram, not just text. BabyMo.prepareShare()
        warms its images/fonts (done automatically on idle).
     4. A tiny toast fallback                → BabyMo.toast(msg)
     5. Shared star jar                      → BabyMo.getStars() / addStars(n)
     6. Daily missions + app-wide streak     → BabyMo.daily.*  (see the
        "Daily system" block below and /docs/daily-api.md)

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
    var en = moLang() === "en";
    var g = shareGame();
    var name = opts.title || (g.icon && g.n[en ? 1 : 0]) || gameName();
    var lines = ["🌙 " + (/baby mo$/i.test(name) ? name : name + " — Baby Mo")];
    var n = starCount(opts.stars);
    var starTxt = n ? (n <= 5 ? " " + new Array(n + 1).join("⭐") : " ⭐ " + n) : "";
    if (opts.headline) {
      lines.push("🏆 " + opts.headline + starTxt);
    } else if (opts.score != null && opts.score !== "") {
      lines.push((en ? "My score: " : "Skorku: ") + opts.score + starTxt);
    }
    lines.push(opts.message || (en ? "Let's play & learn Islam with Baby Mo!" : "Yuk main & belajar Islam bareng Baby Mo!"));
    lines.push("");
    lines.push(opts.url || gameUrl());
    lines.push("#BabyMo #BelajarIslam");
    return lines.join("\n");
  }

  // ---- Result image (share card v2) --------------------------
  // A 1080×1350 (4:5) portrait card — the size WhatsApp, Instagram feed
  // and stories all show nicely. Per-game theme colour + the game's icon,
  // a big celebrating character, the headline achievement, stars, an
  // optional first name the parent entered, and a branded footer.
  //
  // Every image is preloaded ahead of time (prepareShare) so the build at
  // share time stays fully synchronous — iOS Safari requires
  // navigator.share() to run inside the user gesture, so we cannot await.
  var CARD_W = 1080, CARD_H = 1350;
  var MO_HEROES = ["baby-mo-pose-41", "baby-mo-yeyy", "baby-mo-wow", "baby-mo-pose-01"];
  // page file → icon, theme gradient (taken from the icon's own art),
  // display names [id, en] and hero character.
  var SHARE_GAMES = {
    "baby-mo-forehand-beat": { icon: "forehand-beat", c: ["#BEF264", "#3F6212"], n: ["Forehand Beat", "Forehand Beat"] },
    "babymo-tenis-adam": { icon: "tenis-adam", c: ["#60A5FA", "#1D4ED8"], n: ["Akademi Tenis Kak Adam", "Kak Adam's Tennis Academy"], hero: ["/adam-tennis-v2/celebrate-3.webp", "/adam-tennis-v2/win-fist-r.webp"] },
    "babymo-kebun-ais": { icon: "kebun-ais", c: ["#86EFAC", "#16A34A"], n: ["Kebun Kecil Ais", "Ais's Little Garden"], hero: ["/ais-garden/arms-wide-joy.webp", "/ais-garden/jump-joy.webp"] },
    "babymo-memory-match": { icon: "memory-match", c: ["#FCD34D", "#B45309"], n: ["Memory Match", "Memory Match"] },
    "babymo-look-and-find": { icon: "cari-baby-mo", c: ["#FDBA74", "#C2410C"], n: ["Cari Baby Mo", "Find Baby Mo"] },
    "babymo-doa-harian": { icon: "doa-harian", c: ["#6EE7B7", "#047857"], n: ["Doa Harian", "Daily Du'as"] },
    "babymo-dua-game": { icon: "dua-journey", c: ["#93C5FD", "#1D4ED8"], n: ["Dua Journey", "Dua Journey"] },
    "babymo-arabic-spelling": { icon: "kata-islam", c: ["#67E8F9", "#0E7490"], n: ["Kata Islam", "Islamic Words"] },
    "babymo-hijaiyah": { icon: "hijaiyah", c: ["#5EEAD4", "#0F766E"], n: ["Pulau Hijaiyah", "Hijaiyah Island"] },
    "babymo-hijaiyah-classic": { icon: "huruf-hijaiyah", c: ["#34D399", "#065F46"], n: ["Huruf Hijaiyah", "Hijaiyah Letters"] },
    "babymo-puzzle-katabaik": { icon: "kata-baik", c: ["#F9A8D4", "#BE185D"], n: ["Kata Baik", "Kind Words"] },
    "babymo-puzzle": { icon: "puzzle", c: ["#C4B5FD", "#6D28D9"], n: ["Kenalan dengan Baby Mo", "Meet Baby Mo"] },
    "babymo-wudhu": { icon: "wudhu", c: ["#7DD3FC", "#0369A1"], n: ["Wudhu Bareng Mo", "Wudhu with Mo"] },
    "babymo-dreamtime": { icon: "dreamtime", c: ["#A5B4FC", "#312E81"], n: ["Dreamtime", "Dreamtime"] },
    "babymo-sahabat-hewan": { icon: "sahabat-hewan", c: ["#FDBA74", "#EA580C"], n: ["Sahabat Hewan Mo", "Mo's Animal Friends"] },
    "babymo-pray-with-mo": { icon: "pray-with-mo", c: ["#4FA877", "#0B2A1B"], n: ["Pray with Mo", "Pray with Mo"] },
  };
  var BRAND_THEME = { c: ["#4FA877", "#0B2A1B"], n: ["Baby Mo", "Baby Mo"] };

  function pageKey() {
    try {
      return (location.pathname.split("/").pop() || "").replace(/\.html?$/, "");
    } catch (e) { return ""; }
  }
  function shareGame() { return SHARE_GAMES[pageKey()] || BRAND_THEME; }
  function L2(id, en) { return moLang() === "en" ? en : id; }

  var mascotImg = null; // Baby Mo logo head (footer)
  var shareImgs = {};   // src → loaded HTMLImageElement
  var heroSrc = null;   // the hero picked for this page
  var prepared = null;  // Promise from prepareShare()

  function loadImg(src) {
    return new Promise(function (res) {
      if (!src) return res(null);
      if (shareImgs[src]) return res(shareImgs[src]);
      try {
        var i = new Image();
        i.crossOrigin = "anonymous";
        i.onload = function () { shareImgs[src] = i; res(i); };
        i.onerror = function () { res(null); };
        i.src = src;
      } catch (e) { res(null); }
    });
  }
  function preloadMascot() {
    loadImg(MASCOT_SRC).then(function (i) { if (i) mascotImg = i; });
  }
  // Bounding box of the opaque pixels, so every character fills the card
  // the same way however much empty margin its artwork has.
  var trimBox = {};
  function trimImg(src) {
    var i = shareImgs[src];
    if (!i || trimBox[src]) return;
    try {
      var w = i.naturalWidth, h = i.naturalHeight;
      var cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      var cx2 = cv.getContext("2d");
      cx2.drawImage(i, 0, 0);
      var d = cx2.getImageData(0, 0, w, h).data;
      var x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (var yy = 0; yy < h; yy++) {
        for (var xx = 0; xx < w; xx++) {
          if (d[(yy * w + xx) * 4 + 3] > 24) {
            if (xx < x0) x0 = xx; if (xx > x1) x1 = xx;
            if (yy < y0) y0 = yy; if (yy > y1) y1 = yy;
          }
        }
      }
      if (x1 > x0 && y1 > y0) trimBox[src] = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
    } catch (e) {}
  }
  function pickHeroSrc(g) {
    var list = g.hero || MO_HEROES.map(function (p) { return POSE + p + ".webp"; });
    return list[Math.floor(Math.random() * list.length)];
  }
  // Warm everything the card needs. Safe to call many times; games may
  // call it when their result screen opens. Resolves when ready.
  function prepareShare() {
    if (prepared) return prepared;
    var g = shareGame();
    heroSrc = heroSrc || pickHeroSrc(g);
    var jobs = [loadImg(MASCOT_SRC).then(function (i) { if (i) mascotImg = i; }), loadImg(heroSrc).then(function () { trimImg(heroSrc); })];
    if (g.icon) jobs.push(loadImg("/icons/games/" + g.icon + ".svg"));
    try {
      if (document.fonts && document.fonts.load) {
        jobs.push(document.fonts.load('700 100px "Fredoka"').catch(function () {}));
        jobs.push(document.fonts.load('900 40px "Nunito"').catch(function () {}));
        jobs.push(document.fonts.load('800 30px "Nunito"').catch(function () {}));
      }
    } catch (e) {}
    prepared = Promise.all(jobs).then(function () { return true; }, function () { return true; });
    return prepared;
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

  // Canvas text should not depend on an emoji font being present.
  function noEmoji(s) {
    s = String(s == null ? "" : s);
    try {
      // built at runtime so old engines without the "u" flag still parse the kit
      s = s.replace(new RegExp("[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\u{FE0F}\\u{200D}\\u{20E3}]", "gu"), "");
    } catch (e) {}
    return s.replace(/\s{2,}/g, " ").trim();
  }

  // stars can be 3, "3", "⭐⭐⭐", "⭐ 8" or "★★☆" → a number (or 0)
  function starCount(s) {
    if (s == null || s === "") return 0;
    if (typeof s === "number") return Math.max(0, Math.round(s));
    s = String(s);
    var digits = s.match(/\d+/);
    if (digits) return parseInt(digits[0], 10) || 0;
    var m = s.match(/⭐|★|🌟/g);
    return m ? m.length : 0;
  }

  function hexRgb(h) {
    h = h.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function mix(a, b, t) {
    var A = hexRgb(a), B = hexRgb(b);
    return "rgb(" + [0, 1, 2].map(function (i) { return Math.round(A[i] + (B[i] - A[i]) * t); }).join(",") + ")";
  }
  function rng(seedStr) {
    var s = 2166136261;
    for (var i = 0; i < seedStr.length; i++) { s ^= seedStr.charCodeAt(i); s = Math.imul(s, 16777619); }
    return function () {
      s += 0x6d2b79f5;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function starPath(x, cx, cy, r, inner, rot) {
    x.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = (rot || 0) - Math.PI / 2 + (i * Math.PI) / 5;
      var rr = i % 2 ? r * (inner || 0.5) : r;
      x[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    x.closePath();
  }
  function sparkle(x, cx, cy, r, color) {
    x.beginPath();
    x.moveTo(cx, cy - r);
    x.quadraticCurveTo(cx, cy, cx + r, cy);
    x.quadraticCurveTo(cx, cy, cx, cy + r);
    x.quadraticCurveTo(cx, cy, cx - r, cy);
    x.quadraticCurveTo(cx, cy, cx, cy - r);
    x.fillStyle = color;
    x.fill();
  }
  function goldStar(x, cx, cy, r, on) {
    x.save();
    starPath(x, cx, cy, r, 0.52);
    x.lineJoin = "round";
    if (on) {
      var g = x.createLinearGradient(cx, cy - r, cx, cy + r);
      g.addColorStop(0, "#FFE27A");
      g.addColorStop(1, "#FFB31F");
      x.fillStyle = g;
      x.shadowColor = "rgba(230,140,0,.45)";
      x.shadowBlur = 14;
      x.shadowOffsetY = 4;
      x.fill();
      x.shadowColor = "transparent";
      x.lineWidth = 5;
      x.strokeStyle = "#E08A00";
      x.stroke();
      // glossy dot
      x.beginPath();
      x.ellipse(cx - r * 0.18, cy - r * 0.22, r * 0.16, r * 0.09, -0.6, 0, Math.PI * 2);
      x.fillStyle = "rgba(255,255,255,.75)";
      x.fill();
    } else {
      x.fillStyle = "#ECE7DC";
      x.fill();
      x.lineWidth = 5;
      x.strokeStyle = "#D6CFC0";
      x.stroke();
    }
    x.restore();
  }
  // 8-point Islamic star (two rotated squares), outline only.
  function rubElHizb(x, cx, cy, r) {
    x.beginPath();
    for (var k = 0; k < 2; k++) {
      for (var i = 0; i < 4; i++) {
        var a = k * Math.PI / 4 + i * Math.PI / 2;
        x[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      x.closePath();
    }
    x.stroke();
  }
  function crescent(x, cx, cy, r, color) {
    var cv = document.createElement("canvas");
    var S = Math.ceil(r * 2 + 80);
    cv.width = cv.height = S;
    var o = cv.getContext("2d");
    o.beginPath();
    o.arc(S / 2, S / 2, r, 0, Math.PI * 2);
    o.fillStyle = color;
    o.fill();
    o.globalCompositeOperation = "destination-out";
    o.beginPath();
    o.arc(S / 2 + r * 0.45, S / 2 - r * 0.25, r * 0.82, 0, Math.PI * 2);
    o.fill();
    x.save();
    x.shadowColor = "rgba(255,226,140,.75)";
    x.shadowBlur = 34;
    x.drawImage(cv, cx - S / 2, cy - S / 2);
    x.restore();
  }
  // Character with a thick white "sticker" outline so it pops off any theme.
  function drawSticker(x, img, box, dx, dy, dw, dh, pad) {
    var cv = document.createElement("canvas");
    cv.width = Math.ceil(dw + pad * 2);
    cv.height = Math.ceil(dh + pad * 2);
    var o = cv.getContext("2d");
    for (var a = 0; a < 24; a++) {
      var t = (a / 24) * Math.PI * 2;
      o.drawImage(img, box.x, box.y, box.w, box.h, pad + Math.cos(t) * pad, pad + Math.sin(t) * pad, dw, dh);
    }
    o.globalCompositeOperation = "source-in";
    o.fillStyle = "#FFFFFF";
    o.fillRect(0, 0, cv.width, cv.height);
    o.globalCompositeOperation = "source-over";
    o.drawImage(img, box.x, box.y, box.w, box.h, pad, pad, dw, dh);
    x.drawImage(cv, dx - pad, dy - pad);
  }

  function setFont(x, weight, size, fam) {
    x.font = weight + " " + size + "px " + fam;
  }
  var F_HEAD = '"Fredoka", "Nunito", system-ui, sans-serif';
  var F_BODY = '"Nunito", system-ui, sans-serif';
  function fitFont(x, text, weight, size, fam, maxW, minSize) {
    setFont(x, weight, size, fam);
    while (size > (minSize || 20) && x.measureText(text).width > maxW) {
      size -= 2;
      setFont(x, weight, size, fam);
    }
    return size;
  }
  function wrapLines(x, text, maxW, maxLines) {
    var words = String(text).split(" ");
    var lines = [], line = "";
    for (var i = 0; i < words.length; i++) {
      var t = line ? line + " " + words[i] : words[i];
      if (x.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; }
      else line = t;
    }
    if (line) lines.push(line);
    if (lines.length === 2) {
      // balance two lines so we never leave a lonely last word
      var best = null;
      for (var b = 1; b < words.length; b++) {
        var l1 = words.slice(0, b).join(" "), l2 = words.slice(b).join(" ");
        var w1 = x.measureText(l1).width, w2 = x.measureText(l2).width;
        if (w1 > maxW || w2 > maxW) continue;
        var score = Math.max(w1, w2);
        if (!best || score < best.s) best = { s: score, l: [l1, l2] };
      }
      if (best) lines = best.l;
    }
    if (maxLines && lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      var last = lines[maxLines - 1];
      while (last.length > 1 && x.measureText(last + "…").width > maxW) last = last.slice(0, -1);
      lines[maxLines - 1] = last.replace(/[\s,.;:!-]+$/, "") + "…";
    }
    return lines;
  }

  // Normalise the share options into what the card shows.
  function cardModel(opts) {
    var g = shareGame();
    var en = moLang() === "en";
    var name = noEmoji(childName()).split(/\s+/)[0] || "";
    if (name.length > 14) name = name.slice(0, 13) + "…";
    var title = noEmoji(opts.game || (g.n && g.n[en ? 1 : 0]) || opts.title || gameName());
    title = title.replace(/\s*[—|-]\s*Baby Mo$/i, "");
    var hasScore = opts.score != null && opts.score !== "" && noEmoji(opts.score) !== "";
    var stars = starCount(opts.stars);
    var starsMax = opts.starsMax || (stars > 0 && stars <= 3 ? 3 : stars <= 5 ? 5 : 0);
    if (stars > starsMax) starsMax = 0;
    var headline = noEmoji(opts.headline || "");
    if (!headline) {
      if (hasScore && /^\d+$/.test(noEmoji(opts.score))) headline = (en ? "My score: " : "Skorku ") + noEmoji(opts.score) + "!";
      else if (hasScore) headline = noEmoji(opts.score);
      else if (stars) headline = stars + (en ? (stars === 1 ? " star!" : " stars!") : " bintang!");
      else headline = en ? "I did it!" : "Aku berhasil!";
    }
    var sub = noEmoji(opts.sub || opts.message || "");
    if (name && sub) sub = sub.replace(/^(Aku|I)\s/, name + " ");
    var cheers = opts.cheer ? [opts.cheer] : en
      ? ["MashaAllah", "Alhamdulillah", "Barakallah"]
      : ["MasyaAllah", "Alhamdulillah", "Barakallah"];
    var r = rng(title + headline);
    var cheer = noEmoji(cheers[Math.floor(r() * cheers.length)]);
    cheer = name ? cheer + ", " + name + "!" : cheer + "!";
    var stats = (opts.stats || []).filter(function (s) { return s && s[1] !== "" && s[1] != null; }).slice(0, 3)
      .map(function (s) { return [noEmoji(s[0]), noEmoji(s[1])]; });
    return {
      g: g, en: en, title: title, headline: headline, sub: sub, cheer: cheer,
      stars: stars, starsMax: starsMax, stats: stats,
      hero: opts.hero ? shareImgs[opts.hero] : shareImgs[heroSrc],
      heroBox: trimBox[opts.hero || heroSrc],
      icon: g.icon ? shareImgs["/icons/games/" + g.icon + ".svg"] : null,
    };
  }

  // Returns a PNG dataURL string, or null. Fully synchronous.
  function buildResultDataURL(opts) {
    try {
      opts = opts || {};
      if (!prepared) prepareShare(); // too late for this share, ready next time
      var m = cardModel(opts);
      var W = CARD_W, H = CARD_H, cx = W / 2;
      var c0 = m.g.c[0], c1 = m.g.c[1];
      var c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      var x = c.getContext("2d");
      var R = rng(m.title + "|" + m.headline);

      // Layout first: the card hugs its content, the hero stands on it
      var cardX = 60, cardW = W - 120, inner = cardW - 110;
      var footH = 150;
      var subLines = [];
      if (m.sub) { setFont(x, "800", 38, F_BODY); subLines = wrapLines(x, m.sub, inner, 2); }
      var hasStars = m.stars > 0;
      var blocks = 46 /*cheer*/ + 118 /*headline*/ + (hasStars ? 104 : 0) + (m.stats.length ? 86 : 0) + subLines.length * 50 + (subLines.length && !hasStars && !m.stats.length ? 16 : 0);
      var cardH = blocks + 96;
      var cardY = H - footH - 40 - cardH;

      var feet = cardY + 16;
      var heroTop = 205;
      var sunY = Math.round((heroTop + feet) / 2);

      // 1. Background: theme gradient, sunburst, glow, pattern
      var bg = x.createLinearGradient(0, 0, W * 0.3, H);
      bg.addColorStop(0, mix(c0, "#FFFFFF", 0.12));
      bg.addColorStop(0.5, mix(c0, c1, 0.55));
      bg.addColorStop(1, mix(c1, "#000000", 0.25));
      x.fillStyle = bg;
      x.fillRect(0, 0, W, H);

      x.save();
      x.translate(cx, sunY);
      for (var i = 0; i < 18; i++) {
        x.rotate((Math.PI * 2) / 18);
        x.beginPath();
        x.moveTo(0, 0);
        x.lineTo(-90, -1000);
        x.lineTo(90, -1000);
        x.closePath();
        x.fillStyle = "rgba(255,255,255,0.07)";
        x.fill();
      }
      x.restore();

      var glow = x.createRadialGradient(cx, sunY, 0, cx, sunY, 420);
      glow.addColorStop(0, "rgba(255,255,255,0.55)");
      glow.addColorStop(0.45, "rgba(255,255,255,0.18)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = glow;
      x.fillRect(0, 0, W, H);

      x.save();
      x.strokeStyle = "rgba(255,255,255,0.10)";
      x.lineWidth = 3;
      for (var py = 60; py < 820; py += 180) {
        for (var px = (py / 180) % 2 ? 90 : 0; px < W + 90; px += 180) {
          var dx = px - cx, dy = py - sunY;
          if (dx * dx + dy * dy < 330 * 330) continue; // keep the hero area clean
          if (px > 820 && py < 380) continue; // and the moon
          rubElHizb(x, px, py, 34);
        }
      }
      x.restore();

      // 2. Moon + sparkles + confetti
      crescent(x, 950, 250, 56, "#FFE7A3");
      starPath(x, 880, 205, 14, 0.45);
      x.fillStyle = "#FFF4CC";
      x.fill();
      var confetti = ["#FFD54F", "#FF8A80", "#80D8FF", "#B9F6CA", "#FFFFFF", "#EA80FC", "#FFAB40"];
      for (var k = 0; k < 46; k++) {
        var qx = R() * W, qy = 210 + R() * 640;
        var ddx = qx - cx, ddy = qy - sunY;
        if (Math.abs(ddx) < 230 && ddy > -260) continue; // not on the hero
        x.save();
        x.translate(qx, qy);
        x.rotate(R() * Math.PI);
        x.fillStyle = confetti[k % confetti.length];
        x.globalAlpha = 0.9;
        var kind = k % 3;
        if (kind === 0) x.fillRect(-9, -4, 18, 8);
        else if (kind === 1) { x.beginPath(); x.arc(0, 0, 6, 0, Math.PI * 2); x.fill(); }
        else { starPath(x, 0, 0, 10, 0.5); x.fill(); }
        x.restore();
      }
      [[150, 420, 26], [930, 470, 30], [205, 720, 18], [875, 690, 22], [300, 300, 14], [790, 330, 16]].forEach(function (s) {
        sparkle(x, s[0], s[1], s[2], "rgba(255,255,255,0.95)");
      });

      // 3. Title pill: game icon + game name
      var pillH = 116, iconS = 88;
      var tSize = fitFont(x, m.title, "600", 50, F_HEAD, W - 330, 30);
      var tW = x.measureText(m.title).width;
      var pillW = (m.icon ? iconS + 26 : 0) + tW + 70;
      var pillX = cx - pillW / 2, pillY = 54;
      x.save();
      x.shadowColor = "rgba(0,0,0,.18)";
      x.shadowBlur = 24;
      x.shadowOffsetY = 8;
      roundRect(x, pillX, pillY, pillW, pillH, pillH / 2);
      x.fillStyle = "#FFFFFF";
      x.fill();
      x.restore();
      var tx = pillX + 35;
      if (m.icon) {
        x.save();
        roundRect(x, pillX + 14, pillY + (pillH - iconS) / 2, iconS, iconS, 26);
        x.clip();
        x.drawImage(m.icon, pillX + 14, pillY + (pillH - iconS) / 2, iconS, iconS);
        x.restore();
        tx = pillX + 14 + iconS + 22;
      }
      x.textAlign = "left";
      x.textBaseline = "middle";
      setFont(x, "600", tSize, F_HEAD);
      x.fillStyle = mix(c1, "#000000", 0.35);
      x.fillText(m.title, tx, pillY + pillH / 2 + 2);

      // 5. Hero character, feet resting on the card
      var hero = m.hero || mascotImg;
      if (hero) {
        var box = (m.hero && m.heroBox) || { x: 0, y: 0, w: hero.naturalWidth || hero.width, h: hero.naturalHeight || hero.height };
        var maxH = feet - heroTop, maxW = 700;
        var sc = Math.min(maxH / box.h, maxW / box.w, 2.1);
        var hw = box.w * sc, hh = box.h * sc;
        x.save();
        x.beginPath();
        x.ellipse(cx, feet - 6, Math.min(hw * 0.42, 220), 24, 0, 0, Math.PI * 2);
        x.fillStyle = "rgba(0,0,0,0.20)";
        x.fill();
        x.shadowColor = "rgba(0,0,0,0.30)";
        x.shadowBlur = 40;
        x.shadowOffsetY = 16;
        drawSticker(x, hero, box, cx - hw / 2, feet - hh, hw, hh, 10);
        x.restore();
      }

      // 6. Achievement card
      x.save();
      x.shadowColor = "rgba(0,0,0,.25)";
      x.shadowBlur = 40;
      x.shadowOffsetY = 14;
      roundRect(x, cardX, cardY, cardW, cardH, 56);
      x.fillStyle = "#FFFDF6";
      x.fill();
      x.restore();
      roundRect(x, cardX + 14, cardY + 14, cardW - 28, cardH - 28, 44);
      x.lineWidth = 3;
      x.setLineDash([2, 12]);
      x.lineCap = "round";
      x.strokeStyle = mix(c0, "#FFFFFF", 0.2);
      x.stroke();
      x.setLineDash([]);

      x.textAlign = "center";
      x.textBaseline = "alphabetic";
      var y = cardY + 48 + 38;
      // cheer
      var cheerSize = fitFont(x, m.cheer, "900", 40, F_BODY, inner, 26);
      x.fillStyle = mix(c1, "#000000", 0.05);
      x.fillText(m.cheer, cx, y);
      // headline
      y += 118;
      var hSize = fitFont(x, m.headline, "700", 108, F_HEAD, inner, 50);
      x.lineJoin = "round";
      x.lineWidth = 6;
      x.strokeStyle = "#FFFFFF";
      x.fillStyle = "#2A2338";
      x.fillText(m.headline, cx, y - (108 - hSize) / 3);
      // stars
      if (hasStars) {
        y += 22;
        if (m.starsMax) {
          var sr = m.starsMax > 3 ? 36 : 44, gap = sr * 2.5;
          for (var s = 0; s < m.starsMax; s++) {
            var sx = cx + (s - (m.starsMax - 1) / 2) * gap;
            var lift = m.starsMax === 3 && s === 1 ? -10 : 0;
            goldStar(x, sx, y + 46 + lift, s === 1 && m.starsMax === 3 ? sr + 6 : sr, s < m.stars);
          }
        } else {
          var label = "× " + m.stars;
          setFont(x, "700", 64, F_HEAD);
          var lw = x.measureText(label).width;
          var chipW = lw + 120, chipX = cx - chipW / 2;
          roundRect(x, chipX, y + 4, chipW, 86, 43);
          x.fillStyle = "#FFF1C9";
          x.fill();
          goldStar(x, chipX + 50, y + 47, 30, true);
          x.textAlign = "left";
          x.fillStyle = "#8A5300";
          x.fillText(label, chipX + 92, y + 70);
          x.textAlign = "center";
        }
        y += 82;
      }
      // stats chips
      if (m.stats.length) {
        y += 18;
        setFont(x, "800", 30, F_BODY);
        var chips = m.stats.map(function (st) {
          var t = st[0] + " " + st[1];
          return { t: st, w: x.measureText(t).width + 52 };
        });
        var total = chips.reduce(function (a, ch) { return a + ch.w; }, 0) + (chips.length - 1) * 16;
        var chx = cx - total / 2;
        chips.forEach(function (ch) {
          roundRect(x, chx, y, ch.w, 60, 30);
          x.fillStyle = mix(c0, "#FFFFFF", 0.72);
          x.fill();
          x.textAlign = "left";
          setFont(x, "700", 30, F_BODY);
          x.fillStyle = mix(c1, "#000000", 0.2);
          x.fillText(ch.t[0], chx + 26, y + 41);
          var lw2 = x.measureText(ch.t[0] + " ").width;
          setFont(x, "900", 30, F_BODY);
          x.fillStyle = "#2A2338";
          x.fillText(ch.t[1], chx + 26 + lw2, y + 41);
          chx += ch.w + 16;
        });
        x.textAlign = "center";
        y += 68;
      }
      // sub line
      if (subLines.length) {
        setFont(x, "800", 38, F_BODY);
        x.fillStyle = "#6B6478";
        y += hasStars || m.stats.length ? 14 : 30;
        for (var l = 0; l < subLines.length; l++) {
          y += 50;
          x.fillText(subLines[l], cx, y - 8);
        }
      }

      // 7. Footer: logo + brand + CTA
      var fy = H - footH;
      x.fillStyle = "rgba(0,0,0,0.20)";
      x.fillRect(0, fy, W, footH);
      if (mascotImg) {
        x.save();
        x.beginPath();
        x.arc(122, fy + footH / 2, 52, 0, Math.PI * 2);
        x.fillStyle = "#FFFFFF";
        x.fill();
        x.clip();
        x.drawImage(mascotImg, 74, fy + footH / 2 - 48, 96, 96);
        x.restore();
      }
      x.textAlign = "left";
      x.fillStyle = "#FFFFFF";
      setFont(x, "700", 46, F_HEAD);
      x.fillText("Baby Mo", 196, fy + 68);
      setFont(x, "800", 26, F_BODY);
      x.fillStyle = "rgba(255,255,255,0.85)";
      x.fillText(m.en ? "Play & learn Islam for free" : "Main & belajar Islam gratis", 196, fy + 106);
      var cta = "play.babymo.id";
      setFont(x, "900", 34, F_BODY);
      var ctaW = x.measureText(cta).width + 64, ctaX = W - 60 - ctaW, ctaY = fy + footH / 2 - 36;
      roundRect(x, ctaX, ctaY, ctaW, 72, 36);
      x.fillStyle = "#FFD45C";
      x.fill();
      x.fillStyle = "#4A2E00";
      x.textAlign = "center";
      x.fillText(cta, ctaX + ctaW / 2, ctaY + 48);

      return c.toDataURL("image/png");
    } catch (e) {
      return null;
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
    var en = moLang() === "en";
    var title = opts.title || (shareGame().n || [])[en ? 1 : 0] || gameName();
    track("Share", { game: gameName() });

    // Try to attach a branded image (kept synchronous for the gesture).
    var file = null, dataURL = null;
    if (opts.image !== false) {
      dataURL = buildResultDataURL(opts);
      if (dataURL) file = dataURLtoFile(dataURL, "babymo-" + (pageKey().replace(/^baby-?mo-/, "") || "share") + ".png");
    }

    try {
      if (
        file &&
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        navigator
          .share({ files: [file], text: text, title: title })
          .catch(function () {});
        return;
      }
      if (navigator.share) {
        navigator
          .share({ title: title, text: text, url: url })
          .catch(function () {});
        return;
      }
      // No Web Share (most desktops): save the picture and copy the text,
      // so the parent can paste both into WhatsApp / Instagram.
      var saved = false;
      if (dataURL) {
        try {
          var a = document.createElement("a");
          a.href = dataURL;
          a.download = file ? file.name : "babymo.png";
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { a.remove(); }, 0);
          saved = true;
        } catch (e) {}
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          toast(saved
            ? (en ? "🖼️ Picture saved & link copied!" : "🖼️ Gambar disimpan & tautan disalin!")
            : (en ? "📋 Link copied!" : "📋 Tautan disalin!"));
        }, function () {
          if (saved) toast(en ? "🖼️ Picture saved!" : "🖼️ Gambar disimpan!");
          else window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
        });
        return;
      }
      if (saved) { toast(en ? "🖼️ Picture saved!" : "🖼️ Gambar disimpan!"); return; }
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

  // shareScore(score, stars, message[, extra]) — extra may carry any of
  // the richer card fields: headline, sub, stats [[label, value]…],
  // starsMax, game, cheer, hero.
  function shareScore(score, stars, message, extra) {
    var o = { score: score, stars: stars, message: message };
    if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) o[k] = extra[k];
    share(o);
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
  // Is there a tappable control where Baby Mo would pop up (bottom-left)?
  function coversButton(self, lift) {
    try {
      var h = innerHeight, w = Math.min(innerWidth, 380);
      var x0 = innerWidth >= 760 ? Math.max(24, innerWidth / 2 - 360) : 12;
      for (var y = h - lift - 18; y > h - lift - 96; y -= 18) {
        for (var x = x0 + 10; x < x0 + w - 20; x += 40) {
          var el = document.elementFromPoint(x, y);
          if (!el || self.contains(el)) continue;
          if (el.closest && el.closest('button,a[href],[role="button"],input,select,.btn,.btn-pri,.btn-sec')) return true;
        }
      }
    } catch (e) {}
    return false;
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
      var lift = atTop ? 0 : bottomBarHeight(box);
      // Never sit on top of a button: if the bottom-left spot is busy, drop in from the top
      if (!atTop && coversButton(box, lift)) atTop = true;
      box.classList.remove("show");
      box.classList.toggle("top", atTop);
      box.style.setProperty("--bm-mo-lift", atTop ? "0px" : lift + "px");
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
    "babymo-sahabat-hewan":   ["kebun-ais",    "babymo-kebun-ais.html",      "Kebun Kecil Ais","Tanam, siram, lalu panen 🌱"],
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
      if (p === "/" || /\/index\.html$/.test(p) || /companion|pray-with-mo|doa-harian|hijaiyah-classic/.test(p)) return;
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

  /* ---- Daily system: missions, app-wide streak, seeded "of the day" -----
     BabyMo.daily — shared retention layer (docs: /docs/daily-api.md).
     Everything is LOCAL-date based ('YYYY-MM-DD' in the device's time zone),
     works offline, and survives missing / corrupt / blocked localStorage
     (falls back to an in-memory copy for the session).

       daily.today()                 → 'YYYY-MM-DD' (local)
       daily.mark(gameId, taskId)    → true if this activity is NEW today.
                                       Also completes any of today's missions
                                       it matches (+1 ⭐, +2 ⭐ bonus for 3/3,
                                       banner "Misi selesai! 2/3").
       daily.did(gameId, taskId?)    → done today? (taskId omitted = any task)
       daily.log(dateStr?)           → [{gameId, taskId, count}] for that day
       daily.missions(dateStr?)      → today's 3 missions [{id, gameId, url,
                                       icon, art, cat, text:{id,en},
                                       game:{id,en}, done}]
       daily.progress()              → {done, total, allDone}
       daily.streak()                → {count, best, todayDone}
       daily.reward(gameId, key, n)  → add n ⭐ at most once per key per day
                                       (anti-farming helper for games)
       daily.seed(str?)              → seeded RNG fn() → [0,1); default seed
                                       is today's date ("X of the day")
       daily.pick(arr, salt, date?)  → deterministic item of the day
       daily.registry()              → copy of the mission registry
       daily.rewards                 → {mission:1, bonus:2} star amounts
     Fires window event "bm-daily" {detail:{type, ...}} on every change.
     Storage: localStorage "bm_daily_v1" (see docs for the shape). */
  var DAILY_KEY = "bm_daily_v1";
  var DAILY_KEEP_DAYS = 60;
  var MISSION_STAR = 1, MISSION_BONUS = 2;
  // Mission registry. `task` may be a string, an array of taskIds, or "*"
  // (any task of that game). Only list missions whose mark() calls exist.
  // cat: "ibadah" (worship & du'a), "learn", "play" — one of each per day.
  var MISSIONS = [
    { id: "doa-read", cat: "ibadah", gameId: "doa-harian", task: "read", url: "babymo-doa-harian.html", icon: "🤲", art: "doa-harian",
      text: { id: "Baca 1 doa harian", en: "Read 1 daily du'a" }, game: { id: "Doa Harian", en: "Daily Du'a" } },
    { id: "pray-practice", cat: "ibadah", gameId: "pray-with-mo", task: "practice", url: "babymo-pray-with-mo.html", icon: "🕌", art: "pray-with-mo",
      text: { id: "Latihan gerakan sholat", en: "Practise the prayer moves" }, game: { id: "Sholat Bareng Mo", en: "Pray with Mo" } },
    { id: "pray-dzikir", cat: "ibadah", gameId: "pray-with-mo", task: "dzikir", url: "babymo-pray-with-mo.html?view=dzikir", icon: "📿", art: "pray-with-mo",
      text: { id: "Selesaikan 1 dzikir", en: "Finish 1 dhikr" }, game: { id: "Dzikir & Doa", en: "Dhikr & Du'a" } },
    { id: "wudhu", cat: "ibadah", gameId: "wudhu", task: ["guide", "order"], url: "babymo-wudhu.html", icon: "💧", art: "wudhu",
      text: { id: "Belajar wudhu bareng Mo", en: "Learn wudu with Mo" }, game: { id: "Wudhu", en: "Wudu" } },
    { id: "dua-match", cat: "ibadah", gameId: "dua-game", task: "level", url: "babymo-dua-game.html", icon: "🃏", art: "dua-journey",
      text: { id: "Cocokkan kartu doa", en: "Match the du'a cards" }, game: { id: "Dua Journey", en: "Dua Journey" } },
    { id: "dream-sleep", cat: "ibadah", gameId: "dreamtime", task: "sleep", url: "babymo-dreamtime.html", icon: "🌙", art: "dreamtime",
      text: { id: "Rutinitas tidur bareng Mo", en: "Bedtime routine with Mo" }, game: { id: "Dreamtime", en: "Dreamtime" } },
    { id: "kata-word", cat: "learn", gameId: "arabic-spelling", task: ["word", "section"], url: "babymo-arabic-spelling.html", icon: "🔤", art: "kata-islam",
      text: { id: "Susun 1 kata Arab", en: "Spell 1 Arabic word" }, game: { id: "Kata Islam", en: "Islamic Words" } },
    { id: "huruf", cat: "learn", gameId: "hijaiyah-classic", task: ["lesson", "trace", "catch", "review"], url: "babymo-hijaiyah-classic.html", icon: "✍️", art: "huruf-hijaiyah",
      text: { id: "Belajar huruf hijaiyah", en: "Learn a Hijaiyah letter" }, game: { id: "Huruf Hijaiyah", en: "Hijaiyah Letters" } },
    { id: "kata-baik", cat: "learn", gameId: "puzzle-katabaik", task: "phrase", url: "babymo-puzzle-katabaik.html", icon: "💖", art: "kata-baik",
      text: { id: "Temukan 1 kata baik", en: "Discover 1 good word" }, game: { id: "Kata Baik", en: "Good Words" } },
    { id: "memory", cat: "play", gameId: "memory-match", task: "win", url: "babymo-memory-match.html", icon: "🧠", art: "memory-match",
      text: { id: "Menangkan Memory Match", en: "Win a Memory Match game" }, game: { id: "Memory Match", en: "Memory Match" } },
    { id: "find-mo", cat: "play", gameId: "look-and-find", task: "room", url: "babymo-look-and-find.html", icon: "🔍", art: "cari-baby-mo",
      text: { id: "Cari Baby Mo di 1 ruangan", en: "Find Baby Mo in 1 room" }, game: { id: "Cari Baby Mo", en: "Find Baby Mo" } },
    { id: "puzzle", cat: "play", gameId: "puzzle", task: "finish", url: "babymo-puzzle.html", icon: "🧩", art: "puzzle",
      text: { id: "Buka puzzle Baby Mo", en: "Solve the Baby Mo puzzle" }, game: { id: "Kenalan Baby Mo", en: "Meet Baby Mo" } },
    { id: "hewan-care", cat: "play", gameId: "sahabat-hewan", task: "care", url: "babymo-sahabat-hewan.html", icon: "🐑", art: "sahabat-hewan",
      text: { id: "Rawat 1 sahabat hewan", en: "Look after an animal friend" }, game: { id: "Sahabat Hewan", en: "Animal Friends" } },
    { id: "kebun-water", cat: "play", gameId: "kebun-ais", task: ["water", "harvest"], url: "babymo-kebun-ais.html", icon: "🌱", art: "kebun-ais",
      text: { id: "Siram tanaman di kebun", en: "Water a plant in the garden" }, game: { id: "Kebun Ais", en: "Ais Garden" } },
    { id: "beat-run", cat: "play", gameId: "forehand-beat", task: "run", url: "baby-mo-forehand-beat.html", icon: "🎾", art: "forehand-beat",
      text: { id: "Main 1 ronde Forehand Beat", en: "Play 1 round of Forehand Beat" }, game: { id: "Forehand Beat", en: "Forehand Beat" } }
  ];
  var MISSION_CATS = ["ibadah", "learn", "play"];

  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function dateStr(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function today() { return dateStr(new Date()); }
  // Shift a 'YYYY-MM-DD' by n local days (DST-safe: built from y/m/d at noon).
  function shiftDay(ds, n) {
    var p = String(ds).split("-");
    var d = new Date(+p[0], (+p[1] || 1) - 1, (+p[2] || 1) + n, 12);
    return dateStr(d);
  }
  function validDay(ds) { return typeof ds === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ds); }

  // Seeded RNG (FNV-1a hash → mulberry32). Same string → same sequence.
  function hashStr(s) {
    s = String(s);
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h;
  }
  function seed(str) {
    var a = hashStr(str == null ? today() : str);
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pickOfDay(arr, salt, ds) {
    if (!arr || !arr.length) return undefined;
    var r = seed((ds || today()) + "|" + (salt || ""));
    return arr[Math.floor(r() * arr.length)];
  }

  var _dailyMem = null; // in-memory fallback when storage is unavailable
  function freshDaily() { return { v: 1, days: {}, streak: { count: 0, best: 0, last: "" } }; }
  function loadDaily() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(DAILY_KEY) || "null"); } catch (e) { s = null; }
    if (!s && _dailyMem) s = _dailyMem;
    if (!s || typeof s !== "object" || Array.isArray(s)) s = freshDaily();
    if (!s.days || typeof s.days !== "object" || Array.isArray(s.days)) s.days = {};
    var st = s.streak;
    if (!st || typeof st !== "object") st = s.streak = { count: 0, best: 0, last: "" };
    st.count = Math.max(0, parseInt(st.count, 10) || 0);
    st.best = Math.max(st.count, parseInt(st.best, 10) || 0);
    if (!validDay(st.last)) st.last = "";
    s.v = 1;
    return s;
  }
  function saveDaily(s) {
    // prune old days so storage stays tiny
    try {
      var ks = Object.keys(s.days).filter(validDay).sort();
      for (var i = 0; i < ks.length - DAILY_KEEP_DAYS; i++) delete s.days[ks[i]];
      Object.keys(s.days).forEach(function (k) { if (!validDay(k)) delete s.days[k]; });
    } catch (e) {}
    _dailyMem = s;
    try { localStorage.setItem(DAILY_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function dayRec(s, ds) {
    var d = s.days[ds];
    if (!d || typeof d !== "object" || Array.isArray(d)) d = s.days[ds] = {};
    if (!d.acts || typeof d.acts !== "object" || Array.isArray(d.acts)) d.acts = {};
    if (!Array.isArray(d.done)) d.done = [];
    if (!d.rw || typeof d.rw !== "object" || Array.isArray(d.rw)) d.rw = {};
    return d;
  }
  function emitDaily(detail) {
    try { window.dispatchEvent(new CustomEvent("bm-daily", { detail: detail })); } catch (e) {}
  }
  function actKey(g, t) { return String(g) + ":" + String(t == null ? "" : t); }
  function missionById(id) {
    for (var i = 0; i < MISSIONS.length; i++) if (MISSIONS[i].id === id) return MISSIONS[i];
    return null;
  }
  function missionTasks(m) { return Array.isArray(m.task) ? m.task : [m.task]; }
  function missionMatches(m, g, t) {
    if (m.gameId !== g) return false;
    var ts = missionTasks(m);
    return ts.indexOf("*") >= 0 || ts.indexOf(t) >= 0;
  }
  function missionMetBy(m, acts) {
    var ts = missionTasks(m);
    for (var k in acts) {
      var i = k.indexOf(":");
      if (k.slice(0, i) === m.gameId && (ts.indexOf("*") >= 0 || ts.indexOf(k.slice(i + 1)) >= 0)) return true;
    }
    return false;
  }
  // Pure, deterministic choice: one mission per category. Each category is a
  // seeded "shuffle bag": over a cycle of N days (N = missions in that
  // category) every mission shows up once, in a date-seeded order, and the
  // same mission never appears two days in a row (also across cycles).
  function dayNum(ds) {
    var p = String(ds).split("-");
    return Math.floor(Date.UTC(+p[0], (+p[1] || 1) - 1, +p[2] || 1) / 864e5);
  }
  function bag(cat, len, cycle) {
    var idx = [], r = seed("missions|" + cat + "|" + cycle), i, j, t;
    for (i = 0; i < len; i++) idx.push(i);
    for (i = len - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    return idx;
  }
  function bagAt(cat, len, cycle) {
    var b = bag(cat, len, cycle);
    if (len >= 3) {
      var prev = bag(cat, len, cycle - 1); // raw previous bag: its last item is never swapped
      if (b[0] === prev[len - 1]) { var t = b[0]; b[0] = b[1]; b[1] = t; }
    }
    return b;
  }
  function choose(ds) {
    var n = dayNum(ds), out = [];
    MISSION_CATS.forEach(function (c) {
      var list = MISSIONS.filter(function (m) { return m.cat === c; });
      var len = list.length;
      if (!len) return;
      var cycle = Math.floor(n / len), pos = n - cycle * len;
      var k = len === 2 ? (n % 2 + hashStr(c) % 2) % 2 : bagAt(c, len, cycle)[pos];
      out.push(list[k].id);
    });
    return out;
  }
  // Today's ids are stored on first use, so a registry change in an update
  // never swaps a mission mid-day.
  function todaysIds(s, ds) {
    var d = dayRec(s, ds);
    var ok = Array.isArray(d.ms) && d.ms.length === 3 && d.ms.every(function (id) { return !!missionById(id); });
    if (!ok) d.ms = choose(ds);
    return d.ms;
  }
  function bumpStreak(s, ds) {
    var st = s.streak;
    if (st.last === ds) return;
    st.count = st.last === shiftDay(ds, -1) ? st.count + 1 : 1;
    st.last = ds;
    if (st.count > st.best) st.best = st.count;
  }
  // Award any of today's missions met by today's activity. Returns the list
  // of newly completed missions (and whether the 3/3 bonus fired).
  function settle(s, ds) {
    var d = dayRec(s, ds), ids = todaysIds(s, ds), fresh = [], bonus = false;
    ids.forEach(function (id) {
      var m = missionById(id);
      if (m && d.done.indexOf(id) < 0 && missionMetBy(m, d.acts)) { d.done.push(id); fresh.push(m); }
    });
    if (fresh.length) {
      bumpStreak(s, ds);
      addStars(MISSION_STAR * fresh.length);
      var all = ids.every(function (id) { return d.done.indexOf(id) >= 0; });
      if (all && !d.bonus) { d.bonus = 1; bonus = true; addStars(MISSION_BONUS); }
    }
    return { fresh: fresh, bonus: bonus, done: ids.filter(function (id) { return d.done.indexOf(id) >= 0; }).length };
  }

  function ensureDailyStyle() {
    if (document.getElementById("bm-daily-style")) return;
    var st = document.createElement("style");
    st.id = "bm-daily-style";
    st.textContent =
      "#bm-daily-toast{position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top));z-index:99999;display:flex;align-items:center;gap:10px;" +
      "width:max-content;max-width:calc(100vw - 24px);box-sizing:border-box;padding:9px 16px 9px 9px;border-radius:999px;background:#fff;color:#152230;" +
      "font:900 15px/1.2 'Nunito',system-ui,sans-serif;box-shadow:0 0 0 .5px rgba(21,34,48,.1),0 14px 30px -12px rgba(30,60,110,.55);" +
      "transform:translate(-50%,-140%);opacity:0;transition:transform .45s cubic-bezier(.2,.9,.25,1.25),opacity .25s;pointer-events:none}" +
      "#bm-daily-toast.show{transform:translate(-50%,0);opacity:1}" +
      "#bm-daily-toast .i{flex:0 0 36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:19px;" +
      "background:linear-gradient(135deg,#22C06E,#0A9488);color:#fff}" +
      "#bm-daily-toast.all .i{background:linear-gradient(135deg,#FFD24A,#FF8A00)}" +
      "#bm-daily-toast small{display:block;font-size:12.5px;font-weight:800;color:#5A6878}" +
      "html[data-bm-theme=classic] #bm-daily-toast,html[data-theme=dark] #bm-daily-toast{background:#1C2338;color:#F2F5FA}" +
      "html[data-bm-theme=classic] #bm-daily-toast small,html[data-theme=dark] #bm-daily-toast small{color:#AEB8C7}";
    document.head.appendChild(st);
  }
  var _dtTimer = null;
  function dailyToast(title, sub, all) {
    try {
      if (!document.body) return;
      ensureDailyStyle();
      var el = document.getElementById("bm-daily-toast");
      if (!el) {
        el = document.createElement("div");
        el.id = "bm-daily-toast";
        el.setAttribute("role", "status");
        el.innerHTML = '<span class="i"></span><span class="t"><b></b><small></small></span>';
        document.body.appendChild(el);
      }
      el.classList.toggle("all", !!all);
      el.querySelector(".i").textContent = all ? "🏆" : "✓";
      el.querySelector("b").textContent = title;
      el.querySelector("small").textContent = sub || "";
      el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
      clearTimeout(_dtTimer);
      _dtTimer = setTimeout(function () { el.classList.remove("show"); }, all ? 3400 : 2600);
    } catch (e) {}
  }
  function announce(res) {
    var en = moLang() === "en";
    var m = res.fresh[res.fresh.length - 1];
    setTimeout(function () {
      if (res.bonus) {
        dailyToast(en ? "All missions done! 🎉" : "Semua misi selesai! 🎉",
          "3/3 · +" + MISSION_BONUS + " ⭐ bonus · " + (en ? "see you tomorrow 🌙" : "sampai besok 🌙"), true);
        setTimeout(function () { react("win", { star: false, sound: false, top: true,
          message: en ? "Masha Allah, all 3 missions done! 🏆" : "Masya Allah, 3 misi selesai! 🏆" }); }, 900);
      } else {
        dailyToast((en ? "Mission done! " : "Misi selesai! ") + res.done + "/3",
          m.icon + " " + m.text[en ? "en" : "id"] + " · +" + MISSION_STAR + " ⭐");
      }
    }, 650);
  }

  var daily = {
    today: today,
    seed: seed,
    pick: pickOfDay,
    shift: shiftDay,
    mark: function (gameId, taskId) {
      try {
        if (!gameId) return false;
        var s = loadDaily(), ds = today(), d = dayRec(s, ds), k = actKey(gameId, taskId);
        var isNew = !d.acts[k];
        d.acts[k] = (parseInt(d.acts[k], 10) || 0) + 1;
        var res = settle(s, ds);
        saveDaily(s);
        emitDaily({ type: "mark", gameId: gameId, taskId: taskId, isNew: isNew, missions: res.fresh.map(function (m) { return m.id; }), done: res.done, bonus: res.bonus });
        if (res.fresh.length) { track("daily_mission", { id: res.fresh[0].id, done: res.done }); announce(res); }
        return isNew;
      } catch (e) { return false; }
    },
    did: function (gameId, taskId) {
      try {
        var acts = dayRec(loadDaily(), today()).acts;
        if (taskId != null) return !!acts[actKey(gameId, taskId)];
        for (var k in acts) if (k.indexOf(String(gameId) + ":") === 0) return true;
        return false;
      } catch (e) { return false; }
    },
    log: function (ds) {
      try {
        var s = loadDaily(), d = s.days[ds || today()], out = [];
        if (!d || !d.acts) return out;
        for (var k in d.acts) {
          var i = k.indexOf(":");
          out.push({ gameId: k.slice(0, i), taskId: k.slice(i + 1), count: parseInt(d.acts[k], 10) || 1 });
        }
        return out;
      } catch (e) { return []; }
    },
    missions: function (ds) {
      try {
        var s = loadDaily(), t = today(), day = ds || t, ids, d;
        if (day === t) {
          var before = JSON.stringify(s.days[t] || null);
          settle(s, t); // silent catch-up (e.g. registry grew mid-day)
          ids = todaysIds(s, t); d = dayRec(s, t);
          if (JSON.stringify(s.days[t]) !== before) saveDaily(s);
        } else {
          d = s.days[day] && typeof s.days[day] === "object" ? s.days[day] : { acts: {}, done: [] };
          ids = Array.isArray(d.ms) && d.ms.length === 3 && d.ms.every(missionById) ? d.ms : choose(day);
        }
        var done = Array.isArray(d.done) ? d.done : [];
        return ids.map(function (id) {
          var m = missionById(id);
          return { id: m.id, cat: m.cat, gameId: m.gameId, taskId: missionTasks(m)[0], tasks: missionTasks(m).slice(),
            url: m.url, icon: m.icon, art: "/icons/games/" + m.art + ".svg",
            text: { id: m.text.id, en: m.text.en }, game: { id: m.game.id, en: m.game.en },
            done: done.indexOf(id) >= 0 };
        });
      } catch (e) { return []; }
    },
    progress: function () {
      var ms = daily.missions(), n = ms.filter(function (m) { return m.done; }).length;
      return { done: n, total: ms.length, allDone: ms.length > 0 && n === ms.length };
    },
    streak: function () {
      try {
        var st = loadDaily().streak, t = today();
        var alive = st.last === t || st.last === shiftDay(t, -1);
        return { count: alive ? st.count : 0, best: st.best, todayDone: st.last === t };
      } catch (e) { return { count: 0, best: 0, todayDone: false }; }
    },
    reward: function (gameId, key, n) {
      try {
        var s = loadDaily(), d = dayRec(s, today()), k = actKey(gameId, key);
        if (d.rw[k]) return false;
        d.rw[k] = 1; saveDaily(s);
        addStars(n || 1);
        return true;
      } catch (e) { return false; }
    },
    rewards: { mission: MISSION_STAR, bonus: MISSION_BONUS },
    registry: function () {
      return MISSIONS.map(function (m) { return JSON.parse(JSON.stringify(m)); });
    }
  };


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
        "@media (prefers-reduced-motion:reduce){#bm-coach .c-ico{animation:none}}" +
        // short landscape phones: steps side by side, card scrolls instead of being cut off
        "@media (orientation:landscape) and (max-height:500px){#bm-coach{align-items:flex-start;overflow-y:auto;padding:12px}" +
        "#bm-coach .c-card{max-width:640px;margin:auto;padding:14px 18px 14px}#bm-coach .c-mo{width:54px;height:54px;margin:0 auto 2px}" +
        "#bm-coach h3{font-size:19px}#bm-coach .c-sub{margin-bottom:10px}#bm-coach .c-steps{flex-direction:row;gap:8px}" +
        "#bm-coach .c-step{flex:1 1 0;flex-direction:column;text-align:center;align-items:center}#bm-coach .c-go{margin-top:12px;min-height:48px}}";
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
  window.BabyMo.daily = daily;
  // Exposed for the verification harness / previews.
  window.BabyMo._resultDataURL = buildResultDataURL;
  window.BabyMo.prepareShare = prepareShare;

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
    var warm = function () { preloadPoses(); prepareShare(); };
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
