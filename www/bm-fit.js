/* Baby Mo — fit the phone-first games to tablets (iPad).
   Every game is designed for a phone-sized screen. On a tablet we ask
   WebKit to lay the page out at a phone-like size (about 880 CSS px tall)
   and scale it up to fill the screen, using the viewport meta tag. The
   browser itself does the scaling, so touch positions, vh units,
   innerWidth and canvases all stay consistent. Phones are left alone.
   Must be loaded right after <meta name="viewport">. */
(function () {
  "use strict";
  var TARGET_H = 880;          // logical height a tablet page is laid out at
  var TARGET_W = 540;          // portrait: logical width (a big phone)
  var MIN_H = 700;             // portrait: never lay out shorter than this
  var meta = document.querySelector('meta[name="viewport"]');
  if (!meta) return;
  var original = meta.getAttribute("content");
  var root = document.documentElement;

  function deviceSize() {
    // screen.width/height don't swap on iOS rotation, so work out the orientation
    var a = Math.min(screen.width, screen.height), b = Math.max(screen.width, screen.height);
    var o = (typeof window.orientation === "number") ? Math.abs(window.orientation) === 90
          : (screen.orientation && /landscape/.test(screen.orientation.type));
    return o ? [b, a] : [a, b];
  }
  var last = "";
  function apply() {
    var s = deviceSize(), W = s[0], H = s[1];
    if (Math.min(W, H) < 700 || !window.matchMedia || !matchMedia("(pointer: coarse)").matches) {
      if (last !== "off") { meta.setAttribute("content", original); root.removeAttribute("data-bm-fit"); last = "off"; }
      return;
    }
    // Portrait: lay the page out about as wide as a big phone (TARGET_W) so the
    // phone-first layouts fill the screen instead of floating in the middle; the
    // logical height stays above an iPhone SE's (667), which every game handles.
    // Landscape keeps the phone-like height.
    var scale = W < H ? Math.max(1, H / TARGET_H, Math.min(W / TARGET_W, H / MIN_H)) : Math.max(1, H / TARGET_H);
    var lw = Math.round(W / scale);
    var sc = scale.toFixed(4);
    var c = "width=" + lw + ", initial-scale=" + sc + ", minimum-scale=" + sc + ", maximum-scale=" + sc + ", user-scalable=no, viewport-fit=cover";
    if (c === last) return;
    meta.setAttribute("content", c);
    root.setAttribute("data-bm-fit", W > H ? "tablet-land" : "tablet");
    last = c;
  }
  apply();
  window.addEventListener("orientationchange", function () { setTimeout(apply, 60); setTimeout(apply, 400); });
  if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener("change", function () { setTimeout(apply, 60); });
  window.BM_FIT = apply;
})();
