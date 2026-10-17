import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
Deno.serve(async req => {
  const headers={'Cache-Control':'no-store'};
  if(req.method!=='GET')return new Response('Method not allowed',{status:405,headers});
  const q=new URL(req.url).searchParams;
  if([...q.keys()].some((key,i,keys)=>keys.indexOf(key)!==i))return new Response('Invalid',{status:400,headers});
  if(!/^[0-9a-f-]{36}$/i.test(q.get('ymid')||'') || !/^\d{1,16}$/.test(q.get('telegram_id')||'') || !/^[0-9a-f]{64}$/.test(q.get('secret')||''))return new Response('Invalid',{status:400,headers});
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error}=await admin.rpc('nova_monetag_verify231',{secret:q.get('secret'),intent:q.get('ymid'),tg:q.get('telegram_id'),zone:q.get('zone_id'),event:q.get('event_type'),reward:q.get('reward_event_type')});
  if(error)return new Response('Rejected',{status:error.message.includes('invalid_secret')?403:503,headers});
  return new Response('OK',{headers});
});
