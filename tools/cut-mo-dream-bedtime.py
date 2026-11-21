# new bedtime sheet: 3 full-body poses (wave, yawn, sleep) in starry pajamas + nightcap, 1536x1024 flat grey
from PIL import Image
from rembg import new_session, remove
import numpy as np
from scipy import ndimage
import sys
SRC = sys.argv[1]  # art/mo-dream-sheets/6-bedtime.jpg (or the original PNG)
src = Image.open(SRC).convert("RGB"); W, H = src.size
s = new_session("isnet-general-use")
for i, n in enumerate(["wave", "yawn", "sleep"]):
    X=[(0,548),(548,1002),(1002,1536)][i]; cell = src.crop((X[0], 0, X[1], H))
    cut = remove(cell, session=s, alpha_matting=True, alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=20, alpha_matting_erode_size=8, post_process_mask=True)
    a = np.array(cut); c = np.array(cell).astype(int); bg = np.median(c[:8, :8].reshape(-1, 3), 0)
    diff = np.abs(c - bg).sum(-1)
    # motion marks away from the body
    body = ndimage.binary_dilation(a[..., 3] > 40, iterations=10)
    extra = (diff > 60) & (a[..., 3] < 40) & ~body
    lab, k = ndimage.label(extra)
    if k:
        sz = ndimage.sum(extra, lab, range(1, k + 1))
        keep = np.isin(lab, [j + 1 for j, v in enumerate(sz) if v > 30]); a[keep, :3] = c[keep]; a[keep, 3] = 255
    # restore stars / pompom bitten out inside the closed outline
    m = a[..., 3] > 128
    closed = ndimage.binary_erosion(ndimage.binary_fill_holes(ndimage.binary_closing(m, structure=np.ones((31, 31)))), iterations=8)
    miss = closed & (a[..., 3] < 128) & (diff > 9); a[miss, :3] = c[miss]; a[miss, 3] = 255
    # holes fully inside that are not background-grey
    main = a[..., 3] > 128; holes = ndimage.binary_fill_holes(main) & ~main; hl, hn = ndimage.label(holes)
    for j in range(1, hn + 1):
        r = hl == j
        if diff[r].mean() > 9: a[r, :3] = c[r]; a[r, 3] = 255
    # specks
    m = a[..., 3] > 24; lab, k = ndimage.label(m)
    if k > 1:
        sz = ndimage.sum(m, lab, range(1, k + 1)); a[np.isin(lab, [j + 1 for j, v in enumerate(sz) if v < 40]), 3] = 0
    im = Image.fromarray(a.astype(np.uint8), "RGBA"); im.save(f"out/full-{n}.png")
    print(n, im.getbbox())
