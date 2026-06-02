/* ============================================================
   Baby Mo Games — service worker (play.babymo.id)
   Gives the games offline support + instant repeat loads, so kids
   can play on a car ride with no wifi and parents see a fast, app-like
   experience. Registered from bm-kit.js.

   Strategy:
     - navigations  → network-first (always fresh when online, cached
       copy when offline) so updated games never get stuck stale.
     - same-origin static → cache-first (fast), refreshed in background.
     - cross-origin (fonts) → opportunistic cache.
   ============================================================ */
const CACHE = "babymo-games-v11";

const SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/bm-kit.js",
  "/fonts/fonts.css",
  "/babymo-pray-with-mo.html",
  "/babymo-puzzle.html",
  "/babymo-doa-harian.html",
  "/babymo-dua-game.html",
  "/babymo-arabic-spelling.html",
  "/babymo-dreamtime.html",
  "/babymo-hijaiyah.html",
  "/babymo-puzzle-katabaik.html",
  "/babymo-look-and-find.html",
  "/babymo-memory-match.html",
  "/baby-mo-forehand-beat.html",
  "/babymo-companion/",
  "/babymo-companion/index.html",
  "/Logo_Baby_Mo_Transparant.png",
  "/brand/babymo-logo.png",
  "/Baby_Mo_Menyapa.png",
  "/babymo_running.png",
  // Mo Companion reaction poses (precache the ones the kit picks from)
  "/baby-mo-poses/baby-mo-pose-01.png",
  "/baby-mo-poses/baby-mo-pose-05.png",
  "/baby-mo-poses/baby-mo-idea.png",
  "/baby-mo-poses/baby-mo-ok.png",
  "/baby-mo-poses/baby-mo-yes.png",
  "/baby-mo-poses/baby-mo-alright.png",
  "/baby-mo-poses/baby-mo-yeyy.png",
  "/baby-mo-poses/baby-mo-wow.png",
  "/baby-mo-poses/baby-mo-thank-you.png",
  "/baby-mo-poses/baby-mo-pose-08.png",
  "/baby-mo-poses/baby-mo-pose-12.png",
  "/baby-mo-poses/baby-mo-pose-15.png",
  "/baby-mo-poses/baby-mo-pose-19.png",
  "/baby-mo-poses/baby-mo-pose-22.png",
  "/baby-mo-poses/baby-mo-pose-27.png",
  "/baby-mo-poses/baby-mo-pose-33.png",
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // Best-effort: a single missing asset must not fail the install.
      Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))
    )
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Navigations: fresh-first, fall back to cache (offline), then portal.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return r;
        })
        .catch(() =>
          caches.match(req).then((m) => m || caches.match("/index.html"))
        )
    );
    return;
  }

  // Same-origin assets: cache-first, refresh in the background.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then(
        (m) =>
          m ||
          fetch(req)
            .then((r) => {
              const copy = r.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
              return r;
            })
            .catch(() => m)
      )
    );
    return;
  }

  // Cross-origin (e.g. Google Fonts): serve cache if present, else fetch
  // and opportunistically cache.
  e.respondWith(
    caches.match(req).then(
      (m) =>
        m ||
        fetch(req)
          .then((r) => {
            try {
              const copy = r.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            } catch (_) {}
            return r;
          })
          .catch(() => m)
    )
  );
});
