# Rewarded daily check-in and settings (content 34)

Bottom navigation now opens Settings directly with a gear. Language remains English by default with English/Thai choices. Settings also offers a user-initiated Telegram share composer.

Daily diamond claim explicitly says Watch an ad & claim diamonds. It prepares a durable receipt, opens the rewarded provider once, and grants only after SDK completion and provider verification. Direct test_claim calls no longer grant. Both providers share the daily wallet, Bangkok dates and streak (20, +5 each consecutive day; gap resets). No PvP enrollment is required for check-in. Missing ads cannot grant; Android remains unavailable until its provider is configured and enabled.

Late postbacks are credited to the date the ad was prepared, not tomorrow. Duplicate receipts for a claimed date grant zero. Receipts and local day credits survive retries. No automatic ads at startup or automatic purchases. Existing resource-shortfall choices and upgrade speed rewards remain voluntary; production-scaled rewards preserve the 20% advantage for a 15-diamond resource pack.

Validation: rewarded234-db exercises both providers without enrolled bases, completion-only and verification-only denial, retry/duplicate receipt protection, ownership, cancellation, streak, missed days, midnight recovery, disabled provider and private function permissions. economy233-ui exercises automatic ad launch only on an explicit claim click, no reward on SDK callback alone, server grant, refresh deduplication and existing resource transactions.
