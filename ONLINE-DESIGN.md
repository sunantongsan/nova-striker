# Nova Striker: account and diamond design

## Delivered in 1.3.0 (offline internal-test build)
- Saved bases migrate in place from 1.2.0; no reset of base, resources, stars or army.
- Construction and upgrade clock animation, mm:ss and progress bar. New buildings require completion before providing production, housing or unit unlocks. One builder.
- Airbase, technology lab and supply warehouse; five additional unit tiers (sniper, fighter, shield mech, bomber, elite plasma ranger). Aircraft cross walls; ground guards cannot hit air units; turrets can. Bombers deal splash damage.
- 30 starter diamonds, once on migrating an old save or a new save. Daily seven-day cycle: 10/15/20/25/30/40/60. Thailand midnight. A skipped day restarts the cycle. Backward date changes do not give another reward.
- New mission stars award 2 diamonds each, only for improvement over the previous best.
- Exchange: 10 diamonds = 500 gold or 500 energy. Confirm before spending. Speed building: ceil(remaining seconds/30) diamonds; actual price recalculated on confirmation, never higher than the displayed quote.
- Native rewarded-ad implementation grants 5 diamonds only on Google's earned-reward callback, never on closing/failure/loading. Durable pending event with JS acknowledgement and duplicate-event ledger. Two-minute cooldown, five rewards per local day.
- Release rewarded ad ID is intentionally empty until a real rewarded unit is configured. The old interstitial unit cannot be reused as a rewarded unit. Debug builds use Google's official test rewarded ID. Production UI reports unavailability and gives no pretend reward.
- Purchase button explicitly unavailable: no charge, no simulated purchase, no fabricated account login.

## Account architecture (not yet deployed)
Google Play Games platform authentication and Sign in with Google are distinct identities; link both to the same internal player UUID after server verification. Do not assume the device player ID is trustworthy or merge by display name/email alone. Google login is primary for cross-device cloud saves; Play Games provides the gaming profile/achievements. Keep guest play available.

Recommended backend model:
- players(id UUID, created_at, auth_subject unique)
- player_identities(player_id, provider, provider_subject UNIQUE)
- base_saves(player_id PK, revision, payload, updated_at): owner-only access and optimistic revision updates to prevent an older device overwriting newer progress.
- wallets(player_id PK, balance CHECK balance >= 0): server-only mutation.
- diamond_ledger(id, player_id, delta, reason, external_event_id UNIQUE, created_at): append-only and transactional with wallet mutation.
- checkins(player_id, server_day UNIQUE per player, streak): server time, never client date.
- construction_jobs(id, player_id, completes_at, completed_at): resource spend and speedup in the same server transaction.
- purchases(purchase_token UNIQUE, player_id, product_id, purchase_state, grant_state): validate with Google Play Developer API; grant only PURCHASED, not PENDING; consume only after durable credit. Handle retries, refunds and voided purchases.
- ad_rewards(transaction_id UNIQUE, player_id, verified_at): validate AdMob SSV signatures, enforce server cooldown/day limits, then credit once.

Endpoints: authenticated load/save base, claim-checkin, quote/confirm exchange and speedup, verify-purchase; signed AdMob SSV callback. No public endpoint accepting a client-chosen diamond amount. No service credentials in the Android package. Paid wallet must never be populated by trusting the current offline diamond balance.

Migration: preserve old offline base separately; after login validate/import base once with a migration ID. Establish authoritative wallet on server. Show a choice if account already has a base; never silently overwrite either device's base. Support account deletion and export policy appropriate to actual retained transaction records.

Proposed consumable products (not created/live): nova_gems_100, nova_gems_550, nova_gems_1200. Prices are not hardcoded; display Google Play ProductDetails localized prices after configuring products and testing with license testers. No real purchases until backend is verified.

Activation prerequisites: choose backend project; configure Google OAuth clients and Play Games project with Play App Signing certificate; create rewarded AdMob unit and SSV endpoint; configure Play Billing products/service access, then test purchase/cancel/pending/refund/retry/account-switch and offline reconnection. No paid infrastructure provisioned by this change.

References:
- https://developer.android.com/games/pgs/platform-authentication
- https://developer.android.com/google/play/billing/security
- https://developers.google.com/admob/android/rewarded
- https://developers.google.com/admob/android/ssv

## 1.4 implementation checkpoint
- Deployed owner-only `public.nova_rts_saves` (see `backend/nova_cloud.sql`). Read-only verification confirmed RLS on, anon SELECT denied, four owner policies and revision guard installed, zero saved rows.
- Security advisors show authenticated GraphQL schema discoverability for the table because authenticated SELECT is intentional; owner RLS still applies. This is schema discoverability, not cross-user row access. Reference: https://supabase.com/docs/guides/database/database-linter?lint=0027_pg_graphql_authenticated_table_exposed . Unrelated pre-existing findings were not changed.
- A proposed test inserting fake auth users inside a rollback transaction was rejected by automatic review. It was NOT executed. Use an isolated local database or explicitly authorized test accounts for cross-user integration verification.
- Native Google PKCE/session/cloud-backup implementation and guarded UI are included but disabled. Dashboard redirect configuration is blocked by sign-in. No live OAuth, cross-device or purchase validation claim.
- Offline earned diamonds are part of campaign backup only. A future paid wallet must use server-owned balances/receipts and cannot trust these values.
- Play Games remains a separate future identity integration. Do not label the Google OAuth button as Play Games.


## 1.5.0 reviewable implementation — ONLINE NOT DEPLOYED

Offline changes: training cards update in place (no modal replacement/scroll reset); every click starts an independent job immediately and reserves army capacity. Jobs finish independently, including unsorted completion times; existing saved jobs retain their original deadlines. Per-kind animated clock, live count and next completion. Level 1–5 palette/size/module changes. Nine weapon effects (machine gun, cannon, grenade, healing beam, sniper, missile, shock fist, bomb, plasma); Tesla uses a jagged bolt. Cannon/grenade/bomber area damage applies to buildings.

`backend/nova_war.sql` contains the proposed production migration; **it has not been installed**. Automatic approval review rejected the deployment because it creates production tables/functions and changes RLS/privileges, requiring explicit user approval. Do not attempt to apply it through another execution route. `NOVA_WAR_ENABLED` and `NOVA_CLOUD_ENABLED` remain false. Mobile UI states the service is not open. Local Postgres tests use only isolated in-memory fixtures and never real auth users.

Prepared first online mode: asynchronous automatic raids against real enrolled player bases. This is an auto-resolved strategic mode, not simultaneous realtime RTS or a replay of the offline combat simulation. Server formula uses attack/defense tier and counts of plasma turrets, Tesla towers and walls; coordinates are validated/stored but currently do not affect resolution. Infantry reduces Tesla advantage; siege counters walls/turrets; aircraft ignore walls but are vulnerable to Tesla. No bot entries or fabricated players.

Online economy is independent of offline resources and troop inventory. Fixed online strike force refreshes every 3 minutes. Nova crystals start at zero, produce 20/hour from server time, cap at 1,000, preserve 80 in a vault. A raid can take 25% of the exposed amount, capped at 100 and multiplied by destruction percentage, further limited by attacker storage capacity. The exact same amount is subtracted and credited atomically. Crystals upgrade the online force/armor tier at 150 × current tier, maximum tier 5. Offline save balances and levels are never trusted for online rewards. Layout type/count/coordinates are validated server-side; server owns competitive tier.

New-player shield 15 minutes; after any raid defender gets 30 minutes; attacking removes the attacker's shield. Matchmaking restricts tier difference to 1. Same attacker cannot raid same defender for 6 hours. Idempotency key prevents network retries granting loot twice. One short database transaction lock serializes initial low-volume PvP to avoid double spending; replace with ordered per-player locks if scaling requires it. Withdrawing permanently deletes that player's competitive ledger and reports, no starter reward on re-enrollment.

Data access: both new public tables have RLS enabled and no direct anon/authenticated grants. An exposed SECURITY INVOKER wrapper calls the private SECURITY DEFINER command; the private command explicitly verifies auth.uid(), derives the actor from that verified identity, validates action/input, and only returns permitted player profiles/targets and participant reports. No email/auth tokens in results. No client-chosen resource or damage result. No service-role credentials in client.

Activation after approval: apply the reviewed migration, check production schema/security advisors, validate Google callback allow-list `novastriker://auth/callback` and PKCE on a real device, enable both build flags only after the service and authentication work, then run two-account attack/retry/cooldown/cross-device tests. Google provider is enabled at the Auth settings endpoint, but a successful mobile login has not yet been verified. Do not claim online is live before this gate passes.
