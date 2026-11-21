# python3 cut.py <outdir>  — cuts the 10 render-3 sheets (3×2 grids, 1536×1024) into 60 transparent poses
import sys, os
from PIL import Image
from rembg import new_session, remove

UP = "/root/.claude/uploads/bc6ee900-a5ff-58ec-8eec-4271124e511a/"
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
SHEETS = [
    ("73762138", "talk",    ["smile", "a", "o", "e", "u", "m"]),
    ("f5f06569", "idle",    ["eyes-open", "eyes-half", "eyes-closed", "sway-1", "sway-2", "sway-3"]),
    ("ef87aa64", "explain", ["palm", "one", "two", "peace", "present", "idea"]),
    ("8986dcec", "walk",    ["1", "2", "3", "4", "5", "6"]),
    ("776b4295", "turn",    ["front", "three-quarter-right", "side-right", "back", "side-left", "three-quarter-left"]),
    ("aea51526", "tablet",  ["look", "show", "tap", "wow", "laugh", "hug"]),
    ("dcb85cdd", "phone",   ["watch-look", "watch-show", "phone-look", "phone-show", "phone-up", "phone-call"]),
    ("fc97a7c5", "routine", ["stretch", "yawn", "dua", "wash", "read", "pillow"]),
    ("7bad4b83", "hook",    ["peek-left", "pop-up", "whisper", "shh", "jump", "skid"]),
    ("d4ec2793", "end",     ["salam", "clap-open", "clap-closed", "star", "wave-1", "wave-2"]),
]
sess = new_session("isnet-general-use")
for n, (fid, key, names) in enumerate(SHEETS, 1):
    src = Image.open(UP + fid + "-image.png").convert("RGBA")
    # the sheet's own alpha is broken (dark backdrop + colour halos): flatten onto a neutral grey first
    flat = Image.new("RGBA", src.size, (128, 128, 128, 255)); flat.alpha_composite(src); flat = flat.convert("RGB")
    W, H = flat.size; cw, ch = W // 3, H // 2
    for i, name in enumerate(names):
        cx, cy = (i % 3) * cw, (i // 3) * ch
        cell = flat.crop((cx, cy, cx + cw, cy + ch))
        cut = remove(cell, session=sess, alpha_matting=True, alpha_matting_foreground_threshold=240,
                     alpha_matting_background_threshold=20, alpha_matting_erode_size=8, post_process_mask=True)
        base = f"mo3-{n:02d}-{key}-{i+1}-{name}"
        cut.save(f"{OUT}/{base}.png", optimize=True)
        cut.save(f"{OUT}/{base}.webp", quality=90, method=6)
        print(base, cut.getbbox())
