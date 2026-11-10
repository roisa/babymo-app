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
const CACHE = "babymo-games-v94";

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
  "/bm-fit.js",
  "/babymo-pray-with-mo.html",
  "/babymo-wudhu.html",
  "/i18n/wudhu.js",
  "/babymo-puzzle.html",
  "/babymo-doa-harian.html",
  "/babymo-dua-game.html",
  "/babymo-arabic-spelling.html",
  "/babymo-dreamtime.html",
  "/mo-brush/tools.webp",
  "/mo-brush/paste.webp",
  "/mo-brush/brush-lr.webp",
  "/mo-brush/brush-ud.webp",
  "/mo-brush/rinse.webp",
  "/mo-brush/done.webp",
  "/babymo-hijaiyah.html",
  "/babymo-hijaiyah-classic.html",
  "/i18n/huruf.js",
  "/icons/games/huruf-hijaiyah.svg",
  "/babymo-puzzle-katabaik.html",
  "/babymo-look-and-find.html",
  "/babymo-memory-match.html",
  "/baby-mo-forehand-beat.html",
  "/babymo-tenis-adam.html",
  "/icons/ui/calendar.svg",
  "/icons/ui/child.svg",
  "/icons/ui/doa.svg",
  "/icons/ui/games.svg",
  "/icons/ui/mission.svg",
  "/icons/ui/pearl.svg",
  "/icons/ui/qibla.svg",
  "/icons/ui/sholat-dzikir.svg",
  "/icons/ui/sholat-guide.svg",
  "/icons/ui/sholat-progress.svg",
  "/icons/ui/sholat-times.svg",
  "/icons/ui/sound.svg",
  "/icons/ui/theme.svg",
  "/icons/ui/version.svg",
  "/adam-tennis-v2/punch-1.webp",
  "/adam-tennis-v2/punch-2.webp",
  "/adam-tennis-v2/punch-3.webp",
  "/adam-tennis-v2/punch-6.webp",
  "/adam-tennis-v2/backhand-two-1.webp",
  "/adam-tennis-v2/backhand-two-2.webp",
  "/adam-tennis-v2/backhand-two-3.webp",
  "/adam-tennis-v2/backhand-two-4.webp",
  "/adam-tennis-v2/backhand-two-5.webp",
  "/adam-tennis-v2/backhand-two-6.webp",
  "/adam-tennis-v2/celebrate-3.webp",
  "/adam-tennis-v2/fh-one-1.webp",
  "/adam-tennis-v2/fh-one-2.webp",
  "/adam-tennis-v2/fh-one-3.webp",
  "/adam-tennis-v2/fh-one-4.webp",
  "/adam-tennis-v2/fh-one-5.webp",
  "/adam-tennis-v2/fh-one-6.webp",
  "/adam-tennis-v2/fh-two-1.webp",
  "/adam-tennis-v2/fh-two-2.webp",
  "/adam-tennis-v2/fh-two-3.webp",
  "/adam-tennis-v2/fh-two-4.webp",
  "/adam-tennis-v2/fh-two-5.webp",
  "/adam-tennis-v2/fh-two-6.webp",
  "/adam-tennis-v2/hold-ball.webp",
  "/adam-tennis-v2/oops-1.webp",
  "/adam-tennis-v2/oops-2.webp",
  "/adam-tennis-v2/oops-2b.webp",
  "/adam-tennis-v2/sad-miss.webp",
  "/adam-tennis-v2/serve-blue-1.webp",
  "/adam-tennis-v2/serve-blue-2.webp",
  "/adam-tennis-v2/serve-blue-3.webp",
  "/adam-tennis-v2/serve-blue-4.webp",
  "/adam-tennis-v2/serve-blue-5.webp",
  "/adam-tennis-v2/serve-blue-6.webp",
  "/adam-tennis-v2/shuffle-1.webp",
  "/adam-tennis-v2/shuffle-2.webp",
  "/adam-tennis-v2/shuffle-3.webp",
  "/adam-tennis-v2/shuffle-4.webp",
  "/adam-tennis-v2/shuffle-5.webp",
  "/adam-tennis-v2/shuffle-6.webp",
  "/adam-tennis-v2/wave-1.webp",
  "/adam-tennis-v2/wave-3.webp",
  "/adam-tennis-v2/win-fist-r.webp",
  "/i18n/tenis.js",
  "/icons/games/tenis-adam.svg",
  "/babymo-kebun-ais.html",
  "/babymo-sahabat-hewan.html",
  "/i18n/hewan.js",
  "/icons/games/sahabat-hewan.svg",
  "/farm/farm-kit.js",
  "/ais-garden/celebrate-jump-1.webp",
  "/ais-garden/celebrate-jump-2.webp",
  "/ais-garden/celebrate-jump-3.webp",
  "/ais-garden/celebrate-jump-4.webp",
  "/ais-garden/garden-basket-hold.webp",
  "/ais-garden/garden-basket-walk-1.webp",
  "/ais-garden/garden-basket-walk-2.webp",
  "/ais-garden/garden-basket-walk-3.webp",
  "/ais-garden/garden-basket-walk-4.webp",
  "/ais-garden/garden-caterpillar.webp",
  "/ais-garden/garden-dig-1.webp",
  "/ais-garden/garden-dig-2.webp",
  "/ais-garden/garden-dig-3.webp",
  "/ais-garden/garden-dig-4.webp",
  "/ais-garden/garden-give-veg.webp",
  "/ais-garden/garden-look-sprout.webp",
  "/ais-garden/garden-pick-1.webp",
  "/ais-garden/garden-pick-2.webp",
  "/ais-garden/garden-pick-3.webp",
  "/ais-garden/garden-seed-1.webp",
  "/ais-garden/garden-seed-2.webp",
  "/ais-garden/garden-seed-3.webp",
  "/ais-garden/garden-smell-flower.webp",
  "/ais-garden/garden-splash-giggle.webp",
  "/ais-garden/garden-walk-1.webp",
  "/ais-garden/garden-walk-2.webp",
  "/ais-garden/garden-walk-3.webp",
  "/ais-garden/garden-walk-4.webp",
  "/ais-garden/garden-walk-5.webp",
  "/ais-garden/garden-walk-6.webp",
  "/ais-garden/garden-water-1.webp",
  "/ais-garden/garden-water-2.webp",
  "/ais-garden/garden-water-3.webp",
  "/ais-garden/garden-water-4.webp",
  "/ais-garden/garden-weed-1.webp",
  "/ais-garden/garden-weed-2.webp",
  "/ais-garden/garden-weed-3.webp",
  "/ais-garden/garden-wilt-worry.webp",
  "/ais-garden/garden-wipe-sweat.webp",
  "/ais-garden/idle-blink-1.webp",
  "/ais-garden/idle-blink-2.webp",
  "/ais-garden/yawn-stretch-1.webp",
  "/ais-garden/yawn-stretch-2.webp",
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
  "/babymo-companion/",
  "/babymo-companion/index.html",
  "/Logo_Baby_Mo_Transparant.webp",
  "/brand/babymo-logo.png",
  "/Baby_Mo_Menyapa.png",
  "/babymo_running.png",
  // Mo Companion reaction poses (precache the ones the kit picks from)
  "/baby-mo-poses/baby-mo-pose-01.webp",
  "/baby-mo-poses/baby-mo-pose-39.webp",
  "/baby-mo-poses/baby-mo-pose-02.webp",
  "/baby-mo-poses/baby-mo-pose-04.webp",
  "/baby-mo-poses/baby-mo-pose-06.webp",
  "/baby-mo-poses/baby-mo-pose-11.webp",
  "/baby-mo-poses/baby-mo-pose-13.webp",
  "/baby-mo-poses/baby-mo-pose-14.webp",
  "/baby-mo-poses/baby-mo-pose-16.webp",
  "/baby-mo-poses/baby-mo-pose-18.webp",
  "/baby-mo-poses/baby-mo-pose-20.webp",
  "/baby-mo-poses/baby-mo-pose-21.webp",
  "/baby-mo-poses/baby-mo-pose-23.webp",
  "/baby-mo-poses/baby-mo-pose-24.webp",
  "/baby-mo-poses/baby-mo-pose-25.webp",
  "/baby-mo-poses/baby-mo-pose-26.webp",
  "/baby-mo-poses/baby-mo-pose-28.webp",
  "/baby-mo-poses/baby-mo-pose-29.webp",
  "/baby-mo-poses/baby-mo-pose-30.webp",
  "/baby-mo-poses/baby-mo-pose-31.webp",
  "/baby-mo-poses/baby-mo-pose-32.webp",
  "/baby-mo-poses/baby-mo-pose-34.webp",
  "/baby-mo-poses/baby-mo-pose-35.webp",
  "/baby-mo-poses/baby-mo-pose-37.webp",
  "/baby-mo-poses/baby-mo-pose-41.webp",
  "/baby-mo-poses/baby-mo-pose-42.webp",
  "/baby-mo-poses/baby-mo-run.webp",
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
