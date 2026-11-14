# 401 NOVA titan = owner's android model
Source: owner-supplied `lazarosv-android-3188.glb` (unrigged, 80k tris). `android-retarget.html` builds the ATLAS-09 skeleton
at the android's joint landmarks, skins it with region weights (limb-bridging faces removed), copies all ATLAS-09 clips
(rotations as-is, root/pelvis translation rescaled), exports a GLB; then `gltf-transform weld` + `simplify --ratio 0.4`
-> `models/android-nova.glb` (32k tris). build.cjs packs it as `android-nova`; renderer.js uses it for every tier,
tinted white / gold / red and with an energy sword whose blade colour follows the tier. Portraits: android-nova-1..3.png.
