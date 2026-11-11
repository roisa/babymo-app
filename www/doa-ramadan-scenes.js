/* Baby Mo — Doa Ramadan illustrated scenes (11 du'as).
   Same engine, frame and style as doa-scenes.js (one gently animated SVG scene per du'a,
   Baby Mo standing on the ground with a contact shadow, a tap action with motion + WebAudio
   sound), registered through doaScenesExtend(). Ramadan atmosphere throughout: lanterns
   (fanous), crescent-and-star garlands, ketupat, bedug.
   Frame: x 0…400, y -120…180 (Mo's feet near y 128). Every scene is drawn in its END state;
   pre() hides / dims what the tap brings in, run() plays it (see doa-scenes.js).
   Never draws Allah, prophets or angels. Gradient ids start with "ds" (cards re-suffix them). */
(function () {
  "use strict";
  if (!window.doaScenesExtend) return;
  var EN = window.BM_LANG === "en";
  function L(a, b) { return EN ? b : a; }

  window.doaScenesExtend(function (K) {
    var lg = K.lg, rg = K.rg, f = K.f, bg = K.bg, band = K.band, shadow = K.shadow, gloss = K.gloss, cloud = K.cloud, star = K.star,
      sparkle = K.sparkle, heart = K.heart, sun = K.sun, tree = K.tree, bush = K.bush, plant = K.plant, rug = K.rug,
      windowFrame = K.windowFrame, floorShine = K.floorShine, bird = K.bird, at = K.at, burst = K.burst, say = K.say,
      pre = K.pre, geo = K.geo, run = K.run, mo = K.mo, SPRING = K.SPRING;

    /* ───────── Ramadan drawing kit ───────── */
    // a vertical gradient in frame units (so a sky can be tuned to the visible window)
    function lgu(id, stops, y1, y2) {
      return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="' + y1 + '" x2="0" y2="' + y2 + '">' +
        stops.map(function (s) { var a = s.split("@"); return '<stop offset="' + a[1] + '" stop-color="' + a[0] + '"/>'; }).join("") + "</linearGradient>";
    }
    var DEFS = rg("dsRmGlow", ["#FFE9A6~.95", "#FFC94A@.45~.45", "#FFB020~0"]) +
      lg("dsRmBrass", ["#FFE9A6", "#E8B046@.5", "#B9781C"], "h") +
      lg("dsRmGa", ["#FFF0A0", "#FFB43D"]) + lg("dsRmGb", ["#C9FFF1", "#2FC2AE"]) + lg("dsRmGc", ["#FFD6EC", "#FF6FAE"]) + lg("dsRmGd", ["#D9D2FF", "#8C7BFF"]) +
      lg("dsRmDim", ["#8C86B8", "#5A5488"]) +
      lg("dsRmKet", ["#C6EE8A", "#6DBB3E@.6", "#3E8F2A"]) + lg("dsRmKet2", ["#EAF9C9", "#A9DB72"]) +
      rg("dsRmDate", ["#C47450", "#8A3F22@.6", "#5A2412"], 0.35, 0.3, 0.8) +
      lg("dsRmWood", ["#D99B63", "#A8683A"]) + lg("dsRmWoodD", ["#B57A48", "#7E4E2A"]) +
      lg("dsRmDrum", ["#D9673A", "#A8401E@.6", "#7A2C12"]) + rg("dsRmSkin", ["#FFF6E2", "#F2DDB4@.7", "#D9B98A"], 0.4, 0.4, 0.75) +
      lg("dsRmWater", ["#EAF9FF", "#A6DCF6"]) + rg("dsRmKolak", ["#D9A060", "#A8682C"], 0.5, 0.4, 0.7) +
      lg("dsRmSack", ["#F3E3C0", "#D9BC86@.7", "#C2A06A"]) +
      lg("dsRmDome", ["#FFE58A", "#F2B232@.55", "#C98612"], "d") + lg("dsRmDomeG", ["#8FEBC0", "#1FA971@.6", "#0E7A4C"], "d") +
      lg("dsRmWall", ["#FFFFFF", "#EFE6FA"]) + lg("dsRmCloth", ["#FFFFFF", "#F1ECFF"]);

    // a crescent: lit circle r at (cx,cy) minus a circle shifted by d·r towards angle deg (the dark side)
    function crescent(cx, cy, r, d, deg, fill, cls) {
      var a = deg * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), r1 = r * 1.02, dd = d * r;
      var aa = (r * r - r1 * r1 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, r * r - aa * aa));
      var px = cx + aa * ux, py = cy + aa * uy, p1 = [px - h * uy, py + h * ux], p2 = [px + h * uy, py - h * ux];
      function sweep(c, from, via, to) {
        var t = function (p) { return Math.atan2(p[1] - c[1], p[0] - c[0]); }, T = 2 * Math.PI;
        var a1 = t(from), am = ((t(via) - a1) % T + T) % T, a2 = ((t(to) - a1) % T + T) % T;
        return am < a2 ? [a2 > Math.PI ? 1 : 0, 1] : [(T - a2) > Math.PI ? 1 : 0, 0];
      }
      var c0 = [cx, cy], c1 = [cx + dd * ux, cy + dd * uy];
      var s1 = sweep(c0, p1, [cx - r * ux, cy - r * uy], p2), s2 = sweep(c1, p2, [c1[0] - r1 * ux, c1[1] - r1 * uy], p1);
      return '<path class="' + (cls || "") + '" fill="' + (fill || "url(#dsGold)") + '" d="M' + f(p1[0]) + " " + f(p1[1]) + "A" + f(r) + " " + f(r) + " 0 " + s1[0] + " " + s1[1] + " " + f(p2[0]) + " " + f(p2[1]) +
        "A" + f(r1) + " " + f(r1) + " 0 " + s2[0] + " " + s2[1] + " " + f(p1[0]) + " " + f(p1[1]) + 'z"/>';
    }
    // a fanous lantern hanging on a string from (x, top); len = string length; glass = gradient id; dim = drawn unlit
    function lantern(x, top, len, s, glass, opt) {
      opt = opt || {};
      var y = top + len, g = "url(#" + (glass || "dsRmGa") + ")";
      var body = '<path d="M0 -2l-3 -3h6z" fill="#B9781C"/><circle cx="0" cy="-7" r="2.6" fill="none" stroke="#B9781C" stroke-width="1.4"/>' +
        '<path d="M-8 4Q0 -6 8 4z" fill="url(#dsRmBrass)"/><rect x="-10" y="3" width="20" height="3.4" rx="1.7" fill="url(#dsRmBrass)"/>' +
        '<path d="M-9 6.4h18l3 9-3 15h-18l-3-15z" fill="' + g + '"/>' +
        (opt.dim ? atOut(opt.d || 0.2, '<path d="M-9 6.4h18l3 9-3 15h-18l-3-15z" fill="url(#dsRmDim)"/>', 0.35) : "") +
        '<path d="M-3 6.4v24M3 6.4v24M-12 15.4h24" stroke="#B9781C" stroke-width="1.2" opacity=".75"/>' +
        '<path d="M-9 6.4h18l3 9-3 15h-18l-3-15z" fill="none" stroke="url(#dsRmBrass)" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M-6.5 8.5l-2 7 2 11" stroke="#fff" stroke-width="1.6" fill="none" opacity=".55" stroke-linecap="round"/>' +
        '<path d="M-8 30.4h16l-4 5h-8z" fill="url(#dsRmBrass)"/><path d="M0 35.4v6" stroke="#B9781C" stroke-width="1.4"/><circle cx="0" cy="42.6" r="2" fill="#E8B046"/>';
      var glow = '<circle cx="0" cy="18" r="30" fill="url(#dsRmGlow)"/>';
      return '<path d="M' + x + " " + top + "V" + (y - 7 * s) + '" stroke="' + (opt.cord || "#7A5A8A") + '" stroke-width="1.2"/>' +
        '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><g class="' + (opt.cls == null ? "swing" : opt.cls) + '">' +
        (opt.dim ? at("axfade", opt.d || 0.2, glow, 0.5) : '<g class="glow">' + glow + "</g>") + body + "</g></g>";
    }
    // a garland of crescents and stars along a sagging string
    function garland(x1, x2, y, sag, n, col) {
      var h = '<path d="M' + x1 + " " + y + "Q" + (x1 + x2) / 2 + " " + (y + sag * 2) + " " + x2 + " " + y + '" fill="none" stroke="' + (col || "#C9A27A") + '" stroke-width="1.5"/>';
      for (var i = 0; i < n; i++) {
        var t = (i + 0.5) / n, xx = x1 + (x2 - x1) * t, yy = y + sag * 4 * t * (1 - t);
        h += '<path d="M' + f(xx) + " " + f(yy) + "v6" + '" stroke="' + (col || "#C9A27A") + '" stroke-width="1"/>';
        h += i % 2 ? star(f(xx), f(yy + 12), 5.2, "", "url(#dsGold)") : crescent(f(xx), f(yy + 12), 6.4, 0.42, -40, "url(#dsGold)");
      }
      return '<g class="swing">' + h + "</g>";
    }
    // ketupat: a woven diamond with two ribbon tails, hanging point at (x,y)
    function ketupat(x, y, s, cls) {
      return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><g class="' + (cls || "swing") + '">' +
        '<path d="M0-14v10" stroke="#5FA53A" stroke-width="1.6"/>' +
        '<path d="M-3 22q-6 10-2 20M3 22q7 9 3 19" stroke="#7CC64E" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
        '<path d="M0-4L14 9 0 22-14 9z" fill="url(#dsRmKet)"/>' +
        '<path d="M-7 2.5l14 13M-3.5-.8l14 13M-10.5 5.8l14 13M7 2.5l-14 13M3.5-.8l-14 13M10.5 5.8l-14 13" stroke="url(#dsRmKet2)" stroke-width="2" opacity=".85"/>' +
        '<path d="M0-4L14 9 0 22-14 9z" fill="none" stroke="#3E8F2A" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<path d="M-3-0.5l-6 6" stroke="#fff" stroke-width="1.8" opacity=".55" stroke-linecap="round"/></g></g>';
    }
    // a bedug drum on its wooden stand; feet at y, centre x; the skin faces left
    function bedug(x, y, s, cls) {
      return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' + shadow(0, 0, 62, 7) +
        '<path d="M-46 0l14-46M46 0l-14-46M-40 0l-6 0M40 0l6 0" stroke="url(#dsRmWoodD)" stroke-width="7" stroke-linecap="round"/>' +
        '<rect x="-50" y="-50" width="100" height="8" rx="4" fill="url(#dsRmWoodD)"/>' +
        '<g class="' + (cls || "") + '"><rect x="-44" y="-100" width="88" height="52" rx="10" fill="url(#dsRmDrum)"/>' +
        '<path d="M-44-90h88M-44-58h88" stroke="#FFD25A" stroke-width="3"/>' +
        [-30, -15, 0, 15, 30].map(function (k) { return '<circle cx="' + k + '" cy="-90" r="1.8" fill="#FFF0A0"/><circle cx="' + k + '" cy="-58" r="1.8" fill="#FFF0A0"/>'; }).join("") +
        gloss(-44, -100, 88, 52, 10, 0.45) +
        '<ellipse cx="-44" cy="-74" rx="10" ry="27" fill="#7A2C12"/><ellipse cx="-46" cy="-74" rx="9" ry="25" fill="url(#dsRmSkin)"/>' +
        '<ellipse cx="-48" cy="-82" rx="3" ry="8" fill="#fff" opacity=".6"/></g>' +
        "</g>";
    }
    // a simple mosque: base centre x, ground y, scale s; dome = gradient id
    function mosque(x, y, s, dome, win, cls) {
      var w = win || "#FFE08A";
      return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><g class="' + (cls || "") + '">' + shadow(0, 2, 92, 7) +
        '<rect x="-74" y="-128" width="14" height="128" rx="3" fill="url(#dsRmWall)"/><path d="M-76-128q9-20 18 0z" fill="url(#' + dome + ')"/><path d="M-67-146v-8" stroke="#C98612" stroke-width="2"/>' +
        '<rect x="-76" y="-92" width="18" height="5" rx="2.5" fill="url(#' + dome + ')"/><rect x="-69.2" y="-80" width="4.4" height="9" rx="2.2" fill="' + w + '"/>' +
        '<rect x="60" y="-128" width="14" height="128" rx="3" fill="url(#dsRmWall)"/><path d="M58-128q9-20 18 0z" fill="url(#' + dome + ')"/><path d="M67-146v-8" stroke="#C98612" stroke-width="2"/>' +
        '<rect x="58" y="-92" width="18" height="5" rx="2.5" fill="url(#' + dome + ')"/><rect x="64.8" y="-80" width="4.4" height="9" rx="2.2" fill="' + w + '"/>' +
        '<rect x="-52" y="-58" width="104" height="58" rx="6" fill="url(#dsRmWall)"/><rect x="-56" y="-63" width="112" height="8" rx="4" fill="url(#' + dome + ')"/>' +
        '<path d="M-34-63C-40-92-14-104 0-120 14-104 40-92 34-63z" fill="url(#' + dome + ')"/><path d="M-22-70C-26-88-13-98-5-106" fill="none" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>' +
        '<path d="M0-120v-12" stroke="#C98612" stroke-width="2.4"/>' + crescent(1.5, -138, 5, 0.42, -30, "#F2B232") +
        '<path d="M-13 0v-26a13 13 0 0 1 26 0v26z" fill="' + w + '"/><path d="M-40-14v-14a6 6 0 0 1 12 0v14zM28-14v-14a6 6 0 0 1 12 0v14z" fill="' + w + '"/>' +
        "</g></g>";
    }
    function dates(x, y, s, n) {
      var h = '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' + shadow(0, 4, 30, 4) +
        '<path d="M-30-6h60q-4 14-30 14t-30-14z" fill="url(#dsRmBrass)"/><ellipse cx="0" cy="-6" rx="30" ry="6" fill="#F7D98A"/>';
      [[-14, -10, -20], [0, -13, 8], [13, -10, 26], [-6, -18, -6], [7, -19, 18]].slice(0, n || 5).forEach(function (p) {
        h += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="8" ry="5" transform="rotate(' + p[2] + " " + p[0] + " " + p[1] + ')" fill="url(#dsRmDate)"/>' +
          '<ellipse cx="' + (p[0] - 2) + '" cy="' + (p[1] - 2) + '" rx="3" ry="1.4" fill="#fff" opacity=".45" transform="rotate(' + p[2] + " " + p[0] + " " + p[1] + ')"/>';
      });
      return h + "</g>";
    }
    function glass(x, y, s, cls, empty) {
      return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' + shadow(0, 1, 12, 2.4) +
        '<path d="M-10-34h20l-2.4 33a2.4 2.4 0 0 1-2.4 2h-10.4a2.4 2.4 0 0 1-2.4-2z" fill="url(#dsGlass)" opacity=".55"/>' +
        (empty ? "" : '<g class="' + (cls || "") + '"><path d="M-9.2-24h18.4l-1.7 23a2 2 0 0 1-2 1.8h-11a2 2 0 0 1-2-1.8z" fill="url(#dsRmWater)"/><ellipse cx="0" cy="-24" rx="9.2" ry="1.6" fill="#fff" opacity=".8"/></g>') +
        '<path d="M-10-34h20l-2.4 33a2.4 2.4 0 0 1-2.4 2h-10.4a2.4 2.4 0 0 1-2.4-2z" fill="none" stroke="#fff" stroke-width="1.6"/>' +
        '<path d="M-6-30l-1 24" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/></g>';
    }
    function kolak(x, y, s) {
      return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' + shadow(0, 2, 26, 3.4) +
        '<path d="M-24-12h48q-2 16-24 16t-24-16z" fill="url(#dsWhite)"/><path d="M-24-12h48" stroke="#E2E8F2" stroke-width="2"/>' +
        '<ellipse cx="0" cy="-12" rx="22" ry="5" fill="url(#dsRmKolak)"/>' +
        '<circle cx="-9" cy="-13" r="3.4" fill="#FFE7A0" stroke="#E8C060" stroke-width="1"/><circle cx="4" cy="-11" r="3" fill="#FFE7A0" stroke="#E8C060" stroke-width="1"/><circle cx="11" cy="-14" r="2.6" fill="#FFE7A0" stroke="#E8C060" stroke-width="1"/>' +
        '<path d="M-6-20q-3-6 0-11M2-20q3-6 0-11M10-20q-3-6 0-11" stroke="#fff" stroke-width="1.8" fill="none" opacity=".75" class="steam"/>' +
        '<path d="M-20-8q20 8 40 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/></g>';
    }
    function gorengan(x, y, s) {
      return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' + shadow(0, 2, 26, 3) +
        '<ellipse cx="0" cy="-2" rx="26" ry="6" fill="url(#dsWhite)"/><ellipse cx="0" cy="-3" rx="21" ry="4" fill="#F2F4FA"/>' +
        '<path d="M-17-5q3-9 12-6 3 6-3 8-7 2-9-2z" fill="#E8A040"/><path d="M-4-7q6-9 14-4 2 6-5 8-8 1-9-4z" fill="#D98A2C"/><path d="M6-4q5-7 12-3 1 5-5 6-6 1-7-3z" fill="#F2B45A"/>' +
        '<path d="M-14-9l3 1M-1-10l3 1M9-7l2 1" stroke="#FFE0A0" stroke-width="1.4" stroke-linecap="round"/></g>';
    }
    // a low (lesehan) table with a cloth; top-left x, top y, width w
    function lowTable(x, y, w, cloth) {
      return shadow(x + w / 2, y + 42, w * 0.56, 7) +
        '<rect x="' + (x + 10) + '" y="' + (y + 8) + '" width="10" height="34" rx="4" fill="url(#dsRmWoodD)"/><rect x="' + (x + w - 20) + '" y="' + (y + 8) + '" width="10" height="34" rx="4" fill="url(#dsRmWoodD)"/>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="12" rx="5" fill="url(#dsRmWood)"/>' +
        (cloth ? '<path d="M' + (x + 8) + " " + (y - 1) + "h" + (w - 16) + "l4 16h" + (-(w - 8)) + 'z" fill="' + cloth + '"/><path d="M' + (x + 4) + " " + (y + 15) + "h" + (w - 8) + '" stroke="#fff" stroke-width="2" stroke-dasharray="4 4" opacity=".7"/>' : "") +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="4" rx="2" fill="#fff" opacity=".3"/>';
    }
    function wallClock(x, y, r, hh, mm, cls) {
      var ha = (hh % 12 + mm / 60) * 30, ma = mm * 6;
      return '<g transform="translate(' + x + " " + y + ')">' + shadow(0, r + 6, r * 0.7, 3) +
        '<circle r="' + (r + 4) + '" fill="url(#dsRmBrass)"/><circle r="' + r + '" fill="#fff"/>' +
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (k) { var a = k * Math.PI / 6; return '<circle cx="' + f(Math.sin(a) * r * 0.78) + '" cy="' + f(-Math.cos(a) * r * 0.78) + '" r="' + (k % 3 ? 0.9 : 1.5) + '" fill="#6A5A8A"/>'; }).join("") +
        '<path d="M0 0V' + f(-r * 0.5) + '" stroke="#2B2F3A" stroke-width="2.6" stroke-linecap="round" transform="rotate(' + ha + ')"/>' +
        '<g class="' + (cls || "") + '"><path d="M0 0V' + f(-r * 0.74) + '" stroke="#E5484D" stroke-width="1.8" stroke-linecap="round" transform="rotate(' + ma + ')"/></g>' +
        '<circle r="2.2" fill="#2B2F3A"/><ellipse cx="' + f(-r * 0.4) + '" cy="' + f(-r * 0.5) + '" rx="' + f(r * 0.3) + '" ry="' + f(r * 0.16) + '" fill="#E8F4FF" opacity=".7"/></g>';
    }
    function riceSack(x, y, s, cls) {
      return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><g class="' + (cls || "") + '">' + shadow(0, 0, 24, 4) +
        '<path d="M-20 0q-6-18 2-34 4-6 10-8h16q6 2 10 8 8 16 2 34z" fill="url(#dsRmSack)"/>' +
        '<path d="M-8-42q8 5 16 0l2-6q-10 3-20 0z" fill="#D9BC86"/><path d="M-9-41q9 4 18 0" stroke="#A8642A" stroke-width="2.2" fill="none"/>' +
        '<path d="M-10-49q4 3 4 7M10-49q-4 3-4 7" stroke="#A8642A" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
        '<g fill="#fff" stroke="#C8A877" stroke-width=".8"><ellipse cx="-5" cy="-18" rx="2.6" ry="4.4" transform="rotate(-25 -5 -18)"/><ellipse cx="2" cy="-21" rx="2.6" ry="4.4"/><ellipse cx="8" cy="-17" rx="2.6" ry="4.4" transform="rotate(25 8 -17)"/></g>' +
        '<path d="M-6-11c3 3 9 3 12 0" stroke="#8CC66A" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path d="M-14-30q-4 12 0 24" stroke="#fff" stroke-width="2.6" fill="none" opacity=".45" stroke-linecap="round"/></g></g>';
    }
    // a person image (family art) standing on the ground: centre x, feet y, height h, aspect w/h; box = visible fraction [l,t,r,b]
    function person(href, x, y, h, asp, box, cls, flip) {
      box = box || [0, 0, 1, 1];
      var ih = h / (box[3] - box[1]), iw = ih * asp, ix = x - (box[0] + box[2]) / 2 * iw, iy = y - box[3] * ih, sw = (box[2] - box[0]) * iw;
      return shadow(f(x), y, f(sw * 0.5), f(Math.max(4, sw * 0.12))) +
        '<image class="' + (cls || "") + '" href="' + href + '" x="' + f(ix) + '" y="' + f(iy) + '" width="' + f(iw) + '" height="' + f(ih) + '"' +
        (flip ? ' transform="translate(' + f(2 * x) + ' 0) scale(-1 1)"' : "") + ' preserveAspectRatio="none"/>';
    }
    function atOut(d, inner, t) { return at("axout", d, inner, t).replace("<g ", '<g opacity="0" '); }
    function sayIdle(cx, cy, text, tx, ty) {   // a bubble that is there BEFORE the tap and fades when Mo acts
      return '<g class="axout" style="--d:.05s;--t:.45s">' + say(cx, cy, text, 0, tx, ty).replace('class="axsay" style="--d:0s"', "") + "</g>";
    }
    function word(x, y, text, d, col, size, rot) {   // a bouncy sound word ("DUG!") that pops in
      return '<g class="axword" opacity="0" style="--d:' + d + 's"><text x="' + x + '" y="' + y + '" text-anchor="middle" transform="rotate(' + (rot || 0) + " " + x + " " + y + ')" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="' + (size || 20) +
        '" fill="' + (col || "#fff") + '" stroke="#5A2E10" stroke-width="3.2" paint-order="stroke" stroke-linejoin="round">' + text + "</text></g>";
    }
    function stars(list, cls) {
      return list.map(function (p, i) { return '<circle class="twinkle t' + (i % 4 + 1) + (cls ? " " + cls : "") + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (p[2] || 1.6) + '" fill="' + (p[3] || "#fff") + '"/>'; }).join("");
    }
    var SKYSTARS = [[20, -104], [64, -88, 1.2], [150, -110], [196, -84, 1.3], [240, -104, 1.1], [286, -92], [330, -112, 1.2], [376, -96], [-40, -100], [440, -90], [104, -70, 1.1], [270, -64, 1.1], [360, -60, 1.3]];
    function ramadanSky(id, top, mid, low, y1, y2) { return lgu(id, [top + "@0", mid + "@.55", low + "@1"], y1 == null ? -120 : y1, y2 == null ? 60 : y2); }

    /* ───────── the 11 scenes ───────── */
    var S = {};

    /* 1 · Melihat hilal — dusk on a hill: a thin new crescent low in the west, Mo points at it */
    S.r_hilal = {
      pose: "baby-mo-pose-15", mo: { x: 318, y: 128, h: 198 },
      svg: function () {
        return "<defs>" + DEFS + lgu("dsRhSky", ["#24206A@0", "#5B3F9E@.38", "#C46FA4@.72", "#FFB98A@1"], -125, 40) + lg("dsRhH1", ["#7E5AA6", "#5E4290"]) + lg("dsRhH2", ["#3E8F86", "#2C6E70"]) + lg("dsRhH3", ["#5DB98A", "#3C9470"]) + "</defs>" +
          bg("url(#dsRhSky)") + band(40, "#2C6E70") +
          '<g fill="#fff">' + stars(SKYSTARS) + "</g>" +
          at("axpop", 0.7, star(70, -96, 3.4, "twinkle", "#FFF3B0")) + at("axpop", 0.85, star(214, -100, 3, "twinkle t2", "#FFF3B0")) + at("axpop", 1.0, star(176, -64, 2.6, "twinkle t3", "#fff")) + at("axpop", 1.15, star(300, -104, 2.8, "twinkle t4", "#FFF3B0")) +
          // the hilal and its glow (dim before the tap)
          at("axfade", 0.35, '<circle cx="110" cy="-60" r="62" fill="url(#dsRmGlow)" class="glow"/>', 0.9) +
          '<g class="rh-moon">' + crescent(110, -60, 26, 0.34, -58, "url(#dsGold)") + "</g>" + burst(110, -60, 34, "#FFF3B0", 0.4) +
          '<g class="rh-cloud" opacity="0">' + cloud(116, -54, 0.8, "", 0.95, "#B48BC8") + "</g>" +
          bird(250, -56, 0.8, "#3A2A5A") + bird(272, -46, 0.6, "#3A2A5A", "k2") +
          // far hills with a little town and its mosque
          '<path d="M-800 18Q-100-6 0 10Q90-10 170 4Q260-12 330 2Q380-8 420 0Q700-14 1200 6V300H-800Z" fill="url(#dsRhH1)"/>' +
          '<g fill="#4A2F78"><rect x="28" y="-16" width="44" height="22" rx="3"/><path d="M32-16a18 18 0 0 1 36 0z"/><rect x="78" y="-42" width="7" height="48" rx="2.5"/><path d="M76-42l5.5-10 5.5 10z"/><path d="M50-34v-7" stroke="#4A2F78" stroke-width="1.6"/>' +
          '<rect x="164" y="-6" width="30" height="16" rx="2"/><path d="M160-6l19-12 19 12z"/><rect x="214" y="-2" width="24" height="12" rx="2"/><path d="M211-2l15-9 15 9z"/></g>' +
          '<g fill="#FFD87A"><rect x="45" y="-8" width="9" height="12" rx="4.5"/><rect class="glow" x="170" y="0" width="6" height="6" rx="1"/><rect class="glow" x="182" y="0" width="6" height="6" rx="1"/><rect class="glow" x="222" y="2" width="6" height="5" rx="1"/></g>' +
          '<path d="M-800 40Q-100 20 0 34Q120 14 240 30Q330 18 420 28Q700 14 1200 30V300H-800Z" fill="url(#dsRhH2)"/>' +
          // Mo's hill
          '<path d="M-800 90Q-60 70 60 96Q190 118 300 112Q380 108 460 98Q800 80 1200 96V300H-800Z" fill="url(#dsRhH3)"/>' + floorShine(300) +
          // a little telescope, and a string of lanterns on two bamboo poles
          '<g transform="translate(214 116)">' + shadow(0, 0, 24, 4) + '<path d="M0-30l-12 30M0-30l12 30M0-30v30" stroke="#6A5A8A" stroke-width="3" stroke-linecap="round"/>' +
          '<g transform="rotate(-30 0 -32)"><rect x="-26" y="-39" width="46" height="13" rx="5" fill="#4FA8E8"/><rect x="-32" y="-41" width="10" height="17" rx="3" fill="#2D7BC0"/><rect x="-22" y="-36" width="34" height="3" rx="1.5" fill="#fff" opacity=".5"/></g></g>' +
          '<path d="M-6 120V-58" stroke="#C99A5A" stroke-width="5" stroke-linecap="round"/><path d="M-6-58Q90-30 170-70" fill="none" stroke="#7A5A8A" stroke-width="1.2"/>' +
          lantern(40, -46, 22, 0.62, "dsRmGa", {}) + lantern(92, -42, 30, 0.62, "dsRmGc", {}) + lantern(140, -56, 22, 0.62, "dsRmGb", {}) +
          bush(10, 116, 0.8, true) + bush(410, 110, 0.9, true) +
          '<g fill="#FFF3B0">' + stars([[150, 60, 1.6], [96, 80, 1.4], [260, 70, 1.6], [24, 64, 1.3]]) + "</g>";
      },
      fx: function (card) { return card ? "" : say(204, -28, L("Itu hilal!", "There's the hilal!"), 0.95, 280, -14); }
    };

    /* 2 · Niat puasa — sahur before dawn: a low table, a lantern lights up, steam rises */
    S.r_niat = {
      pose: "baby-mo-pose-06", mo: { x: 318, y: 130, h: 128 },
      svg: function () {
        return "<defs>" + DEFS + lg("dsRnWall", ["#6E66C8", "#4E4AA6"]) + lgu("dsRnSky", ["#141A4A@0", "#2C2C7A@.6", "#5A4AA0@1"], -110, -10) + lg("dsRnFl", ["#B48A6A", "#8E6648"]) +
          '<pattern id="dsRnPat" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M20 8l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" fill="#8C84E0" opacity=".45"/></pattern></defs>' +
          bg("url(#dsRnWall)") + bg("url(#dsRnPat)") +
          windowFrame("dsRnWin", 22, -104, 112, 86, 18,
            '<rect x="22" y="-104" width="112" height="86" fill="url(#dsRnSky)"/>' + crescent(104, -78, 12, 0.36, -40, "url(#dsGold)") +
            '<g fill="#fff">' + stars([[40, -92, 1.4], [64, -70, 1.1], [86, -96, 1.2], [122, -50, 1.2], [44, -54, 1]]) + "</g>" +
            '<g fill="#2A1F5A"><rect x="40" y="-36" width="34" height="20" rx="2"/><path d="M44-36a13 13 0 0 1 26 0z"/><rect x="80" y="-54" width="6" height="38" rx="2"/><rect x="96" y="-30" width="40" height="14"/></g>' +
            '<g fill="#FFD87A"><rect x="54" y="-28" width="6" height="9" rx="3"/><rect x="102" y="-25" width="5" height="5"/><rect x="114" y="-25" width="5" height="5"/></g>', "#9C94E8") +
          wallClock(186, -78, 20, 4, 0) +
          garland(222, 400, -112, 12, 7) +
          band(40, "url(#dsRnFl)") + floorShine(40) +
          rug(196, 112, 168, 18, "#C96A8A", "#FFD0DE") +
          lowTable(80, 66, 176, "#FFF4E2") +
          // sahur: rice with an egg, dates, milk, and the lantern that lights up
          '<g transform="translate(118 66)">' + shadow(0, 0, 24, 3) + '<ellipse cx="0" cy="-2" rx="24" ry="6" fill="url(#dsWhite)"/><path d="M-16-4q16-18 32 0z" fill="#FFFFFF"/><path d="M-16-4q16-18 32 0" fill="none" stroke="#E6ECF5"/>' +
          '<ellipse cx="4" cy="-9" rx="7" ry="4.6" fill="#fff" stroke="#F2E2B8"/><circle cx="4" cy="-9" r="2.8" fill="#FFC23D"/>' +
          at("axfade", 0.8, '<path class="steam" d="M-6-18q-3-6 0-12" stroke="#fff" stroke-width="2" fill="none"/><path class="steam s2" d="M2-20q3-6 0-12" stroke="#fff" stroke-width="2" fill="none"/><path class="steam s3" d="M10-18q-3-6 0-12" stroke="#fff" stroke-width="2" fill="none"/>') + "</g>" +
          dates(176, 66, 0.62, 4) +
          '<g transform="translate(212 66)">' + glass(0, 0, 0.8).replace(/url\(#dsRmWater\)/g, "#FFF8EC") + "</g>" +
          lantern(246, 6, 26, 0.9, "dsRmGa", { dim: true, d: 0.15, cls: "", cord: "transparent" }) +
          // the dark of night before the lamp goes on
          atOut(0.15, '<rect x="-800" y="-900" width="2000" height="1500" fill="#120C3A" opacity=".38"/>', 0.7) +
          plant(-40, 52, 1.05, "sway") + plant(440, 52, 1.05, "");
      },
      fx: function (card) { return card ? "" : say(232, -18, L("Aku niat puasa!", "I intend to fast!"), 0.9, 300, 30); }
    };

    /* 3 · Inni sha'im — a sunny fasting day: a friend teases with ice cream, Mo stays calm */
    S.r_shaim = {
      pose: "baby-mo-pose-14", mo: { x: 318, y: 128, h: 196 },
      svg: function () {
        return "<defs>" + DEFS + lgu("dsRsSky", ["#62BFF5@0", "#A9DEFF@.6", "#E8F7FF@1"], -120, 30) + lg("dsRsGr", ["#9EDC7A", "#62B45A"]) + lg("dsRsFence", ["#FFF6E6", "#EAD7B8"]) + "</defs>" +
          bg("url(#dsRsSky)") +
          sun(352, -84, 18, true) + cloud(70, -86, 0.7, "drift slow") + cloud(250, -98, 0.55, "drift d2") +
          garland(-10, 410, -116, 14, 9, "#A9864F") +
          // a banner on the fence: Marhaban ya Ramadan
          band(16, "url(#dsRsGr)") +
          '<g>' + [10, 50, 90, 130, 170, 210, 250, 290, 330, 370].map(function (x) { return '<rect x="' + (x - 4) + '" y="-30" width="8" height="52" rx="3" fill="url(#dsRsFence)"/><path d="M' + (x - 4) + " -30l4-6 4 6z" + '" fill="#EAD7B8"/>'; }).join("") +
          '<rect x="-20" y="-20" width="440" height="7" rx="3.5" fill="url(#dsRsFence)"/><rect x="-20" y="4" width="440" height="7" rx="3.5" fill="url(#dsRsFence)"/></g>' +
          '<g class="sway" style="transform-origin:50% 0"><path d="M40-34L52-62M240-34L228-62" stroke="#A9864F" stroke-width="1.5"/><rect x="26" y="-70" width="228" height="36" rx="10" fill="#1FA971"/><rect x="30" y="-66" width="220" height="28" rx="7" fill="none" stroke="#FFE08A" stroke-width="1.5" stroke-dasharray="5 4"/>' +
          '<text x="140" y="-46" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="15" fill="#FFF6D0">Marhaban ya Ramadan</text>' + crescent(42, -52, 7, 0.4, -40, "#FFE08A") + star(238, -52, 5, "", "#FFE08A") + "</g>" +
          tree(380, 30, 0.9) + tree(-20, 34, 1) +
          band(40, "url(#dsRsGr)") + floorShine(40) +
          '<path d="M-800 70Q100 60 200 74T1200 70V300H-800Z" fill="#7ECB66" opacity=".55"/>' +
          // the bench with the tempting treats (the friend is just off to the left)
          shadow(110, 110, 70, 7) + '<rect x="42" y="68" width="136" height="12" rx="6" fill="url(#dsRmWood)"/><rect x="52" y="80" width="8" height="30" rx="3" fill="url(#dsRmWoodD)"/><rect x="160" y="80" width="8" height="30" rx="3" fill="url(#dsRmWoodD)"/>' +
          '<rect x="46" y="50" width="128" height="10" rx="5" fill="url(#dsRmWood)"/><rect x="58" y="58" width="6" height="12" fill="url(#dsRmWoodD)"/><rect x="156" y="58" width="6" height="12" fill="url(#dsRmWoodD)"/>' +
          // ice cream cone + an iced drink
          '<g transform="translate(92 68)"><path d="M-7-12l7 20 7-20z" fill="#E8B060"/><path d="M-5-9l8 6M-2-12l7 7M-6-4l5 4" stroke="#C98A40" stroke-width="1"/><circle cx="-3" cy="-16" r="7" fill="#FFB0C8"/><circle cx="4" cy="-17" r="6.4" fill="#FFF0C0"/><circle cx="0" cy="-23" r="6" fill="#B78A6A"/><circle cx="-2" cy="-26" r="1.6" fill="#fff" opacity=".7"/></g>' +
          '<g transform="translate(134 68)">' + glass(0, 0, 0.78).replace(/url\(#dsRmWater\)/g, "#FF9AB8") + '<path d="M3-32l7-14" stroke="#4FA8E8" stroke-width="2.4" stroke-linecap="round"/><rect x="-5" y="-22" width="6" height="6" rx="1" fill="#fff" opacity=".8"/></g>' +
          // a calm glow around Mo after he answers
          at("axfade", 0.45, '<circle class="glow" cx="318" cy="22" r="96" fill="url(#dsHalo)" opacity=".7"/>', 0.8) +
          bush(250, 120, 0.7, true) + bush(-30, 118, 0.9, true) + bush(440, 116, 0.9, false);
      },
      fx: function (card) {
        if (card) return "";
        return sayIdle(110, -2, L("Ayo makan es krim!", "Come on, eat ice cream!"), 20, 30) +
          say(198, 6, L("Aku sedang puasa!", "I'm fasting!"), 0.35, 284, -16) +
          [[262, -34, 0.6, 0.6], [372, -40, 0.7, 0.75], [252, 30, 0.5, 0.9], [384, 20, 0.55, 1.05]].map(function (p) { return '<g class="axpop" style="--d:' + p[3] + 's">' + sparkle(p[0], p[1], p[2], "twinkle", "#FFE08A") + "</g>"; }).join("") +
          '<g class="axpop" style="--d:1.1s">' + heart(372, -64, 0.6, "url(#dsPink)", "float") + "</g>";
      }
    };

    /* 4 · Doa berbuka — maghrib: the sun sets in the window, the bedug booms, the lanterns light up */
    S.r_buka = {
      pose: "baby-mo-pose-12", mo: { x: 322, y: 132, h: 130 },
      svg: function () {
        return "<defs>" + DEFS + lg("dsRbWall", ["#FFE3CC", "#F7C6B4"]) + lgu("dsRbSky", ["#7A5AC8@0", "#E58AB0@.5", "#FFC07A@1"], -110, -14) + lg("dsRbFl", ["#E6B48A", "#C98E62"]) +
          '<pattern id="dsRbPat" width="44" height="44" patternUnits="userSpaceOnUse">' + "" + '<circle cx="10" cy="10" r="2" fill="#FFB89A" opacity=".5"/><circle cx="32" cy="32" r="2" fill="#FFB89A" opacity=".5"/></pattern></defs>' +
          bg("url(#dsRbWall)") + bg("url(#dsRbPat)") +
          windowFrame("dsRbWin", 16, -106, 150, 92, 18,
            '<rect x="16" y="-106" width="150" height="92" fill="url(#dsRbSky)"/>' +
            '<g class="rb-sun"><circle cx="70" cy="-44" r="26" fill="url(#dsHalo)"/><circle cx="70" cy="-44" r="13" fill="url(#dsSun)"/></g>' +
            '<path d="M16-30Q60-40 100-30T166-32V-14H16Z" fill="#9A5A9A"/>' + mosque(112, -20, 0.32, "dsRmDome", "#7A3E7A", "") +
            at("axfade", 0.7, mosque(112, -20, 0.32, "dsRmDome", "#FFE08A", "")) +
            at("axpop", 1.5, star(36, -90, 2.6, "twinkle", "#fff")) + at("axpop", 1.7, star(148, -94, 2.2, "twinkle t2", "#fff")) +
            word(66, -64, "DUG!", 0.25, "#FFE08A", 15, -10) + word(140, -70, "DUG!", 0.75, "#FFE08A", 15, 8), "#fff") +
          wallClock(200, -84, 18, 6, 0, "rb-min") +
          lantern(246, -120, 34, 0.86, "dsRmGa", { dim: true, d: 0.9 }) + lantern(296, -120, 22, 0.8, "dsRmGc", { dim: true, d: 1.05 }) + lantern(352, -120, 40, 0.86, "dsRmGb", { dim: true, d: 1.2 }) +
          band(40, "url(#dsRbFl)") + floorShine(40) +
          rug(220, 112, 170, 18, "#7E9CE0", "#DCE6FF") +
          lowTable(72, 70, 196, "#FFFFFF") +
          dates(108, 70, 0.6, 5) + glass(146, 70, 0.78) + kolak(190, 70, 0.72) + gorengan(240, 72, 0.62) +
                    plant(-46, 52, 1.05, "sway") + plant(446, 52, 1, "");
      },
      fx: function (card) { return card ? "" : say(240, -40, L("Waktunya berbuka!", "Time for iftar!"), 1.25, 306, 20); }
    };

    /* 5 · Sesudah berbuka — a date and a glass of water: nom, gulp, Alhamdulillah */
    S.r_after = {
      pose: "baby-mo-pose-36", mo: { x: 314, y: 130, h: 132 },
      svg: function () {
        return "<defs>" + DEFS + lg("dsRaWall", ["#FFE9D2", "#FFD2BE"]) + lgu("dsRaSky", ["#3E3A9A@0", "#8A5AB8@.6", "#E88AA8@1"], -110, -20) + lg("dsRaFl", ["#E9BC92", "#CF9468"]) + "</defs>" +
          bg("url(#dsRaWall)") +
          '<g opacity=".5">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (k) { return '<path d="M' + (k * 48 - 20) + ' -120v300" stroke="#FFC9B0" stroke-width="10"/>'; }).join("") + "</g>" +
          windowFrame("dsRaWin", 236, -108, 120, 78, 16,
            '<rect x="236" y="-108" width="120" height="78" fill="url(#dsRaSky)"/>' + crescent(318, -84, 10, 0.34, -40, "url(#dsGold)") +
            '<g fill="#fff">' + stars([[252, -96, 1.2], [282, -74, 1], [346, -60, 1.1], [262, -50, 1]]) + "</g>" + '<path d="M236-38Q280-48 320-40T356-42V-30H236Z" fill="#5A3A80"/>', "#fff") +
          garland(-10, 220, -112, 14, 6) +
          lantern(40, -120, 40, 0.86, "dsRmGc", {}) + lantern(92, -120, 22, 0.8, "dsRmGa", {}) + lantern(150, -120, 46, 0.86, "dsRmGb", {}) +
          band(40, "url(#dsRaFl)") + floorShine(40) +
          rug(200, 114, 180, 18, "#F2A23A", "#FFE3A0") +
          lowTable(46, 72, 200, "#FFF6EA") +
          kolak(84, 72, 0.8) +
          // the plate of dates: one date flies to Mo
          '<g transform="translate(150 72) scale(.82)">' + shadow(0, 4, 30, 4) + '<path d="M-30-6h60q-4 14-30 14t-30-14z" fill="url(#dsRmBrass)"/><ellipse cx="0" cy="-6" rx="30" ry="6" fill="#F7D98A"/>' +
          '<ellipse cx="-14" cy="-10" rx="8" ry="5" transform="rotate(-20 -14 -10)" fill="url(#dsRmDate)"/><ellipse cx="0" cy="-13" rx="8" ry="5" transform="rotate(8 0 -13)" fill="url(#dsRmDate)"/><ellipse cx="13" cy="-10" rx="8" ry="5" transform="rotate(26 13 -10)" fill="url(#dsRmDate)"/></g>' +
          '<g class="ra-date" opacity="0"><ellipse cx="156" cy="52" rx="7" ry="4.4" transform="rotate(-10 156 52)" fill="url(#dsRmDate)"/><ellipse cx="154" cy="50" rx="2.6" ry="1.2" fill="#fff" opacity=".5"/></g>' +
          // the big glass of water: it empties
          '<g transform="translate(214 72) scale(1.05)">' + shadow(0, 1, 12, 2.4) +
          '<path d="M-10-34h20l-2.4 33a2.4 2.4 0 0 1-2.4 2h-10.4a2.4 2.4 0 0 1-2.4-2z" fill="url(#dsGlass)" opacity=".55"/>' +
          '<g class="ra-water"><path d="M-9.2-26h18.4l-1.7 25a2 2 0 0 1-2 1.8h-11a2 2 0 0 1-2-1.8z" fill="url(#dsRmWater)"/></g>' +
          '<path d="M-10-34h20l-2.4 33a2.4 2.4 0 0 1-2.4 2h-10.4a2.4 2.4 0 0 1-2.4-2z" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M-6-30l-1 24" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/></g>' +
          word(268, -20, L("Nyam!", "Nom!"), 0.55, "#FFE08A", 15, -8) + word(240, -50, L("Glek!", "Gulp!"), 1.15, "#BFE8FF", 15, 6) + word(270, -78, L("Glek!", "Gulp!"), 1.4, "#BFE8FF", 13, -4) +
          plant(-40, 52, 1, "sway") + plant(440, 52, 1, "");
      },
      fx: function (card) { return card ? "" : say(206, -18, L("Alhamdulillah, segar!", "Alhamdulillah, refreshing!"), 1.75, 290, 6) + burst(214, 50, 22, "#BFE8FF", 1.55); }
    };

    /* 6 · Untuk tuan rumah — a buka bersama: Umi welcomes the guests, Mo thanks her */
    S.r_host = {
      pose: "baby-mo-thank-you", mo: { x: 324, y: 128, h: 150 },
      svg: function () {
        return "<defs>" + DEFS + rg("dsRhWarm", ["#FFF7E4", "#FFE7D6@.6", "#F5E2FF"], 0.45, 0.4, 0.9) + lg("dsRhFl", ["#F0CFA8", "#DDB088"]) + lg("dsRhCl", ["#FFFFFF", "#FFEFF6"]) + "</defs>" +
          bg("url(#dsRhWarm)") +
          garland(-10, 410, -116, 16, 10) +
          '<g transform="translate(206 -62)"><g class="float">' + crescent(0, 0, 22, 0.38, -40, "url(#dsGold)") + star(18, -6, 6, "twinkle", "#FFE08A") + "</g></g>" +
          lantern(26, -120, 30, 0.8, "dsRmGb", {}) + lantern(380, -120, 36, 0.8, "dsRmGc", {}) +
          band(40, "url(#dsRhFl)") + floorShine(40) +
          // Umi, the host, behind a long table full of iftar food
          person("family/umi-welcome.webp", 98, 60, 168, 173 / 420, [0, 0, 1, 1], "rh-umi") +
          shadow(176, 108, 150, 9) +
          '<rect x="34" y="62" width="10" height="44" rx="4" fill="url(#dsRmWoodD)"/><rect x="262" y="62" width="10" height="44" rx="4" fill="url(#dsRmWoodD)"/>' +
          '<rect x="22" y="50" width="262" height="14" rx="6" fill="url(#dsRmWood)"/><path d="M28 48h250l6 22H22z" fill="url(#dsRhCl)"/><path d="M26 70h256" stroke="#FFB0C8" stroke-width="3" stroke-dasharray="6 5"/>' +
          dates(58, 52, 0.56, 5) + kolak(108, 52, 0.66) + gorengan(160, 54, 0.58) + glass(200, 52, 0.66) + glass(222, 52, 0.66).replace(/url\(#dsRmWater\)/g, "#FFB36B") +
          '<g transform="translate(256 52)">' + shadow(0, 2, 20, 3) + '<path d="M-18-12h36q-2 14-18 14t-18-14z" fill="url(#dsGlass)" opacity=".8"/><ellipse cx="0" cy="-12" rx="18" ry="4" fill="#FF8FB0"/><circle cx="-6" cy="-13" r="2.6" fill="#9BE07F"/><circle cx="4" cy="-12" r="2.4" fill="#FFD25A"/><circle cx="10" cy="-14" r="2" fill="#FF6B8A"/></g>' +
          heart(150, -50, 0.5, "#FFB0C4", "float2") + sparkle(260, -20, 0.6, "twinkle", "#FFC94A") +
          plant(-48, 52, 1.05, "sway") + plant(446, 52, 1.05, "sway");
      },
      fx: function (card) {
        if (card) return "";
        return say(208, -30, L("Terima kasih, Umi!", "Thank you, Umi!"), 0.15, 290, -14) +
          [[264, -40, 0.8, 0.5], [236, -60, 0.6, 0.7], [210, -36, 0.55, 0.85], [180, -66, 0.6, 1.0], [150, -40, 0.7, 1.15]].map(function (h) { return '<g class="axpop" style="--d:' + h[3] + 's">' + heart(h[0], h[1], h[2], "url(#dsPink)", "float2") + "</g>"; }).join("") +
          [[60, 20], [108, 22], [160, 24], [204, 18], [256, 20]].map(function (p, i) { return '<g class="axpop" style="--d:' + f(1.2 + i * 0.08) + 's">' + sparkle(p[0], p[1], 0.55, "twinkle", "#FFE08A") + "</g>"; }).join("");
      }
    };

    /* 7 · Dzikir sesudah witir — the mosque at night: three lanterns light up, one for each dhikr */
    S.r_witr = {
      pose: "baby-mo-dua-smile", mo: { x: 322, y: 130, h: 190 },
      svg: function () {
        return "<defs>" + DEFS + ramadanSky("dsRwSky", "#10154A", "#2A2E7E", "#4A3E9A") + lg("dsRwYard", ["#4B4796", "#37337A"]) + lg("dsRwTile", ["#5A56A8", "#433F8E"]) + "</defs>" +
          bg("url(#dsRwSky)") +
          '<g fill="#fff">' + stars(SKYSTARS) + "</g>" + crescent(352, -94, 13, 0.36, -40, "url(#dsGold)") +
          '<circle cx="352" cy="-94" r="36" fill="url(#dsRmGlow)" opacity=".6"/>' +
          '<path d="M-800-6Q0-20 140-8T420-10Q800-20 1200-6V300H-800Z" fill="#2E2A72"/>' +
          mosque(150, 40, 0.98, "dsRmDomeG", "#FFE08A", "") +
          '<circle class="glow" cx="150" cy="16" r="40" fill="url(#dsRmGlow)" opacity=".7"/>' +
          band(40, "url(#dsRwYard)") + floorShine(40) +
          '<g opacity=".35">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (k) { return '<path d="M' + (k * 56 - 40) + ' 40L' + (k * 76 - 140) + ' 180" stroke="#7E78D0" stroke-width="2"/>'; }).join("") + '<path d="M-800 80H1200M-800 130H1200" stroke="#7E78D0" stroke-width="2"/></g>' +
          // a porch beam with three lanterns that light up one by one (× 3 dhikr)
          '<path d="M-10-112Q200-96 410-112" fill="none" stroke="#B9781C" stroke-width="2"/>' +
          lantern(36, -108, 46, 0.9, "dsRmGa", { dim: true, d: 0.25 }) + lantern(260, -104, 38, 0.9, "dsRmGc", { dim: true, d: 0.95 }) + lantern(392, -110, 50, 0.9, "dsRmGb", { dim: true, d: 1.65 }) +
          garland(60, 230, -100, 10, 6) +
          bush(-30, 70, 1, false) + bush(250, 64, 0.7, false) + tree(-80, 60, 1.1) + tree(470, 60, 1.1);
      },
      fx: function (card) {
        if (card) return "";
        return [0.25, 0.95, 1.65].map(function (d, i) {
          var x = 196 + i * 32;
          return burst(x, -40, 14, "#FFE08A", d) + '<g class="axpop" style="--d:' + d + 's"><circle cx="' + x + '" cy="-40" r="13" fill="#FFE08A"/><circle cx="' + x + '" cy="-40" r="13" fill="none" stroke="#B9781C" stroke-width="2"/>' +
            '<text x="' + x + '" y="-35" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="15" fill="#7A4A00">' + (i + 1) + "</text></g>";
        }).join("");
      }
    };

    /* 8 · Lailatul Qadar — a calm, starry night on the rooftop; Mo and Ais make du'a */
    S.r_qadr = {
      pose: "baby-mo-pose-12", mo: { x: 324, y: 132, h: 122 },
      svg: function () {
        var sky = "";
        for (var i = 0; i < 46; i++) { var x = (i * 89) % 520 - 60, y = -118 + ((i * 53) % 112); sky += '<circle class="twinkle t' + (i % 4 + 1) + '" cx="' + x + '" cy="' + y + '" r="' + (i % 5 ? 1.2 : 2) + '" fill="' + (i % 3 ? "#fff" : "#FFF3B0") + '"/>'; }
        return "<defs>" + DEFS + ramadanSky("dsRqSky", "#0B1038", "#1E2466", "#3A3488", -120, 40) + lg("dsRqRoof", ["#6A5AA8", "#4E428C"]) + lgu("dsRqBand", ["#8C7BFF00@0", "#B9A8FF55@.5", "#8C7BFF00@1"], -100, -20) + "</defs>" +
          bg("url(#dsRqSky)") +
          '<path d="M-200-20Q100-130 600-100" stroke="url(#dsRqBand)" stroke-width="60" fill="none" opacity=".7"/>' +
          '<g fill="#fff">' + sky + "</g>" +
          '<circle class="glow" cx="80" cy="-74" r="44" fill="url(#dsRmGlow)" opacity=".55"/><circle cx="80" cy="-74" r="15" fill="#FFF6D6"/><circle cx="74" cy="-78" r="4" fill="#F2E6BE" opacity=".7"/><circle cx="86" cy="-68" r="2.6" fill="#F2E6BE" opacity=".7"/>' +
          // the night grows even calmer and brighter after the tap
          [[150, -100], [214, -76], [270, -108], [340, -84], [30, -40], [380, -40], [180, -30]].map(function (p, i) { return at("axpop", f(0.3 + i * 0.16), sparkle(p[0], p[1], 0.7, "twinkle t" + (i % 4 + 1), "#FFF3B0")); }).join("") +
          at("axfade", 0.25, '<rect x="-800" y="-900" width="2000" height="1500" fill="#8C7BFF" opacity=".12"/>', 1.4) +
          // town silhouette, rooftop railing with small lanterns
          '<g fill="#161B4E"><rect x="-40" y="-10" width="60" height="50"/><rect x="30" y="-28" width="44" height="68"/><rect x="250" y="-16" width="50" height="56"/><rect x="306" y="-4" width="70" height="44"/><rect x="380" y="-24" width="40" height="64"/>' +
          '<rect x="150" y="-34" width="8" height="74"/><path d="M146-34l8-12 8 12z"/><path d="M120 4a34 34 0 0 1 68 0v36h-68z"/></g>' +
          '<g fill="#FFD87A" opacity=".85"><rect x="40" y="-16" width="5" height="6"/><rect x="56" y="-2" width="5" height="6"/><rect x="262" y="-4" width="5" height="6"/><rect x="320" y="8" width="5" height="6"/><rect x="390" y="-12" width="5" height="6"/><rect x="146" y="16" width="16" height="22" rx="8"/></g>' +
          band(40, "url(#dsRqRoof)") + floorShine(40) +
          '<g fill="none" stroke="#8C7BD8" stroke-width="3"><path d="M-800 34H1200"/>' + [-20, 30, 80, 130, 180, 230, 280, 330, 380, 430].map(function (x) { return '<path d="M' + x + ' 34v-30"/>'; }).join("") + '<path d="M-800 4H1200"/></g>' +
          lantern(20, 4, 6, 0.6, "dsRmGa", { cls: "", cord: "transparent" }) + lantern(400, 4, 6, 0.6, "dsRmGc", { cls: "", cord: "transparent" }) +
          // two prayer mats
          '<g transform="translate(272 118)"><path d="M-120 0l26-30h196l26 30z" fill="#2FA37A"/><path d="M-108-4l20-22h176l20 22z" fill="none" stroke="#FFE08A" stroke-width="2"/><path d="M-40-26q20-16 40 0" fill="none" stroke="#FFE08A" stroke-width="2"/><path d="M40-26q20-16 40 0" fill="none" stroke="#FFE08A" stroke-width="2"/></g>' +
          person("ais-garden/dua-hands-closed.webp", 242, 132, 126, 1, [0.327, 0.33, 0.673, 0.907], "") +
          plant(-44, 60, 1, "") + plant(450, 60, 1, "");
      }
    };

    /* 9 · Niat zakat fitrah — the zakat corner at the mosque: Mo's rice sack slides over */
    S.r_zakat = {
      pose: "baby-mo-pose-15", mo: { x: 330, y: 128, h: 196 },
      svg: function () {
        return "<defs>" + DEFS + lgu("dsRzSky", ["#7CCBF5@0", "#BCE6FF@.6", "#FFF2DA@1"], -120, 30) + lg("dsRzYard", ["#F2E2C6", "#E2CCA6"]) + lg("dsRzRoof", ["#2FB577", "#1A8A58"]) + "</defs>" +
          bg("url(#dsRzSky)") + cloud(300, -96, 0.6, "drift slow") + cloud(60, -100, 0.5, "drift d2") +
          mosque(260, 30, 0.8, "dsRmDomeG", "#BFE3F5", "") +
          band(30, "url(#dsRzYard)") + floorShine(30) +
          '<path d="M-800 70H1200" stroke="#D6BE94" stroke-width="2" opacity=".6"/>' +
          // the zakat booth: a small roofed stall with a sign, baskets and sacks behind
          shadow(100, 110, 96, 8) +
          '<rect x="16" y="-60" width="8" height="166" rx="3" fill="url(#dsRmWoodD)"/><rect x="176" y="-60" width="8" height="166" rx="3" fill="url(#dsRmWoodD)"/>' +
          '<path d="M0-58L100-94 200-58z" fill="url(#dsRzRoof)"/><path d="M0-58h200" stroke="#0E6A42" stroke-width="4" stroke-linecap="round"/>' +
          '<path d="M6-58q16 12 32 0q16 12 32 0q16 12 32 0q16 12 32 0q16 12 32 0q16 12 32 0" fill="#FFE08A"/>' +
          '<rect x="40" y="-44" width="120" height="30" rx="8" fill="#fff" stroke="#1FA971" stroke-width="2.4"/>' +
          '<text x="100" y="-24" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="' + (EN ? 13 : 15) + '" fill="#0E7A4C">' + L("Zakat Fitrah", "Zakat al-Fitr") + "</text>" +
          riceSack(46, 52, 0.72) + riceSack(82, 50, 0.8) + riceSack(118, 52, 0.7) +
          '<rect x="20" y="52" width="160" height="12" rx="5" fill="url(#dsRmWood)"/><rect x="26" y="64" width="148" height="44" rx="4" fill="url(#dsRmWoodD)"/><path d="M26 86h148" stroke="#6A3E20" stroke-width="2" opacity=".5"/>' +
          '<g transform="translate(100 -108)">' + crescent(0, 0, 8, 0.4, -40, "#FFE08A") + "</g>" +
          lantern(36, -58, 16, 0.6, "dsRmGa", {}) + lantern(164, -58, 16, 0.6, "dsRmGc", {}) +
          // Mo's own sack slides onto the booth table
          riceSack(254, 126, 0.86, "rz-sack") +
          at("axpop", 1.15, sparkle(176, 4, 0.8, "twinkle", "#FFE08A")) + at("axpop", 1.25, sparkle(140, 14, 0.6, "twinkle t2", "#FFE08A")) + burst(158, 30, 26, "#FFE08A", 1.1) +
          bush(-30, 118, 0.9, true) + bush(440, 116, 0.9, true) + tree(-60, 40, 1);
      },
      fx: function (card) {
        if (card) return "";
        return say(222, -30, L("Ini zakatku!", "Here's my zakat!"), 0.1, 296, -14) +
          '<g class="axpop" style="--d:1.3s">' + heart(150, -2, 0.8, "url(#dsPink)", "float2") + "</g>" + '<g class="axpop" style="--d:1.45s">' + heart(180, -24, 0.55, "#FF8FB0", "float") + "</g>";
      }
    };

    /* 10 · Ucapan Idul Fitri — Eid morning: ketupat at the door, the family together, a big hug */
    S.r_eid_greet = {
      pose: "baby-mo-pose-41", mo: { x: 338, y: 130, h: 124 },
      svg: function () {
        return "<defs>" + DEFS + lgu("dsReSky", ["#7FD0FF@0", "#C6ECFF@.6", "#FFF6E0@1"], -120, 30) + lg("dsReWall", ["#FFF8EE", "#F6E6D2"]) + lg("dsReGr", ["#A6E08A", "#6CC06A"]) + lg("dsReDoor", ["#3FB58A", "#1E8A64"]) + "</defs>" +
          bg("url(#dsReSky)") + sun(372, -96, 15, true) + cloud(250, -100, 0.5, "drift slow") +
          // the house front
          '<rect x="-40" y="-92" width="300" height="134" fill="url(#dsReWall)"/><path d="M-60-88L110-132 280-88z" fill="#E5484D"/><path d="M-60-88h340" stroke="#B4322E" stroke-width="5" stroke-linecap="round"/>' +
          '<rect x="164" y="-58" width="60" height="100" rx="6" fill="url(#dsReDoor)"/><circle cx="214" cy="-6" r="3" fill="#FFE08A"/><rect x="170" y="-52" width="48" height="40" rx="4" fill="#fff" opacity=".18"/>' +
          windowFrame("dsReWin", 20, -64, 70, 54, 12, '<rect x="20" y="-64" width="70" height="54" fill="#BFE6FF"/>', "#fff") +
          // ketupat hanging along the eaves
          '<path d="M-20-86Q110-70 250-86" fill="none" stroke="#5FA53A" stroke-width="1.5"/>' +
          ketupat(10, -78, 0.9, "swing") + ketupat(70, -72, 0.8, "swing") + ketupat(132, -72, 0.9, "swing") + ketupat(194, -76, 0.8, "swing") + ketupat(244, -84, 0.85, "swing") +
          garland(240, 410, -118, 12, 6) +
          band(42, "url(#dsReGr)") + floorShine(42) +
          '<path d="M150 42l-30 140h130l-30-140z" fill="#E9D9BE" opacity=".8"/>' +
          // the family
          person("family/abi-wave.webp", 62, 128, 236, 200 / 420, [0, 0, 1, 1], "re-abi") +
          person("family/umi-welcome.webp", 148, 126, 222, 173 / 420, [0, 0, 1, 1], "re-umi") +
          person("ais-garden/arms-wide-joy.webp", 252, 130, 124, 1, [0.23, 0.06, 0.767, 0.827], "re-ais") +
          // ketupat sparkle after the tap
          [[10, -48], [70, -44], [132, -42], [194, -46], [244, -54]].map(function (p, i) { return burst(p[0], p[1], 16, "#FFE08A", f(0.1 + i * 0.12)) + at("axpop", f(0.15 + i * 0.12), sparkle(p[0] + 12, p[1] - 14, 0.55, "twinkle", "#FFE08A")); }).join("") +
          bush(-50, 120, 1, true) + bush(452, 120, 1, true) + plant(286, 46, 0.9, "sway");
      },
      fx: function (card) {
        if (card) return "";
        return say(262, -50, "Taqabbalallah!", 0.9, 318, -6) + burst(282, -20, 24, "#FF8FB0", 1.0) + '<g class="axpop" style="--d:1.0s">' + heart(282, -22, 1.0, "url(#dsPink)", "beat") + "</g>" +
          [[236, -16, 0.5, 1.15], [318, -12, 0.5, 1.3], [206, 8, 0.45, 1.4]].map(function (h) { return '<g class="axpop" style="--d:' + h[3] + 's">' + heart(h[0], h[1], h[2], "#FF8FB0", "float2") + "</g>"; }).join("");
      }
    };

    /* 11 · Takbir Idul Fitri — Eid morning at the mosque: beat the bedug, Allahu Akbar! */
    S.r_takbir = {
      pose: "baby-mo-yes", mo: { x: 322, y: 128, h: 196 },
      svg: function () {
        return "<defs>" + DEFS + lgu("dsRtSky", ["#FF9F7A@0", "#FFC9A0@.45", "#FFF0D2@1"], -120, 30) + lg("dsRtYard", ["#BFE3A0", "#86C670"]) + "</defs>" +
          bg("url(#dsRtSky)") +
          '<circle class="glow" cx="200" cy="-30" r="120" fill="url(#dsHalo)" opacity=".7"/>' + cloud(60, -96, 0.6, "drift slow", 1, "#FFE2D0") + cloud(330, -104, 0.5, "drift d2", 1, "#FFE2D0") +
          bird(250, -90, 0.8, "#8A5A6A") + bird(274, -80, 0.6, "#8A5A6A", "k2") +
          mosque(200, 40, 1.05, "dsRmDomeG", "#BFE3F5", "") +
          // bunting with ketupat across the top
          '<path d="M-20-108Q200-80 420-108" fill="none" stroke="#5FA53A" stroke-width="1.5"/>' +
          [-6, 50, 110, 170, 230, 290, 350, 406].map(function (x, i) { var y = -108 + 28 * (1 - Math.pow((x - 200) / 220, 2)) * 0.9; return i % 2 ? ketupat(x, f(y + 8), 0.72, "swing") : '<path d="M' + (x - 8) + " " + f(y) + 'h16l-8 15z" fill="' + ["#1FA971", "#FFD25A", "#FF8FB0", "#4FA8E8"][i % 4] + '"/>'; }).join("") +
          band(40, "url(#dsRtYard)") + floorShine(40) +
          '<path d="M200 40l-36 140h72l-36-140z" fill="#F2E6CC" opacity=".8"/>' +
          // the bedug and its beater
          bedug(110, 118, 0.92, "rt-drum") +
          '<g class="rt-stick"><path d="M44 28l28-16" stroke="url(#dsRmWoodD)" stroke-width="5" stroke-linecap="round"/><circle cx="74" cy="11" r="6" fill="#FFF0D0" stroke="#C9A27A" stroke-width="1.6"/></g>' +
          word(38, -4, "DUG!", 0.2, "#FFE08A", 18, -12) + word(70, -32, "DUG!", 0.6, "#FFE08A", 18, 6) + word(30, -56, "DUG!", 1.0, "#FFE08A", 20, -6) +
          // golden sparkle bursts over the mosque
          [[150, -96, 0.55], [252, -102, 0.85], [300, -64, 1.15], [110, -60, 1.3]].map(function (p) { return burst(p[0], p[1], 18, "#FFD25A", p[2]) + at("axpop", p[2], sparkle(p[0], p[1], 0.9, "twinkle", "#FFD25A")); }).join("") +
          lantern(258, -40, 20, 0.7, "dsRmGa", {}) + lantern(146, -42, 22, 0.7, "dsRmGb", {}) +
          bush(-40, 118, 1, true) + bush(250, 122, 0.7, true) + bush(452, 118, 1, true);
      },
      fx: function (card) { return card ? "" : say(220, -40, "Allahu Akbar!", 1.25, 292, -20); }
    };

    /* ───────── tap motion ───────── */
    var css = [
      // sound words ("DUG!", "Gulp!") pop in and fade away again
      K.pre(".axword", "opacity:0"), K.run(".axword", "animation:axPop .5s " + SPRING + " var(--d,0s) both,axOut .5s ease calc(var(--d,0s) + 1.1s) forwards"),
      // 1 hilal: the cloud drifts off, the crescent brightens
      pre(".rh-moon", "opacity:.3"), run(".rh-moon", "animation:rhMoon 1.1s ease .25s both"),
      "@keyframes rhMoon{0%{opacity:.3;transform:scale(.9)}60%{opacity:1;transform:scale(1.18)}100%{opacity:1;transform:none}}",
      pre(".rh-cloud", "opacity:1"),
      run(".rh-cloud", "animation:rhCloud 1.1s ease-in both"),
      "@keyframes rhCloud{from{opacity:1;transform:none}to{opacity:0;transform:translateX(-90px)}}",
      // 2 niat: (lantern + room light: generic axfade/axout) Mo nods
      K.mo("r_niat", "animation:rNod .7s ease-in-out .5s both"),
      "@keyframes rNod{50%{transform:scale(1.03,.97) translateY(calc(var(--u,1px)*2))}}",
      // 3 inni sha'im: Mo stands a little taller, calm
      K.mo("r_shaim", "animation:rCalm 1.2s ease-in-out .2s both"),
      "@keyframes rCalm{40%{transform:scale(1.03)}100%{transform:none}}",
      // 4 berbuka: the sun sinks in the window, the clock's minute hand ticks to 6:00
      pre(".rb-sun", "transform:translateY(-22px)"), run(".rb-sun", "animation:rbSun 1.2s cubic-bezier(.45,0,.35,1) both"),
      "@keyframes rbSun{from{transform:translateY(-22px)}to{transform:none}}",
      geo(".rb-min", "transform-origin:50% 100%"), pre(".rb-min", "transform:rotate(-30deg)"),
      run(".rb-min", "animation:rbMin .5s " + SPRING + " .1s both"), "@keyframes rbMin{from{transform:rotate(-30deg)}to{transform:none}}",
      K.mo("r_buka", "animation:lhHop .5s " + SPRING + " 1.3s both"),
      // 5 after iftar: the date flies to Mo and is eaten, the glass empties
      geo(".ra-date", "transform-box:fill-box;transform-origin:50% 50%"), pre(".ra-date", "opacity:1;transform:none"),
      run(".ra-date", "animation:raDate .7s cubic-bezier(.45,.05,.35,1) .05s both"),
      "@keyframes raDate{0%{opacity:1;transform:none}60%{opacity:1;transform:translate(100px,-60px) scale(1.1)}85%{opacity:1;transform:translate(148px,-30px) scale(.5)}100%{opacity:0;transform:translate(150px,-28px) scale(0)}}",
      geo(".ra-water", "transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(.08)"), pre(".ra-water", "transform:none"),
      run(".ra-water", "animation:raWater .8s ease-in 1.05s both"), "@keyframes raWater{from{transform:none}to{transform:scaleY(.08)}}",
      K.mo("r_after", "animation:aePat .7s ease-in-out .55s both"),
      // 6 host: Umi leans in
      geo(".rh-umi", "transform-box:fill-box;transform-origin:50% 100%"), run(".rh-umi", "animation:rhUmi .7s " + SPRING + " .35s both"),
      "@keyframes rhUmi{from{transform:none}to{transform:rotate(4deg)}}",
      K.mo("r_host", "animation:rBow .8s ease-in-out .05s both"), "@keyframes rBow{40%{transform:rotate(-3deg) scale(1.02,.98)}100%{transform:none}}",
      // 7 witr: Mo sways gently with each dhikr
      K.mo("r_witr", "animation:rSway 2.1s ease-in-out .2s both"), "@keyframes rSway{0%,100%{transform:none}17%,50%,83%{transform:scale(1.02,.98)}}",
      // 8 qadr: a calm breath
      K.mo("r_qadr", "animation:rCalm 1.6s ease-in-out .2s both"),
      // 9 zakat: the sack slides to the booth
      geo(".rz-sack", "transform-box:view-box;transform:translate(-112px,-86px)"), pre(".rz-sack", "transform:none"),
      run(".rz-sack", "animation:rzSack 1.05s cubic-bezier(.45,.05,.35,1) .1s both"),
      "@keyframes rzSack{0%{transform:none}20%{transform:translate(-8px,-6px)}70%{transform:translate(-96px,-110px)}85%{transform:translate(-112px,-82px)}93%{transform:translate(-112px,-89px)}100%{transform:translate(-112px,-86px)}}",
      // 10 Eid: Mo hops in for the hug; Abi, Umi and Ais lean in
      geo(".re-abi,.re-umi,.re-ais", "transform-box:fill-box;transform-origin:50% 100%"),
      run(".re-abi", "animation:pAbi .7s " + SPRING + " .9s both"), run(".re-umi", "animation:pUmi .7s " + SPRING + " .85s both"), run(".re-ais", "animation:lhHop .5s " + SPRING + " .8s both"),
      "#sceneCard.ds:not(.acted)[data-scene=r_eid_greet] .scene-mo-wrap{transform:none}",
      "#sceneCard.ds[data-scene=r_eid_greet] .scene-mo-wrap{transform:translateX(calc(var(--u,1px)*-22))}",
      K.mo("r_eid_greet", "animation:reHop .65s ease-out .7s both"),
      "@keyframes reHop{0%{transform:none}45%{transform:translate(calc(var(--u,1px)*-12),calc(var(--u,1px)*-16))}80%{transform:translateX(calc(var(--u,1px)*-24)) scale(1.04,.95)}100%{transform:translateX(calc(var(--u,1px)*-22))}}",
      // 11 takbir: the beater swings, the drum shakes, three times
      geo(".rt-stick", "transform-box:fill-box;transform-origin:100% 0"), run(".rt-stick", "animation:rtStick .4s ease-in-out .05s 3"),
      "@keyframes rtStick{0%,100%{transform:none}45%{transform:rotate(-24deg) translate(-4px,6px)}}",
      geo(".rt-drum", "transform-box:fill-box;transform-origin:50% 100%"), run(".rt-drum", "animation:rtDrum .4s ease-out .2s 3"),
      "@keyframes rtDrum{0%,100%{transform:none}20%{transform:scale(1.03,.97) rotate(-1deg)}50%{transform:rotate(.8deg)}}",
      K.mo("r_takbir", "animation:lhHop .5s " + SPRING + " 1.25s both")
    ].join("\n");

    /* ───────── sounds (WebAudio, silent when muted) ───────── */
    function boom(T, t, v) { T.tone(t, 96, 0.55, { f2: 52, vol: 0.34 * (v || 1) }); T.tone(t, 64, 0.7, { f2: 44, vol: 0.26 * (v || 1) }); T.noise(t, 0.09, { type: "lowpass", f: 420, vol: 0.4 * (v || 1) }); }
    function gulp(T, t) { T.tone(t, 260, 0.1, { f2: 140, vol: 0.15, type: "triangle" }); T.tone(t + 0.05, 180, 0.08, { f2: 380, vol: 0.08 }); }
    var SND = {
      r_hilal: function (T) { T.whoosh(0.05, 0.9, 500, 1500, 0.07); [523, 659, 784, 1047, 1319].forEach(function (fr, k) { T.chime(0.3 + k * 0.16, fr, 1.2, 0.055); }); T.sparkle(1.2); },
      r_niat: function (T) { T.click(0.1); T.tone(0.18, 880, 0.5, { vol: 0.05 }); [392, 494, 587].forEach(function (fr) { T.chime(0.25, fr, 1.4, 0.045); }); T.chime(0.95, 1175, 0.7, 0.04); },
      r_shaim: function (T) { T.whoosh(0.02, 0.3, 1800, 600, 0.05); [523, 659, 784].forEach(function (fr, k) { T.tone(0.3 + k * 0.05, fr, 1.6, { vol: 0.035, a: 0.25 }); }); T.sparkle(0.7); T.pop(1.1, 1.2); },
      r_buka: function (T) { boom(T, 0.25); boom(T, 0.75); boom(T, 1.05, 0.8); [659, 523, 784].forEach(function (fr, k) { T.chime(1.3 + k * 0.14, fr, 1.1, 0.05); }); },
      r_after: function (T) { T.whoosh(0.05, 0.5, 700, 2000, 0.06); T.nom(0.6); T.nom(0.8); gulp(T, 1.15); gulp(T, 1.4); T.tone(1.7, 420, 0.35, { f2: 260, vol: 0.06 }); T.sparkle(1.85); },
      r_host: function (T) { T.chime(0.1, 659, 1, 0.05); T.chime(0.24, 784, 1, 0.05); T.pop(0.5); T.pop(0.7, 1.2); T.pop(0.9, 1.4); T.pop(1.1, 1.6); T.sparkle(1.3); },
      r_witr: function (T) { [0.25, 0.95, 1.65].forEach(function (t, k) { T.click(t, 0.5); T.chime(t + 0.02, [587, 659, 784][k], 1.3, 0.06); }); },
      r_qadr: function (T) { [262, 330, 392, 523].forEach(function (fr) { T.tone(0.1, fr, 2.2, { vol: 0.028, a: 0.6 }); }); [1568, 2093, 1760, 2349, 2637].forEach(function (fr, k) { T.chime(0.4 + k * 0.2, fr, 0.8, 0.03); }); },
      r_zakat: function (T) { T.noise(0.1, 0.8, { f: 700, f2: 300, q: 0.7, vol: 0.08, a: 0.3 }); T.tone(0.95, 140, 0.16, { f2: 70, vol: 0.2 }); T.noise(0.95, 0.07, { type: "lowpass", f: 500, vol: 0.25 }); T.sparkle(1.12); T.chime(1.3, 784, 1, 0.05); },
      r_eid_greet: function (T) { [0.1, 0.22, 0.34, 0.46, 0.58].forEach(function (t, k) { T.chime(t, [1568, 1760, 2093, 2349, 2637][k], 0.6, 0.035); }); T.tone(0.7, 300, 0.25, { f2: 520, vol: 0.07 }); T.pop(1.0); [523, 659, 784].forEach(function (fr) { T.chime(1.05, fr, 1.2, 0.04); }); },
      r_takbir: function (T) { boom(T, 0.2); boom(T, 0.6); boom(T, 1.0, 1.1); [523, 659, 784, 1047].forEach(function (fr, k) { T.chime(1.25 + k * 0.1, fr, 1.1, 0.05); }); }
    };

    return {
      scenes: S, sounds: SND, css: css,
      pose: {
        "baby-mo-pose-15": [0.181, 0.146, 0.715, 0.908, 1], "baby-mo-pose-14": [0.279, 0.146, 0.671, 0.906, 1],
        "baby-mo-pose-36": [0.323, 0.287, 0.715, 0.906, 1], "baby-mo-yes": [0.287, 0.142, 0.775, 0.906, 1]
      },
      thumb: {
        r_hilal: [40, -104, 290, 250], r_niat: [20, -110, 300, 250], r_shaim: [90, -100, 300, 250], r_buka: [10, -110, 290, 250],
        r_after: [120, -50, 230, 200], r_host: [40, -110, 320, 250], r_witr: [100, -110, 300, 260], r_qadr: [150, -70, 250, 214],
        r_zakat: [10, -110, 320, 260], r_eid_greet: [186, -44, 212, 190], r_takbir: [60, -100, 320, 250]
      },
      actMs: { r_hilal: 1700, r_niat: 1500, r_shaim: 1500, r_buka: 2000, r_after: 2200, r_host: 1700, r_witr: 2300, r_qadr: 1700, r_zakat: 1700, r_eid_greet: 2000, r_takbir: 2000 },
      night: ["r_niat", "r_witr", "r_qadr"]
    };
  });

  /* the drawing helpers the start screen reuses (doa-ramadan.js) */
})();
