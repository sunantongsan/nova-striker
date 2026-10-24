const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android'){
 const elements={},errors=[],requests=[];let reloads=0,frame,timerId=0;const timers=new Map();
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={crypto:require('node:crypto').webcrypto,console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>true,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={e:E,setScreen:v=>screen=v,select:id=>selected=id,clearBusy:()=>{warBusy=false;warActive=null;},setOnline:()=>{E.d.onlineCrystal={owner:"a"};E.d.admob230=true;}};})(typeof globalThis!=='),s);
 return {s,el,data,errors,requests,timers,reloads:()=>reloads,frame:n=>frame(n)};
}

const a=boot({novaRTSIntro:'1'}),G=a.s.Game,e=a.s.test232.e,owner='10000000-0000-4000-8000-000000000002';let shown=[];
a.s.NovaAds={rewardTest248:(...args)=>shown.push(args),acknowledgeTest248(){}};
const reply=d=>{const r=a.requests.at(-1);a.s.novaCloudEvent('war',{action:r.a,request_id:r.id,data:d});};
const base={owner,test_gems:0,mining251:{server_time:new Date().toISOString(),code:'MYBASE',started:false,invited:false,referral_eligible:true,members:1,base_rate:200,active_team:0,team_total:0,credited:0,earned:0,ends_at:null,provider:'test'}};
assert(a.el('baseNameGate').hidden,'no welcome naming gate');G.treasury();reply(base);assert(!a.el('modal').innerHTML.includes('checkin-grid237'));assert(a.el('modal').innerHTML.includes('NOVA MINING'));
const before=e.d.gems;G.startMining251();let req=a.requests.at(-1);assert.equal(req.p.mining251,'prepare');G.startMining251();assert.equal(a.requests.at(-1),req);
let receipt={id:req.p.request_id,provider:'test',claimed:false};reply({...base,mining251:{...base.mining251,receipt}});assert.equal(shown.length,1);assert.equal(e.d.gems,before);
a.s.novaTestRewardEarned248('wrong',receipt.id);assert.equal(e.d.gems,before);
a.s.novaRewardStatus('closed');assert.equal(e.d.gems,before);
G.startMining251();reply({...base,mining251:{...base.mining251,receipt}});a.s.novaTestRewardEarned248(owner,receipt.id);assert.equal(a.requests.at(-1).p.mining251,'claim');assert.equal(e.d.gems,before);
const active={...base,mining251:{...base.mining251,started:true,ends_at:new Date(Date.now()+86400000).toISOString(),receipt:{...receipt,claimed:true}}};reply(active);assert(!e.d.pendingMining251);
G.refreshCheckin233();reply({...active,mining251:{...active.mining251,credited:100,earned:100}});assert.equal(e.d.gems,before+100);
G.refreshCheckin233();reply({...active,mining251:{...active.mining251,credited:100,earned:100}});assert.equal(e.d.gems,before+100,'credit replay does not duplicate');
const b=boot({...a.data});b.s.Game.refreshCheckin233();const br=b.requests.at(-1);b.s.novaCloudEvent('war',{action:br.a,request_id:br.id,data:{...active,mining251:{...active.mining251,credited:100,earned:100}}});assert.equal(b.s.test232.e.d.gems,before+100,'restart preserves credit marker');
G.referrals251();assert(a.el('modal').innerHTML.includes('MYBASE'));
G.droneGuide251();assert(a.el('modal').innerHTML.includes('NOVA ACADEMY'));assert(a.el('modal').innerHTML.includes('Game.guideAction288()'));G.openDroneName251();assert(!a.el('baseNameGate').hidden);G.closeDroneName251();assert(a.el('baseNameGate').hidden);
console.log('PASS mining251 UI: platform callbacks, no early credit, replay/restart, no checkin grid, drone naming');


