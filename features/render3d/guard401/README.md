# 401 base guard robot (owner's model)

Source: owner-supplied `pixellabs-glb-3350.glb` (unrigged, 50k tris, 4K PBR textures; not committed - 44 MB).
`guard3d.html` bakes the node transform, auto-rigs it (pelvis, body, 2x shoulder/elbow, 2x hip/knee/ankle with region weights,
faces bridging separate limbs removed), poses idle/walk/jump/attack/death (jump = crouch, launch, rise, tuck, reach, squash) and renders with the troop camera.
`render-guard.cjs` writes 5 unique directions (2, 6, 7 are drawn mirrored) x 25 frames at 184 px per tier, 13 columns.
Tier textures tint the original albedo (detail kept): t1 sky blue (HQ 1-3), t2 gold (HQ 4-6), t3 ruby (HQ 7+).
A 2 px navy outline is added after rendering. Runtime: `features/hud400/hud400.js` (drawMiner251 / weaponMount overrides).
