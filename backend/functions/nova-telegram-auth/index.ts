import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { validateInitData } from './verify.mjs';
const origin = 'https://nova-striker-updates.vercel.app';
const headers = {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type, apikey, prefer','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store','Content-Type':'application/json','Vary':'Origin'};
Deno.serve(async req => {
  if (req.headers.get('origin') && req.headers.get('origin') !== origin) return new Response('Forbidden',{status:403});
  if (req.method === 'OPTIONS') return new Response(null,{headers});
  if (req.method !== 'POST') return new Response('Method not allowed',{status:405,headers});
  try {
    const raw = await req.text();
    if (raw.length > 20000) return new Response('Too large',{status:413,headers});
    const user = await validateInitData(JSON.parse(raw).initData);
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {auth:{persistSession:false,autoRefreshToken:false}});
    const {data:account,error:lookupError} = await admin.rpc('nova_telegram_account231',{tg:user.id});
    if (lookupError || !account?.email) throw Error('account_unavailable');
    const {data:link,error:linkError} = await admin.auth.admin.generateLink({type:'magiclink',email:account.email});
    if (linkError || !link.user || !link.properties?.hashed_token) throw Error('session_unavailable');
    if (account.user_id && account.user_id !== link.user.id) throw Error('identity_mismatch');
    const {error:bindError} = await admin.rpc('nova_telegram_account231',{tg:user.id,bind_user:link.user.id});
    if (bindError) throw Error('identity_mismatch');
    const {data,error} = await admin.auth.verifyOtp({token_hash:link.properties.hashed_token,type:'email'});
    if (error || !data.session || data.user?.id !== link.user.id) throw Error('session_unavailable');
    return new Response(JSON.stringify({access_token:data.session.access_token,refresh_token:data.session.refresh_token,expires_at:data.session.expires_at,user:{id:data.user.id}}),{headers});
  } catch {
    return new Response(JSON.stringify({error:'เข้าสู่ระบบไม่ได้ กรุณาปิดเกมแล้วเปิดใหม่จาก Telegram'}),{status:401,headers});
  }
});
