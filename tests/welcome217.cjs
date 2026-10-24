const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
function boot(cloud,oldData={}){
 const elements={},data={novaRTSIntro:'1',...oldData},calls=[];
 const ctx=new Proxy({measureText:t=>({width:t.length*8})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:false,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const s={console,Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:()=>1,clearTimeout(){},Image:class{},localStorage:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]},document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame(){},NovaCloud:cloud};
 s.localStorage && s.localStorage.setItem('novaLanguage','th');vm.createContext(s);vm.runInContext(source,s);return {s,el,data,calls};
}
let calls=[],cloud={available:()=>true,hasAccount:()=>false,emailAuth:(...a)=>calls.push(a),login:()=>calls.push(['google']),load:()=>calls.push(['load'])};
let a=boot(cloud);assert.equal(a.el('welcome').hidden,false);assert.match(a.el('welcomeSubmit').textContent,/สร้างบัญชี/);
const before=JSON.parse(a.data.novaRTS1);a.s.novaBack();assert.equal(a.el('welcome').hidden,false);
a.el('welcomeEmail').value='player@example.com';a.el('welcomePassword').value='longpassword';a.s.Game.welcomeSubmit({preventDefault(){}});assert.deepEqual(calls.at(-1),['signup','player@example.com','longpassword']);assert.equal(a.el('welcomePassword').value,'');a.s.Game.welcomeSubmit({preventDefault(){}});assert.equal(calls.length,1);
a.s.novaCloudEvent('status',{message:'ตรวจกล่องอีเมลเพื่อยืนยัน'});assert.equal(a.el('welcome').hidden,false);assert.equal(a.el('welcomeSubmit').disabled,false);assert.match(a.el('welcomeStatus').textContent,/ยืนยัน/);
a.s.Game.welcomeSwitch();assert.equal(a.el('welcomePassword').minLength,1);a.s.Game.welcomeForm('recover');assert.equal(a.el('welcomePasswordRow').hidden,true);a.s.novaBack();assert.equal(a.el('welcomePasswordRow').hidden,false);
a.s.Game.welcomeGoogle();assert.deepEqual(calls.at(-1),['google']);a.s.novaCloudEvent('signed_in',{id:'account-a'});assert.equal(a.el('welcome').hidden,true);assert.deepEqual(calls.at(-1),['load']);assert.deepEqual(JSON.parse(a.data.novaRTS1).buildings,before.buildings,'registration preserves existing base');
a.s.novaCloudEvent('signed_out',{});assert.equal(a.el('welcome').hidden,false);assert.equal(a.data.novaAccountReady,undefined);
let registered=boot({...cloud,hasAccount:()=>true});assert.equal(registered.el('welcome').hidden,true,'registered users enter offline without signing up');
let guest=boot(cloud,{novaRTS1:a.data.novaRTS1,novaAccountReady:'1'});assert.equal(guest.el('welcome').hidden,false,'native session absence takes precedence over stale UI cache');assert.deepEqual(JSON.parse(guest.data.novaRTS1).buildings,before.buildings);
let legacy=boot({...cloud,hasAccount:undefined});assert.equal(legacy.el('welcome').hidden,false);legacy.s.novaCloudEvent('loaded',{id:'old-account',save:null});assert.equal(legacy.el('welcome').hidden,true);assert.equal(legacy.el('modal').style.display,'none');
let offline=boot({...cloud,hasAccount:undefined},{novaAccountReady:'1'});assert.equal(offline.el('welcome').hidden,true,'previously registered legacy user can return offline');
let failed=boot({...cloud,hasAccount:undefined});failed.s.novaCloudEvent('status',{message:'ตรวจอินเทอร์เน็ต'});assert.equal(failed.el('welcome').hidden,false);assert.equal(failed.el('welcomeSubmit').disabled,false);
let browser=boot(undefined);browser.s.Game.welcomeGoogle();assert.match(browser.el('welcomeStatus').textContent,/แอป Nova/);
console.log('PASS welcome: new/existing guest, registration verification, login/recovery, duplicate submits, back guard, saved account/offline, legacy session, logout, save preservation and unavailable bridge');


// Account management is independent of a successful backup request.
const account=boot({...cloud,hasAccount:()=>true,accountInfo:()=>JSON.stringify({id:'account-a',email:'player@example.com',provider:'google'}),logout:()=>calls.push(['logout'])});
account.s.Game.cloud();
assert.match(account.el('modal').innerHTML,/player@example.com/);
assert.match(account.el('modal').innerHTML,/Game.accountLogout282/);
account.s.Game.accountLogout282();
assert.notDeepEqual(calls.at(-1),['logout'],'confirmation does not sign out');
account.s.Game.accountLogoutNow282();
assert.deepEqual(calls.at(-1),['logout']);
account.s.novaCloudEvent('signed_out',{});
assert.equal(account.el('modal').style.display,'none','logout leaves the sign-in page unobstructed');
assert.equal(account.el('welcome').hidden,false);
const escaped=boot({...cloud,hasAccount:()=>true,accountInfo:()=>JSON.stringify({id:'a',email:'<img src=x onerror=alert(1)>'})});
escaped.s.Game.cloud();
assert.ok(!escaped.el('modal').innerHTML.includes('<img src=x'),'account details are escaped');
const oldNative=boot({...cloud,hasAccount:()=>true});
oldNative.s.Game.cloud();
assert.match(oldNative.el('modal').innerHTML,/Game.accountLogout282/,'old native bridge can log out without loading a backup');
console.log('PASS account management: details, escaping, logout confirmation, offline controls, legacy bridge and clear sign-in screen');


// Facebook shares the normal account/session path and blocks duplicate OAuth taps.
let facebookCalls=[];
const fb=boot({...cloud,loginFacebook:()=>facebookCalls.push('facebook'),login:()=>facebookCalls.push('google')});
assert.ok(!fb.el('welcomeEmailDetails').open);
fb.s.Game.welcomeFacebook();fb.s.Game.welcomeFacebook();fb.s.Game.welcomeGoogle();
assert.deepEqual(facebookCalls,['facebook']);
assert.equal(fb.el('welcomeFacebook').disabled,true);
fb.s.novaCloudEvent('status',{message:'ยกเลิก'});
assert.equal(fb.el('welcomeFacebook').disabled,false);
fb.s.Game.welcomeFacebook();fb.s.novaCloudEvent('signed_in',{id:'facebook-account'});
assert.equal(fb.el('welcome').hidden,true);
const oldFb=boot(cloud);oldFb.s.Game.welcomeFacebook();
assert.match(oldFb.el('welcomeStatus').textContent,/Google Play/);
assert.equal(oldFb.el('welcomeFacebook').disabled,false);
oldFb.s.Game.welcomeSwitch();assert.equal(oldFb.el('welcomeEmailDetails').open,true);
console.log('PASS Facebook: duplicate taps, cancel/retry, account entry, old Android guard and email expansion');
