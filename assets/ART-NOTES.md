# Nova 1.6.1 building art

Generated with built-in imagegen using `rts-atlas.webp` as the style reference, replacing the temporary flat canvas buildings from 1.6.0.

Shared prompt: One isolated polished 2.5D isometric sci-fi building; chunky white armored panels, cobalt blue trim, charcoal joints, orange accents, rich top-left lighting, crisp outlined edges. Match the original atlas camera and compact grounded footprint. Genuine transparent background, no text, labels, UI or scenery.

Asset-specific subjects:
- goldstore.webp: fortified vault with open door and visible stacked gold ingots.
- powerstore.webp: three round cyan energy tanks with pipes, valves and reinforced armor.
- crystalstore.webp: armored glass containment vault holding violet crystals.
- crystalplant.webp: violet crystal growing inside three mechanical reactor arms.
- garrison.webp: military bunker, illuminated troop entrance, watch stations and blue pennant.
- missileturret.webp: four red-tipped missiles on a rotating armored launcher.
- cannonturret.webp: heavy gun barrel with cyan muzzle, recoil pistons and rotating platform.
- shield.webp: three curved pylons around a cyan spherical energy core.

Integration: preserve generated alpha, trim transparent padding, normalize into 256px WebP sprites. Dynamic resource amounts and fill gauges are drawn by the game; baked artwork is decorative. Level colors and base rank lights remain dynamic. Images also appear in construction menus.
