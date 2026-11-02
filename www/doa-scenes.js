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

    /* 4 · Sebelum makan — warm table, steam rising */
    eating: {
      pose: "baby-mo-pose-05",
      svg: '<defs><pattern id="dsCloth" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#FFF"/><rect width="10" height="10" fill="#FFB3B3"/><rect x="10" y="10" width="10" height="10" fill="#FFB3B3"/></pattern>' +
        '<clipPath id="dsWin2"><rect x="150" y="16" width="96" height="62" rx="10"/></clipPath></defs>' +
        '<rect width="400" height="180" fill="#FFF4D8"/><circle cx="60" cy="20" r="90" fill="#FFE9B3" opacity=".7"/>' +
        '<g clip-path="url(#dsWin2)"><rect x="150" y="16" width="96" height="62" fill="#BFE6FF"/><circle class="glow" cx="222" cy="36" r="13" fill="#FFD25A"/>' + cloud(180, 52, .55) + '</g>' +
        '<rect x="150" y="16" width="96" height="62" rx="10" fill="none" stroke="#fff" stroke-width="6"/><path d="M198 16v62" stroke="#fff" stroke-width="4"/>' +
        '<path d="M0 118h290v14H0z" fill="url(#dsCloth)"/><rect x="0" y="130" width="290" height="50" fill="#D69A64"/><rect x="0" y="128" width="290" height="6" fill="#B97D4A"/>' +
        '<ellipse cx="74" cy="114" rx="40" ry="9" fill="#fff"/><ellipse cx="74" cy="110" rx="34" ry="7" fill="#F3F6FA"/>' +
        '<path d="M52 110c0-14 10-22 22-22s22 8 22 22z" fill="#fff" stroke="#E5ECF3"/><circle cx="64" cy="98" r="2" fill="#E5ECF3"/><circle cx="80" cy="96" r="2" fill="#E5ECF3"/>' +
        '<ellipse cx="90" cy="106" rx="10" ry="6" fill="#FFF"/><circle cx="90" cy="105" r="4" fill="#FFC94A"/>' +
        '<path class="steam" d="M62 82c-5-6 5-10 0-16" stroke="#C9D6E3" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path class="steam s2" d="M76 80c-5-6 5-10 0-16" stroke="#C9D6E3" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path class="steam s3" d="M88 84c-5-6 5-10 0-16" stroke="#C9D6E3" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path d="M134 100h48l-4 16a8 8 0 0 1-8 6h-24a8 8 0 0 1-8-6z" fill="#7DD3FC"/><ellipse cx="158" cy="100" rx="24" ry="5" fill="#F59E0B"/>' +
        '<path class="steam" d="M150 92c-5-6 5-10 0-16" stroke="#C9D6E3" stroke-width="3" fill="none" stroke-linecap="round"/><path class="steam s2" d="M164 90c-5-6 5-10 0-16" stroke="#C9D6E3" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<rect x="196" y="88" width="20" height="30" rx="4" fill="#E0F4FF" stroke="#9ED8F5" stroke-width="2"/><rect x="198" y="100" width="16" height="16" rx="2" fill="#7DD3FC" opacity=".7"/>' +
        '<g class="float2"><circle cx="240" cy="108" r="10" fill="#FF6B6B"/><path d="M240 98q2-6 7-6" stroke="#5A8F3C" stroke-width="2.4" fill="none"/></g>' +
        '<rect x="22" y="112" width="4" height="22" rx="2" fill="#A9B8C8" transform="rotate(-12 24 122)"/><rect x="122" y="112" width="4" height="22" rx="2" fill="#A9B8C8" transform="rotate(12 124 122)"/>'
    },

    /* 5 · Doa belajar — desk, flipping page, floating letters */
    study: {
      pose: "baby-mo-idea",
      svg: '<defs><radialGradient id="dsLamp" cx=".5" cy="0"><stop offset="0" stop-color="#FFF4C2" stop-opacity=".95"/><stop offset="1" stop-color="#FFF4C2" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="400" height="180" fill="#EEE8FF"/><circle cx="340" cy="30" r="110" fill="#E3DAFF" opacity=".7"/>' +
        '<rect x="18" y="20" width="110" height="8" rx="3" fill="#B993E8"/><rect x="18" y="62" width="110" height="8" rx="3" fill="#B993E8"/>' +
        '<rect x="24" y="30" width="12" height="32" rx="2" fill="#FF8FAE"/><rect x="38" y="34" width="10" height="28" rx="2" fill="#7DD3FC"/><rect x="50" y="28" width="13" height="34" rx="2" fill="#FFC94A"/>' +
        '<rect x="66" y="36" width="10" height="26" rx="2" fill="#86E0A9"/><rect x="80" y="30" width="12" height="32" rx="2" fill="#A78BFA"/><rect x="96" y="40" width="22" height="22" rx="4" fill="#FFB98A" transform="rotate(-8 107 51)"/>' +
        '<path d="M150 40l-10 22h46l-10-22z" fill="#7C5CE0"/><rect x="161" y="62" width="4" height="54" fill="#5B42B8"/><ellipse cx="163" cy="118" rx="18" ry="5" fill="#5B42B8"/>' +
        '<path class="glow" d="M140 62h46l40 60H100z" fill="url(#dsLamp)"/>' +
        '<rect x="0" y="122" width="300" height="10" rx="3" fill="#B98552"/><rect x="0" y="132" width="300" height="48" fill="#D9A56E"/>' +
        '<path d="M60 120l40-6 40 6v-30l-40-6-40 6z" fill="#fff" stroke="#D7CCF5" stroke-width="2"/><path d="M100 114V84" stroke="#D7CCF5" stroke-width="2"/>' +
        '<path d="M68 96h24M68 102h20M108 96h24M108 102h18" stroke="#C7BCEB" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path class="page" d="M100 84l38 6v30l-38-6z" fill="#FAF7FF" stroke="#D7CCF5" stroke-width="2"/>' +
        '<g transform="rotate(-14 176 116)"><rect x="150" y="113" width="44" height="6" rx="2" fill="#FFC94A"/><path d="M194 113l8 3-8 3z" fill="#F4D3A8"/><rect x="146" y="113" width="6" height="6" rx="1.5" fill="#FF8FAE"/></g>' +
        '<text class="letter" x="204" y="92" font-family="Amiri Quran, Amiri, serif" font-size="22" fill="#7C5CE0">ا</text>' +
        '<text class="letter l2" x="226" y="84" font-family="Amiri Quran, Amiri, serif" font-size="22" fill="#E8590C">ب</text>' +
        '<text class="letter l3" x="248" y="96" font-family="Amiri Quran, Amiri, serif" font-size="22" fill="#0A9488">ت</text>' +
        sparkle(230, 40, .8, "twinkle", "#FFC94A") + sparkle(262, 70, .6, "twinkle t2", "#A78BFA") + sparkle(214, 20, .5, "twinkle t3", "#FF8FAE")
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
    }
  };

  function ensureCss() {
    if (document.getElementById("doa-scenes-css")) return;
    var st = document.createElement("style"); st.id = "doa-scenes-css"; st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* Render the scene for a du'a id into the header card. */
  window.renderDoaScene = function (id) {
    var s = SCENES[id]; var card = document.getElementById("sceneCard"); if (!s || !card) return false;
    ensureCss();
    card.classList.add("has-scene", "ds");
    card.classList.toggle("night", id === "sleep");
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
