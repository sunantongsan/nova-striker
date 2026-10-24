# NOVA Titan preparation — not released

The live 1.9.62 patch contains only the guard, projectile and calendar changes.
This folder is an isolated combat prototype, not a playable giant robot.

## Approved requirements

- One titan per base; HQ level 10; 10,000,000 gold and 10,000,000 energy; 72-hour construction.
- Level 1: uploaded gold cyclops; level 2: uploaded shield robot; level 3: uploaded green robot.
- Real 3D animation. Sword and palm cannon. Joystick and skill buttons only while selected.
- Attack or defend; automatic defense when owner is offline.
- Area attacks harm enemies only. Support skills help allies only.
- Skill purchase: NOVA or five verified reward videos. Persist progress; minimum 60 seconds between videos, enforced by server.
- Construction acceleration and upgrades may use NOVA or accumulated ads. Exact conversion and progression costs are not approved yet; do not charge users.

## Verified animation preparation

`animations.json` identifies the downloaded CC0 GLB from Quaternius, its SHA-256 and twelve verified sword, shield and hit clips. The source has 43 named clips including its reference pose. Custom palm-charge/fire and ground-slam clips still need authoring. Retargeting to actual robots has not been performed.

The downloaded source can be reproduced from the source URL in animations.json; unzip and verify UAL2_Standard.glb against the recorded hash. Keep the source License.txt alongside exports. It is a mannequin animation source, not one of the approved robots.

## Model acquisition findings (2026-10-24)

Earlier generic image-search results did not reliably correspond to the model pages originally recommended. Use the user's uploaded screenshots as the visual ground truth.

- Gold cyclops: `Male_Robot (Rigged)` by Devaster, https://sketchfab.com/3d-models/male-robot-rigged-44b4bc2a609f4cef9ed216cb3cc2952a . Public API reports downloadable, CC-BY-4.0, 298,559 triangles, zero animation clips. The download button requires Sketchfab login. Source not acquired yet; optimize and verify actual rig before promising compatibility.
- Shield robot: `Jorn` by strange_aeons, https://sketchfab.com/3d-models/jorn-af0dad78a47b4dabb67d3c6f30a1d9f3 . Public API reports NOT downloadable, empty license, zero animation clips. Do not extract viewer geometry or claim this model is licensed for the game. Requires an authorized source file or approval of a replacement.
- Green robot: exact source still unverified. Do not replace it silently with a visually different candidate.

## Prototype validation

Run `node staging/titan/combat.test.cjs`.
The tests cover the one-per-base creation gate, HQ threshold, both team directions, friendly-fire exclusion, ground/air filtering, directional arcs, cooldowns and shield duration. Combat values are placeholders for local balancing only. Currency, ads, persistence, networking, real model rendering and skill VFX are not implemented here.
