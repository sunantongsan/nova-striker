# 392: frame-animated units

`features/units392/extract.py` cuts AI-generated sprite sheets (staging/units392/src: `<unit>-front.jpg` rows idle/walk/attack/death, `<unit>-back.jpg` rows idle/walk/attack) into `assets/units392-<unit>.webp` atlases (cell 140×120, feet at 57.5,115) and `features/units392/sheets.json`. It keys out the fake checkerboard or magenta background (including magenta grid lines), attaches muzzle flashes to their frame, scales every frame to the same idle height (back views matched by body mass), and aligns feet on one baseline.

`features/units392/units392.js` draws ranger, battle mech, sniper, shield mech, elite plasma trooper and heavy assault mech: front view when moving/aiming downward, back view upward, mirrored for left. Walk frames advance by distance travelled (no foot sliding); attack frames follow weapon recoil; death plays once. Enemy/alien units and other kinds keep the previous drawing. To replace a unit, drop new sheets in staging and run `python3 features/units392/extract.py <unit>`.

Known art gaps from the generator: battle-mech front walk frames lack the gatling, shield-mech front walk frames lack the shield, sniper back-walk carries the rifle on the other shoulder.
