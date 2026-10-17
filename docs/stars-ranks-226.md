# Content 26 — enhancement insignia and online rendering cost

Buildings show 1–5 silver stars for +1–5 and 1–5 gold stars for +6–10; units and vehicles show matching rank chevrons. Both include the exact +level. Unenhanced, dead, and offscreen objects skip badges. Removes animated enhancement flames and their six-Hz home redraw request. Badge rendering uses bounded Canvas paths with no particle allocation, blur, or glow.

Online rendering changes:
- Static scouting previews no longer request a repaint at 10 Hz. Input, server updates and the normal HUD refresh still invalidate the scene.
- Spectator interpolation reuses one render-only object per live unit through a WeakMap instead of allocating a new object per unit per frame. Authoritative unit coordinates remain untouched; old snapshots can be garbage collected.
- Only online raid scenes on devices reporting navigator.deviceMemory <= 4 use a 1.25 canvas scale cap, instead of 2. At a prior 2x scale this reduces main and terrain backing pixels by about 61%. DOM menus retain normal resolution. Unknown-memory devices, offline play and home retain the existing resolution policy.

No changes to simulation timing, combat stats, pathfinding, transport cadence, purchases, server schema, or resource/timer settlement.

Validation: existing full npm suite passed; updated enhancement tests cover both insignia types at all +1–10 levels, silver/gold, offscreen/dead rejection and timer receipts. Transport tests check interpolation object reuse, unchanged authoritative coordinates and memory/online-specific scale policy. Existing performance tests passed after the scale change. Actual Chromium mobile viewport rendered buildings at +1, +3, +5, +6, +8, +10 and pending upgrade UI without page errors. Physical low-RAM Android latency remains to be measured on users' devices; no claim that all network/device lag is eliminated.
