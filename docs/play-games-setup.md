# Play Games rollout status

Project: NOVA Login (nova-login-512211), game services ID 997621124511.
Android package: com.sunantongsan.novastriker.
Android OAuth client: 997621124511-porgst1o28o37heamtbpvnsu8foariu2.apps.googleusercontent.com.
Play signing SHA-1: F5:D0:0F:31:7A:3F:7D:12:47:28:03:9E:BB:BA:F0:60:0D:7E:BE:68.

The Android credential is saved. On 2026-10-20 the game-server credential was also verified saved in Play Console (saved confirmation, Save disabled), with OAuth client name NOVA Play Games Server and ID 997621124511-gadrv38jvj7htjrsaqeefu74n9dc8lrb.apps.googleusercontent.com. Both credentials remain draft; this is not a published or device-tested Play Games login.

Keep the working Supabase Google OAuth client separate: Nova game, 997621124511-0sv2bptcmt30vmrdabs5ghlmm3l317sp.apps.googleusercontent.com. Never replace its provider configuration with the Play Games server client.

This first integration initializes PGS v2 without prompting users to create a game profile at launch. It intentionally does not replace, clear, or derive a Supabase session from a client-supplied player ID. Google login and Telegram are unchanged. No Facebook branch changes are included.

Remaining release gates:
- Configure server-side Recall API access before restoring game accounts through Play Games. The web server OAuth credential is saved, but it does NOT authorize Recall: Recall requires a service account, not three-legged OAuth. No service-account key or server Recall permissions have been verified. Store credentials only in backend secrets, never the APK, source tree, or chat.
  - Official setup: https://developer.android.com/games/pgs/recall/recall-setup
  - Use authenticated Recall session IDs and encrypted opaque persona/token values. Preserve existing links on conflicts; do not silently overwrite another account's association.
- Implement secure account binding/restore; never merge accounts based on display name or local PGS player ID.
- Implement Play now account creation with abuse controls, and explicit linking for existing players.
- Test Google cancellation, existing sessions, missing Play services and account recovery on a Play-signed internal test build.
- Review PGS publication and tester configuration before public release.

The debug artifact is a compilation test only: its signing certificate does not match the registered Play signing certificate, so it cannot prove live PGS authentication. Do not distribute it as a working Play Games login release.

Validation recorded before server-credential setup: CI run 39426243145 passed the welcome/platform-isolation tests and Gradle verification/debug compilation. Artifact upload failed because of GitHub artifact storage quota; the overall workflow did not pass and no downloadable APK was produced by that run.

## Native bridge prepared
NovaPlayGames now checks platform status without a profile prompt. A native-only
requestRecall method obtains a Recall session ID for the future backend caller;
the WebView cannot access that ID. Platform status never emits signed_in and
never changes NovaCloud storage. Requests are bounded to 20 seconds, duplicate
requests are rejected, stale callbacks are ignored, and destruction cancels delivery.

This is preparation, not a released alternate login. No Play Games button is
enabled until server credential access, binding/restore, and device testing pass.
The existing Google provider, NovaCloud.java, and game-save formats are unchanged.
