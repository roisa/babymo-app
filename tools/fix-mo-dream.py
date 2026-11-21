# fill wrongly-cut holes (grey chest stars), drop slivers from neighbouring rows, align each set
import numpy as np, os
from PIL import Image
from scipy import ndimage
UP = "/root/.claude/uploads/bc6ee900-a5ff-58ec-8eec-4271124e511a/"
SETS = {
    "c9e090c9": ["tools-ready", "tools-brush", "tools-paste", "tools-both", "tools-squeeze", "tools-set"],
    "c5e296db": ["brush-left", "brush-right", "brush-up", "brush-down", "brush-back", "brush-done"],
    "bb9be4af": ["rinse-sip", "rinse-gargle", "rinse-wipe", "rinse-clean", "rinse-tidy", "rinse-done"],
    "697bed22": ["pj-day", "pj-top", "pj-pants", "pj-both", "pj-cap", "pj-teddy"],
    "d45c65b2": ["dua-start", "dua-read", "dua-amin", "bed-wave", "bed-yawn", "bed-sleep"],
}
FULL = {"pj", "dua"}
os.makedirs("fin", exist_ok=True)
anchors = {}
for fid, names in SETS.items():
    src = np.array(Image.open(UP + fid + "-image.png").convert("RGB")).astype(int)
    for i, n in enumerate(names):
        cx, cy = (i % 3) * 512, (i // 3) * 512
        cell = src[cy:cy + 512, cx:cx + 512]; bg = np.median(cell[:6, :6].reshape(-1, 3), 0)
        a = np.array(Image.open(f"out/mo-dream-{n}.png"))
        m = a[..., 3] > 128; lab, k = ndimage.label(m); sz = ndimage.sum(m, lab, range(1, k + 1)); mi = int(np.argmax(sz)) + 1
        # slivers of the neighbouring row along the top/bottom edge
        for j in range(1, k + 1):
            if j == mi: continue
            ys, xs = np.nonzero(lab == j)
            if ys.min() == 0 or ys.max() == 511: a[lab == j, 3] = 0
        main = lab == mi
        holes = ndimage.binary_fill_holes(main) & ~main
        hl, hn = ndimage.label(holes)
        for j in range(1, hn + 1):
            r = hl == j
            diff = np.abs(cell[r] - bg).sum(1).mean()
            if diff > 9:   # clearly not the flat background → it was the star/foam: put it back
                a[r, :3] = cell[r]; a[r, 3] = 255
        # star bites that touch the outside: inside Mo's closed outline, not background-grey → restore
        body = ndimage.binary_closing(a[..., 3] > 128, structure=np.ones((31, 31)), iterations=1)
        body = ndimage.binary_erosion(ndimage.binary_fill_holes(body), iterations=8)
        miss = body & (a[..., 3] < 128) & (np.abs(cell - bg).sum(-1) > 9)
        a[miss, :3] = cell[miss]; a[miss, 3] = 255
        Image.fromarray(a.astype(np.uint8), "RGBA").save(f"fin/{n}.png")
        mm = a[..., 3] > 128; ys, xs = np.nonzero(mm); top, bot = ys.min(), ys.max()
        head = mm[top:top + int((bot - top) * .3)]; hy, hx = np.nonzero(head)
        anchors[n] = (hx.mean(), top, bot)
# align: head centre to x 256; full-body sets → feet on y 492; upper-body → same head top within the set
groups = {}
for n in anchors: groups.setdefault(n.split("-")[0], []).append(n)
for g, ns in groups.items():
    ref_top = int(np.median([anchors[n][1] for n in ns]))
    for n in ns:
        hx, top, bot = anchors[n]
        dx = int(round(256 - hx)); dy = (492 - bot) if g in FULL else (ref_top - top)
        if g == "bed": dy = 0   # bed poses sit on the bottom edge (upper body) — keep them as drawn
        im = Image.open(f"fin/{n}.png"); out = Image.new("RGBA", (512, 512), (0, 0, 0, 0)); out.paste(im, (dx, dy), im)
        out.save(f"fin/{n}.png"); print(n, "shift", dx, dy)
