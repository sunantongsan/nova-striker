# Android and Telegram

The two clients keep independent accounts and use the existing Supabase project. This change does not link accounts, migrate balances, or change player IDs.

| Component | Android | Telegram |
| --- | --- | --- |
| Entry page | `index.html` | `web/index.html` |
| Account and ad integration | `app/src/main/java/com/sunantongsan/novastriker/` | `web/telegram.js` |
| Authentication | Google / email through NovaCloud.java | Telegram verified initData |
| Advertising | AdMob | Monetag |
| Build command | `npm run build:android` | `npm run build:telegram` |
| Published output | `patch-dist/patches` and `patch-dist/objects` | `patch-dist/play` |

Gameplay stays in `game.js`; backend rules stay in `backend/` and the existing database. Shared layout changes must be applied to both entry pages. Telegram no longer derives its entry page from Android at build time. Its account menu shows Telegram instead of offering Google/email.

For a combined deployment run the Android patch builder first, then the Telegram builder, since the patch builder clears patch-dist. Existing URLs and Android save origin remain unchanged. The Gradle Android packaging path is unchanged.

## Outstanding issues

Separating entry pages does not repair the deleted Google OAuth client. Restore or replace that credential in Google Cloud and update Supabase Google provider configuration, then verify a complete device login.

The local `E.d.gems` and server `nova_private.test_wallets.gems` remain separate in the existing economy. Do not overwrite either or blindly sum them. A balance reconciliation requires receipt/history review and a separately tested migration.
