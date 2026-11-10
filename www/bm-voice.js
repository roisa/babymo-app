/* Baby Mo — one recorded voice everywhere.
   Wraps speechSynthesis.speak: when an utterance's text has a recorded clip
   (Google TTS, one consistent voice; made by tools/voice/gen.py) the clip plays
   instead of the phone's voice, and the utterance's onstart / onend / onerror
   still fire, so every game's callbacks and sequencing keep working.
   No clip (or the clip fails) → the phone's own text-to-speech, exactly as before.

   Manifests (any that the page has loaded):
     window.BM_VOICE  = {"ar|<text>": "file.mp3?v=…", "en|<text>": …, "id|<text>": …, "tr|<latin>": …}  (voice/manifest.js)
     window.HIJ_VOICE = {"<arabic>": "file.mp3?v=…"}   (hijaiyah-voice/voice.js)
     window.DOA_VOICE = {"<arabic>": "file.mp3?v=…"}   (doa-voice/voice.js)
   Key = language + "|" + normalised text. Language is "ar" when the text has Arabic
   letters, otherwise the utterance's language (en / id). "tr|" keys are Latin
   transliterations ("Bismillah") that play the Arabic clip.
   Normalising: Unicode NFC, tatweel removed, whitespace collapsed, trailing
   punctuation trimmed, Latin lower-cased. Harakat are KEPT (different sounds).

   Works with bm-i18n.js in either load order. Exposes window.BMVoice. */
(function () {
  "use strict";
  if (window.BMVoice) return;
  var ss = window.speechSynthesis;

  var AR = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
  var TRAIL = /[\s.,!?;:…،؛؟۔。]+$/;
  function norm(t, lang) {
    var s = String(t == null ? "" : t);
    try { s = s.normalize("NFC"); } catch (e) {}
    s = s.replace(/ـ/g, "").replace(/\s+/g, " ").trim().replace(TRAIL, "");
    if (lang !== "ar") s = s.toLowerCase();
    return s;
  }
  function trKey(t) {
    var s = String(t == null ? "" : t);
    try { s = s.normalize("NFD"); } catch (e) {}
    return "tr|" + s.replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  }
  function pageLang() {
    if (window.BM_LANG === "en" || window.BM_LANG === "id") return window.BM_LANG;
    try { return localStorage.getItem("bm_lang") === "en" ? "en" : "id"; } catch (e) { return "id"; }
  }
  function langOf(text, ulang) {
    if (AR.test(String(text || ""))) return "ar";
    var l = String(ulang || "").slice(0, 2).toLowerCase();
    if (l === "ms") l = "id";
    return (l === "en" || l === "id") ? l : pageLang();
  }
  function key(text, ulang) { var l = langOf(text, ulang); return l + "|" + norm(text, l); }

  /* ── manifests → one index (re-read whenever a manifest object changes) ── */
  var base = "";
  try { var cs = document.currentScript; if (cs && cs.src) base = cs.src.replace(/[^\/]*([?#].*)?$/, ""); } catch (e) {}
  var IDX = Object.create(null), seen = [null, null, null];
  function index() {
    var srcs = [window.HIJ_VOICE, window.DOA_VOICE, window.BM_VOICE];
    if (srcs[0] === seen[0] && srcs[1] === seen[1] && srcs[2] === seen[2]) return IDX;
    seen = srcs; IDX = Object.create(null);
    var dirs = ["hijaiyah-voice/", "doa-voice/", "voice/"];
    for (var i = 0; i < 3; i++) {
      var m = srcs[i]; if (!m || typeof m !== "object") continue;
      for (var k in m) {
        if (!m[k]) continue;
        var kk;
        if (i < 2) kk = "ar|" + norm(k, "ar");
        else {
          var bar = k.indexOf("|"); if (bar < 0) continue;
          var l = k.slice(0, bar), rest = k.slice(bar + 1);
          kk = l === "tr" ? trKey(rest) : l + "|" + norm(rest, l);
        }
        IDX[kk] = base + dirs[i] + m[k];
      }
    }
    return IDX;
  }
  function urlFor(text, ulang, noAlias) {
    if (!text || !String(text).trim()) return null;
    var ix = index(), k = key(text, ulang);
    if (ix[k]) return ix[k];
    if (!noAlias && k.slice(0, 3) !== "ar|") { var t = trKey(text); if (t.length > 3 && ix[t]) return ix[t]; }
    return null;
  }
  // the clips for one utterance: the whole text, or every sentence of it ("Alhamdulillah! Masya Allah!")
  function plan(u) {
    var text = u && u.text, lang = u && u.lang, noAlias = !!(u && u.bmRaw);
    if (!text || u.bmVoice === false || u.volume === 0) return null;
    // bm-i18n loaded first: Indonesian text is translated by its wrapper only after us
    if (window.BM_LANG === "en" && /^(id|ms)/i.test(lang || "") && !AR.test(text) && typeof window.BM_T === "function") {
      var tx = window.BM_T(text); if (tx && tx !== text) { text = tx; lang = "en-US"; }
    }
    var one = urlFor(text, lang, noAlias);
    if (one) return [one];
    var parts = (String(text).match(/[^.!?…؟]+[.!?…؟]*/g) || []).filter(function (p) { return p.trim(); });
    if (parts.length < 2) return null;
    var out = [];
    for (var i = 0; i < parts.length; i++) { var x = urlFor(parts[i], lang, noAlias); if (!x) return null; out.push(x); }
    return out;
  }

  window.BMVoice = {
    norm: norm, key: key, langOf: langOf,
    has: function (text, lang) { return !!urlFor(text, lang); },
    urlFor: function (text, lang) { return urlFor(text, lang); },
    stop: function () { try { ss && ss.cancel(); } catch (e) {} }
  };
  if (!ss || !ss.speak) return;

  /* ── one reusable audio element (iOS: unlocked on the first tap) ── */
  var A = null;
  function audio() { if (!A) { A = new Audio(); A.preload = "auto"; try { A.setAttribute("playsinline", ""); } catch (e) {} } return A; }
  var SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
  var unlocked = false;
  function unlock() {
    if (unlocked) return; unlocked = true;
    try {
      var a = audio();
      if (cur && cur.urls) return;              // a clip is already playing from this tap
      a.src = SILENT;
      var p = a.play();
      if (p && p.then) p.then(function () { if (a.src === SILENT) a.pause(); }, function () { unlocked = false; });
    } catch (e) { unlocked = false; }
  }
  ["touchend", "click", "keydown"].forEach(function (ev) { document.addEventListener(ev, unlock, true); });

  /* ── the queue: clips and phone speech in the order the page asked for them ── */
  var orig = ss.speak.bind(ss), origCancel = ss.cancel.bind(ss);
  var origPause = ss.pause && ss.pause.bind(ss), origResume = ss.resume && ss.resume.bind(ss);
  var P = (window.SpeechSynthesis && SpeechSynthesis.prototype) || {};
  function nget(n) { try { var d = Object.getOwnPropertyDescriptor(P, n); return d && d.get ? !!d.get.call(ss) : false; } catch (e) { return false; } }
  var q = [], cur = null, native = 0, gen = 0, poll = 0, quiet = 0;

  function fire(u, type, err) {
    var ev = null;
    try {
      ev = type === "error" ? new SpeechSynthesisErrorEvent("error", { utterance: u, error: err || "interrupted" })
                            : new SpeechSynthesisEvent(type, { utterance: u });
    } catch (e) { try { ev = new Event(type); ev.utterance = u; if (err) ev.error = err; } catch (e2) { ev = { type: type, utterance: u, error: err }; } }
    var sent = false;
    try { if (u.dispatchEvent && typeof Event === "function" && ev instanceof Event) { u.dispatchEvent(ev); sent = true; } } catch (e) {}
    if (!sent) { try { var h = u["on" + type]; if (typeof h === "function") h.call(u, ev); } catch (e) {} }
  }

  // phone speech that we wait for (its own events, or the engine going quiet)
  var waits = [];
  function trackNative(u, after) {
    native++;
    var done = false, my = gen;
    var f = function () {
      if (done) return; done = true;
      var k = waits.indexOf(f); if (k >= 0) waits.splice(k, 1);
      if (my !== gen) return;                       // cancelled since: nothing to release
      native = Math.max(0, native - 1);
      if (after) after(); else pump();
    };
    waits.push(f);
    try { u.addEventListener("end", f); u.addEventListener("error", f); } catch (e) {}
    if (!poll) poll = setInterval(function () {
      if (!native) { clearInterval(poll); poll = 0; quiet = 0; return; }
      // some engines never report on an utterance they drop (blocked, no voice): go on once it is quiet
      if (!nget("speaking") && !nget("pending")) { if (++quiet >= 3) { quiet = 0; waits.slice().forEach(function (w) { w(); }); native = waits.length; pump(); } }
      else quiet = 0;
    }, 500);
    return f;
  }
  function pump() {
    if (cur || native > 0) return;
    var it = q.shift(); if (!it) return;
    cur = it;
    if (it.urls) { playClips(it); return; }
    var after = function () { if (cur === it) cur = null; pump(); };
    trackNative(it.u, after);
    try { orig(it.u); } catch (e) { after(); }
  }
  function playClips(it) {
    var a = audio(), u = it.u, i = 0, started = false, done = false, wd = 0, my = gen;
    var finish = function () { if (done) return; done = true; clearTimeout(wd); a.onended = a.onerror = a.onplaying = null; if (cur === it) cur = null; fire(u, "end"); pump(); };
    var fallback = function () {            // the clip can't play → the phone's own voice says it
      if (done) return; done = true; clearTimeout(wd); a.onended = a.onerror = a.onplaying = null;
      try { a.pause(); } catch (e) {}
      if (my !== gen) return;
      it.urls = null; var after = function () { if (cur === it) cur = null; pump(); };
      trackNative(u, after);
      try { orig(u); } catch (e) { after(); }
    };
    var next = function () {
      if (done || my !== gen) return;
      if (i >= it.urls.length) { finish(); return; }
      var url = it.urls[i++];
      clearTimeout(wd);
      wd = setTimeout(started ? finish : fallback, 6000);       // blocked / never loads: don't hang the page
      a.onplaying = function () {
        if (!started) { started = true; fire(u, "start"); }
        clearTimeout(wd);
        var d = a.duration; d = (isFinite(d) && d > 0) ? d : 20;
        wd = setTimeout(finish, d * 1000 / (a.playbackRate || 1) + 1500);
      };
      a.onended = function () { if (done) return; i < it.urls.length ? setTimeout(next, 140) : finish(); };
      a.onerror = function () { started ? next() : fallback(); };
      try {
        a.src = url;
        var slow = !!u.bmSlow;
        a.playbackRate = a.defaultPlaybackRate = slow ? 0.8 : 1;
        try { a.preservesPitch = a.webkitPreservesPitch = a.mozPreservesPitch = true; } catch (e) {}
        a.volume = (u.volume >= 0 && u.volume <= 1) ? u.volume : 1;
        var p = a.play();
        if (p && p.catch) p.catch(function (e) { if (done || my !== gen) return; if (e && e.name === "AbortError") return; started ? finish() : fallback(); });
      } catch (e) { started ? finish() : fallback(); }
    };
    next();
  }

  ss.speak = function (u) {
    var urls = null;
    try { urls = plan(u); } catch (e) {}
    if (!urls && !cur && !q.length) { if (u && u.addEventListener) trackNative(u); return orig(u); }   // nothing recorded: as before
    q.push({ u: u, urls: urls });
    pump();
  };
  ss.cancel = function () {
    gen++;
    var was = cur, rest = q; cur = null; q = []; native = 0; waits = [];
    if (A) { try { A.onended = A.onerror = A.onplaying = null; A.pause(); } catch (e) {} }
    try { origCancel(); } catch (e) {}
    // like the phone engine: the cut-off utterance and the queued ones report an error
    setTimeout(function () {
      if (was && was.urls) fire(was.u, "error", "interrupted");
      rest.forEach(function (it) { fire(it.u, "error", "canceled"); });   // never reached the engine
    }, 0);
  };
  ss.pause = function () { if (cur && cur.urls && A) { try { A.pause(); } catch (e) {} } if (origPause) origPause(); };
  ss.resume = function () { if (cur && cur.urls && A) { try { A.play(); } catch (e) {} } if (origResume) origResume(); };
  try {
    Object.defineProperty(ss, "speaking", { configurable: true, get: function () { return !!(cur && cur.urls) || nget("speaking"); } });
    Object.defineProperty(ss, "pending", { configurable: true, get: function () { return q.length > 0 || nget("pending"); } });
  } catch (e) {}
})();
