# Patch 13 — purchased alien mercenaries

Alien barracks no longer produce troops over time. Existing totals are preserved. Capacity remains 10 + 2 × building level (12 at level 1, 40 at level 15). Building upgrades do not increase unit stats.

The initial recruit costs 150 power and arrives immediately from the training screen. Unlock requires an active mercenary base level 1 and research building level 2. Mechanics match the existing fighter (kind 5): HP 330, damage 48, range 2.6, attack interval 0.6 seconds, speed 2.6, air movement. Existing alien artwork remains. Weapon/armor research and alien enhancement apply; future unit variants are not introduced in this patch.

Server validates unlock, capacity, power balance and battle lock. Recruitment is one transaction with an account-bound receipt. Power delta reconciliation handles replay and stale snapshots. Client persists the purchase nonce, retries transient failures with cooldown, clears terminal failures, and never credits troops optimistically. Existing half attack / half defense and casualty return logic remains unchanged.

New room defender snapshots identify mercenary version 2. New alien deployment orders use fighter kind 5. Existing in-flight rooms keep their old kind 2 orders and snapshots. Restart clients for consistent new rendering and stats.

PGlite and VM regressions cover disabled passive production, capacity upgrades, exact charge, nonce replay, insufficient resources, unlocks, battle lock, private helper permissions, purchase UI, resource delta reconciliation and fighter parity. Physical-device combat not tested.
