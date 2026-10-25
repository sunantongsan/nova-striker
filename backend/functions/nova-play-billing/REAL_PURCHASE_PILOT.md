# Verified Google Play purchases

The owner authorized purchases for all signed-in players on 2026-10-25. The Edge tester allowlist and database owner-only restriction have been removed. Apply nova_play_real_purchases.sql after the earlier pilot migration. Anonymous accounts are rejected. Every receipt still requires Google PURCHASED, matching account/product, quantity one and no refund; the private transaction ledger prevents duplicate credit. Credit commits before consumption.

Android 38 replaces test-only copy with quantity, live Google Play price, cancel and explicit payment confirmation. Purchases pending verification are recovered on resume/store entry. Never ship credentials in the Android app.

Unresolved external blocker: Google Publisher returned 401 permissionDenied for the configured billing service account during receipt verification. App-scoped financial/order permissions appear selected in Play Console; successful end-to-end fulfillment is NOT yet verified. No manual credit or refund was issued. Do not represent this deployment as a successful payment test. Refund/voided-purchase reconciliation is not implemented.
