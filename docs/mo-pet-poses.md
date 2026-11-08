# Baby Mo — poses for the pet & farm game ("Sahabat Hewan Mo")

The game: Baby Mo looks after his kitten and, day by day, a small family farm.
He feeds, gives water, brushes, cleans the pen, plays, collects eggs, shares
with neighbours, and learns how Islam teaches us to treat animals (see the
"Adab" list at the end — every moment in the game is tied to one of them).

The **animals are drawn by the game** (`www/farm/farm-kit.js`), so Mo's frames
show only Mo and the tool he holds. Leave the space where the animal goes
empty (marked **ANIMAL ZONE** below) so the game can put any animal there.

## Art spec (same as the Baby Ais garden frames)

| | |
|---|---|
| Canvas | 800 × 800 px, transparent PNG |
| Baseline | feet (or knees when kneeling) on **y = 725**, body centred at x ≈ 330 |
| Size | standing Mo ≈ 600 px tall (top of hair y ≈ 125); kneeling ≈ 470 px; crouching ≈ 430 px |
| Camera | the same ¾-front view and lighting as the current Baby Mo renders |
| Facing | **towards screen-right**, where the animal stands (the game mirrors him for the left) |
| ANIMAL ZONE | x 470–790, y 420–725 (ground level, right of Mo). Hands that touch an animal reach into this zone at the heights given per pose |
| Outfit | the usual Baby Mo outfit. Optional farm set: small straw hat + green boots — if used, use it in **every** farm frame |
| Props | same scale in every frame of a sequence (bowl, bucket, brush, broom, basket) |
| Names | `baby-mo-<name>-1.png … -N.png`, e.g. `baby-mo-feed-1.png` |
| Labels | no text, arrows or labels on the image — the game adds its own text in ID/EN |

Frames in a sequence should change **only** what moves (arms, tool, head,
body lean) so playback at 8–10 fps looks smooth. Keep the feet planted in
every frame except the walk, jump and throw sequences.

---

## P1 — core care loop (needed to build the game)

### 1. `idle-blink-1…2` · standing, alive
| Frame | Pose |
|---|---|
| 1 | standing relaxed, arms loose, soft smile, eyes **open** |
| 2 | identical, eyes **closed** (blink) |

### 2. `walk-1…6` · walking between animals (side ¾ view)
| Frame | Pose |
|---|---|
| 1 | **contact** — front (right) heel touches the ground, back leg straight, opposite arm forward |
| 2 | **down** — weight drops onto the front leg, knee bends, body lowest |
| 3 | **pass** — back leg swings past the standing leg, body rising |
| 4 | **up** — standing leg straight, body highest, swinging foot lifted |
| 5 | **contact** — the other heel touches down (mirror of frame 1) |
| 6 | **pass** — the other leg swings through (mirror of frame 3) |

### 3. `feed-1…4` · feeding with "Bismillah"
Props: a small cloth sack of feed (left hand) + a scoop (right hand), a bowl on the ground in the ANIMAL ZONE edge (x ≈ 520).
| Frame | Pose |
|---|---|
| 1 | standing, holding the scoop up with food in it, looking at it, mouth open saying "Bismillah" |
| 2 | bending forward, scoop above the bowl, starting to tip |
| 3 | scoop tipped, food pouring into the bowl (a few grains in the air) |
| 4 | standing back up, scoop lowered, happy smile looking at the animal |

### 4. `water-1…4` · giving water
Props: a small bucket with water, a trough/bowl at x ≈ 540.
| Frame | Pose |
|---|---|
| 1 | carrying the bucket with both hands in front of the tummy, leaning back a little (it is heavy) |
| 2 | bucket lifted over the trough, tilting 30° |
| 3 | bucket tilted 70°, water stream splashing into the trough |
| 4 | bucket upright and lowered, wiping forehead with the back of the free hand, proud smile |

### 5. `pet-1…3` · stroking an animal gently
Crouching. Animal head will be at about **(560, 560)**.
| Frame | Pose |
|---|---|
| 1 | crouching, right hand open reaching towards the ANIMAL ZONE (hand at x ≈ 540, y ≈ 560), gentle face |
| 2 | hand resting on the animal (flat, palm down, same place), eyes half-closed, soft smile |
| 3 | hand moved a bit further back (stroke along the back, x ≈ 600, y ≈ 590), big smile, little heart above the head |

### 6. `brush-1…4` · brushing fur
Props: a small wooden brush. Animal back at y ≈ 600.
| Frame | Pose |
|---|---|
| 1 | standing beside the ANIMAL ZONE, brush held up, looking at it |
| 2 | brush pressed on the animal's back, arm forward (x ≈ 560) |
| 3 | brush pulled back along the back (x ≈ 650), elbow bent |
| 4 | holding the brush up, a tuft of fur on it, giggling (fur colour neutral cream so it fits any animal) |

### 7. `sweep-1…4` · cleaning the pen
Props: a child-size broom, a dustpan.
| Frame | Pose |
|---|---|
| 1 | holding the broom with both hands, bristles on the ground to the left |
| 2 | sweep to the right, small dust puff |
| 3 | crouching, sweeping into the dustpan |
| 4 | standing, broom upright like a flag, proud "clean!" face, sparkles |

### 8. `egg-1…3` · collecting an egg
Crouching. Nest at **(560, 640)**.
| Frame | Pose |
|---|---|
| 1 | crouching, peeking into the nest, both hands on knees, curious |
| 2 | one hand gently lifting an egg out of the nest (egg at x ≈ 560, y ≈ 600) |
| 3 | standing, holding the egg up near his face with both hands, delighted (egg must be easy to cover — plain white) |

### 9. `hay-1…3` · carrying hay
Props: an armful of hay.
| Frame | Pose |
|---|---|
| 1 | hugging a big bundle of hay, leaning back, cheeks puffed |
| 2 | throwing it forward into the feeder (hay leaving his arms, x ≈ 560) |
| 3 | dusting off his hands, bits of hay on his clothes, laughing |

### 10. `celebrate-jump-1…4` · every big win
| Frame | Pose |
|---|---|
| 1 | crouch, fists by the chest, excited |
| 2 | pushing off, rising |
| 3 | peak of the jump, both arms up, eyes closed with joy |
| 4 | landing, knees bent, fists pumping |

---

## P2 — pet play & feelings (makes it feel alive)

### 11. `play-ball-1…4` · throwing a ball for the kitten
| Frame | Pose |
|---|---|
| 1 | holding a small ball behind his head, winding up |
| 2 | arm forward, ball just leaving the hand (ball at x ≈ 600, y ≈ 380) |
| 3 | arm down, leaning forward, watching where it goes |
| 4 | clapping, laughing |

### 12. `feather-1…2` · playing with a feather wand
| Frame | Pose |
|---|---|
| 1 | standing, wand held out low to the right, feather at (620, 640) |
| 2 | wand flicked up, feather at (640, 520), excited face |

### 13. `cuddle` · holding the kitten
Hugging an **empty** space at his chest with both arms (the game puts the kitten there, chest area x 260–420, y 380–520), cheek tilted to it, eyes closed, happy.

### 14. `carry-chick` · cupped hands
Crouching, both hands cupped in front at (520, 560), looking at them tenderly (the game draws the chick in his hands).

### 15. `give-carrot-1…2` · feeding the rabbit by hand
| Frame | Pose |
|---|---|
| 1 | crouching, holding a carrot out low (carrot tip at 560, 620), still |
| 2 | same, the carrot slightly shorter (bitten), giggling |

### 16. `bath-1…4` · bathing the kitten / washing an animal
Props: a sponge, a small jug.
| Frame | Pose |
|---|---|
| 1 | kneeling, sponge in hand, bubbles on it |
| 2 | scrubbing in the ANIMAL ZONE (sponge at 560, 600), bubbles flying |
| 3 | pouring water from the jug to rinse (stream at 580) |
| 4 | holding a small towel open, ready to dry, smiling |

### 17. `worry` · an animal is hungry, thirsty or unwell
Crouching, both hands near his mouth, eyebrows up, looking into the ANIMAL ZONE.

### 18. `call` · calling Abi for help
Standing, one hand cupped by the mouth, calling to the left (away from the animal), other hand pointing to the animal.

### 19. `shade` · resting in the shade
Sitting on the ground, legs out, leaning back on his hands, relaxed smile (the game draws a tree and the kitten beside him).

### 20. `share-basket-1…2` · sharing eggs/milk (sedekah)
| Frame | Pose |
|---|---|
| 1 | standing, holding a small basket in both hands |
| 2 | holding the basket out forward to the right with both hands, kind smile |

### 21. `dua` · thanking Allah
Standing, both hands raised in du'a, eyes closed, calm smile (used at the end of each day: "Alhamdulillah").

### 22. `yawn-stretch-1…2` · end of the day (full body please)
| Frame | Pose |
|---|---|
| 1 | standing, yawning, one hand over the mouth, eyes closed, small "zzz" |
| 2 | stretching both arms up high on tiptoe, mouth open in a big yawn |

### 23. `wave` · greeting animals in the morning
Standing, right arm waving high, big smile, mouth open "Assalamu'alaikum!"

---

## Optional companions

| Name | What | Why |
|---|---|---|
| `abi-milk-cow` | Abi kneeling on a stool milking (cow drawn by the game at right) | milk moment — Mo carries the bucket after |
| `abi-check-animal` | Abi crouching, looking at an animal's leg kindly | the "animal is unwell" moment |
| `umi-receive-eggs` | Umi smiling, taking a basket with both hands | sharing scene |
| `ais-chicks` | Ais sitting with chicks around her, laughing | a visit from his twin |

---

## How the game uses them (preview of the design)

| Moment | Mo frames | Animal state (farm kit) |
|---|---|---|
| Morning greeting | `wave` | animals wake (`sleep` → `idle`) |
| Feed (with Bismillah) | `feed-1…4` | `hungry` → `eat` → `happy` |
| Water | `water-1…4` | `thirsty` → `eat` → `happy` |
| Stroke | `pet-1…3` | `happy` + hearts |
| Brush / bath | `brush-1…4`, `bath-1…4` | `dirty` → clean + sparkle |
| Clean the pen | `sweep-1…4` | pen mess disappears |
| Collect eggs / wool / milk | `egg-1…3`, `hay-1…3` | product appears |
| Share | `share-basket-1…2` | — |
| Kitten play | `play-ball-1…4`, `feather-1…2`, `cuddle` | kitten `walk`, `happy` |
| Animal unwell | `worry`, `call` (+ `abi-check-animal`) | `sad` |
| Evening | `dua`, `yawn-stretch-1…2` | `sleep` |

## Adab terhadap hewan — the lessons in the game

Told in words only (no depictions of the Prophet ﷺ or other prophets).

1. **Every kindness to an animal is rewarded** — "Pada setiap makhluk yang bernyawa ada pahala." (HR. Bukhari & Muslim)
2. **Water for the thirsty** — the story of a man who gave water to a thirsty dog with his shoe, and Allah forgave him. (HR. Bukhari)
3. **Feed them and don't leave them hungry** — never lock an animal away without food and water. (HR. Bukhari & Muslim)
4. **Don't burden them** — give rest and shade; don't make them carry more than they can. (HR. Abu Dawud)
5. **Don't separate a mother from her babies** — the mother bird whose chicks were taken: "Return her chicks to her." (HR. Abu Dawud)
6. **Gentle hands** — no hitting, no chasing, no pulling tails; Allah loves gentleness in everything. (HR. Muslim)
7. **Animals are communities like us** — "Tidak ada seekor binatang pun di bumi … melainkan umat-umat seperti kamu." (QS. Al-An'am: 38)
8. **Allah's gifts through animals** — warmth, milk and food (QS. An-Nahl: 5, 66) → we say **Bismillah** and **Alhamdulillah**, and we share.
9. **Clean pens** — cleanliness is part of faith, for us and for the animals we look after.
10. **Love cats** — the companion Abu Hurairah was named "the father of the little cat" because he loved and cared for one.
