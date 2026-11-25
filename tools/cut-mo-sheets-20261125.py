# Good Words + Forehand Beat poses (owner's transparent sheets, 25 Nov 2026, art/mo-sheets-20261125/).
# Same glow-haze alpha as the Dreamtime v5 sheets: hard-ish mask from alpha, drop haze and specks.
# Figures are not on a strict grid (rackets reach into neighbour cells), so each figure is found as a
# connected group, then framed on one square per sheet so Mo keeps the same size across a set.
import numpy as np, os, sys
from PIL import Image
from scipy import ndimage
SRC = 'art/mo-sheets-20261125/'; OUT = 'www/baby-mo-poses/'
SHEETS = {
  '1-goodwords-a': ['gw-quran', 'gw-hope', 'gw-tummy', 'gw-trust', 'gw-eid', 'gw-flowers'],
  '2-goodwords-b': ['gw-study', 'gw-stretch', 'gw-lantern', 'gw-welcome', 'gw-proud', 'gw-calm'],
  '3-fh-jump':     ['fh-crouch', 'fh-leap', 'fh-tuck', 'fh-hooray', 'fh-air', 'fh-land'],
  '4-fh-run':      ['fh-run1', 'fh-run2', 'fh-run3', 'fh-run4', 'fh-run5', 'fh-run6'],
  '5-fh-swing':    ['fh-ready', 'fh-back', 'fh-hit', 'fh-follow', 'fh-oops', 'fh-win'],
}
def clean(a):
    al = a[..., 3].astype(float)
    m = np.clip((al - 150) / 90, 0, 1)
    solid = m > .5
    m[ndimage.binary_fill_holes(solid) & (m < .5)] = 1
    return m
for sheet, names in SHEETS.items():
    rgba = np.array(Image.open(SRC + sheet + '.png').convert('RGBA'))
    m = clean(rgba); solid = m > .5
    if sheet.startswith(('1-', '2-')):                     # Good Words figures sit in a clean 3×2 grid
        grp = np.zeros(solid.shape, int)
        for i in range(6): grp[(i // 3) * 512:(i // 3 + 1) * 512, (i % 3) * 512:(i % 3 + 1) * 512] = i + 1
        k = 6
    else: grp, k = ndimage.label(ndimage.binary_dilation(solid, iterations=9))
    sz = ndimage.sum(solid, grp, range(1, k + 1))
    top6 = [int(i) + 1 for i in np.argsort(sz)[::-1][:6]]
    boxes = []
    for g in top6:
        ys, xs = np.nonzero(solid & (grp == g)); boxes.append((g, ys.min(), ys.max(), xs.min(), xs.max()))
    # reading order: rows (by vertical centre), then left → right
    boxes.sort(key=lambda b: ((b[1] + b[2]) / 2 > rgba.shape[0] / 2, (b[3] + b[4]) / 2))
    S = int(max(max(b[2] - b[1], b[4] - b[3]) for b in boxes) * 1.08)   # one frame size per sheet
    for (g, y0, y1, x0, x1), n in zip(boxes, names):
        keep = solid & (grp == g)
        lab, kk = ndimage.label(keep); s2 = ndimage.sum(keep, lab, range(1, kk + 1)); main = int(np.argmax(s2)) + 1
        gy, gx = np.nonzero(grp == g); gy0, gy1 = gy.min(), gy.max()
        ok = []
        for j in range(1, kk + 1):
            if s2[j - 1] < max(150, s2.max() * .002): continue
            ys, xs = np.nonzero(lab == j)
            if j != main and (ys.min() <= gy0 + 1 or ys.max() >= gy1 - 1): continue   # a neighbour's hair/feet at the cell edge
            ok.append(j)
        keep = np.isin(lab, ok)
        ys, xs = np.nonzero(keep); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
        mask = m * ndimage.binary_dilation(keep, iterations=2)
        out = rgba.copy(); out[..., 3] = (mask * 255).astype(np.uint8)
        cx = (x0 + x1) // 2; foot = y1
        big = np.zeros((rgba.shape[0] + 2 * S, rgba.shape[1] + 2 * S, 4), np.uint8); big[S:S + rgba.shape[0], S:S + rgba.shape[1]] = out
        L = cx + S - S // 2; T = foot + S - int(S * .96)          # feet near the bottom, figure centred
        crop = Image.fromarray(big[T:T + S, L:L + S])
        crop.resize((800, 800), Image.LANCZOS).save(OUT + 'baby-mo-' + n + '.png', optimize=True)
        crop.resize((480, 480), Image.LANCZOS).save(OUT + 'baby-mo-' + n + '.webp', quality=88, method=6)
        print(sheet, n, (x0, y0, x1, y1), S)
