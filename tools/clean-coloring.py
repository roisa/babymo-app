# Clean a generated colouring page for the Meet Baby Mo colouring screen (www/mo-color.js).
#   python3 tools/clean-coloring.py <input.png|jpg> <pose-name>
# → www/coloring/meet/<pose-name>.png : 1024×1024, pure black lines on pure white, small line gaps closed,
#   specks removed, so every shape fills cleanly with one tap. Then add <pose-name> to www/coloring/meet/pages.js.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src, pose = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
g = np.array(bg.convert('L')).astype(float)
S = 1024; h, w = g.shape; k = S * .94 / max(h, w)               # keep a small white margin
g = np.array(Image.fromarray(g.astype(np.uint8)).resize((int(w * k), int(h * k)), Image.LANCZOS)).astype(float)
canvas = np.full((S, S), 255.0); y0, x0 = (S - g.shape[0]) // 2, (S - g.shape[1]) // 2
canvas[y0:y0 + g.shape[0], x0:x0 + g.shape[1]] = g
line = canvas < 150
line = ndimage.binary_closing(line, iterations=2)                 # close hairline gaps
lab, n = ndimage.label(line); sz = ndimage.sum(line, lab, range(1, n + 1))
line = np.isin(lab, [i + 1 for i, v in enumerate(sz) if v >= 60]) # drop specks
out = np.where(line, 0, 255).astype(np.uint8)
Image.fromarray(out).save(f'www/coloring/meet/{pose}.png', optimize=True)
regions = ndimage.label(~line)[1]
print(pose, 'regions:', regions, '(aim for ~12–40; more is fiddly for a 2-year-old)')
