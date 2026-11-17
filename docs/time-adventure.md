# Time Adventure (www/time-adventure/)

`www/time-adventure/` is a **build output**. Don't edit it by hand. The source
is the `roisa/moclock` repo (React + TypeScript + Vite).

To update it, run this in moclock:

```bash
npm run build:hub    # rebuilds and re-exports into ../babymo-app/www/time-adventure/
```

The export:

- replaces the folder
- copies `icons/games/time-adventure.svg`
- rewrites the block between `// time-adventure:start` and `// time-adventure:end`
  in `www/sw.js` and bumps `babymo-games-vNNN`

The game uses render-1 Mo first and shows render-2 art upper body only. Its
progress lives in IndexedDB `babymo-time` and localStorage `bmt_progress`. It
shares `bm_lang`, reads `mo_child_name`, and adds the stars it earns to
`bm_star_jar`.

The hub card is in `www/index.html` (search for `g_time`).
