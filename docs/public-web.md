# Public web entry for Facebook links

Adds `/web/` to the existing static output. `/play/` remains Telegram-only. Android files and patch version are unchanged.

The public entry uses email/password authentication against the existing Supabase project, with PKCE signup/recovery callbacks. No Facebook credentials or Telegram identity are assumed. The authenticated game RPC remains `nova_war_command`; test wallet calls remain `nova_test_command`. Web campaigns are namespaced per user and do not read or replace Telegram local saves. Existing cloud backup/restore remains manual.

## Release gates

- Add the exact production `/web/` URL to Supabase Auth's redirect allowlist, preserving all existing redirect URLs and the Site URL.
- Validate signup, confirmation, login, password recovery and returning-session refresh in the Facebook Android/iOS in-app browsers and an external browser. PKCE links must open in the same browser; otherwise sign in after confirmation or request recovery again there.
- Verify a new player can name a base, build, enter a battle, reload and resume. Verify a second account does not inherit the first account's local campaign.
- Verify production deployment and its assets. Vercel connector currently returns 403 for this project's team; CLI is not installed in the available workspace.
- Google login is hidden pending repair/verification of the existing OAuth client. Web ads are unavailable; scouting continues without an ad and no native/Telegram ad reward is fabricated. Reward-dependent game flows still require a separate verified web advertising integration before promoting them as available.

Do not publish this link as ready until the release gates are completed. This change is a prepared web client, not a verified public launch.

## Checks

`node tests/browser-web.cjs` exercises authentication routing, isolated campaign storage, token refresh concurrency, correlated RPC responses, unsupported ad rejection and logout preservation. Existing Telegram bridge tests remain unchanged.
