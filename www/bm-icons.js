/* Baby Mo — modern button icons.
   Swaps the UI emoji/symbols on buttons (back, home, sound, share, replay…)
   for crisp, rounded line icons in the spirit of iOS SF Symbols. Icons use
   currentColor, so they match each button's label colour. Content emoji
   (word cards, levels, cities, du'a rows) are left alone on purpose — those
   are pictures for kids, not controls.
   Works with text that games set later (mute toggles, i18n) via a
   MutationObserver. Include with <script src="bm-icons.js" defer>. */
(function () {
  "use strict";
  if (window.__bmIcons) return;
  window.__bmIcons = true;

  var S = 'fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"';
  var F = 'fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"';
  var P = {
    back: '<path ' + S + ' d="M19 12H5.5M11 5.5 4.5 12l6.5 6.5"/>',
    next: '<path ' + S + ' d="M5 12h13.5M13 5.5l6.5 6.5-6.5 6.5"/>',
    up: '<path ' + S + ' d="M12 19.5V5M5.5 11 12 4.5l6.5 6.5"/>',
    chevL: '<path ' + S + ' d="M15 4.5 7.5 12l7.5 7.5"/>',
    chevR: '<path ' + S + ' d="M9 4.5l7.5 7.5L9 19.5"/>',
    home: '<path ' + S + ' d="M3.5 11.2 12 4l8.5 7.2"/><path ' + S + ' d="M5.8 9.6V19a1.2 1.2 0 0 0 1.2 1.2h3.3v-5.4h3.4v5.4H17a1.2 1.2 0 0 0 1.2-1.2V9.6"/>',
    replay: '<path ' + S + ' d="M19.6 13A7.8 7.8 0 1 1 17.3 6.4"/><path ' + S + ' d="M19.4 3.6v4.8h-4.8"/>',
    undo: '<path ' + S + ' d="M4.4 13A7.8 7.8 0 1 0 6.7 6.4"/><path ' + S + ' d="M4.6 3.6v4.8h4.8"/>',
    share: '<path ' + S + ' d="M12 14.5V3.5M7.8 7.6 12 3.4l4.2 4.2"/><path ' + S + ' d="M8 10.5H6.6A1.6 1.6 0 0 0 5 12.1v7.3A1.6 1.6 0 0 0 6.6 21h10.8a1.6 1.6 0 0 0 1.6-1.6v-7.3a1.6 1.6 0 0 0-1.6-1.6H16"/>',
    sound: '<path ' + F + ' d="M3.8 9.4h3.4L11.8 5.4v13.2l-4.6-4H3.8z"/><path ' + S + ' d="M15.3 9.2a4 4 0 0 1 0 5.6M18.2 6.5a7.8 7.8 0 0 1 0 11"/>',
    mute: '<path ' + F + ' d="M3.8 9.4h3.4L11.8 5.4v13.2l-4.6-4H3.8z"/><path ' + S + ' d="M15.6 9.5l5 5M20.6 9.5l-5 5"/>',
    play: '<path ' + F + ' stroke-width="2" d="M8 5.2v13.6L18.8 12z"/>',
    pause: '<rect x="6" y="5" width="4.2" height="14" rx="1.4" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4" fill="currentColor"/>',
    prev: '<path ' + S + ' d="M6 5.5v13"/><path ' + F + ' stroke-width="2" d="M18.5 5.8v12.4L9.2 12z"/>',
    skip: '<path ' + S + ' d="M18 5.5v13"/><path ' + F + ' stroke-width="2" d="M5.5 5.8v12.4l9.3-6.2z"/>',
    close: '<path ' + S + ' stroke-width="2.6" d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    game: '<path ' + S + ' d="M7 7.5h10a4.2 4.2 0 0 1 4.1 5l-.8 4.1a2.3 2.3 0 0 1-4 1.1L14.6 16H9.4l-1.7 1.7a2.3 2.3 0 0 1-4-1.1l-.8-4.1A4.2 4.2 0 0 1 7 7.5z"/><path ' + S + ' d="M8 10.3v3.4M6.3 12h3.4"/><circle cx="15.3" cy="11" r="1.15" fill="currentColor"/><circle cx="17.4" cy="13.1" r="1.15" fill="currentColor"/>',
    books: '<rect ' + S + ' x="3.5" y="4.5" width="4.4" height="15" rx="1"/><rect ' + S + ' x="9.6" y="4.5" width="4.4" height="15" rx="1"/><path ' + S + ' d="M15.7 6.1l3.9-1 3 13.4-3.9 1z"/>',
    book: '<path ' + S + ' d="M12 6.6C10 5 7 4.4 3.5 4.9v13.3c3.5-.5 6.5.1 8.5 1.6 2-1.5 5-2.1 8.5-1.6V4.9C17 4.4 14 5 12 6.6zM12 6.6v13"/>',
    sliders: '<path ' + S + ' d="M4 7h9.5M18.5 7H20M4 17h3.5M12.5 17H20"/><circle ' + S + ' cx="16" cy="7" r="2.4"/><circle ' + S + ' cx="10" cy="17" r="2.4"/>',
    list: '<path ' + S + ' d="M9.5 6.5H20M9.5 12H20M9.5 17.5H20"/><circle cx="5" cy="6.5" r="1.4" fill="currentColor"/><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="5" cy="17.5" r="1.4" fill="currentColor"/>',
    map: '<path ' + S + ' d="M3.5 6.6 9 4.2l6 2.4 5.5-2.4v13.2L15 19.8l-6-2.4-5.5 2.4zM9 4.2v13.2M15 6.6v13.2"/>',
    bulb: '<path ' + S + ' d="M9.2 17.6h5.6M10.2 21h3.6M12 3a6 6 0 0 0-3.6 10.8c.7.6 1 1.3 1 2.2h5.2c0-.9.3-1.6 1-2.2A6 6 0 0 0 12 3z"/>',
    camera: '<path ' + S + ' d="M4 8.6A1.6 1.6 0 0 1 5.6 7h2.2l1.6-2.2h5.2L16.2 7h2.2A1.6 1.6 0 0 1 20 8.6v9a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 17.6z"/><circle ' + S + ' cx="12" cy="12.8" r="3.4"/>',
    music: '<path ' + S + ' d="M9 17.5V5.8l10.5-2.1v11.5"/><circle ' + S + ' cx="6.6" cy="17.6" r="2.5"/><circle ' + S + ' cx="17.1" cy="15.3" r="2.5"/>',
    walk: '<circle cx="13.2" cy="4.4" r="1.9" fill="currentColor"/><path ' + S + ' d="M9.8 20.5l2.4-5.6 3 2.8v2.8M12.2 14.9l-1-5.2 3.9 1.6 2.4 2.2M11.2 9.7 8 11.8v3"/>',
    compass: '<circle ' + S + ' cx="12" cy="12" r="8.6"/><path ' + F + ' d="M15.6 8.4l-2 5.2-5.2 2 2-5.2z"/>',
    pencil: '<path ' + S + ' d="M4.5 19.5l1-4.4L15.4 5.2a2 2 0 0 1 2.9 0l.5.5a2 2 0 0 1 0 2.9L8.9 18.5zM13.6 7l3.4 3.4"/>',
    star: '<path fill="#FFB400" stroke="#F59E0B" stroke-width="1" stroke-linejoin="round" d="M12 2.8l2.75 5.6 6.15.9-4.45 4.35 1.05 6.1L12 16.85 6.5 19.75l1.05-6.1L3.1 9.3l6.15-.9z"/>',
    sparkle: '<path fill="currentColor" d="M10.5 3.5c.7 4.2 2.4 5.9 6.6 6.6-4.2.7-5.9 2.4-6.6 6.6-.7-4.2-2.4-5.9-6.6-6.6 4.2-.7 5.9-2.4 6.6-6.6z"/><path fill="currentColor" d="M18.2 13.8c.35 2 1.1 2.75 3.1 3.1-2 .35-2.75 1.1-3.1 3.1-.35-2-1.1-2.75-3.1-3.1 2-.35 2.75-1.1 3.1-3.1z"/>',
    moon: '<path fill="currentColor" d="M19.8 14.6A8.4 8.4 0 1 1 9.4 4.2a6.6 6.6 0 0 0 10.4 10.4z"/>',
    mosque: '<path ' + S + ' d="M12 2.6v1.8M6.4 11.2C6.4 8 8.8 6.2 12 4.4c3.2 1.8 5.6 3.6 5.6 6.8M4.5 11.2h15V20.4h-15zM10 20.4v-3.2a2 2 0 0 1 4 0v3.2"/>',
    pick: '<path ' + S + ' d="M14.2 9.8 4.5 19.5"/><path ' + S + ' d="M7.6 5.6c4.3-2.4 8.9-2.2 12.2.6 2.8 3.3 3 7.9.6 12.2"/>',
    brick: '<rect ' + S + ' x="3.5" y="6" width="17" height="12" rx="1.5"/><path ' + S + ' d="M3.5 12h17M9.5 6v6M14.5 12v6"/>',
    pin: '<path ' + S + ' d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle ' + S + ' cx="12" cy="10" r="2.3"/>',
    phone: '<rect ' + S + ' x="6.5" y="2.8" width="11" height="18.4" rx="2.6"/><path ' + S + ' d="M10.5 18h3"/>'
  };

  // glyph → icon (optional variation selector handled by the regex)
  var MAP = {
    "←": "back", "→": "next", "⬆": "up", "‹": "chevL", "›": "chevR",
    "🏠": "home", "🔄": "replay", "↻": "replay", "🔁": "replay", "↺": "undo",
    "📤": "share", "🔗": "share", "🔊": "sound", "🔇": "mute",
    "▶": "play", "⏸": "pause", "⏮": "prev", "⏭": "skip", "✕": "close",
    "🎮": "game", "📚": "books", "📖": "book", "⚙": "sliders", "📋": "list",
    "🗺": "map", "💡": "bulb", "📸": "camera", "🎵": "music", "🚶": "walk",
    "✏": "pencil", "⭐": "star", "✨": "sparkle", "🌙": "moon", "🕌": "mosque",
    "⛏": "pick", "🧱": "brick", "📍": "pin", "📱": "compass"
  };
  var keys = Object.keys(MAP).sort(function (a, b) { return b.length - a.length; });
  var RE = new RegExp("(" + keys.join("|") + ")\\uFE0F?", "g");

  // Where icons are controls. Content tiles keep their emoji.
  var SEL = "button, [role=button], a[class*=btn], a.hero-btn, a.c-btn-sec, a.hdr-back, a.back-btn, a.back-float, a.map-hub-btn, a.play-btn, a.w-back";
  var SKIP = ".card:not(#btnJournal), .lvl-btn, .preview-chip, .city-btn, .speed-btn, .h-card, .lrow, .app-icon, .tab, .lang-btn, .lang-opt, .q-opt, .quiz-opt, .opt, .tile, .cell, .mode-card, .wp-item, .map-node";
  // plain text links that act as back/hub buttons ("← Game Hub")
  var LINK_RE = /^\s*(←|🏠)/;

  function svg(name, cls) {
    return '<svg class="bm-i bm-i-' + name + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + P[name] + "</svg>";
  }

  function decorateText(node) {
    var t = node.nodeValue;
    RE.lastIndex = 0;
    if (!RE.test(t)) return;
    RE.lastIndex = 0;
    var frag = document.createDocumentFragment(), last = 0, m;
    while ((m = RE.exec(t))) {
      var before = t.slice(last, m.index);
      var after = t.slice(m.index + m[0].length);
      var hasBefore = before.trim().length > 0 || (last > 0);
      var hasAfter = after.trim().length > 0;
      if (before) frag.appendChild(document.createTextNode(hasBefore ? before.replace(/\s+$/, "") : ""));
      var span = document.createElement("span");
      span.innerHTML = svg(MAP[m[1]], hasBefore && !hasAfter ? "bm-i-r" : hasAfter ? "bm-i-l" : "");
      frag.appendChild(span.firstChild);
      last = m.index + m[0].length;
      // drop the single space right after the icon (margin handles spacing)
      if (t.charAt(last) === " ") last++;
    }
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }

  function decorate(el) {
    if (!el || el.nodeType !== 1 || el.closest(SKIP)) return;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) {
      if (n.parentNode && n.parentNode.closest && n.parentNode.closest("svg")) continue;
      list.push(n);
    }
    list.forEach(decorateText);
  }

  function targets(root) {
    var out = [];
    if (root.nodeType !== 1) root = root.parentElement;
    if (!root) return out;
    var own = root.closest(SEL);
    if (own) out.push(own);
    root.querySelectorAll(SEL).forEach(function (e) { out.push(e); });
    // "← Game Hub" style plain links
    var links = root.tagName === "A" ? [root] : root.querySelectorAll("a");
    Array.prototype.forEach.call(links, function (a) {
      if (!a.className && LINK_RE.test(a.textContent)) out.push(a);
    });
    return out;
  }

  function run(root) { targets(root || document.body).forEach(decorate); }

  var css =
    ".bm-i{width:1.18em;height:1.18em;display:inline-block;vertical-align:-.22em;flex:0 0 auto;overflow:visible}" +
    ".bm-i-l{margin-inline-end:.42em}.bm-i-r{margin-inline-start:.42em}" +
    ".bm-i-star{width:1.1em;height:1.1em}" +
    "[dir=rtl] .bm-i-back,[dir=rtl] .bm-i-next{transform:scaleX(-1)}";

  function start() {
    var st = document.createElement("style");
    st.id = "bm-icons-style";
    st.textContent = css;
    document.head.appendChild(st);
    run(document.body);
    var pending = new Set(), raf = 0;
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        var t = m.target;
        if (t.nodeType === 3) t = t.parentElement;
        if (t && !(t.closest && t.closest("svg"))) pending.add(t);
        m.addedNodes && m.addedNodes.forEach(function (n) {
          if (n.nodeType === 1 && n.tagName !== "svg") pending.add(n);
        });
      });
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0;
        var items = Array.from(pending); pending.clear();
        items.forEach(function (n) { if (n.isConnected) run(n); });
      });
    }).observe(document.body, { subtree: true, childList: true, characterData: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
