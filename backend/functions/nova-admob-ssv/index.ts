import {parseCallback,verifyCallback} from './verify.mjs';
let keys:{keyId:number,pem:string}[]=[];let cachedAt=0;
async function key(id:string){
 if(Date.now()-cachedAt>3600000||!keys.some(k=>String(k.keyId)===id)){
  const r=await fetch('https://www.gstatic.com/admob/reward/verifier-keys.json',{signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw Error('key service');const data=await r.json();
  if(!Array.isArray(data.keys)||!data.keys.length)throw Error('keys');keys=data.keys;cachedAt=Date.now();
 }
 return keys.find(k=>String(k.keyId)===id)?.pem;
}
Deno.serve(async req=>{
 if(req.method!=='GET')return new Response('Method not allowed',{status:405});
 let parsed;try{parsed=parseCallback(req.url);}catch{return new Response('Invalid signature',{status:400});}
 let pem;try{pem=await key(parsed.keyId);}catch{return new Response('Verification temporarily unavailable',{status:503});}
 let p;try{
  p=await verifyCallback(parsed,pem);
 }catch(e){console.warn('nova_ssv_signature',String(e));return new Response('Invalid signature',{status:403});}
 // Explicit signed dashboard probe: never reaches the reward database.
 if(p.user_id==='nova-setup-probe'&&p.custom_data==='nova-setup-probe')return new Response('Verified setup probe; no reward');
 if(p.ad_unit!=='9387691342'&&p.ad_unit!=='ca-app-pub-4585492700643566/9387691342')return new Response('Wrong ad unit',{status:403});
 // AdMob's setup test contains no real owner/intent; acknowledge only after valid signature.
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 if(!uuid.test(p.user_id||'')||!uuid.test(p.custom_data||''))return new Response('Verified test; no reward');
 if(p.reward_amount!=='1'||!/^\d+$/.test(p.timestamp||'')||!p.transaction_id||p.transaction_id.length>256)return new Response('Invalid reward',{status:400});
 try{
  const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const r=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/nova_admob_verify230',{
   method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},
   body:JSON.stringify({who:p.user_id,intent:p.custom_data,transaction:p.transaction_id,earned_ms:p.timestamp}),signal:AbortSignal.timeout(8000)});
  if(!r.ok)return new Response('Receipt temporarily unavailable',{status:503});
  return new Response('OK');
 }catch{return new Response('Receipt temporarily unavailable',{status:503});}
});
