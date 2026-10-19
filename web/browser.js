(function(root){
 'use strict';
 if(root.NovaCloud)return;
 const API='https://uzinxxeadejmzxqmqqtx.supabase.co';
 const KEY='sb_publishable_4R8VSfnmuFq6hAgWRtDX6Q_IcSVh82m';
 const SESSION='novaWebSession1',PKCE='novaWebPKCE1';
 let session=null,refreshTask=null,authBusy=false,recovery=false,epoch=0;
 try{const s=JSON.parse(localStorage.getItem(SESSION));if(s&&s.access_token&&s.refresh_token&&s.user&&/^[a-f0-9-]{36}$/.test(s.user.id))session=s;}catch(e){}
 // Keep web campaigns separate from Telegram and from other web accounts.
 const owner=session?session.user.id:'signed-out';
 root.NovaWebStorage={
  getItem:k=>localStorage.getItem('novaWeb1:'+owner+':'+k),
  setItem:(k,v)=>localStorage.setItem('novaWeb1:'+owner+':'+k,v),
  removeItem:k=>localStorage.removeItem('novaWeb1:'+owner+':'+k)
 };
 if(!root.NovaWebStorage.getItem('novaLanguage'))root.NovaWebStorage.setItem('novaLanguage','th');
 function emit(event,data){root.novaCloudEvent?.(event,data||{});}
 function status(message){emit('status',{message});}
 function keep(s){
  if(!s?.access_token||!s?.refresh_token||!s?.user?.id)throw Error('ข้อมูลบัญชีไม่ครบ กรุณาเข้าสู่ระบบใหม่');
  s.expires_at=s.expires_at||Math.floor(Date.now()/1000)+s.expires_in;
  localStorage.setItem(SESSION,JSON.stringify(s));session=s;
 }
 async function request(path,method,body,token){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
   const r=await fetch(API+path,{method,headers:{apikey:KEY,'Content-Type':'application/json',Prefer:'return=representation',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});
   const data=await r.json().catch(()=>null);
   if(!r.ok){const e=Error(data?.code==='P0001'?data.message:r.status===429?'ทำรายการถี่เกินไป กรุณารอสักครู่':r.status===401?'กรุณาเข้าสู่ระบบใหม่':'ทำรายการไม่สำเร็จ กรุณาตรวจอีเมล รหัสผ่าน และการยืนยันอีเมล');e.status=r.status;throw e;}
   return data;
  }finally{clearTimeout(timer);}
 }
 async function account(){
  if(!session)throw Error('กรุณาเข้าสู่ระบบก่อน');
  if(session.expires_at<Date.now()/1000+60){
   if(!refreshTask){const started=epoch;refreshTask=request('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token}).then(s=>{if(epoch!==started)throw Error('บัญชีเปลี่ยนแล้ว กรุณาเปิดเกมใหม่');keep(s);return s;}).finally(()=>{refreshTask=null;});}
   await refreshTask;
  }
  return session;
 }
 function run(task){return task().catch(e=>status(e.name==='AbortError'?'เชื่อมต่อช้า กรุณาลองอีกครั้ง':e.message));}
 function reload(){root.location.replace(root.location.pathname);}
 function accept(s){keep(s);reload();}
 function encoded(bytes){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
 async function challenge(mode){
  const verifier=encoded(crypto.getRandomValues(new Uint8Array(32)));
  sessionStorage.setItem(PKCE,JSON.stringify({verifier,mode,time:Date.now()}));
  return encoded(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
 }
 const callback=()=>root.location.origin+root.location.pathname;
 root.NovaCloud={
  provider:'web',available:()=>true,warAvailable:()=>true,hasAccount:()=>!!session,
  login:()=>{root.Game?.welcomeForm('login');document.getElementById('welcome').hidden=false;status('เข้าสู่ระบบด้วยอีเมล เพื่อเล่นต่อได้จากทุกเครื่อง');},
  emailAuth:(action,email,password)=>run(async()=>{
   if(authBusy)return;
   if(!['login','signup','recover','update'].includes(action))throw Error('คำสั่งบัญชีไม่ถูกต้อง');
   if(action!=='update'&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254))throw Error('กรุณากรอกอีเมลให้ถูกต้อง');
   if(action!=='recover'&&(password.length<(action==='login'?1:8)||password.length>128))throw Error('รหัสผ่านใหม่ต้องมี 8–128 ตัวอักษร');
   authBusy=true;
   try{
    if(action==='update'){
     if(!recovery)throw Error('กรุณาเปิดลิงก์ตั้งรหัสผ่านจากอีเมลก่อน');
     const s=await account();await request('/auth/v1/user','PUT',{password},s.access_token);recovery=false;reload();return;
    }
    if(action==='login'){accept(await request('/auth/v1/token?grant_type=password','POST',{email,password}));return;}
    const code_challenge=await challenge(action);
    const data=await request('/auth/v1/'+(action==='signup'?'signup':'recover')+'?redirect_to='+encodeURIComponent(callback()),'POST',{email,...(action==='signup'?{password}:{}),code_challenge,code_challenge_method:'s256'});
    if(data?.access_token){accept(data);return;}
    status(action==='signup'?'ตรวจอีเมลและสแปมเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบ':'หากอีเมลนี้มีบัญชี ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ เปิดลิงก์ในเบราว์เซอร์เดียวกัน');
   }finally{authBusy=false;}
  }),
  load:()=>run(async()=>{const s=await account(),rows=await request('/rest/v1/nova_rts_saves?select=revision,payload,updated_at&user_id=eq.'+s.user.id,'GET',undefined,s.access_token);emit('loaded',{id:s.user.id,save:rows[0]||null});if(!rows.length)root.Game?.close();}),
  save:(json,revision)=>run(async()=>{if(typeof json!=='string'||json.length>131072||!Number.isSafeInteger(revision)||revision<0)throw Error('เซฟไม่ถูกต้อง');const s=await account(),body={payload:JSON.parse(json),revision:revision+1};if(!revision)body.user_id=s.user.id;const rows=await request('/rest/v1/nova_rts_saves'+(revision?'?user_id=eq.'+s.user.id+'&revision=eq.'+revision:''),revision?'PATCH':'POST',body,s.access_token);if(rows.length!==1)throw Error('มีเซฟใหม่จากอีกเครื่อง กรุณาโหลดเซฟก่อน');emit('saved',{revision:rows[0].revision,id:s.user.id});}),
  deleteSave:()=>run(async()=>{const s=await account();await request('/rest/v1/nova_rts_saves?user_id=eq.'+s.user.id,'DELETE',undefined,s.access_token);emit('deleted');}),
  logout:()=>run(async()=>{const s=session;++epoch;session=null;localStorage.removeItem(SESSION);try{if(s)await request('/auth/v1/logout?scope=local','POST',{},s.access_token);}finally{reload();}}),
  war:(action,payload)=>root.NovaCloud.warRequest(action,payload,''),
  warRequest:(action,json,request_id)=>{const started=epoch;return (async()=>{
   const s=await account(),payload=JSON.parse(json||'{}');
   // Web has no native AdMob SDK or verified web ad provider yet.
   if(payload.admob230||payload.monetag231)throw Error('รางวัลโฆษณายังไม่เปิดในเวอร์ชันเว็บ');
   const data=await request('/rest/v1/rpc/'+(action.startsWith('test_')?'nova_test_command':'nova_war_command'),'POST',{action,payload},s.access_token);
   if(started===epoch)emit('war',{action,request_id,data});
  })().catch(e=>{if(started===epoch)emit(e.status===401||!session?'war_login':'war_error',{action,request_id,message:e.message});});}
 };
 root.NovaAds={provider:'unavailable',scout:async(done)=>done(),rewardVerified:()=>root.novaRewardStatus?.('unavailable'),acknowledgeReward:()=>{}};
 document.addEventListener('DOMContentLoaded',()=>run(async()=>{
  const google=document.getElementById('welcomeGoogle');if(google)google.hidden=true;
  const params=new URLSearchParams(root.location.search),code=params.get('code');
  if(code){
   root.history.replaceState(null,'',root.location.pathname);
   const saved=JSON.parse(sessionStorage.getItem(PKCE)||'null');sessionStorage.removeItem(PKCE);
   if(!saved||Date.now()-saved.time>3600000)throw Error('ลิงก์หมดอายุหรือเปิดคนละเบราว์เซอร์ กรุณาเข้าสู่ระบบหรือขอลิงก์ใหม่');
   const s=await request('/auth/v1/token?grant_type=pkce','POST',{auth_code:code,code_verifier:saved.verifier});
   if(saved.mode==='recover'){keep(s);recovery=true;emit('password_recovery');return;}
   accept(s);return;
  }
  if(session){
   try{const s=await account();await request('/auth/v1/user','GET',undefined,s.access_token);emit('signed_in',{id:s.user.id});}
   catch(e){if(e.status===400||e.status===401){++epoch;session=null;localStorage.removeItem(SESSION);reload();return;}throw e;}
  }
 }));
})(window);
