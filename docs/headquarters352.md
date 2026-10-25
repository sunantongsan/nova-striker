# Command headquarters transformation — patch 122

Five building tiers: 1–4, 5–8, 9–12, 13–16, 17–20. Six robot tiers unlock at 5, 8, 11, 14, 17, 20. Reuses the pinned CC0 RONIN-04 rig, suppresses the sword bone, recolors cobalt/cyan and adds graduated shoulder armor, horns, rear fins and an ultimate halo.

An actual damaging hit on any defending building wakes the HQ. Armor opens over 2.4 seconds; the rig rises from its folded posture. No chase or positional movement. The existing HQ building remains its only hitbox, HP, upgrade and loot identity. Charging takes 1.05 seconds, then one straight blue orb travels to its locked impact point. Shot damage = 65% of same-level artillery; reload 4.2 seconds; range equals same-level artillery; ground-only AoE radius 1.65 with radial falloff. This preserves aircraft counterplay. Existing enhancement scaling applies exactly once through hit(). No legacy HQ machine gun remains active from level 5 onward. Below 5 the original weapon remains.

It folds after 8 seconds without nearby ground threats or incoming base damage, and at battle completion. Destroyed HQs become scattered metal wreckage; interruption during charge cancels the unlaunched shot. Launched shots retain their existing damage budget. Transformation never heals or grants invulnerability.

Online snapshots include form, charge, lock, aim, reload, alert, pending shots and bounded effects. Sound markers are local to each viewer, preventing repeated sound on every snapshot. One 256×320 render cache per HQ, capped at 15 frames/second during motion; static buildings are cached. Existing guardian models and textures are unchanged.

The extra compressed RONIN data is embedded in the hashed HTML payload; the other three rigs stay in game.js. Both files stay below the 16 MiB native per-file limit. Android and Telegram retain their separate entry pages. No new native permission or external runtime model fetch is required.

## Art files and prompt set

Created with the built-in image generation tool, transparent backgrounds retained; resized to 640×640 WebP for game use:

- assets/hq352-1.webp — compact octagonal reactor bunker, suspended blue orb and folded shoulder pods.
- assets/hq352-2.webp — broad heavy fortress, tall slanted shoulder bastions and a larger contained orb.
- assets/hq352-3.webp — tall prismatic reactor citadel, four blade buttresses and elevated containment arcs.
- assets/hq352-4.webp — winged command fortress, swept folded shields and a gold-silver gyroscopic cage.
- assets/hq352-5.webp — imperial stronghold, immense orb, golden halo crown, overlapping armor and six claw foundations.

Shared prompt: premium polished isometric sci-fi RTS game asset; navy ceramic armor, pearl white beveled panels, silver mechanical joints, luminous cyan conduits, blue condensed energy sphere as focal point; orthographic front-right view looking down 30 degrees; centered whole object with transparent background and small contact shadow; no text, people, weapon or robot face. During transition the image armor sections articulate around the emerging 3D rig; at full deployment only the rig, attached upgrades and anchoring plinth remain.

## Validation

Tests: hq352.cjs (level gates, shared HP, no chase, weaker delayed damage, friendly-fire safety, ground-only targeting, death cancellation, folding and real raid loop); hq352-state.cjs (snapshot continuation and audio deduplication); existing guardian tests; platform isolation and content-addressed patch tests. Browser render checks for all eleven level appearances and asset readiness. This is not a hardware performance benchmark or a measured PvP win-rate guarantee.
