#!/usr/bin/env python3
"""392: hidden missile silo atlas from AI sheets (staging/silo392/src/sheetNN.jpg).

Each sheet is an 8x4 grid on magenta. We use row 1 (8-frame pop-up: closed -> launcher raised)
and row 4 cell 7 (destroyed). Frames are keyed, aligned on the bunker's bottom-center, and scaled
so the closed bunker width grows slightly with each design. Output: assets/silo392.webp
(one row per design, 9 cells) and features/units392/silo.json (muzzle offsets, order).
Run: python3 features/units392/silo.py
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract import alpha_from

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'staging', 'silo392', 'src')
CW, CH, AX, AY = 150, 190, 75, 178
CELL = CW
# design order (weakest -> strongest); sheet numbers as uploaded
ORDER = [2, 5, 3, 1, 6, 9, 10, 7, 8, 4]  # sheet 11 dropped: its bunker changes shape mid pop-up


def cell(rgba, r, c, cols=8, rows=4):
    h, w = rgba.shape[:2]
    x0, x1 = round(c * w / cols), round((c + 1) * w / cols)
    y0, y1 = round(r * h / rows), round((r + 1) * h / rows)
    im = rgba[y0:y1, x0:x1].copy()
    solid = im[..., 3] > 40
    lab, n = ndimage.label(ndimage.binary_dilation(solid, iterations=3))
    if n:
        sizes = ndimage.sum(solid, lab, range(1, n + 1))
        keep = [i + 1 for i, s in enumerate(sizes) if s > 0.04 * sizes.max()]
        im[..., 3] = np.where(np.isin(lab, keep), im[..., 3], 0)
    return im


def anchor(im):
    ys, xs = np.nonzero(im[..., 3] > 60)
    bottom = ys.max(); band = xs[ys > bottom - (bottom - ys.min()) * 0.18]
    return float((band.min() + band.max()) / 2), int(bottom), int(band.max() - band.min())


def main():
    atlas = Image.new('RGBA', (9 * CW, len(ORDER) * CH), (0, 0, 0, 0))
    meta = []
    for d, n in enumerate(ORDER):
        rgba = alpha_from(np.array(Image.open(os.path.join(SRC, f'sheet{n:02d}.jpg')).convert('RGB')), True)
        frames = [cell(rgba, 0, c) for c in range(8)] + [cell(rgba, 3, 6)]
        ax0, by0, _ = anchor(frames[0])
        xs0 = np.nonzero((frames[0][..., 3] > 60).any(0))[0]; width0 = xs0.max() - xs0.min()
        target = 104 + d * 2.0  # bunker width in atlas px; later designs a little larger
        scale = target / width0
        muzzle = None
        for i, f in enumerate(frames):
            fx, fb, _ = anchor(f)
            if i == 8:  # rubble: centre on its own footprint
                ax, by = fx, fb
            else:  # keep the bunker still across the pop-up
                ax, by = ax0, by0
            im = Image.fromarray(f, 'RGBA')
            w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale))
            im = im.resize((w, h), Image.LANCZOS)
            ox, oy = round(AX - ax * scale), round(AY - by * scale)
            big = Image.new('RGBA', (CW * 3, CH * 3), (0, 0, 0, 0))
            big.alpha_composite(im, (max(0, ox + CW), max(0, oy + CH)), (max(0, -(ox + CW)), max(0, -(oy + CH))))
            tile = big.crop((CW, CH, 2 * CW, 2 * CH))
            atlas.alpha_composite(tile, (i * CW, d * CH))
            if i == 7:
                a = np.array(tile)[..., 3] > 80
                ys, xs = np.nonzero(a)
                top = ys.min(); upper = ys < top + (AY - top) * 0.45
                mx = xs[upper].max(); my = float(np.median(ys[upper & (xs > mx - 6)]))
                muzzle = [round((mx - AX) / CW, 3), round((my - AY) / CW, 3)]
        meta.append({'sheet': n, 'muzzle': muzzle})
    out = os.path.join(ROOT, 'assets', 'silo392.webp')
    atlas.save(out, 'WEBP', quality=86, method=6)
    json.dump({'cw': CW, 'ch': CH, 'ax': AX, 'ay': AY, 'designs': meta}, open(os.path.join(ROOT, 'features', 'units392', 'silo.json'), 'w'), indent=1)
    print(os.path.getsize(out), json.dumps(meta))


if __name__ == '__main__':
    main()
