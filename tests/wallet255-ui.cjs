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
const state={owner,test_gems:0,mining251:{server_time:new Date().toISOString(),prediction_until:new Date().toISOString(),code:'MYBASE',started:true,invited:false,referral_eligible:false,members:10,base_rate:200,active_team:0,team_total:0,credited:0,earned:125.75,unclaimed:125.75,wallet255:true,ends_at:new Date(Date.now()+800000).toISOString(),provider:'test'}};
G.treasury();reply(state);const before=e.d.gems;assert(!a.el('modal').innerHTML.includes('🤖'));assert(!a.el('modal').innerHTML.includes('No advertising revenue'));assert(!a.el('modal').innerHTML.includes('Withdrawals'));assert(a.el('modal').innerHTML.includes('mineUnclaimed255'));assert.equal(e.d.gems,before,'unclaimed earnings never spendable');
G.claimPanel255();a.el('mineAmount255').value='25';G.claimWallet255();let req=a.requests.at(-1);assert.equal(req.p.purpose,'wallet');assert.equal(req.p.amount,25);
const receipt={id:req.p.request_id,purpose:'wallet',amount:25,claimed:false,provider:'test'};reply({...state,mining251:{...state.mining251,receipt}});assert.equal(shown.length,1);assert.equal(e.d.gems,before);
a.s.novaTestRewardEarned248(owner,receipt.id);assert.equal(a.requests.at(-1).p.mining251,'claim');assert.equal(e.d.gems,before);
const paid={...state,mining251:{...state.mining251,credited:25,unclaimed:100.75,receipt:{...receipt,claimed:true}}};reply(paid);assert.equal(e.d.gems,before+25);assert(!e.d.pendingMining251);
G.refreshCheckin233();reply(paid);assert.equal(e.d.gems,before+25,'replay does not duplicate credit');
G.claimPanel255();a.el('mineAmount255').value='200';const previous=a.requests.at(-1);G.claimWallet255();assert.equal(a.requests.at(-1),previous,'overclaim stopped in UI');
G.miningHelp255();assert(a.el('modal').innerHTML.includes('4-hour'));assert(!a.el('modal').innerHTML.includes('100 accounts'));
console.log('PASS wallet255 UI: clean mech panel, partial amount, no early credit, verified callback, replay, balance validation, separate help');
