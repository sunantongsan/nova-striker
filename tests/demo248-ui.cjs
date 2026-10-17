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


const a=boot({novaRTSIntro:'1'}),G=a.s.Game,e=a.s.test232.e;let shown=[],acks=[];
a.s.NovaAds={rewardTest248:(...args)=>shown.push(args),acknowledgeTest248:id=>acks.push(id)};
const reply=d=>{const r=a.requests.at(-1);a.s.novaCloudEvent('war',{action:r.a,request_id:r.id,data:d});};
const base={owner:'10000000-0000-4000-8000-000000000002',test_gems:0,test_checkin248:true,checkin233:{day:'2026-10-17',claimed:false,streak:0,reward:0,next_reward:20},welcome247:{eligible:false,amount:500,claimed:false}};
a.s.test232.clearBusy();G.treasury();reply(base);const before=e.d.gems;
G.checkin();const request=a.requests.at(-1);assert.equal(request.p.checkin_test248,'prepare');G.checkin();assert.equal(a.requests.at(-1),request,'no double prepare');
const receipt={id:request.p.request_id,day:'2026-10-17',amount:20,claimed:false,granted:0};
reply({...base,test_receipt248:receipt});assert.equal(shown.length,1);assert.equal(e.d.gems,before);
a.s.novaRewardStatus('closed');assert.equal(e.d.gems,before,'closing ad cannot grant');
G.checkin();reply({...base,test_receipt248:receipt});assert.equal(shown.length,2);
a.s.novaTestRewardEarned248('wrong',receipt.id);assert.equal(e.d.gems,before);assert.equal(acks.length,0);
a.s.novaTestRewardEarned248(base.owner,receipt.id);assert.equal(a.requests.at(-1).p.checkin_test248,'claim');assert.equal(e.d.gems,before,'native completion awaits server');
const granted={...base,test_gems:20,checkin233:{...base.checkin233,claimed:true,streak:1,reward:20},test_receipt248:{...receipt,claimed:true,granted:20}};
reply(granted);assert.equal(e.d.gems,before+20);assert(!e.d.pendingTestCheckin248);
G.treasury();reply(granted);assert.equal(e.d.gems,before+20);
const b=boot({...a.data});b.s.test232.clearBusy();b.s.Game.treasury();const br=b.requests.at(-1);b.s.novaCloudEvent('war',{action:br.a,request_id:br.id,data:granted});assert.equal(b.s.test232.e.d.gems,before+20);
const old=boot({novaRTSIntro:'1'});old.s.test232.clearBusy();old.s.Game.treasury();const r=old.requests.at(-1);old.s.novaCloudEvent('war',{action:r.a,request_id:r.id,data:base});old.s.Game.checkin();assert.match(old.el('modal').innerHTML,/Update the Android app/);
console.log('PASS demo248 UI: prepare, no early/closed grant, owner match, server confirmation, replay and older-native update message');
