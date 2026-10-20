# Play Games rollout status

Project: NOVA Login (nova-login-512211), game services ID 997621124511.
Android package: com.sunantongsan.novastriker.
Android OAuth client: 997621124511-porgst1o28o37heamtbpvnsu8foariu2.apps.googleusercontent.com.
Play signing SHA-1: F5:D0:0F:31:7A:3F:7D:12:47:28:03:9E:BB:BA:F0:60:0D:7E:BE:68.

The user created the Android client and saved its Play Games credential. The Console now reports 4/6 setup tasks completed; the credential remains draft.

This first integration initializes PGS v2 without prompting users to create a game profile at launch. It intentionally does not replace, clear, or derive a Supabase session from a client-supplied player ID. Google login and Telegram are unchanged. No Facebook branch changes are included.

Remaining release gates:
- Configure a separate server credential and server-side Recall API access before restoring game accounts through Play Games.
- Implement secure account binding/restore; never merge accounts based on display name or local PGS player ID.
- Implement Play now account creation with abuse controls, and explicit linking for existing players.
- Test Google cancellation, existing sessions, missing Play services and account recovery on a Play-signed internal test build.
- Review PGS publication and tester configuration before public release.

The debug artifact is a compilation test only: its signing certificate does not match the registered Play signing certificate, so it cannot prove live PGS authentication. Do not distribute it as a working Play Games login release.
