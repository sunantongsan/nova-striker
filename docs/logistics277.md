# Transport logistics — content patch 77

Ground troops are assigned by touch/pointer drag or accessible tap/keyboard into individual transports. Manifest assignment never consumes inventory. Launch deducts cargo, manual release spawns it, ship destruction kills remaining cargo, and settlement returns only survivors. Presets are clamped to current inventory and capacity. Existing players retain their units and receive one starter transport; overflow prevents further production, not deletion.

Fleet limits: HQ 1/4/7/10/13 unlock 1/2/3/4/5 ships. Capacities: 12/18/24/32/40 spaces. New ships cost 800 gold and 500 energy, taking 30 seconds. Upgrades require skyport levels 3/6/9/12, cost 1200/800 times current tier and take 60 seconds times current tier. Losses require rebuilding. Each ship has 1800 + 850 × tier HP. Airborne ships are vulnerable to dual-purpose plasma/Tesla/HQ guns; landed ships also take ground rocket and energy mortar damage. Cargo exits every .55 seconds; fixed maximum 150 deployed units per battle. Air units never occupy cargo.

Army camps retain their ground-space progression; skyports provide 12 + 8 × level air spaces, independent of transport slots. Camp and skyport inspection show illustrated inventory. Idle combat units are not rendered in the village.

Bombers take direct target orders for a selected count or all, fly through once, exit the battlefield, wait four seconds and re-enter. Helicopters prioritize defenses. Medical drones prioritize the lowest health percentage among nearby ground units. End-of-battle evacuation is a skippable presentation after settlement; rescue transport covers missing transport capacity.

Online cargo uses existing authenticated siege unit orders plus private metadata and idempotent control events. Cargo is withheld until manual release; the host and spectators serialize ships and bomber sorties. Host handover retains cargo/order identities and unload state. Survivor return is server-settled and replay-safe. Final results include destroyed transport IDs so compact terminal messages still remove lost ships. No production user balances were edited.

Art: built-in imagegen, transparent 2×2 atlas, packaged as assets/logistics277.webp. Prompt: polished isometric white/royal-blue/gold sci-fi VTOL armored transport, two views, open ramp/closed ramp, cyan downward thrusters; empty army camp and skyport; no visible people/vehicles in buildings, transparent background, matching bright NOVA cartoon style. Atlas normalized into padded equal cells without repainting.

Voice: ten embedded English TTS clips, soldier and digitally filtered robot sets: selection, moving, boarding, returning, capacity full. Embedded for offline Android patches; no external audio request during play. 650 ms debounce, one active voice, independent volume slider.

Verification: engine lifecycle/casualty tests, compact-UI and host handover tests, PGlite ownership/idempotency/survivor tests, existing regression suite. Canvas rendering inspected for actual ship/building geometry. Browser screenshot testing was unavailable because the Chromium download failed; no physical-device test claimed.
