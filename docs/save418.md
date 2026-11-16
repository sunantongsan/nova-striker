# Base backup and auto-restore (patch 218)

Bases must never be lost to a patch, a reinstall or a new phone.

- `features/save418/save418.js`: every signed-in player's whole local save is copied to the server (`nova_private.saves418`) every 4 minutes and when the app goes to the background, but only after the server copy was checked at start. On start and on sign-in the game asks for the copy (retrying until it gets an answer). If the phone's Command Center is lower than the server's, the server base comes back automatically for a brand-new base (HQ ≤ 2, ≤ 25 buildings) or after one tap otherwise. The phone base is kept in `localStorage.novaRTSBeforeRestore418` first. Without a full copy the best published layout (live `nova_war_players` or the 412 backup) is used. Requests go through `test_status` with their own `save418-` ids, so they never block other online actions. Replaces the one-time `features/restore412`.
- Server (`supabase/migrations/20261116140000_nova_save418.sql`): a copy with a lower Command Center never replaces a higher one (old copies kept in `save_history418`, 20 per player). Trigger `layout_guard418` refuses any published layout with a lower Command Center than the current one and keeps the last 30 layouts in `layout_history418`.
- `game.js` (before `new Engine`): a save that would fail the Engine check is repaired instead of being replaced by a new base. Unknown building types are parked in `d.parked418` and come back once known; extra troop slots go to `d.army418`; an untouched copy is kept in `localStorage.novaRTS1Rescue418`.
- Rule for future patches: new building types / troop slots must be registered before `var E=new Engine(...)`, and never remove a type that saves may hold.
- Regression: `tests/save418-browser.cjs`.
