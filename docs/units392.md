# 392: frame-animated units

`features/units392/extract.py` cuts AI-generated sprite sheets (staging/units392/src: `<unit>-front.jpg` rows idle/walk/attack/death, `<unit>-back.jpg` rows idle/walk/attack) into `assets/units392-<unit>.webp` atlases (cell 140×120, feet at 57.5,115) and `features/units392/sheets.json`. It keys out the fake checkerboard or magenta background (including magenta grid lines), attaches muzzle flashes to their frame, scales every frame to the same idle height (back views matched by body mass), and aligns feet on one baseline.

`features/units392/units392.js` draws ranger, battle mech, sniper, shield mech, elite plasma trooper and heavy assault mech: front view when moving/aiming downward, back view upward, mirrored for left. Walk frames advance by distance travelled (no foot sliding); attack frames follow weapon recoil; death plays once. Enemy/alien units and other kinds keep the previous drawing. To replace a unit, drop new sheets in staging and run `python3 features/units392/extract.py <unit>`.

Known art gaps from the generator: battle-mech front walk frames lack the gatling, shield-mech front walk frames lack the shield, sniper back-walk carries the rifle on the other shoulder.

## Hidden missile silo (ground rocket battery)

`features/units392/silo.py` builds `assets/silo392.webp` from AI sheets in `staging/silo392/src` (row 1 = 8-frame pop-up, row 4 cell 7 = destroyed), aligned on the bunker's bottom-centre and sized so later designs are slightly larger; `silo.json` stores the order and muzzle points. `silo392.js`: levels 1–20 use 10 designs (2 levels each). The bunker stays closed at home (opens while selected), opens in battle when hostiles are within range +1.5 tiles or it fired in the last 2.5 s, closes when clear, mirrors toward the target side, fires from the launcher tip, and shows its own rubble when destroyed. Sheet 11 was dropped because its bunker changes shape mid pop-up.

## 3D pre-rendered silo (replaces the AI-drawn silo)

`features/render3d/silo3d.html` is a three.js toon-shaded model (outlines, 4-step light ramp, woodland camouflage that blends with grass, olive panels, brass trim) with 5 tiers (pods, missile count, radar dishes, glow core, trim and colour change). `node features/render3d/render.cjs` renders `assets/silo3d392.webp` (per tier: 8 pop-up frames, 16 aim directions, 1 wreck) and `silo3d.json` (anchors, per-direction muzzle points). The camera matches the game grid (yaw 45°, screen depth 0.62). `silo3d392.js` maps levels 1–20 to tiers in steps of 4, keeps the open/close logic, and picks the direction frame from the turret's aim. The AI atlas is kept in staging only.
