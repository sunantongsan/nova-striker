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
for(const account of [false,true]){const a=boot({},'android',account,'th-TH');for(const t of [...a.timers.values()])if(t.ms===1600)t.f();assert.equal(a.el('guideDock288').hidden,true);assert.equal(a.s.test232.guide(),null);a.s.Game.welcomeGuest();a.s.Game.beginGuide288(true);a.s.test232.tick();assert.equal(a.el('guideDock288').hidden,true);assert.equal(a.s.test232.guide(),null);a.s.novaCloudEvent('signed_in',{id:'online'});for(const t of [...a.timers.values()])if(t.ms===1600)t.f();assert.equal(a.s.test232.guide(),null);assert.equal(a.el('guideDock288').hidden,true);assert.deepEqual(a.errors,[]);}
console.log('PASS onboarding288: locale preferences preserved, tutorial disabled for guest, account, restart and explicit replay');
