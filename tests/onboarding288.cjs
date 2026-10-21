const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android',account=false,locale='en-US'){
 const elements={},errors=[],requests=[];let reloads=0,frame,timerId=0;const timers=new Map();
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={navigator:{languages:[locale],language:locale},crypto:require('node:crypto').webcrypto,console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>account,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={e:E,setScreen:v=>screen=v,select:id=>selected=id,clearBusy:()=>{warBusy=false;warActive=null;},tick:()=>guideTick288(),guide:()=>guide288,guest:()=>guest288,setOnline:()=>{E.d.onlineCrystal={owner:"a"};E.d.admob230=true;}};})(typeof globalThis!=='),s);
 return {s,el,data,errors,requests,timers,reloads:()=>reloads,frame:n=>frame(n)};
}

// Locale hints never override a player's explicit preference.
assert.equal(boot({},'android',false,'th-TH').s.NovaI18n.language,'th');
assert.equal(boot({},'android',false,'en-TH').s.NovaI18n.language,'th');
assert.equal(boot({novaLanguage:'en'},'android',false,'th-TH').s.NovaI18n.language,'en');
assert.equal(boot({novaLanguage:'th'},'android',false,'en-US').s.NovaI18n.language,'th');
const automatic=boot({},'android',true,'th-TH');
for(const t of [...automatic.timers.values()])if(t.ms===1600)t.f();
assert.match(automatic.el('modal').innerHTML,/ตั้งชื่อฐาน/,'signed-in first entry starts the guide without a click');
let a=boot({},'android',false,'th-TH');
assert.equal(a.el('welcome').hidden,false);
a.s.Game.welcomeGuest();
assert.equal(a.el('welcome').hidden,true);
assert.equal(a.s.test232.guest(),true);
assert.equal(a.data.novaAccountReady,undefined,'guest is not a cloud account');
assert.match(a.el('modal').innerHTML,/ตั้งชื่อฐาน/);
a.s.Game.guideAction288();a.el('baseNameInput').value='ฐานทดสอบ';a.s.Game.claimBaseName({preventDefault(){}});
assert.equal(a.s.test232.e.d.guestName288,'ฐานทดสอบ');
assert.equal(a.s.test232.guide().step,1,'name completion advances to bonus automatically');
assert.match(a.el('modal').innerHTML,/โหมดเยี่ยมชม/);
assert.equal(a.requests.length,0,'guest name and onboarding do not call the online profile or grant online rewards');
a.s.Game.guideNext288();assert.equal(a.s.test232.guide().step,2);
a.s.Game.guideAction288();a.s.Game.close();a.s.test232.tick();assert.equal(a.el('guideDock288').hidden,false,'next step remains available after a hands-on action');
a.s.test232.setScreen('raid');a.s.test232.tick();assert.equal(a.el('guideDock288').hidden,true,'guide never covers combat');a.s.test232.setScreen('home');
let resumed=boot({...a.data},'android',false,'th-TH');resumed.s.Game.beginGuide288();assert.equal(resumed.s.test232.guide().step,2,'unfinished guide resumes');
resumed.s.Game.guideFinish288();resumed.s.test232.tick();assert.equal(resumed.s.test232.guide(),null,'skip stays dismissed');
let done=boot({...resumed.data},'android',false,'th-TH');done.s.Game.beginGuide288();assert.equal(done.s.test232.guide(),null,'completed guide stays dismissed after relaunch');
done.s.Game.help();assert.ok(done.s.test232.guide(),'help can replay');
done.s.novaCloudEvent('signed_in',{id:'online'});assert.equal(done.s.test232.guest(),false);assert.equal(done.data.novaGuest288,undefined,'online sign-in clears guest entry marker');
done.s.novaCloudEvent('loaded',{id:'online',save:null});
assert.ok(!done.el('modal').innerHTML.includes('Game.cloudUpload()')||done.el('modal').style.display==='none','empty backup dialog does not block first-entry guide');
let online=boot({novaGuest288:'1'},'android',true);assert.equal(online.s.test232.guest(),false,'native account wins over saved guest entry');
const initialGems=online.s.test232.e.d.gems;online.s.Game.beginGuide288();assert.match(online.el('modal').innerHTML,/Name your base/);
const profile=online.requests.find(r=>r.p.profile==='status');assert.ok(profile);
online.s.novaCloudEvent('war',{request_id:profile.id,data:{profile:true,owner:'new-owner',name:'New base'}});
assert.equal(online.s.test232.guide().step,1);
assert.equal(online.s.test232.e.d.gems,initialGems,'onboarding does not invent an online bonus');
online.s.Game.welcomeLanguage288('en');assert.equal(online.data.novaLanguage,'en','explicit current-language choice persists');
assert.deepEqual(a.errors,[]);assert.deepEqual(online.errors,[]);
console.log('PASS onboarding288: device locale, explicit preference, guest entry/relaunch, local name, automatic guide, progress/skip/replay, combat guard and account transition');

