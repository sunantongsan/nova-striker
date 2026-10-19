# Energy cannon evolution (patch 81)

- New generated atlas: `assets/energy-upgrades281.webp`, 4 columns × 2 rows. Top row fixed pedestals, bottom row rotating head modules. Source created with built-in Imagegen, no FAL. Palette: blue / ivory / gold / cyan, polished cartoon machinery.
- Every level lengthens the head; major silhouettes: 1 barrel at levels 1–5, 2 at 6–11, 3 at 12–19, 4 at 20. Base scale and armor change with progression.
- A continuous projected rotation shares geometry with projectile launch positions. Base remains fixed. Four muzzle positions alternate at the top tier.
- Cyan projectile grows from 1× to 1.855×; delayed impact and radius 3 remain unchanged. Damage scales using existing level rules.
- Range equals missile turret at the same level (7 to 9.85 tiles); shot interval 2.4 seconds in both battle modes.
- HQ 8 / 12 / 16 unlock 1 / 2 / 3 energy cannons. Server validator migration preserves authentication, ACL and other limits; it is idempotent.

Validation: continuous bearing samples, every level/stage, all cap boundaries, both battle modes, delayed AoE regression, projectile size handover, authoritative publish caps, and visual inspection of assembled sprites facing different directions. No physical Android device was available.
