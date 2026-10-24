# Player-selected Play Games account

The main process removes PlayGamesInitProvider and never initializes the SDK.
Only tapping the Play Games button launches a non-exported activity in `:pgs`.
That process initializes the SDK in Application.onCreate, before its activity.
The authorization code is exchanged on the server; a client-provided player ID
is never accepted as proof of identity. Tokens stay in native encrypted storage.

Before release, configure Supabase Edge secrets `NOVA_PGS_CLIENT_ID` and
`NOVA_PGS_CLIENT_SECRET` from the OAuth **Game server** credential linked to this
game in Play Console. A service-account JSON is not a replacement for this pair.
Never commit the secret. Deploy nova-playgames-auth with verify_jwt=false because
the function authenticates using the single-use Google code. With configuration
missing it returns 503 and creates no account.

Verify using a Play-signed build and a test player: cold launch shows no Play
Games prompt; Google/email/Facebook do not initialize PGS; tapping the controller
opens PGS; cancel returns to the chooser; successful login restores the same
NOVA account on a second device. Verify main-process and authentication-process
death, logout, rotation, invalid/replayed codes, and email/Facebook independently.
Existing Google accounts are not silently merged with a Play Games account.
