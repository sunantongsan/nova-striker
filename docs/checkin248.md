# Android Google demo check-in (248)

Native version 23 / 1.9.7, patch content 49. Google demo rewarded unit is always used by the new `rewardTest248` bridge; production `rewardVerified` and its SSV checks are unchanged.

Server grants are explicitly temporary test grants, not verified advertising revenue. Client completion is not proof against a modified client. Authenticated non-anonymous, non-Telegram accounts get at most the existing daily check-in amount (20 NOVA, +5 per consecutive day), sharing the same Bangkok-day wallet cap with verified production ads. One receipt per account/day; owner validation, replay-safe credit and private tables. No test production/resource rewards.

The feature closes automatically when production AdMob is enabled, or at the settings expiry (live activation: 2026-10-31 14:39:29 UTC). A completed pending receipt can still be reconciled to zero once the window closes. Existing app versions show an update-required message. Native 23 must be installed; a web patch cannot add Java bridge methods.

Validation: npm test passed, including demo248 DB/UI scenarios (owner mismatch, early close, duplicate request/claim, replay after spending/reload, streak, production shared cap, Telegram exclusion, expiry); GitHub Android build also passed. No physical-device ad-display test has been performed.

Build output: android-112 release, debug APK and unsigned AAB. Release signing secrets are absent from the build environment; the original signing backup was located, but the browser download returned a path without an actual file and a second download timed out. Signing and Play rollout remain outstanding until the AAB bytes are available. Use the existing app/upload signing key; do not replace it or uninstall an existing app to force a debug install.
