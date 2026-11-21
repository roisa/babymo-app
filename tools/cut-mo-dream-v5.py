# Dreamtime v5: the owner's transparent sheets (24 Nov 2026). Their alpha has a soft glow haze
# (body ~253, halo 3-200), so: hard-ish mask from alpha, drop haze and specks, opaque body, align each set.
import numpy as np, os, sys
from PIL import Image
from scipy import ndimage
U = sys.argv[1] if len(sys.argv) > 1 else 'art/mo-dream-sheets/v5/'  # folder with the five transparent sheets
SETS = [
    ("1-tools", ["tools-ready", "tools-brush", "tools-paste", "tools-both", "tools-squeeze", "tools-set"]),
    ("2-rinse", ["rinse-sip", "rinse-gargle", "rinse-wipe", "rinse-clean", "rinse-tidy", "rinse-done"]),
    ("3-pajamas", ["pj-day", "pj-top", "pj-pants", "pj-both", "pj-cap", "pj-teddy"]),
    ("4-dua-bed", ["dua-start", "dua-read", "dua-amin", None, None, None]),
]
FULL = {"pj", "dua"}
os.makedirs("out", exist_ok=True)
def clean(rgba):
    a = rgba[..., 3].astype(float)
    m = np.clip((a - 150) / 90, 0, 1)                 # haze → 0, body → 1, keeps a 1-2 px soft edge
    solid = m > .5
    lab, k = ndimage.label(solid)
    if k:
        sz = ndimage.sum(solid, lab, range(1, k + 1)); big = sz.max()
        keep = [j + 1 for j, v in enumerate(sz) if v >= max(120, big * .002)]
        km = ndimage.binary_dilation(np.isin(lab, keep), iterations=2)
        m = m * km
    # fill pin-holes inside the body
    filled = ndimage.binary_fill_holes(m > .5); m[filled & (m < .5)] = 1
    out = rgba.copy(); out[..., 3] = (m * 255).astype(np.uint8)
    return out
anchors = {}
for fid, names in SETS:
    src = np.array(Image.open(U + fid + ".png").convert("RGBA"))
    H, W = src.shape[:2]; cw = W / 3
    for i, n in enumerate(names):
        if not n: continue
        x0 = int(round((i % 3) * cw)); y0 = (i // 3) * 512
        cell = np.zeros((512, 512, 4), np.uint8); c = src[y0:y0 + 512, x0:x0 + 512]; cell[:c.shape[0], :c.shape[1]] = c
        a = clean(cell)
        # drop slivers touching the cell edge that are not the main figure
        mm = a[..., 3] > 128; lab, k = ndimage.label(mm); sz = ndimage.sum(mm, lab, range(1, k + 1)); mi = int(np.argmax(sz)) + 1
        for j in range(1, k + 1):
            if j == mi: continue
            ys, xs = np.nonzero(lab == j)
            if ys.min() == 0 or ys.max() == 511 or xs.min() == 0 or xs.max() == 511: a[lab == j, 3] = 0
        Image.fromarray(a).save(f"out/{n}.png")
        mm = lab == mi; ys, xs = np.nonzero(mm); top, bot = ys.min(), ys.max()
        hy, hx = np.nonzero(mm[top:top + int((bot - top) * .3)])
        anchors[n] = (hx.mean(), top, bot)
groups = {}
for n in anchors: groups.setdefault(n.split("-")[0], []).append(n)
for g, ns in groups.items():
    ref_top = int(np.median([anchors[n][1] for n in ns]))
    for n in ns:
        hx, top, bot = anchors[n]
        dx = int(round(256 - hx)); dy = (492 - bot) if g in FULL else (ref_top - top)
        im = Image.open(f"out/{n}.png"); out = Image.new("RGBA", (512, 512)); out.paste(im, (dx, dy), im)
        out.save(f"out/{n}.png"); print(n, dx, dy)
# bedtime: full-body sheet → aligned upper-body squares (as v4)
src = Image.open(U + "5-bedtime.png").convert("RGBA")
for i, n in enumerate(["wave", "yawn", "sleep"]):
    X = [(0, 548), (548, 1002), (1002, 1536)][i]
    a = clean(np.array(src.crop((X[0], 0, X[1], 1024))))
    mm = a[..., 3] > 128; lab, k = ndimage.label(mm); sz = ndimage.sum(mm, lab, range(1, k + 1)); mi = int(np.argmax(sz)) + 1
    for j in range(1, k + 1):
        ys, xs = np.nonzero(lab == j)
        if j != mi and (xs.min() == 0 or xs.max() == a.shape[1] - 1): a[lab == j, 3] = 0
    im = Image.fromarray(a); al = a[..., 3]
    rows = np.nonzero(al.max(1) > 128)[0]; feet = rows.max()
    xs = np.nonzero(al[feet - 110:feet - 70].max(0) > 128)[0]; cx = (xs.min() + xs.max()) / 2
    big = Image.new("RGBA", (1400, 1400)); big.alpha_composite(im, (int(700 - cx), 0))
    h = feet - rows.min(); k = h / 762; S = int(600 * k); top = int(rows.min() - 15 * k)   # same framing as v4
    big.crop((int(700 - S / 2), top, int(700 + S / 2), top + S)).resize((512, 512), Image.LANCZOS).save(f"out/night-{n}.png"); print("night", n, cx, feet)
# night-wave: the sheet has dark haze + pale fringe in the gap between cheek and raised arm.
# Remove dark bits that touch the outside (the mouth stays: it is enclosed), then the pale fringe there.
w = np.array(Image.open("out/night-wave.png")); rgb = w[..., :3].astype(int)
out = ndimage.binary_dilation(w[..., 3] < 20, iterations=2)
for _ in range(3):
    dark = (rgb.max(-1) < 90) & (w[..., 3] > 0); dark[:240] = False
    lab, k = ndimage.label(dark)
    for j in range(1, k + 1):
        if (out & (lab == j)).any(): w[lab == j, 3] = 0
    out = ndimage.binary_dilation(w[..., 3] < 20, iterations=2)
# the gap itself (between cheek, hand and collar): drop everything that is not skin or blue fabric
box = np.zeros(w.shape[:2], bool); box[250:326, 138:216] = True
sat = rgb.max(-1) - rgb.min(-1)
bad = box & ((rgb.max(-1) < 90) | ((sat < 45) & (rgb.min(-1) > 100)))
w[ndimage.binary_dilation(bad, iterations=1) & box & ((sat < 55) | (rgb.max(-1) < 110)), 3] = 0
lab, k = ndimage.label(w[..., 3] > 0); sz = ndimage.sum(w[..., 3] > 0, lab, range(1, k + 1))
w[np.isin(lab, [q + 1 for q, v in enumerate(sz) if v < 60]), 3] = 0
Image.fromarray(w).save("out/night-wave.png")
# then: webp q90 → www/mo-dream/mo5-<name>.webp
