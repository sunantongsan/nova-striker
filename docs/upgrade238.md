# Upgrade flow and visual costs

Check-in claim label is now Check in & claim diamonds (Thai: เช็คอินเคลมเพชร). The underlying one-tap rewarded-ad and verified reward flow is unchanged.

Selected buildings show Upgrade followed by parenthesized resource icons and quantities. Affordable upgrades proceed directly, including a single selected wall. Group wall upgrades retain their group confirmation.

Shortages show a compact illustrated Not enough resources panel. The server quotes all missing resources together using the existing per-resource production-scaled diamond rates; the displayed diamond button is the total charge. Purchasing uses one durable receipt and an atomic server transaction, preventing partial debit/grant. On confirmed delivery the originally selected building is upgraded if its identity/level still match; otherwise resources remain available. Ads directly request the resource with the highest quoted missing cost, with its actual per-ad amount visible. One ad is not represented as filling every missing resource.

Tests cover summed prices, multi-resource delivery/replay, altered quote/owner denial, cancellation, insufficient wallet without partial grants, storage bounds, private function access, shortage UI and direct affordable upgrades.
