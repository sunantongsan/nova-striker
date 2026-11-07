# Values-only recovery candidate 143

User authorized November 7: retain pre-141 UI, apply agreed values, deliver through VPS and add Vercel/VPS failover to the Store update.

Base: stable UI/content 140. Only numeric pricing, construction progression, timed paid training, speed prices/ad-duration and product catalog are included. No new outpost or reward screens, no window CSS/resizing/dock changes, no equipment combat integration. Original layouts and mech engine are retained. Existing server migrations remain installed.

Android candidate versionCode 38; content 143 (1.9.93-values-only). VPS HTTPS origin https://game.guardscan.xyz is packaged in the signed AAB and verified externally. Dedicated /objects/* and /patches/* routes serve /srv/nova-patches; existing Cockro health remained OK. New Play products and server verifier must be coordinated before enabling new purchases.

Validation: 21 targeted economy/progression/recovery tests passed, plus production359, guardian347, titan342 and native-packaging regressions. Repeated HQ upgrades after save/reload pass. CSS/window behavior files match stable140 exactly. 48 content objects verified by size and SHA-256, total 28,100,305 bytes (production build). Full CI gameplay and mobile-browser regressions, JVM patch integrity, Android compilation and Android 11 cold-launch tests passed in run 42329793885. Signed AAB 1.9.38/38 contains both HTTPS origins. Live PvP and forced two-host network-failure tests have not been performed.

Published manifest native38 ID: 832e5b2ffba70fed9ecde44b3a2b430402bfe7445f24e2229efd49d4a6439835. Identical in signed AAB, Vercel and VPS. VPS installation verified all 48 objects and 20 native manifests; Caddy configuration validated before reload and backup retained. Public endpoint independently opened successfully.

Google Play production release 38 (1.9.38) submitted on November 7, 2026. Publishing overview confirmed changes under review, full rollout after approval, managed publishing off. Not yet confirmed publicly available. Bundle was built from commit 842035978f5d3629f3c12f2515385d05788434b3 in Android workflow run 239. Existing installations need Store release 38 to gain VPS fallback; content143 is also available on Vercel for older compatible loaders.
