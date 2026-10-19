# Base usability update 274

- Connected armored walls use the new transparent `assets/wall-pillar274.webp` sprite and perspective-correct panels. Map, catalog and upgrade previews share the artwork. Old wall evolution overlays are retired.
- Both platform entry pages use compact dialogs (460px maximum width, 78% maximum height), smaller typography/cards, and 44px touch targets.
- Offline attackers replan after knockback, blocked paths and target changes. Unreachable defending troops do not prevent attacks on reachable walls/buildings. Wave HP/damage/speed are snapshotted from the current enhanced base at battle start.
- Settings exposes account-owned base rename and referral code/team management. `backend/nova_names_274.sql` adds the authenticated rename action while preserving legacy claim retry behavior and unique names. It was applied to the existing Supabase project and verified with rolled-back synthetic fixtures.
- Referral links retain the stable owner ID even when a code changes. The share panel offers clipboard, platform share, LINE, Facebook, Telegram and WhatsApp. Receiving Telegram users retain the existing automatic referral binding; Android users enter the displayed code before their first mining session.
- Android versionCode 24 adds an explicit, user-initiated native share/clipboard bridge. Existing native versions 19–23 receive content update 74 and use the copy-link fallback. Direct native app sharing requires installing the new Android build; a content patch cannot add Java methods.

Validation: base274 and referrals274-ui regression tests, existing wall/mining/village/weapon/range/rocket/core gameplay tests; SQL rename/retry/uniqueness/validation/account-isolation checks. Wall artwork was rendered on a connected perimeter for visual review. Local browser screenshot validation was unavailable because the Chromium download failed; UI behavior was checked with the DOM harness.

Wall art: built-in imagegen, transparent background. Prompt: one stout isometric sci-fi wall pillar, premium animated cartoon style, ivory armor/cobalt panels/gold fasteners/cyan status light, upper-left lighting, square footprint, coherent load-bearing structure, no weapons, scenery or text. Encoded as WebP for the shared game asset pipeline.
