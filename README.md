# Nova Striker RTS 1.3.0
A lightweight Thai offline base-building and alien-raiding game, Android package `com.sunantongsan.novastriker`, version code 10.

12 buildings, 9 units, 20 stages; animated construction clocks, tech-level unlocks, air units, splash bombing, daily diamond rewards, resource exchange and confirmed building speedups. Preserves the `novaRTS1` save from 1.2.0.

Run gameplay verification: `node tests/rts.cjs`. Android CI verifies AndroidX versions, builds APK and AAB. Existing Play upload signing key required; do not replace it. Use internal testing for updates to an installed Play copy.

Production rewarded ads still need a rewarded ad unit ID (not an interstitial ID). Debug only uses Google's test rewarded ads. Real money purchases, Google/Play Games login and cloud saves are not active. See ONLINE-DESIGN.md for integration and activation requirements. The offline wallet is not a secure paid wallet. No PvP/clans, and home defense buildings currently have no home-invasion simulation.

Art: existing 4x4 atlas plus a new 3x3 expansion atlas generated with built-in imagegen. Prompt: bright cartoon isometric sci-fi blue/cream/gold airbase, crystal lab, warehouse, fighter, bomber, sniper, shield mech, diamond and reward chest; isolated on a transparent background with equal cells. Runtime WebP atlas is 768px for low-memory devices.
