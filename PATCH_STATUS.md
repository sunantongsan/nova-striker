# NOVA patch handoff — 2026-11-27 (3)

## Patch 262 / 1.12.92-ruins-drops444

Owner: destroyed bases should sink/fade (some still showed their full shape); attacks still feel laggy; dropping troops should be as easy as Clash.

Changes:
- features/ruin444/ruin444.js (outermost drawBuilding): any destroyed non-wall building, HQ included, is drawn as a low, slightly faded rubble pile from combat-wrecks-171 on a scorched patch, settling in over 0.35 s with a dust burst; type-specific wreck art (charred cannon/silo/tanks/defense frames, tall 3D HQ wreck + HP bar) is no longer used in battle.
- features/deploy444/deploy444.js: a red-zone tap drops on the nearest open spot (≤3 tiles) and flashes the zone; streaming over the red zone keeps going. Online (v2) attacks queue taps while the previous deploy awaits the server instead of failing with "กำลังส่งคำสั่ง"; queued taps never exceed the troops left; each tap shows a white drop ring at once.
- game.js / army395: in battle a tap may wobble 13 units (was 7) before it becomes a pan; hold-to-stream starts after 220 ms (was 280).

Validation: tests/battle444.cjs (VM: rubble path, red-zone snap, online queue + cap); full TZ=UTC npm test passed. Headless: all-destroyed base screenshot shows only rubble; red-zone deploy errors 130 → 0 in the scripted drop test.

# NOVA patch handoff — 2026-11-27 (2)

## Patch 261 / 1.12.91-auto-mech444

Owner: remove player control of the mech entirely; the mech often dithers in one spot and won't push on.

Changes (features/auto444/auto444.js, bundled last; engine.js; ui.js):
- No manual control: joystick/skill panel and the home "บังคับหุ่น" button are hidden; selectTitan342 never grants control; battle taps on the mech pass through to troop deployment; home taps open the mech window. Deploy toast says it fights automatically.
- Routes are kept 2.5 s (was replanned every 0.7 s → back-and-forth), and replanned at once when the route runs out.
- Raiding mech stays on its chosen (non-wall) building until it falls, Clash-hero style.
- Progress watchdog every 1.5 s: if not closer / not moved and the target took no damage, cut the building in front (walls included), else leap toward the target, else skip that target for 6 s.

Validation: tests/battle444.cjs (VM: wall cut, leap, retarget, no manual select); shop348-ui updated for battle taps; full TZ=UTC npm test passed. Headless sim, mech alone 120 s, stall samples (3 s with <0.3 tile and no damage): stage 25 5→0, 40 1→0, 60 14→5 (remaining ones are guard-unit fights), destruction 58→75% (25), 23→29% (60).

# NOVA patch handoff — 2026-11-27

## Patch 260 / 1.12.90-smooth-battle444

Owner video: in a raid, after sending the mech every tap showed "หุ่นกำลังพักฟื้น" and no troop could be deployed; the battle was very choppy (~12 distinct frames/s with 0.3–0.6 s freezes in the recording).

Causes:
- The mech "armed" flag (deployTitan342) could stay on after the mech was out (a server reply re-arms it). The canvas tap handler then kept sending taps to the mech, which is "resting" as soon as it is damaged, and swallowed the tap.
- In battle the mech was re-rendered in WebGL and copied out (createImageBitmap) up to 30x/s; the enemy HQ robot re-rendered + copied on every aim/charge change (aim in 88 steps). Headless profile: ~2.1 s of 12 s in createImageBitmap with the mech on the field.
- Mech health was saved (whole save JSON to localStorage) every second while it took damage.

Changes:
- features/titan342/ui.js: mechSpent444 — if the mech is already on the field, used, or resting, a tap disarms the mech and goes to troop deployment.
- features/titan342/renderer.js: cached444 — battle poses (clip frame at 15 fps × 16 facings) are rendered once into 160x200 canvases and reused (LRU 120). Home base keeps the live idle animation path.
- features/titan342/hq-renderer.js: HQ poses memoised by signature (aim 24 steps, charge quarters, LRU 32).
- features/titan342/engine.js: mech recovery save during battle at most every 4 s.

Validation: tests/battle444.cjs (tap routing in a VM + cache guards); full TZ=UTC npm test passed. Headless Chrome before/after close-ups of mech and HQ match. No physical-phone FPS measured.

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
