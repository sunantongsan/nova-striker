# FORGE guardians — NOVA 342

ATLAS -> VANGUARD -> TITAN are tiers 1–3 of one guardian per base. RONIN is reserved for a future release; only its CC0 quaternion sword motion is reused here.

`build.cjs` verifies the pinned upstream Git blob hashes, reduces textures to 512px, extracts sword rotations, and packs three gzip GLBs plus Three.js into game.js. No model network requests occur at runtime. Final game.js must stay under the existing Android 16 MiB file limit; patch total stays under 64 MiB. Generated bundles and downloaded source models are build outputs, not handwritten source.

Source: https://github.com/RamonLinares/atlas-09/tree/1b8fb9d54160215c071c5a29a49b1c36dc01f0df
Model, texture, rig, motion and render license: CC0-1.0 by Ramon Linares. Three.js is MIT. Original software notices remain in the bundled renderer. Do not ship upstream tracking dependencies or browser-test photography.

## Economy

HQ10; order with 10m gold and 10m power, reserving available resources automatically; one 72h job; completed guardian persists and returns to base after battle. Timer acceleration is 10 seconds/NOVA or 25,920 seconds/verified video. Tiers cost 2500/10000 NOVA or 50/200 accumulated videos. Skill shop opens instantly from the left-side menu beside the calendar; no building, construction cost or wait. Skill ranks cost 250 * nextRank² NOVA or five verified videos, max rank5. Every video preparation has a server 60-second cooldown. No simulated-ad provider can mint guardian progress. UI displays prices before purchase; requests are idempotent.

## Gameplay

Real skinned GLB animation; manual joystick only while selected; automatic combat otherwise. Sword, palm, dash, shield, nova with energy, cooldowns, delayed hits and enemy-only damage. Ground collision uses existing building geometry. Ally shield lasts5s. Controls expire when disconnected. Network frames preserve tier, skills, animation and cooldown state; titan deployments are excluded from ordinary unit refunds.

Run `node features/titan342/build.cjs`, `node tests/titan342.cjs`, `node tests/titan342-db.cjs`, then the existing regression suite. Browser QA must cover all three models, moving/selecting, skills, panel sizing, and entry/exit. Validate on actual target Android devices before asserting measured phone FPS.

## Order flow (345)

One order debits available required resources atomically, preserving previously reserved amounts. Missing resources cost 1 NOVA per 10,000 total units (rounded up), or one verified video per 2m units, at most ten videos. Wait authorizes automatic resource reservation during account status synchronization; the 72h build starts only after both 10m resource requirements are met. Production speed-up remains 10s/NOVA; each verified video removes 25,920 seconds, at most ten from a new 72h job. Resource videos also credit 25,920 seconds toward production. The combined resource and production process therefore takes at most ten verified videos total; the second phase does not restart a ten-video requirement. Existing ad cooldown/verification and one-mech ownership rules remain.

Guardians jump across walls only when the flight path contains no non-wall building and the landing tile is free and inside the map. Walls can still receive normal attack damage. Jump state is transmitted with battle frames. Illustrated controls use an AI-generated 12-icon atlas; progression spoilers remain hidden. The battlefield once again spans the full viewport.
