# 403 ground rocket battery = ship-style box launcher

Modeled on the owner's reference photo (deck box launcher): octagonal NOVA base, turntable, tall side housing
with warning label, yoke arm and a tilting launcher box whose face carries a honeycomb of round tubes with red
missile tips. Bright NOVA palette (white / cobalt / navy / orange), toon shaded.

`node features/render3d/ram403/render-ram.cjs` writes `assets/silo3d392.webp` and `features/render3d/silo3d.json`
in the old silo layout (per tier: 8 raise frames shown at home, 16 aim directions, 1 wreck), so
`../silo3d392.js` keeps working. Tiers (4 levels each) grow the box and tube count and add springs (5+),
radar dome (9+), gold trim and cyan lights (13+), glowing antenna (17+).

Runtime: drawn 1.75 tiles wide (was 1.35); after every salvo the sprite does a damped cartoon squash & stretch
anchored at the base (`silo3dBounce392`).
