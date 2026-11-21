# cuts the 5 Dreamtime sheets (flat grey, 3x2 grid, 1536x1024) into transparent poses
from PIL import Image
from rembg import new_session, remove
import numpy as np, os
from scipy import ndimage
UP = "/root/.claude/uploads/bc6ee900-a5ff-58ec-8eec-4271124e511a/"
OUT = "out"; os.makedirs(OUT, exist_ok=True)
JOBS = [
    ("c9e090c9", ["tools-ready", "tools-brush", "tools-paste", "tools-both", "tools-squeeze", "tools-set"]),
    ("c5e296db", ["brush-left", "brush-right", "brush-up", "brush-down", "brush-back", "brush-done"]),
    ("bb9be4af", ["rinse-sip", "rinse-gargle", "rinse-wipe", "rinse-clean", "rinse-tidy", "rinse-done"]),
    ("697bed22", ["pj-day", "pj-top", "pj-pants", "pj-both", "pj-cap", "pj-teddy"]),
    ("d45c65b2", ["dua-start", "dua-read", "dua-amin", "bed-wave", "bed-yawn", "bed-sleep"]),
]
s = new_session("isnet-general-use")
for fid, names in JOBS:
    src = Image.open(UP + fid + "-image.png").convert("RGB")
    W, H = src.size; cw, ch = W // 3, H // 2
    for i, base in enumerate(names):
        cx, cy = (i % 3) * cw, (i // 3) * ch
        cell = src.crop((cx, cy, cx + cw, cy + ch))
        cut = remove(cell, session=s, alpha_matting=True, alpha_matting_foreground_threshold=240,
                     alpha_matting_background_threshold=20, alpha_matting_erode_size=8, post_process_mask=True)
        a = np.array(cut)
        # keep motion marks/sparkles/droplets: anything clearly not the flat grey
        c = np.array(cell).astype(int); grey = np.abs(c - c[5, 5]).sum(-1)
        body = ndimage.binary_dilation(a[..., 3] > 40, iterations=10)
        extra = (grey > 60) & (a[..., 3] < 40) & ~body   # separate marks only (motion lines, sparkles, drops)
        lab, n = ndimage.label(extra)
        if n:
            sz = ndimage.sum(extra, lab, range(1, n + 1))
            keep = np.isin(lab, [k + 1 for k, v in enumerate(sz) if v > 30])
            a[keep, :3] = c[keep]; a[keep, 3] = 255
        # drop specks
        m = a[..., 3] > 24; lab, n = ndimage.label(m)
        if n > 1:
            sz = ndimage.sum(m, lab, range(1, n + 1)); kill = [k + 1 for k, v in enumerate(sz) if v < 25]
            a[np.isin(lab, kill), 3] = 0
        Image.fromarray(a.astype(np.uint8), "RGBA").save(f"{OUT}/mo-dream-{base}.png", optimize=True)
        print(base, Image.fromarray(a.astype(np.uint8)).getbbox())
