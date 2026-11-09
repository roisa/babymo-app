# BabyMo.daily: daily missions, streak and "of the day" helpers

The retention layer that all games share. It lives in `www/bm-kit.js`, so it is
available on every page that loads the kit (`<script src="/bm-kit.js" defer>`).

- **Local dates only.** Days are `'YYYY-MM-DD'` in the device's time zone, and
  midnight is local midnight.
- **Offline.** There are no network calls.
- **Safe.** Every method is wrapped in try/catch. Corrupt JSON in storage is
  replaced with a fresh state. Blocked storage (private mode) falls back to an
  in-memory copy for the session.
- **Guard your calls.** The kit loads with `defer`, so guard every call:
  `try{ window.BabyMo&&BabyMo.daily&&BabyMo.daily.mark('my-game','done'); }catch(e){}`

## API

| Call | Returns | Notes |
|---|---|---|
| `daily.today()` | `'2026-11-09'` | Local date. |
| `daily.shift(dateStr, n)` | `'YYYY-MM-DD'` | Moves a date by `n` local days. DST-safe. |
| `daily.mark(gameId, taskId)` | `true` if this activity is new today | Records the activity. If it completes one of today's missions, it adds +1 ⭐ to the jar. When all 3 are done it adds +2 ⭐ bonus. It shows the in-game banner ("Misi selesai! 2/3") and extends the streak. Call it at natural completion points; repeated calls are fine. |
| `daily.did(gameId, taskId?)` | boolean | Has this activity happened today? If `taskId` is omitted, any task of the game counts. |
| `daily.log(dateStr?)` | `[{gameId, taskId, count}]` | Activity for one day (default today). Up to 60 days are kept. |
| `daily.missions(dateStr?)` | `[{id, cat, gameId, taskId, tasks, url, icon, art, text:{id,en}, game:{id,en}, done}]` × 3 | Today's missions (or any other day's, computed purely). Today's list is stored on first use, so it never changes mid-day. |
| `daily.progress()` | `{done, total, allDone}` | For today. |
| `daily.streak()` | `{count, best, todayDone}` | App-wide streak. A day counts when at least 1 mission is completed. `count` stays alive while the last counted day is today or yesterday; otherwise it reads 0. `best` is the record. |
| `daily.reward(gameId, key, n)` | `true` if stars were added | Adds `n` ⭐ at most once per `key` per day. Use it to stop star farming, e.g. `reward('memory-match','win-'+mode,1)`. |
| `daily.seed(str?)` | `fn() → [0,1)` | Seeded RNG (FNV-1a hash → mulberry32). The default seed is today's date, so the same string always gives the same sequence. |
| `daily.pick(arr, salt, dateStr?)` | one item | Deterministic "X of the day". Example: `daily.pick(WORDS,'kata-islam-word')`. Use a unique `salt` per feature so features don't line up. |
| `daily.registry()` | copy of the mission registry | |
| `daily.rewards` | `{mission:1, bonus:2}` | Star amounts. |

**Event:** every `mark()` dispatches `window` event `bm-daily` with
`detail = {type:'mark', gameId, taskId, isNew, missions:[ids newly completed], done, bonus}`.
The hub listens to this event. It also re-renders on `pageshow` and `visibilitychange`.

## Missions

Each day `choose(date)` picks **one mission per category**: `ibadah` (worship & du'a),
`learn`, and `play`. Each category is a date-seeded *shuffle bag*. Over a cycle of N days
(N = number of missions in the category) every mission appears exactly once. The
same mission never appears two days in a row, including across cycle boundaries.

Registry (`MISSIONS` in bm-kit.js):

| id | cat | gameId | completes on taskId | page |
|---|---|---|---|---|
| doa-read | ibadah | doa-harian | `read` | babymo-doa-harian.html |
| pray-practice | ibadah | pray-with-mo | `practice` | babymo-pray-with-mo.html |
| pray-dzikir | ibadah | pray-with-mo | `dzikir` | babymo-pray-with-mo.html?view=dzikir |
| wudhu | ibadah | wudhu | `guide`, `order` | babymo-wudhu.html |
| dua-match | ibadah | dua-game | `level` | babymo-dua-game.html |
| dream-sleep | ibadah | dreamtime | `sleep` | babymo-dreamtime.html |
| kata-word | learn | arabic-spelling | `word`, `section` | babymo-arabic-spelling.html |
| huruf | learn | hijaiyah-classic | `lesson`, `trace`, `catch` | babymo-hijaiyah-classic.html |
| kata-baik | learn | puzzle-katabaik | `phrase` | babymo-puzzle-katabaik.html |
| memory | play | memory-match | `win` | babymo-memory-match.html |
| find-mo | play | look-and-find | `room` | babymo-look-and-find.html |
| puzzle | play | puzzle | `finish` | babymo-puzzle.html |
| hewan-care | play | sahabat-hewan | `care` | babymo-sahabat-hewan.html |
| kebun-water | play | kebun-ais | `water`, `harvest` | babymo-kebun-ais.html |
| beat-run | play | forehand-beat | `run` | baby-mo-forehand-beat.html |

### Adding a mission (later batches)

1. Add a `daily.mark(gameId, taskId)` call at the completion point in the game.
2. Append an entry to `MISSIONS`: `id`, `cat`, `gameId`, and `task`, which can be a
   string, an array, or `"*"` for any task of that game. Also add `url`, `icon`
   (emoji), `art` (the base name of `/icons/games/<art>.svg`), `text:{id,en}` and
   `game:{id,en}`.
3. Only register missions whose `mark()` is wired. Otherwise the mission can never
   be completed.

Changing the registry reshuffles **future** days. Today's 3 missions stay the same
because they are stored. Never reuse an `id` for a different mission.

## Wired completion points (marks)

| gameId | taskId | where |
|---|---|---|
| doa-harian | read | `earn()`, after a du'a has been read along |
| pray-with-mo | practice | `finishGuide()`, once every step has been viewed |
| pray-with-mo | dzikir | `tasbihTap()`, when a dhikr count is reached |
| wudhu | guide / order | `next()` on the last step / `orderDone()` |
| arabic-spelling | word / section | `onWordComplete()` / `showCompletion()` |
| dua-game | level | `showComplete()` |
| memory-match | win | `showWin()` |
| look-and-find | room | `showComplete()` |
| puzzle | finish | `onComplete()` |
| puzzle-katabaik | phrase | `showCelebration()` |
| dreamtime | sleep | `startSleep()` (the sleep screen) |
| sahabat-hewan | care / sleep | end of a successful care action in `doTool()` / `sleep()` |
| kebun-ais | water / harvest | `doTool()` water and harvest branches |
| hijaiyah-classic | lesson / trace / catch | `finishLesson()` / trace `win()` / `endTk()` with ≥3 letters caught |
| forehand-beat | run | `gameOver()` |

Star jar (`reward()`, once per key per day) is wired into wudhu (`guide`,
`order-<level>`), arabic-spelling (`section-<id>`), dua-game (`level-<n>`),
memory-match (`win-<mode>`), look-and-find (`room-<id>`) and puzzle (`finish`).
puzzle-katabaik gives +1 for a phrase that has never been collected before, and
otherwise at most +1 a day. Note that the kit's `watchWin()` also drops +1 ⭐ when a
known win screen first appears on a page; that behaviour existed before this change.

## Storage

- `bm_daily_v1`: the main daily state.
  ```json
  {"v":1,
   "days":{"2026-11-09":{"acts":{"wudhu:guide":1},"ms":["wudhu","kata-word","puzzle"],
                          "done":["wudhu"],"bonus":1,"rw":{"wudhu:guide":1}}},
   "streak":{"count":3,"best":5,"last":"2026-11-09"}}
  ```
  `acts` holds activity counts and `ms` holds today's mission ids. `done` lists the
  missions that have already been rewarded. `bonus` is set once the 3/3 bonus has
  been paid, and `rw` records `reward()` keys. Only the last 60 days are kept.
- The stars themselves stay in the existing `bm_star_jar`.
- The hub also keeps two flags:
  - `bm_daily_seen` (`date|ids`): checks already shown, so only newly completed
    missions get the pop animation.
  - `bm_daily_cele` (date): confetti for 3/3 plays only once per day.

## Hub card

`index.html` shows a **"Misi Hari Ini" / "Today's Missions"** card under the
greeting. It has:

- the date and a status line;
- the 🔥 streak badge (dimmed until today's first mission is done);
- a 3-segment progress bar;
- 3 tappable rows (≥56px tall) that open the game;
- a gold all-done banner, with confetti once per day.

The CSS lives in `<style id="bm-daily-hub">`, which is **not** a `bm-bright` block, so
both themes always apply. Dark styles use `html[data-theme="dark"]`. The title uses
the hub's `I18N.dm_title`; the dynamic strings live in the card script's own ID/EN
table.

## Testing tip

To simulate days, override `Date` before any page script runs (Playwright
`addInitScript`). Wrap `Date` so that `new Date()` and `Date.now()` are shifted to
the target day. Carry `storageState` from one day's browser context to the next.
