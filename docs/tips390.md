# Guide tips 390 (Clash-style periodic advisor)

After the 8-step first-play guide, the NOVA guide drone keeps teaching in small doses, like Clash of Clans: a pastel coach card appears at real milestones, highlights the relevant button, and offers one action ("Open Build", "Open Army"...) or "Later".

Triggers (each once per account, at most one new tip every 90 s, only on the home screen with no window open, never while the first-play guide runs):
- HQ level-up 2…N: lists buildings newly unlocked or allowed in greater number (computed from `B[type].require` and `E.buildCap`, so future buildings are covered automatically). HQ10 also mentions the NOVA guardian mech.
- HQ1 with a developed starter base: upgrade the Headquarters.
- Gold or energy storage ≥ 98 % full.
- All builder drones busy (single builder, HQ ≥ 2).
- Barracks built but no troops and empty queue.
- Troops ready and campaign stage ≤ 2: try Missions.
- HQ ≥ 3 without walls; HQ ≥ 3 with a plasma turret: try home defense.

State lives in `save.tips390 = {seen:{id:1}, off, hq}` (additive, backward compatible). Existing bases are baselined on first load: past HQ milestones are marked seen, and HQ ≥ 5 also skips the beginner situational tips. Settings gains "Gameplay tips: On/Off" and "Replay all tips".

Tests: `node tests/tips390.cjs`. Visual check was done in Chromium at 844×390 and 390×844, Thai and English.
