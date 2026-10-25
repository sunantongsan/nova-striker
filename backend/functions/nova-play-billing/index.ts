import {hash,validateReceipt,PRODUCTS} from './verify.mjs';
const PACKAGE='com.sunantongsan.novastriker';
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const b64=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
async function googleToken(sa:any){
 const now=Math.floor(Date.now()/1000),enc=new TextEncoder();
 const head=b64(enc.encode(JSON.stringify({alg:'RS256',typ:'JWT'}))),body=b64(enc.encode(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/androidpublisher',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600})));
 const keyBytes=Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----/g,'').replace(/\s/g,'')),x=>x.charCodeAt(0));
 const key=await crypto.subtle.importKey('pkcs8',keyBytes,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
 const sig=b64(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,enc.encode(head+'.'+body))));
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:head+'.'+body+'.'+sig}),signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('publisher_unavailable');return (await r.json()).access_token;
}
Deno.serve(async(req)=>{let stage='request';try{
 if(req.method!=='POST')return json({error:'method_not_allowed'},405);
 const base=Deno.env.get('SUPABASE_URL')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,auth=req.headers.get('Authorization')||'';
 if(!auth.startsWith('Bearer '))return json({error:'sign_in_required'},401);
 const userResponse=await fetch(base+'/auth/v1/user',{headers:{Authorization:auth,apikey:service},signal:AbortSignal.timeout(10000)});if(!userResponse.ok)return json({error:'sign_in_required'},401);
 const user=await userResponse.json();if(!user.id||user.is_anonymous)return json({error:'sign_in_required'},401);
 if(Number(req.headers.get('content-length')||0)>16000)return json({error:'too_large'},413);
 const raw=await req.text();if(raw.length>16000)return json({error:'too_large'},413);const input=JSON.parse(raw);
 const configured=Deno.env.get('NOVA_PLAY_SERVICE_ACCOUNT'),testers=(Deno.env.get('NOVA_PLAY_TEST_USERS')||'').split(',').map(s=>s.trim()),ready=!!configured&&testers.includes(user.id);
 if(input.action==='status')return json({ready,testOnly:false,account:await hash(user.id),products:Object.keys(PRODUCTS)});
 if(!ready)return json({error:'test_billing_not_configured'},503);
 if(input.action!=='verify'||typeof input.token!=='string'||input.token.length<10||input.token.length>4096||typeof input.product!=='string'||!Object.hasOwn(PRODUCTS,input.product))return json({error:'invalid_purchase'},400);
 stage='publisher_credentials';
 const access=await googleToken(JSON.parse(configured!)),headers={Authorization:'Bearer '+access};
 stage='publisher_receipt';
 const r=await fetch('https://androidpublisher.googleapis.com/androidpublisher/v3/applications/'+PACKAGE+'/purchases/productsv2/tokens/'+encodeURIComponent(input.token),{headers,signal:AbortSignal.timeout(15000)});if(!r.ok){console.error(JSON.stringify({event:'billing_failure',stage,status:r.status}));return json({error:'verification_unavailable'},503);}
 const purchase=await r.json();const checked=await validateReceipt(purchase,user.id,input.product);
 stage='wallet_grant';
 const grant=await fetch(base+'/rest/v1/rpc/nova_grant_play348',{method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'},body:JSON.stringify({who:user.id,token_hash:await hash(input.token),product:input.product,orderid:checked.orderId,is_test:checked.isTest}),signal:AbortSignal.timeout(15000)});if(!grant.ok){console.error(JSON.stringify({event:'billing_failure',stage,status:grant.status}));return json({error:'grant_pending_retry'},503);}
 // Grant is durable before consumption. A retry can safely consume an already credited token.
 const result=await grant.json();const consumed=purchase.productLineItem[0].productOfferDetails.consumptionState==='CONSUMPTION_STATE_CONSUMED';
 stage='consume';
 if(!consumed){const consume=await fetch('https://androidpublisher.googleapis.com/androidpublisher/v3/applications/'+PACKAGE+'/purchases/products/'+encodeURIComponent(input.product)+'/tokens/'+encodeURIComponent(input.token)+':consume',{method:'POST',headers,signal:AbortSignal.timeout(15000)});if(!consume.ok)return json({...result,consumed:false,retry:true});}
 return json({...result,consumed:true});
 }catch(error){const message=error instanceof Error?error.message:'';const known=['unknown_product','purchase_not_completed','invalid_test_context','missing_order','wrong_account','product_mismatch','quantity_or_refund'];console.error(JSON.stringify({event:'billing_failure',stage,code:known.includes(message)?message:'upstream_or_configuration'}));return json({error:known.includes(message)?message:'verification_unavailable'},known.includes(message)?400:503);}
});

