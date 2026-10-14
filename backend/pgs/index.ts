import { handle } from './auth.mjs';
Deno.serve((request: Request) => handle(request, {
 PGS_CLIENT_ID: Deno.env.get('PGS_CLIENT_ID'),
 PGS_CLIENT_SECRET: Deno.env.get('PGS_CLIENT_SECRET'),
 PGS_APPLICATION_ID: Deno.env.get('PGS_APPLICATION_ID'),
 SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
 SUPABASE_PUBLISHABLE_KEY: Deno.env.get('NOVA_SUPABASE_PUBLISHABLE_KEY'),
}));
// Deploy only after setup. verify_jwt=false is necessary for this sign-in endpoint;
// the body authenticates with Google's one-use code and validates the game and ID token.
