# Nova Striker RTS 1.4.0 (Android versionCode 11)

Lightweight portrait Canvas RTS for the existing `com.sunantongsan.novastriker` Play application. Install updates through Play internal testing; preserve the current signing identity and `novaRTS1` saves.

## Playable in 1.4
- Gold and energy show current / maximum. Base capacity 2,000 each; HQ adds 1,000 per level; completed warehouses add 2,000 per level each.
- Automatic production online/offline until storage is full. No collect button, no banked production behind full stores. Existing balances above capacity are preserved. Buying a 500-resource pack is rejected without charging if storage cannot fit it.
- Walls connect to orthogonal neighbours; destroyed segments break the line. Upgrade one piece, either contiguous row, or the connected component with a confirmed total and stale-quote protection. Wall batch upgrades are instant and require a free builder.
- Voluntary home-defense waves, with plasma and lightning turrets, wall obstacles, rewards, free repair afterwards, and increasing wave difficulty. No offline raids or PvP claims.
- Daily missions (build, train, campaign victories, defense), boss structures every fifth campaign stage, full training-queue diamond speed-up, unit statistics, optional synthesized sound effects, movement bobbing, level-specific building modules/beacons.
- Previous airbase/laboratory unlocks, 9 units, construction timers, check-ins and diamond economy remain.

## Online activation status — deliberately disabled in this build
`NovaCloud.java` implements external-browser Google PKCE login, Keystore-encrypted sessions, owner-private manual backup/restore, revision conflicts, logout and deletion of Nova's cloud save. `NOVA_CLOUD_ENABLED=false` until end-to-end device verification and provider configuration are complete. No online promise is shown in the playable build.

The `nova_rts_saves` table and owner RLS policies were deployed to the existing Supabase project. `backend/nova_cloud.sql` records that migration. Backups are client-written offline campaigns; they are NOT authoritative wallets, paid balances or PvP state. Google Play Games, billing and production rewarded-ad configuration remain unavailable.

Before enabling: configure the exact callback `novastriker://auth/callback` in Supabase (dashboard login required), verify Google OAuth consent/audience for testers, test login/cancellation/restart/refresh/two-device conflicts/deletion on an Android device, update privacy policy and Play Data safety, then enable the build flag. Do not change the existing shared project's Site URL or other apps' redirects.

## Verification
`node tests/rts.cjs` covers storage capacity, automatic/offline production, completion boundaries, old-save preservation, grouped wall quotes, training speed-up, daily rewards, exchange caps, campaign and defense results, replay protection and routing. Native compilation is checked by GitHub Actions. Canvas menus and connected-wall/defense rendering were exercised separately. Device OAuth and real-device performance have not been verified.

Art: original 4x4 atlas plus 3x3 expansion (hangar, lab, warehouse, aircraft, sniper, shield mech, gem, chest). Runtime vector walls and modular level details avoid additional texture memory.
