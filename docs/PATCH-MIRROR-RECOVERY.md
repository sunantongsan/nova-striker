# Recovery release and patch mirrors

Candidate only: not released. Based on stable patch 140 (e69e3700), not main's cancelled patches 141/142.

GamePatcher checks both configured HTTPS origins and chooses the highest compatible contentVersion; equal versions prefer Vercel. This covers Vercel serving a valid old manifest after deployment quota exhaustion. Files are requested by SHA-256, with backup retry for HTTP errors, interruption, and integrity failures. Completed files are reused. After two unsuccessful download passes the complete previous game is used instead of an endless retry screen.

The VPS origin is intentionally unset until verified. Supply -PnovaPatchBackupOrigin=https://YOUR_VERIFIED_HOST during the native build. Only a bare HTTPS origin is supported. Never publish with an unverified address. Changes to this Java loader require a Play Store native update, not a JS content patch.

Release blockers:
- Configure a dedicated HTTPS endpoint on existing VPS without disrupting Cockro. On November 7 the VPS was online, 6.99/40 GB used, but browser VNC returned Not connected; SSH from this workspace had no route.
- Publish identical objects to both hosts before publishing manifests. Retain old objects for interrupted clients. Verify every object size and SHA-256 on each mirror.
- Bump native version/content label for recovery and use the original signing key and package. Preserve player saves and WebView origin.
- Test Vercel unavailable, Vercel stale but VPS newer, missing/corrupt objects, both offline, interrupted download, and app upgrade preserving account/progress on Android before release.
- Confirm server compatibility with restored game; production economy migrations remain applied.

Validation performed: existing PatchFilesTest passed using OpenJDK 21: interruption, retry, atomic replacement, corruption and path restrictions. Full Android build and end-to-end mirror tests remain pending.
