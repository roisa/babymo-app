# Split ChatGPT colouring sheets (1, 2 or 4 framed panels) into one page per pose, frame removed.
#   python3 tools/split-coloring-sheets.py <out-dir> <sheet.png> <cols>x<rows> <pose1,pose2,...> [<sheet> <grid> <poses> ...]
# Each panel is written to <out-dir>/<pose>.png (still to be cleaned by tools/clean-coloring.py).
import sys, os, numpy as np
from PIL import Image

def gutter(dark, axis, lo, hi):
    """the white gap between two panels: midway between the two frame lines near the middle
    (falls back to the whitest line when no frame lines are found)"""
    prof = dark.mean(axis=axis)
    fr = [i for i in range(lo, hi) if prof[i] > .5]
    if fr:
        groups, g = [], [fr[0]]
        for i in fr[1:]:
            if i - g[-1] <= 3: g.append(i)
            else: groups.append(g); g = [i]
        groups.append(g)
        if len(groups) >= 2:
            mid = (lo + hi) / 2
            groups.sort(key=lambda g: abs((g[0] + g[-1]) / 2 - mid))
            a, b = sorted(groups[:2], key=lambda g: g[0])
            return (a[-1] + b[0]) // 2
    p = prof[lo:hi]
    return lo + int(np.argmin(np.convolve(p, np.ones(7) / 7, 'same')))

def strip_frame(a):
    """crop just inside a rounded-rectangle frame, if the panel has one"""
    d = a < 128; h, w = d.shape
    def inner(prof, n, rev):
        idx = range(n - 1, -1, -1) if rev else range(n)
        seen = False
        for k, i in enumerate(idx):
            if k > n * .12: break
            if prof[i] > .55: seen = True
            elif seen: return i                 # first light line after the frame line
        return None
    cols, rows = d.mean(0), d.mean(1)
    l, r, t, b = inner(cols, w, False), inner(cols, w, True), inner(rows, h, False), inner(rows, h, True)
    if None in (l, r, t, b): return a
    m = max(8, int(min(h, w) * .02))         # step past the frame's rounded corners
    return a[t + m:b - m + 1, l + m:r - m + 1]

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
args = sys.argv[2:]
for i in range(0, len(args), 3):
    src, grid, poses = args[i], args[i + 1], args[i + 2].split(',')
    c, r = map(int, grid.split('x'))
    im = Image.open(src).convert('RGBA'); bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    a = np.array(bg.convert('L')); H, W = a.shape; d = a < 128
    xs = [0] + [gutter(d, 0, int(W * (k / c - .15)), int(W * (k / c + .15))) for k in range(1, c)] + [W]
    ys = [0] + [gutter(d, 1, int(H * (k / r - .15)), int(H * (k / r + .15))) for k in range(1, r)] + [H]
    n = 0
    for yi in range(r):
        for xi in range(c):
            p = poses[n]; n += 1
            if p == '-': continue
            cell = strip_frame(a[ys[yi]:ys[yi + 1], xs[xi]:xs[xi + 1]])
            Image.fromarray(cell).save(os.path.join(out, p + '.png'))
            print(os.path.basename(src), p, cell.shape)
