# Campaign, sound pack and gold scouting — content 138

Campaign rewards: only the first victory of each stage pays NOVA. Stages 1–49 pay 1 per star; stages 50–100 pay 2 per star. Replays, including improved star ratings, pay no extra NOVA. Previously won stages remain completed. Gold/power continue to come from destroyed storage, HQ minimum 70%, full clear 100%, capped by own free storage.

Signed-in first victories are saved in an account-bound queue and credited once on reconnect; the server fixes the price and deduplicates account/stage. Guest rewards stay local. Offline outcomes retain the game's existing client-trusted simulation model; this is not server-side combat replay validation.

Campaign entry synchronizes completed training and permits a ready guardian alone. Without assigned transport cargo, campaign ground troops can deploy directly rather than leaving an empty deployment bar. Existing assigned transports retain the transport flow. Campaign saves up to stage 100 pass cloud validation.

New online searches cost 100 gold. Gold is debited by the server only after a valid target is returned, with request receipts for retry/cancellation. Existing pending legacy searches retain their old settlement path. A guardian actually deployed into online combat costs an additional 1,000/2,000/3,000 gold at levels 1/2/3, once per battle. Invalid/insufficient-balance deployment rolls back; owning a guardian alone adds no charge.

Apply backend/nova_campaign_scout_362.sql before releasing content 138. No native Android change is required. Five user sound clips are embedded as compressed audio under the existing game.js allowlist.
