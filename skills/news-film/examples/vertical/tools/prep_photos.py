"""Grade the downloaded photos (raw/photos/*.jpg) into the package's one duotone (references/look.md) → assets/ph_<name>.jpg.
greyscale → black/white points at the 0.5 / 99.6 percentiles → γ 1.05 → 35 % S-curve → black 8, white 232 → #0E1013 … #ECE7D8.
Run: $LIB/.venv/bin/python tools/prep_photos.py"""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW, OUT = os.path.join(HERE, 'raw/photos'), os.path.join(HERE, 'assets')
SHADOW, LIGHT = np.array([0x0E, 0x10, 0x13], float), np.array([0xEC, 0xE7, 0xD8], float)
NAMES = {'king_summit': 2400, 'king_leaders_b': 2600, 'king_leaders_a': 2000, 'nassau_assembly': 900, 'umana': 900, 'dockyard': 900,
         'mottley': 1100, 'albanese': 1100, 'holness': 1100, 'steelpan': 1100, 'cricket': 1100}

def grade(im, black=8, white=232, gamma=1.05):
    g = np.asarray(im.convert('L'), float)
    lo, hi = np.percentile(g, 0.5), np.percentile(g, 99.6)
    g = np.clip((g - lo) / max(1, hi - lo), 0, 1) ** gamma
    g = g * g * (3 - 2 * g) * .35 + g * .65
    g = black / 255 + g * (white - black) / 255
    rgb = SHADOW[None, None] + (LIGHT - SHADOW)[None, None] * g[..., None]
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))

os.makedirs(OUT, exist_ok=True)
for name, width in NAMES.items():
    im = Image.open(os.path.join(RAW, name + '.jpg')).convert('RGB')
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    grade(im).save(os.path.join(OUT, f'ph_{name}.jpg'), quality=90)
    print(name, im.size)
