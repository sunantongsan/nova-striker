// This handler is staged, not deployed. Secrets must be server-side environment variables.
// The Google ID token from the SAME one-use PGS code exchange unifies the Google identity.
export async function handle(request, env, fetcher=fetch) {
 const response=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(request.method!=='POST')return response(405,{error:'method_not_allowed'});
 const required=['PGS_CLIENT_ID','PGS_CLIENT_SECRET','PGS_APPLICATION_ID','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY'];
 if(required.some(k=>!env[k]))return response(503,{error:'play_games_not_configured'});
 if(!/^\d+$/.test(env.PGS_APPLICATION_ID)||!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(env.SUPABASE_URL))return response(503,{error:'configuration_invalid'});
 try {
  const raw=await request.text();if(raw.length>4096)return response(413,{error:'request_too_large'});
  const body=JSON.parse(raw);
  if(typeof body.code!=='string'||body.code.length<8||body.code.length>2048)return response(400,{error:'invalid_code'});
  const opts={signal:AbortSignal.timeout(15000)};
  const tokenResponse=await fetcher('https://oauth2.googleapis.com/token',{...opts,method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.PGS_CLIENT_ID,client_secret:env.PGS_CLIENT_SECRET,code:body.code,grant_type:'authorization_code',redirect_uri:''})});
  if(!tokenResponse.ok)return response(401,{error:'play_games_code_rejected'});
  const google=await tokenResponse.json();
  if(typeof google.access_token!=='string'||typeof google.id_token!=='string')return response(401,{error:'google_identity_consent_required'});
  const verified=await fetcher('https://games.googleapis.com/games/v1/applications/'+env.PGS_APPLICATION_ID+'/verify',{...opts,headers:{Authorization:'Bearer '+google.access_token}});
  if(!verified.ok)return response(401,{error:'wrong_game_or_player'});
  const player=await verified.json();if(typeof player.player_id!=='string'||!player.player_id)return response(401,{error:'player_not_verified'});
  // Supabase verifies signature, audience and Google subject; never merge by email/name/client player ID.
  const auth=await fetcher(env.SUPABASE_URL+'/auth/v1/token?grant_type=id_token',{...opts,method:'POST',headers:{apikey:env.SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({provider:'google',id_token:google.id_token})});
  if(!auth.ok)return response(401,{error:'google_account_not_verified'});
  const session=await auth.json();
  if(!session.access_token||!session.refresh_token||!session.user?.id)return response(502,{error:'invalid_auth_response'});
  return response(200,session);
 }catch{return response(400,{error:'sign_in_failed'});}
}
