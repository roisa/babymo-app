# Baby Mo — working notes for Claude

## Baby Mo art rules (from the owner, 12 Nov 2026)
1. **Render 1 first.** For screenshots, App Store banners, header art and anything new, use the
   original real-render series `www/baby-mo-poses/` (render 1) at the highest quality available
   (prefer the 800×800 `.png` over the 480 `.webp` for marketing images).
2. **Render 2 = upper body only.** The `www/baby-mo-render2/` poses have slightly different
   proportions (bigger head, different height), so when render 2 is used, show only the upper body
   (crop at the waist, or tuck the lower half behind a card/scenery) so Mo looks consistent next to
   render 1 and the family.
3. **Render 3 = motion-graphics set, marketing only.** `art/baby-mo-render3/` (60 poses, ChatGPT-made
   from render-1 references, 21 Nov 2026): talking mouths, blinks, walk, turnaround, tablet/phone/watch
   with magenta screens, daily routine, hooks, endings. Use it for animated marketing (TikTok, Reels,
   Promo Studio) as a set — don't mix render 3 and render 1 Mo in the same frame. Not for in-app art,
   App Store screenshots or banners (render 1 stays first there). Lives outside `www/`, so it never ships.
4. **Dreamtime frames = `www/mo-dream/`.** 30 in-app poses made with ChatGPT from render-1 references
   (22 Nov 2026; sheets in `art/mo-dream-sheets/`): brushing teeth (tools, brushing loops, rinse), the
   pajama states (day → top / trousers → full → nightcap → teddy), du'a and bed. The bed and sleep
   screen use the 23 Nov `mo-dream-night-{wave,yawn,sleep}` frames (sheet `6-bedtime.jpg`, upper body,
   the quilt covers the rest); the old `bed-*` frames were removed.
   **24 Nov 2026 (v5):** the owner's transparent sheets (`art/mo-dream-sheets/v5/`) replaced every frame
   except the brushing loop: files are now `mo-dream/mo5-<name>.webp` (tools, rinse, pj, dua, night);
   `mo-dream-brush-*` stay until a new brushing sheet arrives. Those PNGs carry a faint glow haze in the
   alpha — cut them with `tools/cut-mo-dream-v5.py`, never use them raw on a dark screen. Each set shares one
   stance and position so swapping frames reads as motion. Use them only in Dreamtime; elsewhere
   render 1 stays first.
5. **No old "good words" (Kata Baik) poses.** The old blurry Kata Baik Mo cutouts were removed
   (`baby-mo-dua-smile`, `babymo-companion/mo-assets/*`). Don't bring them back.

## Other standing rules
- Never depict Allah, prophets or angels. Arabic text must stay exact.
- Every user-facing string in Indonesian and English; dark mode must work.
- Kids Category: no third-party data; parental gate on external links and sharing.
- Twins: Baby Mo and Ais are the same height; Kak Adam a little taller; Abi/Umi adult height.
- Replaced art gets a new filename (or `?v=` bump) so phones refetch; bump `babymo-games-vNNN` in
  `www/sw.js` and add new assets to its SHELL list when shipping.
