/* Baby Mo — seasonal look for the game hub (index.html).
   Ramadan (1–30 Ramadan): a deep-violet evening sky with a big crescent,
   a string of swaying lanterns, gold accents, a "Ramadan day N" card with a
   30-night lantern row and the days left until Eid, and Mo greets with
   "Marhaban ya Ramadan". Eid al-Fitr (1–3 Shawwal): ketupat garland, bright
   sparkles, an Eid card with the Eid greeting. From 25 Sha'ban a small
   "Ramadan is coming" countdown card appears (no theme yet).
   Dates come from the Umm al-Qura calendar on the device (Intl), so the day
   can differ by one from the local announcement.
   Preview: index.html?season=ramadan&rday=12 | ?season=eid | ?season=pre&rday=3
   | ?season=auto (clears the preview). The <head> snippet sets the class
   html.season-ramadan / html.season-eid before first paint; this file adds
   the decorations. Respects prefers-reduced-motion and the dark theme. */
(function () {
  "use strict";
  var S = window.BM_SEASON || { name: "" };
  if (!S.name) return;
  var doc = document, root = doc.documentElement;
  function lang() { try { return localStorage.getItem("bm_lang") === "en" ? "en" : "id"; } catch (e) { return "id"; } }

  /* ── styles ── */
  var css = [
    /* sky: a violet Ramadan evening on every scene (light theme); dark theme keeps its night, warmer */
    "html.season-ramadan .tab-pane .pd-scene .s1{stop-color:#241B5E}html.season-ramadan .tab-pane .pd-scene .s2{stop-color:#5B3FA6}html.season-ramadan .tab-pane .pd-scene .s3{stop-color:#F4C6DE}",
    "html.season-ramadan .tab-pane .pd-scene .sun,html.season-ramadan .tab-pane .pd-scene .birds{display:none}",
    "html.season-ramadan .tab-pane .pd-scene .glow{display:block}html.season-ramadan .tab-pane .pd-scene .g1{stop-color:#FFD58A;stop-opacity:.45}html.season-ramadan .tab-pane .pd-scene .g2{stop-color:#FFD58A;stop-opacity:0}",
    "html.season-ramadan .tab-pane .pd-scene .moon{display:block;fill:#FFD86B;filter:drop-shadow(0 0 10px rgba(255,214,107,.85));transform:scale(1.35);transform-origin:156px 188px}",
    "html.season-ramadan .tab-pane .pd-scene .stars-n{display:block;fill:#FFF3C4}",
    "html.season-ramadan .tab-pane .pd-scene .c1{stop-color:#B9A4E8}html.season-ramadan .tab-pane .pd-scene .c2{stop-color:#8E78CF}html.season-ramadan .tab-pane .pd-scene .cl{opacity:.75}",
    "html.season-ramadan .tab-pane .pd-scene .ha1{stop-color:#6F5BA8}html.season-ramadan .tab-pane .pd-scene .ha2{stop-color:#5A4A92}html.season-ramadan .tab-pane .pd-scene .far{fill:#5E4F96}",
    "html.season-ramadan .tab-pane .pd-scene .win{fill:#FFD86B}html.season-ramadan .tab-pane .pd-scene .door{opacity:1}",
    "html.season-ramadan[data-theme=dark] .tab-pane .pd-scene .s1{stop-color:#140F38}html.season-ramadan[data-theme=dark] .tab-pane .pd-scene .s2{stop-color:#2E2168}html.season-ramadan[data-theme=dark] .tab-pane .pd-scene .s3{stop-color:#3A2550}",
    /* decorations layer: behind the content, scrolls with it */
    ".tab-pane.has-scene>.ss-deco{position:absolute;z-index:0;left:0;right:0;top:calc(-62px - env(safe-area-inset-top));height:170px;pointer-events:none;overflow:visible}",
    ".ss-rope{position:absolute;left:0;top:0;width:100%;height:60px}",
    ".ss-hang{position:absolute;top:0;width:0;transform-origin:0 0;animation:ssSway var(--d,5s) ease-in-out var(--dl,0s) infinite alternate}",
    ".ss-hang i{position:absolute;left:-.6px;top:0;width:1.2px;height:var(--l);background:linear-gradient(#E9B04A,#C98A1E)}",
    ".ss-hang svg{position:absolute;left:calc(var(--w) / -2);top:var(--l);width:var(--w);height:auto;overflow:visible}",
    ".ss-glow{animation:ssGlow 2.6s ease-in-out var(--dl,0s) infinite alternate}",
    "@keyframes ssSway{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}",
    "@keyframes ssGlow{from{opacity:.55}to{opacity:1}}",
    ".ss-spark{position:absolute;width:var(--s);height:var(--s);color:#FFE7A0;animation:ssTw 2.4s ease-in-out var(--dl,0s) infinite}",
    ".ss-spark svg{width:100%;height:100%;display:block;fill:currentColor;filter:drop-shadow(0 0 4px rgba(255,220,120,.9))}",
    "@keyframes ssTw{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}",
    /* gold accents */
    "html.season-ramadan .tab.active{color:#6B3F00;background:linear-gradient(180deg,#FFF1C4,#FFD976)}",
    "html.season-ramadan[data-theme=dark] .tab.active{color:#FFD86B;background:linear-gradient(180deg,rgba(255,216,107,.22),rgba(255,216,107,.1))}",
    "html.season-ramadan #pane-home .hm-now{box-shadow:0 0 0 2px rgba(255,214,107,.85),0 16px 30px -16px rgba(60,30,120,.7)}",
    "html.season-ramadan .mo-bub{box-shadow:0 0 0 2px rgba(255,214,107,.7),0 14px 28px -18px rgba(40,20,90,.7)}",
    /* the season card */
    ".ss-card{position:relative;display:flex;align-items:center;gap:12px;margin:0 0 14px;padding:14px 14px 12px;border-radius:26px;text-decoration:none;color:#FFF6DC;overflow:hidden;",
    "background:radial-gradient(90% 120% at 100% 0%,rgba(255,200,90,.35),transparent 55%),linear-gradient(140deg,#2B1F6B 0%,#3D2A86 55%,#5A2F7E 100%);",
    "box-shadow:inset 0 0 0 1.5px rgba(255,214,107,.75),0 16px 30px -16px rgba(40,20,100,.8);-webkit-tap-highlight-color:transparent;transition:transform .15s}",
    ".ss-card:active{transform:scale(.98)}",
    ".ss-card .ss-ic{flex:0 0 auto;width:52px;height:76px;display:grid;place-items:center}.ss-card .ss-ic svg{width:46px;height:auto;overflow:visible}",
    ".ss-card .ss-tx{flex:1;min-width:0}",
    ".ss-k{font:800 11px/1.1 'Nunito',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#FFD86B}",
    ".ss-t{font:700 clamp(21px,6vw,26px)/1.1 'Fredoka','Nunito',sans-serif;margin-top:3px;color:#FFF6DC}",
    ".ss-s{font:700 13px/1.3 'Nunito',sans-serif;color:#E6DAFF;margin-top:3px}",
    ".ss-ar{font-family:var(--font-ar,'Amiri',serif);font-size:19px;line-height:1.5;color:#FFE7A0;direction:rtl;margin-top:2px}",
    ".ss-row{display:grid;grid-template-columns:repeat(var(--n,30),1fr);gap:2px;margin-top:8px;max-width:330px}",
    ".ss-row b{height:clamp(10px,2.8vw,14px);border-radius:3px 3px 5px 5px;background:rgba(255,255,255,.18)}",
    ".ss-row b.on{background:linear-gradient(#FFE7A0,#F5B83D);box-shadow:0 0 5px rgba(255,200,80,.7)}",
    ".ss-row b.now{background:linear-gradient(#FFFFFF,#FFD86B);box-shadow:0 0 0 1.5px #fff,0 0 10px 2px rgba(255,220,120,.95);animation:ssGlow 1.2s ease-in-out infinite alternate}",
    ".ss-go{flex:0 0 auto;align-self:center;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(180deg,#FFE08A,#F5A623);color:#5A3300;box-shadow:0 6px 12px -6px rgba(0,0,0,.6)}",
    ".ss-go svg{width:18px;height:18px}",
    /* Eid: festive, bright */
    ".ss-card.eid{color:#13361F;background:radial-gradient(90% 120% at 100% 0%,rgba(255,224,120,.75),transparent 55%),linear-gradient(140deg,#E9FBE8 0%,#D2F4D6 55%,#FFF2C2 100%);box-shadow:inset 0 0 0 1.5px rgba(46,158,79,.55),0 16px 30px -18px rgba(20,90,40,.7)}",
    ".ss-card.eid .ss-k{color:#1E7A3E}.ss-card.eid .ss-t{color:#14532D}.ss-card.eid .ss-s{color:#335E43}.ss-card.eid .ss-ar{color:#1E7A3E}",
    "html[data-theme=dark] .ss-card.eid{color:#E8FFF0;background:radial-gradient(90% 120% at 100% 0%,rgba(255,214,107,.3),transparent 55%),linear-gradient(140deg,#123B26 0%,#17402D 55%,#3A3415 100%);box-shadow:inset 0 0 0 1.5px rgba(110,231,160,.45)}",
    "html[data-theme=dark] .ss-card.eid .ss-k{color:#86EFAC}html[data-theme=dark] .ss-card.eid .ss-t{color:#F0FFF4}html[data-theme=dark] .ss-card.eid .ss-s{color:#B7E4C7}html[data-theme=dark] .ss-card.eid .ss-ar{color:#FDE68A}",
    ".ss-card.pre{padding:12px 14px}.ss-card.pre .ss-ic{height:58px}",
    "html.season-eid .ss-spark{color:#FFC93D}",
    "@media (prefers-reduced-motion:reduce){.ss-hang,.ss-glow,.ss-spark,.ss-row b.now{animation:none!important}}"
  ].join("\n");
  var st = doc.createElement("style"); st.id = "bm-season-css"; st.textContent = css; doc.head.appendChild(st);

  /* ── art ── */
  var GLASS = [["#FF8A5B", "#FFE2C2"], ["#F0609E", "#FFD3E6"], ["#2FC2AE", "#C8FFF4"], ["#FFB21E", "#FFF1B8"], ["#8B6CF6", "#E5DCFF"]];
  var uid = 0;
  function lantern(k) {
    var g = GLASS[k % GLASS.length], id = "ssL" + (++uid);
    return '<svg viewBox="0 0 40 78" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="50%" cy="48%" r="60%"><stop offset="0" stop-color="#FFFBE6"/><stop offset=".45" stop-color="' + g[1] + '"/><stop offset="1" stop-color="' + g[0] + '"/></radialGradient></defs>' +
      '<circle cx="20" cy="3.5" r="3" fill="none" stroke="#E2A93A" stroke-width="1.8"/>' +
      '<path d="M15 7h10l3 6H12z" fill="#F2B33D"/><path d="M9 20c1-6 6-8 11-8s10 2 11 8z" fill="#E9A52F"/>' +
      '<rect x="7.5" y="19" width="25" height="4.5" rx="2.2" fill="#C98A1E"/>' +
      '<ellipse class="ss-glow" cx="20" cy="39" rx="17" ry="20" fill="' + g[0] + '" opacity=".35" style="filter:blur(5px)"/>' +
      '<path d="M9.5 23.5h21l-3 31h-15z" fill="url(#' + id + ')"/>' +
      '<path d="M15 23.5l1.4 31M25 23.5l-1.4 31M20 23.5v31M9.8 32h20.4M10.8 45h18.4" stroke="#C98A1E" stroke-width="1.5" fill="none"/>' +
      '<path d="M9.5 23.5h21l-3 31h-15z" fill="none" stroke="#B87A12" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<rect x="11" y="54" width="18" height="4.5" rx="2.2" fill="#C98A1E"/><path d="M14 58.5h12L20 68z" fill="#F2B33D"/><circle cx="20" cy="71" r="2.4" fill="#E9A52F"/></svg>';
  }
  function crescent() {
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M24 4a16 16 0 1 0 12 26A13 13 0 0 1 24 4z" fill="#FFD86B" stroke="#C98A1E" stroke-width="1.4"/><path d="M31 9l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.7 1.4.5-3-2.2-2.1 3-.4z" fill="#FFE7A0"/></svg>';
  }
  function ketupat(k) {
    var rib = ["#F2C94C", "#FF8A5B", "#F0609E"][k % 3];
    return '<svg viewBox="0 0 40 74" aria-hidden="true">' +
      '<path d="M20 34c-3 10-8 18-11 30M20 34c3 10 8 18 11 30" stroke="' + rib + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M20 2L37 18 20 34 3 18z" fill="#8CC63F" stroke="#2E7D32" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M11.5 10L28.5 26M7.3 14L24.3 30M15.7 6L32.7 22M28.5 10L11.5 26M32.7 14L15.7 30M24.3 6L7.3 22" stroke="#3E8E2E" stroke-width="1.3" opacity=".75"/>' +
      '<path d="M20 2L37 18 20 34 3 18z" fill="none" stroke="#2E7D32" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  }
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 1.5l2.2 7.3 7.3 2.2-7.3 2.2L12 20.5l-2.2-7.3L2.5 11l7.3-2.2z"/></svg>';

  /* ── decorations on each scene pane ── */
  function deco(pane) {
    if (pane.querySelector(":scope > .ss-deco")) return;
    var d = doc.createElement("div"); d.className = "ss-deco"; d.setAttribute("aria-hidden", "true");
    var eid = S.name === "eid";
    // rope: sags between the two edges
    var html = '<svg class="ss-rope" viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M-2 4 Q50 48 102 4" stroke="' + (eid ? "#2E9E4F" : "#E2A93A") + '" stroke-width="1.6" fill="none" vector-effect="non-scaling-stroke"/></svg>';
    var xs = [0.29, 0.40, 0.51, 0.62, 0.73], ls = [10, 4, 14, 4, 10], ws = [22, 25, 22, 25, 22];
    xs.forEach(function (x, k) {
      var ropeY = 4 + 22 * (1 - Math.pow(2 * x - 1, 2));   // y on the sag (rope box is 60px tall: 4px at the edges, 26px in the middle)
      html += '<div class="ss-hang" style="left:' + (x * 100) + '%;top:' + ropeY.toFixed(1) + 'px;--l:' + ls[k] + 'px;--w:' + ws[k] + 'px;--d:' + (4 + k * 0.7).toFixed(1) + 's;--dl:' + (-k * 1.1).toFixed(1) + 's"><i></i>' +
        (eid ? ketupat(k) : (k === 2 ? crescent() : lantern(k))) + "</div>";
    });
    // a few twinkles in the sky
    [[0.20, 52, 10], [0.46, 98, 8], [0.82, 50, 11], [0.95, 118, 9], [0.05, 120, 8]].forEach(function (p, k) {
      html += '<span class="ss-spark" style="left:' + (p[0] * 100) + '%;top:' + p[1] + 'px;--s:' + p[2] + 'px;--dl:' + (-k * 0.6) + 's">' + STAR + "</span>";
    });
    d.innerHTML = html;
    var sc = pane.querySelector(":scope > .pd-scene");
    if (sc && sc.nextSibling) pane.insertBefore(d, sc.nextSibling); else pane.insertBefore(d, pane.firstChild);
  }
  function decorate() {
    if (S.name === "pre") return;
    doc.querySelectorAll(".tab-pane.has-scene").forEach(deco);
  }

  /* ── the card on the Play tab ── */
  var T = {
    rk: { id: "Ramadan {y} H", en: "Ramadan {y} AH" },
    rt: { id: "Ramadan hari ke-{d}", en: "Ramadan day {d}" },
    rs: { id: "{n} hari lagi menuju Idul Fitri 🎉", en: "{n} days until Eid 🎉" },
    rs1: { id: "Besok Idul Fitri, insya Allah! 🎉", en: "Eid is tomorrow, insha Allah! 🎉" },
    rs0: { id: "Malam terakhir Ramadan 🌙", en: "The last night of Ramadan 🌙" },
    ek: { id: "{d} Syawal {y} H", en: "{d} Shawwal {y} AH" },
    et: { id: "Selamat Idul Fitri!", en: "Eid Mubarak!" },
    es: { id: "Semoga Allah menerima amal kita semua", en: "May Allah accept from us and from you" },
    pk: { id: "Sebentar lagi", en: "Coming soon" },
    pt: { id: "{n} hari lagi Ramadan!", en: "Ramadan in {n} days!" },
    pt1: { id: "Besok Ramadan, insya Allah!", en: "Ramadan starts tomorrow, insha Allah!" },
    ps: { id: "Yuk siapkan doa-doa Ramadan bareng Mo", en: "Get ready with Mo's Ramadan du'as" },
    hello: { id: "Marhaban ya Ramadan! 🌙", en: "Marhaban ya Ramadan! 🌙" },
    sub: { id: "Ramadan hari ke-{d} — yuk belajar doa berbuka!", en: "Ramadan day {d} — let's learn the iftar du'a!" },
    ehello: { id: "Selamat Idul Fitri! 🎉", en: "Eid Mubarak! 🎉" },
    esub: { id: "Mohon maaf lahir dan batin 🤲", en: "Let's hug the family and say sorry 🤗" }
  };
  function t(k, v) { var s = T[k][lang()]; for (var x in v) s = s.split("{" + x + "}").join(v[x]); return s; }
  var GO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';

  function card() {
    var home = doc.getElementById("pane-home"), before = doc.getElementById("hmNow");
    if (!home || !before) return;
    var c = doc.getElementById("ssCard");
    if (!c) { c = doc.createElement("a"); c.id = "ssCard"; c.href = "./babymo-doa-harian.html?series=ramadan"; before.parentNode.insertBefore(c, before); }
    var html;
    if (S.name === "ramadan") {
      var row = "", total = S.len || 30;
      for (var i = 1; i <= total; i++) row += "<b" + (i < S.day ? ' class="on"' : i === S.day ? ' class="now"' : "") + "></b>";
      var left = S.left, sub = left <= 0 ? t("rs0") : left === 1 ? t("rs1") : t("rs", { n: left });
      c.className = "ss-card";
      html = '<span class="ss-ic">' + lantern(3) + '</span><span class="ss-tx"><span class="ss-k">' + t("rk", { y: S.year }) + '</span>' +
        '<span class="ss-t" style="display:block">' + t("rt", { d: S.day }) + '</span><span class="ss-s" style="display:block">' + sub + '</span>' +
        '<span class="ss-row" aria-hidden="true" style="--n:' + total + '">' + row + "</span></span>";
      c.setAttribute("aria-label", t("rt", { d: S.day }) + ". " + sub);
    } else if (S.name === "eid") {
      c.className = "ss-card eid";
      html = '<span class="ss-ic">' + ketupat(0) + '</span><span class="ss-tx"><span class="ss-k">' + t("ek", { d: S.day || 1, y: S.year }) + '</span>' +
        '<span class="ss-t" style="display:block">' + t("et") + '</span>' +
        '<span class="ss-ar" style="display:block" lang="ar">تَقَبَّلَ اللّٰهُ مِنَّا وَمِنْكُمْ</span>' +
        '<span class="ss-s" style="display:block">' + t("es") + "</span></span>";
      c.setAttribute("aria-label", t("et") + ". " + t("es"));
    } else {
      c.className = "ss-card pre";
      var n = S.left;
      html = '<span class="ss-ic">' + crescent() + '</span><span class="ss-tx"><span class="ss-k">' + t("pk") + '</span>' +
        '<span class="ss-t" style="display:block">' + (n <= 1 ? t("pt1") : t("pt", { n: n })) + '</span><span class="ss-s" style="display:block">' + t("ps") + "</span></span>";
      c.setAttribute("aria-label", (n <= 1 ? t("pt1") : t("pt", { n: n })) + ". " + t("ps"));
    }
    c.innerHTML = html + '<span class="ss-go" aria-hidden="true">' + GO + "</span>";
  }

  /* ── Mo's greeting ── */
  function greet() {
    if (S.name !== "ramadan" && S.name !== "eid") return;
    var h = doc.getElementById("moHello"), s = doc.getElementById("greetSub"), named = false;
    try { named = !!(localStorage.getItem("mo_child_name") || "").trim(); } catch (e) {}
    if (h && !named) h.textContent = S.name === "eid" ? t("ehello") : t("hello");
    if (s) s.textContent = S.name === "eid" ? t("esub") : t("sub", { d: S.day });
  }

  function all() { try { decorate(); card(); greet(); } catch (e) {} }
  // re-apply after the hub re-renders text on a language switch
  var wrap = function () {
    var f = window.applyLang;
    if (typeof f === "function" && !f.__ss) { var g = function () { var r = f.apply(this, arguments); try { card(); greet(); } catch (e) {} return r; }; g.__ss = 1; window.applyLang = g; }
  };
  function start() { wrap(); all(); setTimeout(all, 400); }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start); else start();
  // a scene can be cloned into a pane later (first visit to a tab)
  doc.addEventListener("click", function (e) { if (e.target.closest && e.target.closest(".tab")) setTimeout(decorate, 60); }, true);
  // the app may stay open past midnight / sunset into a new day
  doc.addEventListener("visibilitychange", function () { if (!doc.hidden && window.BM_SEASON_CALC) { var n = window.BM_SEASON_CALC(); if (n.name !== S.name || n.day !== S.day) location.reload(); } });
})();
