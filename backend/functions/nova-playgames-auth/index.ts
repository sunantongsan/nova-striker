import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { verifyPlayer, createSession } from './core.mjs';
const headers = {'Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
// This login endpoint verifies a one-use Google authorization code itself.
Deno.serve(async req=>{
  if(req.method!=='POST')return reply({error:'method_not_allowed'},405);
  try{
    const raw=await req.text();if(raw.length>6000)return reply({error:'too_large'},413);
    const body=JSON.parse(raw);
    const clientId=Deno.env.get('NOVA_PGS_CLIENT_ID'),clientSecret=Deno.env.get('NOVA_PGS_CLIENT_SECRET');
    if(!clientId?.endsWith('.apps.googleusercontent.com')||!clientSecret)return reply({error:'not_configured'},503);
    if(body.action==='config')return reply({client_id:clientId});
    const playerId=await verifyPlayer(body.code,{clientId,clientSecret});
    const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {auth:{persistSession:false,autoRefreshToken:false}});
    return reply(await createSession(playerId,admin.auth));
  }catch{return reply({error:'sign_in_failed'},401);}
});
