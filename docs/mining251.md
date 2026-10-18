# NOVA mining 251 / patch 52

NOVA remains game currency. No chain, withdrawal, exchange listing, price or redeemability is implemented. Android test-ad rewards are game rewards, not verified advertising revenue. The new server ledger records mining/referral issuance; existing game spending/save reconciliation is retained. Do not use this legacy local-game wallet as a withdrawal authority: a future chain release requires a fully server-authoritative spend ledger, migration/reconciliation and separate review.

## Rules

- Explicit ad-backed 24-hour sessions; no automatic renewal or retroactive inactive earnings. Base rate is frozen for each session.
- Base rate 200/h for the first 100 distinct accounts to start a session, 100/h at 101–1,000, 50/h at 1,001–10,000, then halved at each further 10x milestone. Count is cumulative, not current online count.
- Direct invitees add 15% of the owner's session base rate only for concurrent session overlap. An interval sweep caps contributors at 20 at every instant, including when members join/expire between polls. No bonus while the owner is inactive.
- A newly registered account after rollout can bind one inviter before its first session. No self/cyclic referrals. 500 NOVA is credited once when that account has both a named base and its first session; unlimited qualifying invitees. Existing accounts can invite but cannot retrospectively become new-player referrals.
- Codes are case-insensitive, unique and customizable (3–32 characters, no whitespace or link/control delimiters). Links encode a stable account token so code changes do not break existing invitations. Android users can enter a code manually; Telegram startapp links prefill/bind valid referrals before mining.
- Telegram requires both SDK completion and a provider-verified Monetag receipt. Android uses the existing native Google test-reward bridge, clearly labelled. Android test rewards are deliberately not treated as verified ad income.
- Claims and settlement share the existing economy transaction lock. Numeric fractions are retained; only whole NOVA is credited to the existing game wallet. Repeat claims cannot create another session or another referral reward.
- Old check-in claim endpoints reject requests after migration. Historical earned balances and welcome bonus remain.

## Interface

Daily table replaced with mining card, countdown, rate, team counters, code editor and share link. Drone guide includes naming inside the base and lessons through online attacks. Cosmetic miners wander empty ground, stop to drill with sparks, and are depth-sorted with buildings; 1 personal robot plus up to 20 active referral robots. No collision/combat/production effects. No new native build for version 23; older native versions without rewardTest248 cannot use Android test ads until upgraded.

## Verification / rollout

PGlite tests cover owner checks, callback-only denial on Telegram, verified receipt, retry, active-session rejection, halving boundaries, exact overlap, 21-member cap, inactive earnings, new-referral qualification, single reward, and direct-write denial. UI tests cover callback owner/ID, no early credit, repeated response/restart, naming and table removal. Historical tests for the replaced check-in UI are replaced by mining tests; resource/ads/combat/welcome tests remain.

Apply the generated migration before publishing patch 52. Real ad delivery/fill and actual revenue must be checked on Monetag; database verification counters are not revenue reports. No synthetic production impressions should be created during testing.
