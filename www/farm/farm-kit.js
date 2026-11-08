/* Baby Mo — farm animal elements (for "Sahabat Hewan Mo").
   Every animal is an inline SVG drawn in the Baby Mo story-art style:
   soft flat shapes, a ground shadow, shiny eyes, rosy cheeks. All face
   screen-right; the ground is y = 0 and the animal is centred on x = 0.

   FarmKit.animal(name, {state, size}) → <svg> string
     states: idle · happy · eat · hungry · thirsty · dirty · sleep · sad · walk
   FarmKit.prop(name, {size})        → <svg> string
   FarmKit.ANIMALS / FarmKit.PROPS    → lists with names in ID/EN + facts
   Moods are pure CSS classes on the <svg> (fa-<state>), so a game can
   switch them with el.setAttribute('class', 'farm-a fa-happy'). */
(function () {
  "use strict";
  var INK = "#2B2140", BLUSH = "#FF8FAD";

  /* ── shared bits ── */
  function shadow(rx, ry) { return '<ellipse class="fa-shadow" cx="0" cy="0" rx="' + rx + '" ry="' + (ry || rx * 0.12) + '" fill="#000" opacity=".14"/>'; }
  function shine(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff"/>'; }
  /* eyes: open / happy (^^) / closed (sleep) / sad — the CSS shows one set */
  function eyes(list, r) {
    var o = '', h = '', c = '', s = '';
    list.forEach(function (p) {
      var x = p[0], y = p[1];
      o += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + INK + '"/>' + shine(x + r * 0.35, y - r * 0.4, r * 0.38);
      h += '<path d="M' + (x - r) + ' ' + (y + r * 0.3) + ' q' + r + ' ' + (-r * 1.6) + ' ' + (2 * r) + ' 0" stroke="' + INK + '" stroke-width="' + (r * 0.55) + '" fill="none" stroke-linecap="round"/>';
      c += '<path d="M' + (x - r) + ' ' + y + ' q' + r + ' ' + (r * 1.1) + ' ' + (2 * r) + ' 0" stroke="' + INK + '" stroke-width="' + (r * 0.5) + '" fill="none" stroke-linecap="round"/>';
      s += '<circle cx="' + x + '" cy="' + (y + r * 0.2) + '" r="' + (r * 0.85) + '" fill="' + INK + '"/><path d="M' + (x - r * 1.1) + ' ' + (y - r * 1.5) + ' l' + (2.2 * r) + ' ' + (r * 0.6) + '" stroke="' + INK + '" stroke-width="' + (r * 0.4) + '" stroke-linecap="round" transform="rotate(' + (x > 0 ? -16 : 16) + ' ' + x + ' ' + y + ')"/>';
    });
    return '<g class="fa-eyes"><g class="ey-open">' + o + '</g><g class="ey-happy">' + h + '</g><g class="ey-closed">' + c + '</g><g class="ey-sad">' + s + '</g></g>';
  }
  function cheeks(list, r) { return list.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (r || 4) + '" fill="' + BLUSH + '" opacity=".45"/>'; }).join(''); }
  function legs(xs, top, h, w, col, hoof) {
    return xs.map(function (x, i) {
      return '<g class="fa-leg fa-leg' + (i % 2) + '"><rect x="' + (x - w / 2) + '" y="' + top + '" width="' + w + '" height="' + h + '" rx="' + (w * 0.4) + '" fill="' + col + '"/>' +
        (hoof ? '<rect x="' + (x - w / 2) + '" y="' + (top + h - w * 0.8) + '" width="' + w + '" height="' + (w * 0.8) + '" rx="' + (w * 0.25) + '" fill="' + hoof + '"/>' : '') + '</g>';
    }).join('');
  }
  function mud(spots) { return '<g class="fa-mud">' + spots.map(function (s) { return '<ellipse cx="' + s[0] + '" cy="' + s[1] + '" rx="' + s[2] + '" ry="' + (s[2] * 0.7) + '" fill="#8A5A34" opacity=".75"/>'; }).join('') + '</g>'; }

  /* ── animals: [viewBox, bubble anchor, svg body] ── */
  var A = {};

  A.kucing = { vb: "-80 -120 160 126", bub: [30, -108], body: function () {
    var f = "#F4A261", d = "#DD8540", cream = "#FFE2C6";
    return shadow(56, 6) +
      '<g class="fa-tail" style="transform-origin:0% 100%"><path d="M-34 -24 q-30 -10 -26 -46" stroke="' + f + '" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M-56 -60 q-4 -6 -4 -10" stroke="' + d + '" stroke-width="11" stroke-linecap="round" fill="none"/></g>' +
      '<g class="fa-body"><ellipse cx="0" cy="-26" rx="42" ry="27" fill="' + f + '"/>' +
      '<path d="M6 -50 q-4 10 0 18 M-10 -51 q-4 10 0 18 M-26 -46 q-3 8 0 14" stroke="' + d + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="10" cy="-14" rx="20" ry="11" fill="' + cream + '"/></g>' +
      '<g class="fa-head" style="transform-origin:30% 90%">' +
      '<path d="M58 -74 l-5 -28 l-18 20 z M26 -80 l-12 -24 l-8 28 z" fill="' + f + '"/><path d="M54 -78 l-3 -16 l-10 12 z M21 -82 l-7 -14 l-5 16 z" fill="#FFB3C1"/>' +
      '<circle cx="34" cy="-56" r="28" fill="' + f + '"/><path d="M40 -82 q-2 8 0 12 M32 -83 q-2 8 0 12" stroke="' + d + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="35" cy="-45" rx="14" ry="9" fill="' + cream + '"/>' + eyes([[24, -59], [45, -59]], 4.6) +
      '<path d="M32.5 -50 h5 l-2.5 3 z" fill="#FF8FAD"/><path class="fa-mouth" d="M30 -45 q2.5 3 5 0 q2.5 3 5 0" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M19 -48 h-14 M19 -44 l-13 3 M50 -48 h14 M50 -44 l13 3" stroke="#B9693A" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>' + cheeks([[17, -50], [52, -50]], 3.5) + '</g>' +
      '<g class="fa-leg fa-leg0"><ellipse cx="24" cy="-4" rx="9" ry="6" fill="' + cream + '"/></g><g class="fa-leg fa-leg1"><ellipse cx="-20" cy="-4" rx="9" ry="6" fill="' + cream + '"/></g>' +
      mud([[-14, -30, 7], [8, -20, 5], [40, -66, 4]]);
  } };

  A.ayam = { vb: "-62 -118 124 124", bub: [26, -108], body: function () {
    var w = "#FFFDF7", b = "#E9D9C4";
    return shadow(40, 5) + legs([-8, 10], -22, 22, 4, "#F6A623") +
      '<path d="M-14 0 h-8 M-8 0 h4 M4 0 h-4 M10 0 h8" stroke="#F6A623" stroke-width="3" stroke-linecap="round"/>' +
      '<g class="fa-tail" style="transform-origin:100% 80%"><path d="M-30 -52 q-22 -18 -12 -44 q8 18 22 24 q-4 -22 10 -34 q2 20 10 36 z" fill="' + w + '" stroke="' + b + '" stroke-width="2"/></g>' +
      '<g class="fa-body"><ellipse cx="0" cy="-42" rx="36" ry="26" fill="' + w + '"/><path d="M-20 -46 q16 18 36 4 q-14 -2 -20 -14 q-8 8 -16 10z" fill="' + b + '"/></g>' +
      '<g class="fa-head" style="transform-origin:20% 100%">' +
      '<path d="M18 -70 q2 -14 10 -8 q4 -12 10 -2 q8 -6 8 6 z" fill="#F0453A"/>' +
      '<circle cx="30" cy="-58" r="17" fill="' + w + '"/>' + eyes([[34, -62]], 3.4) +
      '<path class="fa-beak" d="M44 -60 l12 4 l-12 5 z" fill="#F6A623"/><path d="M42 -50 q4 10 -2 12 q-4 -6 2 -12z" fill="#F0453A"/>' + cheeks([[26, -54]], 3) + '</g>' +
      mud([[-10, -40, 6], [12, -30, 4]]);
  } };

  A.anakAyam = { vb: "-40 -66 80 72", bub: [14, -58], body: function () {
    var y = "#FFD84D", d = "#F2B92E";
    return shadow(22, 3) + legs([-5, 6], -10, 10, 3, "#F6A623") +
      '<g class="fa-body"><ellipse cx="0" cy="-22" rx="20" ry="16" fill="' + y + '"/><g class="fa-tail" style="transform-origin:100% 50%"><path d="M-8 -26 q-10 4 -6 12 q8 -2 10 -8z" fill="' + d + '"/></g></g>' +
      '<g class="fa-head" style="transform-origin:30% 100%"><circle cx="12" cy="-38" r="13" fill="' + y + '"/><path d="M10 -51 q2 -6 6 -2" stroke="' + d + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      eyes([[15, -40]], 2.6) + '<path class="fa-beak" d="M24 -38 l7 2 l-7 3 z" fill="#F6A623"/>' + cheeks([[11, -34]], 2.4) + '</g>' +
      mud([[-4, -20, 4]]);
  } };

  A.bebek = { vb: "-66 -112 132 118", bub: [30, -102], body: function () {
    var w = "#FFFFFF", g = "#E3EAF2";
    return shadow(44, 5) + '<g class="fa-leg fa-leg0"><path d="M-6 -12 v10 l-8 2 h16 z" fill="#F7931E"/></g><g class="fa-leg fa-leg1"><path d="M10 -12 v10 l-8 2 h16 z" fill="#F7931E"/></g>' +
      '<g class="fa-body"><path d="M-44 -40 q-6 -16 6 -18 q20 -4 46 4 q30 6 30 24 q-4 20 -40 20 q-40 0 -42 -30z" fill="' + w + '"/>' +
      '<g class="fa-tail" style="transform-origin:100% 100%"><path d="M-40 -42 l-10 -10 l14 2 z" fill="' + w + '"/></g>' +
      '<path d="M-24 -36 q18 14 38 2 q-18 -2 -22 -14 z" fill="' + g + '"/></g>' +
      '<g class="fa-head" style="transform-origin:10% 100%"><path d="M22 -46 q0 -22 10 -30 l10 4 q-6 10 -4 26z" fill="' + w + '"/>' +
      '<circle cx="34" cy="-78" r="17" fill="' + w + '"/>' + eyes([[38, -82]], 3.4) +
      '<path class="fa-beak" d="M46 -76 q16 -2 18 4 q-6 6 -18 4 z" fill="#F7931E"/>' + cheeks([[30, -72]], 3.2) + '</g>' +
      mud([[-20, -30, 6], [6, -24, 5]]);
  } };

  A.kelinci = { vb: "-56 -128 112 134", bub: [22, -116], body: function () {
    var f = "#F4F1EC", e = "#DDD6CC";
    return shadow(38, 5) +
      '<g class="fa-tail" style="transform-origin:100% 50%"><circle cx="-34" cy="-30" r="10" fill="#FFFFFF"/></g>' +
      '<g class="fa-body"><ellipse cx="-4" cy="-28" rx="32" ry="26" fill="' + f + '"/><ellipse cx="-14" cy="-6" rx="16" ry="7" fill="' + e + '"/></g>' +
      '<g class="fa-head" style="transform-origin:30% 100%">' +
      '<g class="fa-ears"><path d="M10 -76 q-10 -40 2 -46 q10 4 6 46z" fill="' + f + '"/><path d="M12 -80 q-5 -30 1 -36 q5 4 2 36z" fill="#F4B6C2"/>' +
      '<path d="M26 -74 q4 -40 18 -42 q6 10 -6 44z" fill="' + f + '"/><path d="M29 -78 q4 -28 12 -32 q3 8 -5 32z" fill="#F4B6C2"/></g>' +
      '<circle cx="22" cy="-58" r="22" fill="' + f + '"/>' + eyes([[15, -62], [32, -62]], 3.6) +
      '<path d="M22 -52 l3 -3 h-6 z" fill="#E58B9B"/><path class="fa-mouth" d="M19 -48 q3 3 3 0 q0 3 3 0" stroke="' + INK + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M18 -50 h-12 M28 -50 h12" stroke="#B9AFA2" stroke-width="1.2" stroke-linecap="round"/>' + cheeks([[10, -50], [36, -50]], 3.2) + '</g>' +
      '<g class="fa-leg fa-leg0"><ellipse cx="18" cy="-4" rx="9" ry="5" fill="#FFFFFF"/></g><g class="fa-leg fa-leg1"><ellipse cx="-24" cy="-4" rx="12" ry="5" fill="#FFFFFF"/></g>' +
      mud([[-14, -34, 6], [6, -18, 4]]);
  } };

  A.domba = { vb: "-86 -126 172 132", bub: [44, -116], body: function () {
    var w = "#FFFFFF", s = "#F1ECE4", face = "#5A4A42";
    var puffs = [[-50, -60, 20], [-30, -76, 22], [-6, -82, 22], [18, -76, 21], [36, -60, 19], [-46, -40, 18], [30, -40, 18], [-14, -44, 26], [8, -48, 24], [-6, -62, 24]];
    return shadow(60, 7) + legs([-34, -16, 14, 30], -34, 34, 9, face) +
      '<g class="fa-tail" style="transform-origin:100% 50%"><circle cx="-64" cy="-60" r="10" fill="' + s + '"/></g>' +
      '<g class="fa-body">' + puffs.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + w + '" stroke="' + s + '" stroke-width="2"/>'; }).join('') + '</g>' +
      '<g class="fa-head" style="transform-origin:10% 90%"><g transform="translate(-8 8)"><ellipse cx="44" cy="-74" rx="10" ry="6" fill="' + face + '" transform="rotate(-25 44 -74)"/><ellipse cx="72" cy="-74" rx="10" ry="6" fill="' + face + '" transform="rotate(25 72 -74)"/>' +
      '<ellipse cx="58" cy="-62" rx="17" ry="21" fill="' + face + '"/><circle cx="52" cy="-82" r="9" fill="' + w + '"/><circle cx="62" cy="-84" r="9" fill="' + w + '"/>' +
      eyes([[52, -64], [65, -64]], 3.4) + '<path class="fa-mouth" d="M55 -50 q3 3 6 0" stroke="#F2D6CC" stroke-width="2" fill="none" stroke-linecap="round"/>' + cheeks([[47, -56], [70, -56]], 3) + '</g></g>' +
      mud([[-30, -50, 8], [10, -70, 6], [24, -44, 6]]);
  } };

  A.kambing = { vb: "-84 -170 184 176", bub: [78, -160], body: function () {
    var w = "#F4F0E8", e = "#E2DCCF";
    return shadow(70, 8) + legs([-40, -22, 26, 44], -48, 48, 10, "#E9E4DA", "#5A4A3A") +
      '<g class="fa-tail" style="transform-origin:100% 100%"><path d="M-58 -78 q-10 -14 -4 -22" stroke="' + w + '" stroke-width="9" stroke-linecap="round" fill="none"/></g>' +
      '<g class="fa-body"><ellipse cx="0" cy="-68" rx="62" ry="32" fill="' + w + '"/><ellipse cx="-14" cy="-76" rx="24" ry="16" fill="#B98A55" opacity=".85"/>' +
      '<path d="M-50 -60 q50 22 100 0" stroke="' + e + '" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M40 -84 q18 -20 28 -40 l18 10 q-8 26 -26 42z" fill="' + w + '"/></g>' +
      '<g class="fa-head" style="transform-origin:0% 100%"><g transform="translate(78 -126)">' +
      '<path d="M-6 -14 q-12 -18 -4 -26 M6 -14 q4 -20 14 -24" stroke="#9A7A55" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-14" cy="-4" rx="12" ry="5" fill="' + e + '" transform="rotate(-25 -14 -4)"/><ellipse cx="0" cy="0" rx="16" ry="20" fill="' + w + '"/>' +
      '<ellipse cx="6" cy="14" rx="10" ry="8" fill="#F7D9D2"/><circle cx="8" cy="13" r="1.6" fill="#8A5A4A"/><path d="M2 22 q2 12 -2 18 q-4 -8 -2 -18" fill="' + e + '"/>' +
      eyes([[-3, -4]], 3.3) + cheeks([[-8, 6]], 3) + '</g></g>' +
      mud([[-30, -62, 8], [20, -56, 6]]);
  } };

  A.sapi = { vb: "-110 -186 236 192", bub: [96, -176], body: function () {
    var w = "#F4F0E8", br = "#B07443";
    return shadow(96, 9) + legs([-58, -34, 38, 62], -62, 62, 14, w, "#4A3A2E") +
      '<g class="fa-tail" style="transform-origin:50% 0%"><path d="M-84 -100 q-12 26 -6 50" stroke="' + br + '" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="-90" cy="-48" rx="6" ry="9" fill="#4A3A2E"/></g>' +
      '<g class="fa-body"><ellipse cx="0" cy="-92" rx="88" ry="42" fill="' + w + '"/><path d="M-70 -110 q20 -26 50 -14 q10 24 -14 34 q-30 6 -36 -20z" fill="' + br + '"/>' +
      '<path d="M18 -126 q34 -8 44 16 q-6 24 -34 18 q-18 -10 -10 -34z" fill="' + br + '"/><path d="M-70 -76 q70 30 140 0" stroke="#E2DCCF" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="8" cy="-54" rx="16" ry="7" fill="#F7C7C0"/></g>' +
      '<g class="fa-head" style="transform-origin:0% 60%"><g transform="translate(96 -116)">' +
      '<path d="M-14 -24 q-10 -14 -2 -20 M14 -24 q10 -14 2 -20" stroke="#E9D6B5" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-24" cy="-14" rx="13" ry="6" fill="' + br + '" transform="rotate(-20 -24 -14)"/><ellipse cx="24" cy="-14" rx="13" ry="6" fill="' + br + '" transform="rotate(20 24 -14)"/>' +
      '<ellipse cx="0" cy="0" rx="24" ry="28" fill="' + br + '"/><path d="M-6 -26 q6 18 0 30 q8 -2 10 -14 q-2 -14 -10 -16z" fill="' + w + '"/>' +
      '<ellipse cx="0" cy="18" rx="20" ry="13" fill="#F7C7C0"/><circle cx="-7" cy="18" r="2.6" fill="#8A5A4A"/><circle cx="7" cy="18" r="2.6" fill="#8A5A4A"/>' +
      eyes([[-10, -6], [10, -6]], 3.6) + cheeks([[-16, 4], [16, 4]], 3.4) +
      '<path d="M-12 30 q12 6 24 0" stroke="#C0392B" stroke-width="4" fill="none"/><g class="fa-bell"><path d="M-7 34 h14 l3 14 h-20z" fill="#FFC83D"/><circle cx="0" cy="49" r="2.6" fill="#B98A1E"/></g></g></g>' +
      mud([[-40, -80, 10], [30, -70, 8], [-10, -110, 6]]);
  } };

  A.unta = { vb: "-100 -196 214 202", bub: [86, -186], body: function () {
    var c = "#E0B27A", d = "#C99560";
    return shadow(80, 8) + legs([-46, -28, 28, 46], -70, 70, 10, c, "#8A6440") +
      '<g class="fa-tail" style="transform-origin:50% 0%"><path d="M-74 -108 q-8 18 -4 34" stroke="' + d + '" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-80 -78 l4 10 l4 -10z" fill="#8A6440"/></g>' +
      '<g class="fa-body"><path d="M-78 -96 q-2 -26 20 -32 q14 -40 40 -20 q16 -36 40 -6 q26 4 26 30 q4 28 -40 34 h-50 q-34 -2 -36 -6z" fill="' + c + '"/>' +
      '<path d="M-40 -72 q40 14 80 0" stroke="' + d + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<path d="M-44 -118 q30 -14 64 -2 l-4 16 q-28 -8 -56 2z" fill="#2E9E8F"/><path d="M-46 -104 q30 -10 60 0" stroke="#FFC83D" stroke-width="3" fill="none" stroke-dasharray="4 4"/>' +
      '<path d="M50 -96 q16 -30 26 -70 l18 4 q-6 40 -26 76z" fill="' + c + '"/></g>' +
      '<g class="fa-head" style="transform-origin:0% 100%"><g transform="translate(88 -168)">' +
      '<ellipse cx="-8" cy="-14" rx="5" ry="8" fill="' + d + '"/><ellipse cx="6" cy="0" rx="22" ry="15" fill="' + c + '"/>' +
      '<ellipse cx="22" cy="6" rx="10" ry="9" fill="#EEC895"/><path d="M20 12 q6 2 10 0" stroke="#8A6440" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M-6 -8 q6 -4 12 0" stroke="#8A6440" stroke-width="2.4" fill="none" stroke-linecap="round"/>' + eyes([[2, -2]], 3.4) + cheeks([[-2, 8]], 3.2) + '</g></g>' +
      mud([[-40, -100, 8], [20, -90, 7]]);
  } };

  A.kuda = { vb: "-104 -196 222 202", bub: [92, -186], body: function () {
    var c = "#A86A3C", m = "#5A3A22";
    return shadow(84, 8) + legs([-52, -32, 34, 54], -68, 68, 12, c, "#3A2A20") +
      '<g class="fa-tail" style="transform-origin:50% 0%"><path d="M-80 -110 q-26 20 -18 66 q10 -24 6 -40 q6 -12 12 -26z" fill="' + m + '"/></g>' +
      '<g class="fa-body"><ellipse cx="0" cy="-96" rx="84" ry="36" fill="' + c + '"/><path d="M-60 -78 q60 26 120 0" stroke="#965C32" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<path d="M48 -108 q18 -36 34 -70 l22 8 q-10 40 -30 80z" fill="' + c + '"/></g>' +
      '<g class="fa-head" style="transform-origin:0% 100%"><g transform="translate(96 -176)">' +
      '<path d="M-26 6 q-10 30 -6 66 q-6 -36 14 -66z M-14 -8 q-14 10 -14 22 l8 2 q0 -14 10 -22z" fill="' + m + '"/>' +
      '<path d="M-10 -18 l4 -14 l8 12z M4 -18 l6 -14 l4 14z" fill="' + c + '"/>' +
      '<path d="M-12 -14 q14 -8 26 4 q12 14 12 30 q0 10 -12 10 q-14 0 -22 -14 q-8 -14 -4 -30z" fill="' + c + '"/>' +
      '<ellipse cx="18" cy="26" rx="12" ry="9" fill="#C98C5C"/><circle cx="16" cy="26" r="1.8" fill="#4A2E1A"/><circle cx="23" cy="25" r="1.8" fill="#4A2E1A"/>' +
      '<path d="M-6 -16 q6 6 12 4" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' + eyes([[4, 0]], 3.4) + cheeks([[2, 12]], 3.2) + '</g></g>' +
      mud([[-30, -100, 9], [30, -88, 7]]);
  } };

  /* ── props ── */
  var P = {
    mangkuk: ["-40 -34 80 38", '<ellipse cx="0" cy="0" rx="32" ry="4" fill="#000" opacity=".12"/><path d="M-30 -18 h60 q-4 18 -30 18 q-26 0 -30 -18z" fill="#4FA3E0"/><ellipse cx="0" cy="-18" rx="30" ry="7" fill="#3A8AC8"/><ellipse class="fill" cx="0" cy="-19" rx="25" ry="5" fill="#E8C27A"/><g class="fill" fill="#C9963E"><circle cx="-10" cy="-20" r="2.4"/><circle cx="2" cy="-21" r="2.4"/><circle cx="12" cy="-19" r="2.4"/><circle cx="-4" cy="-17" r="2.2"/></g><path d="M-22 -12 q22 8 44 0" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/>'],
    minum: ["-60 -36 120 40", '<ellipse cx="0" cy="0" rx="52" ry="5" fill="#000" opacity=".12"/><path d="M-50 -24 h100 l-8 24 h-84z" fill="#9A6B44"/><path d="M-50 -24 h100" stroke="#7A5232" stroke-width="4" stroke-linecap="round"/><path class="fill" d="M-44 -21 h88 l-2 6 h-84z" fill="#4FB3FF"/><path class="fill" d="M-30 -19 h14 M6 -19 h20" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>'],
    jerami: ["-56 -60 112 64", '<ellipse cx="0" cy="0" rx="50" ry="5" fill="#000" opacity=".12"/><rect x="-46" y="-50" width="92" height="50" rx="10" fill="#EBC860"/><g stroke="#C9A43E" stroke-width="2.4" stroke-linecap="round"><path d="M-38 -40 l10 -6 M-20 -30 l14 -4 M0 -42 l12 2 M20 -26 l14 -6 M-34 -14 l12 2 M10 -12 l16 -2"/></g><path d="M-46 -34 h92 M-46 -16 h92" stroke="#B5852E" stroke-width="3"/>'],
    telur: ["-24 -32 48 36", '<ellipse cx="0" cy="0" rx="14" ry="3" fill="#000" opacity=".12"/><path d="M0 -28 q14 0 14 16 q0 12 -14 12 q-14 0 -14 -12 q0 -16 14 -16z" fill="#FFF7EA"/><ellipse cx="-5" cy="-16" rx="3" ry="5" fill="#fff"/>'],
    sarang: ["-44 -34 88 38", '<ellipse cx="0" cy="0" rx="38" ry="4" fill="#000" opacity=".12"/><path d="M-36 -14 q36 22 72 0 q-2 14 -36 14 q-34 0 -36 -14z" fill="#B5852E"/><path class="eggs" d="M-12 -12 q8 -18 16 0z M2 -12 q8 -20 16 0z" fill="#FFF7EA"/><path d="M-38 -16 q38 14 76 0" stroke="#D9A94A" stroke-width="6" fill="none" stroke-linecap="round"/><g stroke="#8A6424" stroke-width="1.6" stroke-linecap="round"><path d="M-30 -10 l8 4 M-12 -6 l8 2 M8 -6 l8 -2 M24 -10 l8 -4"/></g>'],
    susu: ["-30 -56 60 60", '<ellipse cx="0" cy="0" rx="24" ry="3" fill="#000" opacity=".12"/><path d="M-20 -40 h40 l-4 40 h-32z" fill="#C9D3DE"/><ellipse cx="0" cy="-40" rx="20" ry="5" fill="#AEB9C6"/><ellipse class="fill" cx="0" cy="-40" rx="17" ry="4" fill="#FFFFFF"/><path d="M-20 -40 q20 -26 40 0" stroke="#7E8A98" stroke-width="2.6" fill="none"/><path d="M-12 -30 v22" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>'],
    wol: ["-34 -40 68 44", '<ellipse cx="0" cy="0" rx="28" ry="3" fill="#000" opacity=".12"/><g fill="#FFFFFF" stroke="#EDE6DA" stroke-width="2"><circle cx="-14" cy="-16" r="13"/><circle cx="6" cy="-22" r="15"/><circle cx="16" cy="-10" r="11"/><circle cx="-2" cy="-8" r="12"/></g>'],
    sikat: ["-34 -26 68 30", '<rect x="-30" y="-20" width="34" height="14" rx="6" fill="#B07443"/><g stroke="#E8D3A8" stroke-width="2.4" stroke-linecap="round"><path d="M-26 -6 v6 M-20 -6 v6 M-14 -6 v6 M-8 -6 v6 M-2 -6 v6"/></g><rect x="2" y="-17" width="28" height="8" rx="4" fill="#8A5A34"/>'],
    sapu: ["-20 -106 40 110", '<rect x="-3" y="-104" width="6" height="74" rx="3" fill="#B07443"/><path d="M-16 0 l6 -32 h20 l6 32z" fill="#EBC860"/><path d="M-12 -8 l4 -22 M0 -4 v-26 M12 -8 l-4 -22" stroke="#C9A43E" stroke-width="1.8"/><rect x="-11" y="-34" width="22" height="6" rx="2" fill="#C0392B"/>'],
    bola: ["-16 -30 32 32", '<ellipse cx="0" cy="0" rx="11" ry="2.5" fill="#000" opacity=".12"/><circle cx="0" cy="-14" r="13" fill="#FF6B5A"/><path d="M-13 -14 q13 8 26 0" stroke="#FFE066" stroke-width="3" fill="none"/><circle cx="-4" cy="-19" r="3" fill="#fff" opacity=".6"/>'],
    pagar: ["-90 -50 180 54", '<g fill="#FFF7E8" stroke="#E0CBA8" stroke-width="2"><rect x="-88" y="-32" width="176" height="7" rx="3"/><rect x="-88" y="-16" width="176" height="7" rx="3"/><path d="M-80 -46 l6 -4 l6 4 v46 h-12z M-40 -46 l6 -4 l6 4 v46 h-12z M0 -46 l6 -4 l6 4 v46 h-12z M40 -46 l6 -4 l6 4 v46 h-12z M76 -46 l6 -4 l6 4 v46 h-12z"/></g>'],
    kandang: ["-110 -170 220 174", '<ellipse cx="0" cy="0" rx="100" ry="8" fill="#000" opacity=".12"/><path d="M-90 -100 h180 v100 h-180z" fill="#D9534F"/><path d="M-104 -96 l104 -70 l104 70z" fill="#8E3B37"/><path d="M-92 -100 l92 -60 l92 60" stroke="#FFF7E8" stroke-width="7" fill="none" stroke-linejoin="round"/><rect x="-34" y="-74" width="68" height="74" fill="#7A2E2B"/><path d="M-34 -74 l68 74 M34 -74 l-68 74" stroke="#FFF7E8" stroke-width="5"/><rect x="-34" y="-74" width="68" height="74" fill="none" stroke="#FFF7E8" stroke-width="6"/><circle cx="0" cy="-122" r="12" fill="#FFF7E8"/><path d="M0 -130 v8 l5 3" stroke="#8E3B37" stroke-width="2.4" stroke-linecap="round" fill="none"/><rect x="-80" y="-84" width="26" height="22" fill="#FFE8A3" stroke="#FFF7E8" stroke-width="4"/><rect x="54" y="-84" width="26" height="22" fill="#FFE8A3" stroke="#FFF7E8" stroke-width="4"/>'],
    keranjang: ["-40 -46 80 50", '<ellipse cx="0" cy="0" rx="34" ry="4" fill="#000" opacity=".12"/><path d="M-26 -36 q26 -26 52 0" stroke="#B5852E" stroke-width="5" fill="none"/><path d="M-34 -30 h68 l-8 30 h-52z" fill="#D9A94A"/><path d="M-32 -22 h64 M-30 -12 h60" stroke="#B5852E" stroke-width="3"/><g fill="#FFF7EA"><ellipse cx="-12" cy="-32" rx="8" ry="10"/><ellipse cx="4" cy="-34" rx="8" ry="10"/><ellipse cx="18" cy="-31" rx="7" ry="9"/></g>']
  };

  var ANIMALS = [
    ["kucing", "Kucing", "Cat", "Kucing suka dielus pelan-pelan dan tidur di tempat yang hangat.", "Cats love gentle strokes and warm places to nap."],
    ["ayam", "Ayam", "Hen", "Ayam betina bertelur hampir setiap hari.", "A hen lays an egg almost every day."],
    ["anakAyam", "Anak Ayam", "Chick", "Anak ayam selalu ikut induknya — jangan pisahkan mereka.", "Chicks follow their mother — never separate them."],
    ["bebek", "Bebek", "Duck", "Bulu bebek berminyak, jadi tetap kering di air.", "A duck's feathers are oily, so it stays dry in water."],
    ["kelinci", "Kelinci", "Rabbit", "Gigi kelinci terus tumbuh, jadi ia suka mengunyah.", "A rabbit's teeth keep growing, so it loves to chew."],
    ["domba", "Domba", "Sheep", "Bulu domba dicukur untuk dijadikan wol yang hangat.", "Sheep wool is sheared to make warm clothes."],
    ["kambing", "Kambing", "Goat", "Kambing pandai memanjat dan suka daun.", "Goats are great climbers and love leaves."],
    ["sapi", "Sapi", "Cow", "Allah memberi kita susu yang bersih dari perut sapi (QS. An-Nahl: 66).", "Allah gives us pure milk from cows (Qur'an 16:66)."],
    ["unta", "Unta", "Camel", "Unta bisa berhari-hari di gurun tanpa minum.", "A camel can go for days in the desert without drinking."],
    ["kuda", "Kuda", "Horse", "Kuda bisa tidur sambil berdiri.", "Horses can sleep standing up."]
  ];
  var PROPS = [["mangkuk", "Mangkuk makan", "Food bowl"], ["minum", "Tempat minum", "Water trough"], ["jerami", "Jerami", "Hay"], ["telur", "Telur", "Egg"], ["sarang", "Sarang", "Nest"],
    ["susu", "Ember susu", "Milk pail"], ["wol", "Wol", "Wool"], ["sikat", "Sikat", "Brush"], ["sapu", "Sapu", "Broom"], ["bola", "Bola", "Ball"], ["pagar", "Pagar", "Fence"],
    ["kandang", "Kandang", "Barn"], ["keranjang", "Keranjang telur", "Egg basket"]];

  var BUBBLE = { hungry: "🥕", thirsty: "💧", dirty: "🧽", sad: "🤒" };
  var FOOD = { kucing: "🐟", ayam: "🌾", anakAyam: "🌾", bebek: "🌾", kelinci: "🥕", domba: "🌿", kambing: "🌿", sapi: "🌿", unta: "🌿", kuda: "🌿" };
  function icon(name, st) { return st === "hungry" ? (FOOD[name] || BUBBLE.hungry) : (BUBBLE[st] || ""); }
  function bubble(a, state) {
    var x = a.bub[0], y = a.bub[1];
    return '<g class="fa-bubble"><g transform="translate(' + x + ' ' + y + ')"><circle cx="-14" cy="18" r="3" fill="#fff"/><circle cx="-8" cy="10" r="4.5" fill="#fff"/>' +
      '<rect x="-12" y="-26" width="34" height="30" rx="15" fill="#fff" stroke="#E6E1F2" stroke-width="1.5"/><text x="5" y="-5" text-anchor="middle" font-size="18">' + icon(a.name, state) + '</text></g></g>' +
      '<g class="fa-hearts"><text x="' + (x - 6) + '" y="' + (y + 4) + '" font-size="16">💗</text><text x="' + (x + 12) + '" y="' + (y + 16) + '" font-size="11">💗</text></g>' +
      '<g class="fa-zzz"><text x="' + x + '" y="' + (y + 10) + '" font-size="14" font-weight="900" fill="#7C83E8" font-family="Nunito,sans-serif">z</text><text x="' + (x + 10) + '" y="' + y + '" font-size="18" font-weight="900" fill="#7C83E8" font-family="Nunito,sans-serif">Z</text></g>' +
      '<g class="fa-sparkle"><text x="' + (x - 30) + '" y="' + (y + 30) + '" font-size="14">✨</text><text x="' + (x + 6) + '" y="' + (y + 46) + '" font-size="12">✨</text></g>';
  }

  function animal(name, o) {
    o = o || {}; var a = A[name]; if (!a) return ''; a.name = name;
    var st = o.state || "idle";
    var size = o.size ? ' style="width:' + o.size + 'px"' : '';
    return '<svg class="farm-a fa-' + st + '" data-animal="' + name + '" viewBox="' + a.vb + '" overflow="visible" xmlns="http://www.w3.org/2000/svg"' + size + '>' +
      '<g class="fa-all">' + a.body() + '</g>' + bubble(a, st) + '</svg>';
  }
  function setState(svg, st) {
    svg.setAttribute("class", "farm-a fa-" + st);
    var t = svg.querySelector(".fa-bubble text"); if (t) t.textContent = icon(svg.getAttribute("data-animal"), st);
  }
  function prop(name, o) {
    o = o || {}; var p = P[name]; if (!p) return '';
    return '<svg class="farm-p" data-prop="' + name + '" viewBox="' + p[0] + '" overflow="visible" xmlns="http://www.w3.org/2000/svg"' + (o.size ? ' style="width:' + o.size + 'px"' : '') + '>' + p[1] + '</svg>';
  }

  /* ── moods and motion (CSS) ── */
  var css = [
    ".farm-a,.farm-p{display:inline-block;height:auto;overflow:visible}",
    ".farm-a *{transform-box:fill-box}",
    ".farm-a .ey-happy,.farm-a .ey-closed,.farm-a .ey-sad,.farm-a .fa-bubble,.farm-a .fa-hearts,.farm-a .fa-zzz,.farm-a .fa-sparkle,.farm-a .fa-mud{display:none}",
    ".farm-a .fa-body{transform-origin:50% 100%;animation:fa-breathe 2.8s ease-in-out infinite}",
    ".farm-a .fa-tail{animation:fa-wag 1.4s ease-in-out infinite}",
    ".farm-a .fa-eyes{transform-origin:50% 50%;animation:fa-blink 4.2s infinite}",
    ".farm-a .fa-bell{transform-origin:50% 0%;animation:fa-wag 1.8s ease-in-out infinite}",
    "@keyframes fa-breathe{50%{transform:scale(1.015,1.03)}}",
    "@keyframes fa-wag{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(10deg)}}",
    "@keyframes fa-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}",
    /* happy */
    ".fa-happy .ey-open{display:none}.fa-happy .ey-happy{display:inline}.fa-happy .fa-hearts{display:inline}",
    ".fa-happy .fa-all{transform-origin:50% 100%;animation:fa-hop .6s cubic-bezier(.3,.7,.4,1) infinite alternate}",
    ".fa-happy .fa-tail{animation-duration:.45s}",
    ".fa-hearts{animation:fa-float 1.6s ease-in-out infinite}",
    "@keyframes fa-hop{to{transform:translateY(-6%)}}",
    "@keyframes fa-float{0%{transform:translateY(4px);opacity:.3}50%{opacity:1}100%{transform:translateY(-8px);opacity:0}}",
    /* eat */
    ".fa-eat .fa-head{animation:fa-nod .5s ease-in-out infinite alternate}",
    ".fa-eat .ey-open{display:none}.fa-eat .ey-closed{display:inline}",
    "@keyframes fa-nod{from{transform:rotate(0)}to{transform:rotate(18deg) translateY(6%)}}",
    /* needs: a thought bubble, a little droop */
    ".fa-hungry .fa-bubble,.fa-thirsty .fa-bubble,.fa-dirty .fa-bubble,.fa-sad .fa-bubble{display:inline}",
    ".fa-bubble{animation:fa-bob 1.6s ease-in-out infinite}",
    "@keyframes fa-bob{50%{transform:translateY(-4px)}}",
    ".fa-hungry .fa-head,.fa-thirsty .fa-head{animation:fa-droop 2s ease-in-out infinite}",
    "@keyframes fa-droop{50%{transform:rotate(6deg)}}",
    ".fa-dirty .fa-mud{display:inline}",
    ".fa-sad .ey-open{display:none}.fa-sad .ey-sad{display:inline}.fa-sad .fa-tail{animation:none;transform:rotate(14deg)}.fa-sad .fa-head{transform:rotate(10deg)}",
    /* sleep */
    ".fa-sleep .ey-open{display:none}.fa-sleep .ey-closed{display:inline}.fa-sleep .fa-zzz{display:inline}",
    ".fa-sleep .fa-tail,.fa-sleep .fa-bell{animation:none}.fa-sleep .fa-body{animation-duration:4.5s}.fa-sleep .fa-eyes{animation:none}",
    ".fa-zzz{animation:fa-float 2.4s ease-in-out infinite}",
    /* walk */
    ".fa-walk .fa-leg{transform-origin:50% 0%}.fa-walk .fa-leg0{animation:fa-step .5s ease-in-out infinite alternate}.fa-walk .fa-leg1{animation:fa-step .5s ease-in-out infinite alternate-reverse}",
    ".fa-walk .fa-all{animation:fa-bounce .25s ease-in-out infinite alternate}",
    "@keyframes fa-step{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}",
    "@keyframes fa-bounce{to{transform:translateY(-2%)}}",
    /* clean sparkle (add class fa-clean briefly after brushing) */
    ".fa-clean .fa-sparkle{display:inline;animation:fa-float 1.2s ease-out infinite}",
    "@media (prefers-reduced-motion:reduce){.farm-a *{animation:none!important}}"
  ].join("\n");
  function injectCss() {
    if (document.getElementById("farm-kit-css")) return;
    var s = document.createElement("style"); s.id = "farm-kit-css"; s.textContent = css; document.head.appendChild(s);
  }
  if (typeof document !== "undefined") { if (document.head) injectCss(); else document.addEventListener("DOMContentLoaded", injectCss); }

  window.FarmKit = { animal: animal, prop: prop, setState: setState, ANIMALS: ANIMALS, PROPS: PROPS,
    STATES: ["idle", "happy", "eat", "hungry", "thirsty", "dirty", "sleep", "sad", "walk"] };
})();
