# Baby Mo — working notes for Claude

## Baby Mo art rules (from the owner, 12 Nov 2026)
1. **Render 1 first.** For screenshots, App Store banners, header art and anything new, use the
   original real-render series `www/baby-mo-poses/` (render 1) at the highest quality available
   (prefer the 800×800 `.png` over the 480 `.webp` for marketing images).
2. **Render 2 = upper body only.** The `www/baby-mo-render2/` poses have slightly different
   proportions (bigger head, different height), so when render 2 is used, show only the upper body
   (crop at the waist, or tuck the lower half behind a card/scenery) so Mo looks consistent next to
   render 1 and the family.
3. **No old "good words" (Kata Baik) poses.** The old blurry Kata Baik Mo cutouts were removed
   (`baby-mo-dua-smile`, `babymo-companion/mo-assets/*`). Don't bring them back.

## Other standing rules
- Never depict Allah, prophets or angels. Arabic text must stay exact.
- Every user-facing string in Indonesian and English; dark mode must work.
- Kids Category: no third-party data; parental gate on external links and sharing.
- Twins: Baby Mo and Ais are the same height; Kak Adam a little taller; Abi/Umi adult height.
- Replaced art gets a new filename (or `?v=` bump) so phones refetch; bump `babymo-games-vNNN` in
  `www/sw.js` and add new assets to its SHELL list when shipping.
