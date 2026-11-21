# NOVA WAR AdMob status

## Checked 22 November 2026 (Thailand)

- AdMob still shows account verification in progress. The payment profile is complete. The identity verification page describes the earnings threshold without requesting documents. Policy Center reports no current issues.
- Google Play is already linked to `com.sunantongsan.novastriker`. NOVA is Getting ready with limited ad serving and three active units.
- Rewarded unit `9387691342` passed the AdMob dashboard verification using `nova-setup-probe` for both test parameters. The callback was saved and confirmed on reopening the unit: `https://uzinxxeadejmzxqmqqtx.supabase.co/functions/v1/nova-admob-ssv`. This probe grants no reward.
- The production row in `nova_private.admob_settings230` already had `enabled = true` when checked. No database update was made. The migration below records the initial value only.
- Google Play lists `https://cockro-network.vercel.app` as the developer website. Its root app-ads.txt serves the AdMob publisher record. AdMob's app-ads.txt report did not yet show requests with app-ads.txt. The Vercel build now also copies the publisher record to the root of the patch host.
- Native 1.9.43 uses production rewarded, banner and interstitial IDs in release. UMP permission is checked before requesting ads. The database flag routes eligible server rewards independently of the native banner and interstitial unit selection. A real impression and end-to-end player reward are still unverified.

## Historical setup — 17 October 2026

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

Android build 90 succeeded. Google's dashboard probe verified successfully only after form decoding plus signs to spaces; verifier corrected and deployed as Edge version 9. The UI callback URL is NOT yet saved: the browser environment disconnected before the final save. Keep the feature gate disabled. Final form-decoding regression tests are committed but not locally executed because the execution environment is offline.
