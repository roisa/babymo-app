/* Baby Mo — bilingual games (Indonesian source, English on request).
   The language comes from the hub (localStorage "bm_lang": "id" | "en"),
   or ?lang=en in the URL. Indonesian is what the games are written in, so
   in "id" this script does nothing.

   In "en" it swaps on-screen Indonesian for English using a per-game
   dictionary (i18n/<game>.js, loaded BEFORE this file) plus a shared one
   below. It translates text the games add later too (scores, popups,
   toasts) via a MutationObserver, the placeholder/aria-label/title
   attributes, the tab title, and Indonesian speech (text-to-speech).

   Dictionary files call:
     BM_I18N({ "Indonesian text": "English text", ... }, [
       [/^Selesai dalam (\d+) langkah$/, "Finished in $1 moves"],
       [/^Doa "(.+)" — (.+)$/, 'Du\'a "{1}" — {2}']   // {n} = translated group
     ]);
   Keys match whole text pieces; leading/trailing emoji, arrows and quotes
   are ignored when matching, so "🔄 Main Lagi!" also matches "Main Lagi!". */
(function () {
  "use strict";
  var DICT = Object.create(null), PATS = [], HTML = Object.create(null), HSEL = [];
  // Leading/trailing decoration (emoji, arrows, quotes, symbols) is ignored when matching
  var EDGE = { exec: function (t) {
    var a = /^[^\p{L}\p{N}]*/u.exec(t)[0], rest = t.slice(a.length);
    var z = /[^\p{L}\p{N}!?.…%)]*$/u.exec(rest)[0];
    return [t, a, rest.slice(0, rest.length - z.length), z];
  } };
  var normH = function (h) { return String(h).replace(/\s+/g, " ").replace(/'/g, '"').trim(); };
  var norm = function (t) { return String(t).replace(/\s+/g, " ").trim(); };
  function core(t) { var m = EDGE.exec(t); return m ? m[2] : t; }

  // html: { "full innerHTML": "English innerHTML" } for titles built from
  // several pieces (e.g. 'Apa salam<span class="accent">ku</span>?');
  // sel: CSS selectors of the elements to match that way.
  window.BM_I18N = function (dict, pats, html, sel) {
    if (html) for (var h in html) HTML[normH(h)] = html[h];
    if (sel) HSEL = HSEL.concat(sel);
    if (dict) for (var k in dict) {
      if (!dict[k]) continue;
      var n = norm(k); DICT[n] = dict[k];
      var c = norm(core(n)); if (c && !(c in DICT)) DICT[c] = core(norm(dict[k])) || dict[k];
    }
    if (pats) PATS = PATS.concat(pats);
  };

  var lang = "id";
  try {
    var q = (location.search.match(/[?&]lang=(id|en)\b/) || [])[1];
    if (q) localStorage.setItem("bm_lang", q);
    lang = localStorage.getItem("bm_lang") === "en" ? "en" : "id";
  } catch (e) {}
  window.BM_LANG = lang;
  try { document.documentElement.setAttribute("data-lang", lang); } catch (e) {}

  /* Shared strings used by many games */
  window.BM_I18N({
    "Kembali ke Game Hub": "Back to Game Hub", "Game Hub": "Game Hub", "Kembali": "Back", "Menu": "Menu", "Hub": "Hub",
    "Main Lagi": "Play Again", "Main Lagi!": "Play Again!", "Lagi!": "Again!", "Bagikan": "Share", "Bagikan Hasil!": "Share Result!",
    "Lanjut": "Next", "Selanjutnya": "Next", "Sebelumnya": "Previous", "Tutup": "Close", "Dengar": "Listen", "Ulang": "Replay",
    "Mulai": "Start", "Selesai": "Done", "Ayo mulai!": "Let's start!", "Ayo mulai! ▶": "Let's start! ▶", "Nanti": "Later", "Simpan": "Save",
    "Coba juga": "Try this too", "Cara main": "How to play", "Bintang": "Stars", "Skor": "Score", "Terbaik": "Best",
    "Masya Allah, kamu hebat!": "Masha Allah, you're amazing!", "Ketuk untuk menghitung": "Tap to count",
    "Tanpa Iklan": "No Ads", "Aman Anak": "Kid-Safe", "Offline OK": "Works Offline", "Gratis": "Free",
    "Doa Harian": "Daily Du'a", "Kata Islam": "Islamic Words", "Pulau Hijaiyah": "Hijaiyah Island", "Cari Baby Mo": "Find Baby Mo",
    "Sholat Bareng Mo": "Pray with Mo", "Kenalan Baby Mo": "Meet Baby Mo", "Kata Baik": "Kind Words",
    "Doa dari pagi sampai malam 🤲": "Du'as from morning to night 🤲", "Cocokkan doa dengan momennya 🃏": "Match each du'a to its moment 🃏",
    "Belajar gerakan sholat 🕌": "Learn the prayer movements 🕌", "Cari 28 huruf di pulau 🏝️": "Find 28 letters on the island 🏝️",
    "Ulangi doa sebelum tidur 🌙": "Repeat the bedtime du'a 🌙", "Balik kartu, ingat letaknya 🧠": "Flip cards, remember where they are 🧠",
    "Baby Mo sedang bersembunyi 🔍": "Baby Mo is hiding 🔍", "Latih daya ingatmu 🧠": "Train your memory 🧠",
    "Susun kata Arab pertamamu 🔤": "Build your first Arabic word 🔤", "Doa-doa harian si kecil 🤲": "Everyday du'as for little ones 🤲"
  });

  // Per-game dictionaries (queued before this file) win over the shared ones
  (window.__bmI18nQ || []).forEach(function (a) { window.BM_I18N(a[0], a[1], a[2], a[3]); });
  window.__bmI18nQ = { push: function (a) { window.BM_I18N(a[0], a[1], a[2], a[3]); } };

  if (lang !== "en") return;
  try { document.documentElement.lang = "en"; } catch (e) {}

  function sub(str, m) {
    return str.replace(/\{(\d)\}/g, function (_, i) { return t(m[+i] || ""); })
              .replace(/\$(\d)/g, function (_, i) { return m[+i] || ""; });
  }
  function t(text) {
    if (text == null) return text;
    var raw = String(text), n = norm(raw);
    if (!n) return raw;
    if (n in DICT) return DICT[n];
    var m = EDGE.exec(n);
    if (m && m[2] && m[2] !== n && (norm(m[2]) in DICT)) return m[1] + DICT[norm(m[2])] + m[3];
    for (var i = 0; i < PATS.length; i++) {
      var p = PATS[i], mm = p[0].exec(n);
      if (mm) return typeof p[1] === "function" ? p[1](mm, t) : sub(p[1], mm);
      if (m && m[2] !== n && (mm = p[0].exec(m[2]))) return m[1] + (typeof p[1] === "function" ? p[1](mm, t) : sub(p[1], mm)) + m[3];
    }
    return raw;
  }
  window.BM_T = t;

  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1 };
  var ATTRS = ["placeholder", "aria-label", "title"];
  function doText(node) {
    var v = node.nodeValue; if (!v || !/[A-Za-z]{2}/.test(v)) return;
    var p = node.parentNode; if (!p || SKIP[p.nodeName] || (p.closest && p.closest("svg,[data-no-i18n]"))) return;
    var out = t(v);
    if (out !== v && norm(out) !== norm(v)) {
      var lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0];
      node.nodeValue = lead + norm(out) + trail;
    }
  }
  function doEl(el) {
    if (el.nodeType !== 1 || SKIP[el.nodeName]) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = el.getAttribute && el.getAttribute(ATTRS[i]);
      if (a && /[A-Za-z]{2}/.test(a)) { var o = t(a); if (o !== a) el.setAttribute(ATTRS[i], o); }
    }
    if (el.nodeName === "INPUT" && /^(button|submit)$/i.test(el.type) && el.value) { var ov = t(el.value); if (ov !== el.value) el.value = ov; }
  }
  function doHtml(el) {
    var k = normH(el.innerHTML);
    if (k in HTML) { el.innerHTML = HTML[k]; return; }
    // allow a trailing decorative emoji span that changes per round
    var m = /^(.*?)(\s*<span class="emoji">[^<]*<\/span>\s*)$/.exec(k);
    if (m && (m[1] in HTML)) el.innerHTML = HTML[m[1]] + m[2];
  }
  function walk(root) {
    if (!root) return;
    if (HSEL.length) {
      var sel = HSEL.join(","), host = (root.nodeType === 1 ? root : root.parentElement);
      var up = host && host.closest && host.closest(sel);
      if (up) doHtml(up);
      if (root.nodeType === 1 && root.querySelectorAll) { var hs = root.querySelectorAll(sel); for (var x = 0; x < hs.length; x++) doHtml(hs[x]); }
    }
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 || SKIP[root.nodeName]) return;
    doEl(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null), n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else doEl(n); }
  }

  // Indonesian speech -> English speech
  // Best natural English voice on this device (enhanced/premium iOS & macOS voices, Google, Microsoft neural)
  var _enV = null, _enVn = -1;
  function enVoice() {
    try {
      var vs = window.speechSynthesis.getVoices() || [];
      if (_enV && vs.length === _enVn) return _enV;
      _enVn = vs.length;
      var en = vs.filter(function (v) { return /^en[-_]/i.test(v.lang || "") || /^en$/i.test(v.lang || ""); });
      if (!en.length) return (_enV = null);
      var score = function (v) {
        var n = (v.name || "") + " " + (v.voiceURI || ""), sc = 0;
        if (/premium/i.test(n)) sc += 60; else if (/enhanced|neural|natural/i.test(n)) sc += 50;
        if (/Samantha|Ava|Allison|Susan|Zoe|Nicky|Joelle|Evan|Nathan|Tom|Karen|Serena|Daniel|Moira|Tessa|Kate|Martha|Aria|Jenny|Guy|Libby|Sonia/i.test(n)) sc += 25;
        if (/Google US English|Google UK English Female/i.test(n)) sc += 30;
        if (/en[-_]US/i.test(v.lang)) sc += 12; else if (/en[-_](GB|AU|IE|CA)/i.test(v.lang)) sc += 8;
        if (v.localService) sc += 3;
        // novelty / robotic voices sound wrong for a children's story
        if (/Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Ralph|Kathy|Princess|Grandma|Grandpa|Rocko|Shelley|Flo|Eddy|Reed|Sandy/i.test(n)) sc -= 80;
        return sc;
      };
      en.sort(function (a, b) { return score(b) - score(a); });
      return (_enV = en[0]);
    } catch (e) { return null; }
  }
  window.BM_enVoice = enVoice;
  try {
    var ss = window.speechSynthesis;
    if (ss && ss.speak) {
      var orig = ss.speak.bind(ss);
      ss.speak = function (u) {
        try {
          if (u && /^(id|ms)/i.test(u.lang || "") ) {
            var tx = t(u.text);
            if (tx !== u.text) {
              u.text = tx; u.lang = "en-US";
              var ev = enVoice();
              try { u.voice = ev || null; } catch (e) {}
              if (ev) u.lang = ev.lang;
              // pitch/rate were tuned for the Indonesian voice (often high and slow) — keep English natural
              if (u.pitch > 1.12) u.pitch = 1.08;
              if (u.rate < 0.82) u.rate = 0.88;
            }
          }
        } catch (e) {}
        return orig(u);
      };
    }
  } catch (e) {}

  // Hide the page until the first pass so Indonesian doesn't flash
  var st = document.createElement("style");
  st.id = "bm-i18n-hide"; st.textContent = "body{opacity:0!important}";
  (document.head || document.documentElement).appendChild(st);
  var reveal = function () { var s = document.getElementById("bm-i18n-hide"); if (s) s.remove(); };
  setTimeout(reveal, 1500);

  function start() {
    if (document.title) document.title = t(document.title);
    walk(document.body);
    reveal();
    var pending = [], raf = 0;
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i];
        if (m.type === "characterData") pending.push(m.target);
        else if (m.type === "attributes") doEl(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) pending.push(m.addedNodes[j]);
      }
      // translate right away (before paint) — cheap dictionary lookups
      var list = pending; pending = [];
      for (var k = 0; k < list.length; k++) walk(list[k]);
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
