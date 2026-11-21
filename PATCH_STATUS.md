# NOVA patch handoff — 2026-11-21

## Patch 249: raid stutter

Owner supplied 9147.mp4 showing heavy stutter while deploying a large mixed army around a dense high-level base. Authorized fixing and publishing without another confirmation.

Changes:
- Retain three bounded downsample levels per sprite sheet rather than replacing the single cached size every frame. Mixed troop sizes and recoil transforms now reuse warm caches.
- Render wall and building-detail sprites at canonical sizes and scale the cached image when zoom changes. Keep wall connection, level and image-load invalidation.
- Cap dense-scene canvas resolution at 1.5x, adapt toward 1x under sustained load, and wait before raising resolution to avoid cache/resize oscillation. DOM controls remain unaffected.

Validation:
- Regression reproduces old image-cache churn: 336 canvas allocations per 120 mixed-size frames even after warm-up. Fixed: 6 initial allocations and zero additional allocations for the next 120 frames.
- Zoom reuse, wall topology/level changes, restored global zoom, and resolution hysteresis tests pass.
- Reward/ad recovery tests and full TZ=UTC npm test pass.
- Local Chromium launch is blocked by socket permissions. No actual handset FPS or browser screenshot verification claimed.

Publication target: existing main branch / Vercel project nova-striker-updates. Previous published revision: e6de8034c8f61e3b09df25d3841b3ce8353a8bbe (patch 248). Verify live /patches/test/native-42/manifest.json reports contentVersion 249 and matches the local manifest after deployment; do not call Git push alone a completed deployment.
