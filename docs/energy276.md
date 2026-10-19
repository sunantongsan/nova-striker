# Energy mortar update

The energy cannon uses a new four-direction painted atlas in NOVA ivory, cobalt and gold. Its broad elevated barrel follows the supplied reference. Map, catalog and upgrade previews use the same art; the muzzle coordinates match each atlas view.

Shots travel for 0.85 seconds to a fixed landing point. On arrival, all enemy units within a Euclidean radius of 3 tiles receive the cannon's damage once, including existing enhancement and shield modifiers. The blue shockwave uses the matching isometric projection of that radius. Damage is simulated independently of visual effect limits. A shot still lands if its target moves or the firing cannon is destroyed.

Raid and offline-defense combat share the implementation. Live frames retain pending shots and exact visual lifetimes for cooperative host changes. No database or native Android changes are required.

Validated with energy276 and energy276-ui regression tests (timing, exact radius boundary and diagonals, both modes, no duplicate hit, moving targets, destroyed cannon, enhancements and host handover), plus existing combat, missile, wall and menu tests. Rendered all four sprite views with the actual cannon/effect drawing code for visual inspection.

Asset: `assets/energy-mortar276.webp`. Generated with built-in imagegen from the user's cannon reference, then encoded as WebP. Prompt: four equal atlas cells, the same broad-bore upward-tilted energy mortar in four isometric directions, ivory armor/cobalt panels/gold trim, cyan chamber, heavy mechanical pedestal and recoil supports, premium 3D animated cartoon style, transparent background, no scene or text.
