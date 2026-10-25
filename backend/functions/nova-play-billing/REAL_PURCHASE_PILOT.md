# Real purchase recovery pilot

The verifier now accepts completed real Google purchases as well as test purchases. Real receipts require an order ID, exact account hash and product binding, quantity one and refundable quantity one. Google verification is still mandatory. Database credits remain atomic and token-idempotent; consumption occurs after durable credit.

Rollout remains restricted by NOVA_PLAY_TEST_USERS at the Edge AND by the database to the existing authenticated account whose email is sunan.tongsan@gmail.com. Other players are NOT enabled. Apply backend/nova_play_real_owner_pilot.sql before deploying these function files. Do not remove either gate before an end-to-end purchase succeeds and a wider release is authorized.

Native 37 still displays test-only purchase copy. This backend pilot recovers existing purchases on shop open/resume without a new purchase. A wider release requires updating that copy, building/releasing Android, and implementing refund/chargeback reconciliation. Current refund state is checked before initial grant; post-grant refunds are not automatically reconciled yet.

Tests: node tests/play348.mjs; live database transaction rolled back after checking real credit + duplicate retry + restricted RPC permissions. End-to-end Google fulfillment remains pending user reopening the shop. Errors log only stage/status/category, never credentials or purchase tokens.
