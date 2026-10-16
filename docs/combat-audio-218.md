# Combat audio content patch 18

Original procedural Web Audio music: four-chord base arpeggio, bass and faster combat percussion. Separate persistent music and weapon toggles in Settings. Starts after a user gesture; suspends in background. Weapon-specific filtered noise and pitched transients replace generic combat beeps. A compressor, per-type rate limits, 24-source cap and onended disconnects bound audio work.

Existing missile turrets and fighters now show shaped directional rockets with exhaust, curved flight and nine fading smoke puffs. Explosive hits add fire lobes, cooling smoke, sparks and a short flash; weapons add muzzle flashes. Fixed loops use the existing scene FX limits. Original reference-inspired effects; no extracted audio or art from reference games.

No unit IDs, economy, damage values, save schema, native contracts or server data change. Existing immediate-hit combat timing is retained. No claim of physically simulated projectiles or a new rocket unit.

Validation: full npm test, additional audio218 test (each weapon, sound deduplication, render phases, mute persistence, background suspend, source cap and cleanup). Local Chromium visual check was blocked because the browser download failed. Real Android audio balance/performance still needs device testing.
