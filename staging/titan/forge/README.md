# FORGE source archive

ATLAS /09, VANGUARD /07 and TITAN /06 are approved for initial tiers 1–3. RONIN /04 is reserved for the next release.

Source commit: 1b8fb9d54160215c071c5a29a49b1c36dc01f0df in https://github.com/RamonLinares/atlas-09

The source is acquired with verified Git blob hashes by features/titan342/build.cjs. All four original GLBs are retained in staging/titan/forge/models during builds; only the three approved characters enter the game payload. A submodule is no longer needed, avoiding download of the full Blender repository on each deployment. The earlier pinned submodule remains in commit 631526f186f33321d27abd2daf49d3bc986ea854.

See features/titan342/README.md for integration and validation.
