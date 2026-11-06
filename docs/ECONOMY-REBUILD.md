# NOVA economy rebuild — current scope and status

## Accepted scope
- Keep the 1,000 NOVA new-account launch bonus and 30-day campaign.
- Main base plus ONE personal secondary base. No clan base, raid medals or league currency.
- Add four resources: two robot-equipment materials (proposed names Alloy and Energy Core), secondary-base Gold and Energy. Existing main-base Gold, Energy, Crystals and NOVA remain.
- Match normal Clash reference progression with 90% resource/NOVA costs and 90% upgrade times for equivalent items. Production/storage use normal reference rates.
- Ordinary army production is free and immediate; unlock, housing, branch capacity and combat restrictions remain.
- Protect existing balances, permanent purchases and accepted receipts.

## Implemented candidate (NOT deployed)
- Shared client remaining-time price used by construction, research, legacy production queues and transport production.
- Reference anchors: one minute 1 Gem, one hour 20, one day 260, one week 1,000. Linear interpolation of the base gem curve, floor to whole reference gems, then ceil(90%) with minimum 1 NOVA for positive time.
- Resulting anchor prices: 1 / 18 / 234 / 900 NOVA. Integer rounding means tiny prices cannot be exactly 10% lower.
- These time anchors are from community reference calculations, NOT an official current Supercell API: https://clashofclans.spokland.com/guide_tutorial/gem_calculations and https://coc.tools/about . Review them against current in-game prices before calling the schedule exact current-game parity.
- Builder 2–5 prices 225/450/900/1,800, based on official normal prices: https://support.supercell.com/clash-of-clans/en/articles/builders-4.html
- Free, instant ordinary training implemented in both legacy train and current army-menu train278, with failed-save rollback.
- Production source resets ordinary unit energy/crystal cost and training time to zero. Existing paid queues remain available for completion; no retroactive refund/mint.
- Guarded atomic server SQL updates construction/research support and both robot speed quote/debit functions. It is NOT applied to production.
- New-account bonus amount is preserved in the policy; the promotional grant itself is still not implemented.

## Validation completed
17 tests pass: reference anchors, monotonicity, client/SQL parity over 215 samples, invalid input, quoted-price protection, duplicate local completion, army unlock/housing, save rollback and policy invariants.
No claim of full assembled-app/browser validation, all historical regression suites, full live-RPC receipt tests or deployment.

## Still required before release
- Full current normal reference tables and building/unit equivalence mapping. NORMAL UPGRADE DURATIONS AND RESOURCE COSTS HAVE NOT YET BEEN REPLACED. Do not just multiply old NOVA formulas by 0.9 and claim equivalence.
- Main crystal production/storage restoration.
- All source/sink budget model: check-in, campaign, mining/referrals, ads and premium packs. Check-in is unchanged pending this model.
- Two-material robot equipment gameplay and secondary base with independent currencies, production, storage and battle progression.
- Full client/server integration tests and UI inspection, including pricing with old outstanding receipts.
- Coordinated content patch and database release. Current production remains unchanged.

## Authoritative behavior references
Free training: https://supercell.com/en/games/clashofclans/blog/news/home-village-changes-2/
Instant training: https://supercell.com/en/games/clashofclans/blog/release-notes/welcome-to-clash-anytime-update/
Exclude temporary 50% Hammer Jam discounts from normal baseline: https://supercell.com/en/games/clashofclans/blog/news/hammer-jam-is-here-backup-has-arrived/
