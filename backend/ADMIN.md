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
