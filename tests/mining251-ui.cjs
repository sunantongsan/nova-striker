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
const base={owner,test_gems:0,test_checkin248:true,checkin233:{day:'2026-10-24',claimed:false,streak:0,reward:20}};
G.treasury();assert.equal(a.requests.at(-1).p.checkin233,true);reply(base);assert(a.el('modal').innerHTML.includes('checkin-grid237'));assert(!a.el('modal').innerHTML.includes('NOVA MINING'));
const before=e.d.gems;G.checkin();let req=a.requests.at(-1);assert.equal(req.p.checkin_test248,'prepare');let receipt={id:req.p.request_id,day:'2026-10-24',amount:20,claimed:false};reply({...base,test_receipt248:receipt});assert.equal(shown.length,1);assert.equal(e.d.gems,before);
a.s.novaTestRewardEarned248('wrong',receipt.id);assert.equal(e.d.gems,before);
a.s.novaTestRewardEarned248(owner,receipt.id);assert.equal(a.requests.at(-1).p.checkin_test248,'claim');assert.equal(e.d.gems,before);
const claimed={...base,checkin233:{...base.checkin233,claimed:true,streak:1},test_receipt248:{...receipt,claimed:true,granted:20}};reply(claimed);assert.equal(e.d.gems,before+20);G.refreshCheckin233();reply(claimed);assert.equal(e.d.gems,before+20,'daily credit replay cannot duplicate');
G.droneGuide251();assert.equal(a.el('guideDock288').hidden,true);assert.deepEqual(a.errors,[]);
console.log('PASS daily339 UI: daily panel, ad completion, server confirmation, idempotent credit, no mining or guide');
