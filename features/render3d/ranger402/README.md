# 402 ranger = owner's android with an assault rifle

Uses the already rigged `staging/titan/forge/models/android-nova.glb` (same android as the NOVA titan), tinted bright green
so soldiers read differently from the white/gold/red titan. `android3d.html` builds a chunky toy rifle, plays the ATLAS-09 clips
(Sentinel idle, Walk, Collapse death) and puts both hands on the rifle with CCD IK; attack = shoulder-high aim with recoil.
`render-ranger.cjs` writes `assets/units3d392-ranger.webp` (same 21 x 8 layout as render-units.cjs) and the `ranger` entry of
`features/render3d/units3d.json`; `portrait-ranger.cjs` replaces the kind-0 card portrait in `assets/portraits393.webp`.
