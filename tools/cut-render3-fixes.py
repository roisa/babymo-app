# python3 cut2.py — cuts the two regenerated render-3 sheets (flat grey background)
from PIL import Image
from rembg import new_session, remove
UP = "/root/.claude/uploads/bc6ee900-a5ff-58ec-8eec-4271124e511a/"
OUT = "out2"
import os; os.makedirs(OUT, exist_ok=True)
JOBS = [
    ("5ef42918", ["mo3-04-walk-1-1", "mo3-04-walk-2-2", "mo3-04-walk-3-3", "mo3-04-walk-4-4", "mo3-04-walk-5-5", "mo3-04-walk-6-6"]),
    ("2a80ff60", ["mo3-03-explain-4-three", "mo3-02-idle-4-sway-left", "mo3-02-idle-6-sway-right", "mo3-08-routine-4-wash-a", "mo3-08-routine-7-wash-b", "mo3-02-idle-5-breathe-in"]),
]
s = new_session("isnet-general-use")
for fid, names in JOBS:
    src = Image.open(UP + fid + "-image.png").convert("RGB")
    W, H = src.size; cw, ch = W // 3, H // 2
    for i, base in enumerate(names):
        cx, cy = (i % 3) * cw, (i // 3) * ch
        cut = remove(src.crop((cx, cy, cx + cw, cy + ch)), session=s, alpha_matting=True, alpha_matting_foreground_threshold=240,
                     alpha_matting_background_threshold=20, alpha_matting_erode_size=8, post_process_mask=True)
        cut.save(f"{OUT}/{base}.png", optimize=True); cut.save(f"{OUT}/{base}.webp", quality=90, method=6)
        print(base, cut.getbbox())
