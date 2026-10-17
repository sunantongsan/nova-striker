# Production ad rewards

Removes the game-imposed two-minute cooldown from both provider resource handlers and daily check-in. Resource ads now boost all production by 30 minutes: mines and reactors use their existing 1080 units per building level per half-hour; crystals use half the hourly crystal rate. Quotes cap every resource at remaining storage independently and show all three amounts before the ad.

Preparation stores an immutable resource breakdown in the existing provider receipt. Verified claims grant all resources atomically, capped again at current room. Replays cannot grant twice. Another active resource ad must be completed or cancelled before starting a new one; completed receipts do not cause a waiting period. Daily check-in remains once per day. Provider availability still controls whether an ad can be shown.
