// Setup diagnostic. No game identities or saves are created or modified.
const headers = {'Content-Type':'application/json','Cache-Control':'no-store'};
Deno.serve(async (req: Request) => {
  const role = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!role || req.headers.get('authorization') !== 'Bearer ' + role)
    return new Response(JSON.stringify({error:'forbidden'}), {status:403,headers});
  if (req.method !== 'POST')
    return new Response(JSON.stringify({error:'method_not_allowed'}), {status:405,headers});
  let stage = 'configuration';
  try {
    const config = JSON.parse(Deno.env.get('NOVA_PGS_SERVICE_ACCOUNT_JSON') || '{}');
    if (config.type !== 'service_account' || config.project_id !== 'nova-login-512211' ||
        config.client_email !== 'nova-play-games@nova-login-512211.iam.gserviceaccount.com' ||
        typeof config.private_key !== 'string') throw new Error('invalid_configuration');
    stage = 'private_key';
    const pem = config.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
    const key = await crypto.subtle.importKey('pkcs8',
      Uint8Array.from(atob(pem), c => c.charCodeAt(0)),
      {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
    const enc = (value: Uint8Array) => btoa(String.fromCharCode(...value))
      .replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const json = (value: unknown) => enc(new TextEncoder().encode(JSON.stringify(value)));
    const now = Math.floor(Date.now()/1000);
    const unsigned = json({alg:'RS256',typ:'JWT'}) + '.' + json({
      iss:config.client_email,scope:'https://www.googleapis.com/auth/androidpublisher',
      aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+300
    });
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(unsigned));
    stage = 'google_token';
    const tokenReply = await fetch('https://oauth2.googleapis.com/token', {
      method:'POST',signal:AbortSignal.timeout(10000),
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:unsigned+'.'+enc(new Uint8Array(sig))})
    });
    const token = await tokenReply.json();
    if (!tokenReply.ok || typeof token.access_token !== 'string')
      return new Response(JSON.stringify({ok:false,stage,code:tokenReply.status,
        reason:['invalid_grant','invalid_client','unauthorized_client'].includes(token.error)?token.error:'token_rejected'}),{headers});
    stage = 'recall_api';
    // Intentionally invalid diagnostic session: only checks routing/API enablement.
    // A 400 is NOT proof of real player access; a Play-signed device is still required.
    const api = await fetch('https://games.googleapis.com/games/v1/recall/tokens/nova-configuration-probe', {
      headers:{Authorization:'Bearer '+token.access_token},signal:AbortSignal.timeout(10000)
    });
    const body = await api.json();
    const allowed = ['SERVICE_DISABLED','ACCESS_TOKEN_SCOPE_INSUFFICIENT','IAM_PERMISSION_DENIED','CONSUMER_INVALID'];
    const details = Array.isArray(body.error?.details)?body.error.details:[];
    const reason = details.map((d: {reason?:string})=>d.reason).find((r:string)=>allowed.includes(r)) || null;
    return new Response(JSON.stringify({ok:true,key_valid:true,google_token_accepted:true,
      recall_http_status:api.status,recall_reason:reason,player_access_verified:false}),{headers});
  } catch {
    return new Response(JSON.stringify({ok:false,stage,error:'setup_check_failed'}),{headers});
  }
});
