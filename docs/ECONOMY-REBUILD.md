# NOVA economy rebuild — accepted scope, 6 November 2026

Status: design and tested policy foundation only; NOT integrated, deployed, or a complete economic rebalance.

## User decisions
- Include the whole economy, including secondary base, clan systems and hero equipment.
- For matched items use 90% of normal reference resource/NOVA costs and upgrade time. Production and storage follow the reference baseline.
- Normal troops train free and instantly, subject to unlocks and army housing. Special NOVA mechs need explicit mapping.
- Keep launch bonus 1,000 NOVA, once per newly registered account, not per character, for a 30-day campaign. No campaign dates or live grant are configured yet.
- Preserve existing balances, purchases, completed unlocks and already accepted transaction receipts.

## Resource mapping and missing gameplay
| Reference | NOVA mapping | Required work |
|---|---|---|
| Gold | Gold | Complete per-building/level costs, production and storage tables |
| Elixir | Energy | Same; revise current mixed gold/energy upgrade costs by building role |
| Dark Elixir | Crystals | Restore coherent production, storage, unlock and spending loops; current client prevents building crystalplant/crystalstore |
| Gems | NOVA | Align sinks and all free/paid sources; preserve launch gift |
| Shiny/Glowy/Starry Ore | Three equipment materials, names pending | Actual equipment, upgrades, reward sources, caps, and UI |
| Builder Gold/Elixir | Secondary-base resources, names pending | Secondary base, progression, production, storage, battles |
| Capital Gold | Clan construction resource, name pending | Clan membership, shared districts, contributions and permissions |
| Raid Medals | Clan raid reward currency, name pending | Raids, reward ledger and exchange shop |
| League Medals | Clan league reward currency, name pending | League seasons, eligibility and reward settlement |

This is not an assertion that the above new systems already exist. Temporary event currencies and cosmetic endgame currencies need a separate inventory and reference pass before claiming exhaustive parity.

## Verified current imbalance
Read-only production SQL showed builder prices 25/100/500/1500, construction speed completion ceil(seconds/10), and check-in 50 on days 1–6 / 200 on day 7. Thus a single daily claim buys builder 2 while one hour completion costs 360. Client main matches these values.
Resource purchases use a production-time-based quote, not the same fixed amount formula as construction completion. Do not replace all '/10' or all '500' literals globally.
Historical docs are stale: economy-229 describes one NOVA per 120 seconds whereas current code/live SQL use one per 10 seconds.

## Reference baseline
- Official builders: https://support.supercell.com/clash-of-clans/en/articles/builders-4.html — normal prices 250/500/1000/2000; candidate prices 225/450/900/1800.
- Free troop production: https://supercell.com/en/games/clashofclans/blog/news/home-village-changes-2/
- Instant training: https://supercell.com/en/games/clashofclans/blog/release-notes/welcome-to-clash-anytime-update/
- Loot/Star Bonus: https://support.supercell.com/clash-of-clans/en/articles/about-multiplayer-and-trophies-3.html
- Clan Capital: https://support.supercell.com/clash-of-clans/en/articles/what-is-the-clan-capital-3.html
- Raid rewards: https://support.supercell.com/clash-of-clans/en/articles/rewards-2.html
- League rewards: https://support.supercell.com/clash-of-clans/en/articles/clan-war-leagues-rewards-2.html
- EXCLUDE temporary Hammer Jam discounts: https://supercell.com/en/games/clashofclans/blog/news/hammer-jam-is-here-backup-has-arrived/

## Required implementation, in dependency order
1. Inventory every live grant/spend path, premium packs, existing balances and all building/unit levels. Match roles and unlock tiers; do not equate unrelated units just by level number.
2. Build versioned, sourced NORMAL tables for every mapped building/unit. Do not fill gaps with arbitrary numbers or temporary offers. Full per-level reference tables are not yet collected.
3. Implement shared client/server quotes and authoritative transactions; server checks quoted version, identity, ownership, resources, prerequisites and receipts. Existing operation receipts retain original prices.
4. Integrate free instant troop production on both sides; retire training-speed purchase/ads, preserve housing and reconcile paid pending queues.
5. Restore crystal resource loop. Implement secondary base, equipment and clan gameplay before enabling corresponding currencies.
6. Model 7/30/90-day progression from all income sources. Check-in amounts are deliberately not chosen yet; first include campaign, mining/referrals, ads and paid packs. A ten-percent price reduction alone cannot guarantee equal economic value.
7. Test client/server parity, retry/reconnect, concurrent spending, new/old accounts, full storage, upgrade queues and rollback. Publish content and server changes together only when integration is complete.

## Validation
Run: node --test tests/economy-rebuild-policy.test.cjs
This validates only the policy foundation, not live gameplay or database transactions.
