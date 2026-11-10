/* Baby Mo — Doa Harian illustrated scene headers.
   One hand-drawn, gently animated SVG scene per du'a, with a real Baby Mo
   render standing in it. Pure SVG + CSS (no images besides Baby Mo), so the
   scenes stay crisp and light. Motion respects prefers-reduced-motion. */
(function () {
  "use strict";

  var CSS = [
    ".scene-card.has-scene{height:184px;background:#fff}",
    ".scene-card.has-scene .scene-time{left:auto;right:12px;background:rgba(255,255,255,.82);color:#152230;backdrop-filter:blur(6px)}",
    ".scene-card.has-scene.night .scene-time{background:rgba(20,24,60,.55);color:#fff}",
    ".scene-card.has-scene .scene-overlay,.scene-card.has-scene .scene-emojis{display:none}",
    ".scene-card.has-scene .scene-bg{background:none!important}",
    ".scene-card.has-scene .scene-bg svg{position:absolute;inset:0;width:100%;height:100%;display:block}",
    ".scene-card.has-scene .scene-mo-wrap{width:auto;height:156px;right:4%;bottom:0}",
    ".scene-card.has-scene .scene-mo-wrap img{width:auto;height:156px;object-fit:contain;filter:drop-shadow(0 8px 10px rgba(30,40,70,.28))}",
    ".scene-card.has-scene .scene-mo-wrap{animation:dsMoIn .55s cubic-bezier(.34,1.56,.64,1)}",
    "@keyframes dsMoIn{from{transform:translateY(24px) scale(.9);opacity:0}to{transform:none;opacity:1}}",
    // shared motion
    ".ds svg *{transform-box:fill-box;transform-origin:center}",
    ".ds .float{animation:dsFloat 4s ease-in-out infinite}",
    ".ds .float2{animation:dsFloat 5.5s ease-in-out infinite .8s}",
    "@keyframes dsFloat{50%{transform:translateY(-5px)}}",
    ".ds .drift{animation:dsDrift 22s linear infinite}",
    ".ds .drift.slow{animation-duration:34s}",
    ".ds .drift.d2{animation-delay:-11s}",
    "@keyframes dsDrift{from{transform:translateX(-140px)}to{transform:translateX(160px)}}",
    ".ds .spin{animation:dsSpin 18s linear infinite}",
    "@keyframes dsSpin{to{transform:rotate(360deg)}}",
    ".ds .rise{animation:dsRise 1.6s cubic-bezier(.2,.8,.3,1) both}",
    "@keyframes dsRise{from{transform:translateY(46px)}to{transform:none}}",
    ".ds .twinkle{animation:dsTwinkle 2.4s ease-in-out infinite}",
    ".ds .twinkle.t2{animation-delay:.8s}.ds .twinkle.t3{animation-delay:1.6s}.ds .twinkle.t4{animation-delay:.4s}",
    "@keyframes dsTwinkle{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1.1)}}",
    ".ds .sway{animation:dsSway 3.6s ease-in-out infinite}",
    "@keyframes dsSway{50%{transform:skewX(-4deg) translateX(2px)}}",
    ".ds .swing{animation:dsSwing 3s ease-in-out infinite;transform-origin:top center}",
    "@keyframes dsSwing{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}",
    ".ds .steam{animation:dsSteam 2.6s ease-in-out infinite;opacity:0}",
    ".ds .steam.s2{animation-delay:.85s}.ds .steam.s3{animation-delay:1.7s}",
    "@keyframes dsSteam{0%{opacity:0;transform:translateY(6px) scaleY(.8)}35%{opacity:.85}100%{opacity:0;transform:translateY(-20px) scaleY(1.1)}}",
    ".ds .bubble{animation:dsBubble 4.2s ease-in infinite;opacity:0}",
    ".ds .bubble.b2{animation-delay:1.1s}.ds .bubble.b3{animation-delay:2.2s}.ds .bubble.b4{animation-delay:3.1s}",
    "@keyframes dsBubble{0%{opacity:0;transform:translateY(0) scale(.6)}15%{opacity:.9}100%{opacity:0;transform:translateY(-90px) scale(1.15)}}",
    ".ds .step{animation:dsStep 3.2s ease-in-out infinite;opacity:0}",
    ".ds .step.p2{animation-delay:.5s}.ds .step.p3{animation-delay:1s}.ds .step.p4{animation-delay:1.5s}",
    "@keyframes dsStep{0%,8%{opacity:0;transform:scale(.6)}18%,70%{opacity:1;transform:scale(1)}90%,100%{opacity:0}}",
    ".ds .shine{animation:dsShine 3.5s ease-in-out infinite}",
    "@keyframes dsShine{0%,30%{transform:translateX(-60px);opacity:0}45%{opacity:.9}70%,100%{transform:translateX(60px);opacity:0}}",
    ".ds .glow{animation:dsGlow 2.8s ease-in-out infinite}",
    "@keyframes dsGlow{50%{opacity:.55;transform:scale(1.08)}}",
    ".ds .page{animation:dsPage 3.4s ease-in-out infinite;transform-origin:left center}",
    "@keyframes dsPage{0%,35%{transform:scaleX(1)}60%,100%{transform:scaleX(-1)}}",
    ".ds .letter{animation:dsLetter 5s ease-in-out infinite;opacity:0}",
    ".ds .letter.l2{animation-delay:1.6s}.ds .letter.l3{animation-delay:3.2s}",
    "@keyframes dsLetter{0%{opacity:0;transform:translateY(10px) rotate(-8deg)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translateY(-34px) rotate(8deg)}}",
    ".ds .zz{animation:dsZ 3.6s ease-in-out infinite;opacity:0}",
    ".ds .zz.z2{animation-delay:1.2s}.ds .zz.z3{animation-delay:2.4s}",
    "@keyframes dsZ{0%{opacity:0;transform:translate(0,8px) scale(.6)}25%{opacity:1}100%{opacity:0;transform:translate(16px,-30px) scale(1.2)}}",
    ".ds .bird{animation:dsBird 9s linear infinite}",
    "@keyframes dsBird{from{transform:translate(-40px,10px)}50%{transform:translate(60px,-4px)}to{transform:translate(160px,6px)}}",
    ".ds .flap{animation:dsFlap .5s ease-in-out infinite alternate;transform-origin:center bottom}",
    "@keyframes dsFlap{to{transform:scaleY(.4)}}",
    ".ds .wobble{animation:dsWobble 1.8s ease-in-out infinite;transform-origin:bottom center}",
    "@keyframes dsWobble{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}",
    ".ds .door{animation:dsDoor 4s ease-in-out infinite;transform-origin:left center}",
    "@keyframes dsDoor{0%,20%{transform:scaleX(1)}45%,75%{transform:scaleX(.55)}100%{transform:scaleX(1)}}",
    ".ds .wheel{animation:dsSpin .7s linear infinite}",
    ".ds .dash{animation:dsDash .9s linear infinite}",
    "@keyframes dsDash{to{transform:translateX(-48px)}}",
    ".ds .pass{animation:dsPass 6s linear infinite}",
    ".ds .pass.p2{animation-delay:-3s}",
    "@keyframes dsPass{from{transform:translateX(120px)}to{transform:translateX(-320px)}}",
    ".ds .bump{animation:dsBump .45s ease-in-out infinite alternate}",
    "@keyframes dsBump{to{transform:translateY(-1.6px)}}",
    ".ds .drop{animation:dsDrop 1s linear infinite;opacity:.85}",
    ".ds .drop.r2{animation-delay:-.33s}.ds .drop.r3{animation-delay:-.66s}",
    "@keyframes dsDrop{from{transform:translate(6px,-40px)}to{transform:translate(-6px,150px)}}",
    ".ds .ripple{animation:dsRipple 1.6s ease-out infinite;opacity:0}",
    ".ds .ripple.q2{animation-delay:.55s}.ds .ripple.q3{animation-delay:1.1s}",
    "@keyframes dsRipple{0%{opacity:.9;transform:scale(.3)}100%{opacity:0;transform:scale(1.4)}}",
    ".ds .beat{animation:dsBeat 1.4s ease-in-out infinite}",
    "@keyframes dsBeat{0%,100%{transform:scale(1)}15%{transform:scale(1.15)}30%{transform:scale(1)}45%{transform:scale(1.1)}}",
    ".ds .sink{animation:dsSink 8s ease-in-out infinite alternate}",
    "@keyframes dsSink{from{transform:translateY(-6px)}to{transform:translateY(10px)}}",
    ".ds .bead{animation:dsBeadOn 4s linear infinite;opacity:0}",
    "@keyframes dsBeadOn{0%{opacity:0}5%,45%{opacity:1}60%,100%{opacity:0}}",
    "@media (prefers-reduced-motion:reduce){.ds *{animation:none!important}.ds .steam,.ds .bubble,.ds .step,.ds .letter,.ds .zz{opacity:.8}}"
  ].join("\n");

  var cloud = function (x, y, s, fill, cls) {
    return '<g class="' + (cls || "drift") + '"><g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + (fill || "#fff") + '">' +
      '<ellipse cx="0" cy="8" rx="22" ry="10"/><ellipse cx="-12" cy="4" rx="12" ry="10"/><ellipse cx="10" cy="0" rx="14" ry="13"/></g></g>';
  };
  var star = function (x, y, r, cls, fill) {
    var p = [];
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; p.push((x + rr * Math.cos(a)).toFixed(1) + "," + (y + rr * Math.sin(a)).toFixed(1)); }
    return '<polygon class="' + (cls || "") + '" points="' + p.join(" ") + '" fill="' + (fill || "#FFE27A") + '"/>';
  };
  var sparkle = function (x, y, s, cls, fill) {
    // position on the outer group, animation on the inner one (CSS transform would override the attribute)
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path class="' + (cls || "") + '" fill="' + (fill || "#fff") +
      '" d="M0-10C1.2-2.4 2.4-1.2 10 0 2.4 1.2 1.2 2.4 0 10-1.2 2.4-2.4 1.2-10 0-2.4-1.2-1.2-2.4 0-10z"/></g>';
  };
  var foot = function (x, y, rot, cls, left) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + (left ? -1 : 1) + ',1)"><g class="step ' + cls + '" fill="#8AA5C2" opacity=".75">' +
      '<ellipse cx="0" cy="0" rx="4.2" ry="7"/><circle cx="-2.6" cy="-9.5" r="1.6"/><circle cx="0" cy="-10.6" r="1.7"/><circle cx="2.5" cy="-9.8" r="1.5"/></g></g>';
  };
  var floor = function (c1, c2) {
    return '<rect x="0" y="146" width="400" height="34" fill="' + c1 + '"/><rect x="0" y="146" width="400" height="4" fill="' + c2 + '"/>';
  };

  var SCENES = {
    /* 1 · Bangun tidur — sunrise bedroom */
    wakeup: {
      pose: "baby-mo-pose-41",
      svg: '<defs><linearGradient id="dsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB98A"/><stop offset=".55" stop-color="#FFD9A0"/><stop offset="1" stop-color="#FFF1C9"/></linearGradient>' +
        '<clipPath id="dsWin"><rect x="34" y="20" width="124" height="88" rx="10"/></clipPath>' +
        '<radialGradient id="dsSun"><stop offset="0" stop-color="#FFF6C4"/><stop offset=".55" stop-color="#FFC94A"/><stop offset="1" stop-color="#FF9F1A"/></radialGradient></defs>' +
        '<rect width="400" height="180" fill="#FFF0DC"/><circle cx="330" cy="40" r="120" fill="#FFE2C2" opacity=".6"/>' +
        '<g clip-path="url(#dsWin)"><rect x="34" y="20" width="124" height="88" fill="url(#dsSky)"/>' +
        '<g class="rise"><g class="spin" ><g transform="translate(96 92)" stroke="#FFD25A" stroke-width="3" stroke-linecap="round" opacity=".8">' +
        '<path d="M0-34V-44M24-24l7-7M34 0h10M-24-24l-7-7M-34 0h-10"/></g></g><circle cx="96" cy="92" r="22" fill="url(#dsSun)"/></g>' +
        '<path d="M34 98c20-8 40-8 62-2s42 6 62-2v14H34z" fill="#9FD9A6"/>' +
        cloud(70, 40, .7) + cloud(130, 30, .55, "#fff", "drift d2") +
        '<g class="bird"><g transform="translate(60 46)"><path class="flap" d="M-7 0q3.5-5 7 0q3.5-5 7 0" fill="none" stroke="#7A5A48" stroke-width="2" stroke-linecap="round"/></g></g></g>' +
        '<rect x="34" y="20" width="124" height="88" rx="10" fill="none" stroke="#fff" stroke-width="7"/><path d="M96 20v88M34 64h124" stroke="#fff" stroke-width="4"/>' +
        '<path class="sway" d="M22 14h30c-4 30-2 64 6 100H22z" fill="#FF9DB4"/><path class="sway" d="M170 14h-30c4 30 2 64-6 100h36z" fill="#FF9DB4"/>' +
        '<rect x="16" y="10" width="160" height="7" rx="3.5" fill="#E9897A"/>' +
        floor("#F2C996", "#E3B47E") +
        '<rect x="12" y="112" width="150" height="42" rx="12" fill="#8FC9F2"/><rect x="12" y="104" width="150" height="16" rx="8" fill="#B6DEFA"/>' +
        '<rect x="22" y="96" width="44" height="18" rx="9" fill="#fff"/><path d="M70 118c20-6 50-6 92 0v36H70z" fill="#5FA8E6"/>' +
        '<rect x="6" y="94" width="12" height="62" rx="5" fill="#C98A5B"/><rect x="156" y="104" width="12" height="52" rx="5" fill="#C98A5B"/>' +
        '<g class="float2"><circle cx="214" cy="62" r="17" fill="#fff" stroke="#E9897A" stroke-width="4"/><path d="M214 52v10l7 5" stroke="#3B4A5C" stroke-width="2.6" stroke-linecap="round" fill="none"/></g>' +
        sparkle(250, 30, .8, "twinkle", "#FFC94A") + sparkle(196, 110, .55, "twinkle t2", "#FFC94A")
    },

    /* 2 · Masuk kamar mandi — footprints toward the door, left foot first */
    bathroom_in: {
      pose: "baby-mo-pose-21",
      svg: '<defs><pattern id="dsTile" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#DDF3FB"/><path d="M22 0H0V22" fill="none" stroke="#BFE4F2" stroke-width="2"/></pattern>' +
        '<linearGradient id="dsMirror" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EAF7FF"/><stop offset="1" stop-color="#BFE3F7"/></linearGradient>' +
        '<clipPath id="dsMir"><rect x="150" y="26" width="58" height="52" rx="26"/></clipPath></defs>' +
        '<rect width="400" height="180" fill="url(#dsTile)"/>' +
        floor("#BFD7EA", "#A9C6DE") +
        '<rect x="28" y="30" width="82" height="118" rx="8" fill="#C98A5B"/><rect x="36" y="38" width="66" height="44" rx="6" fill="#B87A4C"/><rect x="36" y="90" width="66" height="50" rx="6" fill="#B87A4C"/>' +
        '<circle cx="98" cy="96" r="5" fill="#FFD25A"/><rect x="54" y="16" width="30" height="20" rx="6" fill="#fff"/><path d="M69 21c-4 5-6 7-6 9a6 6 0 0 0 12 0c0-2-2-4-6-9z" fill="#38BDF8"/>' +
        foot(150, 166, -78, "p4", true) + foot(178, 160, -100, "p3") + foot(204, 168, -80, "p2", true) + foot(232, 160, -100, "p1") +
        '<rect x="146" y="22" width="66" height="60" rx="30" fill="#fff"/><rect x="150" y="26" width="58" height="52" rx="26" fill="url(#dsMirror)"/>' +
        '<g clip-path="url(#dsMir)"><rect class="shine" x="172" y="10" width="12" height="90" fill="#fff" opacity=".8" transform="rotate(20 178 52)"/></g>' +
        '<path d="M140 104h80l-6 22a10 10 0 0 1-10 8h-48a10 10 0 0 1-10-8z" fill="#fff"/><rect x="136" y="98" width="88" height="10" rx="5" fill="#F4FBFF"/>' +
        '<rect x="176" y="86" width="8" height="14" rx="3" fill="#A9B8C8"/><path d="M180 88h12v6" stroke="#A9B8C8" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<circle class="bubble" cx="160" cy="96" r="5" fill="#fff" stroke="#9ED8F5"/><circle class="bubble b2" cx="200" cy="96" r="4" fill="#fff" stroke="#9ED8F5"/>' +
        '<circle class="bubble b3" cx="176" cy="98" r="6" fill="#fff" stroke="#9ED8F5"/><circle class="bubble b4" cx="214" cy="96" r="3.5" fill="#fff" stroke="#9ED8F5"/>' +
        '<g class="swing"><rect x="238" y="40" width="4" height="10" fill="#A9B8C8"/><rect x="226" y="48" width="28" height="44" rx="6" fill="#FFB3C7"/><rect x="226" y="80" width="28" height="6" fill="#FF8FAE"/></g>'
    },

    /* 3 · Keluar kamar mandi — fresh & sparkly, footprints out, right foot first */
    bathroom_out: {
      pose: "baby-mo-pose-07",
      svg: '<defs><pattern id="dsTile2" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#DDF7EC"/><path d="M22 0H0V22" fill="none" stroke="#BDEBD7" stroke-width="2"/></pattern>' +
        '<linearGradient id="dsLight" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF7D6"/><stop offset="1" stop-color="#FFF7D6" stop-opacity="0"/></linearGradient></defs>' +
        '<rect width="400" height="180" fill="url(#dsTile2)"/>' +
        floor("#BFE6D2", "#A5D8BF") +
        '<rect x="28" y="30" width="82" height="118" rx="8" fill="#8A6A4B"/><rect x="34" y="36" width="70" height="112" fill="#FFF3C4"/>' +
        '<path d="M110 40l70-10v130l-70-12z" fill="url(#dsLight)" opacity=".8"/>' +
        '<g class="door"><rect x="34" y="36" width="70" height="112" rx="4" fill="#C98A5B"/><rect x="42" y="44" width="54" height="40" rx="5" fill="#B87A4C"/><rect x="42" y="92" width="54" height="48" rx="5" fill="#B87A4C"/><circle cx="92" cy="98" r="4.5" fill="#FFD25A"/></g>' +
        foot(130, 160, 100, "p1", false) + foot(158, 168, 80, "p2", true) + foot(186, 160, 100, "p3", false) + foot(214, 168, 80, "p4", true) +
        '<g class="float"><path d="M196 40c-10 14-15 22-15 29a15 15 0 0 0 30 0c0-7-5-15-15-29z" fill="#7DD3FC"/><circle cx="191" cy="70" r="2" fill="#0B4A6F"/><circle cx="201" cy="70" r="2" fill="#0B4A6F"/><path d="M191 77q5 5 10 0" stroke="#0B4A6F" stroke-width="2" fill="none" stroke-linecap="round"/></g>' +
        sparkle(150, 46, 1, "twinkle") + sparkle(232, 30, .8, "twinkle t2", "#FFE27A") + sparkle(240, 104, .9, "twinkle t3") + sparkle(132, 110, .6, "twinkle t4", "#FFE27A") +
        '<g class="swing"><rect x="252" y="44" width="4" height="10" fill="#9FB5AA"/><rect x="240" y="52" width="28" height="40" rx="6" fill="#A7E3C9"/><rect x="240" y="80" width="28" height="6" fill="#7FD0AE"/></g>'
    },

    /* 4 · Sebelum makan — a tidy table, steam rising; Mo stands on the floor beside it */
    eating: {
      pose: "baby-mo-pose-05",
      svg: '<defs><pattern id="dsCloth" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#FFF"/><rect width="8" height="8" fill="#FFB3B3"/><rect x="8" y="8" width="8" height="8" fill="#FFB3B3"/></pattern>' +
        '<clipPath id="dsWin2"><rect x="150" y="14" width="96" height="62" rx="10"/></clipPath></defs>' +
        '<rect width="400" height="180" fill="#FFF4D8"/><circle cx="60" cy="10" r="90" fill="#FFE9B3" opacity=".7"/>' +
        '<g clip-path="url(#dsWin2)"><rect x="150" y="14" width="96" height="62" fill="#BFE6FF"/><circle class="glow" cx="224" cy="34" r="12" fill="#FFD25A"/>' + cloud(180, 50, .5) + '</g>' +
        '<rect x="150" y="14" width="96" height="62" rx="10" fill="none" stroke="#fff" stroke-width="6"/><path d="M198 14v62" stroke="#fff" stroke-width="4"/>' +
        floor("#E9BE8F", "#D9A974") +
        // table: legs on the floor, cloth on top
        '<rect x="34" y="128" width="10" height="34" rx="3" fill="#B97D4A"/><rect x="236" y="128" width="10" height="34" rx="3" fill="#B97D4A"/>' +
        '<rect x="20" y="118" width="240" height="12" rx="4" fill="#C98A5B"/>' +
        '<path d="M18 108h244v12c-6 8-12 8-18 0-6 8-12 8-18 0-6 8-12 8-18 0-6 8-12 8-18 0-6 8-12 8-18 0-6 8-12 8-18 0-6 8-12 8-18 0-6 8-12 8-18 0-6 8-12 8-18 0-6 8-12 8-18 0-6 8-12 8-18 0-6 8-12 8-18 0-6 8-12 8-18 0-6 8-12 8-10 0z" fill="url(#dsCloth)"/>' +
        // plate: rice + egg
        '<ellipse cx="74" cy="107" rx="36" ry="6" fill="#fff" stroke="#E5ECF3"/><path d="M50 106c0-13 10-20 20-20s20 7 20 20z" fill="#fff" stroke="#E5ECF3"/>' +
        '<circle cx="62" cy="96" r="1.8" fill="#E5ECF3"/><circle cx="76" cy="93" r="1.8" fill="#E5ECF3"/><ellipse cx="96" cy="103" rx="10" ry="5" fill="#fff" stroke="#F1E6C8"/><circle cx="96" cy="102" r="3.6" fill="#FFC94A"/>' +
        '<path class="steam" d="M62 80c-5-6 5-10 0-16" stroke="#C9D6E3" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path class="steam s2" d="M74 78c-5-6 5-10 0-16" stroke="#C9D6E3" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        // soup bowl
        '<path d="M126 92h44c0 10-8 16-22 16s-22-6-22-16z" fill="#7DD3FC"/><ellipse cx="148" cy="92" rx="22" ry="4.5" fill="#F59E0B"/><rect x="138" y="106" width="20" height="3" rx="1.5" fill="#5BB8E8"/>' +
        '<path class="steam s3" d="M142 84c-5-6 5-10 0-16" stroke="#C9D6E3" stroke-width="3" fill="none" stroke-linecap="round"/><path class="steam" d="M155 82c-5-6 5-10 0-16" stroke="#C9D6E3" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        // glass of water + apple, standing on the cloth
        '<path d="M188 82h20l-2 26h-16z" fill="#E0F4FF" stroke="#9ED8F5" stroke-width="2"/><path d="M190 94h16l-1.2 13h-13.6z" fill="#7DD3FC" opacity=".7"/>' +
        '<circle cx="232" cy="99" r="9" fill="#FF6B6B"/><path d="M232 90q2-6 7-6" stroke="#5A8F3C" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M233 89c2-4 6-5 9-4-2 4-6 5-9 4z" fill="#7BC46A"/>'
    },

    /* 5 · Doa belajar — a tidy desk, page flipping, letters floating; Mo stands on the floor */
    study: {
      pose: "baby-mo-idea",
      svg: '<defs><radialGradient id="dsLamp" cx=".5" cy="0"><stop offset="0" stop-color="#FFF4C2" stop-opacity=".95"/><stop offset="1" stop-color="#FFF4C2" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="400" height="180" fill="#EEE8FF"/><circle cx="340" cy="20" r="110" fill="#E3DAFF" opacity=".7"/>' +
        // wall shelf with upright books and a little plant
        '<rect x="20" y="58" width="116" height="7" rx="3" fill="#B993E8"/>' +
        '<rect x="26" y="26" width="12" height="32" rx="2" fill="#FF8FAE"/><rect x="40" y="30" width="10" height="28" rx="2" fill="#7DD3FC"/><rect x="52" y="24" width="13" height="34" rx="2" fill="#FFC94A"/>' +
        '<rect x="67" y="32" width="10" height="26" rx="2" fill="#86E0A9"/><rect x="79" y="27" width="12" height="31" rx="2" fill="#A78BFA"/>' +
        '<path d="M104 44h22l-3 14h-16z" fill="#E9897A"/><path d="M115 44c-6-10-2-16 0-18 2 2 6 8 0 18M115 44c-10-4-12-10-11-13 3 0 9 3 11 13M115 44c10-4 12-10 11-13-3 0-9 3-11 13" fill="#5FBF7A"/>' +
        floor("#D9B48A", "#C99E70") +
        // desk on legs
        '<rect x="34" y="124" width="10" height="38" rx="3" fill="#B98552"/><rect x="226" y="124" width="10" height="38" rx="3" fill="#B98552"/>' +
        '<rect x="24" y="126" width="222" height="12" rx="3" fill="#C9935E"/><rect x="18" y="116" width="234" height="10" rx="4" fill="#D9A56E"/>' +
        // lamp standing on the desk
        '<path class="glow" d="M150 62h44l34 54H118z" fill="url(#dsLamp)"/>' +
        '<path d="M154 40l-10 22h46l-10-22z" fill="#7C5CE0"/><rect x="165" y="62" width="4" height="50" fill="#5B42B8"/><ellipse cx="167" cy="114" rx="16" ry="4" fill="#5B42B8"/>' +
        // open book lying flat on the desk + pencil beside it
        '<path d="M52 115l38-5 38 5v-3l-38-5-38 5z" fill="#C7BCEB"/>' +
        '<path d="M52 112c12-6 26-7 38-4v-18c-12-3-26-2-38 4z" fill="#fff" stroke="#D7CCF5" stroke-width="2"/>' +
        '<path d="M60 98l22-4M60 104l18-3" stroke="#C7BCEB" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M128 112c-12-6-26-7-38-4v-18c12-3 26-2 38 4z" fill="#fff" stroke="#D7CCF5" stroke-width="2"/>' +
        '<path d="M98 94l22 4M98 100l18 3" stroke="#C7BCEB" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path class="page" d="M90 108v-18c10-3 22-2 32 3v18c-10-5-22-6-32-3z" fill="#FAF7FF" stroke="#D7CCF5" stroke-width="1.6"/>' +
        '<rect x="196" y="110" width="34" height="5" rx="2" fill="#FFC94A"/><path d="M230 110l7 2.5-7 2.5z" fill="#F4D3A8"/><rect x="192" y="110" width="5" height="5" rx="1.5" fill="#FF8FAE"/>' +
        // letters floating up from the book
        '<text class="letter" x="74" y="84" font-family="Amiri Quran, Amiri, serif" font-size="20" fill="#7C5CE0">ا</text>' +
        '<text class="letter l2" x="92" y="80" font-family="Amiri Quran, Amiri, serif" font-size="20" fill="#E8590C">ب</text>' +
        '<text class="letter l3" x="112" y="84" font-family="Amiri Quran, Amiri, serif" font-size="20" fill="#0A9488">ت</text>' +
        sparkle(232, 40, .8, "twinkle", "#FFC94A") + sparkle(256, 76, .6, "twinkle t2", "#A78BFA") + sparkle(214, 20, .5, "twinkle t3", "#FF8FAE")
    },

    /* 6 · Sebelum tidur — night room, moon, stars, Zzz */
    sleep: {
      pose: "baby-mo-pose-39",
      svg: '<defs><linearGradient id="dsNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2A5A"/><stop offset="1" stop-color="#3A3F7A"/></linearGradient>' +
        '<clipPath id="dsWin3"><rect x="34" y="18" width="110" height="80" rx="40"/></clipPath>' +
        '<radialGradient id="dsNl"><stop offset="0" stop-color="#FFE29A" stop-opacity=".9"/><stop offset="1" stop-color="#FFE29A" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="400" height="180" fill="#2B2F66"/>' +
        '<g clip-path="url(#dsWin3)"><rect x="34" y="18" width="110" height="80" fill="url(#dsNight)"/>' +
        '<circle class="glow" cx="104" cy="50" r="24" fill="#FFF3C4" opacity=".25"/><circle cx="104" cy="50" r="16" fill="#FFE29A"/><circle cx="112" cy="44" r="14" fill="#1E2A5A"/>' +
        star(56, 36, 4, "twinkle", "#fff") + star(74, 64, 3, "twinkle t2", "#FFE29A") + star(130, 80, 3.5, "twinkle t3", "#fff") +
        cloud(70, 84, .45, "#5A64A8", "drift slow") + '</g>' +
        '<rect x="34" y="18" width="110" height="80" rx="40" fill="none" stroke="#5A64A8" stroke-width="6"/>' +
        star(190, 26, 3.5, "twinkle t4", "#FFE29A") + star(236, 52, 2.6, "twinkle", "#fff") + star(170, 70, 2.4, "twinkle t3", "#fff") + star(258, 18, 3, "twinkle t2", "#fff") +
        floor("#3F4488", "#353A78") +
        '<rect x="8" y="110" width="160" height="44" rx="12" fill="#6C7AE0"/><rect x="8" y="102" width="160" height="16" rx="8" fill="#8E9BF0"/>' +
        '<rect x="18" y="94" width="46" height="18" rx="9" fill="#E8EBFF"/><path d="M66 116c24-6 58-6 102 0v38H66z" fill="#A78BFA"/>' +
        star(96, 132, 4, "", "#FFE29A") + star(130, 140, 3.2, "", "#FFE29A") + star(150, 126, 2.6, "", "#FFE29A") +
        '<rect x="0" y="92" width="12" height="64" rx="5" fill="#4C4F96"/><rect x="164" y="102" width="12" height="54" rx="5" fill="#4C4F96"/>' +
        '<circle class="glow" cx="214" cy="118" r="30" fill="url(#dsNl)"/><path d="M204 116h20l-4-16h-12z" fill="#FFD25A"/><rect x="211" y="116" width="6" height="22" fill="#B6A6E8"/><rect x="202" y="138" width="24" height="6" rx="3" fill="#B6A6E8"/>' +
        '<text class="zz" x="262" y="92" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="18" fill="#C7D2FE">Z</text>' +
        '<text class="zz z2" x="276" y="78" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="14" fill="#C7D2FE">z</text>' +
        '<text class="zz z3" x="288" y="66" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="11" fill="#C7D2FE">z</text>'
    },
    /* 7 · Keluar rumah — morning front yard, the door swinging open */
    leave_home: {
      pose: "baby-mo-run",
      svg: '<defs><linearGradient id="dsSkyM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD8FF"/><stop offset="1" stop-color="#E9F7FF"/></linearGradient></defs>' +
        '<rect width="400" height="180" fill="url(#dsSkyM)"/><circle class="glow" cx="250" cy="34" r="16" fill="#FFE47A"/>' +
        cloud(150, 30, .7) + cloud(330, 22, .5, "#fff", "drift d2") +
        '<path d="M0 124 Q90 100 190 118 Q300 100 400 120 V180 H0Z" fill="#A6DB8E"/>' +
        '<rect x="0" y="140" width="400" height="40" fill="#8ED07A"/>' +
        /* house */
        '<rect x="22" y="58" width="132" height="90" rx="4" fill="#FFF3DE"/><path d="M10 64 L88 18 L166 64Z" fill="#E86B5A"/><path d="M22 64 L88 26 L154 64" stroke="#FFF7E8" stroke-width="5" fill="none" stroke-linejoin="round"/>' +
        '<rect x="34" y="78" width="28" height="26" rx="4" fill="#9ED8FF" stroke="#fff" stroke-width="4"/><path d="M48 78v26M34 91h28" stroke="#fff" stroke-width="3"/>' +
        '<rect x="74" y="88" width="34" height="60" rx="4" fill="#5B3A22"/><rect class="door" x="74" y="88" width="34" height="60" rx="4" fill="#B87A4C"/><circle cx="102" cy="120" r="2.6" fill="#FFD25A"/>' +
        '<rect x="70" y="146" width="42" height="6" rx="3" fill="#E3B47E"/>' +
        '<path d="M150 152 h44 M206 150 h40 M258 152 h40" stroke="#E9D7A8" stroke-width="12" stroke-linecap="round"/>' +
        /* little shoes and a bush */
        '<path d="M122 146 q6 -6 14 0 v4 h-14z M136 146 q6 -6 14 0 v4 h-14z" fill="#3D7EE3"/>' +
        '<circle cx="170" cy="134" r="14" fill="#5DBB6B"/><circle cx="186" cy="138" r="11" fill="#4CAF5E"/><circle cx="168" cy="128" r="3" fill="#FF8FB8"/><circle cx="182" cy="132" r="3" fill="#FFE066"/>' +
        '<g class="bird"><g transform="translate(200 50)"><path class="flap" d="M-7 0q3.5-5 7 0q3.5-5 7 0" fill="none" stroke="#5A6A7A" stroke-width="2" stroke-linecap="round"/></g></g>'
    },

    /* 8 · Naik kendaraan — a family car driving along a sunny road */
    vehicle: {
      pose: "baby-mo-yes",
      svg: '<defs><linearGradient id="dsSkyV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD0FF"/><stop offset="1" stop-color="#DDF2FF"/></linearGradient>' +
        '<linearGradient id="dsCar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF7A6B"/><stop offset="1" stop-color="#E5484D"/></linearGradient></defs>' +
        '<rect width="400" height="180" fill="url(#dsSkyV)"/><circle class="glow" cx="40" cy="34" r="17" fill="#FFE47A"/>' +
        cloud(140, 26, .65) + cloud(250, 40, .5, "#fff", "drift d2") +
        '<path d="M0 104 Q70 76 150 98 Q240 70 330 96 Q370 86 400 92 V130 H0Z" fill="#9FD3A0"/>' +
        /* trees and poles passing by */
        '<g class="pass"><g transform="translate(300 0)"><rect x="-3" y="88" width="6" height="30" fill="#9A6236"/><circle cx="0" cy="84" r="14" fill="#4CB868"/><circle cx="-8" cy="92" r="9" fill="#5DC377"/></g></g>' +
        '<g class="pass p2"><g transform="translate(300 0)"><rect x="-3" y="92" width="6" height="26" fill="#9A6236"/><circle cx="0" cy="88" r="12" fill="#3FA85B"/></g></g>' +
        '<rect x="0" y="116" width="400" height="10" fill="#7CC67A"/>' +
        /* road */
        '<rect x="0" y="124" width="400" height="44" fill="#5E6672"/><rect x="0" y="124" width="400" height="4" fill="#C9CED6"/><rect x="0" y="164" width="400" height="4" fill="#C9CED6"/>' +
        '<g class="dash">' + [0,48,96,144,192,240,288,336,384,432].map(function (x) { return '<rect x="' + x + '" y="144" width="26" height="4" rx="2" fill="#FFE066"/>'; }).join('') + '</g>' +
        '<rect x="0" y="168" width="400" height="12" fill="#8ED07A"/>' +
        /* car */
        '<g transform="translate(88 104)"><g class="bump">' +
        '<ellipse cx="62" cy="54" rx="58" ry="5" fill="#000" opacity=".18"/>' +
        '<path d="M8 40 q0 -14 14 -16 l18 -2 l16 -18 q4 -4 10 -4 h34 q6 0 10 5 l14 17 h10 q14 2 14 18 v10 h-140z" fill="url(#dsCar)"/>' +
        '<path d="M44 22 l14 -15 h16 v15z" fill="#BFE7FF"/><path d="M80 22 v-15 h12 q4 0 6 3 l10 12z" fill="#BFE7FF"/>' +
        '<rect x="76" y="7" width="4" height="15" fill="#E5484D"/><rect x="112" y="28" width="12" height="4" rx="2" fill="#B8323A"/>' +
        '<circle cx="132" cy="34" r="4" fill="#FFF3B0"/><rect x="6" y="34" width="6" height="6" rx="2" fill="#FF9A3C"/>' +
        '<g transform="translate(36 50)"><g class="wheel"><circle r="12" fill="#2B2F3A"/><circle r="5.5" fill="#C9CED6"/><rect x="-1.2" y="-10" width="2.4" height="20" fill="#C9CED6"/></g></g>' +
        '<g transform="translate(110 50)"><g class="wheel"><circle r="12" fill="#2B2F3A"/><circle r="5.5" fill="#C9CED6"/><rect x="-1.2" y="-10" width="2.4" height="20" fill="#C9CED6"/></g></g>' +
        '</g></g>' +
        sparkle(232, 70, .7, "twinkle", "#fff")
    },

    /* 9 · Sesudah makan — a clean plate and a happy tummy */
    after_eat: {
      pose: "baby-mo-thank-you",
      svg: '<rect width="400" height="180" fill="#FFF3E0"/><circle cx="330" cy="30" r="120" fill="#FFE6C4" opacity=".6"/>' +
        '<rect x="30" y="18" width="110" height="76" rx="10" fill="#BFE7FF" stroke="#fff" stroke-width="7"/><path d="M85 18v76M30 56h110" stroke="#fff" stroke-width="4"/>' +
        cloud(70, 40, .5) + '<circle cx="118" cy="34" r="9" fill="#FFE47A"/>' +
        '<path d="M22 14h24c-4 30-2 64 6 90H22z M148 14h-24c4 30 2 64-6 90h30z" fill="#FFB38A"/>' +
        /* table */
        '<rect x="0" y="118" width="400" height="62" fill="#C98A5B"/><rect x="0" y="112" width="400" height="12" rx="3" fill="#E0A574"/>' +
        '<path d="M0 124 h400" stroke="#B5794C" stroke-width="2"/>' +
        /* plate */
        '<ellipse cx="120" cy="114" rx="52" ry="12" fill="#000" opacity=".1"/><ellipse cx="120" cy="110" rx="50" ry="13" fill="#fff"/><ellipse cx="120" cy="109" rx="34" ry="8" fill="#F3F6FA"/>' +
        '<circle cx="110" cy="108" r="1.6" fill="#E8C27A"/><circle cx="128" cy="110" r="1.4" fill="#E8C27A"/><circle cx="120" cy="106" r="1.2" fill="#E8C27A"/>' +
        '<path d="M178 96 l4 20" stroke="#C9CED6" stroke-width="4" stroke-linecap="round"/><ellipse cx="177" cy="94" rx="4" ry="6" fill="#C9CED6"/>' +
        /* glass of milk */
        '<path d="M206 76 h26 l-3 40 h-20z" fill="#EAF6FF" stroke="#C9E4F5" stroke-width="2"/><path d="M208 96 h22 l-1.6 20 h-18.8z" fill="#fff"/>' +
        '<path d="M60 96 q6 -10 16 -4" stroke="#fff" stroke-width="0"/>' +
        '<path class="steam" d="M120 92 q-6 -10 0 -18 q6 -8 0 -16" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>' +
        '<g class="beat"><path d="M256 60 c-6 -8 -18 -4 -16 4 c1 6 16 16 16 16 s15 -10 16 -16 c2 -8 -10 -12 -16 -4z" fill="#FF7A9A"/></g>' +
        sparkle(150, 70, .8, "twinkle", "#FFC94A") + sparkle(90, 80, .6, "twinkle t2", "#FFC94A")
    },

    /* 10 · Ketika hujan — gentle rain, puddles and happy plants */
    rain: {
      pose: "baby-mo-wow",
      svg: '<defs><linearGradient id="dsSkyR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA7C8"/><stop offset="1" stop-color="#D8E4F2"/></linearGradient></defs>' +
        '<rect width="400" height="180" fill="url(#dsSkyR)"/>' +
        cloud(70, 26, 1.1, "#EEF3FA") + cloud(190, 18, .95, "#E4EBF5", "drift d2") + cloud(310, 30, .8, "#EEF3FA", "drift slow") +
        '<path d="M0 122 Q100 104 200 118 Q300 102 400 120 V180 H0Z" fill="#7EC48A"/><rect y="146" width="400" height="34" fill="#6DB879"/>' +
        /* rain */
        (function () { var r = ''; for (var i = 0; i < 26; i++) { var x = (i * 37) % 400, y = (i * 23) % 60, c = ["", "r2", "r3"][i % 3];
          r += '<path class="drop ' + c + '" d="M' + x + ' ' + y + ' l-3 9" stroke="#F2F8FF" stroke-width="2.4" stroke-linecap="round"/>'; } return r; })() +
        /* puddles with ripples */
        '<ellipse cx="80" cy="160" rx="34" ry="7" fill="#9CC7EA"/><ellipse class="ripple" cx="76" cy="160" rx="14" ry="3" fill="none" stroke="#fff" stroke-width="1.6"/><ellipse class="ripple q2" cx="90" cy="160" rx="10" ry="2.4" fill="none" stroke="#fff" stroke-width="1.4"/>' +
        '<ellipse cx="200" cy="166" rx="26" ry="5" fill="#9CC7EA"/><ellipse class="ripple q3" cx="200" cy="166" rx="10" ry="2.4" fill="none" stroke="#fff" stroke-width="1.4"/>' +
        /* happy sprouting plants */
        '<g class="sway"><path d="M140 146 v-22" stroke="#3E8E4A" stroke-width="3"/><ellipse cx="132" cy="126" rx="9" ry="5" fill="#5DBB6B" transform="rotate(-25 132 126)"/><ellipse cx="148" cy="122" rx="9" ry="5" fill="#5DBB6B" transform="rotate(25 148 122)"/></g>' +
        '<g class="sway"><path d="M250 148 v-16" stroke="#3E8E4A" stroke-width="3"/><ellipse cx="243" cy="133" rx="7" ry="4" fill="#5DBB6B" transform="rotate(-25 243 133)"/><ellipse cx="257" cy="130" rx="7" ry="4" fill="#5DBB6B" transform="rotate(25 257 130)"/></g>' +
        /* umbrella */
        '<g class="wobble"><g transform="translate(36 70)"><path d="M0 34 Q30 -6 60 34 q-7.5 -6 -15 0 q-7.5 -6 -15 0 q-7.5 -6 -15 0 q-7.5 -6 -15 0z" fill="#FF8FB8"/>' +
        '<path d="M15 34 q15 -36 15 -40 q0 4 15 40" fill="#FFC1D6"/><path d="M30 -6 v58 q0 6 -6 6" stroke="#7A5A48" stroke-width="3" fill="none" stroke-linecap="round"/></g></g>'
    },

    /* 11 · Masuk rumah — evening, the porch light is on */
    enter_home: {
      pose: "baby-mo-yes",
      svg: '<defs><linearGradient id="dsSkyE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9F7A"/><stop offset=".6" stop-color="#FFC9A0"/><stop offset="1" stop-color="#FFE6CC"/></linearGradient>' +
        '<radialGradient id="dsLamp"><stop offset="0" stop-color="#FFF3B0" stop-opacity=".95"/><stop offset="1" stop-color="#FFF3B0" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="400" height="180" fill="url(#dsSkyE)"/><circle cx="250" cy="96" r="26" fill="#FFD86B" opacity=".9"/>' +
        cloud(310, 30, .6, "#FFE3D4") + cloud(200, 22, .5, "#FFE3D4", "drift d2") +
        '<path d="M0 122 Q90 100 190 116 Q300 98 400 118 V180 H0Z" fill="#9CCB86"/><rect y="144" width="400" height="36" fill="#86BD72"/>' +
        /* house front */
        '<rect x="18" y="52" width="170" height="96" rx="4" fill="#FFF3DE"/><path d="M6 58 L103 10 L200 58Z" fill="#C9564A"/><path d="M18 58 L103 18 L188 58" stroke="#FFF7E8" stroke-width="5" fill="none" stroke-linejoin="round"/>' +
        '<rect x="30" y="72" width="34" height="30" rx="4" fill="#FFE29A" stroke="#fff" stroke-width="4"/><path d="M47 72v30M30 87h34" stroke="#fff" stroke-width="3"/>' +
        '<rect x="142" y="72" width="34" height="30" rx="4" fill="#FFE29A" stroke="#fff" stroke-width="4"/><path d="M159 72v30M142 87h34" stroke="#fff" stroke-width="3"/>' +
        '<rect x="84" y="80" width="40" height="68" rx="5" fill="#8A5634"/><rect x="88" y="84" width="32" height="28" rx="4" fill="#9E6640"/><rect x="88" y="116" width="32" height="28" rx="4" fill="#9E6640"/><circle cx="114" cy="116" r="3" fill="#FFD25A"/>' +
        '<circle class="glow" cx="134" cy="76" r="22" fill="url(#dsLamp)"/><rect x="130" y="66" width="8" height="12" rx="3" fill="#FFE07A" stroke="#7A5232" stroke-width="2"/>' +
        /* welcome mat */
        '<rect x="74" y="148" width="60" height="10" rx="4" fill="#E3B47E"/><path d="M80 153 h48" stroke="#C98A5B" stroke-width="2" stroke-dasharray="4 3"/>' +
        '<g class="float2"><text x="103" y="46" text-anchor="middle" font-size="16">👋</text></g>' +
        '<circle cx="200" cy="140" r="10" fill="#5DBB6B"/><circle cx="196" cy="134" r="2.6" fill="#FF8FB8"/>'
    },

    /* 12 · Doa untuk orang tua — a warm family evening at home */
    parents: {
      pose: "baby-mo-pose-05",
      svg: '<defs><radialGradient id="dsWarm"><stop offset="0" stop-color="#FFF1C9"/><stop offset="1" stop-color="#F3E3FF"/></radialGradient>' +
        '<linearGradient id="dsNightP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B3470"/><stop offset="1" stop-color="#5B5AA8"/></linearGradient></defs>' +
        '<rect width="400" height="180" fill="url(#dsWarm)"/>' +
        '<rect x="34" y="20" width="96" height="70" rx="10" fill="url(#dsNightP)" stroke="#fff" stroke-width="7"/><path d="M82 20v70M34 55h96" stroke="#fff" stroke-width="4"/>' +
        '<circle cx="108" cy="38" r="9" fill="#FFE29A"/><circle cx="113" cy="35" r="8" fill="#2E3A78"/>' + star(52, 34, 3, "twinkle", "#fff") + star(64, 72, 2.4, "twinkle t2", "#fff") +
        /* family photo frame: three hearts, big-big-small */
        '<g class="swing"><rect x="168" y="22" width="78" height="56" rx="6" fill="#C98A5B"/><rect x="174" y="28" width="66" height="44" rx="4" fill="#FFF6E8"/>' +
        '<path d="M190 52 c-4 -6 -12 -3 -11 3 c1 4 11 11 11 11 s10 -7 11 -11 c1 -6 -7 -9 -11 -3z" fill="#5A80E8"/>' +
        '<path d="M222 52 c-4 -6 -12 -3 -11 3 c1 4 11 11 11 11 s10 -7 11 -11 c1 -6 -7 -9 -11 -3z" fill="#E86FA0"/>' +
        '<path d="M206 62 c-2.6 -4 -8 -2 -7 2 c.6 2.6 7 7 7 7 s6.4 -4.4 7 -7 c1 -4 -4.4 -6 -7 -2z" fill="#3FB67A"/></g>' +
        /* sofa and lamp */
        floor("#E8D2B8", "#D9BE9E") +
        '<rect x="20" y="104" width="190" height="44" rx="16" fill="#8C7AE6"/><rect x="28" y="92" width="174" height="30" rx="14" fill="#A594F0"/>' +
        '<rect x="44" y="98" width="40" height="22" rx="10" fill="#FFD6E4"/><rect x="146" y="98" width="40" height="22" rx="10" fill="#FFE8A3"/>' +
        '<rect x="14" y="114" width="22" height="36" rx="10" fill="#7C6AD6"/><rect x="194" y="114" width="22" height="36" rx="10" fill="#7C6AD6"/>' +
        '<circle class="glow" cx="246" cy="98" r="26" fill="#FFF3B0" opacity=".55"/><path d="M234 86 h24 l-5 -20 h-14z" fill="#FFD25A"/><rect x="244" y="86" width="4" height="56" fill="#B09080"/><rect x="236" y="140" width="20" height="6" rx="3" fill="#B09080"/>' +
        '<g class="beat"><path d="M116 76 c-5 -7 -15 -3 -13 4 c1 5 13 13 13 13 s12 -8 13 -13 c2 -7 -8 -11 -13 -4z" fill="#FF7A9A"/></g>' +
        sparkle(148, 44, .6, "twinkle t3", "#FFC94A")
    },

    /* 13 · Dzikir sore — the sun sinking behind the hills, birds flying home, the first star */
    evening_dhikr: {
      pose: "baby-mo-pose-42",
      svg: '<defs><linearGradient id="dsSkyS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A5FC8"/><stop offset=".45" stop-color="#E98AA6"/><stop offset=".8" stop-color="#FFB27A"/><stop offset="1" stop-color="#FFD8A0"/></linearGradient>' +
        '<radialGradient id="dsSunS"><stop offset="0" stop-color="#FFF4C2"/><stop offset=".6" stop-color="#FFC94A"/><stop offset="1" stop-color="#FF8A3D"/></radialGradient>' +
        '<radialGradient id="dsHaloS"><stop offset="0" stop-color="#FFE29A" stop-opacity=".85"/><stop offset="1" stop-color="#FFE29A" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="400" height="180" fill="url(#dsSkyS)"/>' +
        /* the sun going down behind the far hills */
        '<circle class="glow" cx="150" cy="112" r="62" fill="url(#dsHaloS)"/>' +
        '<g class="sink"><circle cx="150" cy="112" r="28" fill="url(#dsSunS)"/></g>' +
        star(300, 26, 5, "twinkle", "#FFF3B0") + star(250, 14, 2.6, "twinkle t2", "#fff") + star(352, 46, 2.2, "twinkle t3", "#fff") + star(60, 20, 2.4, "twinkle t4", "#fff") +
        cloud(60, 58, .55, "#FFC7C2", "drift slow") + cloud(250, 50, .45, "#F7B3C6", "drift d2") +
        /* birds flying home */
        '<g class="bird"><g transform="translate(200 46)"><path class="flap" d="M-7 0q3.5-5 7 0q3.5-5 7 0" fill="none" stroke="#5A3A6A" stroke-width="2" stroke-linecap="round"/></g></g>' +
        '<g class="bird" style="animation-delay:-3s"><g transform="translate(180 62)"><path class="flap" d="M-5 0q2.5-4 5 0q2.5-4 5 0" fill="none" stroke="#5A3A6A" stroke-width="1.8" stroke-linecap="round"/></g></g>' +
        /* hills (they hide the lower half of the sun), a little mosque far away */
        '<path d="M0 118 Q70 98 150 112 Q230 96 300 110 Q350 100 400 108 V180 H0Z" fill="#B0609A"/>' +
        '<g fill="#7E3F7E"><rect x="44" y="92" width="34" height="20" rx="2"/><path d="M47 92a14 14 0 0 1 28 0z"/><rect x="82" y="78" width="6" height="34" rx="2"/><path d="M80 78l5-9 5 9z"/><rect x="58" y="100" width="7" height="12" rx="3.5" fill="#FFD27A"/></g>' +
        '<path d="M0 138 Q110 120 220 134 Q320 122 400 132 V180 H0Z" fill="#7E4C8C"/>' +
        '<rect y="152" width="400" height="28" fill="#5E3A78"/><rect y="152" width="400" height="3" fill="#6E4688"/>' +
        /* a small house with warm windows on the near hill */
        '<rect x="196" y="116" width="54" height="36" rx="3" fill="#4A2D63"/><path d="M190 118 L223 96 L256 118Z" fill="#3E2556"/>' +
        '<rect class="glow" x="204" y="126" width="12" height="11" rx="2" fill="#FFD27A"/><rect class="glow" x="230" y="126" width="12" height="11" rx="2" fill="#FFD27A"/>' +
        sparkle(120, 40, .7, "twinkle t2", "#FFF3B0") + sparkle(330, 84, .55, "twinkle", "#FFE29A")
    },

    /* 14 · Tasbih sebelum tidur — a cosy night room, a loop of prayer beads lighting up one by one */
    bedtime_tasbih: {
      pose: "baby-mo-pose-12",
      svg: '<defs><linearGradient id="dsNightT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2A5A"/><stop offset="1" stop-color="#3C4285"/></linearGradient>' +
        '<clipPath id="dsWinT"><rect x="26" y="18" width="96" height="74" rx="12"/></clipPath>' +
        '<radialGradient id="dsBeadGlow"><stop offset="0" stop-color="#FFE29A" stop-opacity=".55"/><stop offset="1" stop-color="#FFE29A" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="400" height="180" fill="#2E3270"/><circle cx="330" cy="30" r="110" fill="#3A3F86" opacity=".6"/>' +
        '<g clip-path="url(#dsWinT)"><rect x="26" y="18" width="96" height="74" fill="url(#dsNightT)"/>' +
        '<circle class="glow" cx="92" cy="46" r="22" fill="#FFF3C4" opacity=".22"/><circle cx="92" cy="46" r="14" fill="#FFE29A"/><circle cx="99" cy="41" r="12.5" fill="#1E2A5A"/>' +
        star(46, 34, 3.6, "twinkle", "#fff") + star(60, 70, 2.6, "twinkle t2", "#FFE29A") + star(110, 78, 2.6, "twinkle t3", "#fff") + '</g>' +
        '<rect x="26" y="18" width="96" height="74" rx="12" fill="none" stroke="#5A64A8" stroke-width="6"/><path d="M74 18v74M26 55h96" stroke="#5A64A8" stroke-width="3.5"/>' +
        star(160, 22, 3, "twinkle t4", "#FFE29A") + star(196, 46, 2.2, "twinkle", "#fff") + star(140, 64, 2, "twinkle t3", "#fff") +
        floor("#3F4488", "#353A78") +
        /* bed with a soft blanket */
        '<rect x="0" y="112" width="132" height="42" rx="12" fill="#6C7AE0"/><rect x="0" y="104" width="132" height="16" rx="8" fill="#8E9BF0"/>' +
        '<rect x="10" y="96" width="44" height="18" rx="9" fill="#E8EBFF"/><path d="M58 118c22-5 46-5 74 0v36H58z" fill="#A78BFA"/>' +
        /* the prayer-bead loop on a little round rug, one bead lighting up after another */
        '<ellipse cx="206" cy="150" rx="58" ry="10" fill="#5A4FB0"/><ellipse cx="206" cy="149" rx="46" ry="7" fill="#6E62C8"/>' +
        '<circle class="glow" cx="206" cy="106" r="44" fill="url(#dsBeadGlow)"/>' +
        (function () {
          var h = '<circle cx="206" cy="104" r="30" fill="none" stroke="#C7B6FF" stroke-width="1.6" opacity=".7"/>';
          for (var i = 1; i < 16; i++) {
            var a = Math.PI / 2 + i * Math.PI * 2 / 16, x = (206 + 30 * Math.cos(a)).toFixed(1), y = (104 + 30 * Math.sin(a)).toFixed(1);
            h += '<circle cx="' + x + '" cy="' + y + '" r="5.2" fill="#B9A4FF"/><circle class="bead" style="animation-delay:' + (i * .25).toFixed(2) + 's" cx="' + x + '" cy="' + y + '" r="5.2" fill="#FFD25A"/>';
          }
          return h + '<circle cx="206" cy="138" r="6.4" fill="#FFD25A"/><path d="M206 143l-6 9h12z" fill="#FFB400"/>';
        })() +
        '<g class="float2"><text x="206" y="110" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="16" fill="#FFF3C4">33</text></g>' +
        sparkle(256, 70, .7, "twinkle", "#FFE29A") + sparkle(160, 92, .5, "twinkle t2", "#fff")
    }

  };

  function ensureCss() {
    if (document.getElementById("doa-scenes-css")) return;
    var st = document.createElement("style"); st.id = "doa-scenes-css"; st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* A still picture of a du'a's scene (sky + Baby Mo) for cards on the home screen.
     No motion (calm for small children); gradient ids get a per-card suffix so
     several scenes can share the page with the big one on the learn screen. */
  window.doaSceneArt = function (id, sfx) {
    var s = SCENES[id]; if (!s) return "";
    var k = "_" + (sfx || "c") + "_" + id;
    var svg = s.svg.replace(/(id="|url\(#)(ds[A-Za-z0-9]+)/g, "$1$2" + k);
    var night = id === "sleep" || id === "parents" || id === "bedtime_tasbih";
    return '<span class="dsa' + (night ? " night" : "") + '"><svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + svg +
      '</svg><img src="baby-mo-poses/' + s.pose + '.webp" alt="" loading="lazy" decoding="async"></span>';
  };

  /* Render the scene for a du'a id into the header card. */
  window.renderDoaScene = function (id) {
    var s = SCENES[id]; var card = document.getElementById("sceneCard"); if (!s || !card) return false;
    ensureCss();
    card.classList.add("has-scene", "ds");
    card.classList.toggle("night", id === "sleep" || id === "parents" || id === "bedtime_tasbih");
    var bg = document.getElementById("sceneBg");
    bg.innerHTML = '<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + s.svg + "</svg>";
    var mo = document.getElementById("sceneMo");
    if (mo) {
      mo.src = "baby-mo-poses/" + s.pose + ".webp";
      var wrap = mo.parentElement; wrap.style.animation = "none"; void wrap.offsetWidth; wrap.style.animation = "";
    }
    return true;
  };
})();
