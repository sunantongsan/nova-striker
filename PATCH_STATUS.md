# NOVA patch handoff — 2026-11-26

## Patch 257 / 1.12.87-scroll-taps447

Owner video: in the Army window, scrolling the troop list kept pressing "+ ผลิต" / info buttons by accident; buttons felt too big.

Cause: tap407 fires a window button on pointerup *and* on pointercancel. WebView sends pointercancel when it takes a touch over for scrolling, so a scroll that started on a button pressed it.

Changes (features/tap447/tap447.js, bundled after perf443):
- Inside #modal, a touch that moves >9 px, scrolls anything, or is cancelled by the browser counts as a scroll; the following click (407 synthetic or native) is swallowed for 450 ms.
- Smaller window buttons: train 30→24 px, filter/tabs 26 px, super-troop bar 28 px, attack-hub cards 118→76 px, "ฝึกทหาร" 34→28 px.

Validation: tests/tap447.cjs; full TZ=UTC npm test passed; patch manifest builds. Headless Chrome (844x390, touch): before, a drag starting on "+ ผลิต" trained a troop; after, it does not, and a plain tap still trains.

# NOVA patch handoff — 2026-11-21

## Patch 255 / 1.12.85-smooth443

Owner reported heavy stutter on the home base, worst while buildings upgrade, and rewarded ads not loading. Publishing is authorized (AGENTS.md).

Findings (owner's HQ20 base, 151 buildings, loaded locally in headless Chrome):
- A base with no animation is not redrawn, but any busy builder, guard or mech redraws the whole village every frame at ~60 fps.
- Energy-cannon heads, rocket/turret heads and the guard robot were drawn rotated/squashed straight from large sheets (energy-coil 2172x724, guard 768x702). Measured 1.9 ms vs 0.1 ms per draw from a small crop.
- The 3D mech pose was copied from the WebGL canvas into a 2D canvas up to 30 times/s (synchronous GPU read-back).
- frameCost420 timed only JavaScript, so graphics-bound phones never dropped to 30 fps or lower resolution.

Changes (features/perf443/perf443.js, bundled after juice438; renderer.js):
- Rotated/squashed or strongly shrunk draws from pictures >= 256x256 come from cached crops at the on-screen size (~19% size buckets, 48 per picture, at most 6 new per frame). 437h still handles straight draws from the huge sheets.
- Mech pose snapshots use createImageBitmap (no blocking read-back); first frame and unsupported devices keep the old canvas copy.
- Home village at rest redraws at 30 fps; any touch/pan/zoom restores full speed for 1.2 s.
- If frames arrive >9 ms later than requested while code is quick, hold 30 fps for 15 s; below ~24 fps also lowers render scale through 441's hysteresis.

Validation: tests/performance443.cjs; full TZ=UTC npm test passed; patch manifest builds. Local main-thread work on the owner's layout during an upgrade (mech excluded) dropped 3.0 s -> 2.1 s per 5 s. Rendering compared side by side with the previous build. No physical-phone FPS measured.

Ads (no code change): server gate admob230 is enabled; 7 AdMob reward intents created, 0 ever verified; the owner's save shows status unavailable. The native build requests real units. AdMob only serves after the account/app is approved and the app is linked to its Play listing (docs/admob-setup.md: linking found no matching app). Ad-unit or SDK changes would need a new Play release, not a content patch.

Publication: existing main branch -> nova-striker-updates Vercel. Verify live /patches/test/native-43/manifest.json reports 255.
