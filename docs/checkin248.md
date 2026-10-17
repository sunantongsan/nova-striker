# Android Google demo check-in (248)

Native version 23 / 1.9.7, patch content 49. Google demo rewarded unit is always used by the new `rewardTest248` bridge; production `rewardVerified` and its SSV checks are unchanged.

Server grants are explicitly temporary test grants, not verified advertising revenue. Client completion is not proof against a modified client. Authenticated non-anonymous, non-Telegram accounts get at most the existing daily check-in amount (20 NOVA, +5 per consecutive day), sharing the same Bangkok-day wallet cap with verified production ads. One receipt per account/day; owner validation, replay-safe credit and private tables. No test production/resource rewards.

The feature closes automatically when production AdMob is enabled, or at the settings expiry (live activation: 2026-10-31 14:39:29 UTC). A completed pending receipt can still be reconciled to zero once the window closes. Existing app versions show an update-required message. Native 23 must be installed; a web patch cannot add Java bridge methods.

Validation: npm test passed, including demo248 DB/UI scenarios (owner mismatch, early close, duplicate request/claim, replay after spending/reload, streak, production shared cap, Telegram exclusion, expiry); GitHub Android build also passed. No physical-device ad-display test has been performed.

Build output: android-112 release; user-supplied unsigned AAB SHA-256 `3c91893acf9273c4695044a3ca9033cfc58da6e6fbb8c6e4aaa166cf8957dcdc` matched the build. Signed with the existing upload key and verified by jarsigner. Google Play accepted version 23 / 1.9.7 for `com.sunantongsan.novastriker`.

Play rollout verified on 2026-10-18 (Bangkok): internal testing release 16 is available to internal testers (05:25). Promoted the same bundle to existing closed Alpha release 8, 100% rollout; submitted and visibly listed under changes in review. Alpha is pending Google review, not yet confirmed available. Managed publishing is off. No tester lists, countries, permissions or production track were changed. Only warning: no obfuscation mapping file. Existing installations should update through their Play testing channel; do not uninstall or install a debug APK. Physical-device rewarded-ad completion remains unverified.
