# Reward balance 396 / content patch 180

Daily check-in offers 5 NOVA normally or 15 total after a completed Google test video, once per Bangkok day. Day 7 has the same amount.
Campaign first clears award 1 NOVA at every stage/star count; an optional completed test video adds 2 (3 total). Replaying a cleared stage does not create another reward. Existing balances and historical receipts remain intact.
New player-raid rewards offer 3 NOVA normally or 9 total with a completed test video; claims remain atomic and idempotent. Existing pending raid receipts retain their old quote. Gold and energy are unchanged.

Apply backend/nova_rewards_396.sql with the client patch. The migration switches Android rewarded routes to the existing explicit Google test-ad bridge by disabling AdMob production rewards and enabling test rewards until deliberately switched back. It does not treat test callbacks as production SSV, alter paid purchases, or change native banner IDs.

Validation: rewards396-db.cjs covers normal/test claims, day 7, duplicate requests, incomplete videos and account isolation. rewards396-ui.cjs covers choice labels, native test adapter and durable credit. campaign362.cjs covers stages 1/49/50/100 and 1/2/3 stars. rewards396-browser.cjs verifies integrated phone reward panels.
