# Admin-only Play Games setup diagnostic

Deployed v1 on 2026-10-20 with verify_jwt=true and a second server-side service-role check. It does not modify users or saves. It returns only sanitized key-validation/routing results, never a private key, access token, or full upstream response.

Execution is NOT verified yet. Supabase dashboard Test currently offers publishable or new secret API keys. The proposed switch to verify_jwt=false plus explicit comparison against SUPABASE_SECRET_KEYS was rejected by automatic approval review. Do not deploy that change without explicit user approval. Current deployment remains v1, verify_jwt=true.

A successful OAuth token exchange validates the stored service-account key only. A request with a deliberately invalid Recall session does not verify real player access. A Play-signed device test is still required before rollout.
