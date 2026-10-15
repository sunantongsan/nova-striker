# Welcome-screen game updates (native 19 / 1.7.2)

The Android welcome screen checks the `test` channel before loading the game. There is no update button. It shows download percent/MB, verifies each file and starts the game only when the complete selected set is available. Interrupted files never replace valid files; completed objects are reused on retry/restart. If the manifest cannot be reached and no known update is pending, the previously verified/bundled game can still start offline.

## Release a content patch

1. Change `game.js`, `index.html`, or flat `assets/*.webp` files. Keep existing save formats backward compatible; boot rollback cannot undo a destructive save migration.
2. Increment `contentVersion` in `patch-config.json`; keep `nativeVersion: 19` and `channel: test` for compatible updates to this Android release. Update the label.
3. Run `npm test`, the JVM patch integrity test, and check gameplay/art. Push the tested commit.
4. Deploy that exact commit to the Nova update project. The Vercel build reruns tests and publishes **only** `patch-dist`, not Android sources, backend SQL, signing files or tests.
5. Verify `/patches/test/native-19/manifest.json` and all referenced `/objects/<sha256>` files before announcing the patch. Next game launch applies it automatically. It does not change an ongoing battle.

Every content file is addressed by SHA-256. The updater accepts only the configured HTTPS origin, does not follow redirects, restricts files to the game entry files and WebP assets, enforces size limits, and checks hashes before atomically installing. TLS authenticates the manifest; SHA-256 detects incomplete/corrupt object downloads. Keep deployment account access protected.

A candidate becomes active only after the WebView reports a successful JavaScript boot. A boot failure rolls back to the prior complete set (or bundled set), marks that failed content ID as rejected, and retains the save origin `https://appassets.androidplatform.net`. Publish a new content ID/version after fixing a rejected patch. To undo gameplay changes, publish the old compatible content with a *higher* contentVersion.

`pending.json` and `active.json` use Android AtomicFile. Downloaded content lives in app-private storage. Garbage collection retains the active and previous sets. Clearing application data still clears game saves, just as before.

## Native releases and channel isolation

Changes to Java, SDKs, permissions, native auth, ads/billing or the loader require a Play release. This updater never downloads APK, dex, jars or native libraries. Bump the Android version code and the manifest nativeVersion together for a new native contract; the endpoint prevents incompatible JS from being sent to older native apps. Keep older native endpoints hosted if they need continued content updates.

Both current internal and closed tracks use the explicit `test` channel because they share the same AAB. A future production AAB must set `NOVA_PATCH_CHANNEL` and patch config to `live`; test patches must never be used as a production channel. Google Play review and all policies still apply to the app and downloaded content.

## Validation

`node tests/patch172.cjs` checks deterministic manifests, single-file delta updates, hashes, private-source exclusion and channel isolation. `PatchFilesTest` exercises truncated/corrupt/oversized downloads, disconnect/retry, atomic replacement and path restrictions on the real Java file installer. Android CI compiles the welcome screen and updater with the release bundle. Verify on a phone before promoting a native version to production.
