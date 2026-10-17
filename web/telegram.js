(function(root){'use strict';
 if(root.NovaCloud)return; // Android supplies its own native bridge.
 const URL='https://uzinxxeadejmzxqmqqtx.supabase.co';
 const KEY='sb_publishable_4R8VSfnmuFq6hAgWRtDX6Q_IcSVh82m';
 let session=null,loginTask=null,refreshTask=null,showing=false,initialLoad=true;
 const tg=root.Telegram&&root.Telegram.WebApp;
 function emit(event,data){if(root.novaCloudEvent)root.novaCloudEvent(event,data||{});}
 function status(message){emit('status',{message});}
 async function request(path,method,body,token){
  const response=await fetch(URL+path,{method,headers:{apikey:KEY,'Content-Type':'application/json',Prefer:'return=representation',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
  const text=await response.text();let value;try{value=text?JSON.parse(text):null;}catch{throw Error('เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง');}
  if(!response.ok)throw Error(value&&value.code==='P0001'?value.message:response.status===401?'กรุณาปิดเกมแล้วเปิดใหม่จาก Telegram':'เชื่อมต่อไม่ได้ กรุณาลองอีกครั้ง');
  return value;
 }
 function authenticate(){
  if(loginTask)return loginTask;
  loginTask=(async()=>{
   if(!tg||!tg.initData)throw Error('เปิดเกมจากปุ่มเล่นใน @NovaStrikerRTS_bot เพื่อเข้าสู่ระบบ');
   session=await request('/functions/v1/nova-telegram-auth','POST',{initData:tg.initData});
   return session;
  })().finally(()=>{loginTask=null;});return loginTask;
 }
 async function account(){
  if(!session)await authenticate();
  if(session.expires_at<Date.now()/1000+60){
   if(!refreshTask)refreshTask=request('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token}).then(s=>{s.expires_at=s.expires_at||Math.floor(Date.now()/1000)+s.expires_in;session=s;return s;}).finally(()=>{refreshTask=null;});
   await refreshTask;
  }
  return session;
 }
 async function login(){try{await authenticate();emit('signed_in',{id:session.user.id});loadAds();}catch(e){status(e.message);}}
 function run(task){task().catch(e=>status(e.message));}
 root.NovaCloud={
  available:()=>true,warAvailable:()=>true,hasAccount:()=>!!session,
  login,
  load:()=>run(async()=>{const s=await account(),rows=await request('/rest/v1/nova_rts_saves?select=revision,payload,updated_at&user_id=eq.'+s.user.id,'GET',undefined,s.access_token);emit('loaded',{id:s.user.id,save:rows[0]||null});if(initialLoad&&!rows.length){initialLoad=false;root.Game?.close();}}),
  save:(json,revision)=>run(async()=>{if(typeof json!=='string'||json.length>131072||!Number.isSafeInteger(revision)||revision<0)throw Error('เซฟไม่ถูกต้อง');const s=await account();const body={payload:JSON.parse(json),revision:revision+1};if(!revision)body.user_id=s.user.id;const rows=await request('/rest/v1/nova_rts_saves'+(revision?'?user_id=eq.'+s.user.id+'&revision=eq.'+revision:''),revision?'PATCH':'POST',body,s.access_token);if(rows.length!==1)throw Error('มีเซฟใหม่จากอีกเครื่อง กรุณาโหลดเซฟก่อน');emit('saved',{revision:rows[0].revision,id:s.user.id});}),
  deleteSave:()=>run(async()=>{const s=await account();await request('/rest/v1/nova_rts_saves?user_id=eq.'+s.user.id,'DELETE',undefined,s.access_token);emit('deleted');}),
  logout:()=>run(async()=>{const s=session;session=null;if(s)await request('/auth/v1/logout?scope=local','POST',{},s.access_token);emit('signed_out');}),
  emailAuth:()=>status('เวอร์ชัน Telegram ใช้บัญชี Telegram ของคุณ'),
  war:(action,payload)=>root.NovaCloud.warRequest(action,payload,''),
  warRequest:(action,json,request_id)=>{(async()=>{
   const s=await account(),payload=JSON.parse(json||'{}');
   if(payload.admob230){payload.monetag231=payload.admob230;delete payload.admob230;}
   const data=await request('/rest/v1/rpc/'+(action.startsWith('test_')?'nova_test_command':'nova_telegram_command'),'POST',{action,payload},s.access_token);
   // Adapt the existing verified-receipt UI, while the server keeps providers separate.
   data.admob230=data.monetag231===true;
   emit('war',{action,request_id,data});
  })().catch(e=>emit('war_error',{action,request_id,message:e.message}));}
 };
 function loadAds(){if(document.getElementById('novaMonetag'))return;const script=document.createElement('script');script.id='novaMonetag';script.src='https://libtl.com/sdk.js';script.dataset.zone='12052624';script.dataset.sdk='show_12052624';document.head.appendChild(script);}
 root.NovaAds={
  rewardVerified:async(owner,id)=>{
   if(showing)return;
   if(!session||owner!==session.user.id||typeof root.show_12052624!=='function'){root.novaRewardStatus?.('unavailable');return;}
   showing=true;
   try{await root.show_12052624({ymid:id});root.novaRewardEarned?.(id);}
   catch{root.novaRewardStatus?.('unavailable');}
   finally{showing=false;root.novaRewardStatus?.('closed');}
  },acknowledgeReward:()=>{}
 };
 document.addEventListener('DOMContentLoaded',()=>{
  const button=document.getElementById('welcomeGoogle'),form=document.getElementById('welcomeEmail')?.closest('form');
  if(form)form.hidden=true;
  for(const id of ['welcomeSwitch','welcomeHint']){const e=document.getElementById(id);if(e)e.hidden=true;}
  if(button){button.textContent='เข้าสู่ระบบด้วย Telegram';button.onclick=login;}
  const title=document.getElementById('welcomeTitle');if(title)title.textContent='เริ่มภารกิจผ่าน Telegram';
  if(tg){tg.ready();tg.expand();if(tg.isVersionAtLeast('7.7'))tg.disableVerticalSwipes();}
  const style=document.createElement('style');style.textContent='.welcome-links{display:none}body{padding-top:var(--tg-content-safe-area-inset-top,0px);padding-bottom:var(--tg-content-safe-area-inset-bottom,0px)}';document.head.appendChild(style);
  login();
 });
})(window);
