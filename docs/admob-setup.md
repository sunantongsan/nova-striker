# AdMob setup — 17 October 2026

Account resubmission accepted; dashboard reports verification in progress. Payment profile shown complete. This is not an approval.

Nova AdMob app: ca-app-pub-4585492700643566~3184363195
Rewarded unit: ca-app-pub-4585492700643566/9387691342
Name: Nova RTS - Optional Resource or Speed Reward
Reward metadata: 1 In-game reward. No unit frequency cap; ad pods disabled. Existing interstitial unchanged.

Google Play linking was attempted with com.sunantongsan.novastriker; AdMob returned no matching app. No unrelated app linked.

The rewarded unit is recorded in native source. Debug builds still use Google's test unit. Patch 29 reward preview remains gated; changing a native ID requires a subsequent Android release. SSV, bound reward intent, receipt recovery and resource/time reward handling must be completed before enabling player requests. Do not fall back to legacy five-gem rewards.

## Verified reward preparation (230)

Implemented an owner-bound reward intent, signed Google callback verification, a service-only receipt RPC, and idempotent claim handling. Rewards: actual production gold/power for 30 minutes, crystals for 15 minutes, or up to 25 minutes on the selected server upgrade job. Remaining storage is checked at prepare and claim. Battle locks apply to preparation and claim. No daily maximum; 2-minute preparation cooldown. The client persists the intent and offers manual retry without background polling. Only server receipts grant rewards; native callbacks no longer grant gems in native 22.

The feature gate in nova_private.admob_settings230 remains false pending Google account/app approval and device testing. Offline-only construction/training rewards are not part of this server-backed flow. Existing economy and speedups are unchanged. Native 22 (1.7.9), content patch 30, includes the SSV bridge. Old native clients retain the preview screen.

Verification: full npm test; real mobile browser with mocked server receipts checks no autoplay, duplicate-tap protection, duplicate callback safety and no native gem award; database checks service-only RPC, disabled gate, idempotency and selected-job reduction. Real ad impressions have not been tested while approval is pending.
