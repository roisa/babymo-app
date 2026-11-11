/* Baby Mo — Doa Harian illustrated scenes.
   One hand-drawn, gently animated SVG scene per du'a, painted in a soft,
   glossy "3D cartoon" style (gradients, highlights, soft shadows) to sit
   next to the real Baby Mo renders. Pure SVG + CSS, no images besides the
   characters, so the scenes stay crisp and light. Motion respects
   prefers-reduced-motion.

   Coordinate frame: x 0…400, y -120…180 (viewBox "0 -120 400 300").
   The lower part (y 0…180) lines up with the older 400×180 header frame so
   other games that crop "0 0 400 180" still get the ground and the props.
   Skies, walls and floors are drawn far past the frame on every side, so the
   scene can be shown edge to edge at any aspect ratio ("meet" + overflow).
   Baby Mo stands on the ground at y≈128, on the right; his place in each
   scene is given in frame units (x = centre, y = feet, h = visible height). */
(function () {
  "use strict";

  var VB = "0 -120 400 300", FY = 180, FH = 300;

  var CSS = [
    /* the learn-screen header: a full-bleed picture (layout lives in the page) */
    ".scene-card.has-scene .scene-overlay,.scene-card.has-scene .scene-emojis{display:none}",
    ".scene-card.has-scene .scene-bg{background:none!important}",
    ".scene-card.has-scene .scene-bg svg{position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible}",
    ".scene-card.has-scene .scene-mo-wrap{position:absolute;right:auto;z-index:2;animation:dsMoIn .6s cubic-bezier(.34,1.56,.64,1)}",
    // Mo stands on the floor: a soft contact shadow under his feet, a tight drop shadow,
    // and a calm breathe-and-sway pivoting on his feet (no floating bob)
    ".scene-card.has-scene .scene-mo-wrap img{position:relative;z-index:1;display:block;width:100%;height:100%;object-fit:contain;transform-origin:50% 92%;filter:drop-shadow(0 4px 5px rgba(40,30,80,.22));animation:dsMoBreathe 4.4s ease-in-out infinite}",
    ".scene-card.has-scene .scene-mo-sh{position:absolute;z-index:0;border-radius:50%;pointer-events:none;background:radial-gradient(closest-side,rgba(38,28,70,.42),rgba(38,28,70,.22) 55%,rgba(38,28,70,0))}",
    ".scene-card.has-scene .scene-bg svg,.scene-card.has-scene .scene-fx svg{transform:translateY(calc(-1 * var(--sy,0px)))}",
    ".scene-card.has-scene .scene-mo-wrap img.celebrate{animation:moCelebrate .5s cubic-bezier(.34,1.56,.64,1)}",
    ".scene-card.has-scene .scene-mo-wrap img.wrong{animation:moWrong .4s ease}",
    "@keyframes dsMoIn{from{transform:translateY(30px) scale(.9);opacity:0}to{transform:none;opacity:1}}",
    "@keyframes dsMoBreathe{0%,100%{transform:none}25%{transform:rotate(-.7deg) scaleY(1.008)}50%{transform:scale(1.006,1.02)}75%{transform:rotate(.7deg) scaleY(1.008)}}",
    // shared motion
    ".ds svg *{transform-box:fill-box;transform-origin:center}",
    ".ds .float{animation:dsFloat 4s ease-in-out infinite}",
    ".ds .float2{animation:dsFloat 5.5s ease-in-out infinite .8s}",
    "@keyframes dsFloat{50%{transform:translateY(-6px)}}",
    ".ds .drift{animation:dsDrift 26s ease-in-out infinite alternate}",
    ".ds .drift.slow{animation-duration:38s}",
    ".ds .drift.d2{animation-delay:-13s}",
    "@keyframes dsDrift{from{transform:translateX(-40px)}to{transform:translateX(40px)}}",
    ".ds .spin{animation:dsSpin 24s linear infinite}",
    "@keyframes dsSpin{to{transform:rotate(360deg)}}",
    ".ds .rise{animation:dsRise 1.8s cubic-bezier(.2,.8,.3,1) both}",
    "@keyframes dsRise{from{transform:translateY(40px)}to{transform:none}}",
    ".ds .twinkle{animation:dsTwinkle 2.4s ease-in-out infinite}",
    ".ds .twinkle.t2{animation-delay:.8s}.ds .twinkle.t3{animation-delay:1.6s}.ds .twinkle.t4{animation-delay:.4s}",
    "@keyframes dsTwinkle{0%,100%{opacity:.35;transform:scale(.7)}50%{opacity:1;transform:scale(1.12)}}",
    ".ds .sway{animation:dsSway 3.6s ease-in-out infinite;transform-origin:center bottom}",
    "@keyframes dsSway{50%{transform:rotate(-4deg)}}",
    ".ds .swing{animation:dsSwing 3.4s ease-in-out infinite;transform-origin:top center}",
    "@keyframes dsSwing{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}",
    ".ds .steam{animation:dsSteam 2.6s ease-in-out infinite;opacity:0}",
    ".ds .steam.s2{animation-delay:.85s}.ds .steam.s3{animation-delay:1.7s}",
    "@keyframes dsSteam{0%{opacity:0;transform:translateY(6px) scaleY(.8)}35%{opacity:.9}100%{opacity:0;transform:translateY(-22px) scaleY(1.1)}}",
    ".ds .bubble{animation:dsBubble 4.2s ease-in infinite;opacity:0}",
    ".ds .bubble.b2{animation-delay:1.1s}.ds .bubble.b3{animation-delay:2.2s}.ds .bubble.b4{animation-delay:3.1s}",
    "@keyframes dsBubble{0%{opacity:0;transform:translateY(0) scale(.6)}15%{opacity:.95}100%{opacity:0;transform:translateY(-80px) scale(1.15)}}",
    ".ds .step{animation:dsStep 3.2s ease-in-out infinite;opacity:0}",
    ".ds .step.p2{animation-delay:.5s}.ds .step.p3{animation-delay:1s}.ds .step.p4{animation-delay:1.5s}",
    "@keyframes dsStep{0%,8%{opacity:0;transform:scale(.6)}18%,70%{opacity:1;transform:scale(1)}90%,100%{opacity:0}}",
    ".ds .shine{animation:dsShine 3.5s ease-in-out infinite}",
    "@keyframes dsShine{0%,30%{transform:translateX(-50px);opacity:0}45%{opacity:.9}70%,100%{transform:translateX(50px);opacity:0}}",
    ".ds .glow{animation:dsGlow 2.8s ease-in-out infinite}",
    "@keyframes dsGlow{50%{opacity:.6;transform:scale(1.08)}}",
    ".ds .beam{animation:dsBeam 5s ease-in-out infinite}",
    "@keyframes dsBeam{50%{opacity:.55}}",
    ".ds .page{animation:dsPage 3.4s ease-in-out infinite;transform-origin:left center}",
    "@keyframes dsPage{0%,35%{transform:scaleX(1)}60%,100%{transform:scaleX(-1)}}",
    ".ds .letter{animation:dsLetter 5s ease-in-out infinite;opacity:0}",
    ".ds .letter.l2{animation-delay:1.6s}.ds .letter.l3{animation-delay:3.2s}",
    "@keyframes dsLetter{0%{opacity:0;transform:translateY(10px) rotate(-8deg)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translateY(-34px) rotate(8deg)}}",
    ".ds .zz{animation:dsZ 3.6s ease-in-out infinite;opacity:0}",
    ".ds .zz.z2{animation-delay:1.2s}.ds .zz.z3{animation-delay:2.4s}",
    "@keyframes dsZ{0%{opacity:0;transform:translate(0,8px) scale(.6)}25%{opacity:1}100%{opacity:0;transform:translate(16px,-30px) scale(1.2)}}",
    ".ds .bird{animation:dsBird 11s linear infinite}",
    ".ds .bird.k2{animation-delay:-5s}",
    "@keyframes dsBird{from{transform:translate(-60px,10px)}50%{transform:translate(60px,-6px)}to{transform:translate(180px,6px)}}",
    ".ds .flap{animation:dsFlap .5s ease-in-out infinite alternate;transform-origin:center bottom}",
    "@keyframes dsFlap{to{transform:scaleY(.4)}}",
    ".ds .wobble{animation:dsWobble 1.1s ease-in-out infinite;transform-origin:bottom center}",
    "@keyframes dsWobble{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}",
    ".ds .rock{animation:dsRock 3.2s ease-in-out infinite;transform-origin:bottom center}",
    "@keyframes dsRock{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}",
    ".ds .door{animation:dsDoor 4.4s ease-in-out infinite;transform-origin:left center}",
    "@keyframes dsDoor{0%,20%{transform:scaleX(1)}45%,75%{transform:scaleX(.5)}100%{transform:scaleX(1)}}",
    ".ds .wheel{animation:dsSpin .7s linear infinite}",
    ".ds .dash{animation:dsDash .9s linear infinite}",
    "@keyframes dsDash{to{transform:translateX(-48px)}}",
    ".ds .pass{animation:dsPass 7s linear infinite}",
    ".ds .pass.p2{animation-delay:-3.5s}",
    "@keyframes dsPass{from{transform:translateX(140px)}to{transform:translateX(-340px)}}",
    ".ds .speed{animation:dsSpeed .8s ease-in infinite;opacity:0}",
    ".ds .speed.v2{animation-delay:.27s}.ds .speed.v3{animation-delay:.54s}",
    "@keyframes dsSpeed{0%{opacity:0;transform:translateX(10px)}30%{opacity:.9}100%{opacity:0;transform:translateX(-26px)}}",
    ".ds .bump{animation:dsBump .45s ease-in-out infinite alternate}",
    "@keyframes dsBump{to{transform:translateY(-1.8px)}}",
    ".ds .drop{animation:dsDrop 1s linear infinite;opacity:.85}",
    ".ds .drop.r2{animation-delay:-.33s}.ds .drop.r3{animation-delay:-.66s}",
    "@keyframes dsDrop{from{transform:translate(8px,-60px)}to{transform:translate(-8px,190px)}}",
    ".ds .ripple{animation:dsRipple 1.6s ease-out infinite;opacity:0}",
    ".ds .ripple.q2{animation-delay:.55s}.ds .ripple.q3{animation-delay:1.1s}",
    "@keyframes dsRipple{0%{opacity:.9;transform:scale(.3)}100%{opacity:0;transform:scale(1.4)}}",
    ".ds .beat{animation:dsBeat 1.4s ease-in-out infinite}",
    "@keyframes dsBeat{0%,100%{transform:scale(1)}15%{transform:scale(1.15)}30%{transform:scale(1)}45%{transform:scale(1.1)}}",
    ".ds .heartup{animation:dsHeart 4.6s ease-in infinite;opacity:0}",
    ".ds .heartup.h2{animation-delay:1.5s}.ds .heartup.h3{animation-delay:3s}",
    "@keyframes dsHeart{0%{opacity:0;transform:translateY(10px) scale(.5)}20%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-70px) scale(1.1)}}",
    ".ds .sink{animation:dsSink 9s ease-in-out infinite alternate}",
    "@keyframes dsSink{from{transform:translateY(-8px)}to{transform:translateY(10px)}}",
    ".ds .bead{animation:dsBeadOn 4s linear infinite;opacity:0}",
    "@keyframes dsBeadOn{0%{opacity:0}5%,45%{opacity:1}60%,100%{opacity:0}}",
    ".ds .flutter{animation:dsFlutter 7s ease-in-out infinite}",
    "@keyframes dsFlutter{0%,100%{transform:translate(0,0)}25%{transform:translate(18px,-12px)}50%{transform:translate(34px,2px)}75%{transform:translate(14px,10px)}}",
    ".ds .wing{animation:dsWing .35s ease-in-out infinite alternate}",
    "@keyframes dsWing{to{transform:scaleX(.35)}}",
    ".ds .blink{animation:dsBlink 4.5s ease-in-out infinite;transform-origin:center}",
    "@keyframes dsBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}",
    ".ds .hop{animation:dsHop 2.6s ease-in-out infinite;transform-origin:center bottom}",
    "@keyframes dsHop{0%,60%,100%{transform:translateY(0)}70%{transform:translateY(-10px) scaleY(1.05)}80%{transform:translateY(0) scaleY(.92)}}",
    "@media (prefers-reduced-motion:reduce){.ds *,.ds .scene-mo-wrap,.ds .scene-mo-wrap img{animation:none!important}.ds .steam,.ds .bubble,.ds .step,.ds .letter,.ds .zz,.ds .heartup,.ds .speed{opacity:.85}}"
  ].join("\n");

  /* ───────────── tiny drawing kit ───────────── */
  function stopsOf(stops) {
    return stops.map(function (s, i) {
      var op = s.split("~"), p = op[0].split("@");
      return '<stop offset="' + (p[1] || (stops.length > 1 ? (i / (stops.length - 1)).toFixed(2) : 0)) + '" stop-color="' + p[0] + '"' + (op[1] ? ' stop-opacity="' + op[1] + '"' : "") + "/>";
    }).join("");
  }
  // linear gradient: dir "v" (top→bottom, default), "h" (left→right) or "d" (diagonal)
  function lg(id, stops, dir) {
    var c = dir === "h" ? 'x1="0" y1="0" x2="1" y2="0"' : dir === "d" ? 'x1="0" y1="0" x2="1" y2="1"' : 'x1="0" y1="0" x2="0" y2="1"';
    return '<linearGradient id="' + id + '" ' + c + ">" + stopsOf(stops) + "</linearGradient>";
  }
  function rg(id, stops, cx, cy, r) {
    return '<radialGradient id="' + id + '"' + (cx != null ? ' cx="' + cx + '" cy="' + cy + '" r="' + (r || 0.6) + '"' : "") + ">" + stopsOf(stops) + "</radialGradient>";
  }
  // shared paint: soft shadow, gloss, cloud, sun, leaves, wood, glass, white plastic
  var BASE = rg("dsSh", ["#3A2450~.30", "#3A2450~0"]) +
    lg("dsGl", ["#fff~.85", "#fff~0"]) +
    lg("dsCl", ["#FFFFFF", "#E2ECFA"]) +
    rg("dsSun", ["#FFFDE6", "#FFE266@.55", "#FFAE2B"], 0.4, 0.35, 0.7) +
    rg("dsHalo", ["#FFF3B0~.85", "#FFF3B0~0"]) +
    rg("dsLeaf", ["#A6E884", "#4CAF50@.7", "#2F8A3E"], 0.35, 0.3, 0.8) +
    lg("dsTrunk", ["#B07A4A", "#7E5230"], "h") +
    lg("dsGlass", ["#E8F7FF", "#B6E1F7"], "d") +
    lg("dsWhite", ["#FFFFFF", "#E6ECF5"]) +
    lg("dsPotR", ["#FF9A7A", "#E2603F"]) +
    rg("dsPink", ["#FFD0DE", "#FF8FB0"], 0.4, 0.35, 0.8) +
    rg("dsGold", ["#FFF5C2", "#FFD34D@.5", "#F2A516"], 0.4, 0.35, 0.8);

  function f(n) { return Math.round(n * 10) / 10; }
  function bg(fill) { return '<rect x="-800" y="-900" width="2000" height="1500" fill="' + fill + '"/>'; }
  function band(y, fill, h) { return '<rect x="-800" y="' + y + '" width="2000" height="' + (h || 600) + '" fill="' + fill + '"/>'; }
  function shadow(cx, cy, rx, ry) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + (ry || rx * 0.18) + '" fill="url(#dsSh)"/>'; }
  function gloss(x, y, w, h, rx, op) { return '<rect x="' + f(x + w * 0.1) + '" y="' + f(y + h * 0.07) + '" width="' + f(w * 0.8) + '" height="' + f(h * 0.38) + '" rx="' + (rx || 0) + '" fill="url(#dsGl)" opacity="' + (op || 0.7) + '"/>'; }
  function cloud(x, y, s, cls, op, fill) {
    return '<g class="' + (cls || "drift") + '"><g transform="translate(' + x + " " + y + ") scale(" + s + ')" opacity="' + (op || 1) + '" fill="' + (fill || "url(#dsCl)") + '">' +
      '<ellipse cx="0" cy="10" rx="34" ry="12"/><circle cx="-16" cy="2" r="13"/><circle cx="4" cy="-6" r="18"/><circle cx="22" cy="3" r="11"/>' +
      '<ellipse cx="-2" cy="-14" rx="9" ry="4" fill="#fff" opacity=".8"/></g></g>';
  }
  function star(x, y, r, cls, fill) {
    var p = [];
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.48 : r; p.push(f(x + rr * Math.cos(a)) + "," + f(y + rr * Math.sin(a))); }
    return '<polygon class="' + (cls || "") + '" points="' + p.join(" ") + '" fill="' + (fill || "#FFE27A") + '" stroke="' + (fill || "#FFE27A") + '" stroke-width="' + f(r * 0.25) + '" stroke-linejoin="round"/>';
  }
  function sparkle(x, y, s, cls, fill) {
    // position on the outer group, animation on the inner one (a CSS transform would override the attribute)
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><path class="' + (cls || "") + '" fill="' + (fill || "#fff") +
      '" d="M0-10C1.2-2.4 2.4-1.2 10 0 2.4 1.2 1.2 2.4 0 10-1.2 2.4-2.4 1.2-10 0-2.4-1.2-1.2-2.4 0-10z"/></g>';
  }
  function heart(x, y, s, fill, cls) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><g class="' + (cls || "") + '"><path d="M0 9C-3-1-15-3-15 5c0 6 9 11 15 16 6-5 15-10 15-16 0-8-12-6-15 4z" transform="translate(0 -10)" fill="' + (fill || "url(#dsPink)") + '"/>' +
      '<ellipse cx="-7" cy="-7" rx="3.4" ry="2.2" fill="#fff" opacity=".75" transform="rotate(-30 -7 -7)"/></g></g>';
  }
  function sun(cx, cy, r, face, cls) {
    var rays = "";
    for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; rays += '<path d="M' + f(cx + Math.cos(a - 0.12) * (r + 6)) + " " + f(cy + Math.sin(a - 0.12) * (r + 6)) + "L" + f(cx + Math.cos(a) * (r * 1.9)) + " " + f(cy + Math.sin(a) * (r * 1.9)) + "L" + f(cx + Math.cos(a + 0.12) * (r + 6)) + " " + f(cy + Math.sin(a + 0.12) * (r + 6)) + 'z"/>'; }
    return '<g class="' + (cls || "") + '"><circle class="glow" cx="' + cx + '" cy="' + cy + '" r="' + r * 2.6 + '" fill="url(#dsHalo)"/>' +
      '<g class="spin"><g fill="#FFD95A" opacity=".75">' + rays + "</g></g>" +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#dsSun)"/>' +
      (face ? '<g fill="none" stroke="#B4650E" stroke-width="' + f(r * 0.1) + '" stroke-linecap="round"><path d="M' + f(cx - r * 0.42) + " " + f(cy - r * 0.08) + "q" + f(r * 0.14) + " " + f(-r * 0.18) + " " + f(r * 0.28) + ' 0M' + f(cx + r * 0.14) + " " + f(cy - r * 0.08) + "q" + f(r * 0.14) + " " + f(-r * 0.18) + " " + f(r * 0.28) + ' 0"/><path d="M' + f(cx - r * 0.28) + " " + f(cy + r * 0.2) + "q" + f(r * 0.28) + " " + f(r * 0.3) + " " + f(r * 0.56) + ' 0"/></g>' +
        '<circle cx="' + f(cx - r * 0.55) + '" cy="' + f(cy + r * 0.2) + '" r="' + f(r * 0.14) + '" fill="#FF9A6A" opacity=".6"/><circle cx="' + f(cx + r * 0.55) + '" cy="' + f(cy + r * 0.2) + '" r="' + f(r * 0.14) + '" fill="#FF9A6A" opacity=".6"/>' : "") +
      '<ellipse cx="' + f(cx - r * 0.35) + '" cy="' + f(cy - r * 0.45) + '" rx="' + f(r * 0.3) + '" ry="' + f(r * 0.18) + '" fill="#fff" opacity=".7"/></g>';
  }
  // a smiling crescent moon; sky = the colour behind it (cuts the crescent)
  function moon(cx, cy, r, sky, cls) {
    return '<g class="' + (cls || "") + '"><circle class="glow" cx="' + cx + '" cy="' + cy + '" r="' + r * 2.4 + '" fill="url(#dsHalo)" opacity=".7"/>' +
      '<path d="M' + f(cx + r * 0.25) + " " + f(cy - r) + "A" + r + " " + r + " 0 1 0 " + f(cx + r) + " " + f(cy + r * 0.45) + "A" + f(r * 0.82) + " " + f(r * 0.82) + " 0 0 1 " + f(cx + r * 0.25) + " " + f(cy - r) + 'z" fill="url(#dsGold)"/>' +
      '<path d="M' + f(cx - r * 0.5) + " " + f(cy - r * 0.05) + "q" + f(r * 0.12) + " " + f(-r * 0.15) + " " + f(r * 0.24) + ' 0" fill="none" stroke="#9A6A10" stroke-width="' + f(r * 0.09) + '" stroke-linecap="round"/>' +
      '<path d="M' + f(cx - r * 0.42) + " " + f(cy + r * 0.32) + "q" + f(r * 0.18) + " " + f(r * 0.16) + " " + f(r * 0.36) + " " + f(-r * 0.04) + '" fill="none" stroke="#9A6A10" stroke-width="' + f(r * 0.09) + '" stroke-linecap="round"/>' +
      '<circle cx="' + f(cx - r * 0.62) + '" cy="' + f(cy + r * 0.18) + '" r="' + f(r * 0.12) + '" fill="#FF9A6A" opacity=".55"/></g>';
  }
  function tree(x, y, s, cls) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><g class="' + (cls || "") + '">' + shadow(0, 0, 22, 5) +
      '<rect x="-4" y="-30" width="8" height="30" rx="3" fill="url(#dsTrunk)"/>' +
      '<circle cx="0" cy="-46" r="22" fill="url(#dsLeaf)"/><circle cx="-15" cy="-34" r="14" fill="url(#dsLeaf)"/><circle cx="15" cy="-33" r="14" fill="url(#dsLeaf)"/>' +
      '<ellipse cx="-7" cy="-58" rx="8" ry="5" fill="#fff" opacity=".28"/></g></g>';
  }
  function bush(x, y, s, flowers) {
    var h = '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' + shadow(0, 0, 26, 5) +
      '<circle cx="-14" cy="-10" r="13" fill="url(#dsLeaf)"/><circle cx="12" cy="-10" r="14" fill="url(#dsLeaf)"/><circle cx="0" cy="-20" r="15" fill="url(#dsLeaf)"/><ellipse cx="-4" cy="-29" rx="6" ry="3.5" fill="#fff" opacity=".3"/>';
    if (flowers) [[-14, -16, "#FF8FB8"], [2, -26, "#FFE066"], [14, -14, "#fff"], [-2, -10, "#FF8FB8"]].forEach(function (p) {
      h += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.6" fill="' + p[2] + '"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.4" fill="#FFB020"/>';
    });
    return h + "</g>";
  }
  function plant(x, y, s, cls) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><g class="' + (cls || "") + '">' + shadow(0, 0, 16, 3.5) +
      '<path d="M-11-18h22l-3 18h-16z" fill="url(#dsPotR)"/><rect x="-13" y="-21" width="26" height="6" rx="3" fill="#FFB49A"/>' +
      '<path d="M0-21c-10-14-4-26 0-30 4 4 10 16 0 30M0-21c-16-6-18-16-16-21 5 0 13 5 16 21M0-21c16-6 18-16 16-21-5 0-13 5-16 21" fill="url(#dsLeaf)"/>' +
      '<rect x="-8" y="-17" width="4" height="12" rx="2" fill="#fff" opacity=".35"/></g></g>';
  }
  function foot(x, y, rot, cls, left, fill) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + rot + ") scale(" + (left ? -1.35 : 1.35) + ',1.35)"><g class="step ' + cls + '" fill="' + (fill || "#7EA6D6") + '" opacity=".8">' +
      '<ellipse cx="0" cy="0" rx="4.2" ry="7"/><circle cx="-2.6" cy="-9.5" r="1.6"/><circle cx="0" cy="-10.6" r="1.7"/><circle cx="2.5" cy="-9.8" r="1.5"/></g></g>';
  }
  // a framed window with its own sky (inner = content drawn in window space, clipped)
  function windowFrame(id, x, y, w, h, rx, inner, frame) {
    frame = frame || "#fff";
    return '<clipPath id="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '"/></clipPath>' +
      shadow(x + w / 2, y + h + 8, w * 0.55, 6) +
      '<g clip-path="url(#' + id + ')">' + inner + '<path d="M' + (x + w * 0.15) + " " + y + "l" + (w * 0.22) + " 0l" + (-w * 0.3) + " " + h + "l" + (-w * 0.22) + ' 0z" fill="#fff" opacity=".16"/></g>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="none" stroke="' + frame + '" stroke-width="8"/>' +
      '<rect x="' + (x - 2) + '" y="' + (y - 2) + '" width="' + (w + 4) + '" height="' + (h + 4) + '" rx="' + (rx + 2) + '" fill="none" stroke="#000" stroke-opacity=".06" stroke-width="1.5"/>' +
      '<path d="M' + (x + w / 2) + " " + y + "v" + h + "M" + x + " " + (y + h / 2) + "h" + w + '" stroke="' + frame + '" stroke-width="5"/>' +
      '<rect x="' + (x - 10) + '" y="' + (y + h) + '" width="' + (w + 20) + '" height="9" rx="4.5" fill="url(#dsWhite)"/>';
  }
  function floorShine(y) { return '<rect x="-800" y="' + y + '" width="2000" height="5" fill="#fff" opacity=".35"/><rect x="-800" y="' + (y + 5) + '" width="2000" height="6" fill="#000" opacity=".04"/>'; }
  function rug(cx, cy, rx, ry, c1, c2) {
    return '<ellipse cx="' + cx + '" cy="' + (cy + 3) + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity=".06"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + c1 + '"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + f(rx * 0.8) + '" ry="' + f(ry * 0.72) + '" fill="none" stroke="' + c2 + '" stroke-width="3" stroke-dasharray="7 5"/>';
  }
  function zz(x, y, col) {
    return '<text class="zz" x="' + x + '" y="' + y + '" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="20" fill="' + col + '">Z</text>' +
      '<text class="zz z2" x="' + (x + 14) + '" y="' + (y - 14) + '" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="15" fill="' + col + '">z</text>' +
      '<text class="zz z3" x="' + (x + 26) + '" y="' + (y - 26) + '" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="12" fill="' + col + '">z</text>';
  }
  function bird(x, y, s, col, cls) {
    return '<g class="bird ' + (cls || "") + '"><g transform="translate(' + x + " " + y + ") scale(" + (s || 1) + ')"><path class="flap" d="M-8 0q4-6 8 0q4-6 8 0" fill="none" stroke="' + (col || "#6A5A7A") + '" stroke-width="2.4" stroke-linecap="round"/></g></g>';
  }
  function butterfly(x, y, s) {
    return '<g class="flutter"><g transform="translate(' + x + " " + y + ") scale(" + s + ')"><g class="wing"><path d="M0 0C-6-12-18-10-14 0-18 10-6 10 0 0z" fill="#FF9FCB"/><path d="M0 0C6-12 18-10 14 0 18 10 6 10 0 0z" fill="#FFC56B"/></g><ellipse cx="0" cy="0" rx="1.6" ry="6" fill="#5A3A6A"/></g></g>';
  }
  function bed(x, y, w, quilt1, quilt2, wood, teddy) {
    // x,y = top-left of the mattress
    return shadow(x + w / 2, y + 70, w * 0.55, 8) +
      '<rect x="' + (x - 14) + '" y="' + (y - 46) + '" width="22" height="118" rx="10" fill="' + wood + '"/>' + gloss(x - 14, y - 46, 22, 118, 8, 0.5) +
      '<rect x="' + (x + w - 8) + '" y="' + (y - 10) + '" width="18" height="82" rx="8" fill="' + wood + '"/>' +
      '<rect x="' + x + '" y="' + (y + 14) + '" width="' + w + '" height="44" rx="12" fill="' + wood + '"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="26" rx="13" fill="url(#dsWhite)"/>' +
      '<rect x="' + (x + 6) + '" y="' + (y - 20) + '" width="58" height="30" rx="15" fill="url(#dsWhite)"/><ellipse cx="' + (x + 28) + '" cy="' + (y - 12) + '" rx="16" ry="4" fill="#fff"/>' +
      '<path d="M' + (x + 52) + " " + (y + 4) + "c30-10 " + (w - 70) + "-8 " + (w - 52) + " 0v40c-16 6-" + (w - 70) + " 6-" + (w - 52) + ' 0z" fill="' + quilt1 + '"/>' +
      '<path d="M' + (x + 52) + " " + (y + 4) + "c30-10 " + (w - 70) + "-8 " + (w - 52) + ' 0v8c-30-6-' + (w - 70) + "-4-" + (w - 52) + ' 4z" fill="#fff" opacity=".35"/>' +
      '<path d="M' + (x + 52) + " " + (y + 30) + "c30 6 " + (w - 70) + " 6 " + (w - 52) + ' 0" fill="none" stroke="' + quilt2 + '" stroke-width="3" stroke-dasharray="6 5"/>' +
      (teddy ? teddyBear(x + w - 40, y + 2, 0.85) : "");
  }
  function teddyBear(x, y, s) {
    // sitting teddy, bottom-centre at x,y
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><g class="rock">' +
      lg("dsTed", ["#E0A36A", "#B9773F"]) +
      '<ellipse cx="0" cy="-14" rx="15" ry="16" fill="url(#dsTed)"/><ellipse cx="0" cy="-10" rx="8" ry="9" fill="#F6D2A8"/>' +
      '<ellipse cx="-14" cy="-4" rx="6" ry="5" fill="url(#dsTed)"/><ellipse cx="14" cy="-4" rx="6" ry="5" fill="url(#dsTed)"/>' +
      '<circle cx="-11" cy="-44" r="6" fill="url(#dsTed)"/><circle cx="11" cy="-44" r="6" fill="url(#dsTed)"/><circle cx="-11" cy="-44" r="3" fill="#F6D2A8"/><circle cx="11" cy="-44" r="3" fill="#F6D2A8"/>' +
      '<circle cx="0" cy="-34" r="14" fill="url(#dsTed)"/><ellipse cx="0" cy="-29" rx="6.5" ry="5" fill="#F6D2A8"/>' +
      '<circle cx="-5" cy="-37" r="1.8" fill="#3A2418"/><circle cx="5" cy="-37" r="1.8" fill="#3A2418"/><ellipse cx="0" cy="-31" rx="2.2" ry="1.6" fill="#3A2418"/>' +
      '<path d="M-2.4-27.5q2.4 2 4.8 0" fill="none" stroke="#3A2418" stroke-width="1.1" stroke-linecap="round"/>' +
      '<path d="M-6-20l6 3 6-3-1 5-5-1-5 1z" fill="#FF6B8A"/><ellipse cx="-5" cy="-42" rx="4" ry="2.4" fill="#fff" opacity=".35"/></g></g>';
  }
  function lamp(x, y, s, on, switchOff) {
    // a little bedside lamp, base at x,y; switchOff: lit before the tap, off after (end state)
    var glow = '<circle class="glow" cx="0" cy="-34" r="44" fill="url(#dsHalo)"/>', lit = '<path d="M-16-30h32l-7-24h-18z" fill="#FFE08A"/>';
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' + (switchOff ? at("axout", 0.1, glow, 0.35).replace("<g ", '<g opacity="0" ') : on ? glow : "") + shadow(0, 0, 18, 3.6) +
      '<rect x="-3" y="-30" width="6" height="28" rx="3" fill="#C9B6F2"/><ellipse cx="0" cy="-2" rx="13" ry="4" fill="#A98FE6"/>' +
      '<path d="M-16-30h32l-7-24h-18z" fill="' + (switchOff ? "#A99AD8" : on ? "#FFE08A" : "#F3D9A6") + '"/>' + (switchOff ? at("axout", 0.1, lit, 0.3).replace("<g ", '<g opacity="0" ') : "") +
      '<path d="M-12-33l4-18h5l-3 18z" fill="#fff" opacity=".45"/></g>';
  }
  function clock(x, y, s) {
    // a ringing alarm clock, feet at x,y
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')"><g class="w-clk">' + shadow(0, 0, 16, 3) +
      '<path d="M-9-4l-4 4M9-4l4 4" stroke="#B4322E" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="-11" cy="-34" r="7" fill="#FFC23D"/><circle cx="11" cy="-34" r="7" fill="#FFC23D"/><rect x="-1.5" y="-38" width="3" height="6" fill="#B4322E"/>' +
      rg("dsClk", ["#FF8A7A", "#E5484D@.7", "#B4322E"], 0.35, 0.3, 0.8) +
      '<circle cx="0" cy="-18" r="16" fill="url(#dsClk)"/><circle cx="0" cy="-18" r="11.5" fill="#fff"/>' +
      '<path d="M0-26v8l5 3" stroke="#2B2F3A" stroke-width="2.2" stroke-linecap="round" fill="none"/><ellipse cx="-6" cy="-27" rx="4" ry="2.4" fill="#fff" opacity=".7"/></g>' +
      '<g class="w-ring" opacity="0"><g stroke="#FF8A3D" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M-22-42l-6-6M22-42l6-6M-26-24h-8M26-24h8"/><path d="M-30-36a26 26 0 0 0 0 26M30-36a26 26 0 0 1 0 26" stroke-width="2" opacity=".7"/></g></g></g>';
  }
  function bunting(x1, x2, y, cols) {
    var h = '<path d="M' + x1 + " " + y + "Q" + (x1 + x2) / 2 + " " + (y + 14) + " " + x2 + " " + y + '" fill="none" stroke="#C9A27A" stroke-width="1.6"/>', n = 7;
    for (var i = 0; i < n; i++) {
      var t = (i + 0.5) / n, xx = x1 + (x2 - x1) * t, yy = y + 28 * t * (1 - t);
      h += '<path d="M' + f(xx - 7) + " " + f(yy) + "h14l-7 13z" + '" fill="' + cols[i % cols.length] + '"/>';
    }
    return '<g class="swing">' + h + "</g>";
  }

  /* ───────────── tap actions ─────────────
     Every scene's markup is drawn in its END state ("after the child acted"), so the
     still home cards and other games that copy the SVG show the finished picture with
     no CSS at all. The live learn header (#sceneCard) adds the BEFORE state with CSS
     (pre) and, on tap, the class "acted" plays the motion (run) into the end state.
     Reduced motion: animations are off, so the end state simply appears. */
  function pre(sel, body) { return sel.split(",").map(function (s) { return "#sceneCard.ds:not(.acted) " + s.trim(); }).join(",") + "{" + body + "}"; }
  function geo(sel, body) { return sel.split(",").map(function (s) { return "#sceneCard.ds " + s.trim(); }).join(",") + "{" + body + "}"; }
  function run(sel, body) { return sel.split(",").map(function (s) { return "#sceneCard.ds.acted " + s.trim(); }).join(",") + "{" + body + "}"; }
  function mo(id, body, img) { return "#sceneCard.ds.acted[data-scene=" + id + "] .scene-mo-wrap" + (img ? " img" : "") + "{" + body + "}"; }
  var SPRING = "cubic-bezier(.34,1.56,.64,1)";
  var ACSS = [
    // generic: pop in · fade in · fade out · one-shot burst
    pre(".axpop,.axfade,.axsay", "opacity:0"), pre(".axout", "opacity:1"),
    run(".axpop", "animation:axPop .55s " + SPRING + " var(--d,0s) both"),
    // a speech bubble pops in, stays while it is read, then fades away (nothing left over the scene)
    run(".axsay", "animation:axPop .55s " + SPRING + " var(--d,0s) both,axOut .6s ease calc(var(--d,0s) + 3.4s) forwards"),
    run(".axfade", "animation:axFade var(--t,.8s) ease var(--d,0s) both"),
    run(".axout", "animation:axOut var(--t,.8s) ease var(--d,0s) both"),
    run(".axburst", "animation:axBurst var(--t,.7s) ease-out var(--d,0s) both"),
    "@keyframes axPop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}",
    "@keyframes axFade{from{opacity:0}to{opacity:1}}",
    "@keyframes axOut{from{opacity:1}to{opacity:0}}",
    "@keyframes axBurst{0%{opacity:0;transform:scale(.4)}30%{opacity:1}100%{opacity:0;transform:scale(1.6)}}",
    ".scene-fx{position:absolute;inset:0;z-index:3;pointer-events:none}",
    ".scene-fx svg{position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible}",
    "#sceneCard.ds.acted .scene-mo-wrap{transform-origin:50% 100%}",

    /* 1 · wake up: alarm rings, curtains open, the sun rises, the room lights up, Mo stretches */
    geo(".w-cl", "transform-box:fill-box;transform-origin:0 50%"), geo(".w-cr", "transform-box:fill-box;transform-origin:100% 50%"),
    pre(".w-cl", "transform:scaleX(2.2)"), pre(".w-cr", "transform:scaleX(2.05)"),
    run(".w-cl", "animation:wCl 1s cubic-bezier(.3,1.3,.5,1) .45s both"), run(".w-cr", "animation:wCr 1s cubic-bezier(.3,1.3,.5,1) .5s both"),
    "@keyframes wCl{from{transform:scaleX(2.2)}to{transform:none}}@keyframes wCr{from{transform:scaleX(2.05)}to{transform:none}}",
    pre(".w-sun", "transform:translateY(44px)"), run(".w-sun", "animation:wSun 1.3s cubic-bezier(.2,.8,.3,1) .7s both"),
    "@keyframes wSun{from{transform:translateY(44px)}to{transform:none}}",
    geo(".w-clk", "transform-box:fill-box;transform-origin:50% 100%"),
    run(".w-clk", "animation:wShake .08s linear 0s 10 alternate"),
    "@keyframes wShake{from{transform:rotate(-13deg) translateY(-2px)}to{transform:rotate(13deg) translateY(-1px)}}",
    run(".w-ring", "animation:wRing .95s ease-out both"),
    "@keyframes wRing{0%{opacity:0;transform:scale(.6)}15%,75%{opacity:1;transform:scale(1.08)}100%{opacity:0;transform:scale(1.25)}}",
    "#sceneCard.ds[data-scene=wakeup] .scene-mo-wrap img{transition:filter 1s ease .55s}",
    "#sceneCard.ds:not(.acted)[data-scene=wakeup] .scene-mo-wrap img{filter:brightness(.8) drop-shadow(0 4px 5px rgba(40,30,80,.22))}",
    mo("wakeup", "animation:wStretch 1s cubic-bezier(.3,1.3,.5,1) 1s both"),
    "@keyframes wStretch{0%,100%{transform:none}30%{transform:scale(1.05,.93)}62%{transform:translateY(calc(var(--u,1px)*-14)) scale(.97,1.06)}}",

    /* 2 · bathroom in: the door swings open, the LEFT foot steps in first, then the right */
    run(".b-glow", "animation:axFade .6s ease .35s both"), pre(".b-glow", "opacity:0"),
    mo("bathroom_in", "animation:bLean .7s ease-in-out .7s both"),
    "@keyframes bLean{50%{transform:translateX(calc(var(--u,1px)*-8)) rotate(-3deg)}}",

    /* 3 · bathroom out: the RIGHT foot steps out first, the happy drop jumps */
    geo(".b-drop", "transform-box:fill-box;transform-origin:50% 100%"),
    run(".b-drop", "animation:bJump .7s " + SPRING + " 1.05s both"),
    "@keyframes bJump{0%,100%{transform:none}30%{transform:scale(1.15,.85)}60%{transform:translateY(-16px) scale(.92,1.1)}}",
    mo("bathroom_out", "animation:bLean2 .7s ease-in-out .1s both"),
    "@keyframes bLean2{50%{transform:translateX(calc(var(--u,1px)*6)) rotate(3deg)}}",

    /* 4 · leave home: the bag hops onto Mo's back, the door swings open, warm light spills */
    geo(".lh-bag", "transform-box:fill-box;transform-origin:50% 100%"),
    pre(".lh-bag", "transform:translate(-138px,-14px) rotate(-8deg)"),
    run(".lh-bag", "animation:lhBag .7s cubic-bezier(.35,.1,.3,1) .05s both"),
    "@keyframes lhBag{0%{transform:translate(-138px,-14px) rotate(-8deg)}14%{transform:translate(-138px,-10px) scale(1.15,.85) rotate(-8deg)}55%{transform:translate(-62px,-78px) rotate(14deg)}100%{transform:none}}",
    mo("leave_home", "animation:lhHop .45s " + SPRING + " .68s both"),
    "@keyframes lhHop{0%,100%{transform:none}35%{transform:scale(1.05,.92)}70%{transform:translateY(calc(var(--u,1px)*-8))}}",

    /* 5 · riding: the seatbelt slides across and clicks, the engine starts, the town rolls by */
    pre(".v-belt", "stroke-dashoffset:84"), run(".v-belt", "animation:vBelt .5s cubic-bezier(.4,0,.2,1) .05s both"),
    "@keyframes vBelt{from{stroke-dashoffset:84}to{stroke-dashoffset:0}}",
    pre(".v-speed,.v-puff", "opacity:0"),
    run(".v-wheel", "animation:dsSpin .6s linear 1.05s infinite"),
    run(".v-dash", "animation:dsDash .9s linear 1.05s infinite"),
    run(".v-pass", "animation:vPass0 4.4s linear 1.05s 1 forwards,dsPass 7s linear 5.45s infinite"),
    run(".v-pass.p2", "animation:vPass1 2.4s linear 1.05s 1 forwards,dsPass 7s linear 3.45s infinite"),
    "@keyframes vPass0{to{transform:translateX(-340px)}}@keyframes vPass1{to{transform:translateX(-190px)}}",
    run(".v-speed", "animation:dsSpeed .8s ease-in 1.1s infinite"), run(".v-speed.v2", "animation-delay:1.37s"), run(".v-speed.v3", "animation-delay:1.64s"),
    run(".v-puff", "animation:vPuff 1.1s ease-out var(--d,1s) infinite"),
    "@keyframes vPuff{0%{opacity:0;transform:scale(.4)}25%{opacity:.85}100%{opacity:0;transform:translate(-28px,-12px) scale(1.5)}}",
    run(".v-bump", "animation:vStart .55s ease-out .8s both,dsBump .45s ease-in-out 1.35s infinite alternate"),
    "@keyframes vStart{0%,100%{transform:none}30%{transform:translate(5px,-5px) rotate(-1.6deg)}65%{transform:translate(-2px,0) rotate(.6deg)}}",
    mo("vehicle", "animation:dsBump .45s ease-in-out 1.35s infinite alternate"),
    "#sceneCard.ds.acted[data-scene=vehicle] .scene-fx{animation:dsBump .45s ease-in-out 1.35s infinite alternate}",

    /* 6 · study: the cover flips open, two pages turn, letters float up */
    geo(".st-c", "transform-box:fill-box;transform-origin:0 50%"), geo(".st-l", "transform-box:fill-box;transform-origin:100% 50%"),
    geo(".st-p", "transform-box:fill-box;transform-origin:0 50%"),
    pre(".st-c", "opacity:1;transform:none"), pre(".st-l", "transform:scaleX(0)"), pre(".st-p", "transform:none"), pre(".st-let", "opacity:0"),
    run(".st-c", "animation:stC .32s ease-in .02s both"), run(".st-l", "animation:stL .34s ease-out .32s both"),
    run(".st-p", "animation:stP .5s ease-in-out .72s both"), run(".st-p.p2", "animation-delay:1.02s"),
    run(".st-let", "animation:stLet .7s " + SPRING + " var(--d,1.3s) both"),
    "@keyframes stC{from{opacity:1;transform:none}99%{opacity:1;transform:scaleX(0)}to{opacity:0;transform:scaleX(0)}}",
    "@keyframes stL{from{transform:scaleX(0)}to{transform:none}}",
    "@keyframes stP{from{transform:none}to{transform:scaleX(-1)}}",
    "@keyframes stLet{from{opacity:0;transform:translateY(16px) scale(.4)}to{opacity:1;transform:none}}",

    /* 7 · eating: say Bismillah, the spoon lifts, scoops rice and comes to Mo's right hand */
    geo(".e-spoon", "transform-box:fill-box;transform-origin:50% 50%"),
    pre(".e-spoon", "transform:translate(-168px,-24px) rotate(62deg)"), pre(".e-rice", "opacity:0"),
    run(".e-spoon", "animation:eSpoon 1.35s cubic-bezier(.45,.05,.35,1) .35s both"), run(".e-rice", "animation:axFade .15s ease .95s both"),
    "@keyframes eSpoon{0%{transform:translate(-168px,-24px) rotate(62deg)}18%{transform:translate(-174px,-50px) rotate(10deg)}38%{transform:translate(-214px,-44px) rotate(-28deg)}48%{transform:translate(-216px,-34px) rotate(-38deg)}60%{transform:translate(-210px,-54px) rotate(-12deg)}100%{transform:none}}",

    /* 8 · after eating: three bites, the milk is drunk, the plate shines, pat-pat */
    geo(".ae-food,.ae-milk", "transform-box:fill-box;transform-origin:50% 100%"),
    pre(".ae-food", "opacity:1;transform:none"), pre(".ae-milk", "transform:none"),
    run(".ae-food", "animation:aeEat 1.05s ease .15s both"), run(".ae-milk", "animation:aeMilk .55s ease-in 1.05s both"),
    "@keyframes aeEat{0%{opacity:1;transform:none}10%{transform:scale(1.04,.96)}16%,40%{transform:scale(.72)}46%,70%{transform:scale(.44)}76%{opacity:1;transform:scale(.12)}84%,100%{opacity:0;transform:scale(0)}}",
    "@keyframes aeMilk{from{transform:none}to{transform:scaleY(.06)}}",
    mo("after_eat", "animation:aePat .7s ease-in-out 1.55s both"),
    "@keyframes aePat{0%,50%,100%{transform:none}25%,75%{transform:scale(1.03,.96)}}",

    /* 9 · rain: the closed umbrella swings up over Mo and springs open */
    geo(".r-umb", "transform-box:fill-box;transform-origin:50% 95%"), geo(".r-op", "transform-box:fill-box;transform-origin:50% 0"),
    pre(".r-umb", "transform:rotate(-36deg)"), pre(".r-op", "opacity:0;transform:scale(.1,.7)"), pre(".r-cl", "opacity:1"),
    run(".r-umb", "animation:rUp .5s cubic-bezier(.3,1.45,.5,1) .02s both"),
    run(".r-cl", "animation:axOut .1s linear .44s both"),
    run(".r-op", "animation:rOp .65s cubic-bezier(.3,1.7,.5,1) .42s both"),
    "@keyframes rUp{from{transform:rotate(-36deg)}to{transform:none}}",
    "@keyframes rOp{0%{opacity:0;transform:scale(.1,.7)}12%{opacity:1}100%{opacity:1;transform:none}}",
    run(".r-spl", "animation:rSpl .8s ease-out var(--d,1s) infinite"),
    "@keyframes rSpl{0%{opacity:0;transform:translateY(4px) scale(.5)}30%{opacity:.95}100%{opacity:0;transform:translateY(-8px) scale(1.2)}}",
    mo("rain", "animation:lhHop .5s " + SPRING + " 1.05s both"),

    /* 10 · coming home: knock-knock-knock, say salam, the door opens with warm light */
    geo(".e-door", "transform-box:fill-box;transform-origin:0 100%"),
    run(".e-door", "animation:eKnock .9s linear .02s both"),
    "@keyframes eKnock{0%,12%,33%,45%,66%,78%,100%{transform:none}3%,36%,69%{transform:translateX(1.8px) rotate(.7deg)}7%,40%,73%{transform:translateX(-1.3px) rotate(-.4deg)}}",

    /* 11 · evening: the sun slowly sinks behind the hills, the sky turns dusky, the first star */
    pre(".ev-sun", "transform:translateY(-50px)"), run(".ev-sun", "animation:evSun 1.9s cubic-bezier(.45,0,.35,1) .05s both"),
    "@keyframes evSun{from{transform:translateY(-50px)}to{transform:none}}",

    /* 12 · parents: Mo (beside Umi) gives a happy hop, Abi and Umi lean in towards him, a big heart pops over his head */
    geo(".p-abi,.p-umi", "transform-box:fill-box;transform-origin:50% 100%"),
    pre(".p-abi,.p-umi", "transform:none"),
    run(".p-abi", "animation:pAbi .7s " + SPRING + " .35s both"), run(".p-umi", "animation:pUmi .7s " + SPRING + " .3s both"),
    "@keyframes pAbi{from{transform:none}to{transform:rotate(2.5deg)}}@keyframes pUmi{from{transform:none}to{transform:rotate(3.5deg)}}",
    mo("parents", "animation:pHop .7s ease-out both"),
    "@keyframes pHop{0%,100%{transform:none}40%{transform:translateY(calc(var(--u,1px)*-14))}75%{transform:scale(1.05,.95)}}",

    /* 13 · tasbih: the finger taps and the beads light up one by one */
    geo(".t-tap", "transform-box:fill-box;transform-origin:50% 100%"),
    run(".t-tap", "animation:tTap .2s ease-in-out .4s 6"),
    "@keyframes tTap{50%{transform:translate(-2px,-4px) scale(.94)}}",

    /* 14 · sleep: click the switch, the lamp goes out, the room dims, glow stars appear */
    pre(".s-sw", "transform:translateY(-5px)"), run(".s-sw", "animation:sSw .14s ease-out .05s both"),
    "@keyframes sSw{from{transform:translateY(-5px)}to{transform:none}}",
    "#sceneCard.ds[data-scene=sleep] .scene-mo-wrap img{transition:filter .7s ease .2s}",
    "#sceneCard.ds.acted[data-scene=sleep] .scene-mo-wrap img{filter:brightness(.8) saturate(.9) drop-shadow(0 4px 5px rgba(10,10,40,.3))}",
    "@media (prefers-reduced-motion:reduce){#sceneCard.ds .scene-fx,#sceneCard.ds .scene-mo-wrap img{transition:none!important}}"
  ].join("\n");

  // an element shown with a delay (s) — the markup is its visible end state
  function at(cls, d, inner, t) { return '<g class="' + cls + '" style="--d:' + d + "s" + (t ? ";--t:" + t + "s" : "") + '">' + inner + "</g>"; }
  // a burst ring + four short rays: a one-shot "pop" mark
  function burst(x, y, r, col, d) {
    return '<g class="axburst" opacity="0" style="--d:' + d + 's"><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="2.4"/>' +
      '<path d="M' + x + " " + (y - r - 4) + "v-6M" + x + " " + (y + r + 4) + "v6M" + (x - r - 4) + " " + y + "h-6M" + (x + r + 4) + " " + y + 'h6" stroke="' + col + '" stroke-width="2.4" stroke-linecap="round"/></g>';
  }
  // a speech bubble (front layer); a short, chunky tail leans towards (tx, ty).
  // (It used to run all the way to (tx, ty): a long thin white sliver that stayed visible as a stray
  //  "white line" by Mo's hair whenever the bubble itself was hidden behind the du'a timeline pill.)
  function say(cx, cy, text, d, tx, ty) {
    var w = Math.round(text.length * 6.7 + 24), h = 26, x = cx - w / 2, y = cy - h / 2;
    var bx = cx + w * 0.3, by = y + h - 3, dx = tx - bx, dy = ty - by, n = Math.sqrt(dx * dx + dy * dy) || 1;
    var px = f(bx + dx / n * 10), py = f(Math.max(by + 6, by + dy / n * 10));
    return '<g class="axsay" style="--d:' + d + 's"><g filter="drop-shadow(0 3px 4px rgba(40,30,90,.25))">' +
      '<path d="M' + f(bx - 9) + " " + by + "Q" + f(bx - 1) + " " + f(by + 4) + " " + px + " " + py + "Q" + f(bx + 2) + " " + f(by + 2) + " " + f(bx + 7) + " " + by + 'z" fill="#fff"/>' +
      '<rect x="' + f(x) + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="13" fill="#fff"/></g>' +
      '<text x="' + cx + '" y="' + (cy + 4.6) + '" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="13" fill="#2B2F3A">' + text + "</text></g>";
  }
  // a real footprint: right foot pointing up (big toe on the inner/left side); left = mirrored
  function footP(x, y, rot, left, fill, cls, d) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + rot + ") scale(" + (left ? -1.75 : 1.75) + ',1.75)"><g class="' + (cls || "axpop") + '" style="--d:' + d + 's" fill="' + fill + '">' +
      '<path d="M-3.5-6C-2-9.5 4.5-9 5-4.5 5.4-1 3.4 2 3.4 5 3.4 8.5 1.6 10-.4 10S-3.6 8.4-3.4 5.5C-3.2 3-1.2 1-2.4-1.5-3.4-3.4-4.4-4-3.5-6z"/>' +
      '<circle cx="-2.4" cy="-11.4" r="2.1"/><circle cx=".7" cy="-12.6" r="1.5"/><circle cx="3.1" cy="-12" r="1.3"/><circle cx="5" cy="-10.4" r="1.15"/><circle cx="6.2" cy="-8.2" r="1"/></g></g>';
  }
  /* A door leaf that swings open on its hinge in perspective (SMIL path morph, so it
     works in every browser incl. Safari). o: x,y,w,h = the closed leaf; hinge "l"/"r";
     max = opening angle (deg); at/dur = seconds after the tap; parts: {q:[u0,v0,u1,v1]}
     quads or {e:[u,v,rx,ry]} ellipses in leaf units (u across from the hinge, v down). */
  function doorSwing(o) {
    var N = 16, D = 260, ye = o.y + o.h * 0.42, ts = [], i;
    for (i = 0; i <= N; i++) ts.push(i / N);
    function th(t) { var c1 = 1.25, c3 = c1 + 1, e = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); return e * o.max * Math.PI / 180; }
    function P(u, v, a) {
      var xr = u * o.w * Math.cos(a), z = u * o.w * Math.sin(a), s = D / (D + z);
      return [o.hinge === "r" ? o.x + o.w - xr * s : o.x + xr * s, ye + (o.y + v * o.h - ye) * s, s];
    }
    function quad(q, a) { var p = [P(q[0], q[1], a), P(q[2], q[1], a), P(q[2], q[3], a), P(q[0], q[3], a)]; return "M" + p.map(function (pt) { return f(pt[0]) + " " + f(pt[1]); }).join("L") + "Z"; }
    var kt = ts.map(function (t) { return t.toFixed(4); }).join(";");
    function an(attr, vals) { return '<animate class="dsx" data-at="' + o.at + '" attributeName="' + attr + '" begin="indefinite" dur="' + o.dur + 's" fill="freeze" calcMode="linear" keyTimes="' + kt + '" values="' + vals.join(";") + '"/>'; }
    var out = "";
    (o.parts || []).concat([{ q: [0, 0, 1, 1], shade: 1 }]).forEach(function (p) {
      if (p.q) {
        var vals = ts.map(function (t) { return quad(p.q, th(t)); });
        if (p.shade) out += '<path d="' + vals[0] + '" fill="#2A1608" opacity="0">' + an("d", vals) + an("opacity", ts.map(function (t) { return f(0.32 * Math.sin(th(t))); })) + "</path>";
        else out += '<path d="' + vals[0] + '" fill="' + p.fill + '"' + (p.op ? ' opacity="' + p.op + '"' : "") + (p.round ? ' stroke="' + p.fill + '" stroke-width="' + p.round + '" stroke-linejoin="round"' : "") + ">" + an("d", vals) + "</path>";
      } else if (p.e) {
        var cx = [], cy = [], rx = [], ry = [];
        ts.forEach(function (t) { var a = th(t), c = P(p.e[0], p.e[1], a); cx.push(f(c[0])); cy.push(f(c[1])); rx.push(f(p.e[2] * Math.max(Math.cos(a), 0.04) * c[2])); ry.push(f(p.e[3] * c[2])); });
        out += '<ellipse cx="' + cx[0] + '" cy="' + cy[0] + '" rx="' + rx[0] + '" ry="' + ry[0] + '" fill="' + (p.fill || "none") + '"' + (p.stroke ? ' stroke="' + p.stroke + '" stroke-width="' + p.sw + '"' : "") + ">" + an("cx", cx) + an("cy", cy) + an("rx", rx) + an("ry", ry) + "</ellipse>";
      }
    });
    return '<g class="' + (o.cls || "") + '">' + out + "</g>";
  }

  /* ───────────── action sounds (WebAudio synth, no files; silent when muted) ───────────── */
  var _ac = null, _nb = null;
  function sndMuted() { try { return localStorage.getItem("bm_muted") === "1"; } catch (e) { return false; } }
  function actx() {
    if (_ac) return _ac;
    try { _ac = (typeof window.getAudioCtx === "function" && window.getAudioCtx()) || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { _ac = null; }
    return _ac;
  }
  function Synth(c, t0) {
    var out = c.createGain(); out.gain.value = 0.75; out.connect(c.destination);
    function env(g, t, d, vol, a) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (a || 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, t + d); }
    function tone(t, fr, d, o) {
      o = o || {}; t = t0 + t;
      var os = c.createOscillator(), g = c.createGain(), n = os;
      os.type = o.type || "sine"; os.frequency.setValueAtTime(fr, t);
      if (o.f2) os.frequency.exponentialRampToValueAtTime(o.f2, t + (o.ft || d));
      if (o.lp) { var bq = c.createBiquadFilter(); bq.type = "lowpass"; bq.frequency.value = o.lp; os.connect(bq); n = bq; }
      if (o.trem) { var l = c.createOscillator(), lg2 = c.createGain(), tg = c.createGain(); l.frequency.value = o.trem; lg2.gain.value = 0.5; tg.gain.value = 0.5; l.connect(lg2); lg2.connect(tg.gain); n.connect(tg); n = tg; l.start(t); l.stop(t + d + 0.05); }
      env(g, t, d, o.vol || 0.15, o.a); n.connect(g); g.connect(out); os.start(t); os.stop(t + d + 0.05);
    }
    function noise(t, d, o) {
      o = o || {}; t = t0 + t;
      if (!_nb) { _nb = c.createBuffer(1, c.sampleRate, c.sampleRate); var ch = _nb.getChannelData(0); for (var i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
      var s = c.createBufferSource(), bq = c.createBiquadFilter(), g = c.createGain();
      s.buffer = _nb; bq.type = o.type || "bandpass"; bq.frequency.setValueAtTime(o.f || 1000, t); bq.Q.value = o.q || 1;
      if (o.f2) bq.frequency.exponentialRampToValueAtTime(o.f2, t + d);
      env(g, t, d, o.vol || 0.15, o.a); s.connect(bq); bq.connect(g); g.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05);
    }
    var T = { tone: tone, noise: noise };
    // little building blocks
    T.knock = function (t) { tone(t, 210, 0.11, { f2: 120, vol: 0.34 }); noise(t, 0.05, { f: 900, q: 1.4, vol: 0.32 }); };
    T.creak = function (t, d) { var fr = 0; for (var k = 0; k < d / 0.035; k++) { fr = 900 + 300 * Math.sin(k * 0.7); noise(t + k * 0.035, 0.03, { f: fr, q: 9, vol: 0.05 + 0.03 * Math.sin(k * 0.4) * Math.sin(k * 0.4) }); } };
    T.click = function (t, v) { noise(t, 0.018, { type: "highpass", f: 2600, vol: 0.2 * (v || 1) }); tone(t, 2200, 0.03, { vol: 0.06 * (v || 1), type: "triangle" }); };
    T.whoosh = function (t, d, a, b, v) { noise(t, d, { f: a, f2: b, q: 0.9, vol: v || 0.12, a: d * 0.4 }); };
    T.chime = function (t, fr, d, v) { tone(t, fr, d || 1.2, { vol: v || 0.09, a: 0.005 }); tone(t, fr * 2.76, (d || 1.2) * 0.5, { vol: (v || 0.09) * 0.25 }); tone(t, fr * 5.4, (d || 1.2) * 0.25, { vol: (v || 0.09) * 0.1 }); };
    T.step = function (t) { noise(t, 0.07, { type: "lowpass", f: 520, vol: 0.4 }); tone(t, 130, 0.07, { f2: 70, vol: 0.14 }); };
    T.drip = function (t) { tone(t, 650, 0.09, { f2: 1500, ft: 0.06, vol: 0.12 }); };
    T.pop = function (t, k) { tone(t, 380 * (k || 1), 0.1, { f2: 920 * (k || 1), ft: 0.07, vol: 0.13 }); };
    T.flip = function (t) { noise(t, 0.15, { f: 2400, f2: 5200, q: 0.8, vol: 0.13, a: 0.05 }); };
    T.clink = function (t) { tone(t, 2650, 0.32, { vol: 0.06 }); tone(t, 3950, 0.2, { vol: 0.035 }); tone(t, 5300, 0.12, { vol: 0.02 }); };
    T.nom = function (t) { tone(t, 280, 0.1, { f2: 190, type: "triangle", vol: 0.13 }); noise(t + 0.02, 0.06, { type: "lowpass", f: 900, vol: 0.12 }); };
    T.sparkle = function (t) { [1568, 2093, 2637].forEach(function (fr, k) { T.chime(t + k * 0.07, fr, 0.5, 0.045); }); };
    return T;
  }
  var SND = {
    wakeup: function (T) {
      for (var k = 0; k < 11; k++) T.tone(k * 0.075, k % 2 ? 1760 : 1480, 0.07, { type: "triangle", vol: 0.075 });
      T.whoosh(0.45, 0.6, 500, 1600, 0.09); T.whoosh(0.5, 0.6, 600, 1800, 0.07);
      [523, 659, 784, 1047].forEach(function (fr, k) { T.chime(1.0 + k * 0.12, fr, 0.9, 0.07); });
    },
    bathroom_in: function (T) { T.creak(0.03, 0.6); T.step(0.8); T.step(1.12); T.drip(1.35); T.drip(1.55); },
    bathroom_out: function (T) { T.step(0.3); T.step(0.62); T.step(0.94); T.drip(1.1); T.sparkle(1.25); },
    leave_home: function (T) { T.whoosh(0.05, 0.25, 2000, 5200, 0.1); T.whoosh(0.3, 0.3, 800, 300, 0.08); T.step(0.72); T.click(0.75, 0.6); T.creak(0.8, 0.65); T.tone(1.45, 2600, 0.08, { f2: 3400, vol: 0.05 }); T.tone(1.56, 2900, 0.1, { f2: 3700, vol: 0.05 }); },
    vehicle: function (T) {
      T.whoosh(0.03, 0.45, 1200, 3500, 0.08); T.click(0.53); T.click(0.6, 0.7);
      T.tone(0.85, 52, 0.95, { type: "sawtooth", f2: 110, ft: 0.45, lp: 520, vol: 0.16, a: 0.06 });
      T.tone(1.25, 110, 0.6, { type: "sawtooth", f2: 82, lp: 420, vol: 0.1, a: 0.05 });
      T.tone(1.7, 523, 0.12, { type: "triangle", vol: 0.06 }); T.tone(1.84, 659, 0.16, { type: "triangle", vol: 0.06 });
    },
    study: function (T) { T.whoosh(0.02, 0.32, 700, 2400, 0.1); T.tone(0.32, 160, 0.09, { f2: 90, vol: 0.12 }); T.flip(0.72); T.flip(1.02); T.sparkle(1.3); },
    eating: function (T) { T.chime(0.05, 784, 0.7, 0.06); T.chime(0.17, 1047, 0.7, 0.06); T.tone(0.45, 1800, 0.04, { vol: 0.04 }); T.clink(0.95); T.clink(1.12); T.pop(1.6, 1.2); },
    after_eat: function (T) { T.nom(0.25); T.nom(0.55); T.nom(0.85); T.tone(1.1, 320, 0.13, { f2: 640, vol: 0.09 }); T.tone(1.32, 320, 0.13, { f2: 640, vol: 0.09 }); T.sparkle(1.4); T.tone(1.6, 140, 0.08, { f2: 90, vol: 0.16 }); T.tone(1.95, 140, 0.08, { f2: 90, vol: 0.16 }); },
    rain: function (T) {
      T.whoosh(0, 0.38, 400, 1300, 0.1);
      T.noise(0.44, 0.22, { type: "lowpass", f: 300, f2: 1700, vol: 0.32 }); T.tone(0.44, 100, 0.2, { f2: 58, vol: 0.24 });
      for (var k = 0; k < 22; k++) { var t = 0.7 + Math.random() * 1.3; T.noise(t, 0.025, { f: 2600 + Math.random() * 2600, q: 2.5, vol: 0.05 + Math.random() * 0.05 }); }
    },
    enter_home: function (T) { T.knock(0.04); T.knock(0.34); T.knock(0.64); T.chime(1.0, 659, 0.9, 0.07); T.chime(1.18, 523, 1.1, 0.07); T.creak(1.15, 0.6); },
    evening_dhikr: function (T) { [784, 659, 523].forEach(function (fr, k) { T.chime(0.15 + k * 0.32, fr, 1.4, 0.06); }); T.chime(1.3, 2093, 0.9, 0.05); T.chime(1.42, 3136, 0.7, 0.03); },
    parents: function (T) { T.tone(0, 300, 0.25, { f2: 520, vol: 0.08 }); T.pop(0.65); T.pop(0.88, 1.2); T.pop(1.08, 1.4); [523, 659, 784].forEach(function (fr) { T.chime(0.7, fr, 1.1, 0.04); }); },
    bedtime_tasbih: function (T) { for (var k = 0; k < 6; k++) { T.noise(0.5 + k * 0.2, 0.02, { f: 2600, q: 3, vol: 0.3 }); T.tone(0.5 + k * 0.2, 1500 + k * 60, 0.04, { vol: 0.04 }); } T.chime(1.75, 1047, 0.9, 0.06); },
    sleep: function (T) { T.click(0.05); T.whoosh(0.15, 0.6, 1400, 300, 0.06); [1568, 1760, 2093, 2349].forEach(function (fr, k) { T.chime(0.65 + k * 0.16, fr, 0.7, 0.04); }); }
  };
  function playSnd(id) {
    if (sndMuted() || !SND[id]) return;
    var c = actx(); if (!c) return;
    try { if (c.state === "suspended") c.resume(); SND[id](Synth(c, c.currentTime + 0.02)); } catch (e) {}
  }

  /* ───────────── the 14 scenes ─────────────
     each: pose (Baby Mo render), mo {x, y, h} in frame units, svg (defs + art) */
  var SCENES = {
    /* 1 · Bangun tidur — a sunrise bedroom: big window, bed with teddy, ringing alarm clock */
    wakeup: {
      pose: "baby-mo-pose-41", mo: { x: 306, y: 128, h: 200 },
      svg: function () {
        return "<defs>" + lg("dsWall", ["#FFF4E4", "#FFE0C2"]) + lg("dsSkyW", ["#FFA77E", "#FFC890@.45", "#FFF0C8"]) + lg("dsFl", ["#F7CF9C", "#E4A56A"]) +
          lg("dsCur", ["#FFB9CB", "#FF8EAE"], "h") + lg("dsQuilt", ["#86CDF8", "#4E9DEA"]) + lg("dsWood", ["#E9AE78", "#C27E46"]) +
          lg("dsBeam", ["#FFF6D0~.6", "#FFF6D0~0"]) + lg("dsHill", ["#A9E08F", "#6CC06A"]) +
          '<pattern id="dsDots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="2.2" fill="#FFCFA6" opacity=".55"/><circle cx="19" cy="19" r="2.2" fill="#FFCFA6" opacity=".55"/></pattern></defs>' +
          bg("url(#dsWall)") + bg("url(#dsDots)") +
          '<circle cx="128" cy="-46" r="160" fill="#FFE6B0" opacity=".45"/>' +
          bunting(222, 400, -112, ["#FF8FB0", "#FFD25A", "#7FD3F7", "#9BE07F"]) +
          windowFrame("dsWinW", 52, -98, 152, 104, 18,
            '<rect x="52" y="-98" width="152" height="104" fill="url(#dsSkyW)"/>' +
            '<g class="w-sun">' + sun(128, -14, 20, true) + "</g>" +
            '<path d="M52-2c26-16 50-18 76-8s52 8 76-6v22H52z" fill="url(#dsHill)"/>' + tree(80, 0, 0.42) + tree(178, -2, 0.36) +
            cloud(92, -66, 0.55) + cloud(176, -76, 0.42, "drift d2") + bird(120, -60, 0.8, "#8A5A48") +
            '<rect class="axout" opacity="0" style="--d:.5s;--t:1.1s" x="52" y="-98" width="152" height="104" fill="#3A3F86" fill-opacity=".6"/>' +
            star(80, -76, 3, "", "#fff") .replace("<polygon", '<polygon class="axout" opacity="0" style="--d:.5s"') + star(170, -60, 2.4, "", "#fff").replace("<polygon", '<polygon class="axout" opacity="0" style="--d:.5s"')) +
          plant(186, -3, 0.62, "sway") +
          '<g class="w-cl"><path class="sway" d="M30-112h40c-6 46-2 84 8 124H30z" fill="url(#dsCur)"/></g><g class="w-cr"><path class="sway" d="M226-112h-40c6 46 2 84-8 124h48z" fill="url(#dsCur)"/></g>' +
          '<rect x="20" y="-118" width="216" height="9" rx="4.5" fill="#E9897A"/><circle cx="20" cy="-113.5" r="6" fill="#FFB49A"/><circle cx="236" cy="-113.5" r="6" fill="#FFB49A"/>' +
          band(40, "url(#dsFl)") + floorShine(40) +
          '<path class="beam" d="M64 6h132l70 100H40z" fill="url(#dsBeam)"/>' +
          rug(250, 112, 120, 16, "#FFC3D3", "#fff") +
          bed(-34, 30, 196, "url(#dsQuilt)", "#BFE6FF", "url(#dsWood)", true) +
          // nightstand + clock
          shadow(208, 84, 26, 5) + '<rect x="186" y="34" width="44" height="50" rx="8" fill="url(#dsWood)"/>' + gloss(186, 34, 44, 50, 6, 0.45) +
          '<rect x="192" y="52" width="32" height="4" rx="2" fill="#A86A38" opacity=".5"/>' + clock(208, 34, 0.95) +
          sparkle(236, -60, 0.9, "twinkle", "#FFC94A") + sparkle(30, -30, 0.6, "twinkle t2", "#fff") + sparkle(254, -20, 0.55, "twinkle t3", "#FFB0C4") +
          plant(-40, 52, 1, "sway") + plant(440, 52, 1.05, "sway") +
          // the room before the curtains open: a soft early-morning dimness
          '<rect class="axout" opacity="0" style="--d:.55s;--t:1.1s" x="-800" y="-900" width="2000" height="1500" fill="#2B2456" fill-opacity=".3"/>' +
          burst(128, -50, 26, "#FFE07A", 1.25) + sparkle(96, -84, 0.8, "axpop", "#FFF3B0").replace('class="axpop"', 'class="axpop" style="--d:1.4s"') + sparkle(168, -30, 0.6, "axpop", "#FFF3B0").replace('class="axpop"', 'class="axpop" style="--d:1.55s"');
      }
    },

    /* 2 · Masuk kamar mandi — footprints toward the bathroom door, left foot first */
    bathroom_in: {
      pose: "baby-mo-pose-42", flip: true, mo: { x: 310, y: 128, h: 196 },
      svg: function () {
        return "<defs>" + lg("dsFl", ["#CFE6F7", "#A8CBEA"]) + lg("dsDoor", ["#D99A62", "#B4743F"]) + lg("dsTub", ["#FFFFFF", "#D8ECF8"]) + lg("dsTowel", ["#FFC1D3", "#FF8FB0"]) +
          lg("dsDuck", ["#FFE36A", "#FFB81F"]) + lg("dsMir", ["#F3FBFF", "#BFE3F7"], "d") +
          '<pattern id="dsTile" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#E3F6FD"/><rect x="1.5" y="1.5" width="23" height="23" rx="5" fill="#EEFAFF"/><rect x="4" y="3.5" width="12" height="5" rx="2.5" fill="#fff" opacity=".9"/></pattern></defs>' +
          bg("url(#dsTile)") + band(-30, "#BDE6F6", 10) + band(-27, "#D5F1FB", 3) +
          '<circle cx="90" cy="-20" r="120" fill="#fff" opacity=".35"/>' +
          // the bathroom door, open a little, warm light + bath inside
          shadow(92, 42, 64, 6) + '<rect x="36" y="-92" width="112" height="134" rx="10" fill="#9C6A40"/>' +
          '<rect x="44" y="-84" width="96" height="126" rx="6" fill="#CFF1FF"/>' +
          '<path d="M56 12h60a6 6 0 0 1 6 6v6a16 16 0 0 1-16 16H66a16 16 0 0 1-16-16v-6a6 6 0 0 1 6-6z" fill="url(#dsTub)"/><rect x="50" y="6" width="76" height="10" rx="5" fill="#fff"/>' +
          '<circle class="bubble" cx="70" cy="6" r="6" fill="#fff" stroke="#9ED8F5"/><circle class="bubble b2" cx="96" cy="4" r="4.5" fill="#fff" stroke="#9ED8F5"/><circle class="bubble b3" cx="112" cy="6" r="7" fill="#fff" stroke="#9ED8F5"/>' +
          '<path class="b-glow" d="M44 42h96l34 26H10z" fill="#E9FBFF" fill-opacity=".75"/>' +
          // the door: swings open on its left hinge when Mo taps
          doorSwing({ x: 44, y: -84, w: 96, h: 126, hinge: "l", max: 74, at: 0.05, dur: 1.0, parts: [
            { q: [0, 0, 1, 1], fill: "url(#dsDoor)", round: 8 }, { q: [0.06, 0.03, 0.94, 0.3], fill: "#fff", op: 0.18 },
            { q: [0.11, 0.1, 0.89, 0.47], fill: "#C4844E", round: 6 }, { q: [0.11, 0.56, 0.89, 0.92], fill: "#C4844E", round: 6 },
            { e: [0.5, 0.29, 15, 15], fill: "#fff" }, { e: [0.5, 0.31, 6, 8.5], fill: "#38BDF8" }, { e: [0.875, 0.51, 5.5, 5.5], fill: "url(#dsGold)" }] }) +
          // mirror + sink
          '<rect x="174" y="-94" width="66" height="74" rx="33" fill="#fff"/><rect x="179" y="-89" width="56" height="64" rx="28" fill="url(#dsMir)"/>' +
          '<clipPath id="dsMirC"><rect x="179" y="-89" width="56" height="64" rx="28"/></clipPath><g clip-path="url(#dsMirC)"><rect class="shine" x="200" y="-110" width="12" height="110" fill="#fff" opacity=".85" transform="rotate(20 206 -57)"/></g>' +
          shadow(207, 42, 30, 5) + '<rect x="200" y="0" width="14" height="42" rx="5" fill="url(#dsWhite)"/>' +
          '<path d="M172-8h70l-6 18a12 12 0 0 1-12 8h-34a12 12 0 0 1-12-8z" fill="url(#dsWhite)"/><rect x="168" y="-14" width="78" height="10" rx="5" fill="#fff"/>' +
          '<rect x="203" y="-26" width="8" height="14" rx="3" fill="#A9B8C8"/><path d="M207-24h12v6" stroke="#A9B8C8" stroke-width="5" fill="none" stroke-linecap="round"/>' +
          '<circle class="bubble b2" cx="188" cy="-16" r="5" fill="#fff" stroke="#9ED8F5"/><circle class="bubble b4" cx="226" cy="-16" r="4" fill="#fff" stroke="#9ED8F5"/>' +
          // towel
          '<g class="swing"><rect x="370" y="-80" width="4" height="10" fill="#A9B8C8"/><rect x="356" y="-72" width="32" height="54" rx="7" fill="url(#dsTowel)"/><rect x="356" y="-32" width="32" height="7" fill="#FF7FA3"/></g>' +
          band(40, "url(#dsFl)") + floorShine(40) +
          rug(104, 54, 40, 7, "#FFD6E4", "#fff") +
          // rubber duck by the door
          '<g transform="translate(24 50)"><g class="rock">' + shadow(0, 2, 14, 3) + '<path d="M-12-2c0-10 8-12 14-10 2-8 14-8 14 2 0 4-3 6-4 7 4 0 8 2 6 6-2 3-6 3-30 3-2 0 0-6 0-8z" fill="url(#dsDuck)"/>' +
          '<path d="M14-10l7 2-7 2z" fill="#FF8A3D"/><circle cx="9" cy="-12" r="1.7" fill="#2B2F3A"/><ellipse cx="2" cy="-14" rx="3" ry="2" fill="#fff" opacity=".7"/></g></g>' +
          // into the bathroom: the LEFT foot steps over the threshold first (gold), then the right
          '<ellipse class="axfade" style="--d:.8s;--t:.3s" cx="122" cy="56" rx="17" ry="7" fill="#FFE07A" fill-opacity=".55"/>' +
          footP(122, 56, -90, true, "#F4A21C", "axpop", 0.8) + burst(122, 56, 13, "#FFC23D", 0.85) + footP(90, 47, -90, false, "#7EA6D6", "axpop", 1.12) +
          sparkle(160, -70, 0.7, "twinkle", "#fff") + sparkle(254, -84, 0.6, "twinkle t2", "#7FD3F7") +
          plant(-42, 52, 1, "sway") + '<g transform="translate(430 52)">' + shadow(0, 0, 22, 4) + '<rect x="-20" y="-60" width="40" height="60" rx="8" fill="#fff"/><rect x="-16" y="-50" width="32" height="10" rx="5" fill="#FFC1D3"/><rect x="-16" y="-34" width="32" height="10" rx="5" fill="#9ED8F5"/></g>';
      }
    },

    /* 3 · Keluar kamar mandi — fresh & sparkly, footprints out, right foot first */
    bathroom_out: {
      pose: "baby-mo-pose-07", mo: { x: 310, y: 128, h: 196 },
      svg: function () {
        return "<defs>" + lg("dsFl", ["#CDEFDF", "#A2DCC1"]) + lg("dsDoor", ["#D99A62", "#B4743F"]) + lg("dsLight", ["#FFF7D6~.9", "#FFF7D6~0"], "h") + lg("dsTowel", ["#B4EBD3", "#7FD0AE"]) +
          rg("dsDrop", ["#C9F1FF", "#5EC8F5@.7", "#2E9FDB"], 0.35, 0.3, 0.8) +
          '<pattern id="dsTile2" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#DDF7EC"/><rect x="1.5" y="1.5" width="23" height="23" rx="5" fill="#EAFBF3"/><rect x="4" y="3.5" width="12" height="5" rx="2.5" fill="#fff" opacity=".9"/></pattern></defs>' +
          bg("url(#dsTile2)") + band(-30, "#BDEBD7", 10) +
          // door wide open, bright light pouring out
          shadow(92, 42, 64, 6) + '<rect x="36" y="-92" width="112" height="134" rx="10" fill="#8A6A4B"/><rect x="44" y="-84" width="96" height="126" rx="6" fill="#FFF3C4"/>' +
          '<path class="beam" d="M140-80l110 30v100l-110-8z" fill="url(#dsLight)"/>' +
          '<path d="M44-84l-26-10v148l26-12z" fill="url(#dsDoor)"/><circle cx="26" cy="-16" r="3.6" fill="url(#dsGold)"/>' +
          '<circle class="glow" cx="92" cy="-20" r="46" fill="url(#dsHalo)"/>' +
          // smiling water drop
          '<g transform="translate(206 -58)"><g class="b-drop"><g class="float">' + shadow(0, 48, 18, 4) +
          '<path d="M0-30C-14-10-22 2-22 12a22 22 0 0 0 44 0c0-10-8-22-22-42z" fill="url(#dsDrop)"/>' +
          '<ellipse cx="-9" cy="2" rx="4" ry="7" fill="#fff" opacity=".6" transform="rotate(20 -9 2)"/>' +
          '<circle class="blink" cx="-7" cy="12" r="2.6" fill="#0B4A6F"/><circle class="blink" cx="7" cy="12" r="2.6" fill="#0B4A6F"/><path d="M-6 20q6 6 12 0" stroke="#0B4A6F" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
          '<circle cx="-13" cy="18" r="3" fill="#FF8FB0" opacity=".6"/><circle cx="13" cy="18" r="3" fill="#FF8FB0" opacity=".6"/></g></g></g>' +
          '<g class="swing"><rect x="372" y="-80" width="4" height="10" fill="#9FB5AA"/><rect x="358" y="-72" width="32" height="54" rx="7" fill="url(#dsTowel)"/><rect x="358" y="-32" width="32" height="7" fill="#5FC79A"/></g>' +
          band(40, "url(#dsFl)") + floorShine(40) +
          // out of the bathroom toward Mo: the RIGHT foot steps out first (gold), then left, then right
          '<ellipse class="axfade" style="--d:.3s;--t:.3s" cx="158" cy="54" rx="17" ry="7" fill="#FFE07A" fill-opacity=".6"/>' +
          footP(158, 54, 90, false, "#F4A21C", "axpop", 0.3) + burst(158, 54, 13, "#FFC23D", 0.35) + footP(190, 64, 90, true, "#6FB89A", "axpop", 0.62) + footP(222, 54, 90, false, "#6FB89A", "axpop", 0.94) +
          burst(206, -40, 34, "#fff", 1.1) +
          '<circle class="bubble" cx="170" cy="20" r="7" fill="#fff" stroke="#9EE8C8"/><circle class="bubble b2" cx="250" cy="10" r="5" fill="#fff" stroke="#9EE8C8"/><circle class="bubble b3" cx="140" cy="0" r="5.5" fill="#fff" stroke="#9EE8C8"/><circle class="bubble b4" cx="230" cy="24" r="4" fill="#fff" stroke="#9EE8C8"/>' +
          sparkle(160, -64, 1.1, "twinkle", "#fff") + sparkle(256, -92, 0.9, "twinkle t2", "#FFE27A") + sparkle(250, -6, 0.9, "twinkle t3", "#fff") + sparkle(118, -100, 0.7, "twinkle t4", "#FFE27A") + sparkle(372, 2, 0.7, "twinkle", "#fff") +
          plant(-42, 52, 1, "sway") + plant(440, 52, 1, "sway");
      }
    },

    /* 4 · Sebelum makan — a sunny dining corner, a full plate, steam rising */
    eating: {
      pose: "baby-mo-pose-05", mo: { x: 318, y: 128, h: 192 },
      svg: function () {
        return "<defs>" + lg("dsWall", ["#FFF7DE", "#FFE7B8"]) + lg("dsSky", ["#8FD3FF", "#DDF3FF"]) + lg("dsFl", ["#F0C48F", "#DCA46A"]) + lg("dsTop", ["#E9B07A", "#C98A52"]) +
          lg("dsBowl", ["#9EE2FF", "#4FB6EC"]) + rg("dsApple", ["#FF9A8A", "#F0484A@.7", "#C22E35"], 0.35, 0.3, 0.8) + rg("dsLampG", ["#FFF1B0~.95", "#FFF1B0~0"]) +
          '<pattern id="dsCloth" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#FFF"/><rect width="8" height="8" fill="#FFB0B0"/><rect x="8" y="8" width="8" height="8" fill="#FFB0B0"/></pattern>' +
          '<pattern id="dsStripe" width="34" height="10" patternUnits="userSpaceOnUse"><rect width="17" height="10" fill="#FFEFC8" opacity=".7"/></pattern></defs>' +
          bg("url(#dsWall)") + bg("url(#dsStripe)") + band(-4, "#F6D7A0", 8) +
          windowFrame("dsWinE", 30, -96, 128, 84, 16,
            '<rect x="30" y="-96" width="128" height="84" fill="url(#dsSky)"/>' + sun(132, -70, 12, true) + cloud(70, -60, 0.5) + cloud(120, -36, 0.35, "drift d2") +
            '<path d="M30-24c30-10 60-12 90-4s30 4 38 0v16H30z" fill="#9FDA8E"/>') +
          // hanging lamp
          '<g class="swing"><path d="M212-130v52" stroke="#8A6A4B" stroke-width="2"/><circle class="glow" cx="212" cy="-60" r="40" fill="url(#dsLampG)"/><path d="M194-62a18 16 0 0 1 36 0z" fill="#FF9A6A"/><path d="M198-66a14 10 0 0 1 10-8" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/><circle cx="212" cy="-60" r="5" fill="#FFF3B0"/></g>' +
          band(40, "url(#dsFl)") + floorShine(40) +
          // table + cloth
          shadow(110, 100, 150, 10) + '<rect x="0" y="54" width="12" height="50" rx="4" fill="#B97D4A"/><rect x="214" y="54" width="12" height="50" rx="4" fill="#B97D4A"/>' +
          '<rect x="-30" y="22" width="276" height="22" rx="10" fill="url(#dsTop)"/>' +
          '<path d="M-34 16h284v20c-7 8-13 8-20 0-7 8-13 8-20 0-7 8-13 8-20 0-7 8-13 8-20 0-7 8-13 8-20 0-7 8-13 8-20 0-7 8-13 8-20 0-7 8-13 8-20 0-7 8-13 8-20 0-7 8-13 8-20 0-7 8-13 8-20 0-7 8-13 8-20 0-7 8-13 8-20 0-7 8-13 8-24 0z" fill="url(#dsCloth)"/>' +
          '<rect x="-34" y="14" width="284" height="6" rx="3" fill="#fff" opacity=".5"/>' +
          // plate: rice dome + egg + greens
          '<ellipse cx="62" cy="16" rx="44" ry="9" fill="#000" opacity=".08"/><ellipse cx="62" cy="13" rx="44" ry="10" fill="url(#dsWhite)"/><ellipse cx="62" cy="12" rx="32" ry="6" fill="#F2F6FA"/>' +
          '<path d="M36 12c0-18 12-26 24-26s22 8 22 26z" fill="url(#dsWhite)"/><ellipse cx="50" cy="-6" rx="7" ry="4" fill="#fff"/>' +
          '<ellipse cx="88" cy="8" rx="13" ry="6" fill="#fff"/><circle cx="88" cy="7" r="5" fill="url(#dsGold)"/><path d="M30 10q6-8 12-2M34 8q2-8 8-6" stroke="#5FBF7A" stroke-width="4" fill="none" stroke-linecap="round"/>' +
          '<path class="steam" d="M52-24c-5-6 5-10 0-16" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/><path class="steam s2" d="M66-26c-5-6 5-10 0-16" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
          // soup bowl
          '<path d="M118-4h52c0 14-10 22-26 22s-26-8-26-22z" fill="url(#dsBowl)"/><ellipse cx="144" cy="-4" rx="26" ry="5" fill="#F7A733"/><ellipse cx="136" cy="-5" rx="5" ry="2" fill="#FFD27A"/><path d="M124 0q4 8 10 10" stroke="#fff" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/>' +
          '<path class="steam s3" d="M136-14c-5-6 5-10 0-16" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/><path class="steam" d="M152-12c-5-6 5-10 0-16" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
          // glass of water + apple + spoon
          '<path d="M182-16h22l-2.5 32h-17z" fill="url(#dsGlass)" stroke="#9ED8F5" stroke-width="2"/><path d="M184.2 0h17.6l-1.2 15h-15.2z" fill="#7DD3FC" opacity=".7"/><rect x="186" y="-12" width="4" height="22" rx="2" fill="#fff" opacity=".8"/>' +
          '<circle cx="226" cy="4" r="11" fill="url(#dsApple)"/><path d="M226-7q2-6 7-6" stroke="#5A8F3C" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M227-8c2-4 6-5 9-4-2 4-6 5-9 4z" fill="#7BC46A"/><ellipse cx="222" cy="0" rx="3" ry="2" fill="#fff" opacity=".7"/>' +
          sparkle(258, -40, 0.8, "twinkle", "#FFC94A") + sparkle(170, -60, 0.6, "twinkle t2", "#FF9AB0") +
          plant(-50, 52, 1.05, "sway") + plant(440, 52, 1, "sway");
      },
      // front layer: "Bismillah!", then the spoon (end state: in Mo's right hand, with rice)
      fx: function (card) {
        return (card ? "" : say(214, -46, "Bismillah!", 0.05, 276, -30)) +
          '<g transform="translate(280 30)"><g class="e-spoon">' +
          '<rect x="-2" y="-6" width="4" height="30" rx="2" fill="#C9CED6" stroke="#A9B1BD" stroke-width="1"/><rect x="-1" y="0" width="1.4" height="20" rx=".7" fill="#fff" opacity=".7"/>' +
          '<ellipse cx="0" cy="-14" rx="6.5" ry="9" fill="#E3E7EE" stroke="#A9B1BD" stroke-width="1.2"/><ellipse cx="-2" cy="-17" rx="2" ry="3.5" fill="#fff" opacity=".8"/>' +
          '<g class="e-rice"><path d="M-5.5-15c0-6 3-8 5.5-8s5.5 2 5.5 8z" fill="#fff" stroke="#E6E9EF" stroke-width=".8"/><circle cx="-2" cy="-19" r="1.2" fill="#F2F4F8"/></g></g></g>' +
          burst(280, 18, 18, "#FFC94A", 1.7);
      }
    },

    /* 5 · Doa belajar — a cosy study corner: shelf, desk lamp, an open book with letters floating up */
    study: {
      pose: "baby-mo-idea", mo: { x: 318, y: 128, h: 196 },
      svg: function () {
        return "<defs>" + lg("dsWall", ["#F3EEFF", "#E2D8FF"]) + lg("dsFl", ["#DDB88C", "#C69C6C"]) + lg("dsDesk", ["#E2AE76", "#C48A50"]) +
          lg("dsLampC", ["#FFF4C2~.9", "#FFF4C2~0"]) + lg("dsShade", ["#9B7CF0", "#6E4FD8"]) + lg("dsCov", ["#9B7CF0", "#6E4FD8"], "d") + rg("dsGlobe", ["#A7E6FF", "#3FA6E8@.7", "#2470B8"], 0.35, 0.3, 0.8) +
          '<pattern id="dsSt" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M10 8l1.5 3 3 .5-2.2 2 .6 3-2.9-1.5-2.9 1.5.6-3-2.2-2 3-.5z" fill="#D5C8FF" opacity=".6"/></pattern></defs>' +
          bg("url(#dsWall)") + bg("url(#dsSt)") +
          // shelf with books + plant
          '<rect x="16" y="-56" width="132" height="9" rx="4" fill="#B993E8"/>' + shadow(82, -46, 66, 3) +
          '<rect x="24" y="-96" width="14" height="40" rx="3" fill="#FF8FAE"/><rect x="40" y="-90" width="12" height="34" rx="3" fill="#7DD3FC"/><rect x="54" y="-100" width="15" height="44" rx="3" fill="#FFC94A"/>' +
          '<rect x="71" y="-88" width="12" height="32" rx="3" fill="#86E0A9"/><rect x="85" y="-94" width="14" height="38" rx="3" fill="#A78BFA"/><rect x="101" y="-84" width="10" height="28" rx="3" fill="#FF9A6A" transform="rotate(14 106 -70)"/>' +
          '<g opacity=".45" fill="#fff"><rect x="26" y="-92" width="4" height="30" rx="2"/><rect x="56" y="-96" width="4" height="34" rx="2"/><rect x="87" y="-90" width="4" height="28" rx="2"/></g>' +
          plant(132, -56, 0.7, "sway") +
          // alphabet poster
          '<g class="swing"><rect x="172" y="-104" width="68" height="56" rx="8" fill="#fff"/><rect x="176" y="-100" width="60" height="48" rx="6" fill="#FFF7E0"/>' +
          '<text x="190" y="-66" text-anchor="middle" font-family="Amiri Quran, Amiri, serif" font-size="22" fill="#E8590C">ا</text><text x="206" y="-66" text-anchor="middle" font-family="Amiri Quran, Amiri, serif" font-size="22" fill="#0A9488">ب</text><text x="223" y="-66" text-anchor="middle" font-family="Amiri Quran, Amiri, serif" font-size="22" fill="#7C5CE0">ت</text></g>' +
          band(40, "url(#dsFl)") + floorShine(40) +
          // desk
          shadow(110, 100, 150, 10) + '<rect x="-4" y="40" width="12" height="62" rx="4" fill="#B98552"/><rect x="214" y="40" width="12" height="62" rx="4" fill="#B98552"/>' +
          '<rect x="-30" y="20" width="270" height="22" rx="8" fill="url(#dsDesk)"/>' + gloss(-30, 20, 270, 22, 8, 0.5) +
          // lamp
          '<path class="glow" d="M168-38h40l50 58H122z" fill="url(#dsLampC)"/>' +
          '<path d="M170-62l-10 26h52l-10-26z" fill="url(#dsShade)"/><path d="M168-40l6-18h6l-5 18z" fill="#fff" opacity=".4"/><rect x="184" y="-36" width="5" height="52" rx="2.5" fill="#5B42B8"/><ellipse cx="186" cy="18" rx="17" ry="4.5" fill="#5B42B8"/>' +
          // open book + flipping page + letters
          '<path d="M44 18l42-6 42 6v-4l-42-6-42 6z" fill="#C7BCEB"/>' +
          // the book: closed (cover on top) until Mo taps; the cover flips open, two pages turn, letters float up
          '<g class="st-l"><path d="M44 15c13-7 29-8 42-5v-24c-13-3-29-2-42 5z" fill="#fff" stroke="#D7CCF5" stroke-width="2"/><path d="M52-2l24-4M52 5l20-3" stroke="#C7BCEB" stroke-width="2.4" stroke-linecap="round"/></g>' +
          '<path d="M128 15c-13-7-29-8-42-5v-24c13-3 29-2 42 5z" fill="#fff" stroke="#D7CCF5" stroke-width="2"/><path d="M96-6l24 4M96 1l20 3" stroke="#C7BCEB" stroke-width="2.4" stroke-linecap="round"/>' +
          '<path class="st-p" d="M86 10v-24c12-3 26-2 38 4v24c-12-6-26-7-38-4z" fill="#FAF7FF" stroke="#D7CCF5" stroke-width="1.6"/>' +
          '<path class="st-p p2" d="M86 10v-24c12-3 26-2 38 4v24c-12-6-26-7-38-4z" fill="#F3EEFF" stroke="#D7CCF5" stroke-width="1.6"/>' +
          '<g class="st-c" opacity="0"><path d="M85 12c15-4 31-3 45 4v-28c-14-7-30-8-45-4z" fill="url(#dsCov)" stroke="#5B42B8" stroke-width="2" stroke-linejoin="round"/>' +
          '<path d="M85 12v-28" stroke="#4A33A0" stroke-width="4" stroke-linecap="round"/>' + star(108, -2, 7, "", "#FFE07A") + '<path d="M92-12c10-3 22-2 32 3" stroke="#fff" stroke-width="2.4" fill="none" opacity=".35" stroke-linecap="round"/></g>' +
          '<g class="st-let" style="--d:1.3s"><text class="float" x="62" y="-26" font-family="Amiri Quran, Amiri, serif" font-size="24" fill="#7C5CE0">ا</text></g>' +
          '<g class="st-let" style="--d:1.45s"><text class="float2" x="84" y="-36" font-family="Amiri Quran, Amiri, serif" font-size="24" fill="#E8590C">ب</text></g>' +
          '<g class="st-let" style="--d:1.6s"><text class="float" x="106" y="-26" font-family="Amiri Quran, Amiri, serif" font-size="24" fill="#0A9488">ت</text></g>' +
          burst(86, -6, 22, "#FFC94A", 1.25) +
          // pencil cup + globe
          '<rect x="2" y="-8" width="22" height="26" rx="5" fill="#7DD3FC"/><rect x="6" y="-26" width="4" height="22" rx="2" fill="#FFC94A" transform="rotate(-10 8 -15)"/><rect x="13" y="-28" width="4" height="24" rx="2" fill="#FF8FAE"/><rect x="18" y="-22" width="4" height="18" rx="2" fill="#86E0A9" transform="rotate(12 20 -13)"/><rect x="5" y="-5" width="4" height="18" rx="2" fill="#fff" opacity=".5"/>' +
          '<rect x="226" y="10" width="4" height="10" fill="#8A6A4B"/><ellipse cx="228" cy="19" rx="10" ry="3" fill="#8A6A4B"/><circle cx="228" cy="-6" r="15" fill="url(#dsGlobe)"/><path d="M220-12c4-2 8 2 6 6s-8 2-8 8M232-2c3 2 6 0 7 4" stroke="#7BC46A" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="222" cy="-14" rx="4" ry="2.5" fill="#fff" opacity=".7"/>' +
          sparkle(262, -54, 0.9, "twinkle", "#FFC94A") + sparkle(150, -26, 0.6, "twinkle t2", "#A78BFA") + sparkle(250, -100, 0.6, "twinkle t3", "#FF8FAE") +
          plant(-46, 52, 1, "sway") + '<g transform="translate(432 52)">' + shadow(0, 0, 24, 4) + '<rect x="-22" y="-70" width="44" height="70" rx="6" fill="#C9A27A"/><rect x="-18" y="-64" width="10" height="26" rx="2" fill="#FF8FAE"/><rect x="-6" y="-60" width="10" height="22" rx="2" fill="#7DD3FC"/><rect x="6" y="-66" width="10" height="28" rx="2" fill="#FFC94A"/><rect x="-18" y="-30" width="36" height="4" rx="2" fill="#A47A50"/></g>';
      }
    },

    /* 6 · Sebelum tidur — a soft night room, smiling moon, bed with stars, night lamp, Zzz */
    sleep: {
      pose: "baby-mo-pose-39", mo: { x: 314, y: 130, h: 138 },
      svg: function () {
        return "<defs>" + lg("dsWall", ["#4A4FA8", "#383C8C"]) + lg("dsSkyN", ["#232C6A", "#4B4FA8"]) + lg("dsFl", ["#5A5AB0", "#3E3F8A"]) +
          lg("dsQuilt", ["#B49CFF", "#8467EE"]) + lg("dsWood", ["#7A7FD8", "#5559B8"]) + rg("dsNl", ["#FFE29A~.8", "#FFE29A~0"]) +
          '<pattern id="dsSt" width="46" height="46" patternUnits="userSpaceOnUse"><path d="M12 10l1.5 3 3 .5-2.2 2 .6 3-2.9-1.5-2.9 1.5.6-3-2.2-2 3-.5z" fill="#8C90E8" opacity=".55"/><circle cx="34" cy="32" r="1.6" fill="#8C90E8" opacity=".6"/></pattern></defs>' +
          bg("url(#dsWall)") + bg("url(#dsSt)") +
          windowFrame("dsWinS", 40, -100, 118, 96, 48,
            '<rect x="40" y="-100" width="118" height="96" fill="url(#dsSkyN)"/>' + moon(116, -64, 18, "#2A3270", "float2") +
            star(64, -78, 4, "twinkle", "#fff") + star(80, -38, 3, "twinkle t2", "#FFE29A") + star(140, -22, 3.4, "twinkle t3", "#fff") + cloud(76, -20, 0.42, "drift slow", 0.5, "#7A80D0"), "#8C90E8") +
          '<path class="sway" d="M26-112h34c-6 40-2 76 6 104H26z" fill="#7C6BE0" opacity=".9"/><path class="sway" d="M172-112h-34c6 40 2 76-6 104h40z" fill="#7C6BE0" opacity=".9"/>' +
          '<rect x="18" y="-118" width="162" height="8" rx="4" fill="#A99BF5"/>' +
          star(212, -90, 4.2, "twinkle t4", "#FFE29A") + star(250, -60, 3, "twinkle", "#fff") + star(206, -40, 2.6, "twinkle t3", "#fff") + star(380, -100, 3.4, "twinkle t2", "#FFE29A") +
          band(40, "url(#dsFl)") + floorShine(40) +
          rug(268, 116, 110, 15, "#6E62C8", "#A99BF5") +
          bed(-40, 34, 200, "url(#dsQuilt)", "#E2D8FF", "url(#dsWood)", true) +
          star(70, 52, 4.4, "", "#FFE29A") + star(108, 60, 3.6, "", "#FFE29A") + star(140, 48, 3, "", "#FFE29A") +
          // nightstand + lamp
          shadow(214, 86, 26, 5) + '<rect x="192" y="40" width="44" height="46" rx="8" fill="url(#dsWood)"/>' + gloss(192, 40, 44, 46, 6, 0.35) + lamp(214, 40, 1, true, true) +
          // the light switch on the wall
          '<rect x="241" y="-24" width="16" height="24" rx="4" fill="#E6E0FF"/><rect x="245" y="-19" width="8" height="14" rx="2" fill="#B9AEE8"/><rect class="s-sw" x="246" y="-12" width="6" height="6" rx="1.6" fill="#fff"/>' +
          plant(-46, 52, 1, "") + plant(444, 52, 1, "") +
          // lamp light warms the room before; after the click it goes dark (the window keeps its moonlight)
          '<rect class="axout" opacity="0" style="--d:.1s;--t:.4s" x="-800" y="-900" width="2000" height="1500" fill="#FFD98A" fill-opacity=".12"/>' +
          '<path class="axfade" style="--d:.12s;--t:.7s" fill-rule="evenodd" fill="#0B0E38" fill-opacity=".38" d="M-800-900h2000v1500h-2000zM88-100h22a48 48 0 0 1 48 48a48 48 0 0 1-48 48h-22a48 48 0 0 1-48-48a48 48 0 0 1 48-48z"/>' +
          '<path class="axfade" style="--d:.7s;--t:.8s" d="M56-4h86l70 120H-6z" fill="#CFE0FF" fill-opacity=".16"/>' +
          // glow-in-the-dark stars on the wall
          [[214, -84, 5, 0.65], [262, -48, 4, 0.8], [190, -40, 3.4, 0.95], [236, -104, 3, 1.1], [300, -92, 3.6, 1.0]].map(function (p, i) { return at("axpop", p[3], star(p[0], p[1], p[2], "twinkle t" + (i % 4 + 1), "#FFF1A8")); }).join("") +
          at("axfade", 1.0, zz(356, -20, "#E0E4FF"));
      }
    },

    /* 7 · Keluar rumah — a sunny front yard; on tap the bag hops onto Mo's back and the door swings open */
    leave_home: {
      pose: "baby-mo-run", mo: { x: 312, y: 128, h: 194 },
      svg: function () {
        return "<defs>" + lg("dsSky", ["#7CC8FF", "#BFE6FF@.6", "#EAF7FF"]) + lg("dsHillB", ["#B5E2A0", "#8DCF83"]) + lg("dsGrass", ["#9FDC82", "#6CC062"]) +
          lg("dsWallH", ["#FFF8EA", "#F6E2C2"]) + lg("dsRoof", ["#FF7A6B", "#D9483F"]) + lg("dsDoor", ["#D99A62", "#B4743F"]) + lg("dsPath", ["#F6E3B8", "#E8CC92"]) +
          lg("dsIn", ["#FFE7A6", "#FFC86B"]) + lg("dsBag", ["#5AA8F0", "#2F78D0"]) + lg("dsSpill", ["#FFE9A6~.85", "#FFE9A6~0"]) + "</defs>" +
          bg("url(#dsSky)") + sun(250, -78, 14, true) +
          cloud(150, -96, 0.7) + cloud(370, -70, 0.55, "drift d2") + cloud(-30, -60, 0.6, "drift slow") +
          bird(276, -50, 0.9, "#4A6A8A") + bird(300, -62, 0.7, "#4A6A8A", "k2") +
          '<path d="M-800 10Q-100-30 0 4Q90-26 190 0Q300-30 400 -4Q600-30 1200 0V300H-800Z" fill="url(#dsHillB)"/>' +
          tree(264, 4, 0.72) + tree(400, 2, 0.8) + tree(16, 8, 0.8) +
          // house, centred so its door sits in the middle of a phone screen
          shadow(134, 46, 92, 7) + '<rect x="54" y="-56" width="160" height="102" rx="6" fill="url(#dsWallH)"/>' + '<rect x="54" y="-56" width="160" height="10" fill="#000" opacity=".05"/>' +
          '<rect x="170" y="-110" width="18" height="34" rx="3" fill="#C9564A"/>' +
          '<path d="M40-50L134-112L228-50Z" fill="url(#dsRoof)" stroke="url(#dsRoof)" stroke-width="10" stroke-linejoin="round"/><path d="M60-56L134-104L208-56" stroke="#FFF7E8" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
          '<path d="M100-86l20-13" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/>' +
          '<circle cx="134" cy="-72" r="10" fill="#9ED8FF" stroke="#fff" stroke-width="3"/>' +
          '<rect x="66" y="-36" width="38" height="34" rx="6" fill="#9ED8FF" stroke="#fff" stroke-width="4"/><path d="M85-36v34M66-19h38" stroke="#fff" stroke-width="3"/><rect x="62" y="-2" width="46" height="9" rx="4" fill="#C98A5B"/><circle cx="70" cy="-4" r="3.4" fill="#FF8FB8"/><circle cx="84" cy="-5" r="3.4" fill="#FFE066"/><circle cx="98" cy="-4" r="3.4" fill="#FF8FB8"/>' +
          '<rect x="164" y="-36" width="38" height="34" rx="6" fill="#9ED8FF" stroke="#fff" stroke-width="4"/><path d="M183-36v34M164-19h38" stroke="#fff" stroke-width="3"/>' +
          // the doorway: a warm, lit hallway behind the door
          '<rect x="114" y="-23" width="42" height="70" rx="5" fill="#7A4E2C"/><rect x="117" y="-20" width="36" height="66" rx="2" fill="url(#dsIn)"/>' +
          '<rect x="117" y="30" width="36" height="16" fill="#E9A65A" opacity=".55"/><circle cx="141" cy="-6" r="5" fill="#fff" opacity=".7"/><circle class="glow" cx="141" cy="-6" r="13" fill="url(#dsHalo)"/>' +
          doorSwing({ x: 117, y: -20, w: 36, h: 66, hinge: "l", max: 76, at: 0.78, dur: 0.85, parts: [
            { q: [0, 0, 1, 1], fill: "url(#dsDoor)", round: 4 }, { q: [0.06, 0.03, 0.94, 0.28], fill: "#fff", op: 0.16 },
            { q: [0.15, 0.09, 0.85, 0.45], fill: "#C4844E", round: 4 }, { q: [0.15, 0.55, 0.85, 0.91], fill: "#C4844E", round: 4 },
            { e: [0.82, 0.52, 3.2, 3.2], fill: "url(#dsGold)" }] }) +
          '<rect x="106" y="44" width="58" height="8" rx="4" fill="#E3B47E"/>' +
          band(52, "url(#dsGrass)") +
          '<path d="M118 52C126 70 190 66 236 74S300 96 330 120L250 140C220 110 160 96 106 80Z" fill="url(#dsPath)"/>' +
          // warm light spilling out of the open door onto the path
          '<path class="axfade" style="--d:1.05s;--t:.6s" d="M117 46h36l30 30H100z" fill="url(#dsSpill)"/>' +
          // fence (left, decoration)
          '<g fill="#fff">' + [-84, -66, -48, -30].map(function (x) { return '<path d="M' + x + ' 50v-30l6-7 6 7v30z"/>'; }).join("") + '<rect x="-88" y="26" width="76" height="5" rx="2"/><rect x="-88" y="40" width="76" height="5" rx="2"/></g>' +
          bush(232, 58, 0.8, true) + bush(34, 58, 0.95, true) +
          // shoes waiting on the step
          '<path d="M166 50q7-7 16 0v5h-16zM182 50q7-7 16 0v5h-16z" fill="#3D7EE3"/><path d="M169 49q4-3 8-1" stroke="#fff" stroke-width="1.6" fill="none"/>' +
          // the school bag: drawn on Mo's back (end state); before the tap it waits by the shoes
          '<g transform="translate(352 58)"><g class="lh-bag">' + shadow(0, 0, 15, 3) +
          '<path d="M-7-36q7-9 14 0" stroke="#1F5FB0" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
          '<rect x="-15" y="-36" width="30" height="36" rx="10" fill="url(#dsBag)"/><path d="M-15-24q15 8 30 0v-4c0-6-5-8-15-8s-15 2-15 8z" fill="#7FC0FF"/>' +
          '<rect x="-9" y="-14" width="18" height="11" rx="4" fill="#FFC94A"/><rect x="-6" y="-12" width="6" height="2.4" rx="1.2" fill="#fff" opacity=".7"/>' +
          '<rect x="-12" y="-33" width="5" height="16" rx="2.5" fill="#fff" opacity=".35"/></g></g>' +
          butterfly(234, -30, 0.9) +
          sparkle(300, -100, 0.7, "twinkle", "#fff") + sparkle(170, -6, 0.9, "axpop", "#FFE07A").replace('class="axpop"', 'class="axpop" style="--d:1.2s"') + tree(-60, 54, 1) + tree(460, 54, 1);
      }
    },

    /* 8 · Naik kendaraan — a red family car driving through a sunny town */
    vehicle: {
      pose: "baby-mo-pose-15", mo: { x: 326, y: 128, h: 194 },
      svg: function () {
        return "<defs>" + lg("dsSky", ["#78C5FF", "#B9E3FF@.6", "#E8F6FF"]) + lg("dsCar", ["#FF8676", "#E5484D@.6", "#B8323A"]) + lg("dsRoad", ["#6B7380", "#596170"]) +
          lg("dsWalk", ["#E9E1D2", "#D7CCB8"]) + lg("dsGrass", ["#A6DE88", "#7CC66C"]) + lg("dsWin", ["#D9F3FF", "#9ED6F5"], "d") +
          lg("dsB1", ["#FFD3B0", "#F6B48A"]) + lg("dsB2", ["#C9E2FF", "#9FC6F2"]) + lg("dsB3", ["#FFE7A3", "#F5CB6A"]) + lg("dsB4", ["#E3D4FF", "#C2ACF5"]) + "</defs>" +
          bg("url(#dsSky)") + sun(40, -88, 16, true) + cloud(160, -92, 0.7) + cloud(290, -72, 0.5, "drift d2") + cloud(470, -86, 0.6, "drift slow") + cloud(-80, -80, 0.6) +
          // town skyline
          (function () {
            var h = "", B = [[-90, 60, "dsB2"], [-40, 80, "dsB4"], [0, 64, "dsB1"], [44, 96, "dsB2"], [96, 70, "dsB3"], [140, 108, "dsB4"], [196, 80, "dsB1"], [246, 92, "dsB2"], [300, 66, "dsB3"], [344, 100, "dsB4"], [400, 76, "dsB1"], [446, 90, "dsB2"]];
            B.forEach(function (b) {
              var x = b[0], hh = b[1], w = 42, y = 20 - hh;
              h += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="6" fill="url(#' + b[2] + ')"/><rect x="' + (x + 4) + '" y="' + (y + 4) + '" width="6" height="' + (hh - 8) + '" rx="3" fill="#fff" opacity=".35"/>';
              for (var r = y + 10; r < 8; r += 16) h += '<rect x="' + (x + 14) + '" y="' + r + '" width="8" height="9" rx="2" fill="#fff" opacity=".75"/><rect x="' + (x + 27) + '" y="' + r + '" width="8" height="9" rx="2" fill="#fff" opacity=".75"/>';
            });
            return h;
          })() +
          band(18, "url(#dsGrass)") +
          '<g class="v-pass"><g transform="translate(300 0)">' + tree(0, 26, 0.7) + "</g></g>" + '<g class="v-pass p2"><g transform="translate(150 0)">' + tree(0, 26, 0.6) + bush(30, 28, 0.6, true) + "</g></g>" +
          // road
          band(28, "url(#dsRoad)", 64) + band(28, "#C9CED6", 4) + band(88, "#C9CED6", 4) +
          '<g class="v-dash">' + [-60, -12, 36, 84, 132, 180, 228, 276, 324, 372, 420, 468].map(function (x) { return '<rect x="' + x + '" y="57" width="26" height="5" rx="2.5" fill="#FFE066"/>'; }).join("") + "</g>" +
          band(92, "url(#dsWalk)") + floorShine(92) +
          // speed lines
          '<g stroke="#fff" stroke-width="3" stroke-linecap="round"><path class="v-speed" d="M6 -4h22"/><path class="v-speed v2" d="M0 12h26"/><path class="v-speed v3" d="M8 26h18"/></g>' +
          // exhaust puffs once the engine starts
          [0.95, 1.3, 1.65].map(function (d, i) { return '<circle class="v-puff" opacity="0" style="--d:' + d + 's" cx="' + (26 - i * 3) + '" cy="' + (12 - i) + '" r="' + (5 + i) + '" fill="#fff"/>'; }).join("") +
          // the car
          '<g transform="translate(34 -36)"><g class="v-bump">' + shadow(92, 92, 92, 7) +
          '<path d="M6 70v-18c0-12 8-20 20-22l30-4 26-26c5-5 11-6 18-6h44c8 0 14 3 18 8l20 24h12c16 2 24 12 24 26v18c0 6-4 10-10 10H16C10 80 6 76 6 70z" fill="url(#dsCar)"/>' +
          '<path d="M64 26l26-24h22v24zM120 26V2h20c4 0 7 2 9 4l18 20z" fill="url(#dsWin)"/>' +
          '<path d="M70 22l14-13h5L76 22z M126 22V8h4v14z" fill="#fff" opacity=".6"/>' +
          '<path d="M20 36c40-6 120-8 186-2" stroke="#fff" stroke-width="5" fill="none" opacity=".4" stroke-linecap="round"/>' +
          '<path d="M116 26v48" stroke="#B8323A" stroke-width="2.4"/><rect x="128" y="38" width="14" height="4" rx="2" fill="#8E2229"/>' +
          '<ellipse cx="208" cy="44" rx="7" ry="5.5" fill="#FFF7C2"/><rect x="2" y="44" width="8" height="10" rx="3" fill="#FF9A3C"/>' +
          '<rect x="8" y="66" width="208" height="8" rx="4" fill="#B8323A" opacity=".6"/>' +
          [52, 172].map(function (x) { return '<g transform="translate(' + x + ' 78)"><g class="v-wheel"><circle r="19" fill="#2B2F3A"/><circle r="10" fill="#D5DAE2"/><path d="M0-9v18M-9 0h18" stroke="#9AA2AE" stroke-width="3"/><circle r="3.5" fill="#6A7280"/></g></g>'; }).join("") +
          "</g></g>" +
          // traffic sign
          '<g transform="translate(-56 92)">' + shadow(0, 0, 10, 2.4) + '<rect x="-2.5" y="-90" width="5" height="90" fill="#A9B2BE"/><circle cx="0" cy="-90" r="14" fill="#3A8EE6" stroke="#fff" stroke-width="3"/><path d="M-6-90h12M2-95l5 5-5 5" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>' +
          sparkle(266, -40, 0.8, "twinkle", "#fff") + sparkle(120, -84, 0.6, "twinkle t2", "#fff") + tree(470, 92, 1);
      },
      // front layer: the seatbelt across Mo, buckled with a click
      fx: function () {
        return '<path class="v-belt" d="M322 34L366 90" stroke="#34405A" stroke-width="8" stroke-linecap="round" stroke-dasharray="84"/>' +
          '<path class="axfade" style="--d:.45s;--t:.2s" d="M322 34L366 90" stroke="#6A7A9A" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 4"/>' +
          at("axpop", 0.5, '<rect x="356" y="80" width="20" height="13" rx="4" fill="#C9D1DC" stroke="#8792A2" stroke-width="1.6" transform="rotate(52 366 86)"/><rect x="361" y="84" width="10" height="5" rx="2" fill="#E5484D" transform="rotate(52 366 86)"/>') +
          burst(366, 86, 13, "#FFE07A", 0.55);
      }
    },

    /* 9 · Sesudah makan — a clean, shiny plate, a glass of milk and a happy tummy */
    after_eat: {
      pose: "baby-mo-thank-you", mo: { x: 318, y: 128, h: 196 },
      svg: function () {
        return "<defs>" + lg("dsWall", ["#FFF1E2", "#FFDCC0"]) + lg("dsSky", ["#9FDBFF", "#E2F5FF"]) + lg("dsFl", ["#F2C796", "#DDA66C"]) + lg("dsTop", ["#7FD3C0", "#4DB8A2"]) +
          lg("dsCur", ["#FFC6A8", "#FF9F7A"], "h") + lg("dsMilk", ["#FFFFFF", "#F1F4FA"]) +
          '<pattern id="dsTiles" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#E7F7F3"/><rect x="1" y="1" width="20" height="20" rx="4" fill="#F4FCFA"/></pattern></defs>' +
          bg("url(#dsWall)") + '<rect x="-800" y="-30" width="2000" height="70" fill="url(#dsTiles)"/><rect x="-800" y="-32" width="2000" height="5" fill="#BFE6DA"/>' +
          windowFrame("dsWinA", 40, -104, 116, 66, 14, '<rect x="40" y="-104" width="116" height="66" fill="url(#dsSky)"/>' + sun(70, -80, 11, true) + cloud(120, -78, 0.42) + '<path d="M40-48c26-8 52-8 76-2s32 2 40 0v10H40z" fill="#9FDA8E"/>') +
          '<path class="sway" d="M24-118h30c-4 30-2 52 6 80H24z" fill="url(#dsCur)"/><path class="sway" d="M172-118h-30c4 30 2 52-6 80h36z" fill="url(#dsCur)"/><rect x="16" y="-122" width="164" height="7" rx="3.5" fill="#E9897A"/>' +
          // shelf with jars
          '<rect x="206" y="-70" width="110" height="7" rx="3.5" fill="#C98A5B"/>' +
          '<rect x="212" y="-96" width="22" height="26" rx="6" fill="#FFE29A" opacity=".9"/><rect x="210" y="-100" width="26" height="6" rx="3" fill="#FF8A6B"/>' +
          '<rect x="240" y="-92" width="18" height="22" rx="5" fill="#BDEBFF" opacity=".9"/><rect x="238" y="-96" width="22" height="5" rx="2.5" fill="#7DB8F2"/>' +
          band(40, "url(#dsFl)") + floorShine(40) +
          // table
          shadow(110, 100, 150, 10) + '<rect x="0" y="40" width="12" height="62" rx="4" fill="#3E9E8A"/><rect x="214" y="40" width="12" height="62" rx="4" fill="#3E9E8A"/>' +
          '<rect x="-30" y="18" width="270" height="24" rx="10" fill="url(#dsTop)"/>' + gloss(-30, 18, 270, 24, 8, 0.45) +
          // clean shiny plate with spoon + fork
          '<ellipse cx="80" cy="18" rx="56" ry="12" fill="#000" opacity=".08"/><ellipse cx="80" cy="14" rx="56" ry="13" fill="url(#dsWhite)"/><ellipse cx="80" cy="13" rx="40" ry="8.5" fill="#F3F6FA"/>' +
          '<ellipse cx="62" cy="10" rx="12" ry="3" fill="#fff"/><path class="shine" d="M70 6l10 0-6 12-10 0z" fill="#fff" opacity=".9"/>' +
          '<path d="M56 18l40-12" stroke="#C9CED6" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="100" cy="4.6" rx="7" ry="4" fill="#DDE2EA" transform="rotate(-16 100 4.6)"/>' +
          '<circle cx="74" cy="15" r="1.4" fill="#E8C27A"/><circle cx="90" cy="16" r="1.2" fill="#E8C27A"/>' +
          // the food still on the plate: gone in three bites when Mo taps (end state: a clean plate)
          '<g class="ae-food" opacity="0"><path d="M52 12c0-13 9-20 19-20s19 7 19 20z" fill="#FFFBEF" stroke="#E8DCC0" stroke-width="1.4"/><path d="M58 0c3-2 6-2 8 0M68-4c3-2 6-2 8 0M62 6c3-2 6-2 8 0" stroke="#EADFC6" stroke-width="1.2" fill="none" stroke-linecap="round"/><ellipse cx="64" cy="-3" rx="5" ry="2.6" fill="#fff"/>' +
          '<circle cx="86" cy="12" r="5" fill="#FF7A5A"/><circle cx="86" cy="12" r="2.6" fill="#FFB49A"/><circle cx="78" cy="14" r="4" fill="#FF7A5A"/><circle cx="78" cy="14" r="2" fill="#FFB49A"/>' +
          '<ellipse cx="100" cy="9" rx="12" ry="5.5" fill="#fff"/><circle cx="100" cy="8" r="4.6" fill="url(#dsGold)"/>' +
          '<path d="M46 11q5-8 11-2M50 8q2-8 8-6" stroke="#5FBF7A" stroke-width="4" fill="none" stroke-linecap="round"/></g>' +
          [0.4, 0.68, 0.96].map(function (d, i) { return burst(66 + i * 12, -4 + i * 3, 9, "#FFB020", d); }).join("") +
          burst(80, 6, 30, "#FFE07A", 1.35) + sparkle(56, 0, 0.8, "axpop", "#fff").replace('class="axpop"', 'class="axpop" style="--d:1.4s"') + sparkle(104, -6, 0.6, "axpop", "#FFE07A").replace('class="axpop"', 'class="axpop" style="--d:1.5s"') +
          // glass of milk + napkin
          '<path d="M164-22h26l-3 40h-20z" fill="url(#dsGlass)" stroke="#C9E4F5" stroke-width="2"/><path class="ae-milk" d="M165.6-6h22.8l-1.8 23h-19.2z" fill="url(#dsMilk)"/><rect x="168" y="-18" width="4" height="30" rx="2" fill="#fff" opacity=".9"/>' +
          '<path d="M200 16l30-6 6 8-30 6z" fill="#FFB3C7"/><path d="M204 18l26-5" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 3"/>' +
          heart(258, -56, 1.15, "url(#dsPink)", "beat") + heart(150, -54, 0.6, "#FFB0C4", "float") +
          sparkle(120, -26, 0.9, "twinkle", "#FFC94A") + sparkle(40, -14, 0.6, "twinkle t2", "#FFC94A") + sparkle(226, -24, 0.6, "twinkle t3", "#fff") +
          plant(-48, 52, 1, "sway") + plant(440, 52, 1, "sway");
      },
      fx: function (card) { return card ? "" : say(204, -46, "Alhamdulillah!", 1.45, 274, -30) + heart(300, -64, 0.5, "url(#dsPink)", "axpop").replace('class="axpop"', 'class="axpop" style="--d:1.6s"'); }
    },

    /* 10 · Ketika hujan — gentle rain, glossy clouds, a little rainbow, puddles and a happy frog */
    rain: {
      pose: "baby-mo-wow", mo: { x: 318, y: 128, h: 180 },
      svg: function () {
        return "<defs>" + lg("dsSky", ["#8EA9D6", "#BFD0EA@.6", "#E2EAF6"]) + lg("dsCl2", ["#FFFFFF", "#D3DEEE"]) + lg("dsHillB", ["#A6D7A0", "#86C589"]) + lg("dsGrass", ["#8ED384", "#62B86A"]) +
          lg("dsUmb", ["#FF8FB8", "#E84A80"]) + rg("dsFrog", ["#B8F08A", "#5FC24E@.7", "#3E9A38"], 0.35, 0.3, 0.8) + lg("dsPud", ["#B9DDF7", "#8EC3EA"]) + "</defs>" +
          bg("url(#dsSky)") +
          // a soft rainbow
          '<g opacity=".55" fill="none" stroke-width="7"><path d="M-30 20a100 100 0 0 1 200 0" stroke="#FF9AA8"/><path d="M-23 20a93 93 0 0 1 186 0" stroke="#FFD27A"/><path d="M-16 20a86 86 0 0 1 172 0" stroke="#A6E88A"/><path d="M-9 20a79 79 0 0 1 158 0" stroke="#8FD0FF"/></g>' +
          cloud(60, -88, 1.25, "drift", 1, "url(#dsCl2)") + cloud(200, -98, 1.05, "drift d2", 1, "url(#dsCl2)") + cloud(340, -86, 0.9, "drift slow", 1, "url(#dsCl2)") + cloud(-100, -90, 1, "drift", 1, "url(#dsCl2)") + cloud(500, -90, 1, "drift d2", 1, "url(#dsCl2)") +
          // a happy cloud face
          '<g transform="translate(200 -98)"><circle cx="-8" cy="0" r="2.2" fill="#5A6A8A"/><circle cx="10" cy="0" r="2.2" fill="#5A6A8A"/><path d="M-4 6q5 5 10 0" stroke="#5A6A8A" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="-14" cy="6" r="3" fill="#FFB0C4" opacity=".7"/><circle cx="16" cy="6" r="3" fill="#FFB0C4" opacity=".7"/></g>' +
          '<path d="M-800 20Q-100-6 0 14Q100-12 200 10Q300-14 400 8Q600-12 1200 10V300H-800Z" fill="url(#dsHillB)"/>' + tree(250, 22, 0.6) + tree(120, 18, 0.5) + tree(-30, 24, 0.7) + tree(430, 20, 0.7) +
          band(40, "url(#dsGrass)") + floorShine(40) +
          // rain
          (function () { var r = ""; for (var i = 0; i < 40; i++) { var x = ((i * 47) % 600) - 100, y = ((i * 29) % 130) - 120, c = ["", "r2", "r3"][i % 3];
            r += '<path class="drop ' + c + '" d="M' + x + " " + y + ' l-3 10" stroke="#F2F8FF" stroke-width="2.6" stroke-linecap="round"/>'; } return r; })() +
          // puddles + ripples
          '<ellipse cx="96" cy="58" rx="46" ry="9" fill="url(#dsPud)"/><ellipse cx="86" cy="56" rx="16" ry="2.6" fill="#fff" opacity=".6"/><ellipse class="ripple" cx="104" cy="58" rx="16" ry="3.4" fill="none" stroke="#fff" stroke-width="1.8"/><ellipse class="ripple q2" cx="80" cy="59" rx="11" ry="2.4" fill="none" stroke="#fff" stroke-width="1.6"/>' +
          '<ellipse cx="226" cy="66" rx="30" ry="6" fill="url(#dsPud)"/><ellipse class="ripple q3" cx="226" cy="66" rx="12" ry="2.6" fill="none" stroke="#fff" stroke-width="1.6"/>' +
          // flowers drinking the rain
          '<g transform="translate(166 52)"><g class="sway"><path d="M0 0v-26" stroke="#3E8E4A" stroke-width="3"/><ellipse cx="-7" cy="-12" rx="7" ry="3.6" fill="#5DBB6B" transform="rotate(-25 -7 -12)"/><circle cx="0" cy="-30" r="7" fill="#FF8FB8"/><circle cx="0" cy="-30" r="3" fill="#FFE066"/></g></g>' +
          '<g transform="translate(18 50)"><g class="sway"><path d="M0 0v-22" stroke="#3E8E4A" stroke-width="3"/><ellipse cx="7" cy="-10" rx="7" ry="3.6" fill="#5DBB6B" transform="rotate(25 7 -10)"/><circle cx="0" cy="-26" r="6.4" fill="#FFE066"/><circle cx="0" cy="-26" r="2.6" fill="#FF9A3C"/></g></g>' +
          // frog on the puddle's edge
          '<g transform="translate(138 52)"><g class="hop">' + shadow(0, 2, 16, 3) + '<ellipse cx="0" cy="-10" rx="16" ry="12" fill="url(#dsFrog)"/><circle cx="-8" cy="-22" r="6.5" fill="url(#dsFrog)"/><circle cx="8" cy="-22" r="6.5" fill="url(#dsFrog)"/>' +
          '<circle cx="-8" cy="-22" r="3.6" fill="#fff"/><circle cx="8" cy="-22" r="3.6" fill="#fff"/><circle cx="-7.4" cy="-21.4" r="2" fill="#2B2F3A"/><circle cx="8.6" cy="-21.4" r="2" fill="#2B2F3A"/>' +
          '<path d="M-6-10q6 5 12 0" stroke="#2E6A2A" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="-11" cy="-11" r="2.4" fill="#FF9AB0" opacity=".7"/><circle cx="11" cy="-11" r="2.4" fill="#FF9AB0" opacity=".7"/><ellipse cx="-4" cy="-17" rx="4" ry="2" fill="#fff" opacity=".45"/></g></g>' +
          // the umbrella (end state: open above Mo; before the tap it is closed and leaning)
          '<g class="r-umb">' +
          '<path d="M312 44v-150" stroke="#7A5A48" stroke-width="3.4" stroke-linecap="round"/>' +
          '<path d="M312 40v4a6 6 0 0 1-12 0" stroke="#7A5A48" stroke-width="4" fill="none" stroke-linecap="round"/>' +
          '<g class="r-cl" opacity="0"><path d="M312-108C319-94 323-74 320-56L316-48h-8l-4-8C301-74 305-94 312-108z" fill="url(#dsUmb)"/>' +
          '<path d="M309-96c-2 12-2 26 0 38" stroke="#fff" stroke-width="1.6" fill="none" opacity=".45"/><rect x="304.5" y="-78" width="15" height="5" rx="2.5" fill="#C23A6A"/></g>' +
          '<g class="r-op"><path d="M250-58C250-86 278-104 312-104C346-104 374-86 374-58Q361.6-67 349.2-58Q336.8-67 324.4-58Q312-67 299.6-58Q287.2-67 274.8-58Q262.4-67 250-58z" fill="url(#dsUmb)"/>' +
          '<path d="M312-104Q284.1-96 274.8-58Q287.2-67 299.6-58Q302.7-96 312-104zM312-104Q321.3-96 324.4-58Q336.8-67 349.2-58Q339.9-96 312-104z" fill="#FFE3EE" opacity=".6"/>' +
          '<path d="M312-104Q284.1-96 274.8-58M312-104Q302.7-96 299.6-58M312-104Q321.3-96 324.4-58M312-104Q339.9-96 349.2-58" stroke="#C23A6A" stroke-width="1.4" fill="none" opacity=".55"/>' + '<circle cx="250" cy="-58" r="2" fill="#C23A6A"/><circle cx="274.8" cy="-58" r="2" fill="#C23A6A"/><circle cx="299.6" cy="-58" r="2" fill="#C23A6A"/><circle cx="324.4" cy="-58" r="2" fill="#C23A6A"/><circle cx="349.2" cy="-58" r="2" fill="#C23A6A"/><circle cx="374" cy="-58" r="2" fill="#C23A6A"/>' +
          '<path d="M266-80q14-17 38-21" stroke="#fff" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/></g>' +
          '<rect x="310" y="-114" width="4" height="10" rx="2" fill="#C23A6A"/><circle cx="312" cy="-115" r="3" fill="#F05A8C"/></g>' +
          // rain splashing off the canopy
          [[256, -60, 1.1], [290, -100, 1.35], [338, -100, 1.2], [370, -62, 1.5]].map(function (p) { return '<g class="r-spl" opacity="0" style="--d:' + p[2] + 's"><path d="M' + p[0] + " " + p[1] + "l-4-5M" + p[0] + " " + p[1] + "l4-5M" + p[0] + " " + p[1] + 'v-6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></g>'; }).join("") +
          burst(312, -80, 40, "#fff", 0.55) +
          sparkle(290, 10, 0.6, "twinkle", "#fff") + bush(-70, 60, 1, true) + bush(470, 60, 1, true);
      }
    },

    /* 11 · Masuk rumah — a warm evening; on tap Mo knocks three times, says salam and the door opens */
    enter_home: {
      pose: "baby-mo-pose-08", mo: { x: 318, y: 128, h: 194 },
      svg: function () {
        return "<defs>" + lg("dsSky", ["#FF9C82", "#FFC3A0@.55", "#FFE9CF"]) + lg("dsHillB", ["#C7C48F", "#A9B27A"]) + lg("dsGrass", ["#A4D489", "#7CBE6A"]) +
          lg("dsWallH", ["#FFF6E6", "#F3DDBC"]) + lg("dsRoof", ["#E7766A", "#B9463E"]) + lg("dsDoor", ["#B57A4A", "#8A5634"]) + rg("dsWarm", ["#FFF0A8", "#FFD36B@.7", "#FFB03B"], 0.5, 0.4, 0.8) +
          lg("dsIn", ["#FFE9A8", "#FFC266"]) + lg("dsSpill", ["#FFE29A~.85", "#FFE29A~0"]) + "</defs>" +
          bg("url(#dsSky)") + sun(14, -6, 22, true) + cloud(330, -86, 0.6, "drift", 1, "#FFE4D6") + cloud(190, -100, 0.5, "drift d2", 1, "#FFE4D6") + cloud(-60, -80, 0.6, "drift slow", 1, "#FFE4D6") +
          bird(300, -60, 0.8, "#8A4A5A") + bird(330, -50, 0.6, "#8A4A5A", "k2") +
          '<path d="M-800 14Q-100-10 0 10Q120-16 240 6Q330-10 400 6Q600-14 1200 6V300H-800Z" fill="url(#dsHillB)"/>' + tree(-30, 18, 0.8) + tree(440, 14, 0.8) +
          // house, centred so the door is in the middle of a phone screen
          shadow(148, 54, 110, 8) + '<rect x="46" y="-50" width="206" height="104" rx="6" fill="url(#dsWallH)"/>' +
          '<path d="M30-44L149-112L268-44Z" fill="url(#dsRoof)" stroke="url(#dsRoof)" stroke-width="10" stroke-linejoin="round"/><path d="M52-50L149-104L246-50" stroke="#FFF7E8" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
          '<rect x="60" y="-32" width="42" height="38" rx="6" fill="url(#dsWarm)" stroke="#fff" stroke-width="4"/><path d="M81-32v38M60-13h42" stroke="#fff" stroke-width="3"/>' +
          '<rect x="196" y="-32" width="42" height="38" rx="6" fill="url(#dsWarm)" stroke="#fff" stroke-width="4"/><path d="M217-32v38M196-13h42" stroke="#fff" stroke-width="3"/>' +
          '<circle class="glow" cx="81" cy="-13" r="30" fill="url(#dsHalo)" opacity=".7"/><circle class="glow" cx="217" cy="-13" r="30" fill="url(#dsHalo)" opacity=".7"/>' +
          // the doorway: a warm, lit room behind the door
          '<rect x="123" y="-21" width="52" height="75" rx="6" fill="#6E4226"/><rect x="126" y="-18" width="46" height="72" rx="3" fill="url(#dsIn)"/>' +
          '<rect x="126" y="36" width="46" height="18" fill="#E39A52" opacity=".5"/><rect x="152" y="-8" width="14" height="12" rx="2" fill="#fff" opacity=".55"/><circle class="glow" cx="149" cy="0" r="22" fill="url(#dsHalo)"/>' +
          '<g class="e-door">' + doorSwing({ x: 126, y: -18, w: 46, h: 72, hinge: "l", max: 76, at: 1.05, dur: 0.85, parts: [
            { q: [0, 0, 1, 1], fill: "url(#dsDoor)", round: 5 }, { q: [0.06, 0.03, 0.94, 0.26], fill: "#fff", op: 0.14 },
            { q: [0.13, 0.08, 0.87, 0.44], fill: "#9E6640", round: 4 }, { q: [0.13, 0.53, 0.87, 0.92], fill: "#9E6640", round: 4 },
            { e: [0.5, 0.25, 10, 10], stroke: "#5FAF5A", sw: 4 }, { e: [0.5, 0.25, 4, 4], fill: "#FF8FB0" }, { e: [0.83, 0.53, 3.4, 3.4], fill: "url(#dsGold)" }] }) + "</g>" +
          // knock-knock-knock marks
          [0.02, 0.32, 0.62].map(function (d, i) { return '<g class="axburst" opacity="0" style="--d:' + d + 's;--t:.35s"><path d="M' + (180 + i * 2) + " " + (4 - i * 10) + "l8-4M" + (181 + i * 2) + " " + (10 - i * 10) + "h9M" + (180 + i * 2) + " " + (16 - i * 10) + 'l8 4" stroke="#7A4A2A" stroke-width="2.6" stroke-linecap="round"/></g>'; }).join("") +
          '<circle class="glow" cx="186" cy="-26" r="26" fill="url(#dsHalo)"/><rect x="181" y="-38" width="10" height="16" rx="3.5" fill="#FFE07A" stroke="#7A5232" stroke-width="2"/>' +
          '<rect x="118" y="54" width="62" height="10" rx="4" fill="#E3B47E"/>' +
          band(60, "url(#dsGrass)") +
          '<path class="axfade" style="--d:1.3s;--t:.6s" d="M126 54h46l34 34H98z" fill="url(#dsSpill)"/>' +
          '<rect x="120" y="62" width="58" height="12" rx="5" fill="#E86B5A"/><path d="M126 68h46" stroke="#FFD0C4" stroke-width="2" stroke-dasharray="4 3"/>' +
          // flower pots by the door
          plant(106, 60, 0.9, "sway") + plant(192, 60, 0.9, "sway") + bush(268, 64, 0.9, true) +
          heart(232, -70, 0.7, "#FFB0C4", "heartup") + heart(214, -52, 0.5, "url(#dsPink)", "heartup h2") +
          sparkle(240, -96, 0.7, "twinkle", "#fff") + bush(-70, 64, 1, true) + bush(470, 64, 1, true);
      },
      fx: function (card) { return card ? "" : say(206, -50, "Assalamu'alaikum!", 0.95, 284, -32); }
    },

    /* 12 · Doa untuk orang tua — a warm, cosy family evening: Abi, Umi and Mo stand together on the rug,
       Mo (hands together, making du'a for them) next to Umi's open arms. Sized as a family (Mo about
       Abi's waist), heads kept low enough to stay clear of the page's top pills, Mo on the right so the
       tap button (lower left) never covers him; hearts float in the gap between the parents' faces. */
    parents: {
      pose: "mo2-dua-stand-eyes-closed", mo: { x: 312, y: 129, h: 100 },
      svg: function () {
        return "<defs>" + rg("dsWarm", ["#FFF6DC", "#FFE6E8@.6", "#F2E2FF"], 0.55, 0.45, 0.85) + lg("dsSkyP", ["#5D62C8", "#9A8EEA"]) + lg("dsFl", ["#F4D9BC", "#E6BF98"]) +
          rg("dsLampP", ["#FFF3B0~.85", "#FFF3B0~0"]) + lg("dsFrame", ["#E2A26C", "#B9794A"], "d") +
          '<pattern id="dsHt" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M12 14c-2-3-7-2-7 2 0 3 7 7 7 7s7-4 7-7c0-4-5-5-7-2z" fill="#FFD3E0" opacity=".55"/><circle cx="34" cy="34" r="2" fill="#FFE29A" opacity=".6"/></pattern></defs>' +
          bg("url(#dsWarm)") + bg("url(#dsHt)") +
          // night window with a smiling moon
          windowFrame("dsWinP", 14, -100, 100, 78, 16,
            '<rect x="14" y="-100" width="100" height="78" fill="url(#dsSkyP)"/>' + moon(80, -68, 16, "#5D62C8", "float2") +
            star(34, -84, 3.4, "twinkle", "#fff") + star(44, -44, 2.8, "twinkle t2", "#FFE29A") + star(98, -36, 2.4, "twinkle t3", "#fff")) +
          // a cute smiling star on the wall
          '<g transform="translate(150 -92)"><g class="float">' + star(0, 0, 13, "", "url(#dsGold)") + '<circle cx="-3.6" cy="-1" r="1.5" fill="#9A6A10"/><circle cx="3.6" cy="-1" r="1.5" fill="#9A6A10"/><path d="M-3 3q3 3 6 0" stroke="#9A6A10" stroke-width="1.4" fill="none" stroke-linecap="round"/></g></g>' +
          // warm lamp glow behind the family
          '<circle class="glow" cx="200" cy="-20" r="120" fill="url(#dsLampP)"/>' +
          // family photo on the wall
          '<g transform="translate(18 0)"><g class="swing"><path d="M330-118l-26 16M330-118l26 16" stroke="#8A5A3A" stroke-width="1.6"/><circle cx="330" cy="-118" r="2.6" fill="#8A5A3A"/>' +
          '<rect x="282" y="-104" width="96" height="72" rx="10" fill="url(#dsFrame)"/><rect x="288" y="-98" width="84" height="60" rx="6" fill="#FFF6E8"/>' +
          '<clipPath id="dsPh"><rect x="288" y="-98" width="84" height="60" rx="6"/></clipPath><image clip-path="url(#dsPh)" href="family/family-photo-v2.webp" x="288" y="-98" width="84" height="60" preserveAspectRatio="xMidYMid slice"/>' +
          '<path d="M291-95l18 0l-18 13z" fill="#fff" opacity=".4"/>' + heart(372, -100, 0.42, "url(#dsPink)", "") + "</g></g>" +
          band(40, "url(#dsFl)") + floorShine(40) +
          rug(240, 123, 150, 17, "#FFC9DA", "#fff") +
          // Abi and Umi standing on the rug, with contact shadows (Mo's own shadow comes with him)
          shadow(160, 127, 36, 6) + shadow(246, 127, 27, 5.5) +
          '<image class="p-abi" href="family/abi-wave.webp" x="114" y="-66" width="92.4" height="194"/>' +
          '<image class="p-umi" href="family/umi-welcome.webp" x="208.5" y="-54" width="74.9" height="182"/>' +
          // little hearts rise up the gap between Abi's and Umi's faces
          heart(212, 18, 0.6, "url(#dsPink)", "heartup") + heart(200, 4, 0.44, "#FFB0C4", "heartup h2") + heart(224, -2, 0.48, "#FF8FB0", "heartup h3") +
          heart(62, 18, 0.6, "#FFB0C4", "float") + sparkle(84, 50, 0.6, "twinkle t3", "#FFC94A") + sparkle(372, 62, 0.5, "twinkle", "#FFC94A") + sparkle(232, -96, 0.6, "twinkle t2", "#FFC94A") +
          plant(-46, 52, 1.05, "sway") + lamp(440, 52, 1.6, true);
      },
      // front layer: the love — a big heart pops just above Mo's head (clear of Abi's and Umi's faces), little hearts float up
      fx: function (card) {
        if (card) return "";
        return burst(314, 8, 22, "#FF8FB0", 0.6) + '<g class="axpop" style="--d:.6s">' + heart(314, 8, 1.05, "url(#dsPink)", "beat") + "</g>" +
          [[290, -14, 0.48, 0.85], [340, -10, 0.45, 1.0], [212, -10, 0.45, 1.15], [326, -22, 0.36, 1.25]].map(function (h) { return '<g class="axpop" style="--d:' + h[3] + 's">' + heart(h[0], h[1], h[2], "#FF8FB0", "float2") + "</g>"; }).join("");
      }
    },

    /* 13 · Dzikir sore — the sun sinking behind the hills, birds flying home, the first star */
    evening_dhikr: {
      pose: "mo2-hand-chest", mo: { x: 318, y: 130, h: 196 },
      svg: function () {
        return "<defs>" + lg("dsSky", ["#8A6AD8", "#E98AB0@.45", "#FFB27A@.8", "#FFD9A0"]) + rg("dsSunS", ["#FFF6C8", "#FFC94A@.6", "#FF8A3D"], 0.4, 0.35, 0.7) +
          lg("dsH1", ["#D68AB4", "#B66A9E"]) + lg("dsDusk", ["#3E2A8A~.55", "#8A4AA8@.5~.25", "#FF8A6A~0"]) + lg("dsH2", ["#A86AAE", "#8A5098"]) + lg("dsH3", ["#8BC27A", "#6AA866"]) + rg("dsWarm", ["#FFF0A8", "#FFC94A"], 0.5, 0.4, 0.8) + "</defs>" +
          bg("url(#dsSky)") +
          // dusk deepens as the sun goes down
          '<rect class="axfade" style="--d:.3s;--t:1.6s" x="-800" y="-900" width="2000" height="1500" fill="url(#dsDusk)"/>' +
          '<g class="ev-sun"><circle class="glow" cx="140" cy="-6" r="90" fill="url(#dsHalo)"/>' + sun(140, -6, 30, true) + "</g>" +
          // the first star, then a few more
          burst(250, -84, 14, "#FFF3B0", 1.3) + at("axpop", 1.3, star(250, -84, 7, "twinkle", "#FFF3B0")) +
          at("axpop", 1.6, star(300, -60, 2.8, "twinkle t2", "#fff")) + at("axpop", 1.75, star(370, -70, 2.4, "twinkle t3", "#fff")) + at("axpop", 1.5, star(40, -100, 2.6, "twinkle t4", "#fff")) + star(-60, -90, 3, "twinkle", "#fff") + star(460, -96, 3, "twinkle t2", "#fff") +
          cloud(50, -56, 0.7, "drift slow", 0.95, "#FFC7C8") + cloud(250, -64, 0.55, "drift d2", 0.9, "#F7B3CF") +
          bird(190, -66, 1, "#5A3A6A") + bird(170, -50, 0.75, "#5A3A6A", "k2") + bird(214, -44, 0.6, "#5A3A6A") +
          // far hills (they hide the lower half of the sun) with a little mosque
          '<path d="M-800 10Q-100-16 0 6Q70-14 150 2Q230-16 300 0Q350-10 400 -2Q600-16 1200 4V300H-800Z" fill="url(#dsH1)"/>' +
          '<g fill="#8E4C8E"><rect x="36" y="-20" width="40" height="24" rx="3"/><path d="M40-20a16 16 0 0 1 32 0z"/><rect x="82" y="-40" width="7" height="44" rx="2.5"/><path d="M80-40l5.5-10 5.5 10z"/><path d="M56-38v-6" stroke="#8E4C8E" stroke-width="1.6"/><rect x="51" y="-12" width="10" height="16" rx="5" fill="#C98AB0"/></g>' +
          at("axfade", 1.35, '<circle cx="56" cy="-4" r="14" fill="url(#dsHalo)"/><rect x="51" y="-12" width="10" height="16" rx="5" fill="#FFD27A"/>') +
          '<path d="M-800 30Q-100 12 0 26Q110 10 220 24Q320 12 400 22Q600 10 1200 24V300H-800Z" fill="url(#dsH2)"/>' +
          // a small house with warm windows
          '<rect x="186" y="2" width="56" height="34" rx="3" fill="#6E3E80"/><path d="M180 4L214-18L248 4Z" fill="#5A2E6E" stroke="#5A2E6E" stroke-width="5" stroke-linejoin="round"/>' +
          '<rect class="glow" x="194" y="12" width="13" height="12" rx="2" fill="url(#dsWarm)"/><rect class="glow" x="221" y="12" width="13" height="12" rx="2" fill="url(#dsWarm)"/>' +
          '<path d="M-800 52Q-100 34 0 48Q120 30 240 44Q330 32 400 42Q600 30 1200 44V300H-800Z" fill="url(#dsH3)"/>' + floorShine(300) +
          tree(20, 54, 0.7) + bush(150, 62, 0.8, true) + tree(420, 50, 0.8) +
          '<g fill="#FFF3B0">' + [[60, 30], [120, 18], [250, 34], [176, 44], [36, 10]].map(function (p, i) { return '<circle class="twinkle t' + (i % 4 + 1) + '" cx="' + p[0] + '" cy="' + p[1] + '" r="2.4"/>'; }).join("") + "</g>" +
          sparkle(120, -80, 0.8, "twinkle t2", "#FFF3B0") + sparkle(372, -10, 0.6, "twinkle", "#FFE29A") + tree(-60, 60, 1);
      }
    },

    /* 14 · Tasbih sebelum tidur — a cosy night room, a loop of prayer beads lighting up one by one */
    bedtime_tasbih: {
      pose: "baby-mo-pose-06", mo: { x: 322, y: 132, h: 134 },
      svg: function () {
        return "<defs>" + lg("dsWall", ["#5257B4", "#3D4196"]) + lg("dsSkyN", ["#222A66", "#454AA2"]) + lg("dsFl", ["#6461BE", "#47459A"]) +
          lg("dsQuilt", ["#9E8BFF", "#7461E6"]) + lg("dsWood", ["#7A7FD8", "#5559B8"]) + rg("dsBeadGlow", ["#FFE29A~.6", "#FFE29A~0"]) +
          '<pattern id="dsSt" width="46" height="46" patternUnits="userSpaceOnUse"><path d="M12 10l1.5 3 3 .5-2.2 2 .6 3-2.9-1.5-2.9 1.5.6-3-2.2-2 3-.5z" fill="#8C90E8" opacity=".5"/></pattern></defs>' +
          bg("url(#dsWall)") + bg("url(#dsSt)") +
          windowFrame("dsWinT", 26, -100, 104, 82, 16,
            '<rect x="26" y="-100" width="104" height="82" fill="url(#dsSkyN)"/>' + moon(94, -66, 16, "#2A3270", "float2") +
            star(46, -82, 3.6, "twinkle", "#fff") + star(58, -40, 2.8, "twinkle t2", "#FFE29A") + star(116, -30, 2.6, "twinkle t3", "#fff"), "#8C90E8") +
          star(170, -96, 3.6, "twinkle t4", "#FFE29A") + star(220, -70, 2.6, "twinkle", "#fff") + star(158, -50, 2.2, "twinkle t3", "#fff") + star(390, -96, 3, "twinkle t2", "#FFE29A") +
          band(40, "url(#dsFl)") + floorShine(40) +
          bed(-90, 30, 150, "url(#dsQuilt)", "#E2D8FF", "url(#dsWood)", false) +
          // the prayer-bead loop on a little round rug
          rug(166, 66, 70, 11, "#5A4FB0", "#9C8CF0") +
          '<circle class="glow" cx="166" cy="8" r="56" fill="url(#dsBeadGlow)"/>' +
          (function () {
            var cx = 166, cy = 6, R = 36, h = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#C7B6FF" stroke-width="1.8" opacity=".7"/>';
            for (var i = 1; i < 18; i++) {
              var a = Math.PI / 2 + i * Math.PI * 2 / 18, x = f(cx + R * Math.cos(a)), y = f(cy + R * Math.sin(a));
              // the first six beads light up one by one as the finger taps
              h += '<circle cx="' + x + '" cy="' + y + '" r="6" fill="#B9A4FF"/>' + (i <= 6 ? at("axpop", f(0.5 + (i - 1) * 0.2), '<circle cx="' + x + '" cy="' + y + '" r="6.4" fill="url(#dsGold)"/>') + burst(x, y, 7, "#FFE29A", f(0.5 + (i - 1) * 0.2)) : "") +
                '<circle cx="' + f(x - 2) + '" cy="' + f(y - 2) + '" r="1.8" fill="#fff" opacity=".7"/>';
            }
            return h + '<circle cx="' + cx + '" cy="' + (cy + R + 4) + '" r="7.5" fill="url(#dsGold)"/><path d="M' + cx + " " + (cy + R + 10) + 'l-7 12h14z" fill="#FFB400"/>';
          })() +
          '<g class="float2"><text x="166" y="14" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="22" fill="#FFF3C4">33</text></g>' +
          // a little finger, ready for tasbih
          '<g transform="translate(151 64)">' + at("axpop", 0.1, '<g class="t-tap"><path d="M-3-1v-14a3.5 3.5 0 0 1 7 0v14" fill="#F6CBA2" stroke="#D99F73" stroke-width="1.4"/><ellipse cx=".5" cy="-14.2" rx="2" ry="1.6" fill="#fff" opacity=".7"/>' +
            '<rect x="-7" y="-3" width="17" height="16" rx="7" fill="#F6CBA2" stroke="#D99F73" stroke-width="1.4"/><path d="M-6 3h10M-6 8h10" stroke="#D99F73" stroke-width="1.2" stroke-linecap="round"/><rect x="-8" y="11" width="19" height="8" rx="3" fill="#5FC27A"/></g>') + "</g>" +
          burst(166, 6, 44, "#FFE29A", 1.75) +
          lamp(262, 40, 1, true) +
          sparkle(240, -30, 0.8, "twinkle", "#FFE29A") + sparkle(110, -6, 0.55, "twinkle t2", "#fff") +
          plant(-46, 52, 1, "") + plant(444, 52, 1, "");
      }
    }
  };

  /* visible box of each Baby Mo render inside its image: [left, top, right, bottom] (fractions) + width/height */
  var POSE = {
    "baby-mo-pose-41": [0.210, 0.156, 0.781, 0.938, 1], "baby-mo-pose-42": [0.273, 0.154, 0.683, 0.917, 1],
    "baby-mo-pose-07": [0.252, 0.169, 0.665, 0.908, 1], "baby-mo-pose-05": [0.304, 0.156, 0.688, 0.906, 1],
    "baby-mo-idea": [0.317, 0.156, 0.708, 0.906, 1], "baby-mo-pose-39": [0.242, 0.340, 0.654, 0.933, 1],
    "baby-mo-run": [0.302, 0.152, 0.731, 0.894, 1], "baby-mo-pose-15": [0.181, 0.146, 0.715, 0.908, 1],
    "baby-mo-thank-you": [0.267, 0.150, 0.662, 0.908, 1], "baby-mo-wow": [0.331, 0.150, 0.683, 0.906, 1],
    "baby-mo-pose-08": [0.263, 0.179, 0.773, 0.906, 1], "baby-mo-pose-12": [0.300, 0.315, 0.685, 0.915, 1],
    "baby-mo-pose-06": [0.273, 0.319, 0.675, 0.923, 1],
    // render 2 (baby-mo-render2/, same 480×480 framing, feet on y≈0.915)
    "mo2-hand-chest": [0.277, 0.144, 0.725, 0.915, 1], "mo2-dua-stand-eyes-closed": [0.271, 0.129, 0.731, 0.915, 1],
    "mo2-dua-stand": [0.279, 0.125, 0.723, 0.915, 1], "mo2-hands-clasped": [0.300, 0.160, 0.700, 0.915, 1],
    "mo2-dua-kneel": [0.277, 0.171, 0.725, 0.915, 1]
  };
  function boxOf(pose) { return POSE[pose] || [0.27, 0.15, 0.7, 0.91, 1]; }
  // image file of a pose: "mo2-…" poses are the render-2 library, the rest the first pose library
  function poseSrc(pose) { return (/^mo2-/.test(pose) ? "baby-mo-render2/" : "baby-mo-poses/") + pose + ".webp"; }
  window.doaPoseSrc = poseSrc;
  var NIGHT = { sleep: 1, parents: 1, bedtime_tasbih: 1 };
  function isNight(id) { return !!NIGHT[id]; }

  var cache = {};
  function svgOf(id) { var s = SCENES[id]; if (!s) return ""; return cache[id] || (cache[id] = BASE ? "<defs>" + BASE + "</defs>" + s.svg() : s.svg()); }
  // the front layer (drawn above Baby Mo): seatbelt, spoon, speech bubbles…; card = still picture (no bubbles)
  function fxOf(id, card) { var s = SCENES[id]; return s && s.fx ? s.fx(!!card) : ""; }

  var XCSS = "";
  function ensureCss() {
    var st = document.getElementById("doa-scenes-css");
    if (!st) { st = document.createElement("style"); st.id = "doa-scenes-css"; document.head.appendChild(st); }
    var css = CSS + "\n" + ACSS + (XCSS ? "\n" + XCSS : "");
    if (st.textContent.length !== css.length) st.textContent = css;
  }

  /* A still picture of a du'a's scene (sky + Baby Mo) for cards on the home screen
     (400×180 cards). No motion (calm for small children); gradient ids get a
     per-card suffix so several scenes can share the page with the big one. */
  var CARD_VB = [0, -110, 400, 250];
  window.doaSceneArt = function (id, sfx) {
    var s = SCENES[id]; if (!s) return "";
    var k = "_" + (sfx || "c") + "_" + id;
    var svg = svgOf(id).replace(/(id="|url\(#)(ds[A-Za-z0-9]+)/g, "$1$2" + k), fx = fxOf(id, true).replace(/(id="|url\(#)(ds[A-Za-z0-9]+)/g, "$1$2" + k);
    var night = isNight(id);
    // the card is 400×180: the frame window (CARD_VB) is fitted to its height ("meet"),
    // the walls and skies drawn past the frame fill the sides
    var u = 180 / CARD_VB[3], ox = (400 - 400 * u) / 2, b = boxOf(s.pose), m = s.mo, ih = m.h * u / (b[3] - b[1]), iw = ih * b[4];
    var bottom = (CARD_VB[1] + CARD_VB[3] - m.y) * u - (1 - b[3]) * ih, left = ox + m.x * u - (b[0] + b[2]) / 2 * iw;
    var st = "left:" + f(left / 4) + "%;right:auto;bottom:" + f(bottom / 1.8) + "%;height:" + f(ih / 1.8) + "%;width:auto;transform:none";
    return '<span class="dsa' + (night ? " night" : "") + '"><svg viewBox="' + CARD_VB.join(" ") + '" preserveAspectRatio="xMidYMax meet" overflow="visible" aria-hidden="true" focusable="false">' + svg +
      '</svg><img src="' + poseSrc(s.pose) + '" alt="" loading="lazy" decoding="async" style="' + st + '">' +
      (fx ? '<svg viewBox="' + CARD_VB.join(" ") + '" preserveAspectRatio="xMidYMax meet" overflow="visible" aria-hidden="true" focusable="false" style="pointer-events:none">' + fx + "</svg>" : "") + "</span>";
  };

  /* A still crop of a du'a's own page picture (scene + Baby Mo + front layer, the
     same drawing the child sees on that du'a's page) framed on its key subject —
     the bed, the bathroom door, the car, the plate… For the quiz answer pictures.
     Focus box in frame units [x, y, w, h]; "slice" fills any card shape. */
  var THUMB = {
    wakeup: [-4, -92, 236, 236], bathroom_in: [-10, -104, 210, 200], bathroom_out: [20, -104, 230, 210],
    leave_home: [25, -112, 230, 220], vehicle: [30, -90, 240, 220], study: [5, -112, 240, 225],
    eating: [28, -80, 240, 220], after_eat: [5, -82, 240, 220], rain: [130, -122, 250, 250],
    enter_home: [10, -118, 250, 230], evening_dhikr: [10, -100, 240, 210], parents: [128, -82, 236, 226],
    bedtime_tasbih: [84, -66, 290, 250], sleep: [-30, -115, 260, 240]
  };
  window.doaSceneThumb = function (id, sfx) {
    var s = SCENES[id]; if (!s) return "";
    var k = "_" + (sfx || "t") + "_" + id, re = /(id="|url\(#)(ds[A-Za-z0-9]+)/g;
    var svg = svgOf(id).replace(re, "$1$2" + k), fx = fxOf(id, true).replace(re, "$1$2" + k);
    var b = boxOf(s.pose), m = s.mo, ih = m.h / (b[3] - b[1]), iw = ih * b[4];
    var ix = m.x - (b[0] + b[2]) / 2 * iw, iy = m.y - b[3] * ih, sw = (b[2] - b[0]) * iw;
    var night = isNight(id);
    return '<span class="dst' + (night ? " night" : "") + '"><svg viewBox="' + (THUMB[id] || [0, -110, 400, 250]).join(" ") + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + svg +
      shadow(f(m.x), m.y, f(sw * 0.46), f(sw * 0.1)).replace("url(#dsSh)", "url(#dsSh" + k + ")") +
      '<image href="' + poseSrc(s.pose) + '" x="' + f(ix) + '" y="' + f(iy) + '" width="' + f(iw) + '" height="' + f(ih) + '" preserveAspectRatio="none"' + (s.flip ? ' transform="translate(' + f(2 * ix + iw) + ' 0) scale(-1 1)"' : '') + '/>' + fx + "</svg></span>";
  };

  /* Place Baby Mo on the scene's ground: the picture is drawn with "meet",
     bottom-anchored, so frame unit u = min(W/400, H/300). The du'a card overlaps
     the bottom of the picture (--ov), so when there is spare sky above the frame
     the whole picture (scene, front layer and Mo together) is lifted (--sy) to
     keep the floor under Mo's feet in view; a soft contact shadow sits at his feet. */
  function layout(card) {
    var mo = document.getElementById("sceneMo"), s = SCENES[card.getAttribute("data-scene")];
    if (!mo || !s || !mo.parentElement || !mo.parentElement.classList.contains("scene-mo-wrap")) return;
    var W = card.clientWidth, H = card.clientHeight; if (!W || !H) return;
    var u = Math.min(W / 400, H / FH), ox = (W - 400 * u) / 2, b = boxOf(s.pose), m = s.mo;
    var ih = m.h * u / (b[3] - b[1]), iw = ih * b[4], wrap = mo.parentElement;
    var ov = parseFloat(getComputedStyle(card).getPropertyValue("--ov")) || 0, feet = (FY - m.y) * u;
    var sy = Math.max(0, Math.min(H - FH * u, ov + H * 0.08 - feet));
    card.style.setProperty("--sy", f(sy) + "px");
    wrap.style.left = f(ox + m.x * u - (b[0] + b[2]) / 2 * iw) + "px";
    wrap.style.bottom = f(feet + sy - (1 - b[3]) * ih) + "px";
    var sh = wrap.querySelector(".scene-mo-sh");
    if (!sh) { sh = document.createElement("span"); sh.className = "scene-mo-sh"; sh.setAttribute("aria-hidden", "true"); wrap.insertBefore(sh, mo); }
    var sw = (b[2] - b[0]) * iw, shw = sw * 0.92, shh = Math.max(6, sw * 0.16);
    sh.style.width = f(shw) + "px"; sh.style.height = f(shh) + "px";
    sh.style.left = f((b[0] + b[2]) / 2 * iw - shw / 2) + "px"; sh.style.top = f(b[3] * ih - shh * 0.55) + "px";
    mo.style.transformOrigin = "50% " + f(b[3] * 100) + "%";
    wrap.style.width = f(iw) + "px"; wrap.style.height = f(ih) + "px"; wrap.style.right = "auto";
    mo.style.height = ""; mo.style.width = "";
    card.style.setProperty("--u", Math.round(u * 1000) / 1000 + "px");
  }
  var ro = null;

  /* Render the scene for a du'a id into the header card. */
  window.renderDoaScene = function (id) {
    var s = SCENES[id]; var card = document.getElementById("sceneCard"); if (!s || !card) return false;
    ensureCss();
    card.classList.add("has-scene", "ds"); card.classList.remove("acted");
    card.setAttribute("data-scene", id);
    card.classList.toggle("night", isNight(id));
    var bg = document.getElementById("sceneBg");
    bg.innerHTML = '<svg viewBox="' + VB + '" preserveAspectRatio="xMidYMax meet" overflow="visible" aria-hidden="true">' + svgOf(id) + "</svg>";
    var fxl = card.querySelector(".scene-fx");
    if (card.classList.contains("scene-card")) {
      if (!fxl) { fxl = document.createElement("div"); fxl.className = "scene-fx"; fxl.setAttribute("aria-hidden", "true"); card.appendChild(fxl); }
      fxl.innerHTML = s.fx ? '<svg viewBox="' + VB + '" preserveAspectRatio="xMidYMax meet" overflow="visible">' + fxOf(id) + "</svg>" : "";
    }
    var mo = document.getElementById("sceneMo"); if (mo) { mo.setAttribute("data-flip", s.flip ? "1" : ""); mo.style.scale = s.flip ? "-1 1" : ""; }
    if (mo) {
      mo.src = poseSrc(s.pose);
      layout(card);
      var wrap = mo.parentElement; wrap.style.animation = "none"; void wrap.offsetWidth; wrap.style.animation = "";
    }
    if (!ro && window.ResizeObserver && card.classList.contains("scene-card")) { ro = new ResizeObserver(function () { layout(card); }); ro.observe(card); }
    return true;
  };
  /* Play a du'a's tap action in the learn header: motion + sound, then the caller
     carries on (read-along) after the returned number of ms. 0 = no action here. */
  var ACT_MS = { wakeup: 2000, bathroom_in: 1700, bathroom_out: 1600, leave_home: 1750, vehicle: 1800, study: 1750, eating: 1800,
    after_eat: 2050, rain: 1650, enter_home: 2100, evening_dhikr: 2000, parents: 1600, bedtime_tasbih: 1900, sleep: 1500 };
  window.playDoaAction = function (id) {
    var card = document.getElementById("sceneCard");
    if (!card || !SCENES[id] || card.getAttribute("data-scene") !== id || !card.classList.contains("scene-card")) return 0;
    var still = false;
    try { still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    card.classList.remove("acted"); void card.offsetWidth; card.classList.add("acted");
    Array.prototype.forEach.call(card.querySelectorAll("animate.dsx"), function (a) {
      try {
        if (still) { var v = a.getAttribute("values").split(";"); a.parentNode.setAttribute(a.getAttribute("attributeName"), v[v.length - 1]); }
        else a.beginElementAt(+a.getAttribute("data-at") || 0);
      } catch (e) {}
    });
    playSnd(id);
    return still ? 500 : (ACT_MS[id] || 1500);
  };
  window.doaScenePose = function (id) { return SCENES[id] ? SCENES[id].pose : ""; };

  /* Another du'a series (e.g. doa-ramadan-scenes.js) adds its own scenes with the same
     drawing kit, motion engine, sounds and layout: doaScenesExtend(function (kit) { return
     { scenes, sounds, pose, thumb, actMs, night, css }; }). */
  var KIT = { lg: lg, rg: rg, f: f, bg: bg, band: band, shadow: shadow, gloss: gloss, cloud: cloud, star: star, sparkle: sparkle,
    heart: heart, sun: sun, moon: moon, tree: tree, bush: bush, plant: plant, rug: rug, lamp: lamp, clock: clock, bunting: bunting,
    windowFrame: windowFrame, floorShine: floorShine, bird: bird, at: at, burst: burst, say: say, pre: pre, geo: geo, run: run, mo: mo,
    SPRING: SPRING };
  window.doaScenesExtend = function (make) {
    var x = typeof make === "function" ? make(KIT) : make; if (!x) return;
    var k;
    for (k in x.scenes || {}) SCENES[k] = x.scenes[k];
    for (k in x.sounds || {}) SND[k] = x.sounds[k];
    for (k in x.pose || {}) POSE[k] = x.pose[k];
    for (k in x.thumb || {}) THUMB[k] = x.thumb[k];
    for (k in x.actMs || {}) ACT_MS[k] = x.actMs[k];
    (x.night || []).forEach(function (id) { NIGHT[id] = 1; });
    if (x.css) { XCSS += (XCSS ? "\n" : "") + x.css; if (document.getElementById("doa-scenes-css")) ensureCss(); }
  };
})();
