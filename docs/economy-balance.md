# Proposed economy balance

Status: prepared and locally tested; production migration was blocked by automatic approval review. Do not publish content until the migration is explicitly approved and verified.

## Rates

- Crystal production: 1,200 × plant level per hour (10× previous), stopping at capacity.
- 10 gems buy 5,000 gold, 5,000 power, or 1,000 crystals.
- 50,000 gold or power, or 10,000 crystals, sell for 1 gem.
- A full buy/sell cycle loses 99% of gems, preventing exchange loops from generating value.
- Daily promotional 10,000 gems remain unchanged. This deliberately overwhelms normal progression while the promotion runs; these rates are a starting balance, not a claim of identical Clash of Clans pacing.

## Progression

- Gold/power capacity: 50,000 + 10,000 per HQ level above 1 + 20,000 per applicable storage level.
- Crystal capacity: 20,000 + 80,000 per crystal storage level.
- Normal upgrades: original gold/power price × max(1, (current level − 2)²).
- Crystal upgrade price from level 5: 200 × (current level − 4)².
- Normal upgrade duration: 15 × level seconds at levels 1–2, then 60 × level × (level − 1) seconds.
- Online crystal infrastructure: 200 × level² crystals for new requests. Existing pending requests retain their legacy price.

## Raids

- Available loot for each resource is 60% of the defender's balance, multiplied by destruction percentage and limited by attacker capacity.
- Server transfers the same gold, power and crystals deducted from the defender; gems are not part of raid balances.
- Retry request IDs preserve reports and cannot transfer loot twice.
- Gold/power retain the existing client-side economy. The server mirrors snapshots, estimates production between snapshots, and returns cumulative raid deltas. Stale snapshot sequences cannot restore stolen resources.
- This is not a fully server-authoritative gold/power economy or anti-cheat solution. Offline spending and multi-device saves can diverge until synchronization; a later authoritative economy migration would be needed for competitive robustness.
- Crystal balances, exchange receipts and raid transfers remain server controlled.

## Release and rollback

Apply backend/nova_economy_180.sql in one database migration transaction, verify functions and security, then publish a new content version. Keep existing receipt formats and legacy exchange prices for pending requests. Failure during migration rolls back the SQL transaction. After live raids/transfers, do not restore old balances wholesale; roll forward with a corrective migration to preserve legitimate transfers.

## Validation

Existing combat, upgrade, production and wallet suites plus tests/economy180.cjs and tests/upgrade-simple.cjs cover rates, capacity, receipt retries, reverse exchanges, stale snapshots, raid reconciliation and anonymous/direct-write denial.
