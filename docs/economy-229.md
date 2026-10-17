# Economy preparation 229

Released web change: gem completion costs ceil(remaining seconds / 120) for construction, training and research/enhancement. 30 minutes costs 15 gems; positive fractions round up. Online support receipts still use actual cost, ownership, battle locks and idempotent recovery. Apply backend/nova_speed_economy_229.sql before publishing patch 29.

The new reward screen is explicitly a preview. It does not play ads, grant rewards, debit gems or sell products. Resource previews use completed production: 30 minutes gold/power, 15 minutes crystal; proposed 15-gem packs provide 36/18 minutes respectively, capped by free storage. Existing exchange offers remain unchanged until the replacement can be deployed consistently with the online ledger.

Existing earned legacy native rewards remain recoverable. No new ad request is sent from patch 29. Native source removes the five-per-day restriction, but this requires a subsequent Android release; it is not distributed through the content patch. The current two-minute native cooldown is unchanged.

Remaining before activation: real rewarded AdMob unit, verified server-side reward receipts bound to owner and selected job/resource, durable reward intent/recovery, Google Play Billing with server purchase verification and agreed pack prices. Do not enable real purchases against the current test gem ledger or daily test promotion. Merchant verification alone does not enable Billing.

Validation: full npm test, including new boundary/capacity tests and database 30-minute=15-gem receipt test; mobile browser 360x740 reward screen with no runtime errors. Native source change has not been built into an APK/AAB in this release.
