# NOVA administration

Content patch 93 adds Settings → Admin center for accounts in `nova_private.admins293`. The role is checked on every privileged request using `auth.uid()`; never grant from user-editable metadata. The owner account was provisioned separately against its verified Google email. No account ID or credential is shipped to clients.

## Metrics

- Total: distinct accounts across NOVA war profiles, saves, base names, wallets, miners and presence. This is not installation count and does not count other games sharing Auth.
- Online: foreground signed-in clients reporting within two minutes. One account on several devices counts once.
- Active in 24 hours: accounts with a heartbeat in the last 24 hours.
- Guests and offline play are excluded. Old clients without patch 93 do not report presence. Activity data starts at deployment, so initial zero is not evidence that nobody is playing.

## Controls

The admin UI reads and updates `nova_private.mining_settings251.enabled` and `base_rate293` (1–10000 NOVA/hour before existing member scaling). The default remains 200. Rate changes affect new mining sessions only. Disabling mining blocks the existing mining endpoint, including settlement/collection, until re-enabled. Changes use an expected-value check and append before/after values to `nova_private.admin_audit293`.

Player feedback is private in `nova_private.feedback293`, limited to 3–2000 characters and one submission per minute per account. The dashboard shows the latest 100 entries and can mark new/reviewing/done. It does not send replies or reveal account emails. Content is rendered with textContent.

Database owners can manage these private tables from Supabase. Prefer the in-game audited controls for routine changes. Direct SQL updates bypass the application audit, so record the reason separately. Combat balance, unit damage and build costs remain in their existing code/functions and are not editable through this dashboard.

## Validation

`node tests/admin293.cjs` checks authorization, direct table/function denial, feedback throttling, setting limits and concurrent-change protection, audit records, presence expiry, mining-rate scaling and legacy RPC dispatch. Both HTML entries embed the identical `ui/admin293.js` source. New UI uses the already-supported test_status bridge with a separate request prefix, so native 30 receives this as a content patch.

## Patch 94: Feedback / Admin

Settings now has one Feedback / Admin entry, followed by a role chooser. Players submit feedback to the private admin inbox. Admin requires BOTH the existing allowlist and verified owner email `sunan.tongsan@gmail.com`. The owner sets an independent password on first use; no password is seeded by deployment. At least 12 characters, maximum 72 UTF-8 bytes. The server stores only a salted bcrypt hash (cost 12). Five failures lock attempts for five minutes. Every privileged request verifies the password. The UI retains the entered value only in memory, clears it on close/account change, and locks after ten minutes; it never writes it to localStorage. Forgotten passwords require an authorized database-owner recovery; no public reset or client-side bypass is provided.

NOVA gifts select an existing NOVA account by name/ID. Positive amounts 1–1,000,000 with a reason are credited to the authoritative wallet with a unique request ID. Retries cannot credit twice. The UI freezes uncertain requests so retrying preserves the same recipient/amount/ID. Nothing is credited merely by installing the patch.

Promotions specify title, reward, start/end (at most 90 days), and maximum recipients. Players use Settings → NOVA promotions to claim once per account. Row locks serialize claims against the remaining cap, and each claim has a unique (promotion, account) key. Admin can enable/disable an offer. Creation is idempotent. Existing or already-claimed rewards are not revoked when an offer is disabled. Promotions are NOVA giveaways, not store price discounts. No live offer is seeded.

`node tests/admin294.cjs` extends the earlier integration fixture with owner gating, initial setup, password failure persistence/lockout, legacy-function denial, gift retries and conflicting retries, promotion quota and duplicate-claim checks. PGlite uses a clearly marked crypto test double; actual pgcrypto correct/wrong password behavior was separately verified on Supabase without setting the owner's password. Admin changes and grants remain auditable in private tables.
