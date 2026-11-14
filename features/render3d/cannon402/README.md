# 402 energy cannon = owner's steampunk mortar

Source: owner-supplied `pixellabs-steampunk-cannon-4455.glb` (unrigged, 42k verts, 4K PBR; not committed - 36 MB).
Extract its three textures at 2048 px as tex0 (normal), tex1 (base colour), tex2 (metal/rough), then
`GLB=... TEX=... node features/render3d/cannon402/render-steam.cjs` writes `assets/cannon3d392.webp` and
`features/render3d/cannon3d.json` in the same layout as `../render-cannon.cjs` (runtime `../cannon3d392.js` unchanged).
The model keeps its look at every tier; levels grow it (x0.88 -> x1.04) and add parts: brass platform ring + studs (lv 5+),
brass steam tanks (9+), chimney and glowing orange muzzle ring (13+), gold trim, crest and cyan glow (17+).
