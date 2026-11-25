# Meet Baby Mo — colouring page prompts (40 poses)

After the puzzle, Mo pops out and moves. Then the child can tap **🖍️ Warnai Mo** to colour **the same pose**.
Each page is Mo in that exact pose with a little scene that a 2–4 year old will enjoy colouring.

## How to make each page

1. Open ChatGPT (image generation) and **attach the reference picture** of the pose:
   `www/baby-mo-poses/baby-mo-<pose>.png` (800 × 800, render 1).
2. Paste the **style block** below, then the line for that pose.
3. Download the result and send it to Claude (or run
   `python3 tools/clean-coloring.py <file> <pose>`). The script makes it 1024 px, pure black on white, and closes
   tiny gaps so each shape fills with one tap. Then it adds the pose to `www/coloring/meet/pages.js`.
4. The "Warnai Mo" button shows up for that pose automatically.

One image per prompt gives the cleanest lines. If you'd rather batch them, ask for **4 pages in a 2×2 grid**,
each in its own square with a thick gap between them. Claude can cut the grid.

## Style block (paste before every pose line)

```
Black-and-white colouring page for a 2–4 year old, based on the attached character "Baby Mo".
Keep Baby Mo EXACTLY in the same pose as the reference picture: same body angle, arms, legs, head tilt and
facial expression. Keep his look: short spiky hair, big round eyes, round cheeks, a one-piece outfit
with a star on the chest, cuffs on the sleeves and a stripe at the waist, chunky shoes.
Style: clean thick black outlines (about 8 px at 1024 px), every shape fully closed, NO shading, NO grey,
NO hatching, NO filled black areas (hair is outlined only, with 2–3 simple strands), pure white background
(not transparent). Big simple shapes that are easy to colour with one tap, about 15–35 shapes in total.
Baby Mo is large and centred (about 60% of the picture height), feet near the bottom, with the extra
items around him and nothing overlapping his face. Square 1:1, 1024 × 1024 PNG.
No text, no letters, no numbers, no Arabic writing, no other people.
```

## The 40 poses

| # | Pose file | Mo's pose (in the game) | Scene to add (for colouring fun) |
|---|---|---|---|
| 1 | `alright` | winks, both hands pointing forward — "all set!" | a picnic: a picnic blanket under his feet, a basket with an apple and a banana, a smiling sun |
| 2 | `idea` | one finger up — "I have an idea!" | a big light bulb with a happy face above his finger, a stack of 3 picture books, a pencil |
| 3 | `ok` | OK sign with one hand, winking | a friendly snail with a swirly shell beside him, two big flowers and a mushroom |
| 4 | `pose-01` | waves hello, winking | a hot-air balloon in the sky with stripes, a little bird waving its wing back |
| 5 | `pose-02` | jumps for joy in the air | a rainbow with 4 wide bands behind him, 2 puffy clouds, a kite with a bow tail |
| 6 | `pose-04` | hands on hips, ready to play | a big striped beach ball and 3 toy blocks (cube, triangle, cylinder) at his feet |
| 7 | `pose-05` | hands together, making du'a | a crescent moon and 4 stars above, a hanging lantern, a prayer mat with a simple border pattern under his feet (no writing) |
| 8 | `pose-06` | sits and relaxes on the ground | sitting under a round tree, a sleeping cat curled beside him, a butterfly |
| 9 | `pose-07` | laughs happily, hands on cheeks | big soap bubbles floating around (5–6 circles), a rubber duck |
| 10 | `pose-08` | points over there with a big step | he points at a flower pot with 3 tulips, a small airplane in the sky |
| 11 | `pose-11` | jumps up high, knees tucked | jumping over a puddle with a big splash, a frog on a lily pad watching |
| 12 | `pose-12` | sits nicely, hands together | sitting on a round cushion, a cupcake with a star on top, a teddy bear sitting next to him |
| 13 | `pose-13` | sits and waves | sitting on grass waving at a toy train with 3 carriages and round wheels |
| 14 | `pose-14` | stands up tall | a sunflower as tall as him beside him, a little watering can, a ladybug on a leaf |
| 15 | `pose-15` | shows the way with one arm | a wavy path with stepping stones to a small mosque with a dome (no writing), a signpost with blank arrows |
| 16 | `pose-16` | cheeky wink, hand by his cheek | a bunny peeking from behind a bush, 2 carrots |
| 17 | `pose-18` | sits and thinks | big jigsaw pieces and simple shapes (circle, star, heart) floating around his head |
| 18 | `pose-20` | flies like a plane, arms out | 3 clouds, a paper airplane, 2 birds flying alongside |
| 19 | `pose-21` | says "cool!" | an ice-cream cone with 2 scoops, a sun wearing sunglasses |
| 20 | `pose-22` | waits for his turn | a playground slide behind him, a ball waiting on the ground |
| 21 | `pose-23` | kneels nicely | kneeling by a little garden: a seedling, a watering can, a smiling worm, 2 flowers |
| 22 | `pose-24` | gives a little wave | waving at a ladybug on a big leaf, a small fish bowl with a fish |
| 23 | `pose-25` | winks and says OK | a tall tower of toy blocks he just built, a star on top |
| 24 | `pose-26` | claps his hands | a drum, a tambourine and 4 big music notes |
| 25 | `pose-27` | all fired up, fists ready | a football (soccer ball) at his feet, a small goal net, 2 little flags |
| 26 | `pose-28` | listens carefully | a bird singing on a branch, music notes coming from its beak |
| 27 | `pose-29` | big smile, winking | 3 balloons tied together, a gift box with a big bow |
| 28 | `pose-30` | dances happily | maracas, music notes and confetti shapes (circles, stars, triangles) |
| 29 | `pose-31` | surprised: "wow!" | a toy rocket taking off with round windows and puffy smoke clouds |
| 30 | `pose-32` | steps out happily | a puppy walking along with him, a flower path |
| 31 | `pose-34` | bows to say hello | a friendly cat bowing back, a doormat and a round door behind them |
| 32 | `pose-35` | smiles sweetly | a heart-shaped balloon, a teddy bear, 3 small hearts |
| 33 | `pose-37` | feels a little shy | a kitten peeking out of a cardboard box, a ball of yarn |
| 34 | `pose-41` | opens his arms wide | a big rainbow arching over him, a giant teddy bear ready for a hug |
| 35 | `pose-42` | goes for a walk | a walk in the park: a round tree, a duckling following him, a bench |
| 36 | `run` | runs fast | running after a butterfly, a kite flying behind him |
| 37 | `thank-you` | hands together, says thank you | a flower bouquet and a gift box with a ribbon in front of him |
| 38 | `wow` | amazed: "wow!" | a shooting star, a crescent moon and big twinkle stars |
| 39 | `yes` | says "yes!", one arm up | a big star he reaches for, a tiny moon, 3 small stars |
| 40 | `yeyy` | cheers "yay!", one arm up | a finish-line flag, a big medal with a star, confetti shapes |

### Prompt to copy for each pose
`[style block]` + this sentence, with the row's details filled in:

> Baby Mo **[Mo's pose]** — exactly as in the attached picture. Around him: **[scene to add]**.

Example (row 7):
> Baby Mo is making du'a with his hands together — exactly as in the attached picture. Around him: a crescent
> moon and 4 stars above, a hanging lantern, and a prayer mat with a simple border pattern under his feet
> (no writing).

## Checklist before sending a page
- Mo's pose matches the reference (arms, legs, head tilt).
- Every shape is closed: no gaps in the lines, so colour can't leak.
- No grey, no shading, no solid black areas.
- No text or letters.
- Mo is big, with the extra items around him rather than on top of him.
