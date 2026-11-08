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
const CACHE = "babymo-games-v39";

const SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/bm-kit.js",
  "/bm-icons.js",
  "/bm-theme.js",
  "/bm-prayer.js",
  "/doa-scenes.js",
  "/bm-i18n.js",
  "/i18n/puzzle.js",
  "/i18n/doa.js",
  "/i18n/dua.js",
  "/i18n/kata.js",
  "/i18n/dream.js",
  "/i18n/hijaiyah.js",
  "/i18n/find.js",
  "/i18n/memory.js",
  "/i18n/beat.js",
  "/i18n/kbaik.js",
  "/i18n/pray.js",
  "/i18n/companion.js",

  "/bm-buttons.css",
  "/bm-bright.css",
  "/fonts/fonts.css",
  "/babymo-pray-with-mo.html",
  "/babymo-wudhu.html",
  "/i18n/wudhu.js",
  "/babymo-puzzle.html",
  "/babymo-doa-harian.html",
  "/babymo-dua-game.html",
  "/babymo-arabic-spelling.html",
  "/babymo-dreamtime.html",
  "/babymo-hijaiyah.html",
  "/babymo-hijaiyah-classic.html",
  "/i18n/huruf.js",
  "/icons/games/huruf-hijaiyah.svg",
  "/babymo-puzzle-katabaik.html",
  "/babymo-look-and-find.html",
  "/babymo-memory-match.html",
  "/baby-mo-forehand-beat.html",
  "/babymo-tenis-adam.html",
  "/i18n/tenis.js",
  "/icons/games/tenis-adam.svg",
  "/babymo-kebun-ais.html",
  "/i18n/kebun.js",
  "/icons/games/kebun-ais.svg",
  "/ais-garden/arms-wide-joy.webp",
  "/ais-garden/cheer-fist.webp",
  "/ais-garden/dreamy-delight.webp",
  "/ais-garden/dua-hands-closed.webp",
  "/ais-garden/eat-watermelon.webp",
  "/ais-garden/gardener-sapling.webp",
  "/ais-garden/gift-box.webp",
  "/ais-garden/giggle.webp",
  "/ais-garden/heart-hands-smile.webp",
  "/ais-garden/hug-earth-smile.webp",
  "/ais-garden/jump-joy.webp",
  "/ais-garden/magnifier-leaf.webp",
  "/ais-garden/plant-trowel.webp",
  "/ais-garden/rain-umbrella.webp",
  "/ais-garden/run.webp",
  "/ais-garden/sad-tears.webp",
  "/ais-garden/sit-wave.webp",
  "/ais-garden/sleep-pillow.webp",
  "/ais-garden/surprised.webp",
  "/ais-garden/think-question.webp",
  "/ais-garden/thumbs-up-walk.webp",
  "/ais-garden/wake-stretch.webp",
  "/ais-garden/watering-can.webp",
  "/ais-garden/wave-hello.webp",
  "/adam-tennis/backhand-1.webp",
  "/adam-tennis/backhand-2.webp",
  "/adam-tennis/backhand-3.webp",
  "/adam-tennis/backhand-4.webp",
  "/adam-tennis/backhand-5.webp",
  "/adam-tennis/backhand-6.webp",
  "/adam-tennis/celebrate-3.webp",
  "/adam-tennis/fh-1.webp",
  "/adam-tennis/fh-2.webp",
  "/adam-tennis/fh-3.webp",
  "/adam-tennis/fh-4.webp",
  "/adam-tennis/fh-5.webp",
  "/adam-tennis/fh-6.webp",
  "/adam-tennis/hold-ball.webp",
  "/adam-tennis/oops-1.webp",
  "/adam-tennis/ready-wide.webp",
  "/adam-tennis/sad-miss.webp",
  "/adam-tennis/serve-1.webp",
  "/adam-tennis/serve-2.webp",
  "/adam-tennis/serve-3.webp",
  "/adam-tennis/serve-4.webp",
  "/adam-tennis/serve-5.webp",
  "/adam-tennis/serve-6.webp",
  "/adam-tennis/shuffle-1.webp",
  "/adam-tennis/shuffle-2.webp",
  "/adam-tennis/shuffle-3.webp",
  "/adam-tennis/shuffle-4.webp",
  "/adam-tennis/shuffle-5.webp",
  "/adam-tennis/shuffle-6.webp",
  "/adam-tennis/wave-1.webp",
  "/adam-tennis/wave-3.webp",
  "/adam-tennis/win-fist.webp",
  "/babymo-companion/",
  "/babymo-companion/index.html",
  "/Logo_Baby_Mo_Transparant.webp",
  "/brand/babymo-logo.png",
  "/Baby_Mo_Menyapa.png",
  "/babymo_running.png",
  // Mo Companion reaction poses (precache the ones the kit picks from)
  "/baby-mo-poses/baby-mo-pose-01.webp",
  "/baby-mo-poses/baby-mo-pose-05.webp",
  "/baby-mo-poses/baby-mo-idea.webp",
  "/baby-mo-poses/baby-mo-ok.webp",
  "/baby-mo-poses/baby-mo-yes.webp",
  "/baby-mo-poses/baby-mo-alright.webp",
  "/baby-mo-poses/baby-mo-yeyy.webp",
  "/baby-mo-poses/baby-mo-wow.webp",
  "/baby-mo-poses/baby-mo-thank-you.webp",
  "/baby-mo-poses/baby-mo-pose-07.webp",
  "/baby-mo-poses/baby-mo-pose-08.webp",
  "/baby-mo-poses/baby-mo-pose-09.webp",
  "/baby-mo-poses/baby-mo-pose-12.webp",
  "/baby-mo-poses/baby-mo-pose-15.webp",
  "/baby-mo-poses/baby-mo-pose-19.webp",
  "/baby-mo-poses/baby-mo-pose-22.webp",
  "/baby-mo-poses/baby-mo-pose-27.webp",
  "/baby-mo-poses/baby-mo-pose-33.webp",
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
