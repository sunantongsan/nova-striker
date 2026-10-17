# Content 27 — commander header and rocket batteries

The compact header now has a selectable commander portrait, prominent base name and small NOVA COMMAND label. Four existing atlas characters are available; only the preset index is stored in the campaign save, included in existing cloud backups. Invalid choices and save failures retain the prior portrait. This release uses supplied portraits, one of the user's alternatives. Device photo upload is not included: native 19–21 lack an image-picker bridge.

Rocket batteries retain their original pedestal, with a new three-tube rotating launcher. Rendering and projectile origin share screen bearing, height and recoil geometry. Ground missiles now have a 0.9-second visual lifetime, high arc, bounded nine-puff dark smoke trail and larger endpoint blast. Visual transport includes launch offsets and high-arc lifetime. This retains the existing immediate-hit simulation model; projectile flight is visual.

Splash radius increases from 1.5 to 2.2 cells for rocket batteries in raids and wave defense; secondary damage remains 50%, primary damage/range/fire rate are unchanged. Splash centers are captured before the primary hit so knockback cannot move the blast area. Air units remain excluded.

HQ levels 1 / 5 / 10 / 15 unlock 1 / 2 / 3 / 4 batteries. The construction menu shows the current limit and unlock levels. Production migration nova_rocket_caps_227 was applied to uzinxxeadejmzxqmqqtx on 2026-10-17. It updates only the existing formation validator, preserving function permissions and timer/payment code. Post-application checks confirmed the marker, private alias remains inaccessible, and timer response is preserved.

Validation: full npm suite passed, including new client/server HQ-boundary and max-four tests, duplicate placement rejection, idempotent migration, unchanged private ACL/timer protocol, multi-target ground splash and aircraft immunity. UI tests cover portrait choice, invalid choice and failed-save recovery. Chromium mobile viewport inspected the header, portrait picker, saved choice, rotating launcher and upgrade menu without page errors. Actual Android hardware performance remains a device check.
