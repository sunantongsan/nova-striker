# NOVA balance 285 (test patch 85)

This is a first balance pass validated by deterministic combat and economy regression tests, not a claim of a measured 50% PvP win rate. Real match results should guide later tuning.

## Combat

| Weapon | Ground | Air |
|---|---|---|
| Energy artillery | Yes | No |
| Ground rocket battery | Yes | No |
| Plasma turret | Yes | Yes |
| Tesla tower | Yes | Yes |
| Underground missile silo | No | Yes |

Ground artillery, tank shells, grenades, bombs and their splash cannot damage airborne drones. Medic drones retain direct flight across walls. Selection and damage use the same rule; ground defenders do not waste shots on aircraft. Landed transports can still be hit by ground weapons.

Bomber: HP 450 → 720 (+60%); damage 149.5 → 230 (+53.8%); power 240 → 360 (+50%); training 28 → 36 seconds; capacity remains 6. HP per power changes 1.875 → 2.0; damage per power 0.623 → 0.639. It remains vulnerable to the existing tracking silo missile, which destroys a hit aircraft and retains its 1% escape chance. Silo ammo remains 1/2/3 at levels 1/6/11, so bombers can be countered without making every turret anti-air.

Plasma reload is 0.9 seconds and Tesla reload 1.4 seconds in both raid and wave defense. Tesla chain damage is 45% within 1.3 cells in both modes. Artillery/ground rockets remain 2.4 seconds. This removes mode-dependent defensive firepower. Existing artillery artwork and sequential volleys are preserved.

## Construction and NOVA

| Item | Old gold / power | New gold / power |
|---|---:|---:|
| Energy mine | 12,000 / 8,000 | 1,200 / 800 |
| Underground missile silo | 80,000 / 60,000 | 6,000 / 4,000 |

These defenses unlock at HQ3; their old combined costs were 83 and 583 old bombers respectively. The revised combined costs are 5.6 and 27.8 new bombers, before different resource production rates. They retain their single-battle ammo limits. Existing building counts, level gates, storage ceilings and other base prices remain unchanged; upgrade quotes inherit the new base prices.

Enhancement to level n costs 50*n*(n+1) NOVA for troops, buildings and transports alike: 100, 300, 600, 1,000, 1,500, 2,100, 2,800, 3,600, 4,500, 5,500. Total +1 through +10 is 22,000 (was 38,500). Stat growth remains +10% per enhancement and the cap remains +10. Server-checked price quotes, replay protection, ownership and combat locks remain intact. Existing paid receipts are honored; old client quotes cannot silently charge a different amount.

## Ads and resource valuation

Retain verified voluntary production ads at 30 minutes of the player's actual production, including production-path bonuses, clipped to free storage. At one level-1 extractor this is 1,080 resources; at three level-20 extractors with +100% production it is 129,600 per resource before storage clipping. At 1 NOVA per 120 production seconds, 30 minutes is 15 NOVA per resource, or up to 30 NOVA for both resources. This is below the 50-NOVA-equivalent timer ad, so no reward inflation is needed.

Retain timer ads at up to 500 seconds (8m20s), equal to 50 NOVA at 10 seconds/NOVA, capped by remaining work. No new ad gate or daily limit is introduced. Rewards still require provider verification; callbacks alone do not credit currency. Correct the legacy resource preview's erroneous paid +20% bonus and missing production-path multiplier to match server quotes. Ad-minting and existing receipts are not altered.

## Release

Apply `backend/nova_balance_285.sql` to the linked database; it changes only the authenticated enhancement price formula and preserves ACLs. Publish patch 85. No native API change or app uninstall is required.
