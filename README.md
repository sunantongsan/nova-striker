# Nova Striker RTS 1.2.0

Offline cartoon sci-fi base building for Android. Package remains `com.sunantongsan.novastriker`.

- Place and move 9 building types on an isometric grid; one builder, upgrade levels 1–5.
- Collect gold and energy, train 4 unit types with persistent training timers and housing limits.
- Scout 20 alien-base stages, deploy troops along the perimeter, automatically fight defenders and buildings.
- Grid routing avoids intact structures and walls; tank defense preference, healing drone, timed raids, destruction stars and loot.
- Progress saved separately under novaRTS1; existing nova/nova2/novaDefense1 data is not erased.
- Original generated cartoon sprite atlas, 768 square WebP; fixed-resolution canvas and 30 fps target.
- Offline campaign only. No multiplayer, clans, cloud saves or asynchronous PvP. Home turrets are currently buildable structures; offline home-base raids are not implemented.

Run `node tests/rts.cjs` for economy, construction, training, routing, raid outcome and save checks. Android build via GitHub Actions, including AndroidX dependency verification. Signed Play bundles require the existing upload key; never commit signing material.
