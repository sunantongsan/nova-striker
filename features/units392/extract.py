#!/usr/bin/env python3
"""392: cut AI-generated unit sprite sheets into a clean, aligned game atlas.

Input (staging/units392/src): <unit>-front.jpg (rows: idle, walk, attack, death; fake checkerboard
background) and <unit>-back.jpg (rows: idle, walk, attack; flat magenta background).
Output: assets/units392-<unit>.webp atlas + printed frame counts for units392.js.
Each frame is scaled so the character's idle height matches across views, feet sit on one
baseline and the feet are horizontally centered, so the animation does not wobble.
Run: python3 features/units392/extract.py ranger heavy
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'staging', 'units392', 'src')
CELL_W, CELL_H, ANCHOR_X, BASE_Y, IDLE_H = 224, 192, 92, 184, 156


def background_mask(rgb, magenta):
    r, g, b = [rgb[..., i].astype(int) for i in range(3)]
    if magenta:
        # magenta key plus pink/purple anti-aliased fringe
        # magenta key, its fringe, and the darker magenta grid lines some generators draw
        return (r > 95) & (b > 95) & (g < 0.55 * np.minimum(r, b)) & (np.abs(r - b) < 90)
    neutral = (np.abs(r - g) <= 7) & (np.abs(g - b) <= 7) & (np.minimum(np.minimum(r, g), b) >= 226)
    lab, n = ndimage.label(neutral)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    # enclosed checker pockets (between arms and body): large, perfectly neutral regions
    sizes = ndimage.sum(np.ones_like(lab), lab, index=np.arange(n + 1))
    pockets = [i for i in range(1, n + 1) if i not in border and sizes[i] > 220]
    for i in pockets:
        reg = lab == i
        vals = rgb[reg].astype(int)
        if (np.abs(vals[:, 2] - vals[:, 0]) <= 5).mean() > 0.97:
            bg |= reg
    return bg


def alpha_from(rgb, magenta):
    bg = background_mask(rgb, magenta)
    bg = ndimage.binary_opening(bg, iterations=1) | bg
    a = (~bg).astype(np.float32)
    # soften one pixel of edge
    a = ndimage.gaussian_filter(a, 0.6)
    a = np.clip((a - 0.25) / 0.6, 0, 1)
    out = rgb.astype(np.float32)
    if magenta:  # remove magenta spill on the outline
        spill = (out[..., 0] > out[..., 1] + 40) & (out[..., 2] > out[..., 1] + 40) & (a < 0.99)
        out[spill] = out[spill] * 0.35 + np.array([60, 70, 110]) * 0.65
    return np.dstack([out, a * 255]).astype(np.uint8)


def frames(path, magenta, rows):
    rgb = np.array(Image.open(path).convert('RGB'))
    rgba = alpha_from(rgb, magenta)
    solid = rgba[..., 3] > 40
    lab, n = ndimage.label(ndimage.binary_dilation(solid, iterations=6))
    objs = ndimage.find_objects(lab)
    comps = []
    for i, sl in enumerate(objs):
        area = int(solid[sl][lab[sl] == i + 1].sum())
        comps.append({'sl': sl, 'area': area, 'cy': (sl[0].start + sl[0].stop) / 2, 'cx': (sl[1].start + sl[1].stop) / 2, 'id': i + 1})
    big = [c for c in comps if c['area'] > 4000]
    small = [c for c in comps if 30 < c['area'] <= 4000]
    # row bands from big components
    big.sort(key=lambda c: c['cy'])
    bands = []
    for c in big:
        if bands and abs(c['cy'] - bands[-1][-1]['cy']) < 150:
            bands[-1].append(c)
        else:
            bands.append([c])
    if len(bands) != rows:
        raise SystemExit(f'{path}: expected {rows} rows, found {len(bands)}')
    # attach sparks / muzzle flashes to the nearest sprite in the same band
    for s in small:
        best = min(big, key=lambda c: abs(c['cy'] - s['cy']) * 3 + abs(c['cx'] - s['cx']))
        best.setdefault('extra', []).append(s)
    result = []
    for band in bands:
        band.sort(key=lambda c: c['cx'])
        row = []
        for c in band:
            ids = [c['id']] + [s['id'] for s in c.get('extra', [])]
            ys0 = min([c['sl'][0].start] + [s['sl'][0].start for s in c.get('extra', [])])
            ys1 = max([c['sl'][0].stop] + [s['sl'][0].stop for s in c.get('extra', [])])
            xs0 = min([c['sl'][1].start] + [s['sl'][1].start for s in c.get('extra', [])])
            xs1 = max([c['sl'][1].stop] + [s['sl'][1].stop for s in c.get('extra', [])])
            crop = rgba[ys0:ys1, xs0:xs1].copy()
            keep = np.isin(lab[ys0:ys1, xs0:xs1], ids)
            crop[..., 3] = np.where(keep, crop[..., 3], 0)
            body = (crop[..., 3] > 40) & np.isin(lab[ys0:ys1, xs0:xs1], [c['id']])
            ys, xs = np.nonzero(body)
            bottom = ys.max()
            feet = xs[ys > bottom - (ys.max() - ys.min()) * 0.22]
            row.append({'img': crop, 'foot_x': float(np.median(feet)), 'bottom': int(bottom), 'height': int(ys.max() - ys.min()), 'area': int(body.sum())})
        result.append(row)
    return result


def build(unit):
    front = frames(os.path.join(SRC, unit + '-front.jpg'), False, 4)
    back_path = os.path.join(SRC, unit + '-back.jpg')
    back = frames(back_path, True, 3) if os.path.exists(back_path) else None
    rows = {'idle': front[0][:4], 'walk': front[1], 'attack': front[2], 'death': front[3][:4]}
    if back:
        rows.update({'bidle': back[0][:4], 'bwalk': back[1], 'battack': back[2]})
    order = ['idle', 'walk', 'attack', 'death', 'bidle', 'bwalk', 'battack']
    order = [k for k in order if k in rows]
    cols = max(len(rows[k]) for k in order)
    atlas = Image.new('RGBA', (cols * CELL_W, len(order) * CELL_H), (0, 0, 0, 0))
    counts = {}
    for ri, key in enumerate(order):
        front_scale = IDLE_H / float(np.median([f['height'] for f in rows['idle']]))
        if key.startswith('b'):
            # match the visible body mass of the front view (back views are often drawn larger)
            fa = np.median([f['area'] for f in rows['idle']]) * front_scale ** 2
            scale = float(np.sqrt(fa / np.median([f['area'] for f in rows['bidle']])))
        else:
            scale = front_scale
        for ci, f in enumerate(rows[key]):
            im = Image.fromarray(f['img'], 'RGBA')
            w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale))
            im = im.resize((w, h), Image.LANCZOS)
            x = round(ci * CELL_W + ANCHOR_X - f['foot_x'] * scale)
            y = round(ri * CELL_H + BASE_Y - f['bottom'] * scale)
            cell = Image.new('RGBA', (CELL_W, CELL_H), (0, 0, 0, 0))
            cell.alpha_composite(im, (x - ci * CELL_W, y - ri * CELL_H)) if False else None
            # paste clipped to the cell
            tmp = Image.new('RGBA', atlas.size, (0, 0, 0, 0))
            tmp.alpha_composite(im, (max(0, x), max(0, y)), (max(0, -x), max(0, -y)))
            box = (ci * CELL_W, ri * CELL_H, (ci + 1) * CELL_W, (ri + 1) * CELL_H)
            atlas.alpha_composite(tmp.crop(box), (box[0], box[1]))
        counts[key] = len(rows[key])
    out = os.path.join(ROOT, 'assets', f'units392-{unit}.webp')
    atlas.save(out, 'WEBP', quality=88, method=6)
    meta_path = os.path.join(ROOT, 'features', 'units392', 'sheets.json')
    meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {}
    meta[unit] = {'rows': order, 'counts': counts}
    json.dump(meta, open(meta_path, 'w'), indent=1, sort_keys=True)
    print(json.dumps({'unit': unit, 'rows': order, 'counts': counts, 'cols': cols, 'bytes': os.path.getsize(out)}))


if __name__ == '__main__':
    for u in sys.argv[1:]:
        build(u)
