# Public web entry for Facebook links

Adds `/web/` to the existing static output. `/play/` remains Telegram-only. Android files and patch version are unchanged.

The public entry offers Facebook Login through Supabase using PKCE. The password and email form is hidden. Facebook consent is required for first-time authorization; valid returning sessions resume the existing account. The shared game signed-in handler requires a unique base name before gameplay. No identity is inferred from the Facebook in-app browser or referrer. Email support is retained internally but is not the public entry flow. The authenticated game RPC remains `nova_war_command`; test wallet calls remain `nova_test_command`. Web campaigns are namespaced per user and do not read or replace Telegram local saves. Existing cloud backup/restore remains manual.

## Release gates

- DONE: Production `/web/` and the initial preview callback were saved in Supabase, preserving the two existing native redirects and Site URL.
- Finish creating the NOVA Meta app, configure Facebook Login callback and email permission, securely configure the provider in Supabase, and satisfy Meta public-release requirements.
- Validate Facebook consent, cancellation, returning-session refresh and first-time base naming on Facebook Android/iOS in-app browsers and an external browser.
- Verify a new player can name a base, build, enter a battle, reload and resume. Verify a second account does not inherit the first account's local campaign.
- Verify production deployment and its assets. The original preview build is READY and its signup page opened successfully. Vercel browser dashboard is accessible despite connector 403. Facebook code requires a new verified preview.
- Google login is not used by the public entry. Web ads are unavailable; scouting continues without an ad and no native/Telegram ad reward is fabricated. Reward-dependent game flows still require a separate verified web advertising integration before promoting them as available.

Do not publish this link as ready until the release gates are completed. This change is a prepared web client, not a verified public launch.

## Checks

`node tests/browser-web.cjs` exercises authentication routing, isolated campaign storage, token refresh concurrency, correlated RPC responses, unsupported ad rejection and logout preservation. Existing Telegram bridge tests remain unchanged.
