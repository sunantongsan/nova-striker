# NOVA patch handoff — 2026-11-21

## Patch 250 / 1.12.80-mech442

Owner requested continued performance work, normal NOVA mech walking, passage through destroyed buildings, a repair flow that does not lock and confirms success audibly, and a coin sound after paid production acceleration. Publishing is authorized.

Changes:
- Nearest-target searches select one candidate in a linear pass rather than sorting the whole candidate list. Distance calculations avoid Math.hypot overhead in the combat hot path.
- 3D mech poses use a per-instance canvas cache (30 updates/s in motion, 10 at idle); screen positioning and combat simulation continue separately. Animation time uses real elapsed time rather than a fixed 33 ms per display frame.
- Use the model's actual Walk clip for normal movement. Dash and attack animation priorities remain intact. Movement flag/direction follow actual displacement; steering precedes obstacle jumping.
- Dead buildings never block mech collision. Destruction invalidates stale routes immediately; cleared ground gets a direct path, intact obstacles use grid routing. Home buildings remain solid without cloning every building each frame.
- Confirmed non-resting server state clears local recovery. Request timeout/native bridge failure releases controls; payment retries retain their idempotency identity. Response account and persistence gates precede success feedback.
- Repair success and paid production completion use a short three-note coin chime. Muted audio, failed saves and duplicate confirmation do not play success.

Validation:
- New mech442 tests cover cadence at 30/60/120 Hz, pose render budget, attack priority, rubble passage, stale-route invalidation, intact/home collision and blocked movement flag.
- New repair442 tests cover successful repair, timeout, thrown bridge call, network error, stable retry IDs, duplicate responses, wrong account, failed persistence and newer unacknowledged battle recovery.
- Paid production tests cover duplicate confirmation and failed-save audio gates.
- Full TZ=UTC npm test passed. Android patch and Telegram content builds passed. Integrated game and renderer syntax passed.
- Local browser is unavailable because Chromium cannot open sockets in this executor. No actual-phone FPS or visual gait verification claimed; do not promise Clash of Clans parity.

Publication: existing main branch -> nova-striker-updates Vercel. Prior published commit f39bae817c48523fbacdacc11254f80884236143 (249). Verify live /patches/test/native-42/manifest.json reports 250 and equals the tested local manifest, then verify changed objects. Git publication alone is not completion.
