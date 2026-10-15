# Crystal enhancements — content patch 10

Enhancements are account-owned per troop or building type, from +0 to +10. Each successful level adds 10% of base HP and attack/healing, linearly (maximum 2x). Base values include current building level and applicable research. Noncombat buildings gain HP only. One purchase applies to all units/buildings of the same type. Alien mercenaries have their own upgrade key.

The next level N costs 100*N*N crystals. Success is guaranteed. Server receipts prevent duplicate charges and increments; insufficient balances and purchases during a live battle are rejected. The client durably retries pending requests. Neither type levels nor enhancement maps are imported from the client.

Troop information is accessible in the training menu and the enhancement menu. Buildings have an information/enhancement button on selection. Tables show base and enhanced HP and attack/healing. +5 green, +6 cyan, +7 blue, +8 purple, +9 gold: silhouette glow and ground aura; +10 adds animated flames. Effects use the existing canvas renderer and no additional image assets.

Combat consumes the same multipliers as the stat display. Defender loadouts are frozen in the server room snapshot; each attacking order carries its owner's enhancement and weapon/armor research. Compact frames retain enhancement metadata on host handoff. Existing offensive/defensive training and army economy remain in place. Offline defense gun/HQ damage was aligned to the player-battle stats so displayed values match both modes.

Validation includes real PGlite SQL migrations, exact charge/replay/cap checks, unauthorized access denial, frozen combat loadouts, stat tables, unit HP and actual damage, building HP, defender research stacking, rendering smoke tests and the prior siege regression suite. Physical-device visual/performance testing remains outstanding.
