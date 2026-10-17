# Rewarded ad loading recovery

Resource ad confirmation now prepares a server receipt and opens the provider in the same user-initiated flow. Existing pending receipts open their status instead of silently returning. SDK loading keeps the duplicate-click guard. Telegram waits up to 15 seconds for its SDK, retries a failed script on the next request, and preserves useful failure messages instead of overwriting them with closed.

An expired unverified receipt now has an explicit restart action. It first cancels the old receipt on the server and creates a fresh intent only after cancellation is confirmed. Verified or completed ads remain recoverable and cannot be replaced through this flow. No rewards are granted merely because the SDK loaded or an ad button was clicked.

Tests cover lazy SDK loading, script failure/retry, resource click-to-ad launch, loading guard, visible failure state, and cancellation-before-expired-receipt replacement. Live ad availability remains controlled by Monetag.
