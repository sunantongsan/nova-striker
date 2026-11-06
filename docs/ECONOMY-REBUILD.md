# NOVA economy rebuild — scope and release status

Status: DRAFT ONLY. No production database changes, patch publication, native release, Play product activation or live-ad enablement has been performed.

## Accepted scope

- Main base plus one personal secondary base; no clan, clan base, clan wars or clan currencies.
- Four new resources: Alloy and Energy Core for robot equipment, plus independent secondary-base Gold and Energy. Names are provisional. Existing Gold, Energy, Crystals and NOVA remain.
- Reference normal progression with 90% resource/NOVA costs and 90% upgrade times for comparable items. Exclude temporary event discounts.
- Explicit exception to current Clash training: ordinary troops MUST consume resources and take time. Existing Nova paid/timed training is restored in both train and train278. No free/instant training is introduced.
- Launch bonus: 1,000 NOVA once per new authenticated account during a 30-day campaign. Character changes never reset eligibility. Existing welcome grants remain separate.
- Preserve balances, existing queues, permanent purchases and original purchased entitlements.

## Implemented candidate

### Pricing and troop production

- Shared client remaining-time curve for construction, research, production queues and transport production.
- Anchors after discount: 1 minute = 1 NOVA, 1 hour = 18, 1 day = 234, 1 week = 900. Minimum one NOVA for a positive timer. Linear reference interpolation, floor reference gems, then ceil(90%).
- Time anchors are community references, not verified exact current-game parity: https://clashofclans.spokland.com/guide_tutorial/gem_calculations and https://coc.tools/about .
- Builder 2–5: 225 / 450 / 900 / 1,800 based on official baseline https://support.supercell.com/clash-of-clans/en/articles/builders-4.html .
- Guarded migration 365 updates server support pricing, robot production/upgrade/recovery debit and their corresponding quotes. Not applied to production.
- Paid/timed troop creation enforces unlock and capacity limits. Failed persistence rolls back both resources and queue changes. Existing training prices remain unchanged pending the full resource model.

### Main building progression (369 candidate)

- Assembled game now loads `features/economy-rebuild/progression369.js` for 13 building types through level 20.
- Mapped cost/time use 90% of the checked-in reference numbers. Nova storage is a deliberate exception: costs are capped at 85% of attainable four dedicated plus two shared stores at the preceding level.
- Above the reference level ceiling, the explicitly custom Nova extension adds 10% per level, rounded up. Unique unmapped Nova buildings retain their existing prices; this is not an exact reference-game conversion.
- Walls stay instant. Existing balances, levels and already-started deadlines remain unchanged.
- Construction, upgrades, wall batches and local speed purchases roll back debit/timer changes on failed persistence.
- Examples: HQ2 = 900 gold / 9 seconds; HQ3 = 3,600 gold / 27 minutes; HQ5 = 135,000 gold / 5h24m; HQ10 = 3,150,000 gold / 2d16h48m (storage cap applied).
- Focused validation: 44 node:test cases plus production359 and economy358 regression scripts pass. Full historic release suite and phone validation are still required. Not published.

### New premium products

| Price THB | New product | NOVA |
|---:|---|---:|
| 30 | nova_1000 | 1,000 |
| 59 | nova_2100 | 2,100 |
| 99 | nova_3600 | 3,600 |
| 199 | nova_7600 | 7,600 |
| 399 | nova_16000 | 16,000 |
| 799 | nova_34000 | 34,000 |

Client store, Android allowlist, verifier and migration 366 agree. Value per baht increases at every tier. Old SKUs are absent from the new sale catalog but remain restorable at their original amounts, including 180,000. Do NOT reduce the legacy receipt mapping or deactivate legacy DB product rows. New Play products and the new native app have not been published.

### Account rewards

- Migration 367 adds once-per-account launch grants and a 5 NOVA/video ledger, six reserved/verified rewards per Thai calendar day.
- Currency grants require signed AdMob SSV verification; the client callback alone grants nothing. Each provider intent can be consumed once. Pending receipts survive reconnects.
- Shop reward UI uses the existing verified native transport and cumulative external-credit delivery cursor. Failed local saves retain the pending receipt. Replies from a prior account are discarded.
- Migration 368 changes new production/construction/research speed-ad receipts to 900 seconds, six reservations per Thai calendar day. Existing 500-second receipts retain their promised value. It does not enable ads. New test-provider speed receipts are blocked; already-issued legacy receipts retain their existing validation path.
- The six speed videos are a separate daily quota from the six NOVA videos; this candidate allows up to 30 NOVA and 90 minutes from these two channels per day. Other existing ad channels are not yet globally consolidated.
- Launch dates remain NULL. Installing the migration starts no campaign. Set dates in the coordinated release, after native/client/backend validation.

## Reference research

`features/economy-rebuild/reference-candidate.json` contains 356 level rows for 26 main/secondary reference buildings, retrieved 2026-11-06 from ClashKing's extracted data. The extracted candidate file is not loaded directly; progression369 contains the adapted main-building runtime values. Only factual upgrade numbers and identifiers are included; no reference-game artwork or descriptive text is copied.

Candidate mappings are by building function. They do not establish equivalent combat balance. The reference has different level ceilings from Nova's HQ20/building-level20 progression. Do not lower existing player levels or silently extrapolate the missing levels.

## Validation

38 targeted tests passed across policy, assembled game engine, pricing/SQL parity, purchase receipts, backend reward ledgers and UI reward callbacks. The assembled content script also parses successfully. Coverage includes signed-verification gating, repeated claims, daily quotas, anonymous/old-account launch exclusion, cross-account isolation, save rollback, retained old product entitlements and retained old speed receipts.

Not yet validated: complete migration chain against a production clone, Android compilation/device purchase restore, Play product availability, real AdMob callback round trip, visual browser/device layout or complete historic regression suites.

## Still required before release

1. Implement the personal secondary base and the two-material robot equipment gameplay. Neither is implemented yet; no clan system is added.
2. Validate normal reference version and map all Nova buildings/units, including unmatched unique units and levels. The 13 mapped main-building types use adapted tables in the candidate; unique buildings and units still need complete progression review.
3. Integrate production rates, storage capacity, crystal production/storage, research, unit production and battle rewards. Avoid upgrades priced above obtainable storage.
4. Budget all currency sources together: check-in, campaign, mining/referrals, ad channels, launch and purchases. Daily check-in remains unchanged; do not call the full economy balanced.
5. Coordinate new Play products/native app, verifier deployment, SQL migrations and content patch, with restore/replay testing. Keep live ads off pending approval. Set launch campaign dates only at release.

No COCKRO implementation changes are included in this Nova PR.

