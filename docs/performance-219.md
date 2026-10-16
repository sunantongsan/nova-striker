# Smooth raids, content patch 19

Buildings no longer translate on hit. Damage cracks/smoke, HP, turret aiming and recoil remain. Replaced the six-cell wreck atlas with original low collapsed rubble art, rendered from uniform cells with a ground anchor. The atlas is 768x512 WebP with alpha (previously 1536x1024), reducing decoded memory from 6 MiB to 1.5 MiB. Generated with built-in image generation: six evenly spaced isometric collapsed sci-fi HQ, hangar, warehouse, reactor, turret and wall sprites, blue/white armor, no text, transparent background.

Confirmed client hot paths and changes:
- BFS scanned the full building list at every neighbour visit. Occupancy grid and typed queue/parents preserve exact paths while replacing those repeated scans. Seeded parity check passed 150 obstacle maps. Dense 22x22 test (120 searches per batch) median decreased from about 45ms to 11ms on this host. This is a route benchmark, not Android FPS.
- Floor/deployment geometry was repainted each frame. A single viewport-sized offscreen cache invalidates on pan, zoom, size, map or raid state; placement remains dynamic.
- Unit strip was recreated by repeated HUD/network callbacks. Reuse identical HTML; do not construct hidden troop strips during scouting/defender viewing.
- Cull offscreen buildings/units, index wall neighbours once per draw, remove per-sprite Canvas color filters in battle, throttle idle scouting redraws to 10fps (input remains immediate), and remove redundant layers from explosive impact rendering.
- Redundant resource polling is skipped outside home/background. The existing battle heartbeat, server economy, purchase receipts, crystal production and loot are unchanged.

The network runs on the native worker executor. No on-device profiler or server timing was available, so these confirmed inefficiencies do not establish a sole cause of all reported freezes. Crystal production itself has not been identified as the cause. No Supabase schema or balance changes.

Validation: full npm test, performance219 (terrain cache invalidation, DOM reuse, unit count updates, anchored building, walls), audio regression, 150-map old/new route parity, actual Canvas rendering with atlas transparency. Android hardware performance remains to be checked on a phone.
