# Baby Ais — new poses wishlist (Kebun Kecil Ais and beyond)

> **Status:** all P1 and P2 frames are delivered and live in the game
> (`www/ais-garden/`, 360 px webp, feet on one baseline). Still open: the
> optional companions (`umi-receive-veg`, `mo-garden-run`) and full-body
> `yawn-stretch` frames (the current ones stop at the hips).

Baby Ais has 116 poses today, but every one is a **single still frame**. Kak Adam's
tennis moves come as 6-frame sequences (`adam-tennis-fh-1…6`), which is why his
swings look smooth. Ais can only *jump* from one pose to the next. The list below
adds short frame sequences for the garden game, plus a few "alive" frames that
every game can reuse.

## Art spec (so new frames drop straight into the games)

| | |
|---|---|
| Canvas | 800 × 800 px, transparent PNG (same as the current Ais poses) |
| Baseline | feet on **y = 725** in every frame, horizontally centred (x ≈ 400) |
| Size | standing Ais ≈ 600 px tall (top of hijab y ≈ 125); kneeling ≈ 500 px |
| Camera | the same ¾-front view and lighting as the existing renders |
| Outfit | the usual pink onesie + hijab. Optional garden set: straw sun hat (like `gardener-sapling`) and small green gloves — if used, use it in *every* garden frame |
| Facing | towards screen-right for side actions (the game mirrors her for the left) |
| Props | same scale in every frame of a sequence (trowel, watering can, basket) |
| Names | `baby-ais-<name>-1.png … -N.png`, e.g. `baby-ais-garden-water-1.png` |

Frames in a sequence should change **only** what moves (arm, can tilt, head),
so playback at 8–10 fps looks smooth.

## P1 — needed for smooth garden motion

| # | Name (frames) | What happens in each frame | Used for in the game |
|---|---|---|---|
| 1 | `garden-walk-1…6` | side-view walk cycle: contact, down, pass, up, contact, pass (opposite foot) | walking between garden beds (now she slides in the `run` pose) |
| 2 | `garden-dig-1…4` | kneeling: (1) trowel raised, (2) trowel into soil, (3) pulling soil back, (4) small heap beside her | "Gali" before planting (now: one `plant-trowel` frame) |
| 3 | `garden-seed-1…3` | kneeling: (1) pinch a seed from a seed packet, (2) drop it into the hole, (3) pat the soil flat with both hands | "Tanam benih" |
| 4 | `garden-water-1…4` | **standing** with watering can: (1) lift can, (2) tilt 30°, (3) tilt 60° with water stream, (4) back upright, smiling | "Siram" (now: one kneeling `watering-can` frame) |
| 5 | `garden-weed-1…3` | crouching: (1) grip a weed, (2) lean back tugging, (3) weed pops out, held up, proud | "Cabut rumput liar" |
| 6 | `garden-pick-1…3` | (1) reach towards a plant, (2) pick (hand closed), (3) hold produce up next to her face, delighted | "Panen" — produce is drawn by the game, so keep the hand open/empty in frame 3 or show a generic red fruit we can cover |
| 7 | `garden-basket-hold` + `garden-basket-walk-1…4` | hugging a woven basket full of vegetables; walking with it | harvest counter, carrying the harvest to share |
| 8 | `idle-blink-1…2` | standing relaxed, (1) eyes open, (2) eyes closed | idle "breathing" so she never looks frozen (every game) |

## P2 — makes the garden feel alive

| # | Name (frames) | What happens | Used for |
|---|---|---|---|
| 9 | `garden-look-sprout` | kneeling, hands on knees, leaning in to look at a tiny sprout, curious | a new sprout appears |
| 10 | `garden-smell-flower` | eyes closed, sniffing a flower held close, happy | sunflower blooms |
| 11 | `garden-caterpillar` | cupped hands, gently carrying a little caterpillar, kind smile | moving a caterpillar to a leaf instead of hurting it (adab to creatures) |
| 12 | `garden-wipe-sweat` | back of hand on forehead, squinting at the sun | hot sunny day |
| 13 | `garden-splash-giggle` | water splashes on her, giggling, eyes squeezed | a funny "oops" when watering twice |
| 14 | `garden-wilt-worry` | kneeling beside a droopy plant, worried hands at mouth | a plant that wasn't watered |
| 15 | `garden-give-veg` | holding out a vegetable with both hands, offering | sharing the harvest with family or neighbours |
| 16 | `celebrate-jump-1…4` | crouch → jump up → peak with arms up → land | every big win (any game) |
| 17 | `yawn-stretch-1…2` | evening yawn, arms stretching up | going to sleep to start the next day |

## Optional companions

| Name | What | Why |
|---|---|---|
| `umi-receive-veg` | Umi smiling, receiving a vegetable | the sharing scene |
| `mo-garden-run` | Mo running in with a watering can | a co-op moment with her twin |

## Until the new frames exist

The game uses the closest current poses (`plant-trowel`, `gardener-sapling`,
`watering-can`, `magnifier-leaf`, `rain-umbrella`, `eat-watermelon`,
`dua-hands-closed`, `sleep-pillow`, `wake-stretch`, `gift-box`, `run`,
`jump-joy`…) with small CSS motions (bob, dig, pour, tug, hop) in between.

## Adding the new frames

1. Export the PNGs with the names above.
2. Convert each to a 300 px webp in `www/ais-garden/`, dropping the `baby-ais-`
   prefix: `baby-ais-garden-water-1.png` → `www/ais-garden/garden-water-1.webp`.
3. In `www/babymo-kebun-ais.html`, edit the `POSES` table at the top of the
   script. Every line already names the frames it is waiting for, e.g.
   `water: { frames:["garden-water-1","garden-water-2","garden-water-3","garden-water-4"], fps:8 }`.
   Drop the `motion` once real frames are in, and set `faces:"right"` on `walk`.
4. Add the new files to `www/sw.js` and bump the cache version.
