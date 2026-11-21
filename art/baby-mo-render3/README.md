# Baby Mo — render 3 (motion-graphics set)

60 poses of Baby Mo for motion graphics and marketing animation (TikTok, Reels, Promo Studio).
Generated with ChatGPT on 21 Nov 2026 from three render-1 references (`www/baby-mo-poses/baby-mo-yes.png`,
`baby-mo-pose-01.png`, `baby-mo-pose-41.png`), 6 poses per sheet, then cut and background-removed by
`tools/cut-render3.py` (rembg, isnet-general-use).

- `mo3-NN-<set>-<n>-<name>.png` — transparent PNG, 512 × 512, same scale and baseline as its sheet cell
  (frames of one set line up for animation). A `.webp` copy sits next to each.
- `sheets/` — the 10 original sheets (flattened on grey; ChatGPT's own transparency was broken).
- `contact-sheet.jpg` — all 60 at a glance.
- Not in `www/`, so it is not shipped in the app.

| # | Set | Poses |
|---|---|---|
| 01 | talk (lip-sync) | smile, a, o, e, u, m |
| 02 | idle | eyes-open, eyes-half, eyes-closed, sway-1..3 |
| 03 | explain | palm, one, two, peace, present, idea |
| 04 | walk (side, facing right) | 1..6 |
| 05 | turn | front, three-quarter-right, side-right, back, side-left, three-quarter-left |
| 06 | tablet (magenta #FF00FF screen) | look, show, tap, wow, laugh, hug |
| 07 | phone & watch (magenta screens) | watch-look, watch-show, phone-look, phone-show, phone-up, phone-call |
| 08 | routine | stretch, yawn, dua, wash, read, pillow |
| 09 | hook | peek-left, pop-up, whisper, shh, jump, skid |
| 10 | end | salam, clap-open, clap-closed, star, wave-1, wave-2 |

Screens are flat magenta so real app footage can be keyed onto them.

Known gaps: no "three fingers" pose (03-3 and 03-4 are both two fingers); the idle sway (02-4..6) is very
slight; walk frames are not a perfect cycle (use 4–6 fps, or tween); 08-4 keeps only one water drop.
