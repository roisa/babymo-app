/* Baby Mo — game theme follows the hub's theme switch.
   Hub light  → the bright, colourful game look (bm-bright.css + each
                game's <style id="bm-bright"> overrides).
   Hub dark   → the original dark-green "classic" look: those bright
                overrides are switched off before first paint.
   Auto follows the phone. Load this first in <head> (not deferred).
   ?theme=dark|light in the URL overrides for one visit (testing/sharing). */
(function () {
  var m = "auto";
  try { m = localStorage.getItem("bm_theme") || "auto"; } catch (e) {}
  var q = (location.search.match(/[?&]theme=(dark|light)\b/) || [])[1];
  if (q) m = q;
  var dark = m === "dark" || (m === "auto" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
  var root = document.documentElement;
  root.setAttribute("data-bm-theme", dark ? "classic" : "bright");
  window.BM_THEME = dark ? "classic" : "bright";
  if (!dark) return;
  function off(n) {
    if (!n || n.nodeType !== 1) return;
    if ((n.tagName === "LINK" && /bm-bright\.css/.test(n.getAttribute("href") || "")) ||
        (n.tagName === "STYLE" && /^bm-bright/.test(n.id))) {
      n.media = "not all";
    }
  }
  var all = function () { var l = document.querySelectorAll("link,style"); for (var i = 0; i < l.length; i++) off(l[i]); };
  all();
  // Catch the stylesheets as the parser adds them (runs before first paint)
  var mo = new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++) off(ms[i].addedNodes[j]);
  });
  mo.observe(root, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", function () { all(); mo.disconnect(); });
})();
