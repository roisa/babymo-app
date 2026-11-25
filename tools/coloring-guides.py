# Coloured versions of the Meet Baby Mo colouring pages → www/coloring/meet/<pose>-color.webp (for the 🪄 magic crayon).
#   python3 tools/coloring-guides.py <sheet.png> <cols>x<rows> <pose1,pose2,...> [<sheet> <grid> <poses> ...]
# ChatGPT redraws a little when it colours, so each panel is split like the line art (tools/split-coloring-sheets.py),
# framed like it (tools/clean-coloring.py) and then lined up with the page by a scale + shift search that makes
# the coloured version's dark outlines fall on the page's lines. "-" skips a panel.
import sys, numpy as np, importlib.util
from PIL import Image
from scipy import ndimage
spec = importlib.util.spec_from_file_location('split', __file__.replace('coloring-guides.py', 'split-coloring-sheets.py'))
src = open(spec.origin).read(); src = src[:src.index('out = sys.argv[1]')]       # only the helpers
ns = {}; exec(compile(src, spec.origin, 'exec'), ns); gutter, frame_box = ns['gutter'], ns['frame_box']
S = 1024

def frame(rgb):                                   # same framing as clean-coloring.py
    h, w = rgb.shape[:2]; k = S * .94 / max(h, w)
    im = Image.fromarray(rgb).resize((int(w * k), int(h * k)), Image.LANCZOS)
    c = Image.new('RGB', (S, S), (255, 255, 255)); c.paste(im, ((S - im.width) // 2, (S - im.height) // 2)); return c

def warp(img, sx, dx, dy, sy=None):
    sy = sx if sy is None else sy
    im = img.resize((int(S * sx), int(S * sy)), Image.LANCZOS)
    c = Image.new('RGB', (S, S), (255, 255, 255)); c.paste(im, ((S - im.width) // 2 + dx, (S - im.height) // 2 + dy)); return c

def outline(img, n):
    """near-black pixels only (a dark night sky is not an outline)"""
    a = np.array(img.resize((n, n), Image.LANCZOS)).max(2); return a < 75

def score(G, P, dx, dy):
    g = np.roll(np.roll(G, dy, 0), dx, 1); return (g & P).sum() / max(1, g.sum())

def align(guide, page):
    """coarse-to-fine search of x/y scale + shift so the guide's outlines sit on the page's lines"""
    best = (-1, 1, 1, 0, 0)
    for q, scales, sh, around in ((8, np.arange(.8, 1.201, .03), 18, None), (4, None, 4, True), (2, None, 3, True)):
        n = S // q; P = ndimage.binary_dilation(np.array(page.resize((n, n)).convert('L')) < 128, iterations=1)
        if around:
            _, bx, by, bdx, bdy = best; st = .03 if q == 4 else .012
            cand = [(bx + i * st / 2, by + j * st / 2) for i in (-2, -1, 0, 1, 2) for j in (-2, -1, 0, 1, 2)]
            cx, cy = bdx // q, bdy // q
        else: cand = [(s, s) for s in scales]; cx = cy = 0
        res = best
        for sx, sy in cand:
            G = outline(warp(guide, sx, 0, 0, sy), n)
            for dy in range(cy - sh, cy + sh + 1):
                for dx in range(cx - sh, cx + sh + 1):
                    v = score(G, P, dx, dy)
                    if v > res[0]: res = (v, sx, sy, dx * q, dy * q)
        best = res
    return best

args = sys.argv[1:]
for i in range(0, len(args), 3):
    path, grid, poses = args[i], args[i + 1], args[i + 2].split(',')
    c, r = map(int, grid.split('x'))
    im = Image.open(path).convert('RGBA'); bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    rgb = np.array(bg.convert('RGB')); a = np.array(bg.convert('L')); H, W = a.shape; d = a < 60
    xs = [0] + [gutter(d, 0, int(W * (k / c - .15)), int(W * (k / c + .15))) for k in range(1, c)] + [W]
    ys = [0] + [gutter(d, 1, int(H * (k / r - .15)), int(H * (k / r + .15))) for k in range(1, r)] + [H]
    n = 0
    for yi in range(r):
        for xi in range(c):
            p = poses[n]; n += 1
            if p == '-': continue
            cell_l = a[ys[yi]:ys[yi + 1], xs[xi]:xs[xi + 1]]
            y0, y1, x0, x1 = frame_box(np.where(cell_l < 60, 0, 255).astype(np.uint8))
            panel = rgb[ys[yi]:ys[yi + 1], xs[xi]:xs[xi + 1]][y0:y1, x0:x1]
            g = frame(panel)
            page = Image.open(f'www/coloring/meet/{p}.png').convert('RGB')
            sc, sx, sy, dx, dy = align(g, page)
            warp(g, sx, dx, dy, sy).resize((768, 768), Image.LANCZOS).save(f'www/coloring/meet/{p}-color.webp', quality=82, method=6)
            print(p, 'match %.2f' % sc, 'scale %.2f %.2f' % (sx, sy), 'shift', dx, dy)
