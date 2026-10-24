# NOVA Play test billing (native 37 / content 117)

This integration is deliberately test-only. Web and old Android builds cannot purchase. Product prices displayed before catalog loading are planned THB prices; the purchase button is enabled only with a live Google Play product and server-authorized tester.

## Console setup still required

1. Upload the signed native 37 AAB to the app's internal testing track. Package: `com.sunantongsan.novastriker`. Use the existing app signing identity.
2. Create consumable one-time products and activate their purchase options: `nova_5000` (THB 30), `nova_10500` (59), `nova_19000` (99), `nova_40000` (199), `nova_85000` (399), `nova_180000` (799). Set quantity one, no multi-quantity purchase offers. Google Play owns the displayed localized price.
3. Add the intended Google account to Play license testing and the internal test track. Install from the internal test opt-in link. Choose only Google's test payment instrument.
4. Enable Android Publisher API in a Google Cloud project. Give its service account the app-scoped purchase verification/order management permission in Play Console. Store its JSON securely in Supabase Edge secret `NOVA_PLAY_SERVICE_ACCOUNT`; never commit it or put it in the Android/web bundle.
5. Set `NOVA_PLAY_TEST_USERS` to the comma-separated Supabase account UUIDs allowed to test. This is separate from Google's license tester list. Without both Edge secrets, purchases stay disabled.

## Integrity and verification

The native bridge gets a fresh product offer, binds the purchase to SHA-256(Supabase user UUID), and sends the Google token directly to the authenticated Edge verifier. Tokens and JWTs never enter JavaScript. The verifier retrieves ProductPurchaseV2 from Google, requires PURCHASED + TEST payment context + matching account/product + quantity one and no refund. Only its service-role RPC can credit NOVA. A SHA-256 token receipt makes grants idempotent and binds each token to one owner/product. The server consumes only after a durable grant. On resume or opening the shop, native code retries outstanding purchases.

The function authenticates via Supabase Auth `/user`; gateway legacy JWT verification is disabled because the function performs its own authentication. It rejects anonymous users and non-test receipts. Production paid purchases, refunds/chargebacks and RTDN reconciliation are not enabled by this change.

Before enabling testing, verify test approved/declined/pending/cancelled purchases, interruption after purchase/before grant/after grant, restore after restart, wrong game account, duplicate token, and total NOVA balance. Pure receipt validation and database authorization/idempotency are automated; end-to-end Play purchases require the Console setup above.

## Guardian timing

Recovery: 10 seconds per NOVA (rounded up), or 500 seconds per server-verified video; shared 60-second video cooldown. Construction uses existing 10 seconds/NOVA and 25,920 seconds/video with the existing combined 10-video funding/build budget. Server times and authoritative quotes drive countdowns and spending. A translucent guardian at its parking position opens construction controls when tapped; resting guardians open recovery controls. Completed guardians return to normal joystick selection.
