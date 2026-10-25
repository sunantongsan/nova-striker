# Combat balance 351

Corrects tower damage increasing by 20x at level 20 while troop health primarily depends on separate armor research. Defense growth is now 1 + 0.2*(level-1), clamped 1..20; level 1 remains unchanged. Applied to raid, defense, displayed enhancement stats and offline wave threat estimation. Tower firing rates/ranges, unit damage, prices and housing remain unchanged.

Base HP: ranger 150→260, tank 650→1200, mech 480→700, medic 130→180, sniper 110→180, helicopter 330→430, shield mech 1400→2000, plasma infantry 400→650, plasma tank 1400→1800, heavy mech 2400→3000. Bomber unchanged. Shared stats apply to both armies and garrison units.

Energy artillery keeps the 3-tile radius: full damage inside 0.75 tile, linear falloff to 35% at the edge. Distances captured before knockback. Multiple barrel shots still divide a single volley budget. Air immunity remains.

Validation: actual raid/defense impacts agree at levels 1/10/20; spread units take less damage; outside-radius units unharmed; equal armor research 10 gives ranger 3 and tank 10 theoretical direct full volleys from one level-10 cannon (previously 1 and 2). These are isolated damage-budget checks, not measured live win rates. Full army composition, defender layouts, mixed tower focus and player choices require playtesting; no 50% win-rate claim.

HQ transformation remains a separate unfinished visual/behavior feature; proposed old HQ damage numbers must be recalculated against the revised artillery curve before implementation.
