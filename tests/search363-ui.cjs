const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android'){
 const elements={},errors=[],requests=[];let reloads=0,frame,timerId=0;const timers=new Map();
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={crypto:require('node:crypto').webcrypto,console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>true,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={e:E,accept:b=>acceptLive(b),heartbeat:()=>liveHeartbeat(),screen:()=>screen,setBusy:()=>{warBusy=true;},setRequest:v=>request362=v,setWar:d=>warState=d,setRoom:b=>liveRoom=b,setScreen:v=>screen=v,select:id=>selected=id,clearBusy:()=>{warBusy=false;warActive=null;},setOnline:()=>{E.d.onlineCrystal={owner:"a"};E.d.admob230=true;}};})(typeof globalThis!=='),s);
 return {s,el,data,errors,requests,timers,reloads:()=>reloads,frame:n=>frame(n)};
}



const a=boot({novaRTSIntro:'1',novaLanguage:'th'}),G=a.s.Game,T=a.s.test232,e=T.e;
e.d.onlineCrystal={owner:'a'};T.clearBusy();
function tick(){for(const [id,t] of [...a.timers])if(t.ms===100){a.timers.delete(id);t.f();}}
T.setBusy();const before=a.requests.length;G.warTargets();T.clearBusy();tick();
assert.equal(a.requests.length,before+1,'search continues after background request');
assert.equal(a.requests.at(-1).a,'targets');
T.clearBusy();T.setRequest({id:'campaign362-test',kind:'campaign'});
const count=a.requests.length;G.warTargets();assert.equal(a.requests.length,count);
T.setRequest(null);tick();assert.equal(a.requests.length,count+1);
T.clearBusy();T.setRequest({id:'scout362-test',kind:'scout'});
const pending=a.requests.length;T.heartbeat();assert.equal(a.requests.length,pending);
T.setRequest(null);T.clearBusy();
T.setBusy();G.warTargets();G.cancelSearch363();T.clearBusy();
const cancelled=a.requests.length;tick();assert.equal(a.requests.length,cancelled);
assert.equal(a.errors.length,0);
console.log('PASS search363: background queue, campaign serialization, heartbeat suppression, cancellation');


// Paid scouting starts on the first tap, without a confirmation or retry panel.
T.clearBusy();T.setRequest(null);e.d.gold=1000;
T.setWar({targets:[{id:'b',callsign:'Enemy'}]});
const oldGold=e.d.gold,oldGems=e.d.gems,start=a.requests.length;
G.warScout(0);assert.equal(a.requests.length,start+1);
const scout=a.requests.at(-1);assert.equal(scout.p.live,'siege_scout_gold362');
assert(!/Game.retryScout|<button/.test(a.el('modal').innerHTML));
assert.equal(e.d.gems,oldGems,'scouting never reserves Duck Coins');
G.warScout(0);assert.equal(a.requests.length,start+1,'double tap does not duplicate the paid request');
// Timeout exposes recovery only, retaining the same durable payment identifier.
for(const [id,t] of [...a.timers])if(t.ms===15000){a.timers.delete(id);t.f();}
assert(a.el('modal').innerHTML.includes('Game.retryScout362'));
G.retryScout362(false);assert.equal(a.requests.at(-1).p.request_id,scout.p.request_id);
console.log('PASS first-tap gold scout, no confirmation, duplicate tap guard and durable retry');
