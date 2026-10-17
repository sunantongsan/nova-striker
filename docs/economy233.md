# Check-in and resource choices (content 33)

- Retire both local 10,000-diamond promotion and implicit server test claims. Preserve previously earned balances.
- Explicit account check-in: 20 diamonds on day 1, +5 each consecutive calendar day, reset to 20 after a missed day. Day boundary: Asia/Bangkok midnight. No weekly loop. The server locks the wallet and records the reward; repeated calls return the same day's result. Clients persist owner/day credits before displaying success.
- An old promotion already claimed today does not also grant a new check-in today. The next eligible check-in starts at 20.
- Gold/energy ad reward: 30 minutes of published production; crystal ad reward: 15 minutes. One full 15-diamond resource pack contains 120% of that amount. Requested shortfalls and free storage cap the delivery; partial packs cost ceil(15 × delivered / full pack).
- Production levels drive both choices. One level-10 gold mine: ad 10,800 gold, full pack 12,960 gold for 15 diamonds. Crystal production level 5: ad 1,500 crystals, full pack 1,800 for 15 diamonds. A 1,000-crystal partial pack costs 9 diamonds.
- UI intercepts building, infrastructure, grouped wall, force-tier and enhancement shortfalls. No automatic ad viewing, exchange or upgrade. The user sees the server quote, chooses a method and confirms. Retry/cancel uses the same persisted transaction ID.
- Verified provider receipts remain mandatory. Telegram uses Monetag; Android availability remains controlled by its existing AdMob approval/configuration flag. No real-money store or new Coin currency is introduced.
- New fixed-rate legacy exchanges are rejected. Existing receipts and pending deliveries remain recoverable. Local prototype balances are not a real-money wallet; paid online operations retain the existing server-wallet checks.

Validation: economy233-db.cjs covers check-in recurrence, gaps, account isolation, old endpoint removal, legacy receipt recovery, quote tampering, production/partial rates, retry/cancel, insufficient funds, Telegram dispatch and access controls. economy233-ui.cjs covers both platform bridges, persistent debit/retry/refund, save failures and explicit choices.
